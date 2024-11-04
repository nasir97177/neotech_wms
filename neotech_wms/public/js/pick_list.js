frappe.ui.form.on('Pick List', {
    refresh: function(frm) {
        frm.add_custom_button(__('Add Items to Locations'), function() {
            addItemsToLocations(frm);
        });
    }
});

function addItemsToLocations(frm) {
    let items = frm.doc.items || []; 

    if (items.length === 0) {
        frappe.msgprint(__('No items found in the Pick List.'));
        return;
    }
    items.forEach(item => {
        let location_row = frm.add_child('locations'); 
        location_row.item_code = item.item_code; 
        location_row.item_name = item.item_name;
        location_row.warehouse=item.warehouse;
        location_row.qty=item.qty;
        location_row.picked_qty=item.qty;
      
    });

    frm.refresh_field('locations'); 
}

frappe.ui.form.on('Pick List', {
    refresh: function(frm) {
        
        frm.add_custom_button(__('Create Packing Slip'), function() {
           
            let items = frm.doc.items || [];

            if (items.length === 0) {
                frappe.msgprint(__('No items found in the Pick List.'));
                return;
            }

            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: {
                        doctype: 'Packing Slip',
                        customer: frm.doc.customer,
                        custom_sales_order: frm.doc.custom_sales_order,
                        custom_pick_list: frm.doc.name,
                        from_case_no: 1,
                        posting_date: frappe.datetime.nowdate(),
                        items: items.map(item => ({
                            item_code: item.item_code,
                            qty: item.qty,
                            uom: item.uom,
                            warehouse: item.warehouse,
                            batch_no: item.batch_no,
                            lot_no: item.lot_no,
                        }))
                    }
                },
                callback: function(response) {
                    if (response.message) {
                        let packing_slip = response.message;

                     
                        frappe.set_route('Form', 'Packing Slip', packing_slip.name);
                        frappe.msgprint(__('Packing Slip {0} created successfully.', [packing_slip.name]));
                    }
                }
            });
        });
    }
});

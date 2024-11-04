frappe.ui.form.on('Packing Slip', {
    refresh: function(frm) {
        
        frm.add_custom_button(__('Create Driver Collection'), function() {
           
            let items = frm.doc.items || [];

            if (items.length === 0) {
                frappe.msgprint(__('No items found in the Pick List.'));
                return;
            }

            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: {
                        doctype: 'Driver Collection',
                        customer: frm.doc.customer,
                        custom_sales_order: frm.doc.custom_sales_order,
                        custom_pick_list: frm.doc.name,
                        from_case_no: 1,
                        posting_date: frappe.datetime.nowdate(),
                        delivery_stops: items.map(item => ({
                            item_code: item.item_code,
                            qty: item.qty,
                            uom: item.uom,
                            warehouse: item.warehouse,
                          
                            
                        }))
                    }
                },
                callback: function(response) {
                    if (response.message) {
                        let driver_collection = response.message;

                     
                        frappe.set_route('Form', 'Driver Collection', driver_collection.name);
                        frappe.msgprint(__('Packing Slip {0} created successfully.', [driver_collection.name]));
                    }
                }
            });
        });
    }
});

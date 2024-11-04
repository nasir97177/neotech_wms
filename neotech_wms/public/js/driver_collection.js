frappe.ui.form.on('Driver Collection', {
    refresh: function(frm) {
   
        frm.add_custom_button(__('Create Delivery Note'), function() {
            create_delivery_note_from_stops(frm);
        });
    }
});


function create_delivery_note_from_stops(frm) {

    let delivery_stops = frm.doc.delivery_stops || [];

  
    if (delivery_stops.length === 0) {
        frappe.msgprint(__('No delivery stops found.'));
        return;
    }
  
    let items = delivery_stops.map(stop => {
        return {
            item_code: stop.item_code, 
            qty: stop.qty, 
            warehouse: stop.warehouse, 
            
        };
    });

   
    frappe.call({
        method: "frappe.client.insert",
        args: {
            doc: {
                doctype: "Delivery Note",
                customer: "Demo", 
                items: items
            }
        },
        callback: function(response) {
            if (response.message) {
                frappe.show_alert({
                    message: __('Delivery Note {0} created successfully!', [response.message.name]),
                    indicator: 'green'
                });

              
                frappe.set_route('Form', 'Delivery Note', response.message.name);
            }
        },
        error: function(error) {
            frappe.msgprint(__('Error creating Delivery Note: {0}', [error.message]));
        }
    });
}

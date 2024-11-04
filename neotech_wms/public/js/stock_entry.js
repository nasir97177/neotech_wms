frappe.ui.form.on('Stock Entry', {
    validate: function(frm) {
        
        frm.doc.items.forEach(function(item) {
           
            if (item.warehouse) {
               
                frappe.call({
                    method: 'frappe.client.get_value',
                    args: {
                        doctype: 'Warehouse',
                        filters: { name: item.Warehouse },
                        fieldname: ['name', 'warehouse_area'] 
                    },
                    callback: function(response) {
                        if (response.message) {
                            var warehouse_area = response.message.warehouse_area;
                            // Do something with warehouse_area, like displaying it
                            console.log("Warehouse Area:", warehouse_area);
                        }
                    }
                });
            }
        });
    }
});
frappe.ui.form.on('Stock Transfer', {
    // Trigger when the form is loaded or refreshed
    refresh: function(frm) {
        // Copy parent field value to child table on form refresh
        copy_parent_field_to_child(frm);
    },

    // Trigger when the source_warehouse field in the parent form is updated
    source_warehouse: function(frm) {
        // Copy parent field value to child table on field change
        copy_parent_field_to_child(frm);
    }
});

// Function to copy data from parent field to child table
function copy_parent_field_to_child(frm) {
    // Get the value from the parent field
    let source_warehouse_value = frm.doc.source_warehouse;

    // Loop through each row in the child table
    frm.doc.items.forEach(function(row) {
        // Set the child field value to the parent field value
        frappe.model.set_value(row.doctype, row.name, 'source_warehouse', source_warehouse_value);
    });

    // Refresh the child table field to reflect changes
    frm.refresh_field('items');
}

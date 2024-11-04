frappe.ui.form.on('Sales Invoice', {
    validate: function(frm) {
        // Iterate over each item in the items table
        frm.doc.items.forEach(function(item) {
            // Check if the item has a warehouse
            if (item.warehouse) {
                // Fetch warehouse details
                frappe.call({
                    method: 'frappe.client.get_value',
                    args: {
                        doctype: 'Warehouse',
                        filters: { name: item.warehouse },
                        fieldname: ['name', 'warehouse_area'] 
                    },
                    callback: function(response) {
                        if (response.message) {
                            var warehouse_area = response.message.warehouse_area;
                            
                            console.log("Warehouse Area:", warehouse_area);
                        }
                    }
                });
            }
        });
    }
});

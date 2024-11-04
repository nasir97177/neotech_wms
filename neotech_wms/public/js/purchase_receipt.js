frappe.ui.form.on('Purchase Receipt', {
    refresh(frm) {
        // your code here
    }
});

frappe.ui.form.on('Purchase Receipt Item', {
    item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.item_code) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Item',
                    name: row.item_code,
                },
                callback: function(data) {
                    if (data.message) {
                        let item = data.message;
                        let uom_details = item.uoms || [];

                        // Automatically set UOM if not already set
                        if (!row.uom && item.stock_uom) {
                            frappe.model.set_value(cdt, cdn, 'uom', item.stock_uom);
                            row.uom = item.stock_uom; // Set the UOM in the current row object
                        }

                        // Find and set the default UOM's dimensions
                        let default_uom = uom_details.find(uom => uom.uom === row.uom);
                        if (default_uom) {
                            frappe.model.set_value(cdt, cdn, 'length', default_uom.length || 0);
                            frappe.model.set_value(cdt, cdn, 'breadth', default_uom.breadth || 0);
                            frappe.model.set_value(cdt, cdn, 'height', default_uom.height || 0);
                            frappe.model.set_value(cdt, cdn, 'area', default_uom.area || 0);
                        } else if (uom_details.length > 0) {
                            let first_uom = uom_details[0];
                            frappe.model.set_value(cdt, cdn, 'length', first_uom.length || 0);
                            frappe.model.set_value(cdt, cdn, 'breadth', first_uom.breadth || 0);
                            frappe.model.set_value(cdt, cdn, 'height', first_uom.height || 0);
                            frappe.model.set_value(cdt, cdn, 'area', first_uom.area || 0);
                        }

                        // Trigger the UOM function to ensure all custom fields are populated
                        frappe.ui.form.trigger(cdt, cdn, 'uom');
                    }
                }
            });
        }
    },

    uom: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.item_code && row.uom) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Item',
                    name: row.item_code,
                },
                callback: function(data) {
                    if (data.message) {
                        let item = data.message;

                        // Get the UOM Conversion Details
                        let uom_details = item.uoms || [];
                        let selected_uom = uom_details.find(uom => uom.uom === row.uom);

                        if (selected_uom) {
                            frappe.model.set_value(cdt, cdn, 'custom_lengths', selected_uom.length || 0);
                            frappe.model.set_value(cdt, cdn, 'custom_breadth', selected_uom.breadth || 0);
                            frappe.model.set_value(cdt, cdn, 'custom_height', selected_uom.height || 0);
                            frappe.model.set_value(cdt, cdn, 'custom_area', selected_uom.area || 0);
                        }
                    }
                }
            });
        }
    }
});
frappe.ui.form.on('Purchase Receipt', {
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
                        fieldname: ['name', 'warehouse_area'] // Adjust fields as per your requirement
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
frappe.ui.form.on('Purchase Receipt Item', {
    item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.item_code) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Item',
                    name: row.item_code,
                },
                callback: function(data) {
                    if (data.message) {
                        let item = data.message;
                        let uom_details = item.uoms || [];
                        let default_uom = uom_details.find(uom => uom.uom === row.uom);
                        if (default_uom) {
                            frappe.model.set_value(cdt, cdn, 'length', default_uom.length || 0);
                            frappe.model.set_value(cdt, cdn, 'breadth', default_uom.breadth || 0);
                            frappe.model.set_value(cdt, cdn, 'height', default_uom.height || 0);
                            frappe.model.set_value(cdt, cdn, 'area', default_uom.area || 0);
                        } else {
                            if (uom_details.length > 0) {
                                let first_uom = uom_details[0];
                                frappe.model.set_value(cdt, cdn, 'length', first_uom.length || 0);
                                frappe.model.set_value(cdt, cdn, 'breadth', first_uom.breadth || 0);
                                frappe.model.set_value(cdt, cdn, 'height', first_uom.height || 0);
                                frappe.model.set_value(cdt, cdn, 'area', first_uom.area || 0);
                            }
                        }
                    }
                }
            });
        }
    },

    uom: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.item_code && row.uom) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Item',
                    name: row.item_code,
                },
                callback: function(data) {
                    if (data.message) {
                        let item = data.message;

                        // Get the UOM Conversion Details
                        let uom_details = item.uoms || [];
                        let selected_uom = uom_details.find(uom => uom.uom === row.uom);

                        if (selected_uom) {
                            frappe.model.set_value(cdt, cdn, 'custom_length', selected_uom.length || 0);
                            frappe.model.set_value(cdt, cdn, 'custom_breadth', selected_uom.breadth || 0);
                            frappe.model.set_value(cdt, cdn, 'custom_height', selected_uom.height || 0);
                            frappe.model.set_value(cdt, cdn, 'custom_area', selected_uom.area || 0);
                        }
                    }
                }
            });
        }
    }
});
frappe.ui.form.on('Purchase Receipt', {
    on_submit: function(frm) {
        let warehouse_areas = {};
        frm.doc.items.forEach(item => {
            let item_area = (item.custom_length || 0) * (item.custom_breadth || 0) * (item.custom_height || 0) * (item.qty || 0); 
            if (!warehouse_areas[item.warehouse]) {
                warehouse_areas[item.warehouse] = 0;
            }
            warehouse_areas[item.warehouse] += item_area;
        });
        Object.keys(warehouse_areas).forEach(warehouse => {
            update_warehouse_receiving_area(warehouse, warehouse_areas[warehouse], 'subtract');
        });
    }
});
function update_warehouse_receiving_area(warehouse, area, operation) {
    frappe.call({
        method: 'frappe.client.get_value',
        args: {
            doctype: 'Warehouse',
            fieldname: 'receiving_area',
            filters: { 'name': warehouse }
        },
        callback: function(r) {
            if (r.message) {
                let current_receiving_area = r.message.receiving_area || 0;

                if(operation === 'add') {
                    current_receiving_area += area;
                } else if(operation === 'subtract') {
                    current_receiving_area -= area;
                }
                frappe.call({
                    method: 'frappe.client.set_value',
                    args: {
                        doctype: 'Warehouse',
                        name: warehouse,
                        fieldname: {
                            'receiving_area': current_receiving_area
                        }
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.msgprint(`Warehouse Receiving Area updated for ${warehouse}`);
                        }
                    }
                });
            }
        }
    });
}
frappe.ui.form.on('Purchase Receipt', {
    before_cancel: function(frm) {
        let warehouse_areas = {};

        frm.doc.items.forEach(item => {
             let item_area = (item.custom_length || 0) * (item.custom_breadth || 0) * (item.custom_height || 0) * (item.qty || 0);
            if (!warehouse_areas[item.warehouse]) {
                warehouse_areas[item.warehouse] = 0;
            }
            warehouse_areas[item.warehouse] += item_area;
        });

        Object.keys(warehouse_areas).forEach(warehouse => {
            update_warehouse_receiving_area(warehouse, warehouse_areas[warehouse], 'add');
        });
    }
});

frappe.ui.form.on('Purchase Order', {
    validate: function(frm) {
        frm.doc.items.forEach(function(item) {
           
            if (item.warehouse) {
            
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
frappe.ui.form.on('Purchase Order', {
    onload: function(frm) {
        
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Warehouse",
                filters: {
                    "custom_is_default": 1 
                },
                fields: ["name"]
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    var default_warehouse = r.message[0].name;

                   
                    frm.set_value('set_warehouse', default_warehouse);

                   
                    frm.doc.items.forEach(function(item) {
                        frappe.model.set_value(item.doctype, item.name, 'warehouse', default_warehouse);
                    });

                    frm.refresh_field('items');
                }
            }
        });
    }
});
// frappe.ui.form.on('Purchase Order Item', {
//     item_code: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (row.item_code) {
//             frappe.call({
//                 method: 'frappe.client.get',
//                 args: {
//                     doctype: 'Item',
//                     name: row.item_code,
//                 },
//                 callback: function(data) {
//                     if (data.message) {
//                         let item = data.message;
//                         let uom_details = item.uoms || [];
//                         let default_uom = uom_details.find(uom => uom.uom === row.uom);

//                         if (default_uom) {
//                             frappe.model.set_value(cdt, cdn, 'length', default_uom.length || 0);
//                             frappe.model.set_value(cdt, cdn, 'breadth', default_uom.breadth || 0);
//                             frappe.model.set_value(cdt, cdn, 'height', default_uom.height || 0);
//                             frappe.model.set_value(cdt, cdn, 'area', default_uom.area || 0);
//                         } else {
//                             if (uom_details.length > 0) {
//                                 let first_uom = uom_details[0];
//                                 frappe.model.set_value(cdt, cdn, 'length', first_uom.length || 0);
//                                 frappe.model.set_value(cdt, cdn, 'breadth', first_uom.breadth || 0);
//                                 frappe.model.set_value(cdt, cdn, 'height', first_uom.height || 0);
//                                 frappe.model.set_value(cdt, cdn, 'area', first_uom.area || 0);
//                             }
//                         }
//                     }
//                 }
//             });
//         }
//     },

//     uom: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (row.item_code && row.uom) {
//             frappe.call({
//                 method: 'frappe.client.get',
//                 args: {
//                     doctype: 'Item',
//                     name: row.item_code,
//                 },
//                 callback: function(data) {
//                     if (data.message) {
//                         let item = data.message;
//                         let uom_details = item.uoms || [];
//                         let selected_uom = uom_details.find(uom => uom.uom === row.uom);

//                         if (selected_uom) {
//                             frappe.model.set_value(cdt, cdn, 'custom_length', selected_uom.length || 0);
//                             frappe.model.set_value(cdt, cdn, 'custom_breadth', selected_uom.breadth || 0);
//                             frappe.model.set_value(cdt, cdn, 'custom_height', selected_uom.height || 0);
//                             frappe.model.set_value(cdt, cdn, 'custom_area', selected_uom.area || 0);
//                         }
//                     }
//                 }
//             });
//         }
//     }
// });
frappe.ui.form.on('Purchase Order', {
    refresh: function(frm) {
        // Add custom buttons or actions if needed
    }
});

frappe.ui.form.on('Purchase Order Item', {
    // Triggered when an item is selected
    item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.item_code) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Item',
                    name: row.item_code,
                },
                callback: function(response) {
                    if (response.message) {
                        let item = response.message;
                        set_item_dimensions(frm, row, item, row.uom || item.stock_uom);
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
                callback: function(response) {
                    if (response.message) {
                        let item = response.message;
                        set_item_dimensions(frm, row, item, row.uom);
                    }
                }
            });
        }
    }
});
function set_item_dimensions(frm, row, item, uom) {
    let uom_conversion = item.uoms.find(d => d.uom === uom);

    if (uom_conversion) {
        frappe.model.set_value(row.doctype, row.name, 'conversion_factor', uom_conversion.conversion_factor);
        frappe.model.set_value(row.doctype, row.name, 'custom_length', uom_conversion.length || 0);
        frappe.model.set_value(row.doctype, row.name, 'custom_breadth', uom_conversion.breadth || 0);
        frappe.model.set_value(row.doctype, row.name, 'custom_height', uom_conversion.height || 0);
        frappe.model.set_value(row.doctype, row.name, 'custom_area', uom_conversion.area || 0);
    } else {
        frappe.model.set_value(row.doctype, row.name, 'conversion_factor', 1);
        frappe.model.set_value(row.doctype, row.name, 'custom_length', 0);
        frappe.model.set_value(row.doctype, row.name, 'custom_breadth', 0);
        frappe.model.set_value(row.doctype, row.name, 'custom_height', 0);
        frappe.model.set_value(row.doctype, row.name, 'custom_area', 0);
        frappe.msgprint({
            title: __('UOM Conversion Not Found'),
            message: __('The selected UOM does not have conversion details for item {0}. Please update the Item Master accordingly.', [item.item_name]),
            indicator: 'orange'
        });
    }
}

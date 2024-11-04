frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        frm.add_custom_button(__('Create Pick List'), function() {
            open_pick_list_modal(frm);
        });
    }
});

function open_pick_list_modal(frm) {
    let item_codes = frm.doc.items.map(item => item.item_code);

    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Bin',
            filters: {
                item_code: ['in', item_codes]
            },
            fields: ['item_code', 'warehouse', 'actual_qty']
        },
        callback: function(r) {
            if (r.message && r.message.length) {
                let warehouse_data = prepare_item_warehouse_data(r.message);
                show_pick_list_modal(frm, warehouse_data);
            } else {
                frappe.msgprint(__('No available stock found for the items.'));
            }
        },
        error: function(err) {
            frappe.msgprint(__('Error fetching stock data: {0}', [err.message]));
        }
    });
}

function prepare_item_warehouse_data(bin_data) {
    let item_warehouse_map = {};
    bin_data.forEach(bin => {
        if (bin.actual_qty > 0) {
            if (!item_warehouse_map[bin.item_code]) {
                item_warehouse_map[bin.item_code] = [];
            }
            item_warehouse_map[bin.item_code].push({
                warehouse: bin.warehouse,
                available_qty: bin.actual_qty
            });
        }
    });
    return item_warehouse_map;
}

// function update_total_selected_qty(item_code, dialog) {
//     let dialog_item_table = dialog.fields_dict[item_code + '_items'].grid;
//     let rows = dialog_item_table.get_data();
//     let total_selected_qty = rows.reduce((sum, row) => sum + (row.selected_qty || 0), 0);
    
//     // Update the total selected quantity in the dialog field
//     dialog.set_value(item_code + '_total_qty', total_selected_qty);

//     console.log(`Total Selected Qty for ${item_code} (Across all Warehouses): ${total_selected_qty}`);
// }

// function show_pick_list_modal(frm, warehouse_data) {
//     let dialog_fields = [];

//     frm.doc.items.forEach(item => {
//         let item_code = item.item_code;
//         let ordered_qty = item.qty || 0;
//         let uom = item.uom || '';

//         if (warehouse_data[item_code] && warehouse_data[item_code].length > 0) {
//             dialog_fields.push({
//                 fieldname: item_code + '_items',
//                 fieldtype: 'Table',
//                 label: `Select Warehouse and Qty for ${item_code} (Ordered Qty: ${ordered_qty})`,
//                 cannot_add_rows: true,
//                 data: warehouse_data[item_code].map(bin => ({
//                     ...bin,
//                     uom: uom,
//                     selected_qty: 0
//                 })),
//                 fields: [
//                     {
//                         fieldname: 'warehouse',
//                         label: 'Warehouse',
//                         fieldtype: 'Link',
//                         options: 'Warehouse',
//                         in_list_view: 1,
//                         read_only: 1
//                     },
//                     {
//                         fieldname: 'available_qty',
//                         label: 'Available Qty',
//                         fieldtype: 'Float',
//                         in_list_view: 1,
//                         read_only: 1
//                     },
//                     {
//                         fieldname: 'uom',
//                         label: 'UOM',
//                         fieldtype: 'Data',
//                         in_list_view: 1,
//                         read_only: 1,
//                         default: uom
//                     },
//                     {
//                         fieldname: 'selected_qty',
//                         label: 'Select Qty',
//                         fieldtype: 'Float',
//                         in_list_view: 1,
//                         reqd: 1,
//                         onchange: function() {
//                             update_total_selected_qty(item_code, dialog);
//                         }
//                     }
//                 ]
//             });

//             dialog_fields.push({
//                 fieldname: item_code + '_total_qty',
//                 fieldtype: 'Float',
//                 label: 'Total Selected Qty (Across all Warehouses)',
//                 read_only: 1,
//                 default: 0 
//             });
//         }
//     });

//     let dialog = new frappe.ui.Dialog({
//         title: 'Select Items and Warehouses for Pick List',
//         fields: dialog_fields,
//         primary_action_label: 'Create Pick List',
//         primary_action: function() {
//             let selected_data = collect_selected_data(frm, dialog.get_values());
//             let is_valid = true;
//             selected_data.forEach(item => {
//                 let ordered_qty = frm.doc.items.find(i => i.item_code === item.item_code).qty || 0;
//                 if (item.qty > ordered_qty) {
//                     is_valid = false;
//                     frappe.msgprint(__('Selected quantity for {0} cannot exceed the ordered quantity of {1}.', [item.item_code, ordered_qty]));
//                 }
//             });

//             if (is_valid) {
//                 create_pick_list(frm, selected_data);
//                 dialog.hide();
//             } else {
//                 frappe.msgprint(__('Please correct the quantities before proceeding.'));
//             }
//         }
//     });

//     dialog.show();
// }

// function update_total_selected_qty(item_code, frm) {
  
//     let dialog_item_table = frm.fields_dict[item_code + '_items'].grid;
//     let rows = dialog_item_table.get_data();
//     let total_selected_qty = rows.reduce((sum, row) => sum + (row.selected_qty || 0), 0);
//     frm.fields_dict[item_code + '_total_qty'].set_value(total_selected_qty);
//     console.log(`Total Selected Qty for ${item_code} (Across all Warehouses): ${total_selected_qty}`);
// }

function show_pick_list_modal(frm, warehouse_data) {
    let dialog_fields = [];

    frm.doc.items.forEach(item => {
        let item_code = item.item_code;
        let ordered_qty = item.qty || 0;
        let uom = item.uom || '';

        if (warehouse_data[item_code] && warehouse_data[item_code].length > 0) {
            dialog_fields.push({
                fieldname: item_code + '_items',
                fieldtype: 'Table',
                label: `Select Warehouse and Qty for ${item_code} (Ordered Qty: ${ordered_qty})`,
                cannot_add_rows: true,
                data: warehouse_data[item_code].map(bin => ({
                    ...bin,
                    uom: uom,
                    selected_qty: 0
                })),
                fields: [
                    {
                        fieldname: 'warehouse',
                        label: 'Warehouse',
                        fieldtype: 'Link',
                        options: 'Warehouse',
                        in_list_view: 1,
                        read_only: 1
                    },
                    {
                        fieldname: 'available_qty',
                        label: 'Available Qty',
                        fieldtype: 'Float',
                        in_list_view: 1,
                        read_only: 1
                    },
                    {
                        fieldname: 'uom',
                        label: 'UOM',
                        fieldtype: 'Data',
                        in_list_view: 1,
                        read_only: 1,
                        default: uom
                    },
                    {
                        fieldname: 'selected_qty',
                        label: 'Select Qty',
                        fieldtype: 'Float',
                        in_list_view: 1,
                        reqd: 1,
                        onchange: function() {
                            update_total_selected_qty(item_code, dialog);
                        }
                    }
                ]
            });

            dialog_fields.push({
                fieldname: item_code + '_total_qty',
                fieldtype: 'Float',
                label: 'Total Selected Qty (Across all Warehouses)',
                read_only: 1,
                default: 0
            });
        }
    });

    let dialog = new frappe.ui.Dialog({
        title: 'Select Items and Warehouses for Pick List',
        fields: dialog_fields,
        primary_action_label: 'Create Pick List',
        primary_action: function() {
            let selected_data = collect_selected_data(frm, dialog.get_values());
            let is_valid = true;

            // Validation: Check if total selected qty exceeds ordered qty
            selected_data.forEach(item => {
                let ordered_qty = frm.doc.items.find(i => i.item_code === item.item_code).qty || 0;
                let total_selected_qty = selected_data
                    .filter(i => i.item_code === item.item_code)
                    .reduce((sum, i) => sum + (i.qty || 0), 0);

                if (total_selected_qty > ordered_qty) {
                    is_valid = false;
                    frappe.msgprint(__('Total selected quantity for {0} ({1}) exceeds the ordered quantity of {2}.', 
                        [item.item_code, total_selected_qty, ordered_qty]));
                }
            });

            if (is_valid) {
                create_pick_list(frm, selected_data);
                dialog.hide();
            } else {
                frappe.msgprint(__('Please correct the quantities before proceeding.'));
            }
        }
    });

    dialog.show();
}

function update_total_selected_qty(item_code, dialog) {
    let dialog_item_table = dialog.fields_dict[item_code + '_items'].grid;
    let rows = dialog_item_table.get_data();
    let total_selected_qty = rows.reduce((sum, row) => sum + (row.selected_qty || 0), 0);
    
    // Update the total selected quantity in the dialog field
    dialog.set_value(item_code + '_total_qty', total_selected_qty);

    console.log(`Total Selected Qty for ${item_code} (Across all Warehouses): ${total_selected_qty}`);
}

function collect_selected_data(frm, values) {
    let selected_data = [];
    frm.doc.items.forEach(item => {
        let table_data = values[item.item_code + '_items'];
        if (table_data) {
            table_data.forEach(row => {
                if (row.selected_qty > 0) {
                    selected_data.push({
                        item_code: item.item_code,
                        warehouse: row.warehouse,
                        qty: row.selected_qty,
                        uom: row.uom
                    });
                }
            });
        }
    });
    return selected_data;
}
function create_pick_list(frm, selected_items) {
    let locations = selected_items.map(item => ({
        item_code: item.item_code,
        warehouse: item.warehouse,
        qty: item.qty,
        uom: item.uom
    }));
    frappe.call({
        method: 'frappe.client.insert',
        args: {
            doc: {
                doctype: 'Pick List',
                company: frm.doc.company,
                customer: frm.doc.customer,
                custom_sales_order: frm.doc.name,
                purpose: 'Delivery',
                items: locations
            }
        },
        callback: function(response) {
            if (response.message) {
                let pick_list_name = response.message.name;
                frappe.msgprint(__('Pick List {0} created successfully with purpose "Delivery".', [pick_list_name]));
                frappe.set_route('Form', 'Pick List', pick_list_name);
            } else {
                frappe.msgprint(__('An error occurred while creating the Pick List.'));
            }
        },
        error: function(err) {
            frappe.msgprint(__('An error occurred: {0}', [err.message]));
        }
    });
}
frappe.ui.form.on('Sales Order Item', {
    item_code: function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.item_code) {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Bin",
                    filters: {
                        "item_code": row.item_code
                    },
                    fields: ["warehouse", "actual_qty"]
                },
                callback: function(r) {
                    if (r.message) {
                        var total_availed_qty = 0;
                        $.each(r.message, function(index, bin) {
                            total_availed_qty += bin.actual_qty;
                        });
                        frappe.model.set_value(cdt, cdn, 'custom_available_qty', total_availed_qty);
                        frm.refresh_field('items');
                    }
                }
            });
        }
    }
});
frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        frm.fields_dict['items'].grid.get_field('item_code').get_query = function(doc) {
            return {
                filters: {
                   
                }
            };
        };
    },

    item_code: function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.item_code) {
           
            frappe.db.get_value('Item', row.item_code, 'custom_available_qty_customer', (r) => {
                if (r && r.custom_available_qty_customer) {
                    row.custom_available_qty_customer = r.custom_available_qty_customer;
                } else {
                    row.custom_available_qty_customer = 0; 
                }
                frm.refresh_field('items'); 
            });
        }
    },

    customer: function(frm) {
        frm.doc.items.forEach((row) => {
            
            if (frm.doc.customer) {
                frappe.db.get_value('Customer', frm.doc.customer, 'customer_group', (r) => {
                    if (r && r.customer_group) {
                    
                    }
                    frm.refresh_field('items');
                });
            }
        });
    }
});
frappe.ui.form.on('Purchase Order', {
    refresh: function(frm) {
        if (frm.doc.docstatus == 1 && frm.doc.status !== "Closed") {
            frm.add_custom_button(__('Purchase Receipt'), function() {
                frappe.call({
                    method: "erpnext.buying.doctype.purchase_order.purchase_order.make_purchase_receipt",
                    args: {
                        source_name: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.model.sync(r.message);
                            frappe.set_route("Form", r.message.doctype, r.message.name);
                        }
                    }
                });
            }, __("Create"));
        }
    }
});

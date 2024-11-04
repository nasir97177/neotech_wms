frappe.ui.form.on('Purchase Invoice', {
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
frappe.ui.form.on('Purchase Invoice', {
    on_submit: function(frm) {
        frm.doc.items.forEach(item => {
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Warehouse',
                    fieldname: ['receiving_area'],
                    filters: { 'name': item.warehouse }
                },
                callback: function(r) {
                    if(r.message) {
                        let current_balance_area = r.message.receiving_area || 0;
                        let item_area = (item.custom_area);
                        frappe.call({
                            method: 'frappe.client.set_value',
                            args: {
                                doctype: 'Warehouse',
                                name: item.warehouse,
                                fieldname: {
                                    'receiving_area': current_balance_area - item_area
                                }
                            },
                            callback: function(r) {
                                if(!r.exc) {
                                    frappe.msgprint(`Updated Warehouse Balance Area for ${item.warehouse}`);
                                }
                            }
                        });
                    }
                }
            });
        });
    }
});

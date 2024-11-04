frappe.ui.form.on('Stock Receive', {
    refresh: function(frm) {
        frm.add_custom_button(__('Get Stock Entry Items'), function() {
            get_stock_entry_items(frm);
        });
    }
});
function get_stock_entry_items(frm) {
    new frappe.ui.form.MultiSelectDialog({
        doctype: 'Stock Transfer',
        target: frm,
        setters: {
            posting_date: null,
            purpose: null
        },
        date_field: 'posting_date',
        get_query() {
            return {
                filters: {
                    docstatus: 1 
                }
            };
        },
        action(selected_entries) {
            if (selected_entries.length > 0) {
                selected_entries.forEach(function(stock_entry) {
                    fetch_stock_entry_details(frm, stock_entry);
                });
            }
        }
    });
}
function fetch_stock_entry_details(frm, stock_entry) {
    frappe.call({
        method: 'frappe.client.get',
        args: {
            doctype: 'Stock Transfer',
            name: stock_entry
        },
        callback: function(r) {
            if (r.message) {
                var stock_entry = r.message;
                frm.set_value('stock_entry_type', "Material Receipt");
                frm.set_value('stock_receive_from', stock_entry.name);
                frm.set_value('from_warehouse', stock_entry.from_warehouse);
                frm.set_value('posting_date', stock_entry.posting_date);
                let stock_entry_doc = r.message;
                insert_items_into_custom_doc(frm, stock_entry_doc.items);
            }
        }
    });
}

function insert_items_into_custom_doc(frm, items) {
    items.forEach(function(item) {
        let row = frm.add_child('items'); 
        row.item_code = item.item_code;
        row.item_name = item.item_name;
        row.qty = item.qty;
        row.uom = item.uom;
        row.s_warehouse = item.s_warehouse; 
        frm.refresh_field('items');
    });
}

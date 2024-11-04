frappe.ui.form.on('Warehouse', {
    refresh: function (frm) {
        
        if (frm.fields_dict['__tree_view']) {
           
            frm.fields_dict['__tree_view'].grid.get_field('length').formatter = function(value, cell, row, options) {
                return value || 'N/A';
            };

            frm.fields_dict['__tree_view'].grid.get_field('height').formatter = function(value, cell, row, options) {
                return value || 'N/A';
            };

            frm.fields_dict['__tree_view'].grid.get_field('width').formatter = function(value, cell, row, options) {
                return value || 'N/A';
            };
        }
    }
});
frappe.ui.form.on('Warehouse', {
    onload: function (frm) {
        frm.fields_dict['__tree_view'].grid.set_columns([
            { fieldname: 'length', label: __('Length'), fieldtype: 'Float' },
            { fieldname: 'breadth', label: __('height'), fieldtype: 'Float' },
            { fieldname: 'height', label: __('width'), fieldtype: 'Float' }
        ]);
    }
});
frappe.ui.form.on('Warehouse', {
    refresh: function(frm) {
        frm.fields_dict['area'].tree_options = 'Area';
    }
});

frappe.ui.form.on('Warehouse', {
    refresh: function(frm) {
        update_custom_status(frm);
    },
    
    
    custom_balance_area: function(frm) {
        update_custom_status(frm);
    },
    
    receiving_area: function(frm) {
        update_custom_status(frm);
    }
});


function update_custom_status(frm) {
    
    let balance_area = frm.doc.custom_balance_area || 0;
    let receiving_area = frm.doc.receiving_area || 0;
    let area_difference = balance_area - receiving_area;

   
    if (balance_area <= 0) {
        frm.set_value('custom_status', 'Full');
        frappe.msgprint(__('Warehouse is full because balance area is zero or less.'));
    }
    
    // else if (area_difference > 0 && area_difference < balance_area) 
     else if (area_difference > 0 ) 
    {
        frm.set_value('custom_status', 'Partially Available');
        frappe.msgprint(__('Warehouse is partially available.'));
    }

    else {
        frm.set_value('custom_status', 'Available');
        frappe.msgprint(__('Warehouse is available.'));
    }
}

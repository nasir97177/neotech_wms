frappe.ui.form.on('Stock Transfer', {
  
    refresh: function(frm) {
        
        copy_parent_field_to_child(frm);
    },

  
    source_warehouse: function(frm) {
      
        copy_parent_field_to_child(frm);
    }
});


function copy_parent_field_to_child(frm) {
  
    let source_warehouse_value = frm.doc.source_warehouse;

   
    frm.doc.items.forEach(function(row) {
       
        frappe.model.set_value(row.doctype, row.name, 'source_warehouse', source_warehouse_value);
    });

  
    frm.refresh_field('items');
}

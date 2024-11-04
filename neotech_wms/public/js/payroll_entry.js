frappe.ui.form.on('Payroll Entry', {
    refresh: function(frm) {
        // Fetch active employees on form load
        frappe.call({
            method: 'erpnext.hr.doctype.employee.employee.get_active_employees',
            callback: function(r) {
                if (r.message) {
                    frm.clear_table('employee_table'); // Clear existing data
                    r.message.forEach(function(employee) {
                        let row = frm.add_child('employee_table');
                        row.employee_name = employee.employee_name;
                        row.employee_id = employee.name;
                        row.department = employee.department;
                        // Add other fields as necessary
                    });
                    frm.refresh_field('employee_table');
                }
            }
        });
    }
});

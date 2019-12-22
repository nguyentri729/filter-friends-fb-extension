$(document).ready(function() {
    var table = $('table').DataTable({
        'columnDefs': [{
            'targets': 0,
            'checkboxes': {
                'selectRow': true
            }
        }],
        'select': {
            'style': 'multi'
        },
        'fnCreatedRow': function(nRow, aData, iDataIndex) {
            $(nRow).attr('data-id', aData.DT_RowId); // or whatever you choose to set as the id
            $(nRow).attr('id', 'id_' + aData.DT_RowId); // or whatever you choose to set as the id
        },
        'order': [
            [1, 'asc']
        ]
    });
    // Handle form submission event 
    $('#frm-example').on('submit', function(e) {
        var form = this;


        var rows = $(table.rows({
            selected: true
        }).$('input[type="checkbox"]').map(function() {
            return $(this).prop("checked") ? $(this).closest('tr').attr('data-id') : null;
        }));
        //console.log(table.column(0).checkboxes.selected())
        // Iterate over all selected checkboxes
        rows_selected = [];
        $.each(rows, function(index, rowId) {
            console.log(rowId)
            // Create a hidden element 
            rows_selected.push(rowId);
            $(form).append(
                $('<input>')
                .attr('type', 'hidden')
                .attr('name', 'id[]')
                .val(rowId)
            );
        });
        console.log(rows_selected)
        // FOR DEMONSTRATION ONLY
        // The code below is not needed in production

        // // Output form data to a console     
        // $('#example-console-rows').text(rows_selected.join(","));

        // // Output form data to a console     
        // $('#example-console-form').text($(form).serialize());

        // Remove added elements
        $('input[name="id\[\]"]', form).remove();

        // Prevent actual form submission
        e.preventDefault();
    });
});
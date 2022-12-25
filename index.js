window.onload = function() {
    document.getElementById('csv-file').addEventListener(
        'change', preview_csv, false
    );
}

function preview_csv(e) {
    if (!e.target.files.length) {
        alert("Please choose a csv file...");
        return
    }

    const file = e.target.files[0];

    // parse file then pass to html generator
    Papa.parse(file, {
            header:true,
            skipEmptyLines:true,
            columns:['cover', 'title', 'author', 'publisher', 'isbn', 'timestamp', 'activity', 'details', 'library'],
        complete: function(result) {
            if (result.data && result.data.length > 0) {
                var grTitles = groupBy(result.data, 'isbn');
                var sgTitles = grTitles.map(transformGrData);
                initDataTable(result.data)
            }
        }
    });
}

function transformGrData(title) {
    return {
        title : title[0].title
    }
}
function htmlTableGenerator(content) {
    let csv_preview = document.getElementById('csv-preview');

    let html = '<table id="example" class="table table-condensed table-hover table-striped" style="width:100%">';

    if (content.length == 0 || typeof(content[0]) === 'undefined') {
        return null
    } else {
        const header = content[0];
        const data = content.slice(1);

        html += '<thead>';
        html += '<tr>';
        header.forEach(function(colData) {
            html += '<th>' + colData + '</th>';
        });
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        data.forEach(function(row) {
            if (header.length === row.length) {
                html += '<tr>';
                row.forEach(function(colData) {
                    html += '<td>' + colData + '</td>';
                });
                html += '</tr>';
            }
        });

        html += '</tbody>';
        html += '</table>';

        // insert table element into csv preview
        csv_preview.innerHTML = html;

        // initialise DataTable
        initDataTable();
    }
}

function initDataTable(content) {
    $('#example').dataTable({
        data: content,
            columns: [{ data: 'cover' }, { data: 'title' }, { data: 'author' }, { data: 'publisher' }, { data: 'isbn' }, { data: 'timestamp' }, { data: 'activity' }, { data: 'details' }, { data: 'library' }],
        scrollX: true,
        scrollY: (window.innerHeight / 2) + "px",
        dom: 'Bfrtip',
        buttons: [
            'colvis',
            {
                extend: 'csv',
                text: 'Download CSV',
                exportOptions: {
                    columns: ':visible'
                }
            }
        ]
    })
}

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

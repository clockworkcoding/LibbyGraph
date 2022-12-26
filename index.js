window.onload = function() {
    document.getElementById('csv-file').addEventListener(
        'change', preview_csv, false
    );
    
    $('#reading').hide();
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
                var sgTitles = transformGrData(grTitles);
                initDataTable(sgTitles)
            }
        }
    });
}

function transformGrData(grTitles) {
    let sgTitles = [];
    grTitles.forEach(function(t, key){
        t = t.sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp));
        let lastActivity = new Date(t[0].timestamp).toISOString().split('T')[0]
        //let dateAdded = new Date(t[t.length - 1].timestamp).toISOString().split('T')[0]

        let borrowed = t.filter(a => a.activity == "Borrowed").sort((a,b)=> Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
        let returned = t.filter(a => a.activity == "Returned").sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp))[0];
        //let held = t.filter(a => a.Activity == "Placed on hold").sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp))[0];
        let dateRead = null;
        let readCount = 0;
        let shelf = "to-read";
        if (returned != null){
            shelf = "read";
            readCount =1;
            dateRead = new Date(returned.timestamp).toISOString().split('T')[0];
        }
        else if (borrowed != null){
            shelf = "currently-reading";
        }
        let minDate = Math.min(... t.filter(x => x.timestamp != '').map((a) => Date.parse(a.timestamp)));
        let dateAdded = new Date();
        dateAdded.setTime(minDate);

        sgTitles.push({
            lastActivity: lastActivity,
            cover:t[0].cover,
            bookId:0,
            title:t[0].title,
            author:t[0].author,
            authorLF:null,
            additionalAuthor:null,
            isbn:0,
            isbn13:t[0].isbn,
            myRating: null,
            averageRating:null,
            publisher:null,
            binding:null,
            numberOfPages: null,
            yearPublished:null,
            originalPublicationYear:null,
            dateRead: dateRead,
            dateAdded: dateAdded.toISOString().split('T')[0],
            bookshelves:null,
            bookshelvesWithPositions:null,
            exclusiveShelf: shelf,
            myReview:null,
            spoiler:null,
            privateNotes:null,
            readCount: readCount,
            ownedCopies:0
        });
    })
    return sgTitles;
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function initDataTable(content) {
    $('#reading').show();
    $('#reading').dataTable({
        data: content,
            columns: [
                {
                    data: 'lastActivity',
                    type: 'date'
                },
                {
                    data: 'cover',
                    render: function(data) {
                        return '<img src="'+data+'"  height="128">'
                    }
                },
                {
                    data: 'bookId',
                    visible: false
                },
                {
                    data: 'title'
                },
                {
                    data: 'author'
                },
                {
                    data: 'authorLF',
                    visible: false
                },
                {
                    data: 'additionalAuthor',
                    visible: false
                },
                {
                    data: 'isbn',
                    visible: false
                },
                {
                    data: 'isbn13'
                },
                {
                    data: 'myRating',
                    render: function(data, type, row, meta){
                        return '<input type="number" class="rating" data-isbn="'+row.isbn+'" id="rating-'+ row.isbn13 +'" "name="rating" min="0" max="5"></input>';
                    }
                },
                {
                    data: 'averageRating',
                    visible: false
                },
                {
                    data: 'publisher',
                    visible: false
                },
                {
                    data: 'binding',
                    visible: false
                },
                {
                    data: 'numberOfPages',
                    visible: false
                },
                {
                    data: 'yearPublished',
                    visible: false
                },
                {
                    data: 'originalPublicationYear',
                    visible: false
                },
                {
                    data: 'dateRead',
                    type: 'date',
                    render: function(data, type, row, meta)
                    {
                        return '<input id="dateAdded-'+row.isbn13+'" class="datepicker" type="date" value="'+data+'" width="270" />';
                    }
                },
                {
                    data: 'dateAdded',
                    type: 'date'
                },
                {
                    data: 'bookshelves',
                    visible: false
                },
                {
                    data: 'bookshelvesWithPositions',
                    visible: false
                },
                {
                    data: 'exclusiveShelf',
                    render: function(data, type,row, meta) {
                        return '<select name="shelf" class="shelf  form-select form-select-lg" data-isbn="'+row.isbn+'" id="shelf-'+row.isbn13+'">' +
                        '  <option value="to-read" ' + (data == 'to-read' ? 'selected' : ' ') + '>to-read</option>' +
                        '  <option value="read" ' + (data == 'read' ? 'selected' : ' ') + '>read</option>' +
                        '  <option value="currently-reading" ' + (data == 'currently-reading' ? 'selected' : ' ') + '>currently-reading</option>' +
                        '  <option value="did-not-finish">did-not-finish</option>' +
                        '</select>';
                    }
                },
                {
                    data: 'myReview',
                    visible: false
                },
                {
                    data: 'spoiler',
                    visible: false
                },
                {
                    data: 'privateNotes',
                    visible: false
                },
                {
                    data: 'readCount',
                    render: function(data, type, row, meta){
                        return '<input type="number" class="readCount" data-isbn="'+row.isbn+'" id="readCount-'+ row.isbn13 +'" value=' + row.readCount + ' "name="quantity" min="0"></input>';
                    }
                },
                {
                    data: 'ownedCopies',
                    visible: false
                },
            ],
        responsive:true,
        order:[[0,'desc']],
        scrollX: true,
        scrollY: (window.innerHeight / 2) + "px",
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'csv',
                text: 'Download CSV',
                exportOptions: {
                    columns:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
                }
            }
        ]
    })
    $('.datepicker').datepicker({
        uiLibrary: 'bootstrap'
    });
}

function groupBy(items, key) {
    // initialize our map
    const map = new Map();
    items.forEach((item) => {
      // get the value we're grouping by
      const keyValue = item[key];
      // get the array of items for this key value. default to an empty array
      const currArr = map.has(keyValue) ? map.get(keyValue) : [];
      // add the current item
      currArr.push(item);
      // update the array
      map.set(keyValue, currArr);
    });
    return map;
  }
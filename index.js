window.onload = function () {
    document
        .getElementById("csv-file")
        .addEventListener("change", preview_csv, false);

    $("#reading").hide();
};

function preview_csv(e) {
    if (!e.target.files.length) {
        alert("Please choose a csv file...");
        return;
    }

    const file = e.target.files[0];

    // parse file then pass to html generator
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        columns: [
            "cover",
            "title",
            "author",
            "publisher",
            "isbn",
            "timestamp",
            "activity",
            "details",
            "library",
        ],
        complete: function (result) {
            if (result.data && result.data.length > 0) {
                var grTitles = groupBy(result.data, "isbn");
                var sgTitles = transformGrData(grTitles);
                initDataTable(sgTitles);
            }
        },
    });
}

function transformGrData(grTitles) {
    let sgTitles = [];
    grTitles.forEach(function (t, key) {
        if(t[0].isbn == null){
            return;
        }
        t = t.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
        let lastActivity = formatDate(t[0].timestamp);
        //let dateAdded = new Date(t[t.length - 1].timestamp).toISOString().split('T')[0]

        let borrowed = t
            .filter((a) => a.activity == "Borrowed")
            .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
        let returned = t
            .filter((a) => a.activity == "Returned")
            .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))[0];
        //let held = t.filter(a => a.Activity == "Placed on hold").sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp))[0];
        let dateRead = null;
        let readCount = 0;
        let shelf = "to-read";
        if (returned != null) {
            shelf = "read";
            readCount = 1;
            dateRead = formatDate(returned.timestamp);
        } else if (borrowed != null) {
            shelf = "currently-reading";
        }
        let minDate = Math.min(
            ...t.filter((x) => x.timestamp != "").map((a) => Date.parse(a.timestamp))
        );
        let dateAdded = new Date();
        dateAdded.setTime(minDate);

        sgTitles.push({
            lastActivity: lastActivity,
            cover: t[0].cover,
            bookId: 0,
            title: t[0].title,
            author: t[0].author,
            authorLF: null,
            additionalAuthor: null,
            isbn: 0,
            isbn13: t[0].isbn,
            myRating: null,
            averageRating: null,
            publisher: null,
            binding: null,
            numberOfPages: null,
            yearPublished: null,
            originalPublicationYear: null,
            dateRead: dateRead,
            dateAdded: dateAdded.toISOString().split("T")[0],
            bookshelves: null,
            bookshelvesWithPositions: null,
            exclusiveShelf: shelf,
            myReview: null,
            spoiler: null,
            privateNotes: null,
            readCount: readCount,
            ownedCopies: 0,
            include: true,
        });
    });
    return sgTitles;
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function starRatingFunction() {
    let table = $("#reading").DataTable();
    let row = table.row($(this).parent().closest('tr.even,tr.odd'));
    let data = row.data();
    if(data == undefined){
        return;
    }
    let stars = $(this).siblings(".gl-star-rating--stars")[0];
    let selectedRating = stars.dataset.rating;
    if(selectedRating == 0){
        selectedRating = stars.dataset.rating = null;
    }
    if(data.myRating == selectedRating){
        return;
    }
    data.myRating = selectedRating;
    row.data(data);
    table.draw(false);
    initStarRating();
};

function updateRatings() {
    $("#reading .gl-star-rating--stars").each(starRatingFunction);
}

function initDataTable(content) {
    $("#reading").show();
    $("#reading").dataTable({
        data: content,
        order: [[26, "desc"]],
        scrollY: window.innerHeight / 2 + "px",
        scrollX: true,
        fixedColumns: true,
        dom: "Bfrtip",
        columns: [
            {
                data: "cover",
                render: function (data) {
                    return '<img src="' + data + '"  height="75">';
                },
            },
            {
                data: "include",
                render: function (data, type, row, meta) {
                    return (
                        '<input type="checkbox" class="include" data-isbn="' +
                        row.isbn13 +
                        '" value="include" ' +
                        (data ? "checked" : "") +
                        ">"
                    );
                },
            },
            {
                data: "bookId",
                visible: false,
            },
            {
                data: "title",
            },
            {
                data: "author",
            },
            {
                data: "authorLF",
                visible: false,
            },
            {
                data: "additionalAuthor",
                visible: false,
            },
            {
                data: "isbn",
                visible: false,
            },
            {
                data: "isbn13",
                visible: false,
            },
            {
                data: "myRating",
                render: function (data, type, row, meta) {
                    return (
                        '<select name="rating " class="rating star-rating" id="rating-' + row.isbn13 +'">' +
                        '  <option value="" ' + (data == '' || data == null ? 'selected' : ' ') + ' >Select a rating</option>' +
                        '  <option value=1 ' + (data == 1 ? 'selected' : ' ') + '>1</option>' +
                        '  <option value=2 ' + (data == 2 ? 'selected' : ' ') + '>2</option>' +
                        '  <option value=3 ' + (data == 3 ? 'selected' : ' ') + '>3</option>' +
                        '  <option value=4 ' + (data == 4 ? 'selected' : ' ') + '>4</option>' +
                        '  <option value=5 ' + (data == 5 ? 'selected' : ' ') + '>5</option>' +
                        '</select>'
                    );
                },
            },
            {
                data: "averageRating",
                visible: false,
            },
            {
                data: "publisher",
                visible: false,
            },
            {
                data: "binding",
                visible: false,
            },
            {
                data: "numberOfPages",
                visible: false,
            },
            {
                data: "yearPublished",
                visible: false,
            },
            {
                data: "originalPublicationYear",
                visible: false,
            },
            {
                data: "dateRead",
                type: "date",
                render: function (data, type, row, meta) {
                    return (
                        '<input id="dateRead-' + row.isbn13 + '" class="datepicker" type="date" value="' + data + '" />'
                    );
                },
            },
            {
                data: "dateAdded",
                type: "date",
                render: function (data, type, row, meta) {
                    return (
                        '<input id="dateAdded-' + row.isbn13 + '" class="datepicker" type="date" value="' + data + '" />'
                    );
                },
            },
            {
                data: "bookshelves",
                visible: false,
            },
            {
                data: "bookshelvesWithPositions",
                visible: false,
            },
            {
                data: "exclusiveShelf",
                render: function (data, type, row, meta) {
                    return (
                        '<select name="shelf" class="shelf" id="shelf-' + row.isbn13 +'">' +
                        '  <option value="to-read" ' + (data == "to-read" ? "selected" : " ") + ">to-read</option>" +
                        '  <option value="read" ' + (data == "read" ? "selected" : " ") + ">read</option>" +
                        '  <option value="currently-reading" ' + (data == "currently-reading" ? "selected" : " ") + ">currently-reading</option>" +
                        '  <option value="did-not-finish"' + (data == "did-not-finish" ? "selected" : " ") + ">did-not-finish</option>" +
                        '</select>' +
                        '<script>initStarRating();</script>'
                    );
                },
            },
            {
                data: "myReview",
                visible: false,
            },
            {
                data: "spoiler",
                visible: false,
            },
            {
                data: "privateNotes",
                visible: false,
            },
            {
                data: "readCount",
                render: function (data, type, row, meta) {
                    return (
                        '<input type="number" class="readCount" data-isbn="' +
                        row.isbn13 +
                        '" id="readCount-' +
                        row.isbn13 +
                        '" value=' +
                        row.readCount +
                        ' "name="quantity" min=0></input>'
                    );
                },
            },
            {
                data: "ownedCopies",
                visible: false,
            },
            {
                data: "lastActivity",
                type: "date",
                render: function (data, type, row, meta) {
                    return (
                        '<input id="lastActivity-' +
                        row.isbn13 +
                        '" class="datepicker" type="date" value="' +
                        data +
                        '" readonly disabled />'
                    );
                },
            },
            {
                data: "include",
                render: function (data, type, row, meta) {
                    return (
                        '<input type="button" class="exclude" data-isbn="' +
                        row.isbn13 +
                        '" value="Exclude all books below this">'
                    );
                },
            },
        ],
        buttons: [
            {
                extend: "csv",
                text: "Download CSV for StoryGraph import",
                filename: "libbygraph",
                exportOptions: {
                    columns: [
                        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                        21, 22, 23, 24, 25,
                    ],
                    rows: function (idx, data, node) {
                        return data.include;
                    },
                    format: {
                        body: function (html, row, col, node) {
                            let table = $("#reading").DataTable();
                            let data = table
                                .cell(node._DT_CellIndex.row, node._DT_CellIndex.column)
                                .data();
                            return data == null ? "" : data;
                        },
                    },
                },
            },
            {
                text: 'Include all books',
                action: function (e, dt, node, config) {
                    let table = $("#reading").DataTable();
                    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                        var data = this.data();
                        data.include = true;
                        this.data(data);
                        this.invalidate();
                    });

                    table.draw(false);
                    initStarRating();
                }
            }
        ],
        rowCallback: function (row, data, displayNum, displayIndex, dataIndex) {
            if (!data.include) {
                $(row).addClass('excluded');
            } else {
                $(row).removeClass('excluded');
            }
        },
        initComplete: function (settings, json) {
            let table = $("#reading").DataTable();

            $("#reading tbody").on("change", ".shelf", function () {
                let row = table.row(this.parentNode);
                let data = row.data();
                let originalShelf = data.exclusiveShelf;
                data.exclusiveShelf = $(this).val();
                if (originalShelf == "read" && data.exclusiveShelf !== "read") {
                    data.dateRead = null;
                    data.readCount = 0;
                    row.invalidate();
                }
                row.data(data);
                table.draw(false);
                initStarRating();
            });
            $("#reading tbody").on("change", ".dateRead", function () {
                let row = table.row(this.parentNode);
                let data = formatDate(row.data());
                data.dateRead = $(this).val();
                row.data(data);
                table.draw(false);
                initStarRating();
            });
            $("#reading tbody").on("change", ".dateAdded", function () {
                let row = table.row(this.parentNode);
                let data = formatDate(row.data());
                data.dateAdded = $(this).val();
                row.data(data);
                table.draw(false);
                initStarRating();
            });
            $("#reading tbody").on("change", ".readCount", function () {
                let row = table.row(this.parentNode);
                let data = row.data();
                data.readCount = $(this).val();
                if (data.readCount < 0) {
                    data.readCount = 0;
                    $(this).val(0);
                }
                row.data(data);
                initStarRating();
            });
            $("#reading tbody").on("change", ".include", function () {
                let row = table.row(this.parentNode);
                let data = row.data();
                data.include = $(this).is(":checked");
                row.data(data);
                row.invalidate();
                table.draw(false);
                initStarRating();
            });
            $("#reading tbody").on("click", ".exclude", function () {
                let rows = table.rows({ order: "applied" })[0];
                let rowIndex = rows.indexOf(table.row($(this).parent().closest('tr.even,tr.odd')).index());
                for (let i = rowIndex + 1; i < rows.length; i++) {
                    let row = table.row(rows[i]);
                    let data = row.data();
                    data.include = false;
                    row.data(data);
                    row.invalidate();
                }
                table.draw(false);
                initStarRating();
            });
        },
    });
}


let starRatingControl = null;
function initStarRating(){
    starRatingControl = new StarRating('.rating',{
        maxStars: 5,
        clearable: true,
        tooltip: false
    });
    $(".rating").on("change", starRatingFunction);
}

function formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
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

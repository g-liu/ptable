/**
 * Prepares the table cell
 * @param cell the table cell to prepare
 */
function prepare(cell) {
    var spanNumber = $("<span></span>").addClass("number"),
        spanSymbol = $("<span></span>").addClass("symbol"),
        spanName   = $("<span></span>").addClass("name"),
        spanWeight = $("<span></span>").addClass("weight"),
        infoFields = $("<section></section>").addClass("data"); // misc. data

    cell.append(spanNumber)
        .append(spanSymbol)
        .append(spanName)
        .append(spanWeight)
        .append(infoFields);
}

/**
 * Generates the table
 * @param where the container at which to put the table
 * @param tableId the id to give the table
 */
function generateTable(where, tableId) {
    var table = $('<table></table>')
        .attr({ 'id': tableId })
        .append($('<tbody></tbody>'));

    for (var rows = 0 ; rows < 10; rows++) {
        var row = $('<tr></tr>');
        for (var cols = 0 ; cols < 19; cols++) {
            var col = $('<td></td>')
                .attr({ 'id': 'c' + rows + '-' + cols });
            row.append(col);
        }
        table.append(row);
    }
    
    where.append(table);
}

/**
 * Given a table, labels which of its cells should be elements and which should be blank
 * @param table the table at which to label cells as containing elements
 * @param elementCells an array object specifying which cells should be labeled as elements
 */
function labelElementCells(table, elementCells) {
    for (var i = 0; i < elementCells.length; i++) {
        var parts = elementCells[i];

        for (var part in parts) {
            var low = parseInt(parts[part][0].split('-', 2)[0]);
            var high = parseInt(parts[part][0].indexOf('-') > -1 ? parts[part][0].split('-', 2)[1] : low);

            var elementCounter = parts[part][1];

            for (var j = low; j <= high; j++) {
                var td = $('#c' + (i + 1) + '-' + j)
                    .addClass('element')
                    .attr({ 'id': 'e' + elementCounter });

                prepare(td);
                elementCounter++;
            }
        }
    }
}



/**
 * Populates the given table with elements and their data
 * @param table the table in which to store the data
 * @param files the files from which to retrieve the data
 */
function populateElementsData(table, files) {
    var folder = files.folder || "xmldata";
    var ext = files.format || "xml"; // FUTURE: Support multiple file types

    for(var f in files.files) {
        $.ajax({
            async: false, // TODO: Temporary patch.
            type: 'GET',
            url: folder + '/' + files.files[f] + '.' + ext,
            dataType: ext,
            success: parseResponse
        });
    }
}

/**
 * Parses the XML response to fill hidden fields with element data
 * @param xml the XML response
 */
function parseResponse(xml) {
    var elementCounter = 1;
    $(xml).find('element').each(function() {
        var eData = $('#e' + elementCounter + ' .data');
        var jsonData = {};
        
        $(this).find('property').each(function() {
            var propLabel = $(this).find('label').html();
            var propValue = $(this).find('value').html();
            jsonData[propLabel]  = propValue;
        });

        $.each(jsonData, function(label, value) {
            var metadata = $('<input></input>')
                .attr( { 'type': 'hidden', 'data-label': label })
                .val(value);
            eData.append(metadata);
        });

        elementCounter++;
    });
}

/**
 * For each element, shows its data
 * @param table the table on which the elements are being drawn
 */
function showElementsData(table) {
    table.find('td.element').each(function() {
        var eData = $(this).children('.data');

        var displayProperties = eData.children('input[data-label="Name, symbol, number"]').val().split(',', 3);
        var name = displayProperties[0].replace(/[^A-Za-z]/g, '');
        var symbol = displayProperties[1].replace(/[^A-Za-z]/g, '');
        var number = parseInt(displayProperties[2].replace(/[^0-9]/g, ''));

        var weight = eData.children('input[data-label="Standard atomic weight"]').val().split(' ', 1)[0];
            weight = weight.charAt(0).match(/[\(|\[]/g) || weight === "Unknown" ? weight : Math.round(parseFloat(weight) * 1000) / 1000;
        var type = eData.children('input[data-label="Element category"]').val();
            type = type.split(' ', 1)[0].toLowerCase().replace(/[^A-Za-z]/g, '');

        $(this).find('span.name').html(name);
        $(this).find('span.symbol').html(symbol);
        $(this).find('span.number').html(number);
        $(this).find('span.weight').html(weight);

        $(this).addClass(type)
            .attr( { 'title': name } )
    });
}

/**
 * Numbers the rows and columns of the table
 * @param table which table to perform the operation
 */
function numberRowsAndColumns(table) {
    var rows = table.find("tr:first-child").children("td, th");
    var counter = 0;

    // number them row-wise
    rows.each(function() {
        $(this).html(counter++);
    });

    // number them column-wise
    var cols = table.find("tr:not(:nth-child(n+9)) td:first-child, tr:not(:nth-child(n+9)) th:first-child");
    counter = 0;
    cols.each(function() {
        $(this).html(counter++);
    });
}

/**
 * Adds a spacer after a row in the table
 * @param table the table which to add the spacer
 * @param whichRow which row after which to add the spacer
 */
function addSpacer(table, whichRow) {
    table.find("tr:nth-child(" + whichRow + ")")
        .after($("<tr></tr>")
            .addClass('spacer')
            .append($("<td></td>")
                .attr({ 'colspan': 19 })
                .html('&nbsp;')
            )
        );
}

/**
 * Displays the information about the selected elements
 * @param number the atomic number of the element whose info to display
 * @param where where to display the info
 */
function displayElementInfo(numbers, where) {
    // sanity check
    if(numbers.length === 0 || Math.max.apply(Math, numbers) > 118 || Math.max.apply(Math, numbers) < 1) {
        console.log("Invalid parameters.");
        return;
    }

    var table = $('<table></table>');
    var tbody = $('<tbody></tbody>')
        .append($('<tr></tr>')
            .addClass('header-row')
            .append($('<th></th>').html('Property'))
            .append($('<th></th>')
                .html('Value')
                .prop('colspan', numbers.length)
            )
        );

    var properties = [];

    for(n in numbers) {
        $('#e' + numbers[n]).children('.data').children('input[data-label]').each(function() {
            if(properties.indexOf($(this).data('label')) === -1) // ensure uniqueness
                properties.push($(this).data('label'));
        });
    }

    for(p in properties) {
        var row = $('<tr></tr>');
        var tdLabel = $('<th></th>').html(properties[p]);

        row.append(tdLabel);

        for(n in numbers) {
            var tdData = $('<td></td>');
            var data = $('#e' + numbers[n]).children('.data');
            if(data.children('input[data-label="' + properties[p] + '"]').length) {
                tdData.html(data.children('input[data-label="' + properties[p] + '"]').val());
            }
            else {
                tdData.html('--');
            }

            row.append(tdData);
        }

        tbody.append(row);
    }

    table.append(tbody);
    where.html(table);
}


$(document).ready(function() {
    /**
     * each row in elementCells corresponds to the row in the table
     * for each row, an array of pairs:
     *  [range of columns that are elements, starting atomic number in that range]
     */
    var elementCells = [
        [['1', 1], ['18', 2]], // first row
        [['1-2', 3], ['13-18', 5]], // second row
        [['1-2', 11], ['13-18', 13]], // ... and so on
        [['1-18', 19]],
        [['1-18', 37]],
        [['1-2', 55], ['3-18', 71]],
        [['1-2', 87], ['3-18', 103]],
        [['4-17', 57]],
        [['4-17', 89]]
    ];
    var tableId = "ptable";
    var infoId = "einfo";
    var files = {
            "folder": "xmldata",
            "files": [
                "properties_general",
                "properties_atomic",
                "properties_physical",
                "properties_misc"
            ],
            "format": "xml"
        }

    var selectMode = false;
    var selected = [];
    
    generateTable($('#ptable-wrapper'), tableId);
    labelElementCells($("#" + tableId), elementCells);
    populateElementsData($("#" + tableId), files);
    showElementsData($("#" + tableId));
    numberRowsAndColumns($("#" + tableId));
    addSpacer($("#" + tableId), 8);

    $(document).keydown(function(e) {
        var code = e.keyCode || e.which;
        if(code == 17) {
            selectMode = true;
        }
    });

    $(document).keyup(function() {
        selectMode = false;
    });

    $('#' + tableId + ' td.element').click(function() {
        var number = parseInt($(this).attr('id').substring(1));

        if(selectMode) {
            var index = $.inArray(number, selected);
            if(index > -1) { // remove from array
                selected.splice(index, 1);
                $(this).removeClass('selected');
            }
            else { // add to array
                selected.push(number);
                $(this).addClass('selected');
            }
        }
        else {
            while(selected.length > 0) selected.pop();
            $('#' + tableId + ' td.element.selected').each(function() {
                $(this).removeClass('selected');
            });
            selected.push(number);
            $(this).addClass('selected');
        }

        displayElementInfo(selected, $('#' + infoId));
    });
});
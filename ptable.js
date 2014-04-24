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
            async: false,
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
        if(!eData.children('input[data-label="name"]').val() || !eData.children('input[data-label="symbol"]').val()) {
            // manually retrieve name and symbol
            jsonData['name'] = $(this).find('name').html();
            jsonData['symbol'] = $(this).find('symbol').html();
            jsonData['number'] = elementCounter;
        }
        
        $(this).find('property').each(function() {
            var propLabel = $(this).find('label').html();
            var propValue = $(this).find('value').html();
            jsonData[propLabel]  = propValue;
        });
        
        /*$("#e" + elementCounter).find("span.symbol").html(symbol);
        $("#e" + elementCounter).find("span.name").html(name);
        $("#e" + elementCounter).find("span.number").html(elementCounter);
        $("#e" + elementCounter).find("span.weight").html(weight);

        $("#e" + elementCounter)
            .addClass(type)
            .attr({ 'title': name });
        */

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

        var name = eData.children('input[data-label="name"]').val();
        var symbol = eData.children('input[data-label="symbol"]').val();
        var number = eData.children('input[data-label="number"]').val();
        var weight = eData.children('input[data-label="Standard atomic weight"]').val();
            weight = weight.split(' ', 1)[0];
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
 * Displays the information about the element
 * @param number the atomic number of the element whose info to display
 * @param where where to display the info
 */
function displayElementInfo(number, where) {
    var ul = $('<ul></ul>');
    $('#e' + number).children('.data').children('input[data-label]').each(function() {
        var html = $(this).data('label') + ': ' + $(this).val();
        var li = $('<li></li>');
        li.html(html);
        ul.append(li);
    });

    where.html(ul);
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
    
    generateTable($('#ptable-wrapper'), tableId);
    labelElementCells($("#" + tableId), elementCells);
    populateElementsData($("#" + tableId), files);
    showElementsData($("#" + tableId));
    numberRowsAndColumns($("#" + tableId));
    addSpacer($("#" + tableId), 8);

    $("#" + tableId + " td.element").click(function() {
        displayElementInfo($(this).attr('id').substring(1), $('#' + infoId));
    });
});
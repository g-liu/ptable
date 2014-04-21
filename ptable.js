/**
 * Prepares the table cell
 * @param cell the table cell to prepare
 */
function prepare(cell) {
    var spanNumber = $("<span></span>").addClass("number");
    var spanSymbol = $("<span></span>").addClass("symbol");
    var spanName   = $("<span></span>").addClass("name");
    var spanWeight = $("<span></span>").addClass("weight");

    cell.append(spanNumber)
        .append(spanSymbol)
        .append(spanName)
        .append(spanWeight);
}

/**
 * Generates the table
 * @param where the container at which to put the table
 * @param tableId the id to give the table
 */
function generateTable(where, tableId) {
    var table = $('<table></table>')
        .attr( { 'id': tableId } )
        .append($('<tbody></tbody>'));

    for(var rows = 0; rows < 10; rows++) {
        var row = $('<tr></tr>');
        for(var cols = 0; cols < 19; cols++) {
            var col = $('<td></td>')
                .attr( { 'id': 'c' + rows + '-' + cols } );
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
    for(var i = 0; i < elementCells.length; i++) {
        var parts = elementCells[i];

        for(var part in parts) {
            var low = parseInt(parts[part][0].split('-', 2)[0]);
            var high = parseInt(parts[part][0].indexOf('-') > -1 ? parts[part][0].split('-', 2)[1] : low);

            var elementCounter = parts[part][1];

            for(var j = low; j <= high; j++) {
                var td = $('#c' + (i + 1) + '-' + j)
                    .addClass('element')
                    .attr( { 'id': 'e' + elementCounter } );

                prepare(td);
                elementCounter++;
            }
        }
    }
}



/**
 * Populates the given table with elements and their information
 */
function populateElements(table) {
    $.ajax({
        type: 'GET',
        url: 'xmldata/properties_general.xml',
        dataType: 'xml',
        success: parseResponse
    });
}

function parseResponse(xml) {
    var elementCounter = 1;
    $(xml).find("element").each(function() {
        var name = $(this).find("name").html();
        var symbol = $(this).find("symbol").html();
        var weight = $(this).find("property:contains('Standard atomic weight')").find("value").html();
        weight = Math.round(parseFloat(weight.split(" ", 1)[0].replace(/[^0-9\.]/g, "")) * 10000) / 10000;
        if(weight.length === 0 || isNaN(weight))
            weight = "?";
        var type = $(this).find("property:contains('Element category')").find("value").html().split(" ", 1)[0].replace(/[^A-Za-z]/g, "").toLowerCase();
        
        $("#e" + elementCounter).find("span.symbol").html(symbol);
        $("#e" + elementCounter).find("span.name").html(name);
        $("#e" + elementCounter).find("span.number").html(elementCounter);
        $("#e" + elementCounter).find("span.weight").html(weight);

        $("#e" + elementCounter).addClass(type);

        elementCounter++;
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
    $("#ptable").find("tr:nth-child(" + whichRow + ")")
        .after($("<tr></tr>")
            .addClass('spacer')
            .append($("<td></td>")
                .attr( { 'colspan': 19 } )
                .html('&nbsp;')
            )
        );
}

$(document).ready(function() {
    "use strict";

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
        [['1-2', 55], ['4-18', 72]],
        [['1-2', 87], ['4-18', 104]],
        [['4-18', 57]],
        [['4-18', 89]]
    ];
    var tableId = "ptable";
    
    generateTable($('#ptable-wrapper'), tableId);
    labelElementCells($("#" + tableId), elementCells);
    populateElements($("#" + tableId));
    numberRowsAndColumns($("#" + tableId));
    addSpacer($("#" + tableId), 8);
});
/// <reference path="node_modules/@types/google-apps-script/index.d.ts" />
/// <reference path="Map.ts" />
'use strict';
var WORKBOOK = "1xR8zhWA4CCBiPUGYcbvcxI2rpk3tcVK36y3jqNBdVTQ";
/*
    @description = single point of entry for GET requests
    @param e = event arguments
    @return = html file for browser
*/
function doGet(e) {
    return HtmlService
        .createTemplateFromFile("index.html")
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
/*
   @description = provides column indexes for each field in a worksheet
   @param sheetName = the name of the worksheet
   @return = a map of column numbers for column header
*/
function mapColumnsForSheet(sheetName) {
    var activeRange = getActiveRangeForSheet(sheetName);
    var returnMap = {};
    for (var column = 1; column <= activeRange.getLastColumn(); column++) {
        returnMap[activeRange.getCell(1, column).getValue().toString()] = column;
    }
    return returnMap;
}
/*
    @description = fetches the active range for a sheet
    @param sheetName = the name of the worksheet
    @return
*/
function getActiveRangeForSheet(sheetName) {
    var sheet = SpreadsheetApp.openById(WORKBOOK).getSheetByName(sheetName);
    var activeRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    return activeRange;
}
function getCurrentTasks() {
    var activeRange = getActiveRangeForSheet("current_tasks");
    var columnMap = mapColumnsForSheet('current_tasks');
    var rowNum = 2;
    var returnArray = [];
    while (rowNum <= activeRange.getLastRow()) {
        var task = {
            'task_id': activeRange.getCell(rowNum, columnMap['task_id']).getValue().toString(),
            'task_text': activeRange.getCell(rowNum, columnMap['task_text']).getValue().toString(),
            'task_date': activeRange.getCell(rowNum, columnMap['task_date']).getValue().toString(),
            'created_by': activeRange.getCell(rowNum, columnMap['created_by']).getValue().toString(),
            'edited_by': activeRange.getCell(rowNum, columnMap['edited_by']).getValue().toString(),
            'created_timestamp': activeRange.getCell(rowNum, columnMap['created_timestamp']).getValue().toString(),
            'edited_timestamp': activeRange.getCell(rowNum, columnMap['edited_timestamp']).getValue().toString()
        };
        returnArray.push(task);
        rowNum++;
    }
    return JSON.stringify(returnArray);
}
//# sourceMappingURL=Code.gs.js.map
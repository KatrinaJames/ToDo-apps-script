/// <reference path="node_modules/@types/google-apps-script/index.d.ts" />
/// <reference path="Map.ts" />

'use strict';

import GRange = GoogleAppsScript.Spreadsheet.Range;
import GSheet = GoogleAppsScript.Spreadsheet.Sheet;
const WORKBOOK: string = "1xR8zhWA4CCBiPUGYcbvcxI2rpk3tcVK36y3jqNBdVTQ";

/* 
    @description = single point of entry for GET requests
    @param e = event arguments
    @return = html file for browser
*/
function doGet(e: any): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
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
function mapColumnsForSheet(sheetName: string): Map<number> {
    let activeRange: GRange = getActiveRangeForSheet(sheetName);

    let returnMap: Map<number> = {};
    for(let column: number = 1; column <= activeRange.getLastColumn(); column++){
        returnMap[activeRange.getCell(1, column).getValue().toString()] = column;
    }

    return returnMap;
}
/*
    @description = fetches the active range for a sheet
    @param sheetName = the name of the worksheet 
    @return
*/
function getActiveRangeForSheet(sheetName: string): GoogleAppsScript.Spreadsheet.Range {  
    let sheet: GSheet = SpreadsheetApp.openById(WORKBOOK).getSheetByName(sheetName);
    let activeRange: GRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());

    return activeRange
}

function getCurrentTasks(): string {
    let activeRange: GRange = getActiveRangeForSheet("current_tasks");
    let columnMap: object = mapColumnsForSheet('current_tasks');

    let rowNum: number = 2;
    let returnArray: object[] = [];
    while (rowNum <= activeRange.getLastRow()){
        let task = {
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

/// <reference path="node_modules/@types/google-apps-script/index.d.ts" />
/// <reference path="Map.ts" />

'use strict';

import GRange = GoogleAppsScript.Spreadsheet.Range;
import GSheet = GoogleAppsScript.Spreadsheet.Sheet;
const WORKBOOK: string = "1xR8zhWA4CCBiPUGYcbvcxI2rpk3tcVK36y3jqNBdVTQ";

/**
 * Single point of entry for GET requests
 *
 * @param {*} e - event arguments
 * @returns {(GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput)} - html file or text for browser
 */
function doGet(e: any): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    return HtmlService
        .createTemplateFromFile("index.html")
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Provides column indexes for each field in a worksheet
 *
 * @param {string} sheetName - the name of the worksheet 
 * @returns {Map<number>} - a map of column numbers for column header
 */
function mapColumnsForSheet(sheetName: string): Map<number> {
    let activeRange: GRange = getActiveRangeForSheet(sheetName);

    let returnMap: Map<number> = {};
    for(let column: number = 1; column <= activeRange.getLastColumn(); column++){
        returnMap[activeRange.getCell(1, column).getValue().toString()] = column;
    }

    return returnMap;
}

/**
 * Fetches the active range for a sheet
 *
 * @param {string} sheetName - the name of the worksheet 
 * @returns {GRange} - the active ramge in a spreadsheet
 */
function getActiveRangeForSheet(sheetName: string): GRange {  
    let sheet: GSheet = SpreadsheetApp.openById(WORKBOOK).getSheetByName(sheetName);
    let activeRange: GRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());

    return activeRange
}

/**
 * Fetches current tasks as objects from spreadsheet
 *
 * @returns {Task[]} an array of current task objects
 */
function getCurrentTaskObjects(): Task[] {
    let activeRange: GRange = getActiveRangeForSheet("current_tasks");
    let columnMap: object = mapColumnsForSheet('current_tasks');
    let rowNum: number = 2;
    let lastRow: number = activeRange.getLastRow();
    let taskArray: Task[] = [];

    while (rowNum <= lastRow){
        let task: Task = new Task({
            id: parseInt(activeRange.getCell(rowNum, columnMap['task_id']).getValue().toString()),
            text: activeRange.getCell(rowNum, columnMap['task_text']).getValue().toString(),
            date: new Date(activeRange.getCell(rowNum, columnMap['task_date']).getValue().toString()),
            createdBy: activeRange.getCell(rowNum, columnMap['created_by']).getValue().toString(),
            editedBy: activeRange.getCell(rowNum, columnMap['edited_by']).getValue().toString(),
            created: new Date(activeRange.getCell(rowNum, columnMap['created_timestamp']).getValue().toString()),
            edited: new Date(activeRange.getCell(rowNum, columnMap['edited_timestamp']).getValue().toString())
        });
        taskArray.push(task);
        rowNum++;
    }

    return taskArray;
}

/**
 * Fetches current tasks as json string
 *
 * @returns {string} - json string
 */
function getCurrentTasks(): string {
    let taskArray: Task[] = getCurrentTaskObjects();
    let jsonArray: Map<string>[] = [];

    taskArray.forEach(function(task){
        jsonArray.push(task.toJson());
    })

    return JSON.stringify(jsonArray);
}

class Task implements ITask {

    private _id: number;
    private _text: string;
    private _date: Date;
    private _createdBy: string;
    private _editedBy: string;
    private _created: Date;
    private _edited: Date;

    constructor({id, text, date, createdBy, editedBy, created, edited}: {
        id: number, 
        text: string, 
        date: Date, 
        createdBy: string,
        editedBy: string,
        created: Date,
        edited: Date
    }){
        this._id = id;
        this._text = text;
        this._date = date;
        this._createdBy = createdBy;
        this._editedBy = editedBy;
        this._created = created;
        this._edited = edited;
    }

    get id(): number {
        return this._id;
    }

    get text(): string {
        return this._text;
    }

    get date(): Date {
        return this._date;
    }

    get createdBy(): string {
        return this._createdBy;
    }

    get editedBy(): string {
        return this._editedBy;
    }

    get created(): Date {
        return this._created;
    }

    get edited(): Date {
        return this._edited;
    }

    toJson(): Map<string> {
        let jsonObj: Map<string> = {};
        jsonObj['task_id'] = this._id.toString();
        jsonObj['task_text'] = this._text;
        jsonObj['task_date'] = this._date.toISOString();
        jsonObj['created_by'] = this._createdBy;
        jsonObj['edited_by'] = this._editedBy;
        jsonObj['created_timestamp'] = this._created.toISOString();
        jsonObj['edited_timestamp'] = this._edited.toISOString();

        return jsonObj;
    }

    toString(): string {
        let jsonObj: Map<string> = this.toJson();
        return JSON.stringify(jsonObj);
    }
}
/// <reference path="node_modules/@types/google-apps-script/index.d.ts" />
/// <reference path="Map.ts" />
'use strict';
var WORKBOOK = "1xR8zhWA4CCBiPUGYcbvcxI2rpk3tcVK36y3jqNBdVTQ";
/**
 * Single point of entry for GET requests
 *
 * @param {*} e - event arguments
 * @returns {(GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput)} - html file or text for browser
 */
function doGet(e) {
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
function mapColumnsForSheet(sheetName) {
    var activeRange = getActiveRangeForSheet(sheetName);
    var returnMap = {};
    for (var column = 1; column <= activeRange.getLastColumn(); column++) {
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
function getActiveRangeForSheet(sheetName) {
    var sheet = SpreadsheetApp.openById(WORKBOOK).getSheetByName(sheetName);
    var activeRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    return activeRange;
}
/**
 * Fetches current tasks as objects from spreadsheet
 *
 * @returns {Task[]} an array of current task objects
 */
function getCurrentTaskObjects() {
    var activeRange = getActiveRangeForSheet("current_tasks");
    var columnMap = mapColumnsForSheet('current_tasks');
    var rowNum = 2;
    var lastRow = activeRange.getLastRow();
    var taskArray = [];
    while (rowNum <= lastRow) {
        var task = new Task({
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
function getCurrentTasks() {
    var taskArray = getCurrentTaskObjects();
    var jsonArray = [];
    taskArray.forEach(function (task) {
        jsonArray.push(task.toJson());
    });
    return JSON.stringify(jsonArray);
}
var Task = (function () {
    function Task(_a) {
        var id = _a.id, text = _a.text, date = _a.date, createdBy = _a.createdBy, editedBy = _a.editedBy, created = _a.created, edited = _a.edited;
        this._id = id;
        this._text = text;
        this._date = date;
        this._createdBy = createdBy;
        this._editedBy = editedBy;
        this._created = created;
        this._edited = edited;
    }
    Object.defineProperty(Task.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "date", {
        get: function () {
            return this._date;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "createdBy", {
        get: function () {
            return this._createdBy;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "editedBy", {
        get: function () {
            return this._editedBy;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "created", {
        get: function () {
            return this._created;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "edited", {
        get: function () {
            return this._edited;
        },
        enumerable: true,
        configurable: true
    });
    Task.prototype.toJson = function () {
        var jsonObj = {};
        jsonObj['task_id'] = this._id.toString();
        jsonObj['task_text'] = this._text;
        jsonObj['task_date'] = this._date.toISOString();
        jsonObj['created_by'] = this._createdBy;
        jsonObj['edited_by'] = this._editedBy;
        jsonObj['created_timestamp'] = this._created.toISOString();
        jsonObj['edited_timestamp'] = this._edited.toISOString();
        return jsonObj;
    };
    Task.prototype.toString = function () {
        var jsonObj = this.toJson();
        return JSON.stringify(jsonObj);
    };
    return Task;
}());
//# sourceMappingURL=Code.gs.js.map
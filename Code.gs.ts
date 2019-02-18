/// <reference path="node_modules/@types/google-apps-script/index.d.ts" />
/// <reference path="Map.ts" />

'use strict';

import GRange = GoogleAppsScript.Spreadsheet.Range;
import GSheet = GoogleAppsScript.Spreadsheet.Sheet;
import Dimension = GoogleAppsScript.Spreadsheet.Dimension;

const WORKBOOK: string = "1xR8zhWA4CCBiPUGYcbvcxI2rpk3tcVK36y3jqNBdVTQ";

/**
 * Delete a given task by id
 *
 * @param taskJson - The task id
 * @returns {string} - The updated task list as a JSON string
 */
function deleteTask(taskId: number): string {
    const taskRepository: ITaskRepository = new CurrentTaskRepository();
    taskRepository.remove(taskId);

    return getCurrentTasks();
}

/**
 * Updated a given task by id
 *
 * @param taskJson - The updated task as a JSON string
 * @returns {string} - The updated task list as a JSON string
 */
function updateTask(taskJson: string): string {
    let taskRepository: ITaskRepository;

    let taskMap: Map<string> = JSON.parse(taskJson);
    let task: ITask = new Task({
        id:         parseInt(taskMap['task_id']),
        text:       taskMap['task_text'],
        date:       new Date(taskMap['task_date']),
        created:    new Date(taskMap['created_timestamp']),
        createdBy:  taskMap['created_by'],
        edited:     new Date(taskMap['edited_timestamp']),
        editedBy:   taskMap['edited_by']
    });

    if(task.date <= new Date()){
        taskRepository = new HistoricTaskRepository();
    } else {
        taskRepository = new CurrentTaskRepository();
    }
    taskRepository.update(task);

    return getCurrentTasks();
}

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
 * Adds a task to the appropriate sheet
 *
 * @param taskJson - JSON representation of a task
 * @returns {string} - all current tasks as  JSON
 */
function addTask(taskJson: string): string {
    let taskRepository: ITaskRepository;

    let taskMap: Map<string> = JSON.parse(taskJson);
    let task: ITask = new Task({
        id:         parseInt(taskMap['task_id']),
        text:       taskMap['task_text'],
        date:       new Date(taskMap['task_date']),
        created:    new Date(taskMap['created_timestamp']),
        createdBy:  taskMap['created_by'],
        edited:     new Date(taskMap['edited_timestamp']),
        editedBy:   taskMap['edited_by']
    });

    if(task.date <= new Date()){
        taskRepository = new HistoricTaskRepository();
    } else {
        taskRepository = new CurrentTaskRepository();
    }
    taskRepository.add(task, getLastId() + 1);
    return getCurrentTasks();
}

/**
 * Returns highest id in any sheet for a task
 *
 * @returns {number} - max id for any task
 */
function getLastId(): number {
    const currentTaskRepository: CurrentTaskRepository = new CurrentTaskRepository();
    const currentTasks: ITask[] = currentTaskRepository.getAll();
    let maxId: number = 0;
    currentTasks.forEach(function (currentTask : ITask) {
       if (maxId < currentTask.id){
           maxId = currentTask.id;
       }
    });

    const historicTaskRepository: HistoricTaskRepository = new HistoricTaskRepository();
    const historicTasks: ITask[] = historicTaskRepository.getAll();
    historicTasks.forEach(function (historicTask : ITask) {
        if (maxId < historicTask.id){
            maxId = historicTask.id;
        }
    });

    return maxId;
}

/**
 * Fetches current tasks as json string
 *
 * @returns {string} - json string of all current tasks
 */
function getCurrentTasks(): string {
    let currentTaskRepository: CurrentTaskRepository = new CurrentTaskRepository();
    let taskArray: ITask[] = currentTaskRepository.getAll();
    let jsonArray: Map<string>[] = [];
    let historicTaskRepository: HistoricTaskRepository = null;

    taskArray.forEach(function(task){
        if(task.date <= new Date()){

            if(historicTaskRepository === null){
                historicTaskRepository = new HistoricTaskRepository();
            }

            historicTaskRepository.add(task, task.id);
            currentTaskRepository.remove(task.id);
        } else {
            jsonArray.push(task.toJson());
        }
    });

    return JSON.stringify(jsonArray);
}


interface ITaskRepository {
    getAll():                       ITask[];
    add(task: ITask, id: number):   void;
    remove(id: number):             void;
    update(task: ITask):            void;
}

abstract class TaskRepository implements ITaskRepository{

    protected readonly _sheetName: string;
    protected readonly _firstRow: number = 2;

    protected constructor(sheetName: string){
        this._sheetName = sheetName;
    }

    /**
     * Fetches the spreadsheet in the workbook
     *
     * @returns {GSheet} - The spreadsheet
     */
    private getSheet(): GSheet{
        return SpreadsheetApp.openById(WORKBOOK).getSheetByName(this._sheetName);
    }

    /**
     * Fetches the active range for a sheet
     *
     * @returns {GRange} - the active range in a spreadsheet
     */
    private getActiveRange(): GRange {
        const sheet: GSheet = this.getSheet();
        return sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    }

    /**
     * Provides column indexes for each field in a worksheet
     *
     * @returns {Map<number>} - a map of column numbers for column header
     */
    private mapColumnsForSheet(): Map<number> {
        const activeRange: GRange = this.getActiveRange();

        let returnMap: Map<number> = {};
        for(let column: number = 1; column <= activeRange.getLastColumn(); column++){
            returnMap[activeRange.getCell(1, column).getValue().toString()] = column;
        }

        return returnMap;
    }

    /**
     * Fetches tasks as objects from spreadsheet
     *
     * @returns {ITask[]} an array of task objects
     */
    getAll(): ITask[] {
        const activeRange: GRange = this.getActiveRange();
        const columnMap: Map<number> = this.mapColumnsForSheet();
        const lastRow: number = activeRange.getLastRow();

        let rowNum: number = this._firstRow;
        let taskArray: Task[] = [];

        while (rowNum <= lastRow){
            let task: Task = new Task({
                id:         parseInt(activeRange.getCell(rowNum, columnMap['task_id']).getValue().toString()),
                text:       activeRange.getCell(rowNum, columnMap['task_text']).getValue().toString(),
                date:       new Date(activeRange.getCell(rowNum, columnMap['task_date']).getValue().toString()),
                createdBy:  activeRange.getCell(rowNum, columnMap['created_by']).getValue().toString(),
                editedBy:   activeRange.getCell(rowNum, columnMap['edited_by']).getValue().toString(),
                created:    new Date(activeRange.getCell(rowNum, columnMap['created_timestamp']).getValue().toString()),
                edited:     new Date(activeRange.getCell(rowNum, columnMap['edited_timestamp']).getValue().toString())
            });
            taskArray.push(task);
            rowNum++;
        }

        return taskArray;
    }

    /**
     * Updated a given task by id
     *
     * @param task - The updated task
     */
    update(task: ITask): void {
        const activeRange: GRange = this.getActiveRange();
        const columnMap: Map<number> = this.mapColumnsForSheet();
        const lastRow: number = activeRange.getLastRow();

        let rowNum: number = 2;

        while (rowNum <= lastRow){
            if (task.id === parseInt(activeRange.getCell(rowNum, columnMap['task_id']).getValue().toString())){
                activeRange.getCell(rowNum, columnMap['task_text']).setValue(task.text);
                activeRange.getCell(rowNum, columnMap['task_date']).setValue(task.date.toISOString());
                activeRange.getCell(rowNum, columnMap['created_by']).setValue(task.createdBy);
                activeRange.getCell(rowNum, columnMap['edited_by']).setValue(task.editedBy);
                activeRange.getCell(rowNum, columnMap['created_timestamp']).setValue(task.created.toISOString());
                activeRange.getCell(rowNum, columnMap['edited_timestamp']).setValue(task.edited.toISOString());
            }
        }
    }

    /**
     * Adds a task with a given id
     *
     * @param task - The task object
     * @param id - The id of the new task
     */
    add(task: ITask, id: number): void {
        const activeRange: GRange = this.getActiveRange();
        const columnMap: Map<number> = this.mapColumnsForSheet();
        const rowNumber: number = activeRange.getLastRow() + 1;

        const sheet: GSheet = this.getSheet();
        const newRange: GRange = sheet.getRange(rowNumber,1,rowNumber, activeRange.getLastColumn());

        newRange.getCell(1, columnMap['task_id']).setValue(id);
        newRange.getCell(1, columnMap['task_text']).setValue(task.text);
        newRange.getCell(1, columnMap['created_by']).setValue(task.createdBy);
        newRange.getCell(1, columnMap['edited_by']).setValue(task.editedBy);
        newRange.getCell(1, columnMap['created_timestamp']).setValue(task.created);
        newRange.getCell(1, columnMap['edited_timestamp']).setValue(task.edited);

    }

    /**
     * Removes task with a given id
     *
     * @param id - the id of the task to remove
     */
    remove(id: number): void {
        const sheet: GSheet = this.getSheet();
        const columnMap: Map<number> = this.mapColumnsForSheet();

        const activeRange: GRange = this.getActiveRange();
        let rowNum: number = activeRange.getLastRow();

        while(rowNum >= this._firstRow){
            if(activeRange.getCell(rowNum,columnMap['thask_id']).getValue() == id){
                sheet.getRange(rowNum,1,1,activeRange.getLastColumn())
                    .deleteCells(Dimension.ROWS);
            }
            rowNum--;
        }
    }


}


class CurrentTaskRepository extends TaskRepository{

    constructor(){
        super('current_tasks');
    }
}

class HistoricTaskRepository extends TaskRepository{

    constructor(){
        super('hist_tasks');
    }
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
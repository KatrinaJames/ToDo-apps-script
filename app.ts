// application management

/// <reference path="node_modules/@types/jquery/index.d.ts" />
/// <reference path="node_modules/@types/bootstrap/index.d.ts" />
'use strict';

/**
 * Methods for new ToDos
 */
class NewTask {

    /**
     * Launches new Task modal
     */
    static LaunchPopup(): void {
        $(".modal-title").text('Create to-do');
        // @ts-ignore
        $("#calendar").datepicker('setDate', new Date());
        $("#task-popup").modal('show');
    }
}

class CurrentTaskView {

    private _taskContainer: JQuery<HTMLDivElement> = $("#task-body");
    private _rowClasses: string = "row";
    private _leftColumnClasses: string = 'col-4 text-right';
    private _editButtonClasses: string = 'btn btn-info';
    private _deleteButtonClasses: string = 'btn btn-danger';

    /**
     * Renders tasks from the server in the main view
     * @param taskMaps - A collection of key/value task objects
     */
    render(taskMaps: Map<string>[]){
        this.clearCurrentTasks();

        let unorderedTasks: ITask[] = [];
        taskMaps.forEach((taskMap: Map<string>) => {
            let task: ITask = new ClientTask({
                id:         parseInt(taskMap['task_id']),
                text:       taskMap['task_text'],
                date:       new Date(taskMap['task_date']),
                createdBy:  taskMap['created_by'],
                editedBy:   taskMap['edited_by'],
                created:    new Date(taskMap['created_timestamp']),
                edited:     new Date(taskMap['edited_timestamp'])
            });
            unorderedTasks.push(task);
        });

        let orderedTasks: ITask[] = this.sortTasksByDate(unorderedTasks);
        orderedTasks.forEach((task: ITask) => {
            this._taskContainer.append(
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).text('Date:'),
                    $("<div>").text((new DateFormatter(task.date)).toShortDate())
                ),
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).text('Text:'),
                    $("<div>").text(task.text)
                ),
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).text('Edited By:'),
                    $("<div>").text(task.editedBy)
                ),
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).text('Edited On:'),
                    $("<div>").text((new DateFormatter(task.edited)).toShortDate())
                ),
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).text('Created By:'),
                    $("<div>").text(task.createdBy)
                ),
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).text('Created On:'),
                    $("<div>").text((new DateFormatter(task.created)).toShortDate())
                ),
                $("<div>").addClass(this._rowClasses).append(
                    $("<div>").addClass(this._leftColumnClasses).append(
                        $("<button>").addClass(this._editButtonClasses).append(
                            $('<i>').addClass('fas fa-pencil-alt'),
                            $('<span>').text(' Edit')
                        )
                    ),
                    $("<div>").append(
                        $("<button>").addClass(this._deleteButtonClasses).append(
                            $('<i>').addClass('fas fa-trash-alt'),
                            $('<span>').text(' Delete')
                        )
                    )
                ),
                $('<hr>')
            );
        })
    }

    /**
     * Clears the main task view
     */
    clearCurrentTasks(): void {
        this._taskContainer.empty();
    }

    /**
     * Sorts tasks by their due date
     * @param tasks - A collection of task objects
     * @returns {ITask[]} - A sorted collection of task objects
     */
    private sortTasksByDate(tasks: ITask[]): ITask[] {
        let sortedTasks: ITask[] = tasks.sort((a: ITask, b: ITask) => {
            return b.date.getTime() - a.date.getTime();
        });
        return sortedTasks;
    }
}

class ClientTask implements ITask {

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

/**
 * A class that formatter for dates
 */
class DateFormatter{

    private _date: Date;

    constructor(date: Date){
        this._date = date;
    }

    /**
     * Returns dates in format generally used in databases
     * @returns {string} - Text in the form of YYYY-MM-DD
     */
    toDatabaseFormat(): string {
        let yearPart: number = this._date.getFullYear();
        let monthPart: number = this._date.getMonth() + 1;
        let dayPart: number = this._date.getDate();
        return yearPart.toString() + '-' + ('0' + monthPart).slice(-2) + '-' + ('0' + dayPart).slice(-2);
    }

    /**
     * Returns date in human friendly format
     * @returns {string} - Text in form fo DD-MMM-YY
     */
    toShortDate(): string {
        let shortMonths: string[] = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let dayPart: number = this._date.getDate();
        let shortYear: string = this._date.getFullYear().toString().slice(-2);
        return ('0' + dayPart).slice(-2) + '-' + shortMonths[this._date.getMonth()] + '-' + shortYear;
    }
}
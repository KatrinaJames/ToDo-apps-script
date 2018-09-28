// application management
/// <reference path="node_modules/@types/jquery/index.d.ts" />
/// <reference path="node_modules/@types/bootstrap/index.d.ts" />
'use strict';
/**
 * Methods for new ToDos
 */
var NewTask = (function () {
    function NewTask() {
    }
    /**
     * Launches new Task modal
     */
    NewTask.LaunchPopup = function () {
        $(".modal-title").text('Create to-do');
        $("#calendar").datepicker('setDate', new Date());
        $("#task-popup").modal('show');
    };
    return NewTask;
}());
var CurrentTaskView = (function () {
    function CurrentTaskView() {
        this._taskContainer = $("#task-body");
        this._rowClasses = "row";
        this._leftColumnClasses = 'col-4 text-right';
        this._editButtonClasses = 'btn btn-info';
        this._deleteButtonClasses = 'btn btn-danger';
    }
    /**
     * Renders tasks from the server in the main view
     * @param taskMaps - A collection of key/value task objects
     */
    CurrentTaskView.prototype.render = function (taskMaps) {
        var _this = this;
        this.clearCurrentTasks();
        var unorderedTasks = [];
        taskMaps.forEach(function (taskMap) {
            var task = new ClientTask({
                id: parseInt(taskMap['task_id']),
                text: taskMap['task_text'],
                date: new Date(taskMap['task_date']),
                createdBy: taskMap['created_by'],
                editedBy: taskMap['edited_by'],
                created: new Date(taskMap['created_timestamp']),
                edited: new Date(taskMap['edited_timestamp'])
            });
            unorderedTasks.push(task);
        });
        var orderedTasks = this.sortTasksByDate(unorderedTasks);
        orderedTasks.forEach(function (task) {
            _this._taskContainer.append($("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).text('Date:'), $("<div>").text((new DateFormatter(task.date)).toShortDate())), $("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).text('Text:'), $("<div>").text(task.text)), $("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).text('Edited By:'), $("<div>").text(task.editedBy)), $("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).text('Edited On:'), $("<div>").text((new DateFormatter(task.edited)).toShortDate())), $("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).text('Created By:'), $("<div>").text(task.createdBy)), $("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).text('Created On:'), $("<div>").text((new DateFormatter(task.created)).toShortDate())), $("<div>").addClass(_this._rowClasses).append($("<div>").addClass(_this._leftColumnClasses).append($("<button>").addClass(_this._editButtonClasses).append($('<i>').addClass('fas fa-pencil-alt'), $('<span>').text(' Edit'))), $("<div>").append($("<button>").addClass(_this._deleteButtonClasses).append($('<i>').addClass('fas fa-trash-alt'), $('<span>').text(' Delete')))), $('<hr>'));
        });
    };
    /**
     * Clears the main task view
     */
    CurrentTaskView.prototype.clearCurrentTasks = function () {
        this._taskContainer.empty();
    };
    /**
     * Sorts tasks by their due date
     * @param tasks - A collection of task objects
     * @returns {ITask[]} - A sorted collection of task objects
     */
    CurrentTaskView.prototype.sortTasksByDate = function (tasks) {
        var sortedTasks = tasks.sort(function (a, b) {
            return b.date.getTime() - a.date.getTime();
        });
        return sortedTasks;
    };
    return CurrentTaskView;
}());
var ClientTask = (function () {
    function ClientTask(_a) {
        var id = _a.id, text = _a.text, date = _a.date, createdBy = _a.createdBy, editedBy = _a.editedBy, created = _a.created, edited = _a.edited;
        this._id = id;
        this._text = text;
        this._date = date;
        this._createdBy = createdBy;
        this._editedBy = editedBy;
        this._created = created;
        this._edited = edited;
    }
    Object.defineProperty(ClientTask.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClientTask.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClientTask.prototype, "date", {
        get: function () {
            return this._date;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClientTask.prototype, "createdBy", {
        get: function () {
            return this._createdBy;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClientTask.prototype, "editedBy", {
        get: function () {
            return this._editedBy;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClientTask.prototype, "created", {
        get: function () {
            return this._created;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClientTask.prototype, "edited", {
        get: function () {
            return this._edited;
        },
        enumerable: true,
        configurable: true
    });
    ClientTask.prototype.toJson = function () {
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
    ClientTask.prototype.toString = function () {
        var jsonObj = this.toJson();
        return JSON.stringify(jsonObj);
    };
    return ClientTask;
}());
/**
 * A class that formatter for dates
 */
var DateFormatter = (function () {
    function DateFormatter(date) {
        this._date = date;
    }
    /**
     * Returns dates in format generally used in databases
     * @returns {string} - Text in the form of YYYY-MM-DD
     */
    DateFormatter.prototype.toDatabaseFormat = function () {
        var yearPart = this._date.getFullYear();
        var monthPart = this._date.getMonth() + 1;
        var dayPart = this._date.getDate();
        return yearPart.toString() + '-' + ('0' + monthPart).slice(-2) + '-' + ('0' + dayPart).slice(-2);
    };
    /**
     * Returns date in human friendly format
     * @returns {string} - Text in form fo DD-MMM-YY
     */
    DateFormatter.prototype.toShortDate = function () {
        var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var dayPart = this._date.getDate();
        var shortYear = this._date.getFullYear().toString().slice(-2);
        return ('0' + dayPart).slice(-2) + '-' + shortMonths[this._date.getMonth()] + '-' + shortYear;
    };
    return DateFormatter;
}());
//# sourceMappingURL=app.js.map
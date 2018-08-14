// application management

/// <reference path="node_modules/@types/jquery/index.d.ts" />
/// <reference path="node_modules/@types/bootstrap/index.d.ts" />
'use strict';

class NewTodo {
    static LaunchPopup(): void {
        $("#create-todo-popup").modal('show');
    }
}
// code for on app start

/// <reference path="node_modules/@types/jquery/index.d.ts" />
'use strict';

$(document).ready(function(){
    let server: ServerBroker = new ServerBroker();
    server.getCurrentTasks();
});
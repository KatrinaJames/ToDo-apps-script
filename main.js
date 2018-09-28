// code for on app start
/// <reference path="node_modules/@types/jquery/index.d.ts" />
'use strict';
$(document).ready(function () {
    var server = new ServerBroker();
    server.getCurrentTasks();
});
//# sourceMappingURL=main.js.map
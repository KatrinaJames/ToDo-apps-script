// code for client/server interaction
'use strict';
/**
 * Handles all interaction between client and server
 */
var google;
var ServerBroker = (function () {
    function ServerBroker() {
    }
    /**
     * Gets current tasks as an array of objects
     */
    ServerBroker.prototype.getCurrentTasks = function () {
        var view = new CurrentTaskView();
        google.script.run
            .withFailureHandler(function (error) {
            view.render([]);
        })
            .withSuccessHandler(function (data) {
            view.render(JSON.parse(data));
        })
            .getCurrentTasks();
    };
    return ServerBroker;
}());
//# sourceMappingURL=client.js.map
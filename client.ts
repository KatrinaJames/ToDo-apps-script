// code for client/server interaction

'use strict';

/**
 * Handles all interaction between client and server
 */
let google: any;
class ServerBroker {

    /**
     * Gets current tasks as an array of objects
     */
    getCurrentTasks(): void {
        let view: CurrentTaskView = new CurrentTaskView();
        google.script.run
            .withFailureHandler(function (error) {
                view.render([]);
            })
            .withSuccessHandler(function (data){
                view.render(JSON.parse(data));
            })
            .getCurrentTasks();
    }

}
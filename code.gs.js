/// <reference path="node_modules/@types/google-apps-script/google-apps-script.types.d.ts" />
'use strict';
/*
    @description = single point of entry for GET requests
    @param e = event arguments
    @return = html file for browser
*/
function doGet(e) {
    return HtmlService
        .createTemplateFromFile("index.html")
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
//# sourceMappingURL=Code.gs.js.map
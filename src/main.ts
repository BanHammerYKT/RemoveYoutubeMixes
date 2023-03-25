import "./_header_";
import { Logger } from "./logger";
import { Manager } from "./manager";
import { Extractor } from "./extractor";
import { Album } from "./album";
import "./constants";
import { Settings } from "./settings";
import { Path } from "./path";
import { Video } from "./video";
import "./page";

(function () {
    function setupManager(source: String) {
        Logger.info(`loaded from ${source}`);
        const manager = new Manager();
        manager.display();
    }

    if (document.readyState == "complete" || document.readyState == "interactive") {
        setupManager(`readyState ${document.readyState}`);
    } else {
        document.addEventListener("DOMContentLoaded", function (event) {
            setupManager("DOMContentLoaded");
        });
    }
})();

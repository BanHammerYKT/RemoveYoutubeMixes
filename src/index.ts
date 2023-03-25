import { Logger } from "./logger";
import { Manager } from "./manager";
import "./constants";

function setupManager(source: string) {
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

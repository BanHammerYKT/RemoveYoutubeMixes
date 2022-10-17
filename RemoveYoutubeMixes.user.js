/* globals jQuery, $, waitForKeyElements */
// ==UserScript==
// @name         Remove YouTube Mixes
// @version      0.4
// @description  Try to remove YouTube Mixes
// @author       BanHammerYKT
// @downloadURL  https://github.com/BanHammerYKT/RemoveYoutubeMixes/raw/master/RemoveYoutubeMixes.user.js
// @updateURL    https://github.com/BanHammerYKT/RemoveYoutubeMixes/raw/master/RemoveYoutubeMixes.user.js
// @match        https://www.youtube.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    function log(s) {
        console.log(`RemoveYoutubeMixes ${s}`);
    }

    log("loaded");

    function searchMixes() {
        $("ytd-rich-grid-media").each(function (index, el) {
            const channelName = $(el).find("yt-formatted-string#text");
            const isChannel = channelName.has("a").length > 0;
            const isDismissedAttr = $(el).attr("is-dismissed");
            const isDismissed = typeof isDismissedAttr !== "undefined";
            if (!isChannel && !isDismissed) {
                // channelName.text("this is a mix!!!");
                $(el).attr("is-dismissed", "");
                // console.log(gridMedia);
                //channelName.remove();
            }
        });
    }

    function setupTimer() {
        log("setupTimer");
        setInterval(searchMixes, 2000);
    }

    if (
        document.readyState == "complete" ||
        document.readyState == "loaded" ||
        document.readyState == "interactive"
    ) {
        setupTimer();
    } else {
        document.addEventListener("DOMContentLoaded", function (event) {
            setupTimer();
        });
    }
})();

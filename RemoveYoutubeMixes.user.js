/* globals jQuery, $, waitForKeyElements */
// ==UserScript==
// @name         Remove YouTube Mixes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Try to remove YouTube Mixes
// @author       BanHammerYKT
// @match        https://www.youtube.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    console.log("loaded");

    function searchAll() {
        $("ytd-rich-grid-media").each(function (index, el) {
            const channelName = $(el).find("yt-formatted-string#text");
            const isChannel = channelName.has("a").length > 0;
            if (!isChannel) {
                // channelName.text("this is a mix!!!");
                $(el).attr("is-dismissed", true);
                // console.log(gridMedia);
                //channelName.remove();
            }
        });
    }

    function setupTimeout() {
        setInterval(searchAll, 2000);
    }

    if (
        document.readyState == "complete" ||
        document.readyState == "loaded" ||
        document.readyState == "interactive"
    ) {
        setupTimeout();
    } else {
        document.addEventListener("DOMContentLoaded", function (event) {
            setupTimeout();
        });
    }
})();

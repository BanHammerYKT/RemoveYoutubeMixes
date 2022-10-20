/* globals jQuery, $, waitForKeyElements */
// ==UserScript==
// @name         Remove YouTube Mixes
// @version      0.7
// @description  Try to remove YouTube Mixes
// @author       BanHammerYKT
// @downloadURL  https://github.com/BanHammerYKT/RemoveYoutubeMixes/raw/master/RemoveYoutubeMixes.user.js
// @updateURL    https://github.com/BanHammerYKT/RemoveYoutubeMixes/raw/master/RemoveYoutubeMixes.user.js
// @match        https://www.youtube.com/*
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
        $("ytd-rich-grid-media:not([is-dismissed])").each(function (index, el) {
            const channelName = $(el).find("yt-formatted-string#text");
            const isChannel = channelName.has("a").length > 0;
            if (!isChannel) {
                // channelName.text("this is a mix!!!");
                $(el).attr("is-dismissed", "");
                // console.log(gridMedia);
                //channelName.remove();
            }
        });
        $("ytd-compact-radio-renderer.use-ellipsis:not([is-dismissed])").each(
            function (index, el) {
                $(el).hide();
                $(el).attr("is-dismissed", "");
            }
        );
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

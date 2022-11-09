/* globals jQuery, $, waitForKeyElements */
// ==UserScript==
// @name         Remove YouTube Mixes
// @version      0.10
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

    let channelPages = [
        "featured",
        "videos",
        "streams",
        "playlists",
        "community",
        "channels",
        "about",
    ];

    function log(s) {
        console.log(`RemoveYoutubeMixes ${s}`);
    }

    log("loaded");

    function isChannelPage() {
        let urlLastWord = document.URL.split("/").pop();
        return channelPages.indexOf(urlLastWord) > -1;
    }

    function searchMixes() {
        var primaryContents = $("div#primary").find("div#contents");
        var secondaryContents = $("div#secondary").find("div#contents");

        if (!isChannelPage()) {
            primaryContents
                .find("ytd-rich-grid-media:not([is-dismissed])")
                .each(function (index, el) {
                    const channelName = $(el).find("yt-formatted-string#text");
                    const isChannel = channelName.has("a").length > 0;
                    if (!isChannel) {
                        // channelName.text("this is a mix!!!");
                        $(el).attr("is-dismissed", "");
                        // console.log(gridMedia);
                        //channelName.remove();
                    }
                });
        }
        secondaryContents
            .find("ytd-compact-radio-renderer.use-ellipsis:not([is-dismissed])")
            .each(function (index, el) {
                $(el).hide();
                $(el).attr("is-dismissed", "");
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

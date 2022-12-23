/* globals jQuery, $, waitForKeyElements */
// ==UserScript==
// @name         Remove YouTube Mixes
// @version      0.13
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
    let searchCounter = 0;
    let searchInterval = 0;
    const searchTimes = 40;

    function log(s) {
        console.log(`RemoveYoutubeMixes ${s}`);
    }

    log("loaded");

    function isChannelPage() {
        let urlLastWord = document.URL.split("/").pop();
        return channelPages.indexOf(urlLastWord) > -1;
    }

    function searchPrimaryMixes() {
        if (!isChannelPage()) {
            $("ytd-rich-grid-media:not([is-dismissed])").each(function (
                index,
                el
            ) {
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
    }

    function searchSecondaryMixes() {
        $("ytd-compact-radio-renderer.use-ellipsis:not([is-dismissed])").each(
            function (index, el) {
                $(el).hide();
                $(el).attr("is-dismissed", "");
            }
        );
    }

    function searchShortsPanel(from) {
        $("div#contents>ytd-rich-section-renderer:not([is-dismissed])").each(
            function (index, el) {
                let shortsSpan = $(el).find("span:contains('Shorts')")[0];
                if (shortsSpan != undefined) {
                    // log("searchShortsPanel " + from);
                    $(el).hide();
                    $(el).attr("is-dismissed", "");
                }
            }
        );
    }

    function searchAll(from) {
        searchPrimaryMixes();
        searchSecondaryMixes();
        searchShortsPanel(from);
    }

    const observer = new MutationObserver(function (mutationsList, observer) {
        searchAll("callback");
    });

    function setupObserver() {
        const config = {
            childList: true,
            subtree: true,
        };
        observer.disconnect();
        $("div#primary").each(function (index, el) {
            observer.observe(el, config);
        });
        $("div#secondary").each(function (index, el) {
            observer.observe(el, config);
        });
    }

    function searchLoading() {
        if (searchCounter >= searchTimes) {
            clearInterval(searchInterval);
            // log("searchLoading stopped");
        }
        searchAll("searchLoading");
        searchCounter++;
    }

    function setupTimer(source) {
        log(`setupTimer ${source}`);
        setInterval(setupObserver, 2000);
        searchInterval = setInterval(searchLoading, 200);
    }

    if (
        document.readyState == "complete" ||
        document.readyState == "loaded" ||
        document.readyState == "interactive"
    ) {
        setupTimer(`readyState ${document.readyState}`);
    } else {
        document.addEventListener("DOMContentLoaded", function (event) {
            setupTimer("DOMContentLoaded");
        });
    }
})();

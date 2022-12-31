/* globals jQuery, $, waitForKeyElements */
// ==UserScript==
// @name         Remove YouTube Mixes
// @version      0.16
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
    const dismissedShort =
        '<svg height="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.94 122.88" style="enable-background:new 0 0 98.94 122.88" xml:space="preserve"><path d="M63.49 2.71c11.59-6.04 25.94-1.64 32.04 9.83 6.1 11.47 1.65 25.66-9.94 31.7l-9.53 5.01c8.21.3 16.04 4.81 20.14 12.52 6.1 11.47 1.66 25.66-9.94 31.7l-50.82 26.7c-11.59 6.04-25.94 1.64-32.04-9.83-6.1-11.47-1.65-25.66 9.94-31.7l9.53-5.01c-8.21-.3-16.04-4.81-20.14-12.52-6.1-11.47-1.65-25.66 9.94-31.7l50.82-26.7zM36.06 42.53l30.76 18.99-30.76 18.9V42.53z" style="fill-rule:evenodd;clip-rule:evenodd;fill:#f40407"></path></svg><span style="font-size: 1.2rem">&nbsp;&nbsp;&nbsp;&nbsp;short was here)</span>';
    const dismissedMix =
        '<svg height="14px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 111.34" style="enable-background:new 0 0 122.88 111.34" xml:space="preserve"><path d="M23.59,0h75.7a23.68,23.68,0,0,1,23.59,23.59V87.75A23.56,23.56,0,0,1,116,104.41l-.22.2a23.53,23.53,0,0,1-16.44,6.73H23.59a23.53,23.53,0,0,1-16.66-6.93l-.2-.22A23.46,23.46,0,0,1,0,87.75V23.59A23.66,23.66,0,0,1,23.59,0ZM54,47.73,79.25,65.36a3.79,3.79,0,0,1,.14,6.3L54.22,89.05a3.75,3.75,0,0,1-2.4.87A3.79,3.79,0,0,1,48,86.13V50.82h0A3.77,3.77,0,0,1,54,47.73ZM7.35,26.47h14L30.41,7.35H23.59A16.29,16.29,0,0,0,7.35,23.59v2.88ZM37.05,7.35,28,26.47H53.36L62.43,7.38v0Zm32,0L59.92,26.47h24.7L93.7,7.35Zm31.32,0L91.26,26.47h24.27V23.59a16.32,16.32,0,0,0-15.2-16.21Zm15.2,26.68H7.35V87.75A16.21,16.21,0,0,0,12,99.05l.17.16A16.19,16.19,0,0,0,23.59,104h75.7a16.21,16.21,0,0,0,11.3-4.6l.16-.18a16.17,16.17,0,0,0,4.78-11.46V34.06Z" style="fill-rule:evenodd;clip-rule:evenodd;fill:#f40407"/></svg><span style="font-size: 1.2rem">&nbsp;&nbsp;&nbsp;&nbsp;mix was here)</span>';
    const dismissedContentStyle =
        "display: flex;justify-content: center;align-items: center;color: gray;";

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
                    $(el)
                        .find("div#dismissed-content")
                        .attr("style", dismissedContentStyle)
                        .html(dismissedMix);
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

    function searchPrimaryShorts() {
        $(
            "ytd-grid-renderer>div#items>ytd-grid-video-renderer:not([is-dismissed])"
        ).each(function (index, el) {
            let shortIcon = $(el).find(
                "ytd-thumbnail-overlay-time-status-renderer"
            );
            let isShort = shortIcon.attr("overlay-style") === "SHORTS";
            if (isShort) {
                // $(el).hide();
                $(el).attr("is-dismissed", "");
                $(el)
                    .find("div#dismissed-content")
                    .attr("style", dismissedContentStyle)
                    .html(dismissedShort);
            }
        });
    }

    function searchAll(from) {
        searchPrimaryMixes();
        searchSecondaryMixes();
        searchShortsPanel(from);
        searchPrimaryShorts();
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

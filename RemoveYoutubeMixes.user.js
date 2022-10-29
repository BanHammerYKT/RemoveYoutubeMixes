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

    var contents = {};
    var interval = 0;

    function searchPrimaryMixes() {
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
    }

    function searchSecondaryMixes() {
        $("ytd-compact-radio-renderer.use-ellipsis:not([is-dismissed])").each(
            function (index, el) {
                $(el).hide();
                $(el).attr("is-dismissed", "");
            }
        );
    }

    const primaryCallback = function (mutationsList, observer) {
        console.log("Changes Detected");
        searchPrimaryMixes();
    };

    const secondaryCallback = function (mutationsList, observer) {
        console.log("Changes Detected");
        searchSecondaryMixes();
    };
    const config = {
        childList: true,
        // characterData: true,
        subtree: true,
        // attributes: true,
    };
    const primaryObserver = new MutationObserver(primaryCallback);
    const secondaryObserver = new MutationObserver(secondaryCallback);

    function searchContents() {
        var primaryContents = $("div#primary")[0];
        var secondaryContents = $("div#secondary")[0];
        console.log(primaryContents);
        console.log(secondaryContents);
        //log(JSON.stringify(targetNode));
        if (primaryContents != undefined && secondaryContents != undefined) {
            log("searchContents found");
            clearInterval(interval);
            primaryObserver.observe(
                $(primaryContents).find("div#contents")[0],
                config
            );
            secondaryObserver.observe(
                $(secondaryContents).find("div#contents")[0],
                config
            );
        }
    }

    function setupTimer(source) {
        log(`setupTimer ${source}`);
        interval = setInterval(searchContents, 500);
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

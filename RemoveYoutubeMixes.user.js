
// ==UserScript==
// @name			Remove YouTube Mixes
// @version			0.19
// @author			BanHammerYKT
// @description		Try to remove YouTube Mixes
// @grant			none
// @icon			https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match			https://www.youtube.com/*
// @updateURL		https://github.com/BanHammerYKT/RemoveYoutubeMixes/raw/master/RemoveYoutubeMixes.user.js
// @downloadURL		https://github.com/BanHammerYKT/RemoveYoutubeMixes/raw/master/RemoveYoutubeMixes.user.js
//
// Created with love using Gorilla
// ==/UserScript==

(function(){'use strict';// Logger class
class Logger {
    // Logs debug message if enabled and verbose.
    static debug(...args) {
        if (Logger.VERBOSE)
            Logger.info(...args);
    }
    // Logs information message if enabled.
    static info(...args) {
        if (Logger.ENABLED)
            console.log(Logger.TAG, ...args);
    }
    // Logs warning message if enabled.
    static warning(...args) {
        if (Logger.ENABLED)
            console.warn(Logger.TAG, ...args);
    }
    // Logs error message if enabled.
    static error(...args) {
        if (Logger.ENABLED)
            console.error(Logger.TAG, ...args);
    }
}
Logger.TAG = "RemoveYoutubeMixes:";
Logger.ENABLED = false;
Logger.VERBOSE = false;// This script contains the Album class.
/**
 * A unique collection of videos.
 */
class Album {
    /**
     * Constructs a new Album object.
     *
     * @param {Video[]?} - Optional array of videos to initialize the album.
     */
    constructor(videos = null) {
        this.videos = new Map();
        if (videos !== undefined) {
            videos.forEach((video) => this.add(video));
        }
    }
    /**
     * Adds the given video to this album.
     *
     * @param {Video} video - Video to be added.
     */
    add(video) {
        const id = video.getID();
        if (id === undefined) {
            Logger.warning("Album.add(): could not add video", video, " because it does not have an ID.");
            return;
        }
        this.videos.set(id, video);
    }
    /**
     * Updates the given video in this album.
     *
     * @param {Video} video - Video to be updated.
     */
    update(video) {
        const id = video.getID();
        if (id === undefined) {
            Logger.warning("Album.update(): could not update video", video, "because it does not have an ID.");
            return;
        }
        video.display = this.videos.get(id).display;
        this.videos.set(id, video);
    }
    /**
     * Reports whether this album has the same content as the given album.
     *
     * @param {Album} that - Album to be compared for equality.
     *
     * @returns {boolean} - True iff the albums contain the same video IDs.
     */
    equals(that) {
        const this_ids = new Array(this.getIDs());
        const that_ids = new Array(that.getIDs());
        return (this_ids.length === that_ids.length &&
            this_ids.every((id) => that_ids.indexOf(id) > -1));
    }
    /**
     * Merges this album with the given album, refreshing videos as needed.
     *
     * @param {Album} that - Album to be merged into this album.
     */
    merge(that) {
        const dropped = this.getIDs().filter((id) => !that.videos.has(id));
        dropped.forEach((id) => {
            this.videos.get(id).show();
            this.videos.delete(id);
        });
        Logger.debug("Album.merge(): dropped videos", dropped, ".");
        const updated = that.getIDs().filter((id) => this.videos.has(id));
        updated.forEach((id) => this.update(that.videos.get(id)));
        Logger.debug("Album.merge(): updated videos", updated, ".");
        const added = that.getIDs().filter((id) => !this.videos.has(id));
        added.forEach((id) => this.add(that.videos.get(id)));
        Logger.debug("Album.merge(): added videos", added, ".");
    }
    /**
     * Returns the IDs of the videos in this album.
     */
    getIDs() {
        return Array.from(this.videos.keys());
    }
    /**
     * Returns the videos in this album.
     */
    getVideos() {
        return Array.from(this.videos.values());
    }
    /**
     * Returns the number of videos in this album.
     */
    getSize() {
        return this.videos.size;
    }
}// This script implements the Video class.
// Video represents a YouTube video.
class Video {
    // Constructs a new Video from the given HTML element.
    constructor(element) {
        this.element = element;
        this.display = element.style.display;
        this.id = undefined;
        this.title = undefined;
        this.viewed = undefined;
        this.dismissibleElement = element.querySelector("div#dismissible")
            .parentNode;
    }
    // -------------------------------------------------------------------------
    // Returns the ID of the YouTube URL associated with this Video.
    deriveURL() {
        // List of selectors that could match hyperlink tags associated with this Video.
        const selectors = [
            ":scope a#video-title.yt-simple-endpoint.style-scope.ytd-grid-video-renderer",
            ":scope a#video-title-link.yt-simple-endpoint.style-scope.ytd-rich-grid-media",
            ":scope a.yt-simple-endpoint.style-scope.ytd-playlist-video-renderer",
            ":scope a.yt-simple-endpoint.style-scope.ytd-playlist-panel-video-renderer",
            ":scope a.yt-simple-endpoint.style-scope.ytd-compact-video-renderer",
            ":scope a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer", // Search
        ].join(", ");
        // Find a hyperlink tag associated with this Video.
        const hyperlink = this.element.querySelector(selectors);
        if (hyperlink === null) {
            Logger.warning("Video.deriveURL(): failed to find hyperlink element for Video", this.element, ".");
            return undefined;
        }
        // Extract the relative Video URL from the YouTube URL.
        // TODO: Use a positive lookbehind assertion instead of a capture group.
        let regex = /v=([a-zA-Z0-9_\-]+)/;
        let href = hyperlink.getAttribute("href");
        let matches = href.match(regex);
        if (matches === null) {
            regex = /shorts\/([a-zA-Z0-9_\-]+)/;
            href = hyperlink.getAttribute("href");
            matches = href.match(regex);
            if (matches === null) {
                Logger.warning("Video.deriveURL(): failed to find relative Video URL in attribute", href, "for Video", this.element, ".");
                return undefined;
            }
        }
        return matches[1];
    }
    // Returns a hierarchical path to the HTML element associated with this Video.
    derivePath() {
        let path = "/";
        // Iterate from the HTML node associated with this Video to the root HTML node.
        for (let node = this.element; node.id !== undefined; node = node.parentNode) {
            // The current HTML node can be identified relative to its parent HTML node by its NodeList index.
            let index = 0;
            for (let sib = node.previousSibling; sib !== null; sib = sib.previousSibling) {
                ++index;
            }
            // Prepend the index to the hierarchical path.
            path = "/" + index + path;
        }
        return path;
    }
    // Fetches the ID of this Video.
    fetchID() {
        const url = this.deriveURL();
        const path = this.derivePath();
        const legal = url && path;
        this.id = legal ? path + url : undefined;
        return this.id;
    }
    // Returns the ID of this Video.
    getID() {
        return this.id || this.fetchID();
    }
    // Fetches the title of this Video.
    fetchTitle() {
        // Find the title tag associated with this Video.
        const title = this.element.querySelector(":scope #video-title[title]");
        if (title === null) {
            Logger.warning("Video.fetchTitle(): failed to find title element for Video", this.element, ".");
            return undefined;
        }
        this.title = title.getAttribute("title");
        return this.title;
    }
    // Returns the title of this Video.
    getTitle() {
        return this.title || this.fetchTitle();
    }
    // Returns the view state of this Video.
    getViewed(threshold) {
        // Find the progress bar tag associated with this Video.
        const bar = this.element.querySelector("div#progress.style-scope.ytd-thumbnail-overlay-resume-playback-renderer");
        if (bar === null) {
            Logger.debug("Video.fetchViewed(): failed to find bar element for Video", this.element, ".");
            return undefined;
        }
        // Determine whether the Video's progress surpasses the progress threshold.
        const width = bar.style.width.slice(0, -1);
        const progress = parseInt(width, 10);
        this.viewed = progress >= threshold;
        return this.viewed;
    }
    //
    isShort() {
        let isShort = false;
        const shortIcon = this.element.querySelector("ytd-thumbnail-overlay-time-status-renderer");
        if (shortIcon != undefined) {
            isShort = shortIcon.getAttribute("overlay-style") === "SHORTS";
        }
        return isShort;
    }
    // -------------------------------------------------------------------------
    // Hides this Video.
    hide() {
        this.element.style.display = "none";
        // const dismissedVideo =
        //     '<span id="dismissed" style="font-size: 1.2rem; display: flex;justify-content: center;align-items: center;color: gray; box-sizing: border-box; position: absolute; top: 0; right: 0; bottom: 0; left: 0;">viewed</span>';
        // const dismissedShort =
        //     '<span id="dismissed" style="font-size: 1.2rem; display: flex;justify-content: center;align-items: center;color: gray; box-sizing: border-box; position: absolute; top: 0; right: 0; bottom: 0; left: 0;">short</span>';
        // const dismissedContentStyle = "display: flex;justify-content: center;align-items: center;color: gray;";
        // if (this.dismissibleElement != undefined) {
        //     this.dismissibleElement.setAttribute("is-dismissed", "");
        //     const dismissedContent = this.dismissibleElement.querySelector("div#dismissed");
        //     const dismissed = this.dismissibleElement.querySelector("span#dismissed");
        //     // dismissedContent.setAttribute("style", dismissedContentStyle);
        //     if (dismissed == undefined) {
        //         if (this.isShort()) dismissedContent.innerHTML = dismissedShort;
        //         else dismissedContent.innerHTML = dismissedVideo;
        //     }
        //     // dismissedContent.append(dismissedShort);
        // } else {
        //     this.element.style.display = "none";
        // }
    }
    // Shows this Video.
    show() {
        this.element.style.display = this.display;
        // if (this.dismissibleElement != undefined) {
        //     this.dismissibleElement.removeAttribute("is-dismissed");
        // } else {
        //     this.element.style.display = this.display;
        // }
    }
}// This file contains the Extractor class and subextractor functions.
/**
 * A collection of extraction functions that can be used retrieve the videos
 * embedded in a YouTube page.
 */
class Extractor {
    /**
     * Constructs a new Extractor with an empty set of subextractor functions.
     */
    constructor() {
        this.subextractors = new Set();
    }
    /**
     * Extracts the viewed videos embedded inside an HTML element.
     *
     * @param {Element} element - HTML element to extract viewed videos from.
     * @param {number} threshold - Minimum view progress of a watched video.
     * @returns {Video[]} - List of viewed videos.
     */
    extract(element, threshold) {
        const subextractors = Array.from(this.subextractors.values());
        const elements = [].concat(...subextractors.map((subextractor) => subextractor(element)));
        let videos = elements.map((element) => new Video(element));
        const shorts = videos.filter((video) => video.isShort());
        const viewed = videos.filter((video) => video.getViewed(threshold));
        const unnecessary = viewed.concat(shorts);
        Logger.info("Extractor.extract(): %d/%d Videos on the page were viewed.", unnecessary.length, unnecessary.length);
        return unnecessary;
    }
    /**
     * Inserts the given extraction function into this extractor.
     *
     * @param {*} subextractor - Subextractor function to be inserted.
     */
    insert(subextractor) {
        this.subextractors.add(subextractor);
    }
    /**
     * Removes the given extraction function from this extractor.
     *
     * @param {*} subextractor - Subextractor function to be removed.
     */
    remove(subextractor) {
        this.subextractors.delete(subextractor);
    }
}
/**
 * Extracts all the explore videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract explore videos from.
 *
 * @return {Element[]} - List of HTML explore video elements.
 */
function extractExploreVideos(element) {
    return extract(element, 
    // Videos on the Explore page
    "ytd-video-renderer.style-scope.ytd-expanded-shelf-contents-renderer");
}
/**
 * Returns all the grid videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract videos from.
 *
 * @return {Element[]} - List of HTML grid video elements.
 */
function extractGridVideos(element) {
    return extract(element, 
    // Videos in the HOME tab of a channel
    "ytd-grid-video-renderer.style-scope.yt-horizontal-list-renderer", 
    // Videos in the VIDEOS tab of a channel
    // Videos on the Library page
    // Videos on the Subscriptions page
    "ytd-grid-video-renderer.style-scope.ytd-grid-renderer");
}
/**
 * Returns all the history videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract videos from.
 *
 * @return {Element[]} - List of HTML history video elements.
 */
function extractHistoryVideos(element) {
    return extract(element, 
    // Videos on the History page
    "ytd-video-renderer.style-scope.ytd-item-section-renderer[is-history]");
}
/**
 * Extracts all the home videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract home videos from.
 *
 * @return {Element[]} - List of HTML home video elements.
 */
function extractHomeVideos(element) {
    return extract(element, 
    // Videos on the Home page
    "ytd-rich-item-renderer.style-scope.ytd-rich-grid-row");
}
/**
 * Extracts all the playlist videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract playlist videos from.
 *
 * @return {Element[]} - List of HTML playlist video elements.
 */
function extractPlaylistVideos(element) {
    return extract(element, 
    // Videos on a playlist page
    "ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer", 
    // Videos in a playlist panel
    "ytd-playlist-panel-video-renderer.style-scope.ytd-playlist-panel-renderer");
}
/**
 * Extracts all the recommended videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract recommended videos from.
 *
 * @return {Element[]} - List of HTML recommended video elements.
 */
function extractRecommendedVideos(element) {
    return extract(element, 
    // Videos in the recommendation sidebar
    "ytd-compact-video-renderer.style-scope.ytd-item-section-renderer");
}
/**
 * Returns all the search videos in the given HTML element.
 *
 * @param {Element} element - HTML element to extract videos from.
 *
 * @return {Element[]} - List of HTML search video elements.
 */
function extractSearchVideos(element) {
    return extract(element, 
    // Videos in a search result that are under a heading
    "ytd-video-renderer.style-scope.ytd-vertical-list-renderer", 
    // Videos in a search result that are NOT under a heading
    "ytd-video-renderer.style-scope.ytd-item-section-renderer:not([is-history])");
}
/**
 * Extracts all the videos in the given HTML element that match at least one of
 * the provided CSS selectors. Each of the CSS selectors will be prefixed with
 * ":scope " before being queried.
 *
 * @param {Element} element - HTML element to extract.
 * @param {string[]} selectors - CSS selectors.
 *
 * @return {Element[]} - List of HTML video elements.
 */
function extract(element, ...selectors) {
    return [].concat(...selectors.map((selector) => Array.from(element.querySelectorAll(`:scope ${selector}`))));
}// This file contains the Path class.
/**
 * Path represents the path and query components of a URL.
 */
class Path {
    /**
     * Parses the path and query components from a URL string.
     *
     * @param {string} url - The URL to be parsed.
     *
     * @returns {string} - Concatenation of the path and query components of the
     * given URL.
     */
    static parse(url) {
        const uri = new URL(url);
        return uri.pathname + uri.search;
    }
    /**
     * Invokes the given callback with the path and query components of the
     * current YouTube page.
     *
     * @param {*} callback - Function to be called with the page.
     */
    static get(callback) {
        const wrapper = (tabs) => {
            if (tabs.length > 0) {
                const page = Path.parse(tabs[0].url);
                callback(page);
            }
            else {
                Logger.info("Failed to retrieve the URL of the current YouTube page.");
            }
        };
        chrome.tabs.query({ active: true, currentWindow: true }, wrapper);
    }
}// This file contains the Settings class.
/**
 * Settings in browser storage that determine the circumstances under which a
 * video should be hidden.
 */
class Settings {
    /**
     * Constructs a new Settings object and, for convenience, loads its state.
     */
    constructor() {
        this.state = SETTINGS_DEFAULT_STATE;
        this.load();
    }
    /**
     * Reports whether watched videos on the current page should be ignored,
     * taking into account the YouTube page filters.
     *
     * @returns {boolean} - True iff watched videos should be ignored.
     */
    ignored() {
        const page = Path.parse(window.location.toString());
        const filters = {
            [HIDE_CHANNELS_CHECKBOX_STORAGE_KEY]: isChannelPage,
            [HIDE_HOME_CHECKBOX_STORAGE_KEY]: isHomePage,
            [HIDE_EXPLORE_CHECKBOX_STORAGE_KEY]: isExplorePage,
            [HIDE_LIBRARY_CHECKBOX_STORAGE_KEY]: isLibraryPage,
            [HIDE_HISTORY_CHECKBOX_STORAGE_KEY]: isHistoryPage,
            [HIDE_SUBSCRIPTIONS_CHECKBOX_STORAGE_KEY]: isSubscriptionsPage,
        };
        for (const [key, isFilterPage] of Object.entries(filters)) {
            if (this.state[key] === false && isFilterPage(document, page)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Reports whether watched videos on the current page should be hidden,
     * taking into account the state of the universal Hide Videos toggle and
     * bookmarks.
     *
     * @returns {boolean} - True iff watched videos should be hidden.
     */
    hidden() {
        const page = Path.parse(window.location.toString());
        const bookmark = this.state[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY][page];
        const universal = this.state[HIDE_VIDEOS_CHECKBOX_STORAGE_KEY];
        return bookmark !== undefined ? bookmark : universal;
    }
    /**
     * Returns the current view threshold.
     *
     * @returns {number} - Minimum watch progress of a viewed video inside the
     * inclusive range [1, 100].
     */
    threshold() {
        const enabled = this.state[VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY] === true;
        const percent = this.state[VIEW_THRESHOLD_SLIDER_STORAGE_KEY];
        return enabled ? percent : 100;
    }
    /**
     * Loads the state from browser storage and then invokes the given callback
     * if one is provided.
     *
     * @param {*} continuation - Function to be called after the state is loaded.
     */
    load(continuation = null) { }
}// This file contains the Manager class.
/**
 * Manages a collection of videos by applying settings and polling the DOM.
 */
class Manager {
    /**
     * Constructs a new Manager object.
     */
    constructor() {
        this.album = new Album();
        this.settings = new Settings();
        this.ready = true;
        // Call request() when the DOM is mutated.
        const observer = new MutationObserver(() => this.request());
        observer.observe(document.getRootNode(), {
            childList: true,
            subtree: true,
        });
    }
    /**
     * Updates the visibility of the video collection based on Settings.hidden()
     * and Settings.ignored().
     */
    display() {
        const hidden = !this.settings.ignored() && this.settings.hidden();
        Logger.debug(`Manager.display(): ${hidden ? "hiding" : "showing"} videos.`);
        const videos = this.album.getVideos();
        videos.forEach((video) => (hidden ? video.hide() : video.show()));
    }
    /**
     * Submits a request to poll the DOM. Poll requests that are issued in rapid
     * succession are batched together into a single poll request.
     */
    request() {
        const callback = () => {
            Logger.debug("Manager.request(): polling the DOM.");
            this.poll();
            this.ready = true;
        };
        if (this.ready) {
            this.ready = false;
            setTimeout(callback, BATCH_TIME_MILLISECONDS);
        }
    }
    /**
     * Updates the video collection by extracting videos from the DOM.
     *
     * Note: This function should not be called directly; use request() instead.
     */
    poll() {
        const album = this.extract();
        this.album.merge(album);
        this.display();
    }
    /**
     * Returns the videos on the current page which pass the enabled filters and
     * have a watch progress that matches or exceeds the view threshold.
     *
     * @returns {Album} - Collection of viewed videos.
     */
    extract() {
        const extractor = new Extractor();
        extractor.insert(extractExploreVideos);
        extractor.insert(extractGridVideos);
        extractor.insert(extractHistoryVideos);
        extractor.insert(extractHomeVideos);
        const filters = {
            [HIDE_PLAYLISTS_CHECKBOX_STORAGE_KEY]: extractPlaylistVideos,
            [HIDE_RECOMMENDATIONS_CHECKBOX_STORAGE_KEY]: extractRecommendedVideos,
            [HIDE_SEARCHES_CHECKBOX_STORAGE_KEY]: extractSearchVideos,
        };
        for (const [key, subextractor] of Object.entries(filters)) {
            if (this.settings.state[key] !== false) {
                extractor.insert(subextractor);
            }
        }
        const threshold = this.settings.threshold();
        const videos = extractor.extract(document, threshold);
        return new Album(videos);
    }
}(function () {
    function setupManager(source) {
        Logger.info(`loaded from ${source}`);
        const manager = new Manager();
        manager.display();
    }
    if (document.readyState == "complete" || document.readyState == "interactive") {
        setupManager(`readyState ${document.readyState}`);
    }
    else {
        document.addEventListener("DOMContentLoaded", function (event) {
            setupManager("DOMContentLoaded");
        });
    }
})();})();
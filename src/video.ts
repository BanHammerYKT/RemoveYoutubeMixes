// This script implements the Video class.
// -----------------------------------------------------------------------------

import { Logger } from "./logger";

// Video represents a YouTube video.
export class Video {
  element: HTMLElement;
  display: string;
  id: string;
  title: string;
  viewed: boolean;
  dismissibleElement: HTMLElement;

  // Constructs a new Video from the given HTML element.
  constructor(element: HTMLElement) {
    this.element = element;
    this.display = element.style.display;
    this.id = undefined;
    this.title = undefined;
    this.viewed = undefined;
    this.dismissibleElement = element.querySelector("div#dismissible")
      .parentNode as HTMLElement;
  }

  // -------------------------------------------------------------------------

  // Returns the ID of the YouTube URL associated with this Video.
  deriveURL() {
    // List of selectors that could match hyperlink tags associated with this Video.
    const selectors = [
      ":scope a#video-title.yt-simple-endpoint.style-scope.ytd-grid-video-renderer", // Grid
      ":scope a#video-title-link.yt-simple-endpoint.style-scope.ytd-rich-grid-media", // Home
      ":scope a.yt-simple-endpoint.style-scope.ytd-playlist-video-renderer", // Playlist page
      ":scope a.yt-simple-endpoint.style-scope.ytd-playlist-panel-video-renderer", // Playlist panel
      ":scope a.yt-simple-endpoint.style-scope.ytd-compact-video-renderer", // Recommendations
      ":scope a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer", // Search
    ].join(", ");

    // Find a hyperlink tag associated with this Video.
    const hyperlink = this.element.querySelector(selectors);
    if (hyperlink === null) {
      Logger.warning(
        "Video.deriveURL(): failed to find hyperlink element for Video",
        this.element,
        "."
      );
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
        Logger.warning(
          "Video.deriveURL(): failed to find relative Video URL in attribute",
          href,
          "for Video",
          this.element,
          "."
        );
        return undefined;
      }
    }
    return matches[1];
  }

  // Returns a hierarchical path to the HTML element associated with this Video.
  derivePath() {
    let path = "/";
    // Iterate from the HTML node associated with this Video to the root HTML node.
    for (
      let node = this.element;
      node.id !== undefined;
      node = node.parentNode as HTMLElement
    ) {
      // The current HTML node can be identified relative to its parent HTML node by its NodeList index.
      let index = 0;
      for (
        let sib = node.previousSibling;
        sib !== null;
        sib = sib.previousSibling
      ) {
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
      Logger.warning(
        "Video.fetchTitle(): failed to find title element for Video",
        this.element,
        "."
      );
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
  getViewed(threshold: number) {
    // Find the progress bar tag associated with this Video.
    const bar: HTMLElement = this.element.querySelector(
      "div#progress.style-scope.ytd-thumbnail-overlay-resume-playback-renderer"
    );
    if (bar === null) {
      Logger.debug(
        "Video.fetchViewed(): failed to find bar element for Video",
        this.element,
        "."
      );
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
    const shortIcon = this.element.querySelector(
      "ytd-thumbnail-overlay-time-status-renderer"
    );
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
}

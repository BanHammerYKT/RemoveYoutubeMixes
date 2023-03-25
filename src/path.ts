// This file contains the Path class.
// -----------------------------------------------------------------------------

import { Logger } from "./logger";

/**
 * Path represents the path and query components of a URL.
 */
export class Path {
  /**
   * Parses the path and query components from a URL string.
   *
   * @param {string} url - The URL to be parsed.
   *
   * @returns {string} - Concatenation of the path and query components of the
   * given URL.
   */
  static parse(url: string) {
    const uri = new URL(url);
    return uri.pathname + uri.search;
  }

  /**
   * Invokes the given callback with the path and query components of the
   * current YouTube page.
   *
   * @param {*} callback - Function to be called with the page.
   */
  static get(callback: (page: any) => void) {
    const wrapper = (tabs: any) => {
      if (tabs.length > 0) {
        const page = Path.parse(tabs[0].url);
        callback(page);
      } else {
        Logger.info("Failed to retrieve the URL of the current YouTube page.");
      }
    };

    chrome.tabs.query({ active: true, currentWindow: true }, wrapper);
  }
}

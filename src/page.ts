// This file contains functions which determine whether a given description of
// a YouTube page matches the YouTube page associated with a page filter.
// -----------------------------------------------------------------------------

/**
 * Reports whether the given YouTube page description matches a channel page.
 *
 * @param {Element} _ - HTML element representing the YouTube page.
 * @param {string} path - Path and query components of the YouTube page URL.
 * @returns {boolean} - True iff the given element and path describe a channel page.
 */
function isChannelPage(element: Element | Document, _: string): boolean {
  return (
    element.querySelector(
      "ytd-browse[page-subtype=channels]:not([hidden]) #channel-container"
    ) !== null
  );
}

/**
 * Reports whether the given YouTube page description matches the Home page.
 *
 * @param {Element} _ - HTML element representing the YouTube page.
 * @param {string} path - Path and query components of the YouTube page URL.
 * @returns {boolean} - True iff the given element and path describe the Home page.
 */
function isHomePage(_: HTMLElement | Document, path: string): boolean {
  return new RegExp("/$").test(path);
}

/**
 * Reports whether the given YouTube page description matches the Explore page.
 *
 * @param {Element} _ - HTML element representing the YouTube page.
 * @param {string} path - Path and query components of the YouTube page URL.
 * @returns {boolean} - True iff the given element and path describe the Explore page.
 */
function isExplorePage(_: HTMLElement | Document, path: string): boolean {
  return new RegExp("/feed/explore").test(path);
}

/**
 * Reports whether the given YouTube page description matches the Library page.
 *
 * @param {Element} _ - HTML element representing the YouTube page.
 * @param {string} path - Path and query components of the YouTube page URL.
 * @returns {boolean} - True iff the given element and path describe the Library page.
 */
function isLibraryPage(_: HTMLElement | Document, path: string): boolean {
  return new RegExp("/feed/library").test(path);
}

/**
 * Reports whether the given YouTube page description matches the History page.
 *
 * @param {Element} _ - HTML element representing the YouTube page.
 * @param {string} path - Path and query components of the YouTube page URL.
 * @returns {boolean} - True iff the given element and path describe the History page.
 */
function isHistoryPage(_: HTMLElement | Document, path: string): boolean {
  return new RegExp("/feed/history").test(path);
}

/**
 * Reports whether the given YouTube page description matches the Subscriptions page.
 *
 * @param {Element} _ - HTML element representing the YouTube page.
 * @param {string} path - Path and query components of the YouTube page URL.
 * @returns {boolean} - True iff the given element and path describe the Subscriptions page.
 */
function isSubscriptionsPage(_: HTMLElement | Document, path: string): boolean {
  return new RegExp("/feed/subscriptions").test(path);
}

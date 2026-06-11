# Chrome Web Store Submission Guide

Here are the professional justifications you can use for your store listing.

## Single Purpose
**Question**: *An extension must have a single purpose that is narrow and easy-to-understand.*

**Draft Answer**:
> "The purpose of this extension is to provide a highly customizable and efficient dashboard for the browser's 'New Tab' page. It streamlines the user's workflow by consolidating favorite website shortcuts and aesthetic personalization features into a single, high-performance interface. The extension includes a search UI that strictly utilizes the Chrome Search API (`chrome.search.query`), ensuring all searches are handled by the user's existing default search engine settings without acting as a separate search provider."

## Bookmarks Permission Justification
**Question**: *A justification for bookmarks is required. This can be entered on the Privacy practices tab.*

**Draft Answer**:
> "The 'bookmarks' permission is used solely to allow users to optionally import their existing browser bookmarks directly into the extension's shortcut grid. This enables a seamless transition for the user and provides immediate access to their preferred links within the new tab interface. The extension reads bookmark data only when the user explicitly triggers the 'Import' feature, and all imported data is stored locally on the user's machine."

## Search Permission Justification
**Question**: *A justification for search is required. This can be entered on the Privacy practices tab.*

**Draft Answer**:
> "The 'search' permission is required to access the `chrome.search.query` API. This functionality is essential to provide a user-friendly search bar within the extension that respects the user's default browser search settings. The extension does not define its own search engine or modify search settings; it strictly uses this permission to route user queries to their existing preferred provider, ensuring compliance with the 'Single Purpose' policy by acting as a native UI integration."

## Favicon Permission Justification (added in v1.2.0)
**Question**: *A justification for favicon is required. This can be entered on the Privacy practices tab.*

**Draft Answer**:
> "The 'favicon' permission is used solely to display website icons on the user's shortcut grid via the `chrome-extension://<id>/_favicon/` endpoint. It serves as an offline fallback: when the device has no internet connection and an icon has not yet been cached by the extension, the icon Chrome already stores locally for the visited site is shown instead of a blank tile. Access is read-only, happens entirely on the user's machine, and no browsing or favicon data is ever collected or transmitted."

## Host Permissions Justification (added in v1.2.0)
**Question**: *A justification for host permissions is required. This can be entered on the Privacy practices tab.*

**Draft Answer**:
> "The extension requests exactly two narrowly-scoped host permissions, both used only to download icon images for the shortcuts the user has created:
>
> 1. `https://t2.gstatic.com/faviconV2*` — Google's public favicon service. Each shortcut's favicon is fetched once at high resolution and stored locally (IndexedDB) so the new-tab page renders instantly and continues to work fully offline. The host permission is required because this endpoint does not serve CORS headers, so a regular fetch from the extension page would be blocked and the local cache could not be populated. The only data included in the request is the domain of the shortcut the user added.
>
> 2. `https://cdn.jsdelivr.net/*` — the public CDN serving the open-source 'dashboard-icons' collection (homarr-labs, Apache-2.0). It is contacted only when the user explicitly selects a DashboardIcons icon or clicks the 'Auto-Match Icons' button, and the downloaded SVG icons are likewise cached locally for offline use.
>
> No user data is sent to either host beyond the icon being requested, no remote code is loaded or executed (only image assets), and nothing is collected, tracked, or shared."

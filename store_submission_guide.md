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

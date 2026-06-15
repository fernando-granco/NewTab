# Chrome Web Store Submission Guide

Copy for the store listing and the answers the Privacy practices tab asks for.
Everything here reflects version 1.2.0.

---

## Store listing — Detailed description

> **Your new tab, exactly your way.**
>
> Open a tab and your favorite sites are right there in a clean grid. New Tab
> replaces Chrome's new-tab page with a simple, good-looking dashboard you can
> shape to fit how you actually work.
>
> **Make it yours**
> - Arrange your shortcuts: icon size, spacing, columns, and where the grid sits.
> - Get the right icon every time — automatic favicons, 1,800+ icons from the
>   open-source DashboardIcons set, your own image URL, or an uploaded file.
> - Set your background: gradient, solid color, or your own image, with blur.
> - Choose your font: the built-in one, a system font, an uploaded font, or a
>   Google Font.
>
> **Built to be quick**
> - Icons are cached on your device, so they load instantly and stay sharp on
>   4K screens.
> - An optional search bar uses your browser's own default search engine — no
>   redirects and no separate search provider.
>
> **Handy extras**
> - Import a folder of bookmarks in one click.
> - Drag to reorder, and launch your whole routine with one "Open All" button.
> - Back up your setup to a file and restore it on any computer.
>
> **Private by design**
> No tracking, no analytics, nothing sent to us — ever. Your shortcuts and
> settings stay in your browser's local storage. Simple, sleek, and strictly
> yours.

---

## Single Purpose
**Question**: *An extension must have a single purpose that is narrow and easy-to-understand.*

**Draft Answer**:
> "This extension replaces the browser's New Tab page with a customizable dashboard of website shortcuts. Its single purpose is to give the user fast, personalized access to their favorite sites every time they open a new tab. All features — icon and layout customization, backgrounds, fonts, bookmark import, and an optional search bar — serve that one purpose. The search bar uses the Chrome Search API (`chrome.search.query`) to route queries to the user's existing default search engine; the extension never acts as its own search provider."

## Bookmarks Permission Justification
**Question**: *A justification for bookmarks is required. This can be entered on the Privacy practices tab.*

**Draft Answer**:
> "The 'bookmarks' permission lets users optionally import their existing browser bookmarks into the extension's shortcut grid. Bookmark data is read only when the user explicitly clicks the 'Import' button, is used only to create shortcuts, and is stored locally on the user's machine. It is never transmitted anywhere."

## Search Permission Justification
**Question**: *A justification for search is required. This can be entered on the Privacy practices tab.*

**Draft Answer**:
> "The 'search' permission provides access to the `chrome.search.query` API, which powers the extension's optional search bar. It routes the user's query to their existing default search engine. The extension does not define its own search engine or change any search settings — it simply offers a native, on-page entry point to the search provider the user has already chosen."

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

## Remote Code
**Question**: *Are you using remote code?*

**Answer**: **No.**
> "All JavaScript that the extension executes is included in the extension package and reviewed as part of submission. The extension does not load or run any remote, hosted, or dynamically-fetched code (no external `<script>` tags, no `eval` of fetched strings, no remotely-hosted modules). The only resources retrieved from the network are non-executable assets: website icon images, and — only if the user explicitly enters a Google Fonts URL — a font stylesheet and font file. These are styling/image data, not code."

## Data Usage / Privacy Disclosures
**Question**: *What user data do you plan to collect from users now or in the future?*

**Answer**: **None.**
> "This extension does not collect, transmit, sell, or share any user data. All data the extension creates — the user's shortcuts, layout, background, font choice, and other settings — is stored locally on the user's own device (localStorage and IndexedDB) and never leaves it. There is no analytics, no telemetry, no tracking, no remote server, and no account. The 'Export' feature writes a backup file only to a location the user chooses on their own computer."

Recommended Data collection checklist answers (Privacy practices tab):
- Personally identifiable information: **No**
- Health information: **No**
- Financial and payment information: **No**
- Authentication information: **No**
- Personal communications: **No**
- Location: **No**
- Web history: **No**
- User activity: **No**
- Website content: **No**

Certifications (all true for this extension):
- ✅ I do not sell or transfer user data to third parties, outside of the approved use cases.
- ✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- ✅ I do not use or transfer user data to determine creditworthiness or for lending purposes.

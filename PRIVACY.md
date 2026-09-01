# Privacy Policy for New Tab

Effective date: September 1, 2026

Applies to: New Tab version 1.2.1 and later

New Tab is designed to work without an account, analytics, advertising,
tracking, or a developer-operated server. The developer does not receive or
store your personal data.

## Data the Extension Handles

New Tab handles the information needed to build your personal new-tab page:

- shortcut names, website addresses, folders, and layout choices;
- appearance settings, custom images, fonts, themes, and custom CSS;
- bookmark folder names, bookmark titles, and bookmark addresses, but only
  after you click **Load Bookmarks** and grant the optional bookmark permission;
- backup files that you explicitly export or import; and
- search text that you submit through the optional search bar.

This information is used only to provide the extension's new-tab dashboard
features.

## Local Storage

Shortcuts and settings are stored in the browser's local storage. Uploaded
assets and cached icons may be stored in IndexedDB. This data stays in your
Chrome profile and is not sent to the developer.

An exported backup is written only to the download location you choose. An
imported backup is read only after you select it, validated locally, and used to
replace the extension's local configuration.

## Network Requests and Third Parties

New Tab makes the following limited HTTPS requests to provide features visible
to you:

- **Google favicon service (`t2.gstatic.com`)**: for automatic shortcut icons,
  the extension sends only the shortcut's origin (for example,
  `https://example.com`). Paths, query strings, credentials, bookmark folder
  names, and shortcut labels are not included. Retrieved icons are cached
  locally.
- **jsDelivr (`cdn.jsdelivr.net`)**: the extension downloads the open-source
  Dashboard Icons index and individual image files when you choose or
  auto-match those icons. No shortcut URL, bookmark data, or search text is
  included in these requests.
- **Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`)**: these hosts
  are contacted only after you enter a Google Fonts stylesheet URL. The chosen
  font is cached locally.
- **A user-specified HTTPS image host**: if you enter an image URL for a
  background or icon, Chrome requests that image directly from the host you
  selected.
- **Your existing default search provider**: when you submit a search, the
  extension passes the text to Chrome's Search API. Chrome sends it to the
  default provider you already selected. New Tab does not redirect, record, or
  receive the query.

Those services may receive standard connection information such as an IP
address and browser request headers under their own privacy terms. New Tab does
not add tracking identifiers, cookies, analytics parameters, or advertising
data to its requests.

## Permissions

- `search` is used only to send a user-submitted query to Chrome's current
  default search provider.
- `favicon` is used only as a local fallback for shortcut icons Chrome already
  has on the device.
- Host access to `t2.gstatic.com` and `cdn.jsdelivr.net` is used only to fetch
  and cache the non-executable icon assets described above.
- `bookmarks` is optional. It is requested only when you click **Load
  Bookmarks**, and it is used only to let you choose and import a bookmark
  folder. New Tab does not create, edit, or delete browser bookmarks.

## Sharing, Selling, and Advertising

The developer does not sell, rent, share, or use your data for advertising,
profiling, credit decisions, or any purpose unrelated to the extension's
single purpose. There is no telemetry and no human review of user data.

The use of information received from Google APIs will adhere to the
[Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq),
including the Limited Use requirements.

## Your Choices and Deletion

You can edit or delete shortcuts and settings inside the extension, reset the
appearance settings, remove the optional bookmark permission from Chrome's
extension settings, or uninstall New Tab. Uninstalling removes the extension's
locally stored data according to Chrome's normal extension data handling. You
control any backup files you previously exported.

## Changes and Contact

Material changes to data handling will be disclosed in the extension and its
Chrome Web Store listing before the changed practice begins. Questions or
privacy requests can be submitted through the project's
[GitHub issue tracker](https://github.com/fernando-granco/NewTab/issues).

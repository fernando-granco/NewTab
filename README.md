# New Tab

A clean, fast, and deeply customizable new-tab page for Chrome.

Current release: **1.2.1**. Requires Chrome 104 or newer.

New Tab turns the blank browser tab into a personal launchpad: your favorite
sites, your layout, your background, your icons, and your search bar, all in one
place. It is built to feel simple when you open it, but flexible when you want
to make it yours.

![New Tab](Screenshot0.png)

## Why Use It

Most new-tab pages are either too busy or too limited. This one is meant to stay
out of your way. Open a tab, see the shortcuts you care about, launch what you
need, and keep moving.

It works especially well if you like having a tidy home base for work, school,
personal projects, or everyday browsing without news feeds, accounts, ads, or
tracking.

## Main Features

- **Fast shortcut grid** - Keep your most-used sites one click away in a clean,
  responsive grid.
- **Full layout control** - Adjust icon size, row spacing, column spacing,
  column count, and vertical position so the page fits your screen and
  wallpaper.
- **Folders and pages** - Group shortcuts into folders, spread them across
  multiple pages, and move between pages with on-screen arrows, page dots, or
  the keyboard. Each page can even have its own icon size and grid layout.
- **Folder styling** - Choose where folders open (around the icon, beside it,
  centered, or a fixed spot you pick), and set their icon size, padding,
  spacing, name position, and background opacity.
- **Drag and drop organization** - Reorder shortcuts, move items into folders,
  and keep your setup exactly how you like it.
- **Native browser search** - Use the optional search bar with your browser's
  current default search engine. The extension does not replace or control your
  search provider. Size and shape it however you like, from a wide pill to a
  compact square.
- **Beautiful icons** - Use automatic favicons, upload your own image, paste an
  image URL, or choose from the open-source
  [Dashboard Icons](https://dashboardicons.com/) collection.
- **Auto-match icons** - Let the extension scan your shortcuts and match them to
  crisp Dashboard Icons where available.
- **Custom backgrounds** - Choose a radial gradient, a solid color, an image
  URL, or an uploaded image, with optional blur.
- **Themes and styling** - Pick a preset, set your accent color, adjust labels,
  change fonts, or add your own custom CSS. The accent color drives the whole
  interface, and you can override individual settings-panel colors when you
  want something specific.
- **Your settings button** - Move the gear to any corner, swap it for another
  emoji or your own image, change its size and opacity, or hide it completely.
  If you hide it, the extension's toolbar button will always reopen settings.
- **Keyboard shortcuts** - Assign number keys 1-9 to launch favorite shortcuts
  even faster.
- **Open All** - Launch a whole set of sites at once, with the option to exclude
  specific shortcuts.
- **Bookmark import** - Import an existing Chrome bookmarks folder directly into
  your shortcut grid.
- **Backup and restore** - Export your full setup to a file and restore it later
  or move it to another computer.

## Personalization

New Tab is designed for people who care about how their browser feels. You can
keep it minimal with a few icons on a quiet background, or build a more detailed
dashboard with folders, pages, custom colors, and keyboard launch keys.

The settings panel is draggable, so you can move it out of the way while you are
adjusting the page. Most changes appear immediately, making it easy to tune the
layout without guessing.

## Privacy

New Tab has no account, analytics, advertising, tracking, or developer-operated
server. The developer does not receive or store your personal data.

Your shortcuts, settings, uploaded images, themes, and bookmark imports are
stored in your Chrome profile. Bookmark access is optional and begins only when
you click **Load Bookmarks**.

The extension makes limited HTTPS requests for user-facing features. Automatic
favicon retrieval sends only a shortcut's origin (never its path or query) to
Google's favicon service. Dashboard Icons, Google Fonts, and user-specified
image hosts are contacted only when those features are used. Search text is
sent by Chrome directly to the user's existing default search provider.

See the full [Privacy Policy](PRIVACY.md) for data handling, permissions, third
parties, and deletion details.

## Install

**From the Chrome Web Store:** [install New Tab](https://chromewebstore.google.com/detail/new-tab/ojemohmpkieofnihdnacicpeifnidjgi).

**From source:**

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.

## Built With

New Tab is built with plain HTML, CSS, and JavaScript. No framework, no build
step, and no account system.

The bundled Inter font is included under the SIL Open Font License. Dashboard
Icons are provided by the open-source Dashboard Icons project under Apache-2.0.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## Development Checks

There is no build step or dependency installation. Before packaging a release,
run:

```powershell
node --check validation.js
node --check script.js
node --test tests\validation.test.cjs
```

## License

See [LICENSE](LICENSE).

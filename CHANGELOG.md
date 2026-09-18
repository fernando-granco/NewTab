# Changelog

## 1.2.3 - 2026-09-17

- Made automatic favicons, Dashboard Icons, and Chrome's local favicon
  fallback opt-in permissions instead of install-time access.
- Added clear in-app controls and status for optional icon access.
- Kept cached icons local and available offline after optional access is
  revoked.
- Moved icon access controls to Data, added a Shortcuts link to them, and added
  a per-feature Revoke control plus a plain-language explanation before each
  Chrome permission prompt.
- Made that explanation an in-app confirmation so its Continue button reliably
  preserves the user gesture Chrome requires for the native permission prompt.

## 1.2.2 - 2026-09-15

- Fixed folder reflow so four shortcuts retain a stable 2 × 2 grid.
- Added live folder previews and optional per-folder overrides for placement,
  sizing, spacing, title position, opacity, and both backdrop and panel blur.
- Fixed numeric setting fields so values can be entered without intermediate
  keystrokes being clamped.

## 1.2.1 - 2026-09-01

- Added multiple shortcut pages with per-page layouts, navigation arrows,
  transition styles, and page indicators.
- Expanded folders with configurable placement, sizing, spacing, labels,
  opacity, and background blur.
- Added number-key shortcuts, a tile context menu, and more control over the
  **Open All** action.
- Added theme presets, saved themes, panel colors, editable gradients, label
  styling, tab title/favicon controls, and a customizable settings button.
- Added a toolbar popup that keeps Settings reachable when the on-page button
  is hidden.
- Added strict validation for saved data, backup imports, shortcut URLs,
  external images, uploaded files, and Google Fonts.
- Changed bookmark access to an optional permission requested only when the user
  starts a bookmark import.
- Limited favicon requests to shortcut origins and fixed stale cache pruning for
  shortcuts stored inside folders.
- Added an explicit Manifest V3 Content Security Policy and a public privacy
  policy aligned with the extension's actual network behavior.

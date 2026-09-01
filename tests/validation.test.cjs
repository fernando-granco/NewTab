'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('../validation.js');

const {
    faviconOrigin,
    normalizeGoogleFontStylesheetUrl,
    normalizeShortcutUrl,
    readStoredJson,
    sanitizeBackup,
    sanitizeSettings,
    sanitizeSites
} = globalThis.NewTabData;

const defaults = {
    pageCount: 1,
    colCount: 4,
    iconSize: 100,
    gridRowGap: 40,
    gridColGap: 40,
    gridVerticalOffset: 0,
    bgType: 'gradient',
    bgValue: '',
    tabFaviconSource: 'default',
    tabFaviconValue: '',
    searchIconStyle: 'none',
    searchIconValue: '',
    settingsIconSource: 'glyph',
    settingsIconValue: '',
    settingsIconGlyph: 'gear',
    fontSource: 'default',
    fontValue: '',
    gradientAngle: 'radial',
    openAllText: 'Open All Sites',
    tabTitle: 'New Tab',
    customCss: '',
    themes: [],
    pageOverrides: {}
};

test('shortcut URLs only allow ordinary web navigation', () => {
    assert.equal(normalizeShortcutUrl('example.com', true), 'https://example.com/');
    assert.equal(normalizeShortcutUrl('javascript:alert(1)'), null);
    assert.equal(normalizeShortcutUrl('https://user:pass@example.com'), null);
});

test('favicon requests disclose only the shortcut origin', () => {
    assert.equal(faviconOrigin('https://example.com/private/path?q=secret'), 'https://example.com');
});

test('Google font stylesheets are restricted to the documented endpoint', () => {
    assert.ok(normalizeGoogleFontStylesheetUrl('https://fonts.googleapis.com/css2?family=Roboto'));
    assert.equal(normalizeGoogleFontStylesheetUrl('https://example.com/font.css?family=Roboto'), null);
});

test('stored JSON corruption falls back without throwing', () => {
    const storage = { getItem: () => '{not json' };
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
        assert.deepEqual(readStoredJson(storage, 'sites', [{ id: 'safe' }]), [{ id: 'safe' }]);
    } finally {
        console.warn = originalWarn;
    }
});

test('site sanitization drops unsafe links and repairs duplicate IDs', () => {
    const sites = sanitizeSites([
        { id: 'same', name: 'Safe', url: 'https://example.com', iconSource: 'favicon' },
        { id: 'same', name: 'Unsafe', url: 'javascript:alert(1)', iconSource: 'favicon' },
        { id: 'same', name: 'Second', url: 'https://example.org', iconSource: 'favicon' }
    ]);
    assert.equal(sites.length, 2);
    assert.notEqual(sites[0].id, sites[1].id);
});

test('settings sanitization clamps layout and rejects hostile resources', () => {
    const result = sanitizeSettings({
        ...defaults,
        pageCount: 999,
        bgType: 'url',
        bgValue: 'javascript:alert(1)',
        fontSource: 'url',
        fontValue: 'https://evil.example/font.css?family=Bad'
    }, defaults);
    assert.equal(result.pageCount, 8);
    assert.equal(result.bgValue, '');
    assert.equal(result.fontSource, 'default');
});

test('backup validation rejects malformed shapes and sanitizes values', () => {
    assert.throws(() => sanitizeBackup({ sites: 'wrong', settings: {} }, defaults));
    const backup = sanitizeBackup({
        sites: [{ id: '1', name: 'Example', url: 'https://example.com', iconSource: 'favicon' }],
        settings: { ...defaults, pageCount: 3 },
        images: {}
    }, defaults);
    assert.equal(backup.sites.length, 1);
    assert.equal(backup.settings.pageCount, 3);
});

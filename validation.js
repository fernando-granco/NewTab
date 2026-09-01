'use strict';

/*
 * Validation for all persistent and imported data. Keeping this separate from
 * the UI makes the trust boundary easy to review and test: localStorage and
 * backup files are treated as untrusted input before they reach the DOM.
 */
globalThis.NewTabData = (() => {
    const MAX_TOP_LEVEL_ITEMS = 500;
    const MAX_TOTAL_SHORTCUTS = 1000;
    const MAX_THEMES = 50;
    const MAX_BACKUP_IMAGES = 64;
    const MAX_DATA_URL_LENGTH = 15 * 1024 * 1024;

    const ICON_SOURCES = new Set(['favicon', 'dashboardicons', 'url', 'file']);
    const SYSTEM_FONTS = new Set([
        'system-ui, sans-serif',
        "Georgia, 'Times New Roman', serif",
        "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        "ui-rounded, 'SF Pro Rounded', 'Segoe UI', sans-serif",
        "'Courier New', ui-monospace, monospace"
    ]);

    const ENUM_SETTINGS = {
        pageTransition: ['instant', 'fade', 'slide'],
        hotkeyScope: ['universal', 'page'],
        folderOpenStyle: ['around', 'anchored', 'center', 'custom'],
        folderTitle: ['top', 'bottom', 'hidden'],
        pageArrows: ['both', 'left', 'right', 'none'],
        pageArrowStyle: ['chevron', 'triangle', 'circle', 'square'],
        pageArrowPosition: ['edge', 'grid'],
        pageArrowAnchor: ['current', 'first', 'widest'],
        bgType: ['gradient', 'color', 'url', 'file'],
        iconShape: ['circle', 'square'],
        openAllShape: ['rounded', 'square', 'pill'],
        openAllPosition: ['bottom', 'top'],
        searchPosition: ['top', 'bottom'],
        searchIconStyle: ['glass', 'globe', 'dot', 'none', 'url', 'file'],
        tabFaviconSource: ['default', 'chrome', 'color', 'url', 'file'],
        fontSource: ['default', 'system', 'upload', 'url'],
        settingsIconPosition: ['top-right', 'top-left', 'bottom-left', 'bottom-right'],
        settingsIconSource: ['glyph', 'url', 'file']
    };

    const NUMBER_RANGES = {
        iconSize: [50, 300],
        gridRowGap: [0, 100],
        gridColGap: [0, 100],
        gridVerticalOffset: [-500, 500],
        colCount: [1, 10],
        pageCount: [1, 8],
        folderIconScale: [40, 100],
        folderCustomX: [0, 100],
        folderCustomY: [0, 100],
        folderCustomWidth: [200, 1200],
        folderCustomHeight: [160, 900],
        folderPadding: [0, 60],
        folderGap: [0, 60],
        folderOpacity: [20, 100],
        pageArrowSize: [20, 90],
        pageArrowOpacity: [10, 100],
        pageArrowGap: [0, 120],
        bgBlur: [0, 20],
        searchMargin: [0, 500],
        searchWidth: [240, 1000],
        searchHeight: [4, 30],
        searchTextSize: [12, 30],
        searchRadius: [0, 50],
        labelScale: [5, 30],
        labelWeight: [100, 900],
        settingsIconOpacity: [5, 100],
        settingsIconSize: [10, 60]
    };

    const COLOR_SETTINGS = new Set([
        'iconBgColor', 'openAllColor', 'accentColor', 'gradientColor1',
        'gradientColor2', 'labelColor', 'pageArrowColor'
    ]);

    const OPTIONAL_COLOR_SETTINGS = new Set([
        'panelBgColor', 'panelAltColor', 'panelTextColor', 'panelTabColor'
    ]);

    const THEME_KEYS = [
        'accentColor', 'iconShape', 'iconBgColor', 'showIconBg',
        'showLabels', 'labelScale', 'labelColor', 'labelWeight',
        'iconSize', 'gridRowGap', 'gridColGap', 'colCount', 'gridVerticalOffset',
        'bgType', 'bgValue', 'bgBlur', 'gradientColor1', 'gradientColor2',
        'gradientAngle', 'fontSource', 'fontValue', 'openAllColor', 'openAllShape'
    ];

    function isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function boundedString(value, fallback = '', maxLength = 500) {
        if (typeof value !== 'string') return fallback;
        return value.slice(0, maxLength);
    }

    function clampNumber(value, fallback, range = [-10000, 10000]) {
        if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
        return Math.max(range[0], Math.min(range[1], value));
    }

    function sanitizeColor(value, fallback = '#ffffff', allowEmpty = false) {
        if (allowEmpty && value === '') return '';
        return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    }

    function normalizeShortcutUrl(value, assumeHttps = false) {
        if (typeof value !== 'string') return null;
        let input = value.trim();
        if (!input) return null;
        if (assumeHttps && !/^[a-z][a-z0-9+.-]*:/i.test(input)) input = `https://${input}`;
        try {
            const parsed = new URL(input);
            if (!['http:', 'https:'].includes(parsed.protocol)) return null;
            if (parsed.username || parsed.password) return null;
            return parsed.href;
        } catch (error) {
            return null;
        }
    }

    function normalizeHttpsResourceUrl(value, allowedHosts = null) {
        if (typeof value !== 'string' || !value.trim()) return null;
        try {
            const parsed = new URL(value.trim());
            if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
            if (allowedHosts && !allowedHosts.includes(parsed.hostname.toLowerCase())) return null;
            return parsed.href;
        } catch (error) {
            return null;
        }
    }

    function normalizeGoogleFontStylesheetUrl(value) {
        const normalized = normalizeHttpsResourceUrl(value, ['fonts.googleapis.com']);
        if (!normalized) return null;
        const parsed = new URL(normalized);
        if (!/^\/css2?$/i.test(parsed.pathname) || !parsed.searchParams.get('family')) return null;
        return parsed.href;
    }

    function isSafeDataUrl(value, kind = 'image') {
        if (typeof value !== 'string' || value.length > MAX_DATA_URL_LENGTH) return false;
        if (kind === 'image') {
            return /^data:image\/(?:png|jpe?g|gif|webp|bmp|x-icon|vnd\.microsoft\.icon|svg\+xml);base64,/i.test(value);
        }
        if (kind === 'font') {
            return /^data:(?:font\/(?:woff2?|ttf|otf)|application\/(?:font-woff|font-sfnt|octet-stream|x-font-ttf|x-font-opentype));base64,/i.test(value);
        }
        return isSafeDataUrl(value, 'image') || isSafeDataUrl(value, 'font');
    }

    function faviconOrigin(value) {
        const normalized = normalizeShortcutUrl(value);
        if (!normalized) return null;
        return new URL(normalized).origin;
    }

    function sanitizeIcon(rawSource, rawValue) {
        const source = ICON_SOURCES.has(rawSource) ? rawSource : 'favicon';
        const value = typeof rawValue === 'string' ? rawValue : '';
        if (source === 'dashboardicons' && /^[a-z0-9][a-z0-9._-]{0,99}$/i.test(value)) {
            return { iconSource: source, iconValue: value.toLowerCase() };
        }
        if (source === 'url') {
            const normalized = normalizeHttpsResourceUrl(value);
            if (normalized) return { iconSource: source, iconValue: normalized };
        }
        if (source === 'file' && (isSafeDataUrl(value, 'image') || /^idb:[a-z0-9._:-]{1,100}$/i.test(value))) {
            return { iconSource: source, iconValue: value };
        }
        return { iconSource: 'favicon', iconValue: '' };
    }

    function sanitizeSites(value, fallback = []) {
        const source = Array.isArray(value) ? value : clone(fallback);
        const usedIds = new Set();
        let generatedId = 0;
        let shortcutCount = 0;

        const uniqueId = (raw) => {
            let id = boundedString(String(raw ?? ''), '', 100).trim();
            if (!id || usedIds.has(id)) {
                do { id = `item-${++generatedId}`; } while (usedIds.has(id));
            }
            usedIds.add(id);
            return id;
        };

        const sanitizeShortcut = (raw) => {
            if (!isPlainObject(raw) || shortcutCount >= MAX_TOTAL_SHORTCUTS) return null;
            const url = normalizeShortcutUrl(raw.url);
            if (!url) return null;
            shortcutCount++;
            const icon = sanitizeIcon(raw.iconSource, raw.iconValue);
            let name = boundedString(raw.name, '', 120).trim();
            if (!name) name = new URL(url).hostname;
            return {
                id: uniqueId(raw.id),
                name,
                url,
                color: sanitizeColor(raw.color, '#ffffff'),
                ...icon,
                excludeFromOpenAll: raw.excludeFromOpenAll === true,
                hotkey: /^[1-9]$/.test(String(raw.hotkey || '')) ? String(raw.hotkey) : '',
                page: Math.round(clampNumber(raw.page, 0, [0, 7]))
            };
        };

        const output = [];
        for (const raw of source.slice(0, MAX_TOP_LEVEL_ITEMS)) {
            if (!isPlainObject(raw)) continue;
            if (raw.type === 'folder') {
                const children = [];
                const rawChildren = Array.isArray(raw.children) ? raw.children : [];
                for (const child of rawChildren) {
                    const sanitized = sanitizeShortcut(child);
                    if (sanitized) children.push(sanitized);
                }
                output.push({
                    id: uniqueId(raw.id),
                    type: 'folder',
                    name: boundedString(raw.name, 'Folder', 120).trim() || 'Folder',
                    color: sanitizeColor(raw.color, '#ffffff'),
                    page: Math.round(clampNumber(raw.page, 0, [0, 7])),
                    children
                });
            } else {
                const sanitized = sanitizeShortcut(raw);
                if (sanitized) output.push(sanitized);
            }
        }
        return output;
    }

    function sanitizeSettings(value, defaults) {
        const raw = isPlainObject(value) ? value : {};
        const result = clone(defaults);

        for (const key of Object.keys(defaults)) {
            const candidate = raw[key];
            if (typeof defaults[key] === 'boolean' && typeof candidate === 'boolean') result[key] = candidate;
            if (typeof defaults[key] === 'number') {
                result[key] = clampNumber(candidate, defaults[key], NUMBER_RANGES[key]);
            }
            if (typeof defaults[key] === 'string' && typeof candidate === 'string') {
                const limit = key === 'customCss' ? 100000 : (key.endsWith('Value') ? MAX_DATA_URL_LENGTH : 2000);
                result[key] = boundedString(candidate, defaults[key], limit);
            }
        }

        for (const [key, choices] of Object.entries(ENUM_SETTINGS)) {
            if (!choices.includes(result[key])) result[key] = defaults[key];
        }
        for (const key of COLOR_SETTINGS) result[key] = sanitizeColor(result[key], defaults[key]);
        for (const key of OPTIONAL_COLOR_SETTINGS) result[key] = sanitizeColor(result[key], '', true);

        result.pageCount = Math.round(result.pageCount);
        result.colCount = Math.round(result.colCount);
        result.openAllText = boundedString(result.openAllText, defaults.openAllText, 80);
        result.tabTitle = boundedString(result.tabTitle, defaults.tabTitle, 120);
        result.settingsIconGlyph = boundedString(result.settingsIconGlyph, defaults.settingsIconGlyph, 8);
        result.customCss = boundedString(result.customCss, '', 100000);
        if (/@import\b|url\s*\(/i.test(result.customCss)) result.customCss = '';
        result.gradientAngle = result.gradientAngle === 'radial'
            ? 'radial'
            : String(Math.round(clampNumber(Number(result.gradientAngle), 135, [0, 360])));

        if (result.bgType === 'color') result.bgValue = sanitizeColor(result.bgValue, '#1a1a1a');
        else if (result.bgType === 'url') result.bgValue = normalizeHttpsResourceUrl(result.bgValue) || '';
        else if (result.bgType === 'file') {
            if (!isSafeDataUrl(result.bgValue, 'image') && !/^idb:[a-z0-9._:-]{1,100}$/i.test(result.bgValue)) result.bgValue = '';
        } else result.bgValue = '';

        const sanitizeImageSetting = (sourceKey, valueKey, urlValue, fileValue) => {
            if (result[sourceKey] === urlValue) result[valueKey] = normalizeHttpsResourceUrl(result[valueKey]) || '';
            else if (result[sourceKey] === fileValue) {
                if (!isSafeDataUrl(result[valueKey], 'image') && !/^idb:[a-z0-9._:-]{1,100}$/i.test(result[valueKey])) result[valueKey] = '';
            } else if (valueKey !== 'tabFaviconValue' || result[sourceKey] !== 'color') result[valueKey] = '';
        };
        sanitizeImageSetting('searchIconStyle', 'searchIconValue', 'url', 'file');
        sanitizeImageSetting('settingsIconSource', 'settingsIconValue', 'url', 'file');
        sanitizeImageSetting('tabFaviconSource', 'tabFaviconValue', 'url', 'file');
        if (result.tabFaviconSource === 'color') result.tabFaviconValue = sanitizeColor(result.tabFaviconValue, '#3f51b5');

        if (result.fontSource === 'system') {
            if (!SYSTEM_FONTS.has(result.fontValue)) result.fontValue = defaults.fontValue;
        } else if (result.fontSource === 'url') {
            result.fontValue = normalizeGoogleFontStylesheetUrl(result.fontValue) || '';
            if (!result.fontValue) result.fontSource = 'default';
        } else if (result.fontSource === 'upload') {
            if (!isSafeDataUrl(result.fontValue, 'font') && !/^idb:[a-z0-9._:-]{1,100}$/i.test(result.fontValue)) {
                result.fontSource = 'default';
                result.fontValue = '';
            }
        } else result.fontValue = '';

        result.pageOverrides = {};
        if (isPlainObject(raw.pageOverrides)) {
            for (const [page, override] of Object.entries(raw.pageOverrides)) {
                if (!/^[0-7]$/.test(page) || !isPlainObject(override)) continue;
                const clean = {};
                for (const key of ['iconSize', 'gridRowGap', 'gridColGap', 'gridVerticalOffset', 'colCount']) {
                    if (typeof override[key] === 'number' && Number.isFinite(override[key])) {
                        clean[key] = Math.round(clampNumber(override[key], defaults[key], NUMBER_RANGES[key]));
                    }
                }
                if (Object.keys(clean).length) result.pageOverrides[page] = clean;
            }
        }

        result.themes = [];
        if (Array.isArray(raw.themes)) {
            for (const theme of raw.themes.slice(0, MAX_THEMES)) {
                if (!isPlainObject(theme) || !isPlainObject(theme.data)) continue;
                const normalizedTheme = sanitizeSettings({ ...defaults, ...theme.data, themes: [], pageOverrides: {} }, defaults);
                const data = {};
                for (const key of THEME_KEYS) {
                    if (Object.prototype.hasOwnProperty.call(theme.data, key)) data[key] = normalizedTheme[key];
                }
                result.themes.push({
                    name: boundedString(theme.name, 'Theme', 80).trim() || 'Theme',
                    data
                });
            }
        }
        return result;
    }

    function sanitizeBackup(value, defaults) {
        if (!isPlainObject(value) || !Array.isArray(value.sites) || !isPlainObject(value.settings)) {
            throw new Error('Backup must contain sites and settings.');
        }
        const sites = sanitizeSites(value.sites, []);
        if (value.sites.length && !sites.length) throw new Error('Backup contains no valid web shortcuts.');
        const settings = sanitizeSettings(value.settings, defaults);
        const images = {};
        let imageCount = 0;
        let totalLength = 0;
        if (value.images !== undefined && !isPlainObject(value.images)) throw new Error('Backup images must be an object.');
        for (const [key, dataUrl] of Object.entries(value.images || {})) {
            if (imageCount >= MAX_BACKUP_IMAGES) break;
            if (!/^idb:[a-z0-9._:-]{1,100}$/i.test(key) || !isSafeDataUrl(dataUrl, 'any')) continue;
            totalLength += dataUrl.length;
            if (totalLength > MAX_DATA_URL_LENGTH) throw new Error('Backup images are too large.');
            images[key] = dataUrl;
            imageCount++;
        }
        return { sites, settings, images };
    }

    function readStoredJson(storage, key, fallback) {
        const raw = storage.getItem(key);
        if (raw === null) return clone(fallback);
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn(`Ignoring invalid saved ${key}: ${error.message}`);
            return clone(fallback);
        }
    }

    return {
        THEME_KEYS,
        faviconOrigin,
        isSafeDataUrl,
        normalizeGoogleFontStylesheetUrl,
        normalizeHttpsResourceUrl,
        normalizeShortcutUrl,
        readStoredJson,
        sanitizeBackup,
        sanitizeSettings,
        sanitizeSites
    };
})();

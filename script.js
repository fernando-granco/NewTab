/* =========================================================================
 * New Tab — main script
 * =========================================================================
 * How this file is organized (top to bottom):
 *
 *   1. Default data & state ......... the sites, the settings, the caches
 *   2. DOM element lookups .......... every input/button the UI talks to
 *   3. Utilities .................... image resizing, IndexedDB helpers
 *   4. Shortcut icons ............... the offline-first icon pipeline
 *   5. Initialization & saving ...... init(), saveState(), applySettings()
 *   6. Grid rendering ............... renderGrid() + drag-and-drop reorder
 *   7. Settings UI .................. modals, tabs, bookmarks, backup
 *
 * Storage at a glance:
 *   - localStorage ........ sites list + settings (small, read synchronously
 *                           so the grid can paint immediately)
 *   - IndexedDB ........... images: uploaded icons, backgrounds, and the
 *                           favicon cache (preloaded into `imageCache`
 *                           before first paint)
 * ========================================================================= */

// Default Data
const defaultSites = [
    { id: '1', name: 'Whatsapp', url: 'https://web.whatsapp.com', color: '#25D366', iconSource: 'favicon' },
    { id: '2', name: 'Gmail', url: 'https://mail.google.com', color: '#ffffff', iconSource: 'favicon' },
    { id: '3', name: 'Youtube', url: 'https://www.youtube.com', color: '#FF0000', iconSource: 'favicon' },
    { id: '4', name: 'Facebook', url: 'https://www.facebook.com', color: '#1877F2', iconSource: 'favicon' },
    { id: '5', name: 'LinkedIn', url: 'https://www.linkedin.com', color: '#0A66C2', iconSource: 'favicon' },
    { id: '6', name: 'Twitter', url: 'https://twitter.com', color: '#1DA1F2', iconSource: 'favicon' },
    { id: '7', name: 'Reddit', url: 'https://www.reddit.com', color: '#FF4500', iconSource: 'favicon' },
    { id: '8', name: 'Amazon', url: 'https://www.amazon.com', color: '#ffffff', iconSource: 'favicon' },
];

const defaultSettings = {
    iconSize: 100,
    gridRowGap: 40,
    gridColGap: 40,
    gridVerticalOffset: 0,
    colCount: 4, // Default to 4
    pageCount: 1, // number of shortcut pages (1 = the original single page)
    pageTransition: 'instant', // 'instant' | 'fade' | 'slide' when switching pages
    enableNumberKeys: true, // press 1-9 to open the shortcut assigned that digit
    hotkeyScope: 'universal', // 'universal' (one map) or 'page' (per-page digits)
    showHotkeyBadge: true, // show the little number badge on assigned tiles
    folderOpenStyle: 'around', // 'around' (wraps the icon), 'anchored' (beside it), 'center', or 'custom'
    folderIconScale: 75, // size of icons inside a folder, as a % of normal icon size
    // Used only by the 'custom' style. X/Y are percentages of the free space,
    // so 0 = flush left/top, 50 = centred, 100 = flush right/bottom.
    folderCustomX: 50,
    folderCustomY: 50,
    folderCustomWidth: 420,
    folderCustomHeight: 320,
    // Folder appearance
    folderPadding: 20,        // px of empty space around the icons in a folder
    folderGap: 20,            // px between icons inside a folder
    folderTitle: 'top',       // 'top' | 'bottom' | 'hidden'
    folderOpacity: 100,       // folder panel background opacity, %
    folderBlur: false,        // frost the page behind an open folder
    // Page navigation arrows
    pageArrows: 'both',       // 'both' | 'left' | 'right' | 'none'
    pageArrowStyle: 'chevron',// 'chevron' | 'triangle' | 'circle' | 'square'
    pageArrowColor: '#ffffff',
    pageArrowSize: 40,        // px
    pageArrowOpacity: 45,     // % when idle (full opacity on hover)
    pageArrowPosition: 'edge',// 'edge' (screen sides) or 'grid' (beside the icons)
    pageArrowGap: 16,         // px between the arrow and the screen edge / icons
    pageArrowAnchor: 'current',// 'current' page, 'first' page, or the 'widest' page
    showPageDots: true,
    // Per-page layout overrides: { '1': { iconSize: 120, colCount: 6, ... } }
    pageOverrides: {},
    enableContextMenu: true, // right-click a tile for quick actions
    confirmOpenAll: true, // ask before opening many tabs via "Open All"
    bgType: 'gradient', // gradient, color, url, file
    bgValue: '',
    bgBlur: 0,
    showIconBg: false,
    iconShape: 'circle', // circle, square
    iconBgColor: '#ffffff',
    showLabels: true,
    showOpenAll: false, // Default hidden
    openAllText: 'Open All Sites',
    openAllColor: '#3f51b5',
    openAllShape: 'pill', // rounded, square, pill
    openAllPosition: 'bottom', // bottom, top
    showSearch: false,
    searchPosition: 'top', // top, bottom
    searchIconStyle: 'none', // glass, globe, dot, none, url, file
    searchIconValue: '',
    searchMargin: 20,
    searchWidth: 600,   // max width of the bar in px
    searchHeight: 10,   // vertical padding in px (taller bar = bigger number)
    searchTextSize: 18, // input text size in px
    searchRadius: 50,   // corner radius in px (0 = squared, 50 = pill)
    openShortcutsNewTab: false,
    openSearchNewTab: false,
    tabTitle: 'New Tab',
    tabFaviconSource: 'default', // default, color, url, file
    tabFaviconValue: '',
    fontSource: 'default', // default (bundled Inter), system, upload, url
    fontValue: '', // system: a CSS font stack | upload: an 'idb:' key | url: a Google Fonts URL

    // --- Appearance (all defaults below reproduce the original look exactly) ---
    accentColor: '#3f51b5',   // recolors buttons, sliders, search focus, focus rings
    gradientColor1: '#2a2a2a', // "Default Gradient" inner color
    gradientColor2: '#111111', // "Default Gradient" outer color
    gradientAngle: 'radial',   // 'radial', or a number of degrees for a linear gradient
    labelScale: 14,            // label font size as a % of icon size (14 == the original)
    labelColor: '#eeeeee',     // label text color
    labelWeight: 500,          // label font weight
    customCss: '',             // advanced local CSS; remote @import/url() resources are blocked
    // Settings window colors
    // Panel colors are overrides: empty means "use the built-in color, and
    panelBgColor: '',          // main panel surface
    panelAltColor: '',         // sidebar + collapsible section backgrounds
    panelTextColor: '',        // panel text
    panelTabColor: '',         // highlight behind the selected tab (accent by default)
    // The gear button that opens this window
    settingsIconPosition: 'top-right', // top-right | top-left | bottom-left | bottom-right
    settingsIconSource: 'glyph', // glyph | url | file
    settingsIconGlyph: '\u2699\uFE0F',
    settingsIconValue: '',     // image URL, or an uploaded image as a data URL
    settingsIconOpacity: 30,   // % when idle
    settingsIconSize: 25,      // reference px (converted to vmin like everything else)
    settingsIconHidden: false, // fully invisible but still clickable
    themes: []                 // user-saved theme snapshots: [{ name, data:{...} }]
};

const {
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
} = globalThis.NewTabData;

// State
let sites = sanitizeSites(readStoredJson(localStorage, 'sites', defaultSites), defaultSites);
let settings = sanitizeSettings(readStoredJson(localStorage, 'settings', defaultSettings), defaultSettings);
const imageCache = {}; // Pre-load IDB images for synchronous rendering

// Elements
const grid = document.getElementById('grid');
const bg = document.getElementById('bg');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const shortcutModal = document.getElementById('shortcutModal');
const closeShortcut = document.getElementById('closeShortcut');
const addShortcutBtn = document.getElementById('addShortcutBtn');
const autoMatchIconsBtn = document.getElementById('autoMatchIconsBtn');
const shortcutsList = document.getElementById('shortcutsList');
const contentWrapper = document.getElementById('contentWrapper');

// Inputs - Layout
const iconSizeInput = document.getElementById('iconSize');
const iconSizeValInput = document.getElementById('iconSizeValInput');
const colCountInputEl = document.getElementById('colCount');
const colCountValInput = document.getElementById('colCountValInput');
const showIconBgInput = document.getElementById('showIconBg');
const iconShapeInput = document.getElementById('iconShape');
const iconBgColorInput = document.getElementById('iconBgColor');
const showLabelsInput = document.getElementById('showLabels');
const openShortcutsNewTabInput = document.getElementById('openShortcutsNewTab');
const gridRowGapInput = document.getElementById('gridRowGap');
const gridRowGapValInput = document.getElementById('gridRowGapValInput');
const gridColGapInput = document.getElementById('gridColGap');
const gridColGapValInput = document.getElementById('gridColGapValInput');
const gridOffsetInput = document.getElementById('gridOffset');
const gridOffsetValInput = document.getElementById('gridOffsetValInput');

// Inputs - Font
const fontSourceInput = document.getElementById('fontSource');
const fontSystemSelect = document.getElementById('fontSystemSelect');
const fontUploadInput = document.getElementById('fontFileInput');
const fontUrlInput = document.getElementById('fontUrlInput');
const fontSystemGroup = document.getElementById('fontSystemGroup');
const fontUploadGroup = document.getElementById('fontUploadGroup');
const fontUrlGroup = document.getElementById('fontUrlGroup');

// Inputs - Labels
const labelScaleInput = document.getElementById('labelScale');
const labelScaleValInput = document.getElementById('labelScaleValInput');
const labelColorInput = document.getElementById('labelColor');
const labelWeightInput = document.getElementById('labelWeight');
const labelSettingsGroup = document.getElementById('labelSettingsGroup');

// Inputs - Theme
const accentColorInput = document.getElementById('accentColor');
const panelBgColorInput = document.getElementById('panelBgColor');
const panelAltColorInput = document.getElementById('panelAltColor');
const panelTextColorInput = document.getElementById('panelTextColor');
const panelTabColorInput = document.getElementById('panelTabColor');
const settingsIconSourceInput = document.getElementById('settingsIconSource');
const settingsIconUrlInput = document.getElementById('settingsIconUrlInput');
const settingsIconFileInput = document.getElementById('settingsIconFileInput');
const settingsIconGlyphGroup = document.getElementById('settingsIconGlyphGroup');
const settingsIconUrlGroup = document.getElementById('settingsIconUrlGroup');
const settingsIconFileGroup = document.getElementById('settingsIconFileGroup');
const settingsIconPositionInput = document.getElementById('settingsIconPosition');
const settingsIconGlyphInput = document.getElementById('settingsIconGlyph');
const settingsIconHiddenInput = document.getElementById('settingsIconHidden');
const customCssInput = document.getElementById('customCssInput');
const themeNameInput = document.getElementById('themeNameInput');
const themeSaveBtn = document.getElementById('themeSaveBtn');
const themePresetsContainer = document.getElementById('themePresets');
const savedThemesList = document.getElementById('savedThemesList');

// Inputs - Gradient editor
const gradColor1Input = document.getElementById('gradColor1');
const gradColor2Input = document.getElementById('gradColor2');
const gradAngleInput = document.getElementById('gradAngle');
const bgGradientGroup = document.getElementById('bgGradientGroup');

// Inputs - Search
const showSearchInput = document.getElementById('showSearch');
const searchPositionInput = document.getElementById('searchPosition');
const searchWrapper = document.getElementById('searchWrapper');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const searchIconStyleInput = document.getElementById('searchIconStyle');
const searchIconUrlInput = document.getElementById('searchIconUrlInput');
const searchIconFileInput = document.getElementById('searchIconFileInput');
const searchIconUrlGroup = document.getElementById('searchIconUrlGroup');
const searchIconFileGroup = document.getElementById('searchIconFileGroup');
const searchMarginInput = document.getElementById('searchMargin');
const searchMarginValInput = document.getElementById('searchMarginValInput');
const searchWidthInput = document.getElementById('searchWidth');
const searchWidthValInput = document.getElementById('searchWidthValInput');
const searchHeightInput = document.getElementById('searchHeight');
const searchHeightValInput = document.getElementById('searchHeightValInput');
const searchTextSizeInput = document.getElementById('searchTextSize');
const searchTextSizeValInput = document.getElementById('searchTextSizeValInput');
const searchRadiusInput = document.getElementById('searchRadius');
const searchRadiusValInput = document.getElementById('searchRadiusValInput');
const openSearchNewTabInput = document.getElementById('openSearchNewTab');

// Inputs - Background
const bgTypeInput = document.getElementById('bgType');
const bgColorInput = document.getElementById('bgColor');
const bgUrlInput = document.getElementById('bgUrlInput');
const bgFileInput = document.getElementById('bgFileInput');
const bgBlurInput = document.getElementById('bgBlur');
const bgBlurValInput = document.getElementById('bgBlurValInput');
const bgColorGroup = document.getElementById('bgColorGroup');
const bgUrlGroup = document.getElementById('bgUrlGroup');
const bgFileGroup = document.getElementById('bgFileGroup');

// Inputs - Tab Customization
const tabTitleInput = document.getElementById('tabTitleInput');
const tabFaviconSourceInput = document.getElementById('tabFaviconSource');
const tabFaviconColorInput = document.getElementById('tabFaviconColor');
const tabFaviconUrlInput = document.getElementById('tabFaviconUrlInput');
const tabFaviconFileInput = document.getElementById('tabFaviconFileInput');
const tabFaviconColorGroup = document.getElementById('tabFaviconColorGroup');
const tabFaviconUrlGroup = document.getElementById('tabFaviconUrlGroup');
const tabFaviconFileGroup = document.getElementById('tabFaviconFileGroup');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Form Inputs - Shortcut Modal
const shortcutForm = document.getElementById('shortcutForm');
const siteNameInput = document.getElementById('siteName');
const siteUrlInput = document.getElementById('siteUrl');
const iconSourceInput = document.getElementById('iconSource');
const iconDashboardGroup = document.getElementById('iconDashboardGroup');
const iconDashboardInput = document.getElementById('iconDashboardInput');
const iconUrlGroup = document.getElementById('iconUrlGroup');
const iconFileGroup = document.getElementById('iconFileGroup');
const iconUrlInput = document.getElementById('iconUrlInput');
const iconFileInput = document.getElementById('iconFileInput');
const siteColorInput = document.getElementById('siteColor');
const excludeFromOpenAllInput = document.getElementById('excludeFromOpenAll');
const editIdInput = document.getElementById('editId');
const shortcutModalTitle = document.getElementById('shortcutModalTitle');

// Inputs - Backup
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const importDataInput = document.getElementById('importDataInput');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');

// Inputs - Pages / folders / interaction
const pageMinusBtn = document.getElementById('pageMinus');
const pagePlusBtn = document.getElementById('pagePlus');
const pageCountDisplay = document.getElementById('pageCountDisplay');
const pageTransitionInput = document.getElementById('pageTransition');
const enableNumberKeysInput = document.getElementById('enableNumberKeys');
const hotkeyScopeInput = document.getElementById('hotkeyScope');
const showHotkeyBadgeInput = document.getElementById('showHotkeyBadge');
const folderOpenStyleInput = document.getElementById('folderOpenStyle');
const folderCustomGroup = document.getElementById('folderCustomGroup');
const folderTitleInput = document.getElementById('folderTitle');
const folderBlurInput = document.getElementById('folderBlur');
const pageArrowsInput = document.getElementById('pageArrows');
const pageArrowStyleInput = document.getElementById('pageArrowStyle');
const pageArrowPositionInput = document.getElementById('pageArrowPosition');
const pageArrowAnchorInput = document.getElementById('pageArrowAnchor');
const pageArrowAnchorGroup = document.getElementById('pageArrowAnchorGroup');
const pageArrowColorInput = document.getElementById('pageArrowColor');
const pageArrowOptions = document.getElementById('pageArrowOptions');
const showPageDotsInput = document.getElementById('showPageDots');
const pagePrevBtn = document.getElementById('pagePrev');
const pageNextBtn = document.getElementById('pageNext');
const layoutScopeBar = document.getElementById('layoutScopeBar');
const layoutScopeInput = document.getElementById('layoutScope');
const layoutScopeClearBtn = document.getElementById('layoutScopeClear');
const matchThisIconBtn = document.getElementById('matchThisIconBtn');
const enableContextMenuInput = document.getElementById('enableContextMenu');
const confirmOpenAllInput = document.getElementById('confirmOpenAll');
const pageDots = document.getElementById('pageDots');
const tileMenu = document.getElementById('tileMenu');
const addFolderBtn = document.getElementById('addFolderBtn');
const sitePageInput = document.getElementById('sitePage');
const siteFolderInput = document.getElementById('siteFolder');
const siteHotkeyInput = document.getElementById('siteHotkey');
const folderModal = document.getElementById('folderModal');
const folderModalTitle = document.getElementById('folderModalTitle');
const folderGrid = document.getElementById('folderGrid');
const folderClose = document.getElementById('folderClose');
// Folder add/edit modal
const folderEditModal = document.getElementById('folderEditModal');
const folderEditForm = document.getElementById('folderEditForm');
const folderEditId = document.getElementById('folderEditId');
const folderEditName = document.getElementById('folderEditName');
const folderEditColor = document.getElementById('folderEditColor');
const folderEditTitle = document.getElementById('folderEditTitle');
const folderEditClose = document.getElementById('folderEditClose');

// Inputs - Bookmarks
const bookmarkFoldersSort = document.getElementById('bookmarkFolders');
const importBookmarksBtn = document.getElementById('importBookmarksBtn');

// UI Elements - Open All
const showOpenAllInput = document.getElementById('showOpenAll');
const openAllTextInput = document.getElementById('openAllText');
const openAllColorInput = document.getElementById('openAllColor');
const openAllShapeInput = document.getElementById('openAllShape');
const openAllPositionInput = document.getElementById('openAllPosition');
const openAllWrapper = document.getElementById('openAllWrapper');
const openAllBtn = document.getElementById('openAllBtn');

// --- Utilities ---

function resizeImage(dataUrl, maxSize = 256, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height *= maxSize / width));
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width *= maxSize / height));
                    height = maxSize;
                }
            }
            if (width === img.width && height === img.height) {
                resolve(dataUrl); // No resize needed
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            // use webp for better compression
            resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = () => reject(new Error('Failed to load image for resizing.'));
        img.src = dataUrl;
    });
}

const DB_NAME = 'NewTabDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveImageToDB(key, dataUrl) {
    imageCache[key] = dataUrl;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(dataUrl, key);
        tx.oncomplete = () => resolve(key);
        tx.onerror = () => reject(tx.error);
    });
}

async function loadImageFromDB(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(tx.error);
    });
}

async function deleteImageFromDB(key) {
    delete imageCache[key];
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getAllImagesFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        const keysReq = store.getAllKeys();
        
        tx.oncomplete = () => {
            const result = {};
            keysReq.result.forEach((key, i) => {
                result[key] = req.result[i];
            });
            resolve(result);
        };
        tx.onerror = () => reject(tx.error);
    });
}

// --- One-time migrations from older versions ---
// Early versions stored uploaded images in IndexedDB and kept an 'idb:...'
// reference in the site/setting. Today the (compact, resized) image lives
// directly in the value. This converts any leftover old-style references
// once, then cleans up the orphaned IndexedDB entry.

// Returns the migrated value, or null if `value` wasn't an old-style reference.
async function inlineOldIdbImage(value, maxSize, quality) {
    if (!value || !value.startsWith('idb:')) return null;
    try {
        const dataUrl = await loadImageFromDB(value);
        if (!dataUrl) return null;
        const inlined = await resizeImage(dataUrl, maxSize, quality);
        await deleteImageFromDB(value).catch(() => {});
        return inlined;
    } catch (e) {
        return null;
    }
}

async function handleStorageMigrations() {
    let saveNeeded = false;

    for (const site of getAllShortcuts()) {
        if (site.iconSource !== 'file') continue;
        const migrated = await inlineOldIdbImage(site.iconValue, 256);
        if (migrated) { site.iconValue = migrated; saveNeeded = true; }
    }

    if (settings.searchIconStyle === 'file') {
        const migrated = await inlineOldIdbImage(settings.searchIconValue, 256);
        if (migrated) { settings.searchIconValue = migrated; saveNeeded = true; }
    }

    if (settings.tabFaviconSource === 'file') {
        const migrated = await inlineOldIdbImage(settings.tabFaviconValue, 256);
        if (migrated) { settings.tabFaviconValue = migrated; saveNeeded = true; }
    }

    if (settings.bgType === 'file' && settings.bgValue) {
        const migrated = await inlineOldIdbImage(settings.bgValue, 3840, 0.95);
        if (migrated) {
            settings.bgValue = migrated;
            saveNeeded = true;
        } else if (settings.bgValue.startsWith('data:image/') && !settings.bgValue.startsWith('data:image/webp')) {
            // Older versions stored backgrounds as bulky PNG/JPEG data URLs;
            // re-encode once as webp to free up localStorage space.
            settings.bgValue = await resizeImage(settings.bgValue, 3840, 0.95);
            saveNeeded = true;
        }
    }

    if (saveNeeded) saveState();
    return saveNeeded;
}

// =========================================================================
// Shortcut icons — how a shortcut gets its picture
// =========================================================================
// Every shortcut tries these sources in order, stopping at the first one
// that works. The goal: icons paint instantly, look sharp on 4K screens,
// and NEVER show up blank — even with no internet at all.
//
//   1. Our own cache (IndexedDB) — saved the first time the icon loaded.
//      Instant and fully offline.
//   2. The remote source (Google's favicon service at 256px, or the
//      DashboardIcons CDN). On success it is saved into the cache, so this
//      network trip happens only once per icon.
//   3. Chrome's built-in favicon store ("favicon" permission) — the icon
//      Chrome itself saved when you visited the site. Local, offline.
//   4. A generated letter tile (the site's first letter on its color).
//      Built in-memory, so it always works.
//
// Note: step 2 only works because manifest.json declares host_permissions
// for the two icon hosts. Without that, the fetch is blocked by CORS and
// the cache silently never fills (the original offline-icons bug).

const FAV_PREFIX = 'favcache:';
const inFlightIconFetches = new Set();

function getRemoteIconUrl(site) {
    if (site.iconSource === 'dashboardicons' && site.iconValue) {
        return `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${site.iconValue}.svg`;
    }
    // Google's favicon service, asked directly at its real address
    // (www.google.com/s2/favicons just redirects here — skipping the redirect
    // saves a round trip). size=256 keeps icons crisp on 4K monitors;
    // Google serves the largest version the site actually has.
    const origin = faviconOrigin(site.url);
    if (!origin) return null;
    return 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL' +
        `&url=${encodeURIComponent(origin)}&size=256`;
}

// Chrome's own favicon store. It holds icons for every site the user has
// visited, entirely on disk — perfect as an offline fallback.
function getChromeFaviconUrl(pageUrl) {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getURL) return null;
    return chrome.runtime.getURL('/_favicon/') +
        `?pageUrl=${encodeURIComponent(pageUrl)}&size=64`;
}

// Last-resort icon: the site's first letter on its accent color.
// Drawn as an SVG data URL, so it is crisp at any size and needs no network.
function createLetterTile(site) {
    const letter = (site.name || '?').trim().charAt(0).toUpperCase() || '?';
    const useSiteColor = site.color && site.color.toLowerCase() !== '#ffffff';
    const background = useSiteColor ? site.color : '#5c6bc0';
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">` +
        `<rect width="128" height="128" fill="${background}"/>` +
        `<text x="64" y="68" fill="#ffffff" font-family="Inter, Arial, sans-serif" ` +
        `font-size="64" font-weight="600" text-anchor="middle" dominant-baseline="middle">${letter}</text>` +
        `</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Wire up an <img> so that if its current source fails to load, it quietly
// moves on to the next one in the list. The letter tile goes last and is
// stretched to fill the icon shape.
function setIconFallbackChain(img, fallbackSources) {
    img.onerror = () => {
        const next = fallbackSources.shift();
        if (!next) {
            img.onerror = null; // Nothing left to try; stop to avoid loops.
            return;
        }
        if (fallbackSources.length === 0) img.classList.add('full-fill'); // letter tile
        img.src = next;
    };
}

// Pick the best source for a shortcut's <img> (see the ordered list above).
function setShortcutIcon(img, site) {
    img.referrerPolicy = 'no-referrer';
    // Custom icons (a pasted URL or an uploaded file) have one true source;
    // if it breaks, fall straight back to the letter tile.
    if ((site.iconSource === 'url' || site.iconSource === 'file') && site.iconValue) {
        img.className = 'full-fill';
        setIconFallbackChain(img, [createLetterTile(site)]);
        img.src = site.iconValue.startsWith('idb:')
            ? (imageCache[site.iconValue] || '')
            : site.iconValue;
        return;
    }

    const remoteUrl = getRemoteIconUrl(site);
    const cached = remoteUrl ? imageCache[FAV_PREFIX + remoteUrl] : null;
    const chromeFavicon = getChromeFaviconUrl(site.url);
    const fallbacks = [];

    if (cached) {
        fallbacks.push(createLetterTile(site));
        setIconFallbackChain(img, fallbacks);
        img.src = cached; // The happy path: instant, offline, high-res.
    } else if (remoteUrl && navigator.onLine) {
        if (chromeFavicon) fallbacks.push(chromeFavicon);
        fallbacks.push(createLetterTile(site));
        setIconFallbackChain(img, fallbacks);
        img.src = remoteUrl;                                  // Show it now...
        cacheRemoteIcon(FAV_PREFIX + remoteUrl, remoteUrl);   // ...cache it for next time.
    } else if (chromeFavicon) {
        fallbacks.push(createLetterTile(site));
        setIconFallbackChain(img, fallbacks);
        img.src = chromeFavicon; // Offline with nothing cached yet: use Chrome's copy.
    } else {
        img.src = createLetterTile(site);
        img.classList.add('full-fill');
        return;
    }

}

// Download a remote icon once and store it in IndexedDB as a data URL.
// From then on the icon paints from disk, even with no internet.
async function cacheRemoteIcon(cacheKey, url) {
    if (imageCache[cacheKey] || inFlightIconFetches.has(cacheKey)) return;
    inFlightIconFetches.add(cacheKey);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(url, {
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            signal: controller.signal
        });
        if (!res.ok) return;
        const declaredSize = Number(res.headers.get('content-length')) || 0;
        if (declaredSize > 2 * 1024 * 1024) return;
        const blob = await res.blob();
        if (!blob.type.startsWith('image/') || blob.size > 2 * 1024 * 1024) return;
        const dataUrl = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(blob);
        });
        // Keep SVGs verbatim (they scale forever); cap raster icons at 256px,
        // which matches the largest size the grid can display on 4K.
        const finalUrl = (blob.type.includes('svg') || dataUrl.length < 4000)
            ? dataUrl
            : await resizeImage(dataUrl, 256).catch(() => dataUrl);
        await saveImageToDB(cacheKey, finalUrl);
    } catch (e) {
        // Network failure — the <img> fallback chain already covers the screen.
    } finally {
        clearTimeout(timeout);
        inFlightIconFetches.delete(cacheKey);
    }
}

// Drop cached icons for sites that no longer exist (e.g. after a URL edit).
async function pruneIconCache() {
    try {
        const wanted = new Set(getAllShortcuts().map(getRemoteIconUrl).filter(Boolean).map(u => FAV_PREFIX + u));
        const all = await getAllImagesFromDB();
        for (const key of Object.keys(all)) {
            if (key.startsWith(FAV_PREFIX) && !wanted.has(key)) {
                delete imageCache[key];
                await deleteImageFromDB(key).catch(() => {});
            }
        }
    } catch (e) { /* non-critical */ }
}

function debounce(fn, ms = 80) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// --- Initialization ---

async function init() {
    setupEventListeners();

    // Preload all locally-stored images (custom icons, background, cached
    // favicons) BEFORE the first paint. This lets us render the grid exactly
    // once with the correct images — eliminating the flash/blink that a second
    // full re-render used to cause.
    try {
        Object.assign(imageCache, await getAllImagesFromDB());
    } catch (e) {
        console.error("Failed to preload images", e);
    }

    applySettings();
    applyFont(); // Uploaded/system/URL fonts swap in here; default is already in CSS.
    renderThemeUI(); // Build the preset chips + saved-theme list up front.
    grid.classList.add('first-paint');
    renderGrid();
    // Drop the animation hook after it plays so drag-reorder re-renders are instant.
    setTimeout(() => grid.classList.remove('first-paint'), 400);

    // The toolbar popup links to newtab.html#settings, which is the way back
    // in if someone has made the gear invisible.
    if (location.hash === '#settings') {
        settingsModal.style.display = 'flex';
        renderShortcutsList();
        renderThemeUI();
    }

    // If the tab was opened offline, some icons may be showing fallbacks.
    // The moment the connection returns, repaint so the real icons load
    // (and get cached for the next offline session).
    window.addEventListener('online', renderGrid);
    // The icon block moves when the window resizes, so re-place the arrows.
    window.addEventListener('resize', debounce(positionPageArrows, 60));

    // One-time legacy data migrations (rare). Only re-render if they changed data.
    handleStorageMigrations().then(changed => {
        if (changed) {
            applySettings();
            renderGrid();
        }
        // Tidy stale cached icons in the background.
        pruneIconCache();
    }).catch(e => console.error("Migration failed", e));
}

// Save to localStorage only (fast, no DOM work)
function saveState() {
    try {
        localStorage.setItem('sites', JSON.stringify(sites));
        localStorage.setItem('settings', JSON.stringify(settings));
    } catch (e) {
        console.error("Save error:", e);
        alert("Error saving settings. Local storage might be full.");
    }
}

// Save + full re-render (for structural changes: add/delete/reorder sites)
function saveAndRender() {
    saveState();
    renderGrid();
    applySettings();
}

function applySettings() {
    // Layout
    // Convert reference pixels (based on ~1080p height) to vmin for proportionality
    // 100px on 1080p is ~9.2vmin. Formula: (val / 10.8)
    const toVmin = (val) => `${(val / 10.8).toFixed(2)}vmin`;

    // Layout values can differ per page, so they are read through pageValue().
    const pIconSize = pageValue('iconSize');
    document.documentElement.style.setProperty('--icon-size', toVmin(pIconSize));
    document.documentElement.style.setProperty('--grid-row-gap', toVmin(pageValue('gridRowGap')));
    document.documentElement.style.setProperty('--grid-col-gap', toVmin(pageValue('gridColGap')));
    // Icons inside folders are usually a bit smaller than the ones on the grid.
    const folderScale = (settings.folderIconScale ?? 75) / 100;
    document.documentElement.style.setProperty('--folder-icon-size', toVmin(pIconSize * folderScale));
    document.documentElement.style.setProperty('--folder-padding', toVmin(settings.folderPadding ?? 20));
    document.documentElement.style.setProperty('--folder-gap', toVmin(settings.folderGap ?? 20));

    // Grid Vertical Offset (Applied to wrapper to move everything)
    if (contentWrapper) {
        contentWrapper.style.transform = `translateY(${toVmin(pageValue('gridVerticalOffset') || 0)})`;
    }

    // Grid Columns
    let cols = pageValue('colCount');
    if (cols === 'auto') {
        cols = 5; // Default fallback if user had 'auto'
        settings.colCount = cols;
        // We don't saveState() here to avoid recursion or side effects, 
        // but next time they change something it will save.
    }

    grid.style.gridTemplateColumns = `repeat(${cols}, var(--icon-size))`;
    if (colCountValInput) colCountValInput.value = layoutValue('colCount');
    if (colCountInputEl) colCountInputEl.value = layoutValue('colCount');

    // Toggle Classes
    if (!settings.showIconBg) grid.classList.add('no-icon-bg');
    else grid.classList.remove('no-icon-bg');

    // Icon Customization
    const radius = settings.iconShape === 'circle' ? '50%' : '15%';
    document.documentElement.style.setProperty('--icon-radius', radius);
    document.documentElement.style.setProperty('--icon-bg-color', settings.iconBgColor);

    if (!settings.showLabels) grid.classList.add('no-labels');
    else grid.classList.remove('no-labels');

    // Open All Button
    if (openAllBtn) {
        const show = settings.showOpenAll !== false;
        openAllBtn.style.display = show ? 'inline-block' : 'none';
        if (openAllWrapper) openAllWrapper.style.display = show ? 'block' : 'none';

        openAllBtn.textContent = settings.openAllText || 'Open All Sites';
        openAllBtn.style.backgroundColor = settings.openAllColor || '#3f51b5';

        const btnRadius = settings.openAllShape === 'square' ? '0px' : settings.openAllShape === 'pill' ? '50px' : '6px';
        openAllBtn.style.borderRadius = btnRadius;

        if (showOpenAllInput) showOpenAllInput.checked = show;

        // Only reposition if needed
        if (openAllWrapper && contentWrapper) {
            const isTop = settings.openAllPosition === 'top';
            const currentlyTop = openAllWrapper.nextSibling === grid;
            if (isTop && !currentlyTop) {
                contentWrapper.insertBefore(openAllWrapper, grid);
            } else if (!isTop && currentlyTop) {
                contentWrapper.appendChild(openAllWrapper);
            }
        }
    }

    // Background
    bg.style.filter = `blur(${settings.bgBlur}px)`;

    if (settings.bgType === 'gradient') {
        // Setting the `background` shorthand already clears any previous image,
        // so we must NOT also clear backgroundImage here (that would wipe the
        // gradient we just set — a long-standing bug the editable gradient hit).
        bg.style.background = buildGradient();
    } else if (settings.bgType === 'color') {
        bg.style.background = ''; // Clear shorthand
        bg.style.backgroundImage = 'none'; // Explicitly remove CSS gradient overlap
        bg.style.backgroundColor = settings.bgValue || '#1a1a1a';
        bgColorInput.value = settings.bgValue || '#1a1a1a';
    } else if (settings.bgType === 'url' || settings.bgType === 'file') {
        bg.style.background = '';
        if (settings.bgValue) {
            if (settings.bgValue.startsWith('idb:')) {
                if (imageCache[settings.bgValue]) {
                    bg.style.backgroundImage = `url("${imageCache[settings.bgValue]}")`;
                    bg.style.backgroundSize = 'cover';
                    bg.style.backgroundPosition = 'center';
                }
            } else {
                bg.style.backgroundImage = `url("${settings.bgValue}")`;
                bg.style.backgroundSize = 'cover';
                bg.style.backgroundPosition = 'center';
            }
            if (settings.bgType === 'url') bgUrlInput.value = settings.bgValue;
        }
    }

    // Update Input Values (showing whichever page the Layout tab is editing)
    if (iconSizeInput) iconSizeInput.value = layoutValue('iconSize');
    if (iconSizeValInput) iconSizeValInput.value = layoutValue('iconSize');
    populateLayoutScope();

    // Use safe defaults if old settings exist without new properties
    const rGap = layoutValue('gridRowGap') !== undefined ? layoutValue('gridRowGap') : 40;
    const cGap = layoutValue('gridColGap') !== undefined ? layoutValue('gridColGap') : 40;

    // Grid Gaps
    if (gridRowGapInput) gridRowGapInput.value = rGap;
    if (gridRowGapValInput) gridRowGapValInput.value = rGap;
    if (gridColGapInput) gridColGapInput.value = cGap;
    if (gridColGapValInput) gridColGapValInput.value = cGap;

    if (gridOffsetInput) {
        gridOffsetInput.value = layoutValue('gridVerticalOffset') || 0;
        if (gridOffsetValInput) gridOffsetValInput.value = layoutValue('gridVerticalOffset') || 0;
    }

    if (bgBlurInput) bgBlurInput.value = settings.bgBlur;
    if (bgBlurValInput) bgBlurValInput.value = settings.bgBlur;
    if (bgTypeInput) bgTypeInput.value = settings.bgType;

    showIconBgInput.checked = settings.showIconBg;
    if (iconShapeInput) iconShapeInput.value = settings.iconShape || 'circle';
    if (iconBgColorInput) iconBgColorInput.value = settings.iconBgColor || '#ffffff';

    showLabelsInput.checked = settings.showLabels;

    if (openAllTextInput) openAllTextInput.value = settings.openAllText || 'Open All Sites';
    if (openAllColorInput) openAllColorInput.value = settings.openAllColor || '#3f51b5';
    if (openAllShapeInput) openAllShapeInput.value = settings.openAllShape || 'pill';
    if (openAllPositionInput) openAllPositionInput.value = settings.openAllPosition || 'bottom';


    if (showSearchInput) showSearchInput.checked = settings.showSearch;
    if (searchIconStyleInput) searchIconStyleInput.value = settings.searchIconStyle || 'glass';
    if (searchIconUrlInput) searchIconUrlInput.value = (settings.searchIconStyle === 'url') ? settings.searchIconValue : '';
    if (searchPositionInput) searchPositionInput.value = settings.searchPosition || 'top';
    if (openSearchNewTabInput) openSearchNewTabInput.checked = settings.openSearchNewTab;
    updateSearchIconInputsDisplay();

    if (openShortcutsNewTabInput) openShortcutsNewTabInput.checked = settings.openShortcutsNewTab;

    // Tab Customization
    document.title = settings.tabTitle || 'New Tab';
    if (tabTitleInput) tabTitleInput.value = settings.tabTitle || 'New Tab';

    updateTabFavicon();
    if (tabFaviconSourceInput) tabFaviconSourceInput.value = settings.tabFaviconSource || 'default';
    if (tabFaviconUrlInput) tabFaviconUrlInput.value = (settings.tabFaviconSource === 'url') ? settings.tabFaviconValue : '';
    if (tabFaviconColorInput) tabFaviconColorInput.value = (settings.tabFaviconSource === 'color') ? settings.tabFaviconValue : '#3f51b5';

    updateTabFaviconInputsDisplay();

    // Search Bar Logic
    if (searchWrapper) {
        if (settings.showSearch) {
            searchWrapper.style.display = 'block';
            searchWrapper.style.position = 'relative';
            searchWrapper.style.width = '100%';
            searchWrapper.style.margin = '0';

            // Icon Style Logic
            if (searchIcon) {
                const style = settings.searchIconStyle || 'glass';
                searchIcon.style.display = 'block'; // Ensure visible by default

                if (style === 'none') {
                    searchIcon.style.display = 'none';
                } else if (style === 'globe') {
                    searchIcon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1nbG9iZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjxsaW5lIHgxPSIyIiB5MT0iMTIiIHgyPSIyMiIgeTI9IjEyIj48L2xpbmU+PHBhdGggZD0iTTEyIDJhMTUuMyAxNS4zIDAgMCAxIDQgMTAgMTUuMyAxNS4zIDAgMCAxLTQgMTAgMTUuMyAxNS4zIDAgMCAxLTQgLTEwIDE1LjMgMTUuMyAwIDAgMSA0LTEweiI+PC9wYXRoPjwvc3ZnPg==';
                } else if (style === 'dot') {
                    searchIcon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiPjwvY2lyY2xlPjwvc3ZnPg==';
                } else if (style === 'url' || style === 'file') {
                    if (settings.searchIconValue && settings.searchIconValue.startsWith('idb:')) {
                        if (imageCache[settings.searchIconValue]) {
                            searchIcon.src = imageCache[settings.searchIconValue];
                        }
                    } else {
                        searchIcon.src = settings.searchIconValue;
                    }
                } else {
                    // Default Glass
                    searchIcon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1zZWFyY2giPjxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiPjwvY2lyY2xlPjxsaW5lIHgxPSIyMSIgeTE9IjIxIiB4Mj0iMTYuNjUiIHkyPSIxNi42NSI+PC9saW5lPjwvc3ZnPg==';
                }
            }

            const baseGap = 20;
            const offset = settings.searchMargin;

            if (settings.searchPosition === 'bottom') {
                if (contentWrapper) contentWrapper.appendChild(searchWrapper);
                searchWrapper.style.marginTop = `${baseGap}px`;
                searchWrapper.style.transform = `translateY(${offset}px)`;
            } else {
                if (contentWrapper) contentWrapper.prepend(searchWrapper);
                searchWrapper.style.marginBottom = `${baseGap}px`;
                searchWrapper.style.transform = `translateY(-${offset}px)`;
            }

            if (searchMarginInput) {
                searchMarginInput.value = settings.searchMargin;
                if (searchMarginValInput) searchMarginValInput.value = settings.searchMargin;
            }

            // Bar size & shape — width, height (vertical padding), text size, roundness.
            const sWidth = settings.searchWidth ?? 600;
            const sHeight = settings.searchHeight ?? 10;
            const sText = settings.searchTextSize ?? 18;
            const sRadius = settings.searchRadius ?? 50;
            searchForm.style.maxWidth = `${sWidth}px`;
            searchForm.style.paddingTop = `${sHeight}px`;
            searchForm.style.paddingBottom = `${sHeight}px`;
            searchForm.style.borderRadius = `${sRadius}px`;
            searchInput.style.fontSize = `${sText}px`;
            if (searchWidthInput) { searchWidthInput.value = sWidth; if (searchWidthValInput) searchWidthValInput.value = sWidth; }
            if (searchHeightInput) { searchHeightInput.value = sHeight; if (searchHeightValInput) searchHeightValInput.value = sHeight; }
            if (searchTextSizeInput) { searchTextSizeInput.value = sText; if (searchTextSizeValInput) searchTextSizeValInput.value = sText; }
            if (searchRadiusInput) { searchRadiusInput.value = sRadius; if (searchRadiusValInput) searchRadiusValInput.value = sRadius; }
        } else {
            searchWrapper.style.display = 'none';
        }
    }

    // Font — reflect the saved choice in the controls (the font itself is
    // applied by applyFont(), called on startup and whenever these change).
    if (fontSourceInput) fontSourceInput.value = settings.fontSource || 'default';
    if (fontSystemSelect && settings.fontSource === 'system') fontSystemSelect.value = settings.fontValue;
    if (fontUrlInput) fontUrlInput.value = settings.fontSource === 'url' ? settings.fontValue : '';
    updateFontInputsDisplay();

    // Accent color
    const root = document.documentElement.style;
    root.setProperty('--accent', settings.accentColor || '#3f51b5');
    if (accentColorInput) accentColorInput.value = settings.accentColor || '#3f51b5';

    // Settings window colors
    // An override sets the variable; leaving it empty removes it so the
    // stylesheet default (or, for the tab, the accent color) shows through.
    applyPanelColor(root, '--panel-bg', settings.panelBgColor);
    applyPanelColor(root, '--panel-alt', settings.panelAltColor);
    applyPanelColor(root, '--panel-text', settings.panelTextColor);
    applyPanelColor(root, '--panel-tab', settings.panelTabColor);
    // The pickers always show the colour actually in use.
    if (panelBgColorInput) panelBgColorInput.value = settings.panelBgColor || PANEL_COLOR_FALLBACKS.panelBgColor;
    if (panelAltColorInput) panelAltColorInput.value = settings.panelAltColor || PANEL_COLOR_FALLBACKS.panelAltColor;
    if (panelTextColorInput) panelTextColorInput.value = settings.panelTextColor || PANEL_COLOR_FALLBACKS.panelTextColor;
    if (panelTabColorInput) panelTabColorInput.value = settings.panelTabColor || settings.accentColor || '#3f51b5';

    applySettingsIcon();

    // Labels (scale is stored as a percentage of icon size)
    const labelScale = settings.labelScale ?? 14;
    root.setProperty('--label-scale', (labelScale / 100).toString());
    root.setProperty('--label-color', settings.labelColor || '#eeeeee');
    root.setProperty('--label-weight', String(settings.labelWeight || 500));
    if (labelScaleInput) labelScaleInput.value = labelScale;
    if (labelScaleValInput) labelScaleValInput.value = labelScale;
    if (labelColorInput) labelColorInput.value = settings.labelColor || '#eeeeee';
    if (labelWeightInput) labelWeightInput.value = settings.labelWeight || 500;
    if (labelSettingsGroup) labelSettingsGroup.style.display = settings.showLabels ? 'block' : 'none';

    // Gradient editor controls
    if (gradColor1Input) gradColor1Input.value = settings.gradientColor1 || '#2a2a2a';
    if (gradColor2Input) gradColor2Input.value = settings.gradientColor2 || '#111111';
    if (gradAngleInput) gradAngleInput.value = settings.gradientAngle || 'radial';

    // Custom CSS
    applyCustomCss();
    if (customCssInput && document.activeElement !== customCssInput) {
        customCssInput.value = settings.customCss || '';
    }

    // Pages + interaction toggles
    const pageCount = settings.pageCount || 1;
    if (pageCountDisplay) pageCountDisplay.textContent = pageCount;
    if (pageTransitionInput) pageTransitionInput.value = settings.pageTransition || 'instant';
    if (currentPage > pageCount - 1) currentPage = pageCount - 1;
    if (enableNumberKeysInput) enableNumberKeysInput.checked = settings.enableNumberKeys !== false;
    if (hotkeyScopeInput) hotkeyScopeInput.value = settings.hotkeyScope || 'universal';
    if (showHotkeyBadgeInput) showHotkeyBadgeInput.checked = settings.showHotkeyBadge !== false;
    if (folderOpenStyleInput) folderOpenStyleInput.value = settings.folderOpenStyle || 'around';
    if (folderTitleInput) folderTitleInput.value = settings.folderTitle || 'top';
    if (folderBlurInput) folderBlurInput.checked = !!settings.folderBlur;
    if (pageArrowsInput) pageArrowsInput.value = settings.pageArrows || 'both';
    if (pageArrowStyleInput) pageArrowStyleInput.value = settings.pageArrowStyle || 'chevron';
    if (pageArrowPositionInput) pageArrowPositionInput.value = settings.pageArrowPosition || 'edge';
    if (pageArrowAnchorInput) pageArrowAnchorInput.value = settings.pageArrowAnchor || 'current';
    // Anchoring only matters when the arrows follow the icons.
    if (pageArrowAnchorGroup) {
        pageArrowAnchorGroup.style.display =
            (settings.pageArrowPosition === 'grid') ? 'block' : 'none';
    }
    if (pageArrowColorInput) pageArrowColorInput.value = settings.pageArrowColor || '#ffffff';
    if (showPageDotsInput) showPageDotsInput.checked = settings.showPageDots !== false;
    if (pageArrowOptions) pageArrowOptions.style.display = (settings.pageArrows === 'none') ? 'none' : 'block';
    renderPageArrows();
    // Keep every folder slider showing its saved value.
    syncSliderPair('folderIconScale', settings.folderIconScale ?? 75);
    syncSliderPair('folderPadding', settings.folderPadding ?? 20);
    syncSliderPair('folderGap', settings.folderGap ?? 20);
    syncSliderPair('folderOpacity', settings.folderOpacity ?? 100);
    syncSliderPair('pageArrowSize', settings.pageArrowSize ?? 40);
    syncSliderPair('pageArrowOpacity', settings.pageArrowOpacity ?? 45);
    syncSliderPair('pageArrowGap', settings.pageArrowGap ?? 16);
    syncSliderPair('folderCustomX', settings.folderCustomX ?? 50);
    syncSliderPair('folderCustomY', settings.folderCustomY ?? 50);
    syncSliderPair('folderCustomWidth', settings.folderCustomWidth ?? 420);
    syncSliderPair('folderCustomHeight', settings.folderCustomHeight ?? 320);
    updateFolderInputsDisplay();
    if (enableContextMenuInput) enableContextMenuInput.checked = settings.enableContextMenu !== false;
    if (confirmOpenAllInput) confirmOpenAllInput.checked = settings.confirmOpenAll !== false;

    updateBgInputsDisplay();
}

// Place, style and (optionally) hide the gear button. When hidden it keeps
// its exact position and stays clickable — it is simply invisible.
// What each panel color looks like when it hasn't been overridden. The
// selected tab is special: it follows the accent color instead.
const PANEL_COLOR_FALLBACKS = {
    panelBgColor: '#242424',
    panelAltColor: '#1d1d1d',
    panelTextColor: '#ffffff'
};

function applyPanelColor(root, cssVar, value) {
    if (value) root.setProperty(cssVar, value);
    else root.removeProperty(cssVar);
}

function applySettingsIcon() {
    if (!settingsBtn) return;
    const toVmin = (val) => `${(val / 10.8).toFixed(2)}vmin`;
    const corner = settings.settingsIconPosition || 'top-right';
    const inset = '2vmin';

    // Neutralise all four sides with `auto` — clearing them would fall back to
    // the stylesheet's top/right and leave the button stretched between corners.
    settingsBtn.style.top = settingsBtn.style.bottom = 'auto';
    settingsBtn.style.left = settingsBtn.style.right = 'auto';
    settingsBtn.style[corner.startsWith('top') ? 'top' : 'bottom'] = inset;
    settingsBtn.style[corner.endsWith('left') ? 'left' : 'right'] = inset;

    const iconSource = settings.settingsIconSource || 'glyph';
    settingsBtn.textContent = '';
    if ((iconSource === 'url' || iconSource === 'file') && settings.settingsIconValue) {
        const img = document.createElement('img');
        img.className = 'settings-icon-img';
        img.alt = 'Settings';
        img.draggable = false;
        img.src = settings.settingsIconValue;
        // A broken link would leave an empty button, so fall back to the glyph.
        img.onerror = () => { settingsBtn.textContent = settings.settingsIconGlyph || '\u2699\uFE0F'; };
        settingsBtn.appendChild(img);
    } else {
        settingsBtn.textContent = settings.settingsIconGlyph || '\u2699\uFE0F';
    }
    settingsBtn.style.fontSize = toVmin(settings.settingsIconSize ?? 25);
    settingsBtn.style.setProperty('--settings-icon-opacity',
        String((settings.settingsIconOpacity ?? 30) / 100));
    settingsBtn.classList.toggle('invisible-icon', !!settings.settingsIconHidden);

    if (settingsIconPositionInput) settingsIconPositionInput.value = corner;
    if (settingsIconGlyphInput && document.activeElement !== settingsIconGlyphInput) {
        settingsIconGlyphInput.value = settings.settingsIconGlyph || '\u2699\uFE0F';
    }
    if (settingsIconHiddenInput) settingsIconHiddenInput.checked = !!settings.settingsIconHidden;
    if (settingsIconSourceInput) settingsIconSourceInput.value = iconSource;
    if (settingsIconUrlInput && document.activeElement !== settingsIconUrlInput) {
        settingsIconUrlInput.value = iconSource === 'url' ? settings.settingsIconValue : '';
    }
    if (settingsIconGlyphGroup) settingsIconGlyphGroup.style.display = iconSource === 'glyph' ? 'block' : 'none';
    if (settingsIconUrlGroup) settingsIconUrlGroup.style.display = iconSource === 'url' ? 'block' : 'none';
    if (settingsIconFileGroup) settingsIconFileGroup.style.display = iconSource === 'file' ? 'block' : 'none';
    syncSliderPair('settingsIconOpacity', settings.settingsIconOpacity ?? 30);
    syncSliderPair('settingsIconSize', settings.settingsIconSize ?? 25);
}

// Keep the slider + number box of a control in step with a saved value.
function syncSliderPair(id, value) {
    const slider = document.getElementById(id);
    const num = document.getElementById(id + 'ValInput');
    if (slider) slider.value = value;
    if (num) num.value = value;
}

function updateSearchIconInputsDisplay() {
    if (!searchIconStyleInput) return;
    const val = searchIconStyleInput.value;
    if (searchIconUrlGroup) searchIconUrlGroup.style.display = val === 'url' ? 'block' : 'none';
    if (searchIconFileGroup) searchIconFileGroup.style.display = val === 'file' ? 'block' : 'none';
}

// =========================================================================
// Typography — the page font
// =========================================================================
// The whole UI draws its font from one CSS variable, --app-font (styles.css).
// applyFont() points that variable at one of four sources:
//
//   'default' → the bundled Inter font. Offline, always available.
//   'system'  → a native font already on the user's OS (settings.fontValue
//               holds the CSS stack, e.g. "Georgia, serif"). Offline, instant.
//   'upload'  → a font file the user uploaded, kept in IndexedDB and loaded
//               with the FontFace API. Offline once saved.
//   'url'     → a Google Font. We DOWNLOAD the font file once and store it in
//               IndexedDB, so after the first load it works fully offline too
//               (no live stylesheet, no repeated requests). Inter is the
//               fallback if it ever can't be loaded — text never disappears.
//
// Whatever the source, if it fails the page falls back to Inter, so the UI is
// never left without a font.

// '#rrggbb' + opacity -> 'rgba(r, g, b, a)'. Falls back to the value as-is
// so a malformed color can never blank out a panel.
function rgbaFromHex(hex, alpha) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const GFONT_PREFIX = 'gfont:'; // IndexedDB key prefix for cached Google Fonts.

// The FontFace we registered for the current upload/URL font, tracked so we
// can remove it before adding a new one (avoids piling up font faces).
let customFontFace = null;

function setAppFont(stack) {
    document.documentElement.style.setProperty('--app-font', stack);
}

// Register a font from a data URL under `family` and point the page at it.
async function useFontFace(family, dataUrl, fallback = "'Inter', system-ui, sans-serif") {
    const face = new FontFace(family, `url(${dataUrl})`);
    await face.load();
    if (customFontFace) document.fonts.delete(customFontFace);
    document.fonts.add(face);
    customFontFace = face;
    setAppFont(`'${family}', ${fallback}`);
}

async function applyFont() {
    const source = settings.fontSource || 'default';

    if (source === 'system' && settings.fontValue) {
        setAppFont(settings.fontValue);
        return;
    }

    if (source === 'upload' && settings.fontValue) {
        const dataUrl = settings.fontValue.startsWith('idb:')
            ? imageCache[settings.fontValue]
            : settings.fontValue;
        if (dataUrl) {
            try {
                await useFontFace('UserFont', dataUrl);
                return;
            } catch (e) {
                console.error('Could not load the uploaded font.', e);
            }
        }
    }

    if (source === 'url' && settings.fontValue) {
        const family = familyFromGoogleFontsUrl(settings.fontValue);
        const cacheKey = GFONT_PREFIX + settings.fontValue;

        // 1) Already downloaded? Use the local copy — fully offline.
        let dataUrl = imageCache[cacheKey];

        // 2) Not cached yet and we're online: download once and store it.
        if (!dataUrl && navigator.onLine) {
            try {
                dataUrl = await fetchGoogleFontAsDataUrl(settings.fontValue);
                await saveImageToDB(cacheKey, dataUrl);
            } catch (e) {
                dataUrl = null; // Network/parse problem — fall through to Inter.
            }
        }

        if (dataUrl && family) {
            try {
                await useFontFace(family, dataUrl);
                return;
            } catch (e) {
                console.error('Could not load the Google font.', e);
            }
        }
        // Couldn't fetch it yet (e.g. offline before the first download):
        // name the family in case the OS already has it, then Inter.
        if (family) {
            setAppFont(`'${family}', 'Inter', system-ui, sans-serif`);
            return;
        }
    }

    // Default — and the safety net for any source that failed above.
    setAppFont("'Inter', system-ui, sans-serif");
}

// Download a Google Font and return it as a data URL. Both Google endpoints
// send "Access-Control-Allow-Origin: *", so this works from the extension page
// with no host permissions. We grab the basic-latin face (the one that covers
// normal English text) so everyday labels render in the chosen font.
async function fetchGoogleFontAsDataUrl(cssUrl) {
    const safeCssUrl = normalizeGoogleFontStylesheetUrl(cssUrl);
    if (!safeCssUrl) throw new Error('Use a fonts.googleapis.com CSS URL.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const cssResponse = await fetch(safeCssUrl, {
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            signal: controller.signal
        });
        if (!cssResponse.ok) throw new Error(`Google Fonts returned ${cssResponse.status}.`);
        const css = await cssResponse.text();
        if (css.length > 256 * 1024) throw new Error('Google Fonts CSS was unexpectedly large.');
        const faces = css.split('@font-face').slice(1);
        // Prefer the @font-face block whose unicode-range covers basic latin.
        const latin = faces.find(b => /unicode-range:[^;]*u\+0+\b|unicode-range:[^;]*0000/i.test(b));
        const block = latin || faces[0] || '';
        const match = block.match(/url\((https:\/\/[^)]+)\)/i);
        const fontUrl = match && normalizeHttpsResourceUrl(match[1], ['fonts.gstatic.com']);
        if (!fontUrl) throw new Error('No trusted font file found in the Google Fonts CSS.');
        const fontResponse = await fetch(fontUrl, {
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            signal: controller.signal
        });
        if (!fontResponse.ok) throw new Error(`Google Fonts returned ${fontResponse.status}.`);
        const declaredSize = Number(fontResponse.headers.get('content-length')) || 0;
        if (declaredSize > 5 * 1024 * 1024) throw new Error('Font file is too large.');
        const blob = await fontResponse.blob();
        if (blob.size > 5 * 1024 * 1024) throw new Error('Font file is too large.');
        return await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(blob);
        });
    } finally {
        clearTimeout(timeout);
    }
}

function openShortcutUrl(value, newTab) {
    const url = normalizeShortcutUrl(value);
    if (!url) return false;
    if (newTab) {
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
    } else {
        window.location.assign(url);
    }
    return true;
}

// Read the first family name out of a Google Fonts URL so we can name it in
// our CSS. e.g. ".../css2?family=Roboto+Slab:wght@400" → "Roboto Slab".
function familyFromGoogleFontsUrl(url) {
    try {
        const family = new URL(url).searchParams.get('family');
        return family ? family.split(':')[0].replace(/\+/g, ' ').trim() : null;
    } catch (e) {
        return null; // Not a valid URL — caller falls back to Inter.
    }
}

// The position/size sliders only apply to the "Custom" folder style.
function updateFolderInputsDisplay() {
    if (folderCustomGroup) {
        folderCustomGroup.style.display =
            (settings.folderOpenStyle === 'custom') ? 'block' : 'none';
    }
}

function updateFontInputsDisplay() {
    if (!fontSourceInput) return;
    const val = fontSourceInput.value;
    if (fontSystemGroup) fontSystemGroup.style.display = val === 'system' ? 'block' : 'none';
    if (fontUploadGroup) fontUploadGroup.style.display = val === 'upload' ? 'block' : 'none';
    if (fontUrlGroup) fontUrlGroup.style.display = val === 'url' ? 'block' : 'none';
}

const LOGO_FAVICON = 'icon32.png'; // the bundled New Tab logo, used by default

function updateTabFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }

    // 'chrome' → no custom icon. We point the link at a transparent pixel,
    // which reliably clears the logo (simply removing the <link> often leaves
    // Chrome showing the cached icon until the next navigation).
    if (settings.tabFaviconSource === 'chrome') {
        link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        return;
    }

    // 'default' means the extension's own logo; users can still override it
    // with a color dot, an image URL, or an uploaded file.
    if (settings.tabFaviconSource === 'default') {
        link.href = LOGO_FAVICON;
        return;
    }

    if (settings.tabFaviconSource === 'color') {
        link.href = createColorFavicon(settings.tabFaviconValue || '#3f51b5');
    } else if (settings.tabFaviconValue) {
        if (settings.tabFaviconValue.startsWith('idb:')) {
            if (imageCache[settings.tabFaviconValue]) {
                link.href = imageCache[settings.tabFaviconValue];
            }
        } else {
            link.href = settings.tabFaviconValue;
        }
    }
}

function createColorFavicon(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    return canvas.toDataURL('image/png');
}

function updateTabFaviconInputsDisplay() {
    if (!tabFaviconSourceInput) return;
    const val = tabFaviconSourceInput.value;
    if (tabFaviconColorGroup) tabFaviconColorGroup.style.display = val === 'color' ? 'block' : 'none';
    if (tabFaviconUrlGroup) tabFaviconUrlGroup.style.display = val === 'url' ? 'block' : 'none';
    if (tabFaviconFileGroup) tabFaviconFileGroup.style.display = val === 'file' ? 'block' : 'none';
}

function updateBgInputsDisplay() {
    const val = bgTypeInput.value;
    if (bgGradientGroup) bgGradientGroup.style.display = val === 'gradient' ? 'block' : 'none';
    bgColorGroup.style.display = val === 'color' ? 'block' : 'none';
    bgUrlGroup.style.display = val === 'url' ? 'block' : 'none';
    bgFileGroup.style.display = val === 'file' ? 'block' : 'none';
}

// Build the CSS background for the "gradient" type from the user's colors and
// direction. The defaults reproduce the original radial gradient exactly.
function buildGradient() {
    const c1 = settings.gradientColor1 || '#2a2a2a';
    const c2 = settings.gradientColor2 || '#111111';
    const angle = settings.gradientAngle || 'radial';
    return angle === 'radial'
        ? `radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)`
        : `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
}

// Inject (or update) the user's Custom CSS as a single <style> tag.
function applyCustomCss() {
    let tag = document.getElementById('userCustomCss');
    const css = settings.customCss || '';
    // Custom CSS is local-only. Blocking imports and url() prevents a backup
    // file from turning styling into an undeclared network channel.
    if (!css || /@import\b|url\s*\(/i.test(css)) {
        if (tag) tag.remove();
        return;
    }
    if (!tag) {
        tag = document.createElement('style');
        tag.id = 'userCustomCss';
        document.head.appendChild(tag);
    }
    tag.textContent = css;
}

// =========================================================================
// Theme presets
// =========================================================================
// A "theme" is a snapshot of the look-and-feel settings (never the shortcut
// list). Applying one only overwrites the keys it contains, so a preset that
// sets just colors leaves the user's layout untouched.
const BUILT_IN_THEMES = [
    { name: 'Default', data: { accentColor: '#3f51b5', showIconBg: false, iconShape: 'circle', iconBgColor: '#ffffff', bgType: 'gradient', gradientColor1: '#2a2a2a', gradientColor2: '#111111', gradientAngle: 'radial', bgBlur: 0, labelScale: 14, labelColor: '#eeeeee', labelWeight: 500 } },
    { name: 'Midnight', data: { accentColor: '#5c6bc0', showIconBg: true, iconShape: 'square', iconBgColor: '#1b1f2a', bgType: 'gradient', gradientColor1: '#1f2c4d', gradientColor2: '#04060f', gradientAngle: 'radial', labelColor: '#c8cee0', labelWeight: 500 } },
    { name: 'Neon', data: { accentColor: '#00e5ff', showIconBg: true, iconShape: 'square', iconBgColor: '#10141c', bgType: 'gradient', gradientColor1: '#221a52', gradientColor2: '#04030a', gradientAngle: '135', labelColor: '#9ff7ff', labelWeight: 600 } },
    { name: 'Mono', data: { accentColor: '#9e9e9e', showIconBg: false, iconShape: 'circle', bgType: 'gradient', gradientColor1: '#333333', gradientColor2: '#070707', gradientAngle: 'radial', labelColor: '#dddddd', labelWeight: 400 } },
    { name: 'Warm', data: { accentColor: '#ff7043', showIconBg: true, iconShape: 'square', iconBgColor: '#2a1f1a', bgType: 'gradient', gradientColor1: '#3c2616', gradientColor2: '#140703', gradientAngle: '160', labelColor: '#f0d9cc', labelWeight: 500 } }
];

function applyTheme(data) {
    Object.assign(settings, data);
    saveState();
    applyFont();      // font may have changed
    applySettings();  // repaint everything else
}

function saveCurrentTheme(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) { alert('Give your theme a name first.'); return; }
    const data = {};
    THEME_KEYS.forEach(k => { if (settings[k] !== undefined) data[k] = settings[k]; });
    settings.themes = settings.themes || [];
    settings.themes.push({ name: trimmed, data });
    saveState();
    renderThemeUI();
}

function deleteSavedTheme(index) {
    settings.themes.splice(index, 1);
    saveState();
    renderThemeUI();
}

// Render the preset chips and the saved-themes list.
function renderThemeUI() {
    if (themePresetsContainer) {
        themePresetsContainer.innerHTML = '';
        BUILT_IN_THEMES.forEach(theme => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'theme-preset';
            btn.textContent = theme.name;
            btn.onclick = () => applyTheme(theme.data);
            themePresetsContainer.appendChild(btn);
        });
    }

    if (savedThemesList) {
        savedThemesList.innerHTML = '';
        (settings.themes || []).forEach((theme, index) => {
            const row = document.createElement('div');
            row.className = 'shortcut-manage-item';

            const info = document.createElement('div');
            info.className = 'shortcut-info';
            info.textContent = theme.name;

            const actions = document.createElement('div');
            actions.className = 'shortcut-actions';

            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Apply';
            applyBtn.style.fontSize = '13px';
            applyBtn.onclick = () => applyTheme(theme.data);

            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️';
            delBtn.onclick = () => deleteSavedTheme(index);

            actions.appendChild(applyBtn);
            actions.appendChild(delBtn);
            row.appendChild(info);
            row.appendChild(actions);
            savedThemesList.appendChild(row);
        });
    }
}

// =========================================================================
// Pages & folders — model helpers
// =========================================================================
// `sites` is a flat list of top-level items. Each item is either a shortcut
// or a folder ({ type:'folder', name, color, page, children:[shortcuts] }).
// Every top-level item has a `page` (0-based; defaults to 0 = the first page).
let currentPage = 0;

// =========================================================================
// Per-page layout overrides
// =========================================================================
// These five settings can differ from page to page. A page only stores the
// ones it actually overrides; anything missing falls back to the global value,
// so a fresh setup behaves exactly as it did before pages existed.
const PAGE_LAYOUT_KEYS = ['iconSize', 'colCount', 'gridRowGap', 'gridColGap', 'gridVerticalOffset'];

// Which page the Layout tab is editing: 'global', or a page index.
let layoutScope = 'global';

// The value actually used to draw a page.
function pageValue(key, page = currentPage) {
    const overrides = (settings.pageOverrides || {})[page];
    return (overrides && overrides[key] !== undefined) ? overrides[key] : settings[key];
}

// The value the Layout tab should show and edit.
function layoutValue(key) {
    if (layoutScope !== 'global' && PAGE_LAYOUT_KEYS.includes(key)) return pageValue(key, layoutScope);
    return settings[key];
}

// Write a layout value to the global settings or to the page being edited.
function setLayoutValue(key, value) {
    if (layoutScope !== 'global' && PAGE_LAYOUT_KEYS.includes(key)) {
        settings.pageOverrides = settings.pageOverrides || {};
        settings.pageOverrides[layoutScope] = settings.pageOverrides[layoutScope] || {};
        settings.pageOverrides[layoutScope][key] = value;
    } else {
        settings[key] = value;
    }
}

// Drop a page's overrides so it follows the global layout again.
function clearPageOverrides(page) {
    if (settings.pageOverrides) delete settings.pageOverrides[page];
}

// Fill the "Applies to" picker with one entry per page.
function populateLayoutScope() {
    if (!layoutScopeInput) return;
    const count = settings.pageCount || 1;
    if (count <= 1) layoutScope = 'global'; // nothing to scope to yet
    layoutScopeInput.innerHTML = '';
    const all = document.createElement('option');
    all.value = 'global';
    all.textContent = 'All pages';
    layoutScopeInput.appendChild(all);
    for (let i = 0; i < count; i++) {
        const o = document.createElement('option');
        o.value = String(i);
        const overridden = settings.pageOverrides && settings.pageOverrides[i];
        o.textContent = `Page ${i + 1}${overridden ? ' (custom)' : ''}`;
        layoutScopeInput.appendChild(o);
    }
    layoutScopeInput.value = String(layoutScope);
    if (layoutScopeBar) layoutScopeBar.style.display = count > 1 ? 'flex' : 'none';
    if (layoutScopeClearBtn) {
        const hasOverride = layoutScope !== 'global'
            && settings.pageOverrides && settings.pageOverrides[layoutScope];
        layoutScopeClearBtn.style.display = hasOverride ? 'inline-flex' : 'none';
    }
}


const isFolder = (item) => item && item.type === 'folder';
const itemPage = (item) => Math.min(item.page || 0, Math.max(0, (settings.pageCount || 1) - 1));

// Top-level items on a given page.
const itemsOnPage = (page) => sites.filter(item => itemPage(item) === page);

// Top-level items shown on the page currently in view.
function itemsOnCurrentPage() {
    return sites.filter(item => itemPage(item) === currentPage);
}

// Every shortcut anywhere (top-level + inside folders) — used by "Open All".
function getAllShortcuts() {
    const out = [];
    for (const item of sites) {
        if (isFolder(item)) (item.children || []).forEach(c => out.push(c));
        else out.push(item);
    }
    return out;
}

// Shortcuts that live on the page currently in view (folder children included).
function shortcutsOnCurrentPage() {
    const out = [];
    for (const item of sites) {
        if (itemPage(item) !== currentPage) continue;
        if (isFolder(item)) (item.children || []).forEach(c => out.push(c));
        else out.push(item);
    }
    return out;
}

// Find a shortcut/folder by id anywhere, plus the array that holds it.
function findItemById(id) {
    const top = sites.find(s => String(s.id) === String(id));
    if (top) return { item: top, parent: sites };
    for (const item of sites) {
        if (isFolder(item) && item.children) {
            const child = item.children.find(c => String(c.id) === String(id));
            if (child) return { item: child, parent: item.children };
        }
    }
    return { item: null, parent: null };
}

// Remove an item by id from wherever it lives; returns the removed item.
function removeItemById(id) {
    const { item, parent } = findItemById(id);
    if (item) parent.splice(parent.indexOf(item), 1);
    return item;
}

// --- GUI Rendering ---
function renderGrid() {
    const fragment = document.createDocumentFragment();
    itemsOnCurrentPage().forEach((item) => {
        const tile = isFolder(item) ? buildFolderTile(item) : buildShortcutTile(item);
        tile.dataset.id = item.id;
        tile.draggable = true;
        tile.addEventListener('dragstart', handleDragStart);
        tile.addEventListener('dragover', handleDragOver);
        tile.addEventListener('dragleave', handleDragLeave);
        tile.addEventListener('drop', handleDrop);
        tile.addEventListener('dragend', handleDragEnd);
        tile.addEventListener('contextmenu', (e) => openTileMenu(e, item));
        fragment.appendChild(tile);
    });
    grid.innerHTML = '';
    grid.appendChild(fragment);
    renderPageDots();
}

// A normal shortcut tile (a link).
function buildShortcutTile(site) {
    const a = document.createElement('a');
    a.href = site.url;
    a.className = 'icon-item';
    a.title = site.name;
    a.target = settings.openShortcutsNewTab ? '_blank' : '_self';
    if (a.target === '_blank') a.rel = 'noopener noreferrer';

    const circle = document.createElement('div');
    circle.className = 'icon-circle';
    if (site.color && site.color.toLowerCase() !== '#ffffff') {
        circle.style.backgroundColor = site.color;
    }

    const img = document.createElement('img');
    img.loading = 'eager';
    img.decoding = 'async';
    img.draggable = false;
    img.alt = site.name;
    setShortcutIcon(img, site); // Cache → remote → Chrome's copy → letter tile
    circle.appendChild(img);

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = site.name;

    a.appendChild(circle);
    a.appendChild(label);
    if (site.hotkey && settings.showHotkeyBadge !== false) {
        const badge = document.createElement('span');
        badge.className = 'hotkey-badge';
        badge.textContent = site.hotkey;
        a.appendChild(badge);
    }
    return a;
}

// A folder tile: a 2x2 preview of the first child icons; opens an overlay.
function buildFolderTile(folder) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'icon-item folder-item';
    a.title = folder.name;
    a.onclick = (e) => { e.preventDefault(); openFolder(folder.id, a); };

    const circle = document.createElement('div');
    circle.className = 'icon-circle folder-circle';
    if (folder.color && folder.color.toLowerCase() !== '#ffffff') {
        circle.style.backgroundColor = folder.color;
    }

    const mini = document.createElement('div');
    mini.className = 'folder-mini';
    (folder.children || []).slice(0, 4).forEach(child => {
        const m = document.createElement('img');
        m.loading = 'eager';
        m.decoding = 'async';
        m.draggable = false;
        m.alt = child.name;
        setShortcutIcon(m, child);
        mini.appendChild(m);
    });
    circle.appendChild(mini);

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = folder.name;

    a.appendChild(circle);
    a.appendChild(label);
    return a;
}

// Page indicator dots (only when there's more than one page).
function renderPageDots() {
    renderPageArrows();
    if (!pageDots) return;
    const count = settings.pageCount || 1;
    pageDots.innerHTML = '';
    if (count <= 1 || settings.showPageDots === false) { pageDots.style.display = 'none'; return; }
    pageDots.style.display = 'flex';
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'page-dot' + (i === currentPage ? ' active' : '');
        dot.title = `Page ${i + 1}`;
        dot.onclick = () => goToPage(i);
        pageDots.appendChild(dot);
    }
}

// Left/right arrows for flipping pages with the mouse. They wrap around,
// so with two pages either arrow simply toggles between them.
function renderPageArrows() {
    if (!pagePrevBtn || !pageNextBtn) return;
    const count = settings.pageCount || 1;
    const mode = settings.pageArrows || 'both';
    const visible = count > 1 && mode !== 'none';
    const style = settings.pageArrowStyle || 'chevron';
    const glyphs = style === 'triangle'
        ? ['\u25C0', '\u25B6']
        : ['\u2039', '\u203A'];

    [[pagePrevBtn, 'prev', glyphs[0], mode === 'both' || mode === 'left'],
     [pageNextBtn, 'next', glyphs[1], mode === 'both' || mode === 'right']]
        .forEach(([btn, side, glyph, allowed]) => {
            btn.style.display = (visible && allowed) ? 'flex' : 'none';
            btn.textContent = glyph;
            btn.className = `page-arrow ${side} style-${style}`;
            btn.style.setProperty('--arrow-size', `${settings.pageArrowSize ?? 40}px`);
            btn.style.setProperty('--arrow-color', settings.pageArrowColor || '#ffffff');
            btn.style.setProperty('--arrow-opacity', String((settings.pageArrowOpacity ?? 45) / 100));
        });

    positionPageArrows();
}

// Settings are stored in "reference pixels" (based on a 1080p screen) and
// turned into vmin for display; this converts one to real pixels.
const refPxToPx = (value) => (value / 10.8) * Math.min(window.innerWidth, window.innerHeight) / 100;

// How wide the row of icons on a page is. Calculated rather than measured,
// so we can ask about a page that isn't currently on screen.
function pageIconBlockWidth(page) {
    const columns = pageValue('colCount', page) || 1;
    const filled = Math.max(1, Math.min(columns, itemsOnPage(page).length));
    const iconPx = refPxToPx(pageValue('iconSize', page));
    const gapPx = refPxToPx(pageValue('gridColGap', page));
    return filled * iconPx + (filled - 1) * gapPx;
}

// Arrows sit either against the sides of the screen, or tucked just outside
// the block of icons so they stay close to what you're clicking. The icon
// block is measured from the tiles themselves because the grid element
// stretches the full width of the page.
function positionPageArrows() {
    if (!pagePrevBtn || !pageNextBtn) return;
    const gap = settings.pageArrowGap ?? 16;
    const size = settings.pageArrowSize ?? 40;

    if ((settings.pageArrowPosition || 'edge') !== 'grid') {
        pagePrevBtn.style.left = `${gap}px`;
        pageNextBtn.style.right = `${gap}px`;
        return;
    }

    // By default the arrows hug whatever is on screen now. The other anchors
    // pin them to one page's width so they stay put as you flip pages.
    const anchor = settings.pageArrowAnchor || 'current';
    let iconsLeft;
    let iconsRight;

    if (anchor === 'current') {
        const tiles = grid.querySelectorAll('.icon-item');
        if (tiles.length === 0) { // nothing on this page to measure against
            pagePrevBtn.style.left = `${gap}px`;
            pageNextBtn.style.right = `${gap}px`;
            return;
        }
        iconsLeft = Infinity;
        iconsRight = -Infinity;
        tiles.forEach(tile => {
            const r = tile.getBoundingClientRect();
            iconsLeft = Math.min(iconsLeft, r.left);
            iconsRight = Math.max(iconsRight, r.right);
        });
    } else {
        const pages = settings.pageCount || 1;
        let width = pageIconBlockWidth(0);
        if (anchor === 'widest') {
            for (let p = 1; p < pages; p++) width = Math.max(width, pageIconBlockWidth(p));
        }
        // The grid is centred, so the block sits symmetrically in the window.
        iconsLeft = (window.innerWidth - width) / 2;
        iconsRight = iconsLeft + width;
    }

    // Never let an arrow slide off screen when the grid is very wide.
    const edge = 4;
    pagePrevBtn.style.left = `${Math.max(edge, iconsLeft - gap - size)}px`;
    pageNextBtn.style.right = `${Math.max(edge, window.innerWidth - iconsRight - gap - size)}px`;
}

function stepPage(delta) {
    const count = settings.pageCount || 1;
    if (count <= 1) return;
    goToPage((currentPage + delta + count) % count);
}

function goToPage(index) {
    const count = settings.pageCount || 1;
    const next = Math.max(0, Math.min(index, count - 1));
    if (next === currentPage) return;
    const direction = next > currentPage ? 1 : -1;
    currentPage = next;
    renderGrid();
    animatePageChange(direction);
}

// Optional fade/slide when switching pages (honors reduced-motion).
function animatePageChange(direction) {
    const mode = settings.pageTransition || 'instant';
    if (mode === 'instant') return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cls = mode === 'slide'
        ? (direction > 0 ? 'anim-slide-left' : 'anim-slide-right')
        : 'anim-fade';
    grid.classList.remove('anim-slide-left', 'anim-slide-right', 'anim-fade');
    void grid.offsetWidth; // force reflow so the animation restarts
    grid.classList.add(cls);
    grid.addEventListener('animationend', () => grid.classList.remove(cls), { once: true });
}

// Change how many pages exist; pull any now-out-of-range items onto the last
// page and keep the stepper display in sync.
function setPageCount(n) {
    n = Math.max(1, Math.min(parseInt(n) || 1, 8));
    settings.pageCount = n;
    sites.forEach(it => { if ((it.page || 0) > n - 1) it.page = n - 1; });
    if (currentPage > n - 1) currentPage = n - 1;
    saveState();
    renderGrid();
    if (pageCountDisplay) pageCountDisplay.textContent = n;
    populateLayoutScope(); // the per-page picker gains/loses entries
}

// --- Folder overlay ---
// `tileEl` is the folder icon that was clicked. In the default "anchored"
// style the panel opens right next to that icon and grows out of it, the way
// folders behave on Android/iOS. In "center" style it opens in the middle of
// the screen instead.
function openFolder(folderId, tileEl) {
    const folder = sites.find(it => isFolder(it) && String(it.id) === String(folderId));
    if (!folder) return;
    folderModalTitle.textContent = folder.name;
    folderGrid.innerHTML = '';
    const children = folder.children || [];
    children.forEach(child => {
        const tile = buildShortcutTile(child);
        tile.addEventListener('contextmenu', (e) => openTileMenu(e, child));
        folderGrid.appendChild(tile);
    });
    if (children.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'color:#888;text-align:center;width:100%;';
        empty.textContent = 'This folder is empty. Add shortcuts to it from Settings → Shortcuts.';
        folderGrid.appendChild(empty);
    }

    folderModal.style.display = 'flex';
    placeFolderPanel(children.length, tileEl);
}

// Position the folder panel and set the origin its open animation grows from.
function placeFolderPanel(childCount, tileEl) {
    const panel = folderModal.querySelector('.modal-content');
    if (!panel) return;
    const style = settings.folderOpenStyle || 'around';
    const nearIcon = (style === 'around' || style === 'anchored') && tileEl;

    // Always start from a clean slate so switching styles never leaves
    // stale inline positioning behind.
    panel.classList.remove('folder-pop');
    panel.style.cssText = '';
    folderModal.classList.toggle('anchored-mode', style !== 'center');

    // Folder name placement, panel translucency and optional backdrop blur.
    const titleMode = settings.folderTitle || 'top';
    folderModal.classList.toggle('title-hidden', titleMode === 'hidden');
    folderModal.classList.toggle('title-bottom', titleMode === 'bottom');
    folderModal.classList.toggle('folder-blur', !!settings.folderBlur);
    const alpha = (settings.folderOpacity ?? 100) / 100;
    panel.style.backgroundColor = rgbaFromHex(settings.panelBgColor || '#242424', alpha); // matches --panel-bg

    if (style === 'custom') {
        // Fully user-placed: the icon is ignored, the panel opens at the size
        // and screen position chosen in Settings.
        const gap = 12;
        const pw = Math.min(settings.folderCustomWidth ?? 420, window.innerWidth - gap * 2);
        const ph = Math.min(settings.folderCustomHeight ?? 320, window.innerHeight - gap * 2);
        // X/Y are a percentage of the leftover space, so the panel can never
        // be pushed off screen no matter the size.
        const left = gap + (window.innerWidth - pw - gap * 2) * ((settings.folderCustomX ?? 50) / 100);
        const top = gap + (window.innerHeight - ph - gap * 2) * ((settings.folderCustomY ?? 50) / 100);

        panel.style.margin = '0';
        panel.style.width = `${pw}px`;
        panel.style.height = `${ph}px`;
        panel.style.maxHeight = 'none'; // the custom height wins over the 70vh cap
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.transformOrigin = 'center';
    } else if (nearIcon) {
        sizePanelToContents(panel, childCount);

        // Measure now that the panel is visible and sized; the browser hasn't
        // painted yet, so moving it here causes no visible jump.
        const tile = tileEl.getBoundingClientRect();
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        const gap = 12;
        const tileCx = tile.left + tile.width / 2;
        const tileCy = tile.top + tile.height / 2;

        let left = tileCx - pw / 2;
        let top;
        if (style === 'around') {
            // Wrap the panel around the icon itself, so the shortcuts land
            // right under the cursor instead of off to one side.
            top = tileCy - ph / 2;
        } else {
            // 'anchored': sit just below the icon, flipping above when the
            // panel wouldn't fit underneath.
            top = tile.bottom + gap;
            if (top + ph > window.innerHeight - gap) {
                const above = tile.top - gap - ph;
                top = above >= gap ? above : window.innerHeight - gap - ph;
            }
        }

        // Keep the whole panel on screen.
        left = Math.max(gap, Math.min(left, window.innerWidth - gap - pw));
        top = Math.max(gap, Math.min(top, window.innerHeight - gap - ph));

        panel.style.margin = '0';
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        // Grow out of the icon itself.
        panel.style.transformOrigin = `${tileCx - left}px ${tileCy - top}px`;
    }

    // Replay the open animation (works for both styles). The timeout is a
    // safety net: if 'animationend' never arrives — e.g. the tab was in the
    // background when the folder opened, so the animation never advanced —
    // the panel would otherwise stay frozen at its scaled-down start frame.
    void panel.offsetWidth;
    panel.classList.add('folder-pop');
    const clearPop = () => panel.classList.remove('folder-pop');
    panel.addEventListener('animationend', clearPop, { once: true });
    setTimeout(clearPop, 400);
}

// Width a folder popover needs for its shortcuts, up to 4 across. Measures the
// folder's own tiles, which are scaled by the "Icon Size in Folders" setting.
function sizePanelToContents(panel, childCount) {
    const sample = folderGrid.querySelector('.icon-item') || grid.querySelector('.icon-item');
    const iconWidth = sample ? sample.offsetWidth : 100;
    const colGap = parseFloat(getComputedStyle(folderGrid).columnGap) || 20;
    const cols = Math.max(1, Math.min(4, childCount || 1));
    const padding = 60; // .modal-body (20px each side) + .folder-grid (10px each side)
    const width = cols * iconWidth + (cols - 1) * colGap + padding;
    panel.style.width = `${Math.min(width, window.innerWidth - 24)}px`;
}

// --- Drag and Drop — live reorder within the current page (by id) ---
let dragSourceId = null;

function handleDragStart(e) {
    dragSourceId = this.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSourceId); // required for Firefox
    requestAnimationFrame(() => this.classList.add('dragging'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragSourceId === null) return;

    const targetId = this.dataset.id;
    if (!targetId || targetId === dragSourceId) return;

    const targetItem = findItemById(targetId).item;
    const draggedItem = findItemById(dragSourceId).item;

    // Hovering a folder with a shortcut → highlight it as a drop target
    // (don't reorder; the actual move happens on drop).
    if (isFolder(targetItem) && draggedItem && !isFolder(draggedItem)) {
        this.classList.add('drop-target');
        return;
    }

    // Otherwise live-reorder among the top-level items.
    const fromIdx = sites.findIndex(s => String(s.id) === String(dragSourceId));
    const toIdx = sites.findIndex(s => String(s.id) === String(targetId));
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = sites.splice(fromIdx, 1);
    sites.splice(toIdx, 0, moved);
    renderGrid();

    const draggedEl = grid.querySelector(`.icon-item[data-id="${CSS.escape(dragSourceId)}"]`);
    if (draggedEl) draggedEl.classList.add('dragging');
}

function handleDragLeave() {
    this.classList.remove('drop-target');
}

// Drop a shortcut onto a folder tile → move it inside that folder.
function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-target');
    if (dragSourceId === null) return;
    const targetItem = findItemById(this.dataset.id).item;
    const draggedItem = findItemById(dragSourceId).item;
    if (isFolder(targetItem) && draggedItem && !isFolder(draggedItem)
        && String(targetItem.id) !== String(dragSourceId)) {
        removeItemById(dragSourceId);
        targetItem.children = targetItem.children || [];
        targetItem.children.push(draggedItem);
        dragSourceId = null;
        saveAndRender();
        renderShortcutsList();
    }
}

function handleDragEnd() {
    dragSourceId = null;
    grid.querySelectorAll('.icon-item').forEach(item => item.classList.remove('dragging', 'drop-target'));
    saveState();
}

// =========================================================================
// Dashboard icon matching
// =========================================================================
// The icon list is fetched once per tab and reused by both the per-shortcut
// button and the "match everything" action.
let dashboardIconIndex = null;

async function getDashboardIconIndex() {
    if (dashboardIconIndex) return dashboardIconIndex;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch('https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/tree.json', {
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            signal: controller.signal
        });
        if (!res.ok) throw new Error(`Icon index returned ${res.status}.`);
        const declaredSize = Number(res.headers.get('content-length')) || 0;
        if (declaredSize > 2 * 1024 * 1024) throw new Error('Icon index is unexpectedly large.');
        const tree = await res.json();
        // tree.svg looks like ["youtube.svg", "reddit.svg", "reddit-light.svg"]
        dashboardIconIndex = Array.isArray(tree.svg)
            ? tree.svg.slice(0, 10000)
                .filter(name => typeof name === 'string' && /^[a-z0-9][a-z0-9._-]{0,99}\.svg$/i.test(name))
                .map(name => name.slice(0, -4).toLowerCase())
            : [];
        return dashboardIconIndex;
    } finally {
        clearTimeout(timeout);
    }
}

// Best icon name for a shortcut title, or null when nothing fits.
function findIconMatch(name, icons) {
    const target = (name || '').toLowerCase().trim();
    if (!target) return null;
    const kebab = target.replace(/\s+/g, '-');
    if (icons.includes(kebab)) return kebab;
    if (icons.includes(target)) return target;
    // Some icons only ship a light/dark variant.
    return icons.find(icon => icon === `${kebab}-light` || icon === `${kebab}-dark`) || null;
}

// A pasted URL or an uploaded file is a deliberate choice we shouldn't
// silently replace.
const hasCustomIcon = (site) => site.iconSource === 'url' || site.iconSource === 'file';

// --- Right-click tile menu ---
function openTileMenu(e, item) {
    if (!settings.enableContextMenu || !tileMenu) return;
    e.preventDefault();
    tileMenu.innerHTML = '';

    const addAction = (label, fn) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tile-menu-item';
        b.textContent = label;
        b.onclick = () => { hideTileMenu(); fn(); };
        tileMenu.appendChild(b);
    };

    if (isFolder(item)) {
        addAction('Rename folder', () => renameFolder(item.id));
        addAction('Delete folder', () => deleteFolder(item.id));
    } else {
        addAction('Edit', () => editShortcut(item.id));
        addAction(item.excludeFromOpenAll ? 'Include in "Open All"' : 'Exclude from "Open All"',
            () => toggleExclude(item.id));
        addAction('Delete', () => deleteShortcut(item.id));
    }

    // Show, then position so the menu stays on screen.
    tileMenu.style.display = 'block';
    let x = e.clientX, y = e.clientY;
    if (x + tileMenu.offsetWidth > window.innerWidth) x = window.innerWidth - tileMenu.offsetWidth - 8;
    if (y + tileMenu.offsetHeight > window.innerHeight) y = window.innerHeight - tileMenu.offsetHeight - 8;
    tileMenu.style.left = `${x}px`;
    tileMenu.style.top = `${y}px`;
}

function hideTileMenu() {
    if (tileMenu) tileMenu.style.display = 'none';
}

function toggleExclude(id) {
    const { item } = findItemById(id);
    if (!item) return;
    item.excludeFromOpenAll = !item.excludeFromOpenAll;
    saveState();
    renderShortcutsList();
}

// --- Folder management (uses the styled folder modal, not prompt) ---
function addFolder() {
    openFolderEdit(null);
}

function renameFolder(id) {
    const folder = sites.find(it => isFolder(it) && String(it.id) === String(id));
    if (folder) openFolderEdit(folder);
}

function openFolderEdit(folder) {
    if (!folderEditModal) return;
    folderEditId.value = folder ? folder.id : '';
    folderEditName.value = folder ? folder.name : '';
    folderEditColor.value = (folder && folder.color) ? folder.color : '#ffffff';
    folderEditTitle.textContent = folder ? 'Edit Folder' : 'New Folder';
    folderEditModal.style.display = 'flex';
    setTimeout(() => folderEditName.focus(), 50);
}

function deleteFolder(id) {
    const folder = sites.find(it => isFolder(it) && String(it.id) === String(id));
    if (!folder) return;
    const kids = folder.children || [];
    const msg = kids.length
        ? `Delete folder "${folder.name}"? Its ${kids.length} shortcut(s) will move back onto the page.`
        : `Delete folder "${folder.name}"?`;
    if (!confirm(msg)) return;
    // Replace the folder with its children (kept on the folder's page).
    const index = sites.indexOf(folder);
    const freed = kids.map(c => ({ ...c, page: folder.page || 0 }));
    sites.splice(index, 1, ...freed);
    saveAndRender();
    renderShortcutsList();
}

// --- Keyboard: number-key launch (1-9) + page arrows ---
function handleGlobalKeys(e) {
    const el = document.activeElement;
    const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (e.key === 'Escape') { hideTileMenu(); return; }

    // Don't hijack keys while typing or while a dialog is open.
    const modalOpen = [settingsModal, shortcutModal, folderModal]
        .some(m => m && getComputedStyle(m).display !== 'none');
    if (typing || modalOpen) return;

    if (settings.enableNumberKeys && /^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only opens a shortcut you've explicitly assigned this digit to.
        // Scope decides where to look: every shortcut, or just the current page.
        const pool = settings.hotkeyScope === 'page' ? shortcutsOnCurrentPage() : getAllShortcuts();
        const assigned = pool.find(s => String(s.hotkey) === e.key);
        if (assigned) {
            e.preventDefault();
            openShortcutUrl(assigned.url, settings.openShortcutsNewTab);
        }
        return;
    }

    if ((settings.pageCount || 1) > 1) {
        if (e.key === 'ArrowRight') goToPage(currentPage + 1);
        else if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
    }
}

function renderShortcutsList() {
    shortcutsList.innerHTML = '';
    const multiPage = (settings.pageCount || 1) > 1;

    // One management row (a shortcut, a folder header, or a folder child).
    const makeRow = (item, { folder = false, child = false } = {}) => {
        const div = document.createElement('div');
        div.className = 'shortcut-manage-item' + (child ? ' child-item' : '');
        div.dataset.id = item.id;
        // Shortcuts (top-level or inside folders) can be dragged…
        if (!folder) {
            div.draggable = true;
            div.addEventListener('dragstart', listDragStart);
            div.addEventListener('dragend', listDragEnd);
        }
        // …and dropped onto a folder header (move in) or a top-level row (reorder).
        if (!child) {
            div.dataset.kind = folder ? 'folder' : 'top';
            div.addEventListener('dragover', listDragOver);
            div.addEventListener('dragleave', listDragLeave);
            div.addEventListener('drop', listDrop);
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'shortcut-info';
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = (folder ? '📁 ' : '') + item.name;
        const small = document.createElement('small');
        if (folder) {
            small.textContent = `${(item.children || []).length} shortcut(s)` + (multiPage ? ` · Page ${itemPage(item) + 1}` : '');
        } else {
            small.textContent = item.url + (!child && multiPage ? ` · Page ${itemPage(item) + 1}` : '');
        }
        infoDiv.appendChild(nameStrong);
        infoDiv.appendChild(document.createElement('br'));
        infoDiv.appendChild(small);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'shortcut-actions';
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.onclick = folder ? () => renameFolder(item.id) : () => editShortcut(item.id);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = folder ? () => deleteFolder(item.id) : () => deleteShortcut(item.id);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);
        return div;
    };

    sites.forEach(item => {
        if (isFolder(item)) {
            shortcutsList.appendChild(makeRow(item, { folder: true }));
            (item.children || []).forEach(child => shortcutsList.appendChild(makeRow(child, { child: true })));
        } else {
            shortcutsList.appendChild(makeRow(item));
        }
    });
}

// --- Bookmarks Logic ---

let bookmarkFoldersLoaded = false;

function requestBookmarkPermission() {
    return new Promise((resolve) => {
        if (typeof chrome === 'undefined' || !chrome.permissions || !chrome.permissions.request) {
            resolve(false);
            return;
        }
        chrome.permissions.request({ permissions: ['bookmarks'] }, (granted) => {
            if (chrome.runtime.lastError) {
                console.warn('Bookmark permission request failed:', chrome.runtime.lastError.message);
                resolve(false);
                return;
            }
            resolve(granted === true);
        });
    });
}

function loadBookmarkFolders() {
    return new Promise((resolve) => {
        if (!chrome.bookmarks) {
            bookmarkFoldersSort.replaceChildren(new Option('Bookmarks API not available', ''));
            resolve(false);
            return;
        }

        chrome.bookmarks.getTree((tree) => {
            if (chrome.runtime.lastError || !Array.isArray(tree) || !tree[0]) {
                console.warn('Could not read bookmark folders:', chrome.runtime.lastError?.message || 'Invalid response');
                bookmarkFoldersSort.replaceChildren(new Option('Could not load bookmarks', ''));
                resolve(false);
                return;
            }
            const folders = [];

            function traverse(node, depth = 0) {
                if (node.children) {
                    if (depth > 0) folders.push({ id: node.id, title: node.title, depth });
                    node.children.forEach(child => traverse(child, depth + 1));
                }
            }

            (tree[0].children || []).forEach(child => traverse(child, 1));
            bookmarkFoldersSort.replaceChildren();
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = '-'.repeat(folder.depth - 1) + ' ' + folder.title;
                bookmarkFoldersSort.appendChild(option);
            });
            bookmarkFoldersSort.disabled = folders.length === 0;
            bookmarkFoldersLoaded = folders.length > 0;
            importBookmarksBtn.textContent = bookmarkFoldersLoaded ? 'Import' : 'Load Bookmarks';
            resolve(bookmarkFoldersLoaded);
        });
    });
}

async function importBookmarks() {
    if (!bookmarkFoldersLoaded) {
        const granted = await requestBookmarkPermission();
        if (!granted) {
            alert('Bookmark access was not granted. You can still add shortcuts manually.');
            return;
        }
        const loaded = await loadBookmarkFolders();
        if (!loaded) alert('No bookmark folders were found.');
        return;
    }

    const folderId = bookmarkFoldersSort.value;
    if (!folderId) return;

    if (!chrome.bookmarks) {
        alert("Bookmarks API not available.");
        return;
    }

    chrome.bookmarks.getChildren(folderId, (children) => {
        if (chrome.runtime.lastError || !Array.isArray(children)) {
            alert('Could not read that bookmark folder.');
            return;
        }
        let importedCount = 0;
        let skippedCount = 0;
        children.forEach(node => {
            const url = normalizeShortcutUrl(node.url);
            if (url) {
                sites.push({
                    id: Date.now().toString() + Math.random().toString().slice(2, 5),
                    name: (node.title || new URL(url).hostname).slice(0, 120),
                    url,
                    color: '#ffffff',
                    iconSource: 'favicon',
                    iconValue: '',
                    page: currentPage
                });
                importedCount++;
            } else if (node.url) skippedCount++;
        });

        if (importedCount > 0) {
            saveAndRender();
            renderShortcutsList();
            alert(`Imported ${importedCount} bookmark(s).` + (skippedCount ? ` Skipped ${skippedCount} non-web link(s).` : ''));
        } else {
            alert("No bookmarks found in this folder.");
        }
    });
}

// --- Event Listeners ---

function setupEventListeners() {
    // Settings Modal
    settingsBtn.onclick = () => {
        settingsModal.style.display = 'flex';
        renderShortcutsList();
        renderThemeUI();
    };
    closeSettings.onclick = () => settingsModal.style.display = 'none';

    window.onclick = (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === shortcutModal) shortcutModal.style.display = 'none';
        if (e.target === folderModal) folderModal.style.display = 'none';
        if (e.target === folderEditModal) folderEditModal.style.display = 'none';
    };

    // --- Drag Logic for Settings Modal ---
    const modalContent = settingsModal.querySelector('.modal-content');
    const modalHeader = settingsModal.querySelector('.modal-header');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    modalHeader.onmousedown = (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        // Get current position
        const rect = modalContent.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        // Switch to absolute positioning on first drag
        modalContent.style.margin = '0';
        modalContent.style.left = `${initialLeft}px`;
        modalContent.style.top = `${initialTop}px`;
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        modalContent.style.left = `${initialLeft + dx}px`;
        modalContent.style.top = `${initialTop + dy}px`;
    };

    document.onmouseup = () => {
        isDragging = false;
    };

    // Tabs
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        };
    });

    // Debounced save for rapid-fire inputs (sliders, color pickers)
    const debouncedSaveAndApply = debounce(() => {
        saveState();
        applySettings();
    }, 100);

    // Helper to sync slider and number input with immediate visual feedback
    const setupSync = (sliderId, numId, settingKey, isInt = true) => {
        const slider = document.getElementById(sliderId);
        const num = document.getElementById(numId);
        if (!slider || !num) return;

        slider.oninput = (e) => {
            const val = isInt ? parseInt(e.target.value) : e.target.value;
            if (isInt && !Number.isFinite(val)) return;
            setLayoutValue(settingKey, val);
            num.value = val;
            applySettings(); // Immediate visual update (CSS vars only, cheap)
            debouncedSaveAndApply(); // Debounced localStorage write
        };

        num.oninput = (e) => {
            let val = isInt ? parseInt(e.target.value) : e.target.value;
            if (isInt && !Number.isFinite(val)) return;
            if (slider.min && val < parseInt(slider.min)) val = parseInt(slider.min);
            if (slider.max && val > parseInt(slider.max)) val = parseInt(slider.max);
            setLayoutValue(settingKey, val);
            slider.value = val;
            applySettings();
            debouncedSaveAndApply();
        };

        // Optional per-slider "reset to default" button (id = sliderId + 'Reset').
        const reset = document.getElementById(sliderId + 'Reset');
        if (reset) {
            reset.onclick = () => {
                // When editing one page, 'reset' drops its override so the page
                // follows the global value again; otherwise restore the default.
                if (layoutScope !== 'global' && PAGE_LAYOUT_KEYS.includes(settingKey)
                    && settings.pageOverrides && settings.pageOverrides[layoutScope]) {
                    delete settings.pageOverrides[layoutScope][settingKey];
                } else {
                    settings[settingKey] = defaultSettings[settingKey];
                }
                const val = layoutValue(settingKey);
                slider.value = val;
                num.value = val;
                applySettings();
                saveState();
            };
        }
    };

    // Layout Settings
    setupSync('iconSize', 'iconSizeValInput', 'iconSize');
    setupSync('gridRowGap', 'gridRowGapValInput', 'gridRowGap');
    setupSync('gridColGap', 'gridColGapValInput', 'gridColGap');
    setupSync('gridOffset', 'gridOffsetValInput', 'gridVerticalOffset');
    setupSync('colCount', 'colCountValInput', 'colCount');

    // Font controls
    if (fontSourceInput) {
        fontSourceInput.onchange = async (e) => {
            // Reclaim the IndexedDB space used by the source we're leaving.
            if (settings.fontSource === 'upload' && settings.fontValue.startsWith('idb:')) {
                await deleteImageFromDB(settings.fontValue).catch(console.error);
            } else if (settings.fontSource === 'url' && settings.fontValue) {
                await deleteImageFromDB(GFONT_PREFIX + settings.fontValue).catch(console.error);
            }
            settings.fontSource = e.target.value;
            // Seed a sensible value so the new source works without extra clicks.
            settings.fontValue = e.target.value === 'system'
                ? (fontSystemSelect ? fontSystemSelect.value : 'system-ui, sans-serif')
                : '';
            saveState();
            applyFont();
            applySettings();
        };
    }
    if (fontSystemSelect) {
        fontSystemSelect.onchange = (e) => {
            settings.fontValue = e.target.value;
            saveState();
            applyFont();
        };
    }
    if (fontUrlInput) {
        // 'change' (not 'input') so we download the font once the user finishes
        // typing the URL, not on every keystroke.
        fontUrlInput.onchange = async (e) => {
            if (settings.fontSource !== 'url') return;
            const entered = e.target.value.trim();
            const next = entered ? normalizeGoogleFontStylesheetUrl(entered) : '';
            if (entered && !next) {
                alert('Enter a Google Fonts CSS URL beginning with https://fonts.googleapis.com/css or /css2.');
                e.target.value = settings.fontValue || '';
                return;
            }
            // Drop the previous font's cached copy if the URL actually changed.
            if (settings.fontValue && settings.fontValue !== next) {
                await deleteImageFromDB(GFONT_PREFIX + settings.fontValue).catch(console.error);
            }
            settings.fontValue = next;
            saveState();
            applyFont();
        };
    }
    if (fontUploadInput) {
        fontUploadInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file || settings.fontSource !== 'upload') return;
            try {
                const dataUrl = await readFileAsDataURL(file, 'font', 5 * 1024 * 1024);
                await saveImageToDB('idb:font', dataUrl); // also fills imageCache
                settings.fontValue = 'idb:font';
                saveState();
                applyFont();
            } catch (err) {
                console.error('Error reading font file', err);
                alert('Failed to load that font file.');
            }
        };
    }

    // Label controls
    setupSync('labelScale', 'labelScaleValInput', 'labelScale');
    if (labelColorInput) labelColorInput.oninput = (e) => { settings.labelColor = e.target.value; applySettings(); debouncedSaveAndApply(); };
    if (labelWeightInput) labelWeightInput.onchange = (e) => { settings.labelWeight = parseInt(e.target.value); saveState(); applySettings(); };

    // Theme: accent, gradient, custom CSS, presets
    if (accentColorInput) accentColorInput.oninput = (e) => { settings.accentColor = e.target.value; applySettings(); debouncedSaveAndApply(); };
    // Choosing a color overrides the default; the reset button hands control
    // back (and for the selected tab, back to the accent color).
    const setupPanelColor = (input, key) => {
        if (input) {
            input.oninput = (e) => { settings[key] = e.target.value; applySettings(); debouncedSaveAndApply(); };
        }
        const reset = document.getElementById(key + 'Reset');
        if (reset) {
            reset.onclick = () => { settings[key] = ''; saveState(); applySettings(); };
        }
    };
    setupPanelColor(panelBgColorInput, 'panelBgColor');
    setupPanelColor(panelAltColorInput, 'panelAltColor');
    setupPanelColor(panelTextColorInput, 'panelTextColor');
    setupPanelColor(panelTabColorInput, 'panelTabColor');

    // Settings icon
    setupSync('settingsIconOpacity', 'settingsIconOpacityValInput', 'settingsIconOpacity');
    setupSync('settingsIconSize', 'settingsIconSizeValInput', 'settingsIconSize');
    if (settingsIconPositionInput) settingsIconPositionInput.onchange = (e) => { settings.settingsIconPosition = e.target.value; saveState(); applySettingsIcon(); };
    if (settingsIconSourceInput) {
        settingsIconSourceInput.onchange = (e) => {
            settings.settingsIconSource = e.target.value;
            settings.settingsIconValue = ''; // start clean when switching source
            saveState();
            applySettingsIcon();
        };
    }
    if (settingsIconUrlInput) {
        settingsIconUrlInput.oninput = (e) => {
            if (settings.settingsIconSource !== 'url') return;
            settings.settingsIconValue = normalizeHttpsResourceUrl(e.target.value) || '';
            applySettingsIcon();
            debouncedSaveAndApply();
        };
    }
    if (settingsIconFileInput) {
        settingsIconFileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file || settings.settingsIconSource !== 'file') return;
            try {
                const dataUrl = await readFileAsDataURL(file, 'image', 10 * 1024 * 1024);
                settings.settingsIconValue = await resizeImage(dataUrl, 128);
                saveState();
                applySettingsIcon();
            } catch (err) {
                console.error('Error reading settings icon file', err);
                alert('Failed to load that image.');
            }
        };
    }
    if (settingsIconGlyphInput) settingsIconGlyphInput.oninput = (e) => { settings.settingsIconGlyph = e.target.value || '\u2699\uFE0F'; applySettingsIcon(); debouncedSaveAndApply(); };
    if (settingsIconHiddenInput) {
        settingsIconHiddenInput.onchange = (e) => {
            if (e.target.checked) {
                const where = (settings.settingsIconPosition || 'top-right').replace('-', ' ');
                const warning = 'WARNING\n\n'
                    + 'The settings icon will become completely invisible.\n\n'
                    + `It still works: click the same spot in the ${where} corner of the page.\n\n`
                    + 'If you lose it, click the New Tab icon in your browser toolbar and choose '
                    + '"Open Settings" to get back here.\n\n'
                    + 'Hide the icon?';
                if (!confirm(warning)) { e.target.checked = false; return; }
            }
            settings.settingsIconHidden = e.target.checked;
            saveState();
            applySettingsIcon();
        };
    }
    if (gradColor1Input) gradColor1Input.oninput = (e) => { settings.gradientColor1 = e.target.value; applySettings(); debouncedSaveAndApply(); };
    if (gradColor2Input) gradColor2Input.oninput = (e) => { settings.gradientColor2 = e.target.value; applySettings(); debouncedSaveAndApply(); };
    if (gradAngleInput) gradAngleInput.onchange = (e) => { settings.gradientAngle = e.target.value; saveState(); applySettings(); };
    if (customCssInput) customCssInput.oninput = (e) => { settings.customCss = e.target.value; applyCustomCss(); debouncedSaveAndApply(); };
    if (themeSaveBtn) themeSaveBtn.onclick = () => { saveCurrentTheme(themeNameInput ? themeNameInput.value : ''); if (themeNameInput) themeNameInput.value = ''; };

    // Pages (stepper + transition)
    if (pageMinusBtn) pageMinusBtn.onclick = () => setPageCount((settings.pageCount || 1) - 1);
    if (pagePlusBtn) pagePlusBtn.onclick = () => setPageCount((settings.pageCount || 1) + 1);
    if (pageTransitionInput) pageTransitionInput.onchange = (e) => { settings.pageTransition = e.target.value; saveState(); };

    // Interaction toggles
    if (enableNumberKeysInput) enableNumberKeysInput.onchange = (e) => { settings.enableNumberKeys = e.target.checked; saveState(); };
    if (hotkeyScopeInput) hotkeyScopeInput.onchange = (e) => { settings.hotkeyScope = e.target.value; saveState(); };
    if (showHotkeyBadgeInput) showHotkeyBadgeInput.onchange = (e) => { settings.showHotkeyBadge = e.target.checked; saveState(); renderGrid(); };
    if (folderOpenStyleInput) {
        folderOpenStyleInput.onchange = (e) => {
            settings.folderOpenStyle = e.target.value;
            saveState();
            updateFolderInputsDisplay();
        };
    }
    setupSync('folderIconScale', 'folderIconScaleValInput', 'folderIconScale');
    setupSync('folderPadding', 'folderPaddingValInput', 'folderPadding');
    setupSync('folderGap', 'folderGapValInput', 'folderGap');
    setupSync('folderOpacity', 'folderOpacityValInput', 'folderOpacity');
    setupSync('pageArrowSize', 'pageArrowSizeValInput', 'pageArrowSize');
    setupSync('pageArrowOpacity', 'pageArrowOpacityValInput', 'pageArrowOpacity');
    setupSync('pageArrowGap', 'pageArrowGapValInput', 'pageArrowGap');
    if (folderTitleInput) folderTitleInput.onchange = (e) => { settings.folderTitle = e.target.value; saveState(); };
    if (folderBlurInput) folderBlurInput.onchange = (e) => { settings.folderBlur = e.target.checked; saveState(); };

    // Page navigation
    if (pageArrowsInput) pageArrowsInput.onchange = (e) => { settings.pageArrows = e.target.value; saveState(); applySettings(); renderPageArrows(); };
    if (pageArrowStyleInput) pageArrowStyleInput.onchange = (e) => { settings.pageArrowStyle = e.target.value; saveState(); renderPageArrows(); };
    if (pageArrowPositionInput) pageArrowPositionInput.onchange = (e) => { settings.pageArrowPosition = e.target.value; saveState(); applySettings(); renderPageArrows(); };
    if (pageArrowAnchorInput) pageArrowAnchorInput.onchange = (e) => { settings.pageArrowAnchor = e.target.value; saveState(); renderPageArrows(); };
    if (pageArrowColorInput) pageArrowColorInput.oninput = (e) => { settings.pageArrowColor = e.target.value; renderPageArrows(); debouncedSaveAndApply(); };
    if (showPageDotsInput) showPageDotsInput.onchange = (e) => { settings.showPageDots = e.target.checked; saveState(); renderPageDots(); };
    if (pagePrevBtn) pagePrevBtn.onclick = () => stepPage(-1);
    if (pageNextBtn) pageNextBtn.onclick = () => stepPage(1);

    // Which page the Layout tab edits (switching also jumps to that page,
    // so any change you make is visible straight away).
    if (layoutScopeInput) {
        layoutScopeInput.onchange = (e) => {
            layoutScope = e.target.value === 'global' ? 'global' : parseInt(e.target.value, 10);
            if (layoutScope !== 'global') goToPage(layoutScope);
            applySettings();
        };
    }
    if (layoutScopeClearBtn) {
        layoutScopeClearBtn.onclick = () => {
            if (layoutScope === 'global') return;
            clearPageOverrides(layoutScope);
            saveState();
            applySettings();
            renderGrid();
        };
    }
    setupSync('folderCustomX', 'folderCustomXValInput', 'folderCustomX');
    setupSync('folderCustomY', 'folderCustomYValInput', 'folderCustomY');
    setupSync('folderCustomWidth', 'folderCustomWidthValInput', 'folderCustomWidth');
    setupSync('folderCustomHeight', 'folderCustomHeightValInput', 'folderCustomHeight');
    if (enableContextMenuInput) enableContextMenuInput.onchange = (e) => { settings.enableContextMenu = e.target.checked; saveState(); };
    if (confirmOpenAllInput) confirmOpenAllInput.onchange = (e) => { settings.confirmOpenAll = e.target.checked; saveState(); };

    // Folders
    if (addFolderBtn) addFolderBtn.onclick = addFolder;
    if (siteFolderInput) siteFolderInput.onchange = updateSitePageVisibility;
    if (folderClose) folderClose.onclick = () => folderModal.style.display = 'none';
    if (folderEditClose) folderEditClose.onclick = () => folderEditModal.style.display = 'none';
    if (folderEditForm) {
        folderEditForm.onsubmit = (e) => {
            e.preventDefault();
            const name = folderEditName.value.trim();
            if (!name) return;
            const id = folderEditId.value;
            if (id) {
                const folder = sites.find(it => isFolder(it) && String(it.id) === String(id));
                if (folder) { folder.name = name; folder.color = folderEditColor.value; }
            } else {
                sites.push({ id: Date.now().toString(), type: 'folder', name, color: folderEditColor.value, page: currentPage, children: [] });
            }
            saveAndRender();
            renderShortcutsList();
            folderEditModal.style.display = 'none';
        };
    }

    // Right-click menu dismissal + keyboard shortcuts (number keys, page arrows)
    document.addEventListener('click', hideTileMenu);
    document.addEventListener('scroll', hideTileMenu, true);
    document.addEventListener('keydown', handleGlobalKeys);

    showIconBgInput.onchange = (e) => { settings.showIconBg = e.target.checked; saveState(); applySettings(); };
    if (iconShapeInput) iconShapeInput.onchange = (e) => { settings.iconShape = e.target.value; saveState(); applySettings(); };
    if (iconBgColorInput) iconBgColorInput.oninput = (e) => { settings.iconBgColor = e.target.value; applySettings(); debouncedSaveAndApply(); };

    showLabelsInput.onchange = (e) => { settings.showLabels = e.target.checked; saveState(); applySettings(); };

    if (showOpenAllInput) {
        showOpenAllInput.onchange = (e) => { settings.showOpenAll = e.target.checked; saveState(); applySettings(); };
    }

    // Open All Button click handler (set once, not on every applySettings)
    if (openAllBtn) {
        openAllBtn.onclick = () => {
            const toOpen = getAllShortcuts().filter(s => !s.excludeFromOpenAll);
            if (toOpen.length === 0) {
                alert("No sites to open (all are excluded or the list is empty).");
                return;
            }
            // Skip the confirmation entirely when the user has turned it off.
            if (settings.confirmOpenAll !== false && toOpen.length > 5 && !confirm(`Open ${toOpen.length} sites?`)) return;
            toOpen.forEach(site => openShortcutUrl(site.url, true));
        };
    }

    if (openAllTextInput) openAllTextInput.oninput = (e) => { settings.openAllText = e.target.value; saveState(); applySettings(); };
    if (openAllColorInput) openAllColorInput.oninput = (e) => { settings.openAllColor = e.target.value; applySettings(); debouncedSaveAndApply(); };
    if (openAllShapeInput) openAllShapeInput.onchange = (e) => { settings.openAllShape = e.target.value; saveState(); applySettings(); };
    if (openAllPositionInput) openAllPositionInput.onchange = (e) => { settings.openAllPosition = e.target.value; saveState(); applySettings(); };

    // Search Settings
    if (showSearchInput) showSearchInput.onchange = (e) => { settings.showSearch = e.target.checked; saveState(); applySettings(); };
    if (searchIconStyleInput) {
        searchIconStyleInput.onchange = async (e) => {
            settings.searchIconStyle = e.target.value;
            if (settings.searchIconValue && settings.searchIconValue.startsWith('idb:')) {
                await deleteImageFromDB(settings.searchIconValue).catch(console.error);
            }
            settings.searchIconValue = '';
            saveState();
            applySettings();
            updateSearchIconInputsDisplay();
        };
    }
    if (searchIconUrlInput) {
        searchIconUrlInput.oninput = (e) => {
            if (settings.searchIconStyle === 'url') {
                settings.searchIconValue = normalizeHttpsResourceUrl(e.target.value) || '';
                saveState();
                applySettings();
            }
        };
    }
    if (searchIconFileInput) {
        searchIconFileInput.onchange = async (e) => {
            if (e.target.files[0] && settings.searchIconStyle === 'file') {
                try {
                    const dataUrl = await readFileAsDataURL(e.target.files[0], 'image', 10 * 1024 * 1024);
                    settings.searchIconValue = await resizeImage(dataUrl, 256);
                    saveState();
                    applySettings();
                } catch (err) {
                    console.error("Error reading search icon file", err);
                    alert("Failed to load icon.");
                }
            }
        };
    }
    if (searchPositionInput) searchPositionInput.onchange = (e) => { settings.searchPosition = e.target.value; saveState(); applySettings(); };
    setupSync('searchMargin', 'searchMarginValInput', 'searchMargin');
    setupSync('searchWidth', 'searchWidthValInput', 'searchWidth');
    setupSync('searchHeight', 'searchHeightValInput', 'searchHeight');
    setupSync('searchTextSize', 'searchTextSizeValInput', 'searchTextSize');
    setupSync('searchRadius', 'searchRadiusValInput', 'searchRadius');
    if (openSearchNewTabInput) openSearchNewTabInput.onchange = (e) => { settings.openSearchNewTab = e.target.checked; saveState(); };

    // Search Submit (Chrome Search API)
    if (searchForm) {
        searchForm.onsubmit = async (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;

            // Use Chrome Search API to respect user's default engine
            const disposition = settings.openSearchNewTab ? 'NEW_TAB' : 'CURRENT_TAB';

            try {
                if (!chrome.search || !chrome.search.query) throw new Error('Chrome Search API is unavailable.');
                await chrome.search.query({ text: query, disposition });
            } catch (err) {
                console.error("Search failed:", err);
                alert('Search failed. Check that the extension still has search permission.');
            }
        };
    }
    bgTypeInput.onchange = async (e) => {
        settings.bgType = e.target.value;
        if (settings.bgValue && settings.bgValue.startsWith('idb:')) {
            await deleteImageFromDB(settings.bgValue).catch(console.error);
        }
        settings.bgValue = '';
        saveState();
        applySettings();
        updateBgInputsDisplay();
    };

    bgColorInput.oninput = (e) => { settings.bgValue = e.target.value; applySettings(); debouncedSaveAndApply(); };
    bgUrlInput.oninput = (e) => { settings.bgValue = normalizeHttpsResourceUrl(e.target.value) || ''; saveState(); applySettings(); };
    setupSync('bgBlur', 'bgBlurValInput', 'bgBlur');

    bgFileInput.onchange = async (e) => {
        if (e.target.files[0]) {
            try {
                const dataUrl = await readFileAsDataURL(e.target.files[0], 'image', 15 * 1024 * 1024);
                settings.bgValue = await resizeImage(dataUrl, 3840, 0.95);
                saveState();
                applySettings();
            } catch (err) {
                console.error("Error reading background file", err);
                alert("Failed to load image. It might be too large for local storage.");
            }
        }
    };

    // Bookmarks Import
    importBookmarksBtn.onclick = importBookmarks;

    // Backup & Restore
    if (exportDataBtn) {
        exportDataBtn.onclick = async () => {
            const dbImages = await getAllImagesFromDB().catch(() => ({}));
            // Don't export cached favicons — they regenerate automatically.
            const images = {};
            for (const key of Object.keys(dbImages)) {
                if (!key.startsWith(FAV_PREFIX)) images[key] = dbImages[key];
            }
            const dataStr = JSON.stringify({
                formatVersion: 1,
                extensionVersion: chrome.runtime.getManifest().version,
                exportedAt: new Date().toISOString(),
                sites,
                settings,
                images
            });
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NewTab_Backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (importDataBtn) {
        importDataBtn.onclick = () => importDataInput.click();
    }

    if (importDataInput) {
        importDataInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 20 * 1024 * 1024) {
                alert('That backup is too large. The maximum supported size is 20 MB.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const imported = sanitizeBackup(data, defaultSettings);
                    for (const key of Object.keys(imported.images)) {
                        await saveImageToDB(key, imported.images[key]);
                    }
                    sites = imported.sites;
                    settings = imported.settings;
                    saveAndRender();
                    await applyFont();
                    renderShortcutsList();
                    renderThemeUI();
                    alert('Configuration imported successfully.');
                } catch (err) {
                    alert(`Invalid backup file: ${err.message}`);
                    console.error(err);
                }
            };
            reader.onerror = () => alert('Could not read that backup file.');
            reader.readAsText(file);
            e.target.value = ''; // Reset input
        };
    }

    // Reset every setting to default while keeping the user's shortcuts.
    if (resetSettingsBtn) {
        resetSettingsBtn.onclick = () => {
            if (!confirm('Reset all settings to their defaults?\n\nYour shortcuts will be kept.')) return;
            settings = JSON.parse(JSON.stringify(defaultSettings)); // fresh copy; sites untouched
            saveState();
            applyFont();
            applySettings();
            renderGrid();
            renderShortcutsList();
            renderThemeUI();
        };
    }

    // Tab Customization Listeners
    if (tabTitleInput) {
        tabTitleInput.oninput = (e) => {
            settings.tabTitle = e.target.value;
            document.title = e.target.value || 'New Tab';
            debouncedSaveAndApply();
        };
    }

    if (tabFaviconSourceInput) {
        tabFaviconSourceInput.onchange = async (e) => {
            settings.tabFaviconSource = e.target.value;
            if (settings.tabFaviconValue && settings.tabFaviconValue.startsWith('idb:')) {
                await deleteImageFromDB(settings.tabFaviconValue).catch(console.error);
            }
            settings.tabFaviconValue = '';
            if (e.target.value === 'color') settings.tabFaviconValue = '#3f51b5';
            saveState();
            applySettings();
            updateTabFaviconInputsDisplay();
        };
    }

    if (tabFaviconColorInput) {
        tabFaviconColorInput.oninput = (e) => {
            if (settings.tabFaviconSource === 'color') {
                settings.tabFaviconValue = e.target.value;
                applySettings();
                debouncedSaveAndApply();
            }
        };
    }

    if (tabFaviconUrlInput) {
        tabFaviconUrlInput.oninput = (e) => {
            if (settings.tabFaviconSource === 'url') {
                settings.tabFaviconValue = normalizeHttpsResourceUrl(e.target.value) || '';
                saveState();
                applySettings();
            }
        };
    }

    if (tabFaviconFileInput) {
        tabFaviconFileInput.onchange = async (e) => {
            if (e.target.files[0] && settings.tabFaviconSource === 'file') {
                try {
                    const dataUrl = await readFileAsDataURL(e.target.files[0], 'image', 10 * 1024 * 1024);
                    settings.tabFaviconValue = await resizeImage(dataUrl, 256);
                    saveState();
                    applySettings();
                } catch (err) {
                    console.error("Error reading favicon file", err);
                    alert("Failed to load icon.");
                }
            }
        };
    }

    // Shortcut Modal
    addShortcutBtn.onclick = () => {
        openShortcutModal();
    };

    if (autoMatchIconsBtn) {
        autoMatchIconsBtn.onclick = async () => {
            const btn = autoMatchIconsBtn;
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Matching...';

            try {
                const icons = await getDashboardIconIndex();
                let applied = 0;
                const conflicts = []; // shortcuts that already have a custom icon

                getAllShortcuts().forEach(site => {
                    const match = findIconMatch(site.name, icons);
                    if (!match) return;
                    if (hasCustomIcon(site)) { conflicts.push({ site, match }); return; }
                    if (site.iconSource !== 'dashboardicons' || site.iconValue !== match) {
                        site.iconSource = 'dashboardicons';
                        site.iconValue = match;
                        applied++;
                    }
                });

                // Never overwrite a hand-picked icon without asking first.
                let replaced = 0;
                if (conflicts.length > 0) {
                    const names = conflicts.map(c => `\u2022 ${c.site.name}`).join('\n');
                    const ask = `These shortcuts already have a custom icon:\n\n${names}\n\n`
                        + `Replace them with matching icons too?`;
                    if (confirm(ask)) {
                        for (const { site, match } of conflicts) {
                            if (site.iconValue && String(site.iconValue).startsWith('idb:')) {
                                await deleteImageFromDB(site.iconValue).catch(() => {});
                            }
                            site.iconSource = 'dashboardicons';
                            site.iconValue = match;
                            replaced++;
                        }
                    }
                }

                const total = applied + replaced;
                if (total > 0) {
                    saveAndRender();
                    renderShortcutsList();
                    alert(`Matched ${total} icon(s).` + (replaced ? ` ${replaced} custom icon(s) replaced.` : ''));
                } else if (conflicts.length > 0) {
                    alert('No changes made.');
                } else {
                    alert('No new icon matches found.');
                }
            } catch (err) {
                console.error('Auto-match failed:', err);
                alert('Could not reach the icon database. Please try again later.');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        };
    }

    // Match just the shortcut currently open in the Add/Edit dialog.
    if (matchThisIconBtn) {
        matchThisIconBtn.onclick = async () => {
            const name = siteNameInput.value.trim();
            if (!name) { alert('Give the shortcut a name first.'); return; }
            const originalText = matchThisIconBtn.textContent;
            matchThisIconBtn.disabled = true;
            matchThisIconBtn.textContent = 'Matching...';
            try {
                const icons = await getDashboardIconIndex();
                const match = findIconMatch(name, icons);
                if (!match) {
                    alert(`No icon found for \"${name}\".`);
                    return;
                }
                iconSourceInput.value = 'dashboardicons';
                iconSourceInput.onchange();
                iconDashboardInput.value = match;
            } catch (err) {
                console.error('Auto-match failed:', err);
                alert('Could not reach the icon database. Please try again later.');
            } finally {
                matchThisIconBtn.disabled = false;
                matchThisIconBtn.textContent = originalText;
            }
        };
    }

    closeShortcut.onclick = () => shortcutModal.style.display = 'none';

    iconSourceInput.onchange = () => {
        const val = iconSourceInput.value;
        iconUrlGroup.style.display = val === 'url' ? 'block' : 'none';
        iconFileGroup.style.display = val === 'file' ? 'block' : 'none';
        if (iconDashboardGroup) iconDashboardGroup.style.display = val === 'dashboardicons' ? 'block' : 'none';
    };

    shortcutForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = editIdInput.value || Date.now().toString();
        const existing = editIdInput.value ? findItemById(id).item : null;

        let iconValue = '';
        if (iconSourceInput.value === 'url') {
            iconValue = normalizeHttpsResourceUrl(iconUrlInput.value);
            if (!iconValue) {
                alert('Custom image URLs must use HTTPS.');
                return;
            }
        } else if (iconSourceInput.value === 'dashboardicons') {
            iconValue = iconDashboardInput.value.trim().toLowerCase();
            if (!/^[a-z0-9][a-z0-9._-]{0,99}$/i.test(iconValue)) {
                alert('Enter a valid DashboardIcons name.');
                return;
            }
        } else if (iconSourceInput.value === 'file' && iconFileInput.files[0]) {
            try {
                const dataUrl = await readFileAsDataURL(iconFileInput.files[0], 'image', 10 * 1024 * 1024);
                iconValue = await resizeImage(dataUrl, 256);
            } catch (error) {
                alert(error.message);
                return;
            }
        } else if (existing && existing.iconSource === iconSourceInput.value) {
            iconValue = existing.iconValue; // keep the current icon when it didn't change
        }

        const url = normalizeShortcutUrl(siteUrlInput.value, true);
        if (!url) {
            alert('Enter a valid HTTP or HTTPS website address.');
            return;
        }

        const targetFolder = siteFolderInput ? siteFolderInput.value : '';
        const newSite = {
            id: id,
            name: siteNameInput.value.trim().slice(0, 120),
            url: url,
            color: siteColorInput.value,
            iconSource: iconSourceInput.value,
            iconValue: iconValue,
            excludeFromOpenAll: !!excludeFromOpenAllInput.checked,
            hotkey: siteHotkeyInput ? siteHotkeyInput.value : '',
            // Page only applies at the top level; items inside a folder follow the folder.
            page: targetFolder ? 0 : (sitePageInput ? parseInt(sitePageInput.value) || 0 : 0)
        };

        // Free an old uploaded icon if it's being replaced.
        if (existing && existing.iconValue && existing.iconValue.startsWith('idb:') && existing.iconValue !== iconValue) {
            await deleteImageFromDB(existing.iconValue).catch(console.error);
        }

        const wasInFolder = editIdInput.value ? folderOfShortcut(id) : '';
        if (editIdInput.value && !targetFolder && !wasInFolder) {
            // Stayed at the top level — replace in place so its position is kept.
            const idx = sites.findIndex(s => String(s.id) === String(id));
            if (idx !== -1) sites[idx] = newSite; else sites.push(newSite);
        } else {
            if (editIdInput.value) removeItemById(id); // moving in/out of a folder
            if (targetFolder) {
                const f = sites.find(it => isFolder(it) && String(it.id) === String(targetFolder));
                if (f) { f.children = f.children || []; f.children.push(newSite); }
                else sites.push(newSite);
            } else {
                sites.push(newSite);
            }
        }

        saveAndRender();
        shortcutModal.style.display = 'none';
        renderShortcutsList();
    };
}


// --- Helpers ---

// IDs are compared as strings: old data may hold numbers, new data strings.
function editShortcut(id) {
    const { item } = findItemById(id);
    if (item) openShortcutModal(item);
}

async function deleteShortcut(id) {
    const { item } = findItemById(id);
    if (item && item.iconValue && item.iconValue.startsWith('idb:')) {
        await deleteImageFromDB(item.iconValue).catch(console.error);
    }
    removeItemById(id);
    saveAndRender();
    renderShortcutsList();
}

// --- Drag-and-drop in the Shortcuts management list ---
let listDragId = null;

function listDragStart(e) {
    listDragId = this.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', listDragId);
    this.classList.add('dragging');
}

function listDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (listDragId && this.dataset.id !== listDragId) this.classList.add('drop-target');
}

function listDragLeave() {
    this.classList.remove('drop-target');
}

function listDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-target');
    const targetId = this.dataset.id;
    if (!listDragId || listDragId === targetId) return;

    const dragged = findItemById(listDragId).item;
    if (!dragged || isFolder(dragged)) { listDragId = null; return; } // only shortcuts move

    if (this.dataset.kind === 'folder') {
        // Drop onto a folder header → move the shortcut into that folder.
        const folder = sites.find(it => isFolder(it) && String(it.id) === String(targetId));
        if (folder) {
            removeItemById(listDragId);
            folder.children = folder.children || [];
            folder.children.push(dragged);
        }
    } else {
        // Drop onto a top-level row → place it there (pulled out of any folder).
        removeItemById(listDragId);
        const idx = sites.findIndex(s => String(s.id) === String(targetId));
        dragged.page = idx !== -1 ? (sites[idx].page || 0) : currentPage;
        if (idx === -1) sites.push(dragged);
        else sites.splice(idx, 0, dragged);
    }
    listDragId = null;
    saveAndRender();
    renderShortcutsList();
}

function listDragEnd() {
    listDragId = null;
    document.querySelectorAll('.shortcut-manage-item').forEach(r => r.classList.remove('dragging', 'drop-target'));
}

// Which folder (if any) currently holds a given shortcut.
function folderOfShortcut(id) {
    const folder = sites.find(it => isFolder(it) && (it.children || []).some(c => String(c.id) === String(id)));
    return folder ? folder.id : '';
}

// Fill the "Page" dropdown with one option per page.
function populatePageSelect(selected) {
    if (!sitePageInput) return;
    const count = settings.pageCount || 1;
    sitePageInput.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const o = document.createElement('option');
        o.value = i;
        o.textContent = `Page ${i + 1}`;
        sitePageInput.appendChild(o);
    }
    sitePageInput.value = Math.min(selected || 0, count - 1);
}

// Fill the "Folder" dropdown: Home + every existing folder.
function populateFolderSelect(selected) {
    if (!siteFolderInput) return;
    siteFolderInput.innerHTML = '';
    const home = document.createElement('option');
    home.value = '';
    home.textContent = 'Home (no folder)';
    siteFolderInput.appendChild(home);
    sites.filter(isFolder).forEach(f => {
        const o = document.createElement('option');
        o.value = f.id;
        o.textContent = `📁 ${f.name}`;
        siteFolderInput.appendChild(o);
    });
    siteFolderInput.value = selected || '';
}

// A shortcut inside a folder follows the folder's page, so hide the Page row.
function updateSitePageVisibility() {
    const group = document.getElementById('sitePageGroup');
    if (group && siteFolderInput) group.style.display = siteFolderInput.value ? 'none' : 'block';
}

function openShortcutModal(site = null) {
    shortcutModal.style.display = 'flex';
    populatePageSelect(site ? itemPage(site) : currentPage);
    populateFolderSelect(site ? folderOfShortcut(site.id) : '');
    if (site) {
        shortcutModalTitle.innerText = "Edit Shortcut";
        editIdInput.value = site.id;
        siteNameInput.value = site.name;
        siteUrlInput.value = site.url;
        siteColorInput.value = site.color || '#ffffff';
        iconSourceInput.value = site.iconSource || 'favicon';
        iconUrlInput.value = site.iconSource === 'url' ? site.iconValue : '';
        if (iconDashboardInput) iconDashboardInput.value = site.iconSource === 'dashboardicons' ? site.iconValue : '';
        excludeFromOpenAllInput.checked = !!site.excludeFromOpenAll;
        if (siteHotkeyInput) siteHotkeyInput.value = site.hotkey || '';
    } else {
        shortcutModalTitle.innerText = "Add Shortcut";
        shortcutForm.reset();
        editIdInput.value = '';
        siteColorInput.value = '#ffffff';
        iconSourceInput.value = 'favicon';
        excludeFromOpenAllInput.checked = false;
        if (siteHotkeyInput) siteHotkeyInput.value = '';
    }
    iconSourceInput.onchange();
    updateSitePageVisibility();
}

function readFileAsDataURL(file, kind = 'image', maxBytes = 10 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
        if (!file || file.size > maxBytes) {
            reject(new Error(`File must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`));
            return;
        }
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        const allowedByName = kind === 'font'
            ? ['woff2', 'woff', 'ttf', 'otf'].includes(extension)
            : ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'].includes(extension);
        const allowedByType = kind === 'font'
            ? /^(font\/|application\/(?:font|x-font|octet-stream))/i.test(file.type)
            : /^image\//i.test(file.type);
        if (!allowedByName && !allowedByType) {
            reject(new Error(kind === 'font' ? 'Choose a valid WOFF, WOFF2, TTF, or OTF font.' : 'Choose a valid image file.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            let dataUrl = reader.result;
            if (/^data:;base64,/i.test(dataUrl) && allowedByName) {
                const fallbackMime = kind === 'font'
                    ? `font/${extension}`
                    : ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon' }[extension] || `image/${extension}`);
                dataUrl = dataUrl.replace(/^data:;base64,/i, `data:${fallbackMime};base64,`);
            }
            if (!isSafeDataUrl(dataUrl, kind)) {
                reject(new Error(`The selected ${kind} file has an unsupported format.`));
                return;
            }
            resolve(dataUrl);
        };
        reader.onerror = () => reject(reader.error || new Error('Could not read the selected file.'));
        reader.readAsDataURL(file);
    });
}

init();

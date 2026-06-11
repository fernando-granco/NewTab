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
    openShortcutsNewTab: false,
    openSearchNewTab: false,
    tabTitle: 'New Tab',
    tabFaviconSource: 'default', // default, color, url, file
    tabFaviconValue: ''
};

// State
let sites = JSON.parse(localStorage.getItem('sites')) || defaultSites;
let settings = JSON.parse(localStorage.getItem('settings')) || defaultSettings;
const imageCache = {}; // Pre-load IDB images for synchronous rendering

// Merge defaults in case of new settings
settings = { ...defaultSettings, ...settings };

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

    for (const site of sites) {
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
    return 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL' +
        `&url=${encodeURIComponent(site.url)}&size=256`;
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
    // Custom icons (a pasted URL or an uploaded file) have one true source;
    // if it breaks, fall straight back to the letter tile.
    if ((site.iconSource === 'url' || site.iconSource === 'file') && site.iconValue) {
        img.className = 'full-fill';
        img.src = site.iconValue.startsWith('idb:')
            ? (imageCache[site.iconValue] || '')
            : site.iconValue;
        setIconFallbackChain(img, [createLetterTile(site)]);
        return;
    }

    const remoteUrl = getRemoteIconUrl(site);
    const cached = imageCache[FAV_PREFIX + remoteUrl];
    const chromeFavicon = getChromeFaviconUrl(site.url);
    const fallbacks = [];

    if (cached) {
        img.src = cached; // The happy path: instant, offline, high-res.
    } else if (navigator.onLine) {
        img.src = remoteUrl;                                  // Show it now...
        cacheRemoteIcon(FAV_PREFIX + remoteUrl, remoteUrl);   // ...cache it for next time.
        if (chromeFavicon) fallbacks.push(chromeFavicon);
    } else if (chromeFavicon) {
        img.src = chromeFavicon; // Offline with nothing cached yet: use Chrome's copy.
    } else {
        img.src = createLetterTile(site);
        img.classList.add('full-fill');
        return;
    }

    fallbacks.push(createLetterTile(site));
    setIconFallbackChain(img, fallbacks);
}

// Download a remote icon once and store it in IndexedDB as a data URL.
// From then on the icon paints from disk, even with no internet.
async function cacheRemoteIcon(cacheKey, url) {
    if (imageCache[cacheKey] || inFlightIconFetches.has(cacheKey)) return;
    inFlightIconFetches.add(cacheKey);
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const blob = await res.blob();
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
        inFlightIconFetches.delete(cacheKey);
    }
}

// Drop cached icons for sites that no longer exist (e.g. after a URL edit).
async function pruneIconCache() {
    try {
        const wanted = new Set(sites.map(getRemoteIconUrl).map(u => FAV_PREFIX + u));
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
    loadBookmarkFolders();

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
    grid.classList.add('first-paint');
    renderGrid();
    // Drop the animation hook after it plays so drag-reorder re-renders are instant.
    setTimeout(() => grid.classList.remove('first-paint'), 400);

    // If the tab was opened offline, some icons may be showing fallbacks.
    // The moment the connection returns, repaint so the real icons load
    // (and get cached for the next offline session).
    window.addEventListener('online', renderGrid);

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

    document.documentElement.style.setProperty('--icon-size', toVmin(settings.iconSize));
    document.documentElement.style.setProperty('--grid-row-gap', toVmin(settings.gridRowGap));
    document.documentElement.style.setProperty('--grid-col-gap', toVmin(settings.gridColGap));

    // Grid Vertical Offset (Applied to wrapper to move everything)
    if (contentWrapper) {
        contentWrapper.style.transform = `translateY(${toVmin(settings.gridVerticalOffset || 0)})`;
    }

    // Grid Columns
    let cols = settings.colCount;
    if (cols === 'auto') {
        cols = 5; // Default fallback if user had 'auto'
        settings.colCount = cols;
        // We don't saveState() here to avoid recursion or side effects, 
        // but next time they change something it will save.
    }

    grid.style.gridTemplateColumns = `repeat(${cols}, var(--icon-size))`;
    if (colCountValInput) colCountValInput.value = cols;

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
        bg.style.background = 'radial-gradient(circle at center, #2a2a2a 0%, #111111 100%)';
        bg.style.backgroundImage = '';
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

    // Update Input Values
    if (iconSizeInput) iconSizeInput.value = settings.iconSize;
    if (iconSizeValInput) iconSizeValInput.value = settings.iconSize;

    // Use safe defaults if old settings exist without new properties
    const rGap = settings.gridRowGap !== undefined ? settings.gridRowGap : 40;
    const cGap = settings.gridColGap !== undefined ? settings.gridColGap : 40;

    // Grid Gaps
    if (gridRowGapInput) gridRowGapInput.value = rGap;
    if (gridRowGapValInput) gridRowGapValInput.value = rGap;
    if (gridColGapInput) gridColGapInput.value = cGap;
    if (gridColGapValInput) gridColGapValInput.value = cGap;

    if (gridOffsetInput) {
        gridOffsetInput.value = settings.gridVerticalOffset || 0;
        if (gridOffsetValInput) gridOffsetValInput.value = settings.gridVerticalOffset || 0;
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
        } else {
            searchWrapper.style.display = 'none';
        }
    }

    updateBgInputsDisplay();
}

function updateSearchIconInputsDisplay() {
    if (!searchIconStyleInput) return;
    const val = searchIconStyleInput.value;
    if (searchIconUrlGroup) searchIconUrlGroup.style.display = val === 'url' ? 'block' : 'none';
    if (searchIconFileGroup) searchIconFileGroup.style.display = val === 'file' ? 'block' : 'none';
}

function updateTabFavicon() {
    let link = document.querySelector("link[rel~='icon']");

    // "Default" means no custom icon: drop our <link> so Chrome shows its
    // standard tab icon. (The old code pointed at a favicon.ico that was
    // never shipped with the extension.)
    if (settings.tabFaviconSource === 'default') {
        if (link) link.remove();
        return;
    }

    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
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
    bgColorGroup.style.display = val === 'color' ? 'block' : 'none';
    bgUrlGroup.style.display = val === 'url' ? 'block' : 'none';
    bgFileGroup.style.display = val === 'file' ? 'block' : 'none';
}

// --- GUI Rendering ---
function renderGrid() {
    const fragment = document.createDocumentFragment();
    sites.forEach((site, index) => {
        const a = document.createElement('a');
        a.href = site.url;
        a.className = 'icon-item';
        a.title = site.name;
        a.draggable = true;
        a.dataset.index = index;
        a.target = settings.openShortcutsNewTab ? '_blank' : '_self';

        // Drag Events (live reorder)
        a.addEventListener('dragstart', handleDragStart);
        a.addEventListener('dragover', handleDragOver);
        a.addEventListener('dragend', handleDragEnd);

        const circle = document.createElement('div');
        circle.className = 'icon-circle';

        if (site.color && site.color.toLowerCase() !== '#ffffff') {
            circle.style.backgroundColor = site.color;
        }

        const img = document.createElement('img');
        // Grid icons are all above the fold — eager + async decode makes them
        // appear together instead of popping in one-by-one (lazy did the latter).
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
        fragment.appendChild(a);
    });
    grid.innerHTML = '';
    grid.appendChild(fragment);
}

// --- Drag and Drop — Live Reorder ---
let dragSourceIndex = null;

function handleDragStart(e) {
    dragSourceIndex = parseInt(this.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/plain', dragSourceIndex);

    // Delay adding class so the drag image isn't affected
    requestAnimationFrame(() => {
        this.classList.add('dragging');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragSourceIndex === null) return;

    const targetIndex = parseInt(this.dataset.index);
    if (isNaN(targetIndex) || targetIndex === dragSourceIndex) return;

    // Move the item in the array
    const [item] = sites.splice(dragSourceIndex, 1);
    sites.splice(targetIndex, 0, item);

    // Update source index to new position
    dragSourceIndex = targetIndex;

    // Re-render grid with new order (fast — uses DocumentFragment)
    renderGrid();

    // Re-apply dragging style to the moved element
    const items = grid.querySelectorAll('.icon-item');
    if (items[targetIndex]) {
        items[targetIndex].classList.add('dragging');
    }
}

function handleDragEnd(e) {
    dragSourceIndex = null;
    const items = grid.querySelectorAll('.icon-item');
    items.forEach(item => item.classList.remove('dragging'));

    // Persist final order
    saveState();
}

function renderShortcutsList() {
    shortcutsList.innerHTML = '';
    sites.forEach(site => {
        const div = document.createElement('div');
        div.className = 'shortcut-manage-item';

        // Info Part
        const infoDiv = document.createElement('div');
        infoDiv.className = 'shortcut-info';

        const nameStrong = document.createElement('strong');
        nameStrong.textContent = site.name;

        const br = document.createElement('br');

        const urlSmall = document.createElement('small');
        urlSmall.textContent = site.url;

        infoDiv.appendChild(nameStrong);
        infoDiv.appendChild(br);
        infoDiv.appendChild(urlSmall);

        // Actions Part
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'shortcut-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.onclick = () => editShortcut(site.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = () => deleteShortcut(site.id);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);
        shortcutsList.appendChild(div);
    });
}

// --- Bookmarks Logic ---

function loadBookmarkFolders() {
    if (!chrome.bookmarks) {
        // Fallback for non-extension environment
        bookmarkFoldersSort.innerHTML = '<option>Bookmarks API not available</option>';
        return;
    }

    chrome.bookmarks.getTree((tree) => {
        const folders = [];

        function traverse(node, depth = 0) {
            if (node.children) {
                if (depth > 0) { // Skip root
                    folders.push({ id: node.id, title: node.title, depth });
                }
                node.children.forEach(child => traverse(child, depth + 1));
            }
        }

        tree[0].children.forEach(child => traverse(child, 1)); // Usually starts with "Bookmarks Bar" and "Other Bookmarks"

        bookmarkFoldersSort.innerHTML = '';
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = '-'.repeat(folder.depth - 1) + ' ' + folder.title;
            bookmarkFoldersSort.appendChild(option);
        });
    });
}

function importBookmarks() {
    const folderId = bookmarkFoldersSort.value;
    if (!folderId) return;

    if (!chrome.bookmarks) {
        alert("Bookmarks API not available.");
        return;
    }

    chrome.bookmarks.getChildren(folderId, (children) => {
        let importedCount = 0;
        children.forEach(node => {
            if (node.url) { // It's a link
                sites.push({
                    id: Date.now().toString() + Math.random().toString().slice(2, 5),
                    name: node.title,
                    url: node.url,
                    color: '#ffffff',
                    iconSource: 'favicon',
                    iconValue: ''
                });
                importedCount++;
            }
        });

        if (importedCount > 0) {
            saveAndRender();
            renderShortcutsList();
            alert(`Imported ${importedCount} bookmarks!`);
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
    };
    closeSettings.onclick = () => settingsModal.style.display = 'none';

    window.onclick = (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === shortcutModal) shortcutModal.style.display = 'none';
    };

    // --- Drag Logic for Settings Modal ---
    const modalContent = settingsModal.querySelector('.modal-content');
    const modalHeader = settingsModal.querySelector('.modal-header');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    modalHeader.onmousedown = (e) => {
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
            settings[settingKey] = val;
            num.value = val;
            applySettings(); // Immediate visual update (CSS vars only, cheap)
            debouncedSaveAndApply(); // Debounced localStorage write
        };

        num.oninput = (e) => {
            let val = isInt ? parseInt(e.target.value) : e.target.value;
            if (slider.min && val < parseInt(slider.min)) val = parseInt(slider.min);
            if (slider.max && val > parseInt(slider.max)) val = parseInt(slider.max);
            settings[settingKey] = val;
            slider.value = val;
            applySettings();
            debouncedSaveAndApply();
        };
    };

    // Layout Settings
    setupSync('iconSize', 'iconSizeValInput', 'iconSize');
    setupSync('gridRowGap', 'gridRowGapValInput', 'gridRowGap');
    setupSync('gridColGap', 'gridColGapValInput', 'gridColGap');
    setupSync('gridOffset', 'gridOffsetValInput', 'gridVerticalOffset');
    setupSync('colCount', 'colCountValInput', 'colCount');

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
            const sitesToOpen = sites.filter(s => !s.excludeFromOpenAll);
            if (sitesToOpen.length === 0) {
                alert("No sites to open (all are excluded or list is empty).");
                return;
            }
            if (sitesToOpen.length > 5 && !confirm(`Open ${sitesToOpen.length} sites?`)) return;
            sitesToOpen.forEach(site => window.open(site.url, '_blank'));
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
                settings.searchIconValue = e.target.value;
                saveState();
                applySettings();
            }
        };
    }
    if (searchIconFileInput) {
        searchIconFileInput.onchange = async (e) => {
            if (e.target.files[0] && settings.searchIconStyle === 'file') {
                try {
                    const dataUrl = await readFileAsDataURL(e.target.files[0]);
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
    if (openSearchNewTabInput) openSearchNewTabInput.onchange = (e) => { settings.openSearchNewTab = e.target.checked; saveState(); };

    // Search Submit (Chrome Search API)
    if (searchForm) {
        searchForm.onsubmit = (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;

            // Use Chrome Search API to respect user's default engine
            const disposition = settings.openSearchNewTab ? 'NEW_TAB' : 'CURRENT_TAB';

            try {
                if (chrome.search && chrome.search.query) {
                    chrome.search.query({
                        text: query,
                        disposition: disposition
                    });
                } else {
                    // Fallback for non-extension environment or error
                    console.warn("Chrome Search API not available. Redirecting to Google as fallback.");
                    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    if (settings.openSearchNewTab) window.open(url, '_blank');
                    else window.location.href = url;
                }
            } catch (err) {
                console.error("Search failed:", err);
                alert("Search failed. Please ensure the extension has 'search' permissions.");
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
    bgUrlInput.oninput = (e) => { settings.bgValue = e.target.value; saveState(); applySettings(); };
    setupSync('bgBlur', 'bgBlurValInput', 'bgBlur');

    bgFileInput.onchange = async (e) => {
        if (e.target.files[0]) {
            try {
                const dataUrl = await readFileAsDataURL(e.target.files[0]);
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
            const dataStr = JSON.stringify({ sites, settings, images });
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

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.sites && data.settings) {
                        sites = data.sites;
                        settings = data.settings;
                        if (data.images) {
                            for (const key of Object.keys(data.images)) {
                                await saveImageToDB(key, data.images[key]);
                            }
                        }
                        saveAndRender();
                        alert("Configuration imported successfully!");
                    } else {
                        alert("Invalid backup file format.");
                    }
                } catch (err) {
                    alert("Error parsing backup file.");
                    console.error(err);
                }
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset input
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
                settings.tabFaviconValue = e.target.value;
                saveState();
                applySettings();
            }
        };
    }

    if (tabFaviconFileInput) {
        tabFaviconFileInput.onchange = async (e) => {
            if (e.target.files[0] && settings.tabFaviconSource === 'file') {
                try {
                    const dataUrl = await readFileAsDataURL(e.target.files[0]);
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
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Matching...';

            try {
                const res = await fetch('https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/tree.json');
                const tree = await res.json();
                
                // tree.svg is an array of file names: ["youtube.svg", "reddit.svg", "reddit-light.svg"]
                const availableIcons = (tree.svg || []).map(name => name.replace('.svg', ''));

                let matchesCount = 0;

                sites.forEach(site => {
                    // Only upgrade simple favicons or existing dashboard icons to see if there's a better match
                    if (site.iconSource !== 'favicon' && site.iconSource !== 'dashboardicons') return;

                    const searchTarget = site.name.toLowerCase().trim();
                    let bestMatch = null;
                    const kebabName = searchTarget.replace(/\s+/g, '-');
                    
                    if (availableIcons.includes(kebabName)) {
                        bestMatch = kebabName;
                    } else if (availableIcons.includes(searchTarget)) {
                        bestMatch = searchTarget;
                    } else {
                        // Simple fallback: maybe there's a -light variant if base doesn't exist
                        const fallback = availableIcons.find(icon => icon === `${kebabName}-light` || icon === `${kebabName}-dark`);
                        if (fallback) bestMatch = fallback;
                    }

                    if (bestMatch && (site.iconSource !== 'dashboardicons' || site.iconValue !== bestMatch)) {
                        site.iconSource = 'dashboardicons';
                        site.iconValue = bestMatch;
                        matchesCount++;
                    }
                });

                if (matchesCount > 0) {
                    saveAndRender();
                    renderShortcutsList();
                    alert(`Successfully auto-matched ${matchesCount} icons!`);
                } else {
                    alert("No new icon matches found.");
                }
            } catch (err) {
                console.error("Auto-match failed:", err);
                alert("Failed to fetch icon database. Please try again later.");
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
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

        let iconValue = '';
        if (iconSourceInput.value === 'url') {
            iconValue = iconUrlInput.value;
        } else if (iconSourceInput.value === 'dashboardicons') {
            iconValue = iconDashboardInput.value.trim().toLowerCase();
        } else if (iconSourceInput.value === 'file' && iconFileInput.files[0]) {
            const dataUrl = await readFileAsDataURL(iconFileInput.files[0]);
            iconValue = await resizeImage(dataUrl, 256);
        } else if (editIdInput.value) {
            const existing = sites.find(s => s.id === id);
            if (existing && existing.iconSource === iconSourceInput.value) {
                iconValue = existing.iconValue;
            }
        }

        let url = siteUrlInput.value.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        const newSite = {
            id: id,
            name: siteNameInput.value,
            url: url,
            color: siteColorInput.value,
            iconSource: iconSourceInput.value,
            iconValue: iconValue,
            excludeFromOpenAll: !!excludeFromOpenAllInput.checked
        };

        if (editIdInput.value) {
            const index = sites.findIndex(s => s.id === id);
            if (index !== -1) {
                if (sites[index].iconValue && sites[index].iconValue.startsWith('idb:') && sites[index].iconValue !== iconValue) {
                    await deleteImageFromDB(sites[index].iconValue).catch(console.error);
                }
                sites[index] = newSite;
            }
        } else {
            sites.push(newSite);
        }

        saveAndRender();
        shortcutModal.style.display = 'none';
        renderShortcutsList();
    };
}


// --- Helpers ---

// IDs are compared as strings: old data may hold numbers, new data strings.
function editShortcut(id) {
    const site = sites.find(s => String(s.id) === String(id));
    if (site) openShortcutModal(site);
}

async function deleteShortcut(id) {
    const site = sites.find(s => String(s.id) === String(id));
    if (site && site.iconValue && site.iconValue.startsWith('idb:')) {
        await deleteImageFromDB(site.iconValue).catch(console.error);
    }
    sites = sites.filter(s => String(s.id) !== String(id));
    saveAndRender();
    renderShortcutsList();
}

function openShortcutModal(site = null) {
    shortcutModal.style.display = 'flex';
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
    } else {
        shortcutModalTitle.innerText = "Add Shortcut";
        shortcutForm.reset();
        editIdInput.value = '';
        siteColorInput.value = '#ffffff';
        iconSourceInput.value = 'favicon';
        excludeFromOpenAllInput.checked = false;
    }
    iconSourceInput.onchange();
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

init();

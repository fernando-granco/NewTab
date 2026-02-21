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
    iconSource: 'favicon', // 'favicon', 'url', 'file'
    colCount: 4, // Default to 4
    bgType: 'gradient', // gradient, color, url, file
    bgValue: '',
    bgBlur: 0,
    showIconBg: true,
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
    searchIconStyle: 'none', // glass, google, bing, duckduckgo, url, file
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
const shortcutsList = document.getElementById('shortcutsList');
const contentWrapper = document.getElementById('contentWrapper');

// Inputs - Layout
const iconSizeInput = document.getElementById('iconSize');
const iconSizeValInput = document.getElementById('iconSizeValInput');
const colCountInput = document.getElementById('colCount');
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
const searchIcon = document.getElementById('searchIcon'); // Ensure ID matches HTML
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
const iconUrlGroup = document.getElementById('iconUrlGroup');
const iconFileGroup = document.getElementById('iconFileGroup');
const iconUrlInput = document.getElementById('iconUrlInput');
const iconFileInput = document.getElementById('iconFileInput');
const siteColorInput = document.getElementById('siteColor');
const excludeFromOpenAllInput = document.getElementById('excludeFromOpenAll');
const editIdInput = document.getElementById('editId');
const shortcutModalTitle = document.getElementById('shortcutModalTitle');

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

// --- Initialization ---

function init() {
    applySettings();
    renderGrid();
    setupEventListeners();
    loadBookmarkFolders(); // Load folders on init (or lazy load when settings open)
}

// Persist sites and settings to localStorage and trigger re-renders
function saveState() {
    try {
        localStorage.setItem('sites', JSON.stringify(sites));
        localStorage.setItem('settings', JSON.stringify(settings));
    } catch (e) {
        console.error("Save error:", e);
        alert("Error saving settings. Local storage might be full.");
    }
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

        // Fix: Also show/hide the wrapper
        if (openAllWrapper) openAllWrapper.style.display = show ? 'block' : 'none';

        openAllBtn.textContent = settings.openAllText || 'Open All Sites';
        openAllBtn.style.backgroundColor = settings.openAllColor || '#3f51b5';

        let btnRadius = '6px';
        if (settings.openAllShape === 'square') btnRadius = '0px';
        if (settings.openAllShape === 'pill') btnRadius = '50px';
        openAllBtn.style.borderRadius = btnRadius;

        if (showOpenAllInput) showOpenAllInput.checked = show;

        // Update position in the DOM
        if (openAllWrapper && contentWrapper) {
            if (settings.openAllPosition === 'top') {
                contentWrapper.insertBefore(openAllWrapper, grid);
            } else {
                contentWrapper.appendChild(openAllWrapper);
            }
        }

        // Ensure listener is attached
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
            bg.style.backgroundImage = `url("${settings.bgValue}")`;
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
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

    if (showOpenAllInput) {
        showOpenAllInput.onchange = (e) => { settings.showOpenAll = e.target.checked; saveState(); };
    }

    if (openAllTextInput) openAllTextInput.value = settings.openAllText || 'Open All Sites';
    if (openAllColorInput) openAllColorInput.value = settings.openAllColor || '#3f51b5';
    if (openAllShapeInput) openAllShapeInput.value = settings.openAllShape || 'pill';
    if (openAllPositionInput) openAllPositionInput.value = settings.openAllPosition || 'bottom';


    if (showSearchInput) showSearchInput.checked = settings.showSearch;
    if (showSearchInput) showSearchInput.checked = settings.showSearch;
    if (searchIconStyleInput) searchIconStyleInput.value = settings.searchIconStyle || 'glass';
    if (searchIconUrlInput) searchIconUrlInput.value = (settings.searchIconStyle === 'url') ? settings.searchIconValue : '';
    if (searchPositionInput) searchPositionInput.value = settings.searchPosition || 'top';
    if (openSearchNewTabInput) openSearchNewTabInput.checked = settings.openSearchNewTab;

    updateSearchIconInputsDisplay();
    if (searchPositionInput) searchPositionInput.value = settings.searchPosition || 'top';
    if (openSearchNewTabInput) openSearchNewTabInput.checked = settings.openSearchNewTab;

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
                    searchIcon.src = settings.searchIconValue;
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
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (settings.tabFaviconSource === 'default') {
        link.href = 'favicon.ico';
    } else if (settings.tabFaviconSource === 'color') {
        link.href = createColorFavicon(settings.tabFaviconValue || '#3f51b5');
    } else if (settings.tabFaviconValue) {
        link.href = settings.tabFaviconValue;
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
    grid.innerHTML = '';
    sites.forEach((site, index) => {
        const a = document.createElement('a');
        a.href = site.url;
        a.className = 'icon-item';
        a.title = site.name;

        a.draggable = true;
        a.dataset.index = index;

        a.target = settings.openShortcutsNewTab ? '_blank' : '_self';

        // Drag Events
        a.addEventListener('dragstart', handleDragStart);
        a.addEventListener('dragover', handleDragOver);
        a.addEventListener('drop', handleDrop);
        a.addEventListener('dragenter', handleDragEnter);
        a.addEventListener('dragleave', handleDragLeave);
        a.addEventListener('dragend', handleDragEnd);

        const circle = document.createElement('div');
        circle.className = 'icon-circle';

        // Apply styles (custom color or global default)
        if (site.color && site.color.toLowerCase() !== '#ffffff') {
            circle.style.backgroundColor = site.color;
        }

        // Icon Logic
        const img = document.createElement('img');
        if ((site.iconSource === 'url' || site.iconSource === 'file') && site.iconValue) {
            img.src = site.iconValue;
            img.className = 'full-fill';
        } else {
            // Default to favicon
            img.src = `https://www.google.com/s2/favicons?domain=${site.url}&sz=128`;
        }
        img.alt = site.name;

        circle.appendChild(img);

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = site.name;

        a.appendChild(circle);
        a.appendChild(label);
        grid.appendChild(a);
    });
}

// --- Drag and Drop Handlers ---
let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    if (dragSrcEl !== this) {
        const srcIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetIndex = parseInt(this.dataset.index);

        if (!isNaN(srcIndex) && !isNaN(targetIndex)) {
            // Reorder array
            const item = sites[srcIndex];
            sites.splice(srcIndex, 1); // remove from old
            sites.splice(targetIndex, 0, item); // insert at new

            saveState(); // Will re-render grid
        }
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    const items = grid.querySelectorAll('.icon-item');
    items.forEach(item => {
        item.classList.remove('drag-over');
    });
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
        editBtn.onclick = () => window.editShortcut(site.id); // Use arrow function closure

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = () => window.deleteShortcut(site.id); // Use arrow function closure

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
            saveState();
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
        // Reset position on open if needed, or keep last position
        renderShortcutsList();
    };
    closeSettings.onclick = () => settingsModal.style.display = 'none';

    // Updated: Only close if clicking the background (not the modal itself)
    // AND IF not currently dragging.
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
        // Prevent default to avoid text selection etc
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        // Get current position (or computed style if not set yet)
        const rect = modalContent.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Ensure it acts absolute if it wasn't already positioned manually
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

    // Helper to sync slider and number input
    const setupSync = (sliderId, numId, settingKey, isInt = true) => {
        const slider = document.getElementById(sliderId);
        const num = document.getElementById(numId);
        if (!slider || !num) return;

        slider.oninput = (e) => {
            const val = isInt ? parseInt(e.target.value) : e.target.value;
            settings[settingKey] = val;
            num.value = val;
            saveState();
        };

        num.oninput = (e) => {
            let val = isInt ? parseInt(e.target.value) : e.target.value;
            // validate constraints
            if (slider.min && val < parseInt(slider.min)) val = parseInt(slider.min);
            if (slider.max && val > parseInt(slider.max)) val = parseInt(slider.max);

            settings[settingKey] = val;
            slider.value = val;
            saveState();
        };

        // Initial sync handled in updateUI usually, but good to have binding
    };

    // Layout Settings
    setupSync('iconSize', 'iconSizeValInput', 'iconSize');
    setupSync('gridRowGap', 'gridRowGapValInput', 'gridRowGap');
    setupSync('gridColGap', 'gridColGapValInput', 'gridColGap');
    setupSync('gridOffset', 'gridOffsetValInput', 'gridVerticalOffset');

    // Columns
    setupSync('colCount', 'colCountValInput', 'colCount');



    showIconBgInput.onchange = (e) => { settings.showIconBg = e.target.checked; saveState(); };
    if (iconShapeInput) iconShapeInput.onchange = (e) => { settings.iconShape = e.target.value; saveState(); };
    if (iconBgColorInput) iconBgColorInput.oninput = (e) => { settings.iconBgColor = e.target.value; saveState(); };

    showLabelsInput.onchange = (e) => { settings.showLabels = e.target.checked; saveState(); };

    if (showOpenAllInput) {
        showOpenAllInput.onchange = (e) => { settings.showOpenAll = e.target.checked; saveState(); };
    }

    if (openAllTextInput) openAllTextInput.oninput = (e) => { settings.openAllText = e.target.value; saveState(); };
    if (openAllColorInput) openAllColorInput.oninput = (e) => { settings.openAllColor = e.target.value; saveState(); };
    if (openAllShapeInput) openAllShapeInput.onchange = (e) => { settings.openAllShape = e.target.value; saveState(); };
    if (openAllPositionInput) openAllPositionInput.onchange = (e) => { settings.openAllPosition = e.target.value; saveState(); };

    // Search Settings
    if (showSearchInput) showSearchInput.onchange = (e) => { settings.showSearch = e.target.checked; saveState(); };
    if (searchIconStyleInput) {
        searchIconStyleInput.onchange = (e) => {
            settings.searchIconStyle = e.target.value;
            settings.searchIconValue = ''; // Reset when source changes
            saveState();
            updateSearchIconInputsDisplay();
        };
    }
    if (searchIconUrlInput) {
        searchIconUrlInput.oninput = (e) => {
            if (settings.searchIconStyle === 'url') {
                settings.searchIconValue = e.target.value;
                saveState();
            }
        };
    }
    if (searchIconFileInput) {
        searchIconFileInput.onchange = async (e) => {
            if (e.target.files[0] && settings.searchIconStyle === 'file') {
                try {
                    settings.searchIconValue = await readFileAsDataURL(e.target.files[0]);
                    saveState();
                } catch (err) {
                    console.error("Error reading search icon file", err);
                    alert("Failed to load icon. It might be too large.");
                }
            }
        };
    }
    if (searchPositionInput) searchPositionInput.onchange = (e) => { settings.searchPosition = e.target.value; saveState(); };
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
    bgTypeInput.onchange = (e) => {
        settings.bgType = e.target.value;
        settings.bgValue = ''; // reset value on type change
        saveState();
        updateBgInputsDisplay();
    };

    bgColorInput.oninput = (e) => { settings.bgValue = e.target.value; saveState(); };
    bgUrlInput.oninput = (e) => { settings.bgValue = e.target.value; saveState(); };
    setupSync('bgBlur', 'bgBlurValInput', 'bgBlur');

    bgFileInput.onchange = async (e) => {
        if (e.target.files[0]) {
            try {
                settings.bgValue = await readFileAsDataURL(e.target.files[0]);
                saveState();
            } catch (err) {
                console.error("Error reading background file", err);
                alert("Failed to load image. It might be too large for local storage.");
            }
        }
    };

    // Bookmarks Import
    importBookmarksBtn.onclick = importBookmarks;

    // Tab Customization Listeners
    if (tabTitleInput) {
        tabTitleInput.oninput = (e) => {
            settings.tabTitle = e.target.value;
            document.title = e.target.value || 'New Tab';
            saveState();
        };
    }

    if (tabFaviconSourceInput) {
        tabFaviconSourceInput.onchange = (e) => {
            settings.tabFaviconSource = e.target.value;
            settings.tabFaviconValue = ''; // Reset when source changes
            if (e.target.value === 'color') settings.tabFaviconValue = '#3f51b5';
            saveState();
            updateTabFaviconInputsDisplay();
        };
    }

    if (tabFaviconColorInput) {
        tabFaviconColorInput.oninput = (e) => {
            if (settings.tabFaviconSource === 'color') {
                settings.tabFaviconValue = e.target.value;
                saveState();
            }
        };
    }

    if (tabFaviconUrlInput) {
        tabFaviconUrlInput.oninput = (e) => {
            if (settings.tabFaviconSource === 'url') {
                settings.tabFaviconValue = e.target.value;
                saveState();
            }
        };
    }

    if (tabFaviconFileInput) {
        tabFaviconFileInput.onchange = async (e) => {
            if (e.target.files[0] && settings.tabFaviconSource === 'file') {
                try {
                    settings.tabFaviconValue = await readFileAsDataURL(e.target.files[0]);
                    saveState();
                } catch (err) {
                    console.error("Error reading favicon file", err);
                    alert("Failed to load icon. It might be too large.");
                }
            }
        };
    }



    // Shortcut Modal
    addShortcutBtn.onclick = () => {
        openShortcutModal();
    };
    closeShortcut.onclick = () => shortcutModal.style.display = 'none';

    iconSourceInput.onchange = () => {
        const val = iconSourceInput.value;
        iconUrlGroup.style.display = val === 'url' ? 'block' : 'none';
        iconFileGroup.style.display = val === 'file' ? 'block' : 'none';
    };

    shortcutForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = editIdInput.value || Date.now().toString();

        let iconValue = '';
        if (iconSourceInput.value === 'url') {
            iconValue = iconUrlInput.value;
        } else if (iconSourceInput.value === 'file' && iconFileInput.files[0]) {
            iconValue = await readFileAsDataURL(iconFileInput.files[0]);
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
            if (index !== -1) sites[index] = newSite;
        } else {
            sites.push(newSite);
        }

        saveState();
        shortcutModal.style.display = 'none';
        renderShortcutsList();
    };
}


// --- Helpers ---

// Attach to window to ensure global scope access for inline onclick
window.editShortcut = (id) => {
    // Ensure ID is string comparison
    const site = sites.find(s => String(s.id) === String(id));
    if (!site) return;
    openShortcutModal(site);
};

window.deleteShortcut = (id) => {
    sites = sites.filter(s => String(s.id) !== String(id));
    saveState();
    renderShortcutsList();
};

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

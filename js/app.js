
const __v=document.createElement("div");
__v.textContent="v0.6.1";
Object.assign(__v.style,{position:"fixed",top:"8px",left:"10px",fontSize:"12px",color:"#666",zIndex:"99999",fontFamily:"Arial,sans-serif",pointerEvents:"none"});
document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(__v),{once:true});

const fallbackConfig = {
    googleDrive: {
        apiKey: "PASTE_GOOGLE_DRIVE_API_KEY_HERE"
    },
    print: [
        { name: "Mazes", icon: "🧩", folderId: "1v_0cM3lU3y0Gusdr_ea4ITq9qKWFAi70" },
        { name: "Coloring Pages", icon: "🖍️", folderId: "1tbAnhtUo3B4ZfzW50RO3y2xVTdEmONRD" },
        { name: "Color by Number", icon: "🎨", folderId: "1UK08nGzaD_7Nqyzm5UzjEHwbV4AoQsTH" },
        { name: "Dot-to-Dot", icon: "🔢", folderId: "1YQ0_cSGMTRRYBnYNa_FnJrDDT1t_VVPA" }
    ],
    listen: [
        { name: "Stories", icon: "📖", folderId: "19EsqBYU0o3DhhvqemRYjc--VrTUkPF9n" },
        { name: "Music", icon: "🎵", folderId: "1ehU9axJuTeF1qQFjcbRfjCcyUG_K9uE1" }
    ]
};

const ITEMS_PER_PAGE = 6;

let config = fallbackConfig;
let currentBrowseType = "";
let browseHistory = [];
let currentPagedItems = [];
let currentPagedTitle = "";
let currentPage = 1;
let activePrintFrame = null;
let activePrintObjectUrl = "";
let printCleanupTimer = null;
let activePrintTitle = "";

const appElement = document.querySelector(".home-screen");

async function init() {
    try {
        config = await loadConfig();
    } catch (error) {
        console.warn("Config failed. Using fallback.", error);
    }

    showHome();
}

function showHome() {
    browseHistory = [];
    currentPage = 1;

    appElement.innerHTML = `
        <header class="brand">
            <img src="assets/images/yes-logo.png" alt="YES Logo" class="school-logo">
            <h1>YES Kitah Beis</h1>
        </header>

        <section class="home-actions">
            <button class="big-button print-button" type="button" onclick="showPrint()">
                <span class="button-icon">🖨️</span>
                <span>PRINT</span>
            </button>

            <button class="big-button listen-button" type="button" onclick="showListen()">
                <span class="button-icon">🎧</span>
                <span>LISTEN</span>
            </button>
        </section>
    `;
}

function buildCategoryCards(items, type) {
    return items.map(item => `
        <button class="category-card" type="button" onclick="openCategory('${type}', '${encodeURIComponent(item.name)}')">
            <span class="category-icon">${item.icon}</span>
            <span>${item.name}</span>
        </button>
    `).join("");
}

function showPrint() {
    browseHistory = [];
    currentPage = 1;

    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="showHome()">⌂</button>
            <h1>🖨️ Print Center</h1>
        </header>

        <section class="category-grid">
            ${buildCategoryCards(config.print, "print")}
        </section>
    `;
}

function showListen() {
    browseHistory = [];
    currentPage = 1;

    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="showHome()">⌂</button>
            <h1>🎧 Listening Center</h1>
        </header>

        <section class="category-grid listening-category-grid">
            ${buildCategoryCards(config.listen, "listen")}
        </section>
    `;
}

function getCategory(type, categoryName) {
    const categories = config[type] || [];
    return categories.find(item => item.name === categoryName);
}

function getBackAction() {
    return browseHistory.length > 1
        ? "goBack()"
        : currentBrowseType === "print"
            ? "showPrint()"
            : "showListen()";
}

function showLoadingScreen(title) {
    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${title}</h1>
        </header>

        <section class="status-panel">
            <div class="status-icon">⏳</div>
            <h2>Loading...</h2>
            <p>Getting classroom choices from Google Drive.</p>
        </section>
    `;
}

function showErrorScreen(title, message) {
    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${title}</h1>
        </header>

        <section class="status-panel error-panel">
            <div class="status-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>${message}</p>
            <button class="small-action-button" type="button" onclick="reloadCurrentFolder()">
                Try Again
            </button>
        </section>
    `;
}

function showEmptyScreen(title) {
    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${title}</h1>
        </header>

        <section class="status-panel">
            <div class="status-icon">📭</div>
            <h2>No files yet</h2>
            <p>Add files to this Google Drive folder, then try again.</p>
        </section>
    `;
}

function buildDriveItemCards(items) {
    return items.map(item => {
        const preview = item.thumbnailUrl
            ? `<img src="${item.thumbnailUrl}" alt="" class="file-thumbnail">`
            : `<span class="file-icon">${item.icon}</span>`;

        const action = item.isFolder
            ? `openDriveFolder('${item.id}', '${encodeURIComponent(item.title)}')`
            : item.isAudio
                ? `openAudioPlayer('${encodeURIComponent(item.title)}', '', '${encodeURIComponent(item.mediaUrl)}')`
                : currentBrowseType === "print" && item.mimeType === "application/pdf"
                    ? `printDrivePdf('${encodeURIComponent(item.title)}', '${encodeURIComponent(item.mediaUrl)}')`
                    : `openDriveFile('${item.openUrl}')`;

        return `
            <button class="file-card" type="button" onclick="${action}">
                <span class="file-preview">
                    ${preview}
                </span>
                <span class="file-title">${item.title}</span>
            </button>
        `;
    }).join("");
}

function buildStoryCards(items) {
    return items.map(item => {
        if (item.type === "story") {
            const cover = item.coverUrl
                ? `<img src="${item.coverUrl}" alt="" class="story-cover-image">`
                : `<span class="story-cover-placeholder">🎧</span>`;

            return `
                <button class="story-card" type="button" onclick="openAudioPlayer('${encodeURIComponent(item.title)}', '${encodeURIComponent(item.coverUrl)}', '${encodeURIComponent(item.audioUrl)}')">
                    <span class="story-cover">
                        ${cover}
                    </span>
                    <span class="story-title">${item.title}</span>
                </button>
            `;
        }

        const preview = item.thumbnailUrl
            ? `<img src="${item.thumbnailUrl}" alt="" class="file-thumbnail">`
            : `<span class="file-icon">${item.icon}</span>`;

        const action = item.isFolder
            ? `openDriveFolder('${item.id}', '${encodeURIComponent(item.title)}')`
            : item.isAudio
                ? `openAudioPlayer('${encodeURIComponent(item.title)}', '', '${encodeURIComponent(item.mediaUrl)}')`
                : currentBrowseType === "print" && item.mimeType === "application/pdf"
                    ? `printDrivePdf('${encodeURIComponent(item.title)}', '${encodeURIComponent(item.mediaUrl)}')`
                    : `openDriveFile('${item.openUrl}')`;

        return `
            <button class="file-card" type="button" onclick="${action}">
                <span class="file-preview">
                    ${preview}
                </span>
                <span class="file-title">${item.title}</span>
            </button>
        `;
    }).join("");
}

function showDriveBrowser(title, items) {
    currentPagedTitle = title;
    currentPagedItems = items;
    currentPage = 1;
    renderPagedDriveBrowser();
}

function showStoryBrowser(title, stories, regularItems) {
    currentPagedTitle = title;
    currentPagedItems = [...stories, ...regularItems];
    currentPage = 1;
    renderPagedStoryBrowser();
}

function getTotalPages() {
    return Math.max(1, Math.ceil(currentPagedItems.length / ITEMS_PER_PAGE));
}

function getCurrentPageItems() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentPagedItems.slice(start, start + ITEMS_PER_PAGE);
}

function renderPaginationControls(renderFunctionName) {
    const totalPages = getTotalPages();

    if (totalPages <= 1) {
        return "";
    }

    const previousDisabled = currentPage === 1 ? "disabled" : "";
    const nextDisabled = currentPage === totalPages ? "disabled" : "";

    return `
        <nav class="pagination-bar">
            <button class="page-button" type="button" onclick="previousPage('${renderFunctionName}')" ${previousDisabled}>
                ← Previous
            </button>

            <span class="page-label">Page ${currentPage} of ${totalPages}</span>

            <button class="page-button" type="button" onclick="nextPage('${renderFunctionName}')" ${nextDisabled}>
                Next →
            </button>
        </nav>
    `;
}

function renderPagedDriveBrowser() {
    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${currentPagedTitle}</h1>
        </header>

        <section class="file-grid">
            ${buildDriveItemCards(getCurrentPageItems())}
        </section>

        ${renderPaginationControls("drive")}
    `;
}

function renderPagedStoryBrowser() {
    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${currentPagedTitle}</h1>
        </header>

        <section class="story-grid">
            ${buildStoryCards(getCurrentPageItems())}
        </section>

        <div class="story-pagination-bottom">
            ${renderPaginationControls("story")}
        </div>
    `;
}

function previousPage(type) {
    if (currentPage <= 1) {
        return;
    }

    currentPage -= 1;

    if (type === "story") {
        renderPagedStoryBrowser();
    } else {
        renderPagedDriveBrowser();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextPage(type) {
    const totalPages = getTotalPages();

    if (currentPage >= totalPages) {
        return;
    }

    currentPage += 1;

    if (type === "story") {
        renderPagedStoryBrowser();
    } else {
        renderPagedDriveBrowser();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadDriveFolder(folderId, title, shouldPushHistory = true) {
    if (shouldPushHistory) {
        browseHistory.push({ folderId, title });
    }

    showLoadingScreen(title);

    try {
        const items = await getDriveItems(config, folderId);

        if (!items.length) {
            showEmptyScreen(title);
            return;
        }

        if (currentBrowseType === "listen") {
            await showListeningFolder(title, items);
            return;
        }

        showDriveBrowser(title, items);
    } catch (error) {
        console.error(error);
        showErrorScreen(title, error.message);
    }
}

async function showListeningFolder(title, items) {
    const folders = items.filter(item => item.isFolder);
    const nonFolders = items.filter(item => !item.isFolder);

    const packageResults = await Promise.all(
        folders.map(folder => getDriveFolderPackage(config, folder))
    );

    const stories = packageResults.filter(Boolean);

    const packageFolderIds = new Set(stories.map(story => story.folderId));
    const regularFolders = folders.filter(folder => !packageFolderIds.has(folder.id));
    const regularItems = [...regularFolders, ...nonFolders];

    if (!stories.length && !regularItems.length) {
        showEmptyScreen(title);
        return;
    }

    showStoryBrowser(title, stories, regularItems);
}

async function openCategory(type, encodedCategoryName) {
    const categoryName = decodeURIComponent(encodedCategoryName);
    const category = getCategory(type, categoryName);

    if (!category) {
        console.error("Unknown category:", type, categoryName);
        return;
    }

    currentBrowseType = type;
    browseHistory = [];
    currentPage = 1;

    await loadDriveFolder(category.folderId, `${category.icon} ${category.name}`);
}

async function openDriveFolder(folderId, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    currentPage = 1;
    await loadDriveFolder(folderId, `📁 ${title}`);
}

async function goBack() {
    currentPage = 1;

    if (browseHistory.length <= 1) {
        if (currentBrowseType === "print") {
            showPrint();
        } else {
            showListen();
        }

        return;
    }

    browseHistory.pop();
    const previousFolder = browseHistory[browseHistory.length - 1];

    await loadDriveFolder(previousFolder.folderId, previousFolder.title, false);
}

async function reloadCurrentFolder() {
    const currentFolder = browseHistory[browseHistory.length - 1];

    if (!currentFolder) {
        showHome();
        return;
    }

    await loadDriveFolder(currentFolder.folderId, currentFolder.title, false);
}

function openDriveFile(url) {
    window.open(url, "_blank", "noopener,noreferrer");
}

function showPrintPreparingScreen(title) {
    const existingOverlay = document.querySelector(".print-preparing-overlay");

    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement("section");
    overlay.className = "print-preparing-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
        <div class="print-preparing-card">
            <div class="gear-animation" aria-hidden="true">
                <span class="gear gear-one">⚙️</span>
                <span class="gear gear-two">⚙️</span>
            </div>
            <h2>Getting your worksheet ready...</h2>
            <p>${title}</p>
            <p class="print-preparing-note">Just a moment!</p>
        </div>
    `;

    document.body.appendChild(overlay);
}

function showPrintReadyScreen(title) {
    const overlay = document.querySelector(".print-preparing-overlay");

    if (!overlay) {
        return;
    }

    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-live", "off");
    overlay.innerHTML = `
        <div class="print-preparing-card print-ready-card">
            <div class="print-ready-icon" aria-hidden="true">📄</div>
            <h2>Your worksheet is ready!</h2>
            <p>${title}</p>
            <button class="print-my-worksheet-button" type="button" onclick="printPreparedWorksheet()">
                <span aria-hidden="true">🖨️</span>
                <span>PRINT MY WORKSHEET</span>
            </button>
            <button class="cancel-print-button" type="button" onclick="cancelPreparedPrint()">
                ← Go Back
            </button>
        </div>
    `;

    const printButton = overlay.querySelector(".print-my-worksheet-button");
    if (printButton) {
        printButton.focus();
    }
}

function hidePrintPreparingScreen() {
    const overlay = document.querySelector(".print-preparing-overlay");

    if (overlay) {
        overlay.remove();
    }
}

function cleanupPrintResources() {
    if (printCleanupTimer) {
        window.clearTimeout(printCleanupTimer);
        printCleanupTimer = null;
    }

    if (activePrintFrame) {
        activePrintFrame.remove();
        activePrintFrame = null;
    }

    if (activePrintObjectUrl) {
        URL.revokeObjectURL(activePrintObjectUrl);
        activePrintObjectUrl = "";
    }

    activePrintTitle = "";
    hidePrintPreparingScreen();
}

function handlePrintFinished() {
    cleanupPrintResources();
}

function cancelPreparedPrint() {
    cleanupPrintResources();
}

function printPreparedWorksheet() {
    try {
        const printWindow = activePrintFrame && activePrintFrame.contentWindow;

        if (!printWindow) {
            throw new Error("The print window could not be opened.");
        }

        printWindow.focus();
        printWindow.addEventListener("afterprint", handlePrintFinished, { once: true });

        // Return the student to the worksheet folder as soon as the
        // user-initiated print action opens the native AirPrint dialog.
        hidePrintPreparingScreen();
        printWindow.print();

        printCleanupTimer = window.setTimeout(handlePrintFinished, 120000);
    } catch (error) {
        console.error(error);
        cleanupPrintResources();
        showErrorScreen(currentPagedTitle, "The print screen could not open. Please try the worksheet again.");
    }
}

async function printDrivePdf(encodedTitle, encodedMediaUrl) {
    const title = decodeURIComponent(encodedTitle);
    const mediaUrl = decodeURIComponent(encodedMediaUrl);

    cleanupPrintResources();
    activePrintTitle = title;
    showPrintPreparingScreen(title);

    try {
        const response = await fetch(mediaUrl);

        if (!response.ok) {
            throw new Error(`Unable to prepare worksheet (${response.status}).`);
        }

        const pdfBlob = await response.blob();

        if (!pdfBlob.type.includes("pdf")) {
            throw new Error("This worksheet is not a PDF file.");
        }

        activePrintObjectUrl = URL.createObjectURL(pdfBlob);
        activePrintFrame = document.createElement("iframe");
        activePrintFrame.className = "print-document-frame";
        activePrintFrame.title = `Print ${title}`;
        activePrintFrame.setAttribute("aria-hidden", "true");
        activePrintFrame.src = activePrintObjectUrl;

        activePrintFrame.onload = () => {
            window.setTimeout(() => {
                showPrintReadyScreen(activePrintTitle || title);
            }, 700);
        };

        activePrintFrame.onerror = () => {
            cleanupPrintResources();
            showErrorScreen(currentPagedTitle, "The worksheet could not be prepared for printing. Please try again.");
        };

        document.body.appendChild(activePrintFrame);
    } catch (error) {
        console.error(error);
        cleanupPrintResources();
        showErrorScreen(currentPagedTitle, error.message || "The worksheet could not be prepared for printing.");
    }
}

function openAudioPlayer(encodedTitle, encodedCoverUrl, encodedAudioUrl) {
    const title = decodeURIComponent(encodedTitle);
    const coverUrl = decodeURIComponent(encodedCoverUrl || "");
    const audioUrl = decodeURIComponent(encodedAudioUrl);

    const cover = coverUrl
        ? `<img src="${coverUrl}" alt="" class="player-cover-image">`
        : `<span class="player-cover-placeholder">🎧</span>`;

    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="goBackToCurrentFolder()">←</button>
            <h1>🎧 Listening</h1>
        </header>

        <section class="audio-player-screen">
            <article class="audio-player-card">
                <div class="player-cover">
                    ${cover}
                </div>

                <h2>${title}</h2>

                <audio class="story-audio" controls autoplay onended="showAudioFinished('${encodeURIComponent(title)}')">
                    <source src="${audioUrl}">
                    Your browser does not support audio playback.
                </audio>

                <button class="large-home-button" type="button" onclick="showHome()">
                    ⌂ Home
                </button>
            </article>
        </section>
    `;
}

function goBackToCurrentFolder() {
    const currentFolder = browseHistory[browseHistory.length - 1];

    if (!currentFolder) {
        showListen();
        return;
    }

    loadDriveFolder(currentFolder.folderId, currentFolder.title, false);
}

function showAudioFinished(encodedTitle) {
    const title = decodeURIComponent(encodedTitle);

    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="goBackToCurrentFolder()">←</button>
            <h1>🎧 Finished</h1>
        </header>

        <section class="status-panel">
            <div class="status-icon">✅</div>
            <h2>${title}</h2>
            <p>All done!</p>
            <button class="large-home-button" type="button" onclick="showHome()">
                ⌂ Home
            </button>
        </section>
    `;
}

init();
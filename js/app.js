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

let config = fallbackConfig;
let currentBrowseType = "";
let browseHistory = [];

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

    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="showHome()">⌂</button>
            <h1>🎧 Listening Center</h1>
        </header>

        <section class="category-grid">
            ${buildCategoryCards(config.listen, "listen")}
        </section>
    `;
}

function getCategory(type, categoryName) {
    const categories = config[type] || [];
    return categories.find(item => item.name === categoryName);
}

function getBackAction() {
    return browseHistory.length > 1 ? "goBack()" : currentBrowseType === "print" ? "showPrint()" : "showListen()";
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
    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${title}</h1>
        </header>

        <section class="file-grid">
            ${buildDriveItemCards(items)}
        </section>
    `;
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

        showDriveBrowser(title, items);
    } catch (error) {
        console.error(error);
        showErrorScreen(title, error.message);
    }
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

    await loadDriveFolder(category.folderId, `${category.icon} ${category.name}`);
}

async function openDriveFolder(folderId, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    await loadDriveFolder(folderId, `📁 ${title}`);
}

async function goBack() {
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

init();
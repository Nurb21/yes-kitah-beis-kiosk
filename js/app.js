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
let currentItems = [];
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

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showHome() {
    browseHistory = [];
    currentItems = [];

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
            <span>${escapeHtml(item.name)}</span>
        </button>
    `).join("");
}

function showPrint() {
    browseHistory = [];
    currentItems = [];

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
    currentItems = [];

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
            <h1>${escapeHtml(title)}</h1>
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
            <h1>${escapeHtml(title)}</h1>
        </header>

        <section class="status-panel error-panel">
            <div class="status-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>${escapeHtml(message)}</p>
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
            <h1>${escapeHtml(title)}</h1>
        </header>

        <section class="status-panel">
            <div class="status-icon">📭</div>
            <h2>No items yet</h2>
            <p>Add content to this Google Drive folder, then try again.</p>
        </section>
    `;
}

function buildDriveItemCards(items) {
    return items.map((item, index) => {
        const preview = item.thumbnailUrl
            ? `<img src="${item.thumbnailUrl}" alt="" class="file-thumbnail">`
            : `<span class="file-icon">${item.icon}</span>`;

        return `
            <button class="file-card" type="button" onclick="openBrowserItem(${index})">
                <span class="file-preview">
                    ${preview}
                </span>
                <span class="file-title">${escapeHtml(item.title)}</span>
            </button>
        `;
    }).join("");
}

function buildStoryCards(items) {
    return items.map((item, index) => {
        if (item.type === "folder") {
            return `
                <button class="story-card" type="button" onclick="openBrowserItem(${index})">
                    <span class="story-cover story-cover-placeholder">📁</span>
                    <span class="story-title">${escapeHtml(item.title)}</span>
                </button>
            `;
        }

        const cover = item.coverUrl
            ? `<img src="${item.coverUrl}" alt="" class="story-cover-image">`
            : `<span class="story-cover-placeholder">🎧</span>`;

        return `
            <button class="story-card" type="button" onclick="openAudioStory(${index})">
                <span class="story-cover">
                    ${cover}
                </span>
                <span class="story-title">${escapeHtml(item.title)}</span>
            </button>
        `;
    }).join("");
}

function showDriveBrowser(title, items, mode = "files") {
    currentItems = items;

    const gridClass = mode === "stories" ? "story-grid" : "file-grid";
    const cards = mode === "stories" ? buildStoryCards(items) : buildDriveItemCards(items);

    appElement.innerHTML = `
        <header class="screen-header">
            <button class="home-button" type="button" onclick="${getBackAction()}">←</button>
            <h1>${escapeHtml(title)}</h1>
        </header>

        <section class="${gridClass}">
            ${cards}
        </section>
    `;
}

async function loadDriveFolder(folderId, title, shouldPushHistory = true, mode = "files") {
    if (shouldPushHistory) {
        browseHistory.push({ folderId, title, mode });
    }

    showLoadingScreen(title);

    try {
        const items = mode === "stories"
            ? await getStoryPackages(config, folderId)
            : await getDriveItems(config, folderId);

        if (!items.length) {
            showEmptyScreen(title);
            return;
        }

        showDriveBrowser(title, items, mode);
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

    const isStoryCategory = type === "listen" && category.name.toLowerCase() === "stories";
    const mode = isStoryCategory ? "stories" : "files";

    await loadDriveFolder(category.folderId, `${category.icon} ${category.name}`, true, mode);
}

async function openBrowserItem(index) {
    const item = currentItems[index];

    if (!item) {
        return;
    }

    if (item.type === "story") {
        openAudioStory(index);
        return;
    }

    if (item.isFolder || item.type === "folder") {
        await loadDriveFolder(item.id, item.title, true, "files");
        return;
    }

    window.open(item.openUrl, "_blank", "noopener,noreferrer");
}

function openAudioStory(index) {
    const story = currentItems[index];

    if (!story || story.type !== "story") {
        return;
    }

    const cover = story.coverUrl
        ? `<img src="${story.coverUrl}" alt="" class="player-cover-image">`
        : `<div class="player-cover-placeholder">🎧</div>`;

    appElement.innerHTML = `
        <section class="audio-player-screen">
            <header class="screen-header">
                <button class="home-button" type="button" onclick="goBackToCurrentBrowser()">←</button>
                <h1>${escapeHtml(story.title)}</h1>
            </header>

            <div class="audio-player-card">
                <div class="player-cover">
                    ${cover}
                </div>

                <h2>${escapeHtml(story.title)}</h2>

                <audio id="storyAudio" class="story-audio" controls autoplay>
                    <source src="${story.audioUrl}" type="audio/mpeg">
                    Your browser does not support audio playback.
                </audio>

                <button class="large-home-button" type="button" onclick="showHome()">
                    ⌂ Home
                </button>
            </div>
        </section>
    `;

    const audio = document.querySelector("#storyAudio");

    if (audio) {
        audio.addEventListener("ended", () => {
            showHome();
        });
    }
}

function goBackToCurrentBrowser() {
    const currentFolder = browseHistory[browseHistory.length - 1];

    if (!currentFolder) {
        showListen();
        return;
    }

    loadDriveFolder(currentFolder.folderId, currentFolder.title, false, currentFolder.mode);
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

    await loadDriveFolder(previousFolder.folderId, previousFolder.title, false, previousFolder.mode);
}

async function reloadCurrentFolder() {
    const currentFolder = browseHistory[browseHistory.length - 1];

    if (!currentFolder) {
        showHome();
        return;
    }

    await loadDriveFolder(currentFolder.folderId, currentFolder.title, false, currentFolder.mode);
}

init();
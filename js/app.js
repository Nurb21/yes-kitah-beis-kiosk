const fallbackConfig = {
    print: [
        { name: "Mazes", icon: "🧩" },
        { name: "Coloring Pages", icon: "🖍️" },
        { name: "Color by Number", icon: "🎨" },
        { name: "Dot-to-Dot", icon: "🔢" }
    ],
    listen: [
        { name: "Stories", icon: "📖" },
        { name: "Music", icon: "🎵" }
    ]
};

let config = fallbackConfig;

async function init() {
    try {
        config = await loadConfig();
    } catch (error) {
        console.warn("Config failed. Using fallback.", error);
    }

    showHome();
}

function showHome() {
    document.querySelector(".home-screen").innerHTML = `
        <header class="brand">
            <img src="assets/images/yes-logo.png" alt="YES Logo" class="school-logo">
            <h1>YES Kitah Beis</h1>
        </header>

        <section class="home-actions">
            <button class="big-button print-button" onclick="showPrint()">
                <span class="button-icon">🖨️</span>
                <span>PRINT</span>
            </button>

            <button class="big-button listen-button" onclick="showListen()">
                <span class="button-icon">🎧</span>
                <span>LISTEN</span>
            </button>
        </section>
    `;
}

function buildCategoryCards(items, type) {
    return items.map(item => `
        <button class="category-card" onclick="openCategory('${type}', '${item.name}')">
            <span class="category-icon">${item.icon}</span>
            <span>${item.name}</span>
        </button>
    `).join("");
}

function showPrint() {
    document.querySelector(".home-screen").innerHTML = `
        <header class="screen-header">
            <button class="home-button" onclick="showHome()">⌂</button>
            <h1>🖨️ Print Center</h1>
        </header>

        <section class="category-grid">
            ${buildCategoryCards(config.print, "print")}
        </section>
    `;
}

function showListen() {
    document.querySelector(".home-screen").innerHTML = `
        <header class="screen-header">
            <button class="home-button" onclick="showHome()">⌂</button>
            <h1>🎧 Listening Center</h1>
        </header>

        <section class="category-grid">
            ${buildCategoryCards(config.listen, "listen")}
        </section>
    `;
}

function openCategory(type, category) {
    alert(`${type.toUpperCase()}\n\n${category}\n\nComing Soon`);
}

init();
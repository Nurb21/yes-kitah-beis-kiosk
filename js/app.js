const app = document.querySelector(".home-screen");

const printCategories = [
  { title: "Mazes", icon: "🧩" },
  { title: "Coloring Pages", icon: "🖍️" },
  { title: "Color by Number", icon: "🎨" },
  { title: "Dot-to-Dot", icon: "🔢" }
];

const listenCategories = [
  { title: "Stories", icon: "📖" },
  { title: "Music", icon: "🎵" }
];

document.getElementById("printBtn").addEventListener("click", () => {
  showCategoryScreen("Print Center", "🖨️", printCategories);
});

document.getElementById("listenBtn").addEventListener("click", () => {
  showCategoryScreen("Listening Center", "🎧", listenCategories);
});

function showCategoryScreen(title, icon, categories) {
  app.innerHTML = `
    <header class="screen-header">
      <button class="home-button" onclick="goHome()">⌂</button>
      <h1>${icon} ${title}</h1>
    </header>

    <section class="category-grid">
      ${categories.map(category => `
        <button class="category-card">
          <span class="category-icon">${category.icon}</span>
          <span>${category.title}</span>
        </button>
      `).join("")}
    </section>
  `;
}

function goHome() {
  location.reload();
}
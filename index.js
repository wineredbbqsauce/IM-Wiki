const USERS = [
  { id: 1, name: "Elev Mathias", role: "Elev" },
  { id: 2, name: "Simen", role: "Lærer" },
  { id: 3, name: "Tarald", role: "Lærer" },
  { id: 4, name: "Aksel", role: "Lærer" },
  { id: 5, name: "Christian", role: "Admin" },
];

const INITIAL_POSTS = [];

const CAT_COLORS = {
  BS: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  Utvikling: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  DS: { bg: "#fce4ec", text: "#880e4f", border: "#f48fb1" },
};
const CATEGORIES = ["Alle", "Brukerstøtte", "Utvikling", "Driftsstøtte"];
const CAT_ICONS = { Alle: "📚", BS: "🌿", Utvikling: "💻", DS: "🔒" };

let posts = JSON.parse(JSON.stringify(INITIAL_POSTS));
let currentUser = USERS[0];
let activeCategory = "Alle";
let expandedPosts = new Set();
let editingId = null;
let managedUsers = USERS.filter((u) => u.role !== "Admin");
let adminOpen = false;

// -- INIT --
function init() {
  const sel = document.getElementById("userSelect");
  USERS.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = `${u.name} (${u.role})`;
    sel.appendChild(opt);
  });
  renderAll();
}

// -- Switch User --
function switchUser(id) {
  currentUser = USERS.find((u) => u.id == id);
  adminOpen = false;
  document.getElementById("newPostPanel").classList.add("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
  renderAll();
}

// -- Render All --
function renderAll() {
  renderNav();
  renderSidebar();
  renderFeed();
}

// -- Render Nav --
function renderNav() {
  const btnNew = document.getElementById("btnNewPost");
  const btnAdmin = document.getElementById("btnAdmin");
  btnNew.classList.toggle("hidden", currentUser.role === "Elev");
  btnAdmin.classList.toggle("hidden", currentUser.role !== "Admin");
  btnAdmin.classList.toggle("active", adminOpen);
}

// -- Render Sidebar --
function renderSidebar() {
  // cat
}

// -- Render Feed --
function renderFeed() {
  // Admin panel
}

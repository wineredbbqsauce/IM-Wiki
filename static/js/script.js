const USERS = [
  { id: 1, name: "Mathias", role: "Elev" },
  { id: 2, name: "Simen", role: "Lærer" },
  { id: 3, name: "Tarald", role: "Lærer" },
  { id: 4, name: "Aksel", role: "Lærer" },
  { id: 5, name: "Christian", role: "Admin" },
];

const INITIAL_POSTS = [];

const CAT_COLORS = {
  Brukerstøtte: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  Utvikling: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  Driftsstøtte: { bg: "#fce4ec", text: "#880e4f", border: "#f48fb1" },
};
const CATEGORIES = ["Alle", "Brukerstøtte", "Utvikling", "Driftsstøtte"];
const CAT_ICONS = {
  Alle: "📚",
  Brukerstøtte: "🌿",
  Utvikling: "💻",
  Driftsstøtte: "🔒",
};

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
  // categories
  const container = document.getElementById("catButtons");
  container.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const col = CAT_COLORS[cat];
    const count = posts.filter((p) => p.category === cat).length;
    const isActive = activeCategory === cat;
    const btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.style.background = isActive ? (col ? col.bg : "#f0f0ff") : "#fff";
    btn.style.color = isActive ? (col ? col.text : "#1a1a2e") : "#444";
    btn.style.fontWeight = isActive ? "700" : "400";
    btn.style.borderLeft = isActive
      ? `3px solid ${col ? col.text : "#7c83fd"}`
      : "3px solid transparent";
    btn.innerHTML = `<span>${CAT_ICONS[cat]} ${cat}</span>${cat !== "Alle" ? `<span class="cat-count">${count}</span>` : ""}`;
    btn.onclick = () => {
      activeCategory = cat;
      renderAll();
    };
    container.appendChild(btn);
  });

  // -- USER --
  document.getElementById("sidebarName").textContent = currentUser.name;
  const badge = document.getElementById("sidebarRole");
  badge.textContent = currentUser.role;
  const roleColors = {
    Admin: { bg: "#fff3e0", text: "#e65100" },
    Lærer: { bg: "#e8f5e9", text: "#2e7d32" },
    Elev: { bg: "#e3f2fd", text: "#1565c0" },
  };
  const rc = roleColors[currentUser.role] || roleColors.Elev;
  badge.style.background = rc.bg;
  badge.style.color = rc.text;
}

// -- Render Feed --
function renderFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  // Admin panel
  if (adminOpen && currentUser.role === "Admin") renderAdminPanel();

  const filtered = posts.filter(
    (p) => activeCategory === "Alle" || p.category === activeCategory,
  );
  if (filtered.length === 0) {
    feed.innerHTML = `<div class="empty">Ingen poster i denne kategorien enda.</div>`;
    return;
  }
  // const pinned = filtered.find((p) => p.pinned) || filtered[0];
  // const older = filtered.filter((p) => p.id !== pinned.id);

  // // -- Featured divider --
  // feed.appendChild(makeDivider("📌 Fremhevet post"));
  // feed.appendChild(makePostCard(pinned, true));

  // if (older.length > 0) {
  //   feed.appendChild(makeDivider("Eldre Poster"));
  //   older.forEach((p) => feed.appendChild(makePostCard(p, false)));
  // }

  const pinned = filtered.find((p) => p.pinned) || null;
  const unpinned = filtered.filter((p) => !p.pinned);
  const newest = unpinned[0] || null;
  const older = unpinned.slice(1);

  if (pinned) {
    feed.appendChild(makeDivider("📌Fremhevet Post"));
    feed.appendChild(makePostCard(pinned, true));
  }

  if (newest) {
    feed.appendChild(makeDivider("🆕 Ny Post"));
    feed.appendChild(makePostCard(newest, true));
  }

  if (older.length) {
    feed.appendChild(makeDivider("Eldre Poster"));
    older.forEach((p) => feed.appendChild(makePostCard(p, false)));
  }
}

// -- Admin Panel --
function renderAdminPanel() {
  const panel = document.getElementById("adminPanel");
  panel.classList.remove("hidden");
  const list = document.getElementById("adminUserList");
  list.innerHTML = "";
  managedUsers.forEach((u) => {
    const row = document.createElement("div");
    row.className = "admin-user-row";
    const isElev = u.role === "Elev";
    row.innerHTML = `<div>
        <span style="font-weight:600;font-size:0.9rem">${u.name}</span>
        <span style="margin-left:0.5rem;font-size:0.8rem;color:#888">(${u.role})</span>
      </div>
      <button class="btn-role"
        style="background:${isElev ? "#e8f5e9" : "#fce4ec"};color:${isElev ? "#2e7d32" : "#c62828"};border:1px solid ${isElev ? "#a5d6a7" : "#f48fb1"}"
        onclick="toggleRole(${u.id})">${isElev ? "Gjør til Lærer" : "Gjør til Elev"}</button>
    `;
    list.appendChild(row);
  });
}

// -- Toggle Admin --
function toggleAdmin() {
  adminOpen = !adminOpen;
  const panel = document.getElementById("adminPanel");
  if (!adminOpen) panel.classList.add("hidden");
  renderNav();
  renderFeed();
}

// -- Toggle Role --
function toggleRole(uid) {
  managedUsers = managedUsers.map((u) =>
    u.id === uid ? { ...u, role: u.role === "Elev" ? "Lærer" : "Elev" } : u,
  );
  renderAdminPanel();
}

// -- POST CARD --
function makePostCard(post, featured) {
  const col = CAT_COLORS[post.category] || {};
  const isExp = expandedPosts.has(post.id);
  const canEdit =
    currentUser.role === "Admin" ||
    (currentUser.role === "Lærer" && post.author === currentUser.name);

  const card = document.createElement("div");
  card.className = "post-card" + (featured ? " featured" : "");
  card.id = "card-" + post.id;

  // HEADER
  const initials = post.author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  card.innerHTML = `
    <div class="post-header">
      <div class="post-meta">
        <div class="author-info">
          <div class="avatar">${initials}</div>
          <div>
            <div class="author-name">${esc(post.author)}</div>
            <div class="author-date">${formatDate(post.date)}</div>
          </div>
        </div>
        <span class="cat-tag" style="background:${col.bg || "#f0f0f0"};color:${col.text || "#333"};border:1px solid ${col.border || "#ddd"}">${post.category}</span>
      </div>
      <div class="post-title" style="font-size:${featured ? "1.35rem" : "1.05rem"}" onclick="toggleExpand(${post.id})">${esc(post.title)}</div>
    </div>
    <div class="post-body${!featured && !isExp ? " collapsed" : ""}" id="body-${post.id}">
      ${renderContent(featured || isExp ? post.content : post.content.slice(0, 200) + (post.content.length > 200 ? "…" : ""))}
      ${post.link && (featured || isExp) ? `<a class="wiki-link" href="${esc(post.link)}" target="_blank" rel="noreferrer">🔗 ${esc(post.linkText || post.link)}</a>` : ""}
      ${!featured && !isExp && post.content.length > 200 ? `<div class="fade-mask"></div>` : ""}
    </div>
    <div class="post-footer">
      ${!featured ? `<button class="btn-read-more" onclick="toggleExpand(${post.id})">${isExp ? "▲ Skjul" : "▼ Les mer"}</button>` : ""}
      <div class="post-actions">
        ${canEdit ? `    <button class="btn-pin" onclick="togglePin(${post.id})">${post.pinned ? "📌 Fjern fremheving" : "📌 Fremhev"}</button><button class="btn-edit" onclick="openEdit(${post.id})">✏️ Rediger</button><button class="btn-delete" onclick="deletePost(${post.id})">🗑️ Slett</button>` : ""}
      </div>
    </div>
  `;
  return card;
}

// -- Toggle Epand --
function toggleExpand(id) {
  if (expandedPosts.has(id)) expandedPosts.delete(id);
  else expandedPosts.add(id);
  renderFeed();
}

// -- Content Renderer --
function renderContent(text) {
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("## "))
        return `<div class="wiki-h3">${parseBold(esc(line.slice(3)))}</div>`;
      if (line.startsWith("- "))
        return `<li class="wiki-li">${parseBold(esc(line.slice(2)))}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<p class="wiki-p">${parseBold(esc(line))}</p>`;
    })
    .join("");
}

// -- ParseBold
function parseBold(html) {
  return html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, `<code class="wiki-code">$1</code>`);
}

// -- esc --
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// -- Format Date --
function formatDate(ds) {
  return new Date(ds).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// -- NEW POST --

function openNewPost() {
  document.getElementById("newPostPanel").classList.remove("hidden");
  document.getElementById("npTitle").value = "";
  document.getElementById("npContent").value = "";
  document.getElementById("npLink").value = "";
  document.getElementById("npLinkText").value = "";
  updatePublishBtn();
}

// -- Close NEW POST
function closeNewPost() {
  document.getElementById("newPostPanel").classList.add("hidden");
}

// -- Update Publish button
function updatePublishBtn() {
  const t = document.getElementById("npTitle").value.trim();
  const c = document.getElementById("npContent").value.trim();
  document.getElementById("btnPublish").disabled = !(t && c);
}

// -- Publish Post
function publishPost() {
  const post = {
    id: Date.now(),
    author: currentUser.name,
    authorRole: currentUser.role,
    category: document.getElementById("npCategory").value,
    title: document.getElementById("npTitle").value.trim(),
    content: document.getElementById("npContent").value.trim(),
    link: document.getElementById("npLink").value.trim() || null,
    linkText: document.getElementById("npLinkText").value.trim() || null,
    date: new Date().toISOString(),
    pinned: document.getElementById("npPinned").checked,
  };
  if (post.pinned) posts = posts.map((p) => ({ ...p, pinned: false }));
  posts.unshift(post);
  closeNewPost();
  renderAll();
}

// -- EDIT --
function openEdit(id) {
  editingId = id;
  const p = posts.find((x) => x.id === id);
  document.getElementById("editTitle").value = p.title;
  document.getElementById("editContent").value = p.content;
  document.getElementById("editLink").value = p.link || "";
  document.getElementById("editLinkText").value = p.linkText || "";
  document.getElementById("editModal").classList.remove("hidden");
}

// -- Close EDIT --
function closeEdit() {
  document.getElementById("editModal").classList.add("hidden");
  editingId = null;
}

// -- Save Edit--
function saveEdit() {
  posts = posts.map((p) =>
    p.id !== editingId
      ? p
      : {
          ...p,
          title: document.getElementById("editTitle").value.trim(),
          content: document.getElementById("editContent").value.trim(),
          link: document.getElementById("editLink").value.trim() || null,
          linkText:
            document.getElementById("editLinkText").value.trim() || null,
        },
  );
  closeEdit();
  renderAll();
}

// -- DELETE --
function deletePost(id) {
  if (!confirm("Vil du slette denne posten?")) return;
  posts = posts.filter((p) => p.id !== id);
  expandedPosts.delete(id);
  renderAll();
}

// -- DIVIDER HERE --
function makeDivider(label) {
  const dih = document.createElement("div");
  dih.className = "divider";
  dih.innerHTML = `<div class="divider-line"></div><span class="divider-label">${label}</span><div class="divider-line"></div>`;
  return dih;
}

// -- Toggle Pin --
function togglePin(id) {
  // BARE EN POST KAN VÆRE PINNED OM GANGEN
  posts = posts.map((p) => ({ ...p, pinned: p.id === id ? !p.pinned : false }));
  renderAll();
}

init();

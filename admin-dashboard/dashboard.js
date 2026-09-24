// ===================== Configuration for each editable content type =====================
// wrapperKey: the JSON key that wraps the array (matches what the public site's script.js reads)
// titleField / subField: which fields to show in the list preview
// fields: form fields shown in the edit modal
const SECTIONS = {
  news: {
    label: 'News',
    wrapperKey: 'articles',
    titleField: 'title',
    subField: 'date',
    imageField: 'image',
    fields: [
      { name: 'id', label: 'ID (short, no spaces — used in the article link)', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'date', label: 'Date', type: 'text' },
      { name: 'image', label: 'Image path (e.g. assets/uploads/photo.jpg)', type: 'text' },
      { name: 'summary', label: 'Summary (shown on the News list)', type: 'textarea' },
      { name: 'body', label: 'Full Article Body', type: 'textarea' },
    ]
  },
  leadership: {
    label: 'Board Leadership',
    wrapperKey: 'members',
    titleField: 'name',
    subField: 'role',
    imageField: 'photo',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text' },
      { name: 'role', label: 'Role / Title', type: 'text' },
      { name: 'photo', label: 'Photo path (e.g. assets/uploads/photo.jpg)', type: 'text' },
    ]
  },
  economy: {
    label: 'Economy Programs',
    wrapperKey: 'programs',
    titleField: 'title',
    subField: 'description',
    imageField: 'image',
    fields: [
      { name: 'title', label: 'Program Name', type: 'text' },
      { name: 'image', label: 'Image path', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ]
  },
  projects: {
    label: 'Projects',
    wrapperKey: 'items',
    titleField: 'title',
    subField: 'statusLabel',
    imageField: 'image',
    fields: [
      { name: 'title', label: 'Project Name', type: 'text' },
      { name: 'status', label: 'Status (ongoing / completed / planned)', type: 'select', options: ['ongoing', 'completed', 'planned'] },
      { name: 'statusLabel', label: 'Status Label (shown on the badge)', type: 'text' },
      { name: 'image', label: 'Image path', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'progress', label: 'Progress Percent (0-100)', type: 'number' },
      { name: 'progressLabel', label: 'Progress Label (shown under the bar)', type: 'text' },
    ]
  },
  locations: {
    label: 'Locations',
    wrapperKey: 'locations',
    titleField: 'name',
    subField: 'category',
    imageField: 'image',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: ['Palace', 'Enuwa', 'Mere', 'Rodo', 'Campus', 'Others'] },
      { name: 'status', label: 'Visitor Status', type: 'select', options: ['open', 'limited'] },
      { name: 'image', label: 'Image path', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ]
  },
};

let currentType = 'news';
let currentData = [];
let editingIndex = null; // null = adding new

const tabsEl = document.getElementById('dash-tabs');
const listEl = document.getElementById('dash-list');
const sectionTitleEl = document.getElementById('dash-section-title');
const addBtn = document.getElementById('dash-add-btn');
const modalOverlay = document.getElementById('dash-modal-overlay');
const modalTitle = document.getElementById('dash-modal-title');
const modalFields = document.getElementById('dash-modal-fields');
const modalClose = document.getElementById('dash-modal-close');
const saveBtn = document.getElementById('dash-save-btn');
const deleteBtn = document.getElementById('dash-delete-btn');
const emailEl = document.getElementById('dash-email');

// ---------- Session check ----------
fetch('/api/session').then(r => r.json()).then(s => {
  emailEl.textContent = s.email ? `Logged in as ${s.email}` : '';
});

// ---------- Build tabs ----------
function renderTabs() {
  tabsEl.innerHTML = Object.keys(SECTIONS).map(key => `
    <button class="dash-tab ${key === currentType ? 'active' : ''}" data-type="${key}">${SECTIONS[key].label}</button>
  `).join('');
  tabsEl.querySelectorAll('.dash-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentType = btn.getAttribute('data-type');
      renderTabs();
      loadSection();
    });
  });
}

// ---------- Load a section's data ----------
async function loadSection() {
  sectionTitleEl.textContent = SECTIONS[currentType].label;
  const res = await fetch(`/api/content/${currentType}`);
  const json = await res.json();
  currentData = json[SECTIONS[currentType].wrapperKey] || [];
  renderList();
}

function renderList() {
  const cfg = SECTIONS[currentType];
  if (!currentData.length) {
    listEl.innerHTML = `<div class="dash-empty">Nothing here yet — click "+ Add New" to create the first entry.</div>`;
    return;
  }
  listEl.innerHTML = currentData.map((item, i) => `
    <div class="dash-row">
      ${item[cfg.imageField] ? `<img src="/${item[cfg.imageField]}" alt="">` : `<div style="width:50px;height:50px;background:var(--stone-200);"></div>`}
      <div class="dash-row-info">
        <div class="title">${item[cfg.titleField] || '(untitled)'}</div>
        <div class="sub">${item[cfg.subField] || ''}</div>
      </div>
      <button class="dash-row-edit" data-index="${i}">Edit</button>
    </div>
  `).join('');
  listEl.querySelectorAll('.dash-row-edit').forEach(btn => {
    btn.addEventListener('click', () => openModal(parseInt(btn.getAttribute('data-index'))));
  });
}

// ---------- Modal (add/edit) ----------
function openModal(index) {
  editingIndex = index;
  const cfg = SECTIONS[currentType];
  const item = index === null ? {} : currentData[index];
  modalTitle.textContent = index === null ? `Add New — ${cfg.label}` : `Edit — ${cfg.label}`;
  deleteBtn.style.display = index === null ? 'none' : 'inline-flex';

  modalFields.innerHTML = cfg.fields.map(f => {
    const value = item[f.name] || '';
    if (f.type === 'textarea') {
      return `<div class="dash-field"><label>${f.label}</label><textarea data-field="${f.name}">${value}</textarea></div>`;
    }
    if (f.type === 'select') {
      return `<div class="dash-field"><label>${f.label}</label>
        <select data-field="${f.name}">
          ${f.options.map(o => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`).join('')}
        </select></div>`;
    }
    return `<div class="dash-field"><label>${f.label}</label><input type="${f.type}" data-field="${f.name}" value="${String(value).replace(/"/g, '&quot;')}"></div>`;
  }).join('') + (cfg.imageField ? `<p class="dash-hint">To use a new image: upload it to the assets/uploads folder on the server first (ask your developer if you're not sure how), then type its path above, e.g. assets/uploads/yourfile.jpg</p>` : '');

  modalOverlay.classList.add('open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingIndex = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

addBtn.addEventListener('click', () => openModal(null));

saveBtn.addEventListener('click', async () => {
  const cfg = SECTIONS[currentType];
  const item = {};
  modalFields.querySelectorAll('[data-field]').forEach(el => {
    let val = el.value;
    if (el.tagName === 'INPUT' && el.type === 'number') val = Number(val);
    item[el.getAttribute('data-field')] = val;
  });

  if (editingIndex === null) {
    currentData.push(item);
  } else {
    currentData[editingIndex] = item;
  }

  await saveCurrentData();
  closeModal();
  renderList();
});

deleteBtn.addEventListener('click', async () => {
  if (editingIndex === null) return;
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  currentData.splice(editingIndex, 1);
  await saveCurrentData();
  closeModal();
  renderList();
});

async function saveCurrentData() {
  const cfg = SECTIONS[currentType];
  const payload = { [cfg.wrapperKey]: currentData };
  const res = await fetch(`/api/content/${currentType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    alert('Something went wrong saving. Please try again.');
  }
}

// ---------- Init ----------
renderTabs();
loadSection();

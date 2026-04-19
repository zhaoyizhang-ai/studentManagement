import * as store from '../store.js';
import * as taskModal from './taskModal.js';

const NAV_ITEMS = [
  { hash: '#overview', icon: '☰', label: '概览' },
  { hash: '#matrix',   icon: '✶', label: '四象限' },
  { hash: '#calendar', icon: '▦', label: '日历' },
  { hash: '#stats',    icon: '▣', label: '统计' },
];

export function init() {
  render();
  store.on('change', render);
  document.getElementById('sidebar').addEventListener('click', e => {
    const navItem = e.target.closest('[data-hash]');
    if (navItem) { location.hash = navItem.dataset.hash; return; }
    const catItem = e.target.closest('[data-cat-id]');
    if (catItem) {
      document.dispatchEvent(new CustomEvent('filterCategory', { detail: { categoryId: catItem.dataset.catId } }));
      return;
    }
    if (e.target.closest('#sidebarAddBtn')) { taskModal.open(); return; }
    if (e.target.closest('#sidebarManageCats')) document.dispatchEvent(new CustomEvent('openCatManager'));
  });
}

export function render() {
  const cats = store.getCategories();
  const tasks = store.getTasks();
  const currentHash = location.hash || '#overview';
  const catCounts = {};
  tasks.forEach(t => { if (t.categoryId) catCounts[t.categoryId] = (catCounts[t.categoryId] || 0) + 1; });

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar__brand">
      <div class="sidebar__brand-icon">S</div>
      学习任务
    </div>
    <div class="sidebar__section">
      <div class="sidebar__section-label">导航</div>
      ${NAV_ITEMS.map(n => `
        <div class="sidebar__nav-item${currentHash === n.hash ? ' active' : ''}" data-hash="${n.hash}">
          <span class="sidebar__nav-icon">${n.icon}</span>${n.label}
        </div>
      `).join('')}
    </div>
    <div class="sidebar__section">
      <div class="sidebar__section-label">分类</div>
      <div class="sidebar__nav-item" data-cat-id="">
        <span class="sidebar__nav-icon">▦</span>全部
        <span class="sidebar__cat-count">${tasks.length}</span>
      </div>
      ${cats.map(c => `
        <div class="sidebar__nav-item" data-cat-id="${c.id}">
          <span class="sidebar__cat-dot" style="background:${c.color}"></span>
          ${c.name}<span class="sidebar__cat-count">${catCounts[c.id] || 0}</span>
        </div>
      `).join('')}
    </div>
    <div class="sidebar__footer">
      <button class="sidebar__add-btn" id="sidebarAddBtn">+ 新建任务</button>
      <button class="sidebar__manage-cats" id="sidebarManageCats">管理分类</button>
    </div>
  `;
}

export function setActiveHash(hash) {
  document.querySelectorAll('[data-hash]').forEach(el => {
    el.classList.toggle('active', el.dataset.hash === hash);
  });
}

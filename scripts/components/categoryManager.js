import * as store from '../store.js';

export function init() {
  document.getElementById('catModalClose').addEventListener('click', close);
  document.getElementById('catModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) close();
  });
  document.addEventListener('openCatManager', open);
}

function open() { render(); document.getElementById('catModalOverlay').hidden = false; }
function close() { document.getElementById('catModalOverlay').hidden = true; }

function render() {
  const cats = store.getCategories();
  const body = document.getElementById('catManagerBody');
  body.innerHTML = `
    <div class="cat-list">
      ${cats.map(c => `
        <div class="cat-item">
          <input type="color" class="cat-color-input" value="${c.color}" data-cat-id="${c.id}" />
          <input type="text" class="cat-name-input" value="${c.name}" maxlength="30" data-cat-id="${c.id}" />
          <button class="cat-delete-btn" data-cat-id="${c.id}">删除</button>
        </div>
      `).join('')}
    </div>
    <div class="cat-add-row">
      <input type="text" id="newCatName" placeholder="新分类名称" maxlength="30" />
      <input type="color" id="newCatColor" value="#6366f1" />
      <button class="btn btn--primary" id="addCatBtn">添加</button>
    </div>
  `;
  body.querySelectorAll('.cat-name-input').forEach(input => {
    input.addEventListener('change', () => store.updateCategory(input.dataset.catId, { name: input.value.trim() }));
  });
  body.querySelectorAll('.cat-color-input').forEach(input => {
    input.addEventListener('change', () => store.updateCategory(input.dataset.catId, { color: input.value }));
  });
  body.querySelectorAll('.cat-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('删除分类？该分类下的任务将变为未分类')) {
        store.deleteCategory(btn.dataset.catId);
        render();
      }
    });
  });
  document.getElementById('addCatBtn').addEventListener('click', () => {
    const name = document.getElementById('newCatName').value.trim();
    const color = document.getElementById('newCatColor').value;
    if (!name) return;
    store.addCategory({ name, color });
    render();
  });
}

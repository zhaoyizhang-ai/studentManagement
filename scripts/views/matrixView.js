import * as store from '../store.js';
import { createTaskCard } from '../components/taskCard.js';

function getQuadrant(task) {
  if (task.isImportant && task.isUrgent) return 1;
  if (task.isImportant && !task.isUrgent) return 2;
  if (!task.isImportant && task.isUrgent) return 3;
  return 4;
}

let changeHandler = null;

export function mount(container) {
  document.getElementById('viewTitle').textContent = '四象限视图';
  changeHandler = () => render(container);
  store.on('change', changeHandler);
  render(container);
}

export function unmount() {
  if (changeHandler) store.off('change', changeHandler);
}

function render(container) {
  const tasks = store.getTasks().filter(t => t.status !== 'done');
  const cats = store.getCategories();
  const Q = [
    { q: 1, t: '重要且紧迫', s: '立即处理' },
    { q: 2, t: '重要不紧迫', s: '计划安排' },
    { q: 3, t: '不重要紧迫', s: '委托他人' },
    { q: 4, t: '不重要不紧迫', s: '考虑删除' },
  ];

  container.innerHTML = `
    <div class="matrix-labels">
      <div></div>
      <div class="matrix-axis-label">紧迫</div>
      <div class="matrix-axis-label">不紧迫</div>
      <div class="matrix-axis-label matrix-axis-label--vert">重要</div>
      ${Q.slice(0,2).map(({ q, t, s }) => `
        <div class="matrix-quadrant q${q}" data-quadrant="${q}">
          <div class="matrix-quadrant__header">
            <span class="matrix-quadrant__title">${t}</span>
            <span class="matrix-quadrant__sub">${s}</span>
          </div>
          <div class="task-list" id="qList${q}"></div>
        </div>
      `).join('')}
      <div class="matrix-axis-label matrix-axis-label--vert">不重要</div>
      ${Q.slice(2).map(({ q, t, s }) => `
        <div class="matrix-quadrant q${q}" data-quadrant="${q}">
          <div class="matrix-quadrant__header">
            <span class="matrix-quadrant__title">${t}</span>
            <span class="matrix-quadrant__sub">${s}</span>
          </div>
          <div class="task-list" id="qList${q}"></div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('[data-quadrant]').forEach(qEl => {
    qEl.addEventListener('dragover', e => { e.preventDefault(); qEl.classList.add('drag-over'); });
    qEl.addEventListener('dragleave', () => qEl.classList.remove('drag-over'));
    qEl.addEventListener('drop', e => {
      e.preventDefault();
      qEl.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('taskId');
      const q = parseInt(qEl.dataset.quadrant);
      store.updateTask(taskId, { isImportant: q === 1 || q === 2, isUrgent: q === 1 || q === 3 });
    });
  });

  [1, 2, 3, 4].forEach(q => {
    const list = document.getElementById(`qList${q}`);
    const qTasks = tasks.filter(t => getQuadrant(t) === q);
    qTasks.forEach(t => {
      const card = createTaskCard(t, cats);
      card.draggable = true;
      card.addEventListener('dragstart', e => e.dataTransfer.setData('taskId', t.id));
      list.appendChild(card);
    });
    if (!qTasks.length) list.innerHTML = '<div class="matrix-empty">暂无任务</div>';
  });
}

import * as store from '../store.js';
import { isOverdue, isToday, getRelativeLabel } from '../utils/dateUtils.js';

const PRIORITY_MAP = { high: '高', medium: '中', low: '低' };

export function createTaskCard(task, categories) {
  const cat = categories.find(c => c.id === task.categoryId);
  const isDone = task.status === 'done';
  const overdue = !isDone && task.dueDate && isOverdue(task.dueDate);
  const today = !isDone && task.dueDate && isToday(task.dueDate);
  const relLabel = task.dueDate ? getRelativeLabel(task.dueDate) : '';

  const el = document.createElement('div');
  el.className = `task-card${isDone ? ' is-done' : ''}`;
  el.dataset.taskId = task.id;
  el.innerHTML = `
    <div class="task-card__color-bar" style="background:${cat ? cat.color : 'var(--color-border)'}"></div>
    <div class="task-card__check">
      <div class="task-card__checkbox ${isDone ? 'checked' : ''}" data-toggle-id="${task.id}"></div>
    </div>
    <div class="task-card__body">
      <div class="task-card__title">${escHtml(task.title)}</div>
      <div class="task-card__meta">
        ${cat ? `<span class="tag" style="background:${cat.color}22;color:${cat.color}">${escHtml(cat.name)}</span>` : ''}
        <span class="priority-badge ${task.priority}">${PRIORITY_MAP[task.priority] || task.priority}</span>
        ${relLabel ? `<span class="due-label${overdue ? ' overdue' : today ? ' today' : ''}">${relLabel}</span>` : ''}
      </div>
    </div>
  `;

  el.querySelector('[data-toggle-id]').addEventListener('click', e => {
    e.stopPropagation();
    store.toggleStatus(task.id);
  });

  el.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('openTaskModal', { detail: { taskId: task.id } }));
  });

  return el;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

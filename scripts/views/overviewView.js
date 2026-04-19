import * as store from '../store.js';
import { createTaskCard } from '../components/taskCard.js';
import { isThisWeek, todayStr } from '../utils/dateUtils.js';

let filterCategoryId = null;
let changeHandler = null;

export function mount(container) {
  filterCategoryId = null;
  document.getElementById('viewTitle').textContent = '概览';
  document.addEventListener('filterCategory', onFilter);
  changeHandler = () => render(container);
  store.on('change', changeHandler);
  render(container);
}

export function unmount() {
  document.removeEventListener('filterCategory', onFilter);
  if (changeHandler) store.off('change', changeHandler);
}

function onFilter(e) {
  filterCategoryId = e.detail.categoryId || null;
  render(document.getElementById('viewContainer'));
}

function render(container) {
  const tasks = store.getTasks();
  const cats = store.getCategories();
  const today = todayStr();
  const filtered = filterCategoryId ? tasks.filter(t => t.categoryId === filterCategoryId) : tasks;

  const todayTasks = filtered.filter(t => t.dueDate === today && t.status !== 'done');
  const weekTasks  = filtered.filter(t => t.dueDate && isThisWeek(t.dueDate) && t.dueDate !== today && t.status !== 'done');
  const doneTasks  = filtered.filter(t => t.status === 'done').slice(0, 5);

  const total = tasks.length;
  const done  = tasks.filter(t => t.status === 'done').length;
  const todo  = tasks.filter(t => t.status === 'todo').length;
  const inPr  = tasks.filter(t => t.status === 'in-progress').length;

  container.innerHTML = `
    <div class="overview-stats">
      <div class="stat-card"><div class="stat-card__value">${total}</div><div class="stat-card__label">全部任务</div></div>
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-warning)">${todo}</div><div class="stat-card__label">待办</div></div>
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-primary)">${inPr}</div><div class="stat-card__label">进行中</div></div>
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-success)">${done}</div><div class="stat-card__label">已完成</div></div>
    </div>
    <div class="overview-sections">
      <div class="overview-section">
        <h2 class="section-title">今日任务 <span class="section-badge">${todayTasks.length}</span></h2>
        <div class="task-list" id="todayList"></div>
        ${!todayTasks.length ? emptyState('今日没有到期任务') : ''}
      </div>
      <div class="overview-section">
        <h2 class="section-title">本周任务 <span class="section-badge">${weekTasks.length}</span></h2>
        <div class="task-list" id="weekList"></div>
        ${!weekTasks.length ? emptyState('本周无其他待办任务') : ''}
      </div>
      <div class="overview-section">
        <h2 class="section-title">最近完成 <span class="section-badge">${doneTasks.length}</span></h2>
        <div class="task-list" id="doneList"></div>
        ${!doneTasks.length ? emptyState('还没有完成的任务') : ''}
      </div>
    </div>
  `;
  const append = (id, list) => {
    const el = document.getElementById(id);
    if (el) list.forEach(t => el.appendChild(createTaskCard(t, cats)));
  };
  append('todayList', todayTasks);
  append('weekList', weekTasks);
  append('doneList', doneTasks);
}

function emptyState(msg) {
  return `<div class="empty-state"><div class="empty-state__icon">✓</div><div class="empty-state__text">${msg}</div></div>`;
}

import * as store from '../store.js';
import { isOverdue, isToday } from '../utils/dateUtils.js';

let currentYear, currentMonth;
let changeHandler = null;

export function mount(container) {
  document.getElementById('viewTitle').textContent = '日历视图';
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  changeHandler = () => render(container);
  store.on('change', changeHandler);
  render(container);
}

export function unmount() {
  if (changeHandler) store.off('change', changeHandler);
}

function render(container) {
  const tasks = store.getTasks();
  const cats  = store.getCategories();
  const monthName = new Date(currentYear, currentMonth, 1)
    .toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  container.innerHTML = `
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="btn" id="calPrev">&lt; 上一月</button>
        <h2 class="calendar-month">${monthName}</h2>
        <button class="btn" id="calNext">下一月 &gt;</button>
      </div>
      <div class="calendar-grid">
        ${['一','二','三','四','五','六','日'].map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
        ${buildDayCells(currentYear, currentMonth, tasks, cats)}
      </div>
      <div class="calendar-day-detail" id="calDayDetail" hidden></div>
    </div>
  `;

  document.getElementById('calPrev').addEventListener('click', () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } render(container);
  });
  document.getElementById('calNext').addEventListener('click', () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } render(container);
  });
  container.querySelectorAll('.calendar-day[data-date]').forEach(cell => {
    cell.addEventListener('click', () => showDayDetail(cell.dataset.date, tasks, cats));
  });
}

function buildDayCells(year, month, tasks, cats) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7;
  const todayObj = new Date();
  let html = '';
  for (let i = 0; i < startDow; i++) html += '<div class="calendar-day calendar-day--empty"></div>';
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const isT = year === todayObj.getFullYear() && month === todayObj.getMonth() && d === todayObj.getDate();
    const hasOverdue = dayTasks.some(t => t.status !== 'done' && isOverdue(t.dueDate));
    html += `
      <div class="calendar-day${isT ? ' calendar-day--today' : ''}${hasOverdue ? ' calendar-day--overdue' : ''}" data-date="${dateStr}">
        <span class="calendar-day__num">${d}</span>
        <div class="calendar-day__dots">
          ${dayTasks.slice(0, 4).map(t => {
            const cat = cats.find(c => c.id === t.categoryId);
            return `<span class="calendar-dot${t.status === 'done' ? ' done' : ''}" style="background:${cat ? cat.color : 'var(--color-primary)'}"></span>`;
          }).join('')}
        </div>
      </div>
    `;
  }
  return html;
}

function showDayDetail(dateStr, tasks, cats) {
  const detail = document.getElementById('calDayDetail');
  const dayTasks = tasks.filter(t => t.dueDate === dateStr);
  detail.hidden = false;
  detail.innerHTML = `
    <div class="cal-detail-header">
      <strong>${dateStr} 任务</strong>
      <button class="modal__close" id="calDetailClose">&times;</button>
    </div>
    <div class="cal-detail-list">
      ${dayTasks.length ? dayTasks.map(t => {
        const cat = cats.find(c => c.id === t.categoryId);
        return `<div class="cal-detail-item" data-task-id="${t.id}">
          <span class="cal-dot" style="background:${cat ? cat.color : 'var(--color-border)'}"></span>
          <span class="${t.status === 'done' ? 'done-text' : ''}">${t.title}</span>
        </div>`;
      }).join('') : '<div style="color:var(--color-text-muted);font-size:.85rem">这天没有任务</div>'}
    </div>
  `;
  document.getElementById('calDetailClose').addEventListener('click', () => { detail.hidden = true; });
  detail.querySelectorAll('[data-task-id]').forEach(el => {
    el.addEventListener('click', () => document.dispatchEvent(new CustomEvent('openTaskModal', { detail: { taskId: el.dataset.taskId } })));
  });
}

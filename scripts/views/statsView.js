import * as store from '../store.js';
import { drawDonut, drawLine, drawBar } from '../utils/chartUtils.js';

let changeHandler = null;

export function mount(container) {
  document.getElementById('viewTitle').textContent = '任务统计';
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
  const total = tasks.length;
  const done  = tasks.filter(t => t.status === 'done').length;
  const rate  = total ? Math.round((done / total) * 100) : 0;

  const weekDays   = getLast7Days();
  const weekCounts = weekDays.map(d => tasks.filter(t => t.completedAt && t.completedAt.startsWith(d)).length);

  const catData = cats.map(c => ({ name: c.name, color: c.color, total: 0, done: 0 }));
  catData.push({ name: '未分类', color: '#94a3b8', total: 0, done: 0 });
  tasks.forEach(t => {
    const ci = t.categoryId
      ? catData.findIndex(d => { const c = cats.find(x => x.id === t.categoryId); return c && c.name === d.name; })
      : catData.length - 1;
    if (ci >= 0) { catData[ci].total++; if (t.status === 'done') catData[ci].done++; }
  });
  const activeCats = catData.filter(d => d.total > 0);

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-card__value">${total}</div><div class="stat-card__label">全部任务</div></div>
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-success)">${done}</div><div class="stat-card__label">已完成</div></div>
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-primary)">${rate}%</div><div class="stat-card__label">总完成率</div></div>
    </div>
    <div class="stats-charts">
      <div class="chart-card">
        <h3 class="chart-title">分类占比</h3>
        <canvas id="chartDonut" width="220" height="220"></canvas>
        <div class="chart-legend" id="donutLegend"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">近 7 天完成趋势</h3>
        <canvas id="chartLine" width="400" height="220"></canvas>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">分类完成对比</h3>
        <canvas id="chartBar" width="400" height="220"></canvas>
        <div class="chart-legend-row">
          <span class="legend-dot" style="background:#94a3b855"></span> 总任务
          <span class="legend-dot" style="background:#6366f1"></span> 已完成
        </div>
      </div>
    </div>
  `;

  if (activeCats.length) {
    drawDonut(document.getElementById('chartDonut'), activeCats.map(d => ({ value: d.total })), activeCats.map(d => d.color));
    document.getElementById('donutLegend').innerHTML = activeCats.map(d =>
      `<div class="legend-item"><span class="legend-dot" style="background:${d.color}"></span>${d.name} (${d.total})</div>`
    ).join('');
    drawBar(document.getElementById('chartBar'), activeCats.map(d => d.name), activeCats.map(d => d.total), activeCats.map(d => d.done), activeCats.map(d => d.color));
  }
  drawLine(document.getElementById('chartLine'), weekDays.map(d => d.slice(5)), weekCounts);
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

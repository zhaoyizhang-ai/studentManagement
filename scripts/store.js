import { createTask } from './models/task.js';
import { createCategory, DEFAULT_CATEGORIES } from './models/category.js';
import { todayStr } from './utils/dateUtils.js';

const KEYS = { tasks: 'sm_tasks', categories: 'sm_categories', settings: 'sm_settings' };
const listeners = [];
let state = { tasks: [], categories: [], settings: { theme: 'light', defaultView: 'overview' } };

function notify() { listeners.forEach(fn => fn(state)); }
function save() {
  localStorage.setItem(KEYS.tasks, JSON.stringify(state.tasks));
  localStorage.setItem(KEYS.categories, JSON.stringify(state.categories));
  localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
}

export function init() {
  const rawTasks = localStorage.getItem(KEYS.tasks);
  const rawCats = localStorage.getItem(KEYS.categories);
  const rawSettings = localStorage.getItem(KEYS.settings);

  state.categories = rawCats ? JSON.parse(rawCats) : [...DEFAULT_CATEGORIES];
  state.settings = rawSettings ? JSON.parse(rawSettings) : state.settings;

  if (rawTasks) {
    state.tasks = JSON.parse(rawTasks);
  } else {
    const today = todayStr();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    state.tasks = [
      createTask({ id: 'demo-1', title: '完成数学作业', categoryId: 'cat-1', priority: 'high', isImportant: true, isUrgent: true, dueDate: today }),
      createTask({ id: 'demo-2', title: '阅读英语课文', categoryId: 'cat-2', priority: 'medium', isImportant: true, isUrgent: false, dueDate: tomorrowStr }),
      createTask({ id: 'demo-3', title: '刷算法题', categoryId: 'cat-3', priority: 'medium', isImportant: false, isUrgent: true, dueDate: today }),
      createTask({ id: 'demo-4', title: '整理笔记', categoryId: 'cat-4', priority: 'low', isImportant: false, isUrgent: false }),
      createTask({ id: 'demo-5', title: '预习明天的课程', categoryId: 'cat-2', priority: 'medium', isImportant: true, isUrgent: false, dueDate: tomorrowStr }),
    ];
    save();
  }
  if (!rawCats) save();
}

export function on(event, fn) { if (event === 'change') listeners.push(fn); }
export function off(event, fn) { const i = listeners.indexOf(fn); if (i !== -1) listeners.splice(i, 1); }

export function getTasks(filter = {}) {
  let list = [...state.tasks];
  if (filter.categoryId !== undefined) list = list.filter(t => t.categoryId === filter.categoryId);
  if (filter.status) list = list.filter(t => t.status === filter.status);
  if (filter.date) list = list.filter(t => t.dueDate === filter.date);
  return list;
}

export function getTaskById(id) { return state.tasks.find(t => t.id === id); }

export function addTask(data) {
  const task = createTask(data);
  state.tasks.push(task);
  save(); notify();
  return task;
}

export function updateTask(id, data) {
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  const was = state.tasks[idx];
  const wasDone = was.status === 'done';
  const nowDone = data.status === 'done';
  state.tasks[idx] = {
    ...was, ...data, id,
    updatedAt: new Date().toISOString(),
    completedAt: nowDone && !wasDone ? new Date().toISOString() : (nowDone ? was.completedAt : null),
  };
  save(); notify();
  return state.tasks[idx];
}

export function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  save(); notify();
}

export function toggleStatus(id) {
  const task = getTaskById(id);
  if (!task) return;
  updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' });
}

export function getCategories() { return [...state.categories]; }
export function getCategoryById(id) { return state.categories.find(c => c.id === id); }

export function addCategory(data) {
  const cat = createCategory(data);
  state.categories.push(cat);
  save(); notify();
  return cat;
}

export function updateCategory(id, data) {
  const idx = state.categories.findIndex(c => c.id === id);
  if (idx === -1) return;
  state.categories[idx] = { ...state.categories[idx], ...data, id };
  save(); notify();
}

export function deleteCategory(id) {
  state.categories = state.categories.filter(c => c.id !== id);
  state.tasks = state.tasks.map(t => t.categoryId === id ? { ...t, categoryId: null } : t);
  save(); notify();
}

export function getSettings() { return { ...state.settings }; }
export function updateSettings(data) { state.settings = { ...state.settings, ...data }; save(); }

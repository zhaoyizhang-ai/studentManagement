import * as store from '../store.js';
import { validateTask } from '../models/task.js';

let currentTaskId = null;

const overlay = () => document.getElementById('taskModalOverlay');
const form = () => document.getElementById('taskForm');

export function init() {
  document.getElementById('taskModalClose').addEventListener('click', close);
  document.getElementById('taskCancelBtn').addEventListener('click', close);
  overlay().addEventListener('click', e => { if (e.target === e.currentTarget) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  form().addEventListener('submit', e => { e.preventDefault(); save(); });
  document.getElementById('taskDeleteBtn').addEventListener('click', () => {
    if (!currentTaskId) return;
    if (confirm('确认删除这个任务？')) {
      store.deleteTask(currentTaskId);
      close();
    }
  });
  document.addEventListener('openTaskModal', e => open(e.detail.taskId));
}

export function open(taskId = null) {
  currentTaskId = taskId;
  const task = taskId ? store.getTaskById(taskId) : null;
  populateCategories();
  document.getElementById('taskModalTitle').textContent = task ? '编辑任务' : '新建任务';
  document.getElementById('taskDeleteBtn').hidden = !task;
  document.getElementById('fTitle').value = task?.title || '';
  document.getElementById('fDesc').value = task?.description || '';
  document.getElementById('fCategory').value = task?.categoryId || '';
  document.getElementById('fPriority').value = task?.priority || 'medium';
  document.getElementById('fStatus').value = task?.status || 'todo';
  document.getElementById('fDueDate').value = task?.dueDate || '';
  document.getElementById('fImportant').checked = task?.isImportant || false;
  document.getElementById('fUrgent').checked = task?.isUrgent || false;
  document.getElementById('fTitleError').textContent = '';
  overlay().hidden = false;
  document.getElementById('fTitle').focus();
}

export function close() {
  overlay().hidden = true;
  currentTaskId = null;
}

function populateCategories() {
  const sel = document.getElementById('fCategory');
  const cats = store.getCategories();
  sel.innerHTML = '<option value="">无分类</option>' +
    cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function save() {
  const data = {
    title: document.getElementById('fTitle').value.trim(),
    description: document.getElementById('fDesc').value.trim(),
    categoryId: document.getElementById('fCategory').value || null,
    priority: document.getElementById('fPriority').value,
    status: document.getElementById('fStatus').value,
    dueDate: document.getElementById('fDueDate').value || null,
    isImportant: document.getElementById('fImportant').checked,
    isUrgent: document.getElementById('fUrgent').checked,
  };
  const errors = validateTask(data);
  document.getElementById('fTitleError').textContent = errors.title || '';
  if (Object.keys(errors).length) return;
  if (currentTaskId) store.updateTask(currentTaskId, data);
  else store.addTask(data);
  close();
}

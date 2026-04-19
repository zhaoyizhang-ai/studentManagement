export function createTask(partial = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    categoryId: null,
    priority: 'medium',
    status: 'todo',
    isImportant: false,
    isUrgent: false,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    ...partial,
  };
}

export function validateTask(data) {
  const errors = {};
  if (!data.title || !data.title.trim()) errors.title = '标题不能为空';
  if (data.title && data.title.length > 100) errors.title = '标题不能超过100字';
  return errors;
}

export function getMatrixQuadrant(task) {
  if (task.isImportant && task.isUrgent) return 1;
  if (task.isImportant && !task.isUrgent) return 2;
  if (!task.isImportant && task.isUrgent) return 3;
  return 4;
}

export function createCategory(partial = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    color: '#6366f1',
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: '数学', color: '#ef4444', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: '英语', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: '编程', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: '其他', color: '#f59e0b', createdAt: new Date().toISOString() },
];

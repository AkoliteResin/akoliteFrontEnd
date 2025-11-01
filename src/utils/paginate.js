// src/utils/paginate.js
export function paginate(items = [], page = 1, pageSize = 10) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, page: current, pageSize, total, totalPages };
}

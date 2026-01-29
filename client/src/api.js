const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error('Serverga ulanish imkonsiz. Serverni ishga tushiring (npm run server yoki npm run dev).');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.detail || 'Xatolik yuz berdi.');
  }
  return data;
}

export const authApi = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => api('/auth/me', { headers: { Authorization: `Bearer ${getToken()}` } })
};

export const adminApi = {
  teachers: () => api('/admin/teachers'),
  createTeacher: (body) => api('/admin/teachers', { method: 'POST', body: JSON.stringify(body) }),
  groups: () => api('/admin/groups'),
  createGroup: (body) => api('/admin/groups', { method: 'POST', body: JSON.stringify(body) }),
  students: (groupId) => api(groupId ? `/admin/students?group_id=${groupId}` : '/admin/students'),
  createStudent: (body) => api('/admin/students', { method: 'POST', body: JSON.stringify(body) }),
  updateStudent: (id, body) => api(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updatePassword: (userId, password) => api(`/admin/users/${userId}/password`, { method: 'PUT', body: JSON.stringify({ password }) }),
  logins: () => api('/admin/logins')
};

export const gradesApi = {
  getGrades: (studentId) => api(`/students/${studentId}/grades`),
  addGrade: (studentId, body) => api(`/students/${studentId}/grades`, { method: 'POST', body: JSON.stringify(body) }),
  getBonuses: (studentId) => api(`/students/${studentId}/bonuses`),
  addBonus: (studentId, body) => api(`/students/${studentId}/bonuses`, { method: 'POST', body: JSON.stringify(body) })
};

export const profileApi = {
  get: () => api('/me/profile'),
  update: (body) => api('/me/profile', { method: 'PUT', body: JSON.stringify(body) })
};

export const emailApi = {
  sendMonthlyReport: (studentId, month, year) =>
    api(`/email/send-monthly-report/${studentId}?month=${month || ''}&year=${year || ''}`, { method: 'POST' }),
  sendAllMonthlyReports: (month, year) =>
    api(`/email/send-monthly-reports?month=${month || ''}&year=${year || ''}`, { method: 'POST' })
};

export const newsApi = {
  list: () => api('/news'),
  create: (body) => api('/admin/news', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => api(`/admin/news/${id}`, { method: 'DELETE' })
};

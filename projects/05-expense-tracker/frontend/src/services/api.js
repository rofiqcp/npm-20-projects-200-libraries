import axios from 'axios';

const API_BASE = '/api/expenses';

export const getExpenses = (params = {}) =>
  axios.get(API_BASE, { params }).then(r => r.data);

export const createExpense = (data) =>
  axios.post(API_BASE, data).then(r => r.data);

export const updateExpense = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data).then(r => r.data);

export const deleteExpense = (id) =>
  axios.delete(`${API_BASE}/${id}`).then(r => r.data);

export const getSummary = () =>
  axios.get(`${API_BASE}/summary`).then(r => r.data);

export const exportCSV = () => {
  window.open(`${API_BASE}/export/csv`, '_blank');
};

import React, { useState, useEffect, useCallback } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import CategoryChart from './components/CategoryChart';
import Summary from './components/Summary';
import { getExpenses, createExpense, updateExpense, deleteExpense, getSummary, exportCSV } from './services/api';

const CATEGORIES = ['All', 'Food', 'Transport', 'Entertainment', 'Health', 'Other'];

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ overall: null, monthly: [], byCategory: [] });
  const [editExpense, setEditExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', category: 'All' });
  const [activeTab, setActiveTab] = useState('expenses');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category !== 'All') params.category = filters.category;

      const [expData, sumData] = await Promise.all([
        getExpenses(params),
        getSummary(),
      ]);
      setExpenses(expData);
      setSummary(sumData);
      setError('');
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data) => {
    try {
      if (editExpense) {
        await updateExpense(editExpense.id, data);
        setEditExpense(null);
      } else {
        await createExpense(data);
      }
      await fetchData();
    } catch (err) {
      setError('Failed to save expense.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      await fetchData();
    } catch (err) {
      setError('Failed to delete expense.');
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setActiveTab('expenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', category: 'All' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">💰 Expense Tracker</h1>
            <p className="text-blue-200 text-sm mt-0.5">Track your spending easily</p>
          </div>
          <button
            onClick={exportCSV}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6 w-fit">
          {['expenses', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'expenses' ? '📋 Expenses' : '📊 Analytics'}
            </button>
          ))}
        </div>

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <ExpenseForm
                onSubmit={handleSubmit}
                editExpense={editExpense}
                onCancel={() => setEditExpense(null)}
              />

              {/* Filters */}
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Filters</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={clearFilters}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {loading ? (
                <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                  Loading expenses...
                </div>
              ) : (
                <ExpenseList
                  expenses={expenses}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Summary overall={summary.overall} monthly={summary.monthly} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart byCategory={summary.byCategory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

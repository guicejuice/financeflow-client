import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '', type: 'checking', balance: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    account_id: '', description: '', amount: '',
    category: 'Food', date: '', type: 'debit'
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [summaryRes, transactionsRes, accountsRes] = await Promise.all([
        axiosInstance.get('/api/summary'),
        axiosInstance.get('/api/transactions'),
        axiosInstance.get('/api/accounts')
      ]);
      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const getInsight = async () => {
    setLoadingInsight(true);
    try {
      const response = await axiosInstance.post('/api/insights');
      setInsight(response.data.insight);
    } catch (error) {
      setInsight('Unable to generate insight right now.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const addAccount = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/accounts', newAccount);
      setShowAddAccount(false);
      setNewAccount({ name: '', type: 'checking', balance: '' });
      fetchAll();
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/transactions', newTransaction);
      setShowAddTransaction(false);
      setNewTransaction({
        account_id: '', description: '', amount: '',
        category: 'Food', date: '', type: 'debit'
      });
      fetchAll();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const categories = [
    'Food', 'Transport', 'Entertainment',
    'Shopping', 'Bills', 'Health', 'Income', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">💰 FinanceFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-indigo-500">
            <p className="text-gray-500 text-sm">Total Balance</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              ${parseFloat(summary?.total_balance || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Income (30 days)</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              +${parseFloat(summary?.total_income || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Expenses (30 days)</p>
            <p className="text-3xl font-bold text-red-500 mt-1">
              -${parseFloat(summary?.total_expenses || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">My Accounts</h2>
                <button
                  onClick={() => setShowAddAccount(!showAddAccount)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >+ Add</button>
              </div>

              {showAddAccount && (
                <form onSubmit={addAccount} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <input
                    type="text" placeholder="Account name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    required className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <select
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                  </select>
                  <input
                    type="number" placeholder="Starting balance"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm">
                    Create Account
                  </button>
                </form>
              )}

              {accounts.length === 0 ? (
                <p className="text-gray-400 text-sm">No accounts yet. Add one above.</p>
              ) : (
                accounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{account.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{account.type}</p>
                    </div>
                    <p className={`font-semibold ${account.balance >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                      ${parseFloat(account.balance).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-sm">
              <h2 className="font-semibold mb-2">🤖 AI Spending Insight</h2>
              {insight ? (
                <p className="text-indigo-100 text-sm leading-relaxed">{insight}</p>
              ) : (
                <p className="text-indigo-200 text-sm mb-4">
                  Get a personalized insight about your spending habits.
                </p>
              )}
              <button
                onClick={getInsight}
                disabled={loadingInsight}
                className="mt-3 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {loadingInsight ? 'Analyzing...' : 'Generate Insight'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">
                Spending by Category (Last 30 Days)
              </h2>
              {summary?.spending_by_category?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={summary.spending_by_category}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Add transactions to see your spending chart
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
                <button
                  onClick={() => setShowAddTransaction(!showAddTransaction)}
                  className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                >
                  + Add Transaction
                </button>
              </div>

              {showAddTransaction && (
                <form onSubmit={addTransaction} className="mb-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-3">
                  <select
                    value={newTransaction.account_id}
                    onChange={(e) => setNewTransaction({ ...newTransaction, account_id: e.target.value })}
                    required className="col-span-2 px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="Description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    required className="col-span-2 px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number" placeholder="Amount"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    required className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="debit">Expense</option>
                    <option value="credit">Income</option>
                  </select>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    required className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded-lg text-sm">
                    Add Transaction
                  </button>
                </form>
              )}

              {transactions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{t.description}</p>
                        <p className="text-xs text-gray-400">
                          {t.category} • {t.account_name} • {new Date(t.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'credit' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
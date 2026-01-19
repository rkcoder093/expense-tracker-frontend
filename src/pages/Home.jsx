import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, Filter, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const Home = () => {
  const { token, logout } = useAuth();
  
  // -- State --
  const [expenses, setExpenses] = useState([]);
  const [summaryData, setSummaryData] = useState([]); 
  const [apiTotal, setApiTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState(''); // Validation Error State
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Date Range State
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: today
  });

  const [filterCategory, setFilterCategory] = useState('All');
  
  const categories = ['Food', 'Bills', 'Fuel', 'Entertainment', 'Other'];

  // -- API Config --
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: { Authorization: `Bearer ${token}` }
  });

  // -- Fetch Data --
  const fetchData = useCallback(async () => {
    
    // --- VALIDATION CHECK ---
    if (startDate > endDate) {
      setDateError('Start date cannot be after End date.');
      return; // Stop here. Do not call API.
    }
    setDateError(''); // Clear error if valid
    // ------------------------

    setLoading(true);
    try {
      const params = {
        page: currentPage,
        sort: 'date_desc',
        start_date: startDate,
        end_date: endDate,
        ...(filterCategory !== 'All' && { category: filterCategory })
      };
      
      const expResponse = await api.get('expenses/', { params });
      
      setHasNextPage(!!expResponse.data.next);
      setHasPrevPage(!!expResponse.data.previous);

      if (expResponse.data.results) {
        setExpenses(expResponse.data.results.results || []);
        setApiTotal(parseFloat(expResponse.data.results.total || 0));
      }

      const summaryResponse = await api.get('expenses/summary/');
      if (summaryResponse.data.summary) {
        const formattedSummary = summaryResponse.data.summary.map(item => ({
          name: item.category,
          amount: parseFloat(item.total)
        }));
        setSummaryData(formattedSummary);
      }

    } catch (error) {
      console.error("Error fetching data", error);
      if(error.response && error.response.status === 404) {
          setCurrentPage(1);
      }
    } finally {
      setLoading(false);
    }
  }, [token, filterCategory, currentPage, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -- Handlers --
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    try {
      const idempotencyKey = generateUUID();
      await api.post('expenses/', 
        { ...formData, amount: parseFloat(formData.amount).toFixed(2) }, 
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      
      setFormData({ ...formData, description: '', amount: '' });
      fetchData(); 
    } catch (error) {
      console.error("Failed to create expense", error);
      alert("Error creating expense.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -- Visual Helpers --
  const getCategoryColor = (cat) => {
    const colors = {
      Food: 'bg-emerald-100 text-emerald-800',
      Bills: 'bg-yellow-100 text-yellow-800',
      Fuel: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[cat] || colors.Other;
  };

  const getBarColor = (cat) => {
    const colors = {
      Food: '#10b981', Bills: '#f59e0b', Fuel: '#3b82f6', Entertainment: '#a855f7', Other: '#6b7280',
    };
    return colors[cat] || '#6366f1';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              ExpenseTracker
            </span>
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600">
              <LogOut size={18} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* TOTAL CARD */}
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-indigo-100 font-medium mb-1">Total (Selected Range)</h2>
              <div className="text-4xl font-bold tracking-tight">Rs.{apiTotal.toFixed(2)}</div>
              <p className="text-indigo-200 text-xs mt-2 opacity-80">
                {startDate} to {endDate}
              </p>
            </div>

            {/* Add Expense Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-indigo-600"/> Add New
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                  <input type="text" name="description" required className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Lunch" value={formData.description} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount</label>
                    <input type="number" name="amount" required step="0.01" className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" value={formData.amount} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                    <select name="category" className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.category} onChange={handleInputChange}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                   <input type="date" name="date" required className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.date} onChange={handleInputChange} />
                </div>
                <button type="submit" className="w-full py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg transition">Add Transaction</button>
              </form>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bar Graph */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-80">
               <h3 className="text-sm font-semibold text-slate-500 uppercase mb-6">Spending by Category</h3>
               {summaryData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="90%">
                   <BarChart data={summaryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                     <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={50}>
                        {summaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                        ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data to display</div>
               )}
            </div>

            {/* Expense List with Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col ">
              
              {/* FILTER BAR */}
              <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-slate-50/50 rounded-t-2xl">
                
                <div className="flex flex-wrap gap-4 justify-between items-center">
                   {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:text-indigo-600">
                      <option value="All">All Categories</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  {/* DATE RANGE FILTER */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-slate-400" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`bg-white border ${dateError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded px-2 py-1 text-slate-600 focus:ring-2 outline-none`}
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`bg-white border ${dateError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded px-2 py-1 text-slate-600 focus:ring-2 outline-none`}
                    />
                  </div>
                </div>

                {/* Validation Error Message */}
                {dateError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 font-medium px-1">
                    <AlertCircle size={14} /> {dateError}
                  </div>
                )}
                
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Transaction</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                         <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                    ) : expenses.length === 0 ? (
                       <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">No transactions found in this range.</td></tr>
                    ) : (
                      expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{expense.description}</td>
                          <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(expense.category)}`}>{expense.category}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-500">{expense.date}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">Rs.{expense.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!hasPrevPage || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm font-medium text-slate-600">Page {currentPage}</span>
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
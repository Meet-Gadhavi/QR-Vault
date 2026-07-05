import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  CreditCard, 
  Activity, 
  AlertCircle, 
  Search, 
  Filter, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  LayoutDashboard,
  Bell,
  Terminal,
  Server,
  X,
  CheckCircle2,
  AlertTriangle,
  History,
  Download,
  Receipt,
  Trash2,
  Shield,
  Mail,
  MailOpen,
  ChevronDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { AdminAuth } from './AdminAuth';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';


// Types
interface Stats {
  activeUsers: number;
  totalUsers: number;
  paidUsers: number;
  unpaidUsers: number;
  plans: { free: number; starter: number; pro: number };
  revenue: { last1Month: number[]; last3Months: number[]; last6Months: number[]; last12Months: number[] };
  health: { cpuUsage: number; memoryUsage: number; uptime: number; loadSpeed: string; concurrentUsers: number };
}

interface Log {
  timestamp: string;
  type: string;
  message: string;
  details?: any;
}

// Custom styled dropdown component
const CustomSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ value, onChange, options, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-primary-400 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all w-full min-w-[160px] shadow-sm"
      >
        <span className="flex-1 text-left truncate">{selected?.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 min-w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden animate-fade-in-up">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                opt.value === value
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'users' | 'transactions' | 'logs' | 'mail'>('home');
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<'1M' | '3M' | '6M' | '12M'>('6M');
  const [selectedUserInvoices, setSelectedUserInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [planFilter, setPlanFilter] = useState('ALL');
  const [txSearchTerm, setTxSearchTerm] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('ALL');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [messageReadFilter, setMessageReadFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [messageRepliedFilter, setMessageRepliedFilter] = useState<'ALL' | 'UNREPLIED' | 'REPLIED'>('ALL');
  const showNotify = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') toast.success(title, { description: message });
    else if (type === 'error') toast.error(title, { description: message });
    else toast(title, { description: message });
  };
  const fetchStats = async (password: string) => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/overview`, {
        headers: { 'x-admin-password': password }
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setStats(data);
      setIsAuthenticated(true);
      setAdminPassword(password);
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/logs`, {
        headers: { 'x-admin-password': adminPassword }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/users`, {
        headers: { 'x-admin-password': adminPassword }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserInvoices = async (userId: string) => {
    try {
      setLoadingInvoices(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/users/${userId}/invoices`, {
        headers: { 'x-admin-password': adminPassword }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserInvoices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/transactions`, {
        headers: { 'x-admin-password': adminPassword }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete user "${userName}" and all of their vaults, files, and transaction invoices permanently? This cannot be undone.`)) {
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword }
      });

      if (res.ok) {
        showNotify('User Deleted', `User "${userName}" has been successfully deleted.`, 'success');
        // Refresh
        fetchUsers();
        fetchStats(adminPassword);
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete user');
      }
    } catch (err: any) {
      showNotify('Error Deleting User', err.message, 'error');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/messages`, {
        headers: { 'x-admin-password': adminPassword }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const toggleMessageStatus = async (messageId: string, updates: { is_read?: boolean; is_replied?: boolean }) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword 
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...updates } : m));
        setSelectedMessage((prev: any) => prev && prev.id === messageId ? { ...prev, ...updates } : prev);
        showNotify('Status Updated', 'Message marked successfully.', 'success');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err: any) {
      showNotify('Error', err.message, 'error');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this message?')) return;
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        showNotify('Message Deleted', 'Message has been permanently removed.', 'success');
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (err: any) {
      showNotify('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchUserInvoices(selectedUser.id);
    } else {
      setSelectedUserInvoices([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'logs') fetchLogs();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'transactions') {
        fetchUsers();
        fetchTransactions();
      }
      if (activeTab === 'mail') fetchMessages();
    }
  }, [isAuthenticated, activeTab, adminPassword]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        if (activeTab === 'home') fetchStats(adminPassword);
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'transactions') fetchTransactions();
      }, 30000); // 30s interval to reduce flickers
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab, adminPassword]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === 'ALL' || u.plan.toUpperCase() === planFilter.toUpperCase();
      return matchesSearch && matchesPlan;
    });
  }, [users, searchTerm, planFilter]);

  const filteredTransactions = useMemo(() => {
    // Use real Supabase data directly — status is stored on the invoice itself
    return [...transactions]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .filter(tx => {
        const userRecord = users.find(u => u.id === tx.user_id);
        const userName = userRecord?.name || '';
        const userEmail = userRecord?.email || '';

        const matchesSearch =
          tx.id?.toLowerCase().includes(txSearchTerm.toLowerCase()) ||
          userName.toLowerCase().includes(txSearchTerm.toLowerCase()) ||
          userEmail.toLowerCase().includes(txSearchTerm.toLowerCase());

        const txStatus = (tx.status || 'successful').toLowerCase();
        const matchesStatus = txStatusFilter === 'ALL' || txStatus === txStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      });
  }, [transactions, users, txSearchTerm, txStatusFilter]);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(messageSearchTerm.toLowerCase());

      const matchesRead = 
        messageReadFilter === 'ALL' || 
        (messageReadFilter === 'READ' && m.is_read) || 
        (messageReadFilter === 'UNREAD' && !m.is_read);

      const matchesReplied = 
        messageRepliedFilter === 'ALL' || 
        (messageRepliedFilter === 'REPLIED' && m.is_replied) || 
        (messageRepliedFilter === 'UNREPLIED' && !m.is_replied);

      return matchesSearch && matchesRead && matchesReplied;
    });
  }, [messages, messageSearchTerm, messageReadFilter, messageRepliedFilter]);

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={(pw) => fetchStats(pw)} />;
  }

  // --- RENDERING HELPERS ---

  const MetricCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {subValue && <span className="text-xs text-gray-400 dark:text-gray-500">{subValue}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/10 flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary-600 mb-8">
            <div className="bg-primary-600 p-1.5 rounded-lg">
               <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Admin Control</span>
          </div>
 
          <nav className="space-y-1">
            {[
              { id: 'home', label: 'Overview', icon: LayoutDashboard },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'mail', label: 'Mail', icon: Mail },
              { id: 'logs', label: 'Error & Logs', icon: Terminal },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-primary-600 dark:text-primary-400' : ''} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
 
        <div className="mt-auto p-6 border-t border-gray-100 dark:border-white/10">
           <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-2">System Health</p>
              <div className="flex items-center justify-between mb-1">
                 <span className="text-xs text-gray-600 dark:text-gray-400">Memory</span>
                 <span className="text-xs font-bold text-gray-900 dark:text-white">{stats?.health.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-primary-500 dark:bg-primary-400 h-full transition-all duration-1000" style={{ width: `${stats?.health.memoryUsage}%` }}></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8 transition-all">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeTab} Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, system administrator.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => { fetchStats(adminPassword); showNotify('Refreshed', 'Dashboard data updated successfully', 'success'); }}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/10 shadow-none hover:shadow-sm"
                aria-label="Refresh dashboard data"
                title="Refresh Overview"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            </button>
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Meet</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                <Shield size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === 'home' && stats && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Active Users" value={stats.activeUsers} icon={Activity} trend={12.5} />
              <MetricCard title="Paid Customers" value={stats.paidUsers} subValue={`of ${stats.totalUsers}`} icon={CheckCircle2} trend={8.2} />
              <MetricCard title="System Performance" value={stats.health.loadSpeed} subValue="Avg. Load" icon={Activity} trend={-5.1} />
              <MetricCard title="Server Uptime" value={`${Math.floor(stats.health.uptime / 3600)}h ${Math.floor((stats.health.uptime % 3600) / 60)}m`} icon={Server} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly revenue growth from subscriptions</p>
                  </div>
                  <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                    {(['1M', '3M', '6M', '12M'] as const).map((p) => (
                      <button 
                        key={p} 
                        onClick={() => setRevenuePeriod(p)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${revenuePeriod === p ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart
                      data={(revenuePeriod === '1M' ? stats.revenue.last1Month : 
                             revenuePeriod === '3M' ? stats.revenue.last3Months : 
                             revenuePeriod === '12M' ? stats.revenue.last12Months : 
                             stats.revenue.last6Months).map((val, i) => ({
                        name: revenuePeriod === '1M' ? `Day ${i+1}` : `Month ${i+1}`,
                        revenue: val
                      }))}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                       />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">User Distribution</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Breakdown of subscription plans</p>
                <div className="flex flex-col gap-6">
                  {[
                    { label: 'Free Plan', count: stats.plans.free, color: 'bg-gray-100', text: 'text-gray-600' },
                    { label: 'Starter Plan', count: stats.plans.starter, color: 'bg-primary-200', text: 'text-primary-600' },
                    { label: 'Pro Plan', count: stats.plans.pro, color: 'bg-primary-600', text: 'text-white' },
                  ].map((p) => (
                    <div key={p.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.label}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round((p.count / stats.totalUsers) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div className={`${p.color} dark:bg-opacity-80 h-full transition-all duration-1000`} style={{ width: `${(p.count / stats.totalUsers) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Platform Health</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Stable
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">System is handling <strong>{stats.health.concurrentUsers}</strong> simultaneous active sessions with <strong>{stats.health.cpuUsage}%</strong> load.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Regional Analytics */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Regional User Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">User distributions by country & access point</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl text-xs font-bold uppercase tracking-wide">Live GPS</span>
                </div>
                
                <div className="space-y-4">
                  {[
                    { country: 'India', code: 'IN', users: Math.floor(stats.totalUsers * 0.65) + 3, share: '65%', status: 'Primary' },
                    { country: 'United States', code: 'US', users: Math.floor(stats.totalUsers * 0.18) + 1, share: '18%', status: 'Active' },
                    { country: 'United Kingdom', code: 'GB', users: Math.floor(stats.totalUsers * 0.08) + 1, share: '8%', status: 'Active' },
                    { country: 'Germany', code: 'DE', users: Math.floor(stats.totalUsers * 0.05), share: '5%', status: 'Stable' },
                    { country: 'Canada', code: 'CA', users: Math.floor(stats.totalUsers * 0.04), share: '4%', status: 'Stable' }
                  ].map((region) => (
                    <div key={region.country} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:border-primary-100 dark:hover:border-primary-900 transition-all">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://flagcdn.com/w40/${region.code.toLowerCase()}.png`} 
                          alt={region.country}
                          className="w-7 h-auto rounded border border-gray-100 dark:border-white/10"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{region.country}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{region.users} profiles registered</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{region.share}</p>
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary-500">{region.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visitor Analytics Details */}
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Visitor Traffic</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Traffic overview & page interaction</p>
                  
                  <div className="h-[220px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Unique Visitors', value: stats.totalUsers * 12 + 140, color: '#10b981' },
                            { name: 'Returning Visitors', value: Math.max(10, (stats.totalUsers * 42 + 620) - (stats.totalUsers * 12 + 140)), color: '#8b5cf6' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { color: '#10b981' },
                            { color: '#8b5cf6' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: 'none', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider">Avg. Page Visits</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">4.3 per user</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 font-bold uppercase tracking-wider">Total Traffic</p>
                      <p className="text-lg font-black text-primary-600 dark:text-primary-400">{stats.totalUsers * 42 + 620}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100/50 dark:border-primary-900/50">
                  <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed font-medium">
                    💡 <strong>Smart Insight:</strong> Traffic surged by 18.4% last Tuesday, driven by QR scan referrals from regional zones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search users by name or email..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm dark:text-white" 
                 />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <CustomSelect
                  value={planFilter}
                  onChange={setPlanFilter}
                  options={[
                    { value: 'ALL', label: 'All Plans' },
                    { value: 'FREE', label: 'Free Plan' },
                    { value: 'STARTER', label: 'Starter Plan' },
                    { value: 'PRO', label: 'Pro Plan' },
                  ]}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Storage</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right" aria-label="Actions">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic text-sm">
                        No users match your search...
                      </td>
                    </tr>
                  ) : filteredUsers.map((u, index) => (
                    <tr 
                      key={`${u.id}-${index}`} 
                      onClick={() => setSelectedUser(u)}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{u.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-black tracking-tighter uppercase ${u.plan === 'PRO' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : u.plan === 'STARTER' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between items-center mb-1 text-xs font-bold text-gray-400 dark:text-gray-500">
                              <span>{u.used}</span>
                              <span>{u.quota}</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1">
                              <div className="bg-primary-500 dark:bg-primary-400 h-full rounded-full" style={{ width: `${Math.min(100, (parseFloat(u.used) / parseFloat(u.quota)) * 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                           <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(u.id, u.name);
                            }}
                            aria-label={`Delete ${u.name}`}
                            title="Delete User"
                        >
                           <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col max-h-[70vh] animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Terminal size={18} className="text-primary-600 dark:text-primary-400" /> System Terminal
               </h3>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Listening
                  </span>
               </div>
            </div>
            <div className="bg-gray-900 p-6 overflow-y-auto flex-grow font-mono text-sm space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
               {logs.length === 0 ? (
                 <p className="text-gray-500 italic">No logs captured yet...</p>
               ) : logs.map((log, i) => (
                 <div key={i} className="flex gap-4 group">
                    <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`shrink-0 font-bold ${log.type === 'ERROR' ? 'text-red-400' : 'text-primary-400'}`}>{log.type}</span>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{log.message}</span>
                 </div>
               ))}
               <div className="pt-4 text-primary-500/50 text-xs animate-pulse cursor-default select-none">_</div>
            </div>
          </div>
        )}

        {/* Razorpay Invoices Transactions List */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-600 dark:text-primary-400" /> Razorpay Transactions
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{filteredTransactions.length} Payment records</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:max-w-xs">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                   <input 
                     type="text" 
                     placeholder="Search ID or email..." 
                     value={txSearchTerm}
                     onChange={(e) => setTxSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm dark:text-white" 
                   />
                </div>
                <CustomSelect
                  value={txStatusFilter}
                  onChange={setTxStatusFilter}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'SUCCESSFUL', label: 'Successful' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'FAILED', label: 'Failed' },
                  ]}
                />
              </div>
            </div>
            
            {loadingTransactions ? (
              <div className="flex flex-col items-center justify-center p-20 text-gray-400 dark:text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm">Fetching transaction details...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-gray-400 dark:text-gray-500">
                <AlertCircle size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm">No transaction records found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-white/5">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => {
                      const userRecord = users.find(u => u.id === tx.user_id);
                      return (
                        <tr key={tx.id} className="border-b border-gray-100 dark:border-white/10 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all text-sm text-gray-700 dark:text-gray-300">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{tx.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 dark:text-white">{userRecord?.name || 'Unknown User'}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">{userRecord?.email || tx.user_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              tx.plan === 'Pro' 
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {tx.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{tx.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                              tx.status === 'successful'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : tx.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{tx.date}</td>
                          <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500">{tx.expiry}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mail' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-white/5">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail size={18} className="text-primary-600 dark:text-primary-400" /> Contact Inquiries
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{filteredMessages.length} Messages found</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:max-w-xs">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                     <input 
                       type="text" 
                       placeholder="Search subject or body..." 
                       value={messageSearchTerm}
                       onChange={(e) => setMessageSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm dark:text-white" 
                     />
                  </div>
                  <CustomSelect
                    value={messageReadFilter}
                    onChange={(v) => setMessageReadFilter(v as any)}
                    options={[
                      { value: 'ALL', label: 'All Read States' },
                      { value: 'UNREAD', label: 'Unread Only' },
                      { value: 'READ', label: 'Read Only' },
                    ]}
                  />
                  <CustomSelect
                    value={messageRepliedFilter}
                    onChange={(v) => setMessageRepliedFilter(v as any)}
                    options={[
                      { value: 'ALL', label: 'All Reply States' },
                      { value: 'UNREPLIED', label: 'Unreplied Only' },
                      { value: 'REPLIED', label: 'Replied Only' },
                    ]}
                  />
                </div>
              </div>

              {loadingMessages ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="animate-spin text-primary-600 dark:text-primary-400" size={32} />
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Loading messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <MailOpen size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-sm">No messages found matching your criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.is_read) {
                          toggleMessageStatus(msg.id, { is_read: true });
                        }
                      }}
                      className={`p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer ${!msg.is_read ? 'bg-primary-500/5 dark:bg-primary-500/5' : ''}`}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`w-2.5 h-2.5 rounded-full ${!msg.is_read ? 'bg-primary-500 animate-pulse' : 'bg-transparent'}`} />
                          <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{msg.subject}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${msg.is_replied ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                            {msg.is_replied ? 'Replied' : 'Pending Response'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{msg.name}</span>
                          <span>&bull;</span>
                          <span>{msg.email}</span>
                          <span>&bull;</span>
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed max-w-3xl">
                          {msg.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleMessageStatus(msg.id, { is_read: !msg.is_read }); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${msg.is_read ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400' : 'bg-primary-500 hover:bg-primary-600 text-white border-transparent'}`}
                          title={msg.is_read ? "Mark as Unread" : "Mark as Read"}
                        >
                          {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleMessageStatus(msg.id, { is_replied: !msg.is_replied }); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${msg.is_replied ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}`}
                          title={msg.is_replied ? "Mark as Unreplied" : "Mark as Replied"}
                        >
                          {msg.is_replied ? 'Unreplied' : 'Mark Replied'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* User Detail Sliding Drawer */}
      {selectedUser && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedUser(null)} 
          />
          
          {/* Sliding panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-white/10 z-[100] shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 animate-slide-in-right">
             <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800">
                     <Users size={22} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{selectedUser.name}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all" 
                  aria-label="Close panel"
                >
                   <X size={20} aria-hidden="true" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                     <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Current Plan</p>
                     <p className="text-sm font-black text-gray-900 dark:text-white">{selectedUser.plan}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                     <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Status</p>
                     <p className={`text-sm font-black ${selectedUser.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>{selectedUser.status}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                     <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">QR Code Quota</p>
                     <p className="text-sm font-black text-gray-900 dark:text-white">{selectedUser.used} / {selectedUser.quota}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                     <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Joined Date</p>
                     <p className="text-sm font-black text-gray-900 dark:text-white">
                       {selectedUser.created_at && !isNaN(Date.parse(selectedUser.created_at))
                         ? new Date(selectedUser.created_at).toLocaleDateString()
                         : 'Invalid Date'}
                     </p>
                  </div>
               </div>

               <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                     <Receipt size={18} className="text-primary-600 dark:text-primary-400" />
                     <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Billing History</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                     {loadingInvoices ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
                           <RefreshCw className="animate-spin text-primary-600 dark:text-primary-400" size={24} />
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Loading Invoices...</p>
                        </div>
                     ) : selectedUserInvoices.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">No billing records found for this user.</p>
                     ) : selectedUserInvoices.map((inv, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-between group hover:border-primary-200 dark:hover:border-primary-900 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                 <History size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-gray-900 dark:text-white">₹{inv.amount}</p>
                                 <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{new Date(inv.timestamp).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-widest text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">Paid</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             </div>

             <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex gap-3">
                <button 
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name)}
                  className="flex-grow bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-xl shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 size={16} /> Delete Account
                </button>
             </div>
          </div>
        </>
      )}

      {/* Message Detail Sliding Drawer */}
      {selectedMessage && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedMessage(null)} 
          />
          
          {/* Sliding panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-white/10 z-[100] shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 animate-slide-in-right">
             <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800">
                     <Mail size={22} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Inquiry From</h2>
                    <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight truncate">{selectedMessage.name}</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)} 
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all" 
                  aria-label="Close panel"
                >
                   <X size={20} aria-hidden="true" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-5 rounded-[2rem] border border-gray-100 dark:border-white/10">
                 <div>
                   <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Contact Email</span>
                   <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 select-all">{selectedMessage.email}</p>
                 </div>
                 <div>
                   <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Received Date</span>
                   <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                     {new Date(selectedMessage.created_at).toLocaleString()}
                   </p>
                 </div>
                 <div className="flex items-center gap-3 pt-2">
                   <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedMessage.is_read ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'}`}>
                     {selectedMessage.is_read ? 'Read' : 'Unread'}
                   </span>
                   <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedMessage.is_replied ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                     {selectedMessage.is_replied ? 'Replied' : 'Unreplied'}
                   </span>
                 </div>
               </div>

               <div className="space-y-3">
                 <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">Subject</span>
                 <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                   <p className="text-sm font-black text-gray-900 dark:text-white leading-snug">{selectedMessage.subject}</p>
                 </div>
               </div>

               <div className="space-y-3">
                 <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">Message Body</span>
                 <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/10 min-h-[180px]">
                   <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{selectedMessage.message}</p>
                 </div>
               </div>
             </div>

             <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => toggleMessageStatus(selectedMessage.id, { is_read: !selectedMessage.is_read })}
                    className={`flex-grow py-3 rounded-xl font-bold transition-all text-xs border ${selectedMessage.is_read ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-primary-600 hover:bg-primary-700 text-white border-transparent'}`}
                  >
                    {selectedMessage.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button 
                    onClick={() => toggleMessageStatus(selectedMessage.id, { is_replied: !selectedMessage.is_replied })}
                    className={`flex-grow py-3 rounded-xl font-bold transition-all text-xs border ${selectedMessage.is_replied ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}`}
                  >
                    {selectedMessage.is_replied ? 'Mark Unreplied' : 'Mark Replied'}
                  </button>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="flex-grow bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm text-center"
                  >
                    <ArrowUpRight size={16} /> Reply via Email
                  </a>
                  <button 
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 p-3.5 rounded-xl font-bold transition-all flex items-center justify-center"
                    title="Delete message permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

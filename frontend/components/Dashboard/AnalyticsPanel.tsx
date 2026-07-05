import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Zap, Box, Eye, QrCode, AlertTriangle, AlertCircle, Calendar, Filter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Vault } from '../../types';

interface AnalyticsPanelProps {
  vaults: Vault[];
  openCreateModal: () => void;
  setSelectedAnalyticsVault: (vault: Vault) => void;
  formatBytes: (bytes: number) => string;
}

// Simulated demo vaults for the "See analytics with demo data" preview
const demoVaults: Vault[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    name: 'Q3 Product Line Catalog',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    views: 342,
    active: true,
    accessLevel: 'PUBLIC' as any,
    files: [{ id: 'f1', name: 'catalog.pdf', size: 1542000, type: 'FILE' as any, url: '', mimeType: 'application/pdf', downloadCount: 142, maxDownloads: 1000, deleteAfterMinutes: 0, expiresAt: '' }],
    requests: [],
    userPlan: 'PRO' as any,
    reportCount: 0,
    analytics: {
      uniqueViewers: 210,
      totalScans: 342,
      totalDownloads: 142,
      timestampComparison: [
        { time: '00:00', engagement: 12 },
        { time: '04:00', engagement: 5 },
        { time: '08:00', engagement: 68 },
        { time: '12:00', engagement: 110 },
        { time: '16:00', engagement: 95 },
        { time: '20:00', engagement: 52 },
      ],
      fileEngagement: [
        { fileName: 'catalog.pdf', engagement: 342, downloads: 142 }
      ]
    }
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    name: 'Secret Key Recovery',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    views: 184,
    active: true,
    accessLevel: 'PASSWORD' as any,
    files: [{ id: 'f2', name: 'recovery_pass.txt', size: 245, type: 'FILE' as any, url: '', mimeType: 'text/plain', downloadCount: 88, maxDownloads: 1000, deleteAfterMinutes: 0, expiresAt: '' }],
    requests: [],
    userPlan: 'PRO' as any,
    reportCount: 1,
    analytics: {
      uniqueViewers: 128,
      totalScans: 184,
      totalDownloads: 88,
      timestampComparison: [
        { time: '00:00', engagement: 3 },
        { time: '04:00', engagement: 1 },
        { time: '08:00', engagement: 34 },
        { time: '12:00', engagement: 54 },
        { time: '16:00', engagement: 62 },
        { time: '20:00', engagement: 30 },
      ],
      fileEngagement: [
        { fileName: 'recovery_pass.txt', engagement: 184, downloads: 88 }
      ]
    }
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    name: 'V2 Update Logs',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    views: 92,
    active: true,
    accessLevel: 'PUBLIC' as any,
    files: [{ id: 'f3', name: 'changelog.md', size: 1045, type: 'FILE' as any, url: '', mimeType: 'text/markdown', downloadCount: 42, maxDownloads: 1000, deleteAfterMinutes: 0, expiresAt: '' }],
    requests: [],
    userPlan: 'PRO' as any,
    reportCount: 0,
    analytics: {
      uniqueViewers: 65,
      totalScans: 92,
      totalDownloads: 42,
      timestampComparison: [
        { time: '00:00', engagement: 1 },
        { time: '04:00', engagement: 0 },
        { time: '08:00', engagement: 15 },
        { time: '12:00', engagement: 30 },
        { time: '16:00', engagement: 28 },
        { time: '20:00', engagement: 18 },
      ],
      fileEngagement: [
        { fileName: 'changelog.md', engagement: 92, downloads: 42 }
      ]
    }
  }
];

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  vaults,
  openCreateModal,
  setSelectedAnalyticsVault,
  formatBytes
}) => {
  const [showDemoData, setShowDemoData] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const activeVaults = showDemoData ? demoVaults : vaults;

  // Generate logs for aggregate details charts (Over Time, OS, Country, City)
  const allLogs = useMemo(() => {
    const logs: any[] = [];
    activeVaults.forEach(v => {
      const count = v.views;
      const osList = ['Windows', 'iOS', 'Android', 'macOS', 'Linux'];
      const osWeights = [0.5, 0.3, 0.15, 0.04, 0.01];
      const countryList = ['India', 'United States', 'United Kingdom', 'Germany', 'Canada'];
      const countryWeights = [0.6, 0.2, 0.1, 0.07, 0.03];
      const cityList = {
        'India': ['Karjan', 'Mumbai', 'Delhi', 'Bangalore'],
        'United States': ['New York', 'San Francisco', 'Chicago', 'Los Angeles'],
        'United Kingdom': ['London', 'Manchester', 'Birmingham'],
        'Germany': ['Berlin', 'Munich', 'Frankfurt'],
        'Canada': ['Toronto', 'Vancouver', 'Montreal']
      } as Record<string, string[]>;

      const getWeightedItem = <T,>(items: T[], weights: number[]): T => {
        const r = Math.random();
        let sum = 0;
        for (let i = 0; i < items.length; i++) {
          sum += weights[i];
          if (r <= sum) return items[i];
        }
        return items[items.length - 1];
      };

      const startTime = Date.now() - 30 * 24 * 3600 * 1000;
      const endTime = Date.now();
      const timeDiff = endTime - startTime;

      for (let i = 0; i < count; i++) {
        const randomTime = new Date(startTime + Math.random() * timeDiff);
        const os = getWeightedItem(osList, osWeights);
        const country = getWeightedItem(countryList, countryWeights);
        const cities = cityList[country] || ['Other'];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const isUnique = Math.random() < 0.7;
        const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        
        logs.push({
          timestamp: randomTime,
          os,
          country,
          city,
          unique: isUnique,
          ip
        });
      }
    });
    return logs;
  }, [activeVaults]);

  const osStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allLogs.forEach(log => {
      counts[log.os] = (counts[log.os] || 0) + 1;
    });
    const total = allLogs.length || 1;
    return Object.entries(counts)
      .map(([name, scans]) => ({ name, scans, pct: Math.round((scans / total) * 100) }))
      .sort((a, b) => b.scans - a.scans);
  }, [allLogs]);

  const countryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allLogs.forEach(log => {
      counts[log.country] = (counts[log.country] || 0) + 1;
    });
    const total = allLogs.length || 1;
    return Object.entries(counts)
      .map(([name, scans]) => ({ name, scans, pct: Math.round((scans / total) * 100) }))
      .sort((a, b) => b.scans - a.scans);
  }, [allLogs]);

  const cityStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allLogs.forEach(log => {
      counts[log.city] = (counts[log.city] || 0) + 1;
    });
    const total = allLogs.length || 1;
    return Object.entries(counts)
      .map(([name, scans]) => ({ name, scans, pct: Math.round((scans / total) * 100) }))
      .sort((a, b) => b.scans - a.scans);
  }, [allLogs]);

  const chartData = useMemo(() => {
    const groups: Record<string, { Unique: number; 'Non-Unique': number }> = {};
    const formatHour = (d: Date) => {
      const hours = d.getHours();
      const bin = Math.floor(hours / 4) * 4;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${pad(bin)}:00`;
    };
    
    allLogs.forEach(log => {
      const label = formatHour(log.timestamp);
      if (!groups[label]) {
        groups[label] = { Unique: 0, 'Non-Unique': 0 };
      }
      if (log.unique) {
        groups[label].Unique++;
      } else {
        groups[label]['Non-Unique']++;
      }
    });
    
    return Object.entries(groups)
      .map(([name, data]) => ({ name, ...data }))
      .slice(-6);
  }, [allLogs]);

  if (activeVaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#0a0a0b] border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-xl animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6" aria-hidden="true">
          <TrendingUp className="w-10 h-10 text-gray-300 dark:text-gray-700" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">No Data to showcase !</h2>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mt-2 text-center px-4">Create your first vault to unlock global intelligence</p>
        
        <div className="flex flex-col items-center gap-4 mt-8">
          <button 
            onClick={openCreateModal}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-95"
            aria-label="Create your first vault"
          >
            Launch First Vault
          </button>
          
          <button
            onClick={() => setShowDemoData(true)}
            className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors py-2 px-4"
          >
            See analytics with demo data
          </button>
        </div>
      </div>
    );
  }

  const globalStats = [
    { label: 'Network Reach', val: activeVaults.reduce((a, b) => a + b.views, 0), icon: Eye, unit: 'Views', color: 'primary' },
    { label: 'Scan Volume', val: activeVaults.reduce((a, b) => a + (b.analytics?.totalScans || 0), 0), icon: QrCode, unit: 'Scans', color: 'emerald' },
    { label: 'Data Protected', val: formatBytes(activeVaults.reduce((a, b) => a + b.files.reduce((fa, fb) => fa + fb.size, 0), 0)), icon: Box, unit: 'Storage', color: 'blue' },
    { label: 'Active Reports', val: activeVaults.reduce((a, b) => a + (b.reportCount || 0), 0), icon: AlertTriangle, unit: 'Flags', color: 'red' }
  ];

  const topVaults = [...activeVaults].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Demo Mode Announcement Banner */}
      {showDemoData && (
        <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="bg-primary-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">Demo Mode</span>
            <p className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wide">Showing simulated analytics. Create actual vaults to see live scan data.</p>
          </div>
          <button
            onClick={() => setShowDemoData(false)}
            className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 hover:underline whitespace-nowrap py-1 px-3 border border-primary-200 dark:border-primary-800 rounded-full bg-white dark:bg-black/20 shadow-sm"
          >
            Clear Demo Data
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Overview Stat */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d0f14] p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/[0.02]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Vault Ecosystem Performance</h2>
              <p className="text-xs font-black text-primary-500 uppercase tracking-[0.3em] mt-1">Global Engagement Matrix</p>
            </div>
            <div className="hidden md:flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-2 rounded-2xl border border-gray-100 dark:border-white/5">
              {activeVaults.slice(0, 3).map((v, i) => (
                <div key={v.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary-500' : i === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[9px] font-bold text-gray-500 uppercase truncate max-w-[60px]">{v.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[400px] min-h-[400px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={(() => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return days.map(day => {
                  const entry: any = { day };
                  activeVaults.forEach((v, idx) => {
                    if (idx < 5) entry[v.name] = Math.floor(Math.random() * (v.views + 1) * 0.8) + (v.views / 7);
                  });
                  return entry;
                });
              })()}>
                <defs>
                  {activeVaults.slice(0, 5).map((v, i) => (
                    <linearGradient key={v.id} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : i === 3 ? '#3b82f6' : '#ec4899'} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : i === 3 ? '#3b82f6' : '#ec4899'} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  labelStyle={{ color: '#888', marginBottom: '8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, padding: '2px 0' }}
                />
                {activeVaults.slice(0, 5).map((v, i) => (
                  <Area
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    stroke={i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : i === 3 ? '#3b82f6' : '#ec4899'}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill={`url(#color${i})`}
                    animationDuration={1500 + (i * 300)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-[#0d0f14] p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20" aria-hidden="true">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Hall of Fame</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Highest Scan Assets</p>
            </div>
          </div>

          <div className="space-y-6">
            {topVaults.map((v, idx) => (
              <div 
                key={v.id} 
                className="flex items-center justify-between group/v cursor-pointer"
                onClick={() => setSelectedAnalyticsVault(v)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-gray-200 dark:text-white/10 italic w-6">#{idx + 1}</span>
                  <div>
                    <div className="text-sm font-black text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{v.name}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{v.files.length} Security Objects</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-primary-600 tabular-nums">{v.views}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">TOTAL SCANS</div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="w-full mt-10 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
            aria-label="Expand Full Report"
          >
            Expand Full Report
          </button>
        </div>
      </div>

      {/* Aggregate Scan Analytics Details Section (matches screenshot details) */}
      <div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight italic mb-6">Scan Audience & Traffic Diagnostics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* OVER TIME Graph panel */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0d0f14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Over Time</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Non-Unique</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unique</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[260px] relative">
              {allLogs.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-3" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">0 Scans Recorded</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#888' }} />
                    <Tooltip
                      cursor={{ fill: '#88888811' }}
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="Unique" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Non-Unique" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* OPERATING SYSTEM breakdown panel */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0d0f14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex flex-col min-h-[350px]">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Operating System</h4>
            
            <div className="flex-1 space-y-4">
              {/* List Headers */}
              <div className="grid grid-cols-12 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest pb-2 border-b border-gray-50 dark:border-white/5">
                <span className="col-span-4">OS</span>
                <span className="col-span-4 text-center">Scans</span>
                <span className="col-span-4 text-end">%</span>
              </div>

              {allLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center py-12">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">No OS data</span>
                </div>
              ) : (
                osStats.slice(0, 5).map((item, idx) => (
                  <div key={item.name} className="grid grid-cols-12 items-center text-xs font-black text-slate-700 dark:text-slate-300">
                    <span className="col-span-4 font-bold">{item.name}</span>
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 dark:bg-rose-500/80 rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="tabular-nums">{item.scans}</span>
                    </div>
                    <span className="col-span-2 text-end font-black text-slate-900 dark:text-white">{item.pct}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TOP COUNTRIES panel */}
          <div className="bg-white dark:bg-[#0d0f14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex flex-col min-h-[250px]">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Top Countries</h4>
            
            <div className="space-y-4">
              {/* List Headers */}
              <div className="grid grid-cols-12 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest pb-2 border-b border-gray-50 dark:border-white/5">
                <span className="col-span-1">#</span>
                <span className="col-span-5">Country</span>
                <span className="col-span-3 text-center">Scans</span>
                <span className="col-span-3 text-end">%</span>
              </div>

              {allLogs.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">No Country data</span>
                </div>
              ) : (
                countryStats.slice(0, 5).map((item, idx) => (
                  <div key={item.name} className="grid grid-cols-12 items-center text-xs font-black text-slate-700 dark:text-slate-300">
                    <span className="col-span-1 text-slate-400 dark:text-slate-600">#{idx + 1}</span>
                    <span className="col-span-5 font-bold">{item.name}</span>
                    <span className="col-span-3 text-center tabular-nums">{item.scans}</span>
                    <span className="col-span-3 text-end font-black text-slate-900 dark:text-white">{item.pct}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TOP CITIES panel */}
          <div className="bg-white dark:bg-[#0d0f14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex flex-col min-h-[250px]">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Top Cities</h4>
            
            <div className="space-y-4">
              {/* List Headers */}
              <div className="grid grid-cols-12 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest pb-2 border-b border-gray-50 dark:border-white/5">
                <span className="col-span-1">#</span>
                <span className="col-span-5">City</span>
                <span className="col-span-3 text-center">Scans</span>
                <span className="col-span-3 text-end">%</span>
              </div>

              {allLogs.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">No City data</span>
                </div>
              ) : (
                cityStats.slice(0, 5).map((item, idx) => (
                  <div key={item.name} className="grid grid-cols-12 items-center text-xs font-black text-slate-700 dark:text-slate-300">
                    <span className="col-span-1 text-slate-400 dark:text-slate-600">#{idx + 1}</span>
                    <span className="col-span-5 font-bold">{item.name}</span>
                    <span className="col-span-3 text-center tabular-nums">{item.scans}</span>
                    <span className="col-span-3 text-end font-black text-slate-900 dark:text-white">{item.pct}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0d0f14] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all group shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              stat.color === 'primary' ? 'bg-primary-500' : 
              stat.color === 'emerald' ? 'bg-emerald-500' : 
              stat.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
            } text-white shadow-xl ${
              stat.color === 'primary' ? 'shadow-primary-500/20' : 
              stat.color === 'emerald' ? 'shadow-emerald-500/20' : 
              stat.color === 'blue' ? 'shadow-blue-500/20' : 'shadow-red-500/20'
            }`}>
              <stat.icon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-gray-900 dark:text-white italic">{stat.val}</div>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0d0f14] w-full max-w-2xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Ecosystem Leaderboard</h3>
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">Full Engagement Ranking Report</p>
              </div>
              <button 
                onClick={() => {
                  setIsReportModalOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/5 rounded-xl px-3 py-1.5 bg-gray-50 dark:bg-white/5"
              >
                Close
              </button>
            </div>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search vaults by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-gray-400 outline-none focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {[...activeVaults]
                .sort((a, b) => b.views - a.views)
                .filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((v, idx) => (
                  <div 
                    key={v.id} 
                    className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedAnalyticsVault(v);
                      setIsReportModalOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-gray-400 dark:text-white/20 italic w-6">#{idx + 1}</span>
                      <div>
                        <div className="text-sm font-black text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{v.name}</div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{v.files.length} Security Objects</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-primary-600 tabular-nums">{v.views}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">TOTAL SCANS</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

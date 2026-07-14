import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, List, Activity, BarChart3, Loader2, RefreshCw } from 'lucide-react';

import Overview from './pages/Overview';
import LiveQueue from './pages/LiveQueue';
import TicketDetail from './pages/TicketDetail';
import Analytics from './pages/Analytics';
import Background3D from './components/Background3D';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/queue', label: 'Live Queue', icon: List },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="w-64 bg-white/5 backdrop-blur-xl text-slate-300 flex flex-col h-full border-r border-white/10 z-10 relative">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="bg-brand-500 p-2 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.4)]">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">EscalateAI</h1>
          <p className="text-xs text-white/60">Support Ops</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                isActive 
                  ? 'bg-brand-500/20 text-brand-300 font-medium border border-brand-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                  : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          Simulation Running
        </div>
      </div>
    </div>
  );
}

function Layout({ tickets, teamStats, handleReset }) {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      <Background3D />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10 relative">
        {/* Top Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-white/90">
            EscalateAI Dashboard
          </h2>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 bg-white/10 hover:bg-white/20 border border-white/10 rounded-md transition-all shadow-lg backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reset Sim
          </button>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 relative">
          <Outlet context={{ tickets, teamStats }} />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/queue`),
        axios.get(`${API_BASE}/team-stats`)
      ]);
      
      setTickets(queueRes.data.tickets);
      setTeamStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    await axios.post(`${API_BASE}/reset`);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030207] flex flex-col items-center justify-center text-white/60">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500 shadow-[0_0_15px_rgba(20,184,166,0.3)] rounded-full" />
        <p>Connecting to EscalateAI Backend...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout tickets={tickets} teamStats={teamStats} handleReset={handleReset} />}>
          <Route index element={<Overview />} />
          <Route path="queue" element={<LiveQueue />} />
          <Route path="ticket/:id" element={<TicketDetail />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

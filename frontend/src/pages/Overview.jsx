import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, AlertOctagon, TrendingUp, Bell, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview() {
  const { tickets, teamStats } = useOutletContext();
  const [chartType, setChartType] = useState('bar');

  if (!teamStats) return null;

  const isOverloaded = teamStats.average_risk > 60;
  
  const riskDistribution = [
    { name: 'Low (0-30%)', count: tickets.filter(t => t.risk_score <= 30).length },
    { name: 'Med (30-60%)', count: tickets.filter(t => t.risk_score > 30 && t.risk_score <= 60).length },
    { name: 'High (60-90%)', count: tickets.filter(t => t.risk_score > 60 && t.risk_score <= 90).length },
    { name: 'Critical (>90%)', count: tickets.filter(t => t.risk_score > 90).length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-full text-blue-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Active Queue</div>
            <div className="text-3xl font-bold text-white">{teamStats.active_tickets}</div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl border shadow-xl backdrop-blur-md flex items-center gap-4 transition-colors ${isOverloaded ? 'bg-red-900/30 border-red-500/30' : 'bg-black/30 border-white/10'}`}>
          <div className={`${isOverloaded ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'} p-4 rounded-full`}>
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Avg Risk Level</div>
            <div className={`text-3xl font-bold ${isOverloaded ? 'text-red-400' : 'text-white'}`}>{teamStats.average_risk}%</div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="bg-purple-500/20 p-4 rounded-full text-purple-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Agents Online</div>
            <div className="text-3xl font-bold text-white">12</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-xl p-6">
          <h3 className="text-base font-semibold text-white/90 mb-4">Current Risk Distribution (All Views)</h3>
          <div className="grid grid-cols-2 gap-6 h-[28rem]">
            <div className="h-full w-full">
              <div className="text-xs font-semibold text-white/60 mb-2 text-center">Bar Chart</div>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} width={30} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,6,20,0.8)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-full w-full">
              <div className="text-xs font-semibold text-white/60 mb-2 text-center">Line Chart</div>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,6,20,0.8)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} />
                  <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-full w-full">
              <div className="text-xs font-semibold text-white/60 mb-2 text-center">Area Chart</div>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10}} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,6,20,0.8)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} />
                  <Area type="monotone" dataKey="count" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-full w-full">
              <div className="text-xs font-semibold text-white/60 mb-2 text-center">Pie Chart</div>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,6,20,0.8)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} />
                  <Pie data={riskDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false} label={false}>
                    {riskDistribution.map((entry, index) => {
                      const colors = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-xl p-6 flex flex-col">
          <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-white/40" />
            Recent Alerts
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {teamStats.alerts && teamStats.alerts.length > 0 ? (
              [...teamStats.alerts].reverse().map((alert, i) => (
                <div key={i} className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-red-300 font-semibold mb-1 flex justify-between">
                    <span>SYSTEM ALERT</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm text-red-100">{alert.message}</div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/50 text-sm text-center py-8">
                <CheckCircle className="w-8 h-8 mb-2 text-emerald-400 opacity-50" />
                No active alerts. Queue is healthy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

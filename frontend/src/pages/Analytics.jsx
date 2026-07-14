import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { History, Target, TrendingDown } from 'lucide-react';

export default function Analytics() {
  const [historicalData, setHistoricalData] = useState([]);
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/analytics')
      .then(res => {
        setHistoricalData(res.data.historicalData);
        setAvgResolutionTime(res.data.avg_resolution_time_mins || 0);
      })
      .catch(err => console.error(err));
  }, []);

  const totalSlaMet = historicalData.reduce((sum, item) => sum + item.met_sla, 0);
  const totalBreaches = historicalData.reduce((sum, item) => sum + item.breaches, 0);
  const totalTickets = totalSlaMet + totalBreaches;
  const slaAchievement = totalTickets > 0 ? ((totalSlaMet / totalTickets) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="bg-emerald-500/20 p-4 rounded-full text-emerald-400">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">SLA Achievement</div>
            <div className="text-3xl font-bold text-white">{slaAchievement}%</div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-full text-blue-400">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Avg Time to Res</div>
            <div className="text-3xl font-bold text-white">{avgResolutionTime}m</div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="bg-purple-500/20 p-4 rounded-full text-purple-400">
            <History className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">NLP Auto-Escalated</div>
            <div className="text-3xl font-bold text-white">{totalBreaches}</div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
        <h3 className="text-base font-semibold text-white/90 mb-4">SLA Performance by Category</h3>
        <div className="h-[28rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} width={30} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,6,20,0.8)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} />
              <Legend iconType="circle" wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
              <Bar dataKey="met_sla" name="SLA Met" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="breaches" name="SLA Breached" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

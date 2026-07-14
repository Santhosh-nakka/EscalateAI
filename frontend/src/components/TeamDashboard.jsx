import React from 'react';
import { Users, AlertOctagon, TrendingUp, Bell } from 'lucide-react';

const TeamDashboard = ({ teamStats }) => {
  if (!teamStats) return null;

  const isOverloaded = teamStats.average_risk > 60;

  return (
    <div className="bg-slate-900 text-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="bg-brand-500 p-3 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">EscalateAI Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time Support Operations</p>
        </div>
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        <div className="bg-slate-800 px-4 py-2 rounded border border-slate-700 flex-1 md:flex-none">
          <div className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active Queue
          </div>
          <div className="text-2xl font-bold text-white">
            {teamStats.active_tickets}
          </div>
        </div>

        <div className={`px-4 py-2 rounded border flex-1 md:flex-none transition-colors ${isOverloaded ? 'bg-red-900/50 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
          <div className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> Avg Risk Level
          </div>
          <div className={`text-2xl font-bold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'}`}>
            {teamStats.average_risk}%
          </div>
        </div>
      </div>

      {teamStats.alerts && teamStats.alerts.length > 0 && (
        <div className="bg-slate-800/80 rounded border border-orange-500/30 p-3 flex-1 md:max-w-xs">
          <div className="text-xs text-orange-400 font-bold mb-1 flex items-center gap-1 uppercase tracking-wider">
            <Bell className="w-3 h-3" /> Latest Alert
          </div>
          <div className="text-sm text-slate-300 truncate" title={teamStats.alerts[teamStats.alerts.length - 1].message}>
            {teamStats.alerts[teamStats.alerts.length - 1].message}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;

import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Filter, Search, ChevronRight } from 'lucide-react';

export default function LiveQueue() {
  const { tickets } = useOutletContext();
  const navigate = useNavigate();
  const [filterTier, setFilterTier] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(t => {
    if (filterTier !== 'All' && t.customer_tier !== filterTier) return false;
    if (searchTerm && !t.subject.toLowerCase().includes(searchTerm.toLowerCase()) && !t.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <h3 className="font-semibold text-white/90">Live Support Queue</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search ID or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-md border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 bg-black/30 text-white placeholder:text-white/40"
            />
          </div>
          <div className="relative flex items-center">
            <Filter className="w-4 h-4 absolute left-3 text-white/40" />
            <select 
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-md border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-black/30 text-white"
            >
              <option value="All" className="bg-slate-900">All Tiers</option>
              <option value="Enterprise" className="bg-slate-900">Enterprise</option>
              <option value="Pro" className="bg-slate-900">Pro</option>
              <option value="Free" className="bg-slate-900">Free</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-black/60 backdrop-blur-xl text-white/60 uppercase font-medium sticky top-0 border-b border-white/10 shadow-sm z-10">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3 w-1/3">Subject</th>
              <th className="px-6 py-3">Tier</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Risk Score</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredTickets.map(ticket => (
              <tr 
                key={ticket.id} 
                onClick={() => navigate(`/ticket/${ticket.id}`)}
                className="hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-white">{ticket.id}</td>
                <td className="px-6 py-4 truncate max-w-md">{ticket.subject}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    ticket.customer_tier === 'Enterprise' ? 'bg-purple-500/20 text-purple-300' :
                    ticket.customer_tier === 'Pro' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {ticket.customer_tier}
                  </span>
                </td>
                <td className="px-6 py-4">{ticket.category}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${ticket.risk_score > 80 ? 'bg-red-500' : ticket.risk_score > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${ticket.risk_score}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold ${ticket.risk_score > 80 ? 'text-red-400' : 'text-white/80'}`}>
                      {ticket.risk_score}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="w-5 h-5 text-white/30 inline-block" />
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/50">
                  No tickets found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

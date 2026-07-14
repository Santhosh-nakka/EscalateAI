import React from 'react';
import { Clock, AlertTriangle, MessageSquare, Flame } from 'lucide-react';

const TicketQueue = ({ tickets, selectedTicket, onSelectTicket }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          Active Queue
        </h2>
        <span className="bg-brand-100 text-brand-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {tickets.length} tickets
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No active tickets. Enjoy the silence!
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map(ticket => {
              const isSelected = selectedTicket?.id === ticket.id;
              const isHighRisk = ticket.risk_score >= 80;
              const isBreaching = ticket.risk_score >= 100;
              
              return (
                <li 
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-slate-900 truncate pr-4">{ticket.subject}</div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isBreaching && <Flame className="w-4 h-4 text-red-500" />}
                      <span className={`text-sm font-bold ${isBreaching ? 'text-red-600' : isHighRisk ? 'text-orange-500' : 'text-emerald-600'}`}>
                        {ticket.risk_score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ticket.risk_breakdown?.age_mins || 0}m
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{ticket.category}</span>
                    <span className={`px-2 py-0.5 rounded font-medium ${ticket.customer_tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {ticket.customer_tier}
                    </span>
                    {ticket.priority !== 'Normal' && (
                      <span className={`px-2 py-0.5 rounded ${ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                        {ticket.priority} Prio
                      </span>
                    )}
                    
                    {/* NLP Warning if mismatch */}
                    {ticket.priority === 'Low' && ticket.nlp_analysis?.urgency_multiplier > 1.2 && (
                      <span className="flex items-center gap-1 text-orange-600 font-medium ml-auto" title="NLP detected high urgency despite low priority">
                        <AlertTriangle className="w-3 h-3" /> NLP Flag
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketQueue;

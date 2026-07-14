import React from 'react';
import { User, AlertCircle, Zap, Bot, ArrowRight, Activity, TrendingUp } from 'lucide-react';

const TicketDetail = ({ ticket }) => {
  if (!ticket) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex items-center justify-center text-slate-400">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select a ticket from the queue</p>
        </div>
      </div>
    );
  }

  const risk = ticket.risk_breakdown || {};
  const nlp = ticket.nlp_analysis || {};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-slate-800">{ticket.subject}</h2>
          <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">{ticket.id}</span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-slate-600">
            <User className="w-4 h-4" />
            <span className="font-medium text-slate-900">{ticket.customer_tier}</span> Tier
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-900">{ticket.category}</span> Category
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            Initial Priority: <span className="font-medium text-slate-900">{ticket.priority}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-slate-700 whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Explainability Section */}
        <section>
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            Risk Assessment Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1">Base SLA (Mins)</div>
              <div className="text-lg font-bold text-slate-700">{risk.base_sla_mins}</div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1">Ticket Age</div>
              <div className="text-lg font-bold text-slate-700">{risk.age_mins}m</div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1">Queue Load Penalty</div>
              <div className="text-lg font-bold text-slate-700">x{risk.queue_load_factor}</div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1">Final Risk Score</div>
              <div className={`text-xl font-bold ${risk.is_breaching ? 'text-red-600' : risk.is_high_risk ? 'text-orange-500' : 'text-emerald-600'}`}>
                {ticket.risk_score.toFixed(1)}%
              </div>
            </div>
          </div>
        </section>

        {/* NLP Analysis */}
        <section className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            NLP Urgency Analysis
          </h3>
          <div className="flex flex-col gap-2 text-sm text-amber-800">
            <div className="flex justify-between items-center bg-white/60 p-2 rounded">
              <span>Sentiment Score (VADER)</span>
              <span className="font-mono font-medium">{nlp.sentiment_score}</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2 rounded">
              <span>Urgency Keywords Detected</span>
              <span className="font-medium">{nlp.matched_keywords?.length > 0 ? nlp.matched_keywords.join(', ') : 'None'}</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2 rounded">
              <span className="font-semibold">Calculated Urgency Multiplier</span>
              <span className="font-bold text-base">x{nlp.urgency_multiplier}</span>
            </div>
          </div>
        </section>

        {/* LLM Draft */}
        {ticket.llm_draft && (
          <section>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" />
              Suggested First Response
            </h3>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 relative group">
              <div className="text-sm text-purple-900 whitespace-pre-wrap">
                {ticket.llm_draft}
              </div>
              <button className="mt-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded shadow-sm transition-colors flex items-center gap-1">
                Use Draft <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Need this to fix the missing import in the component file for empty state
import { MessageSquare } from 'lucide-react';

export default TicketDetail;

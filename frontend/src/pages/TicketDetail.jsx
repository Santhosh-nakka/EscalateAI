import React from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MessageSquare, Calculator, Clock, User, Tag } from 'lucide-react';

export default function TicketDetail() {
  const { tickets } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50">
        <p>Ticket not found or has been closed.</p>
        <button onClick={() => navigate('/queue')} className="mt-4 text-brand-400 hover:underline">
          Back to Queue
        </button>
      </div>
    );
  }

  const risk = ticket.risk_breakdown || {};
  const isLlmError = ticket.llm_draft?.startsWith('[ERROR]');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <button 
          onClick={() => navigate('/queue')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white/90">{ticket.subject}</h2>
            <span className="px-2.5 py-1 bg-white/10 text-white/60 text-xs font-semibold rounded-md">
              {ticket.id}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {ticket.customer_tier} Tier</span>
            <span className="flex items-center gap-1.5"><Tag className="w-4 h-4"/> {ticket.category}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Opened {new Date(ticket.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-medium text-white/50 uppercase tracking-wider mb-1">Current Risk</div>
          <div className={`text-3xl font-bold ${ticket.risk_score > 80 ? 'text-red-400' : ticket.risk_score > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {ticket.risk_score}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Body & LLM Draft */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Message Content</h3>
            <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-brand-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 shadow-[0_0_15px_rgba(20,184,166,1)]"></div>
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              AI Suggested First Response
            </h3>
            
            {ticket.llm_draft ? (
              <div className={`p-4 rounded-lg text-sm leading-relaxed backdrop-blur-sm ${isLlmError ? 'bg-red-900/30 text-red-200 border border-red-500/30' : 'bg-white/5 text-white/70 border border-white/10'}`}>
                {isLlmError ? (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300">Setup Required: </strong>
                      {ticket.llm_draft.replace('[ERROR] ', '')}
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{ticket.llm_draft}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-white/40 bg-white/5 rounded-lg border border-white/10 border-dashed">
                {ticket.risk_score < 50 ? "Drafting is prioritized for high-risk tickets." : "Generating draft..."}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Risk Math */}
        <div className="space-y-6">
          <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-white/50" />
              Risk Calculation Matrix
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Base SLA Target</span>
                <span className="font-semibold text-white/90">{risk.base_sla_mins} mins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Age in Queue</span>
                <span className="font-semibold text-white/90">{risk.age_mins} mins</span>
              </div>
              
              <div className="pt-3 border-t border-white/10">
                <div className="text-xs font-semibold text-white/50 uppercase mb-2">Multipliers</div>
                
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-white/60">Customer Tier</span>
                  <span className="font-mono text-white/90 px-2 py-0.5 bg-white/10 rounded">x {risk.tier_multiplier}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-white/60">NLP Urgency (vader)</span>
                  <span className="font-mono text-white/90 px-2 py-0.5 bg-white/10 rounded">x {risk.nlp_urgency}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-white/60">Queue Load Pressure</span>
                  <span className="font-mono text-white/90 px-2 py-0.5 bg-white/10 rounded">x {risk.queue_load_factor}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 mt-4 bg-white/5 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-white/50 mb-1">Bounded Formula:</div>
                <code className="text-xs text-brand-400 break-words font-mono block">
                  min(100, (BaseRisk + min(50, (Age/SLA) * 20)) * Queue)
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

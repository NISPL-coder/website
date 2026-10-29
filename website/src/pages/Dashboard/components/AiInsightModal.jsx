import React from 'react';
import { Sparkles, X, CheckCircle2, TrendingUp, Clock, ShieldCheck, Zap, ArrowRight, Bot } from 'lucide-react';

export default function AiInsightModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const insights = [
    {
      id: 1,
      icon: Clock,
      color: '#6366f1',
      bg: '#ede9fe',
      title: 'Optimal Dispatch Window',
      desc: 'Based on last 30-day activity, scheduled jobs dispatching between 10:00 AM and 11:30 AM IST receive 34% higher throughput and immediate customer engagement.'
    },
    {
      id: 2,
      icon: TrendingUp,
      color: '#10b981',
      bg: '#d1fae5',
      title: 'Automations Efficiency Surge',
      desc: 'Your Welcome Series automation is operating at 87.1% efficiency, outperforming industry benchmarks by 24.5%.'
    },
    {
      id: 3,
      icon: ShieldCheck,
      color: '#8b5cf6',
      bg: '#f3e8ff',
      title: 'Security & Auto-Backup Verified',
      desc: 'Automated 02:00 AM snapshot confirmed 100% integrity across all TallyPrime database volumes with zero latency.'
    },
    {
      id: 4,
      icon: Zap,
      color: '#f59e0b',
      bg: '#fef3c7',
      title: 'Resource Optimization Tip',
      desc: 'RAM utilization peaked at 48% yesterday during month-end closing. Your 8 GB ECC dedicated allocation has ample headroom.'
    }
  ];

  return (
    <div className="flowmail-ai-backdrop animate-fade-in" onClick={onClose}>
      <div className="flowmail-ai-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flowmail-ai-modal-header">
          <div className="flowmail-ai-modal-title-group">
            <div className="flowmail-ai-badge-icon">
              <Sparkles size={20} className="ai-sparkle-spin" />
            </div>
            <div>
              <h3 className="flowmail-ai-modal-title">AI Engine Insights & Telemetry</h3>
              <p className="flowmail-ai-modal-subtitle">Real-time intelligent recommendations for your portal</p>
            </div>
          </div>
          <button type="button" className="flowmail-modal-close-btn" onClick={onClose} aria-label="Close AI Insights">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flowmail-ai-modal-body">
          <div className="flowmail-ai-hero-card">
            <div className="flowmail-ai-hero-chip">
              <Bot size={14} />
              <span>AI Summary for Today</span>
            </div>
            <h4>All systems performing at optimal 99.98% health</h4>
            <p>
              Your infrastructure, licenses, and automations are running without bottlenecks. Here are the latest actionable insights synthesized by our telemetry AI:
            </p>
          </div>

          <div className="flowmail-ai-insights-list">
            {insights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flowmail-ai-item-card">
                  <div className="flowmail-ai-item-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                    <Icon size={18} />
                  </div>
                  <div className="flowmail-ai-item-content">
                    <h5>{item.title}</h5>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flowmail-ai-modal-footer">
          <span className="flowmail-ai-status-note">
            <CheckCircle2 size={14} color="#10b981" /> AI Telemetry continuously learning from node activity
          </span>
          <button type="button" className="flowmail-btn-primary" onClick={onClose}>
            <span>Done</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

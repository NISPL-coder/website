import React from 'react';
import { Server, Package, Activity, ShieldCheck } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const cards = [
    {
      id: 'nodes',
      title: 'Cloud Node Status',
      value: 'Online',
      subtext: '1 Dedicated Instance Active',
      icon: Server,
      color: '#0284c7',
      bg: '#e0f2fe',
      isLive: true
    },
    {
      id: 'licenses',
      title: 'Tally Prime TSS',
      value: 'Active',
      subtext: 'Statutory updates & banking active',
      icon: Package,
      color: '#059669',
      bg: '#d1fae5'
    },
    {
      id: 'uptime',
      title: 'Cloud High Availability',
      value: stats?.cloudUptime || '99.98%',
      subtext: 'Tier-4 Tier Data Center SLA',
      icon: Activity,
      color: '#8b5cf6',
      bg: '#ede9fe'
    },
    {
      id: 'security',
      title: 'GST & SSL Compliance',
      value: 'Verified',
      subtext: '100% GST Tax Credit & 256-bit SSL',
      icon: ShieldCheck,
      color: '#f59e0b',
      bg: '#fef3c7'
    }
  ];

  return (
    <div className="cust-dash-stats-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className="cust-stat-card">
            <div className="cust-stat-card-top">
              <span className="cust-stat-title">{c.title}</span>
              <div 
                className="cust-stat-icon-wrap" 
                style={{ backgroundColor: c.bg, color: c.color }}
              >
                <Icon size={18} />
              </div>
            </div>

            <div className="cust-stat-val-row">
              <span className="cust-stat-value">{c.value}</span>
              {c.isLive && (
                <span className="cust-badge-live">
                  <span className="cust-pulsing-dot-green" />
                  Live
                </span>
              )}
            </div>

            <span className="cust-stat-subtext">{c.subtext}</span>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { 
  ReceiptIndianRupee, 
  ShoppingBag, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  Boxes, 
  FileSpreadsheet, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { OVERVIEW_CARDS } from '../data/mockData';
import './DashboardOverview.css';

const ICON_MAP = {
  ReceiptIndianRupee: ReceiptIndianRupee,
  ShoppingBag: ShoppingBag,
  CreditCard: CreditCard,
  ArrowDownLeft: ArrowDownLeft,
  ArrowUpRight: ArrowUpRight,
  Building2: Building2,
  Boxes: Boxes,
  FileSpreadsheet: FileSpreadsheet,
};

export default function DashboardOverview({ onCardClick }) {
  return (
    <section id="overview-section" className="nis-overview-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="nis-section-header text-center">
          <div className="nis-section-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>INTEGRATED BUSINESS ECOSYSTEM</span>
          </div>
          <h2 className="nis-section-title">
            Everything Your <span className="gradient-text">Business Needs</span>
          </h2>
          <p className="nis-section-subtitle">
            Powerful tools to manage your complete business from one place. Seamlessly connect accounts, inventory, banking and compliance.
          </p>
        </div>

        {/* 8 Dashboard Cards Grid */}
        <div className="nis-overview-grid">
          {OVERVIEW_CARDS.map((card) => {
            const IconComponent = ICON_MAP[card.icon] || Boxes;
            return (
              <div 
                key={card.id} 
                className="nis-overview-card"
                onClick={() => onCardClick(card.tabKey, card.subKey)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onCardClick(card.tabKey, card.subKey);
                  }
                }}
              >
                {/* Top Row: Icon + Change Pill */}
                <div className="card-top-row">
                  <div 
                    className="card-icon-box"
                    style={{ background: card.gradient }}
                  >
                    <IconComponent size={22} color="#FFFFFF" />
                  </div>
                  
                  <span className={`card-change-pill ${card.isPositive ? 'positive' : 'neutral'}`}>
                    {card.isPositive && <TrendingUp size={12} />}
                    {card.change}
                  </span>
                </div>

                {/* Metric & Title */}
                <div className="card-metric-block">
                  <span className="card-metric-value">{card.metric}</span>
                  <h3 className="card-title">{card.title}</h3>
                  <span className="card-subtitle">{card.subtitle}</span>
                </div>

                {/* Description */}
                <p className="card-description">{card.description}</p>

                {/* Bottom Action Row */}
                <div className="card-action-row">
                  <span className="card-action-text">Manage {card.shortTitle}</span>
                  <div className="card-action-arrow">
                    <ArrowRight size={16} />
                  </div>
                </div>

                {/* Subtle Hover Gradient Glow */}
                <div className="card-hover-border" style={{ borderColor: card.color }} />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

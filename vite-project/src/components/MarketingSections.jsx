import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ReceiptIndianRupee, 
  Boxes, 
  BarChart3, 
  Lock, 
  MousePointerClick, 
  Building2, 
  Landmark, 
  FileSpreadsheet, 
  PieChart, 
  Users, 
  PhoneCall, 
  ArrowRight,
  CheckCircle,
  Zap,
  Award
} from 'lucide-react';
import './MarketingSections.css';

export default function MarketingSections({ onOpenDemo, onOpenContact }) {
  // Why Choose NIS (6 Cards)
  const whyChooseList = [
    {
      id: 1,
      title: "Smart Accounting",
      desc: "Automated double-entry bookkeeping, bank feed reconciliation, and smart ledger balancing with zero manual friction.",
      icon: ReceiptIndianRupee,
      color: "#2563EB",
      badge: "Automated",
    },
    {
      id: 2,
      title: "GST Ready",
      desc: "100% compliant e-Invoicing (IRP) & e-Way Bill generation with direct automated reconciliation of GSTR-2B ITC.",
      icon: ShieldCheck,
      color: "#7C3AED",
      badge: "Government Synced",
    },
    {
      id: 3,
      title: "Inventory Control",
      desc: "Multi-warehouse real-time tracking, barcode scanning, batch/expiry control and smart low-stock reorder triggers.",
      icon: Boxes,
      color: "#C026D3",
      badge: "Multi-Location",
    },
    {
      id: 4,
      title: "Business Analytics",
      desc: "Instant Profit & Loss statements, automated Balance Sheets, cashflow forecasts, and executive dashboard metrics.",
      icon: BarChart3,
      color: "#059669",
      badge: "Actionable Insights",
    },
    {
      id: 5,
      title: "Secure Data",
      desc: "Bank-grade 256-bit AES encryption, MCA compliant audit trails, role-based access, and automated cloud snapshots.",
      icon: Lock,
      color: "#0284C7",
      badge: "256-Bit SSL",
    },
    {
      id: 6,
      title: "Easy to Use",
      desc: "Familiar Tally shortcut keys combined with a lightning-fast modern interface. Onboard your accounts team in 15 minutes.",
      icon: MousePointerClick,
      color: "#D97706",
      badge: "Zero Learning Curve",
    },
  ];

  // Feature categories (8 categories)
  const featureCategories = [
    {
      title: "Accounting",
      desc: "Sales, Purchases, Receipts, Payments, Contra & Journal entries with auto ledger posting.",
      icon: ReceiptIndianRupee,
    },
    {
      title: "Inventory",
      desc: "SKUs, HSN codes, serial tracking, warehouse transfers, and live stock valuations.",
      icon: Boxes,
    },
    {
      title: "GST Compliance",
      desc: "GSTR-1, GSTR-3B summary generation, e-Way bills, and IRN hash creation in seconds.",
      icon: ShieldCheck,
    },
    {
      title: "Banking",
      desc: "Direct integration with HDFC, ICICI, SBI, Axis for one-click bank statement reconciliation.",
      icon: Landmark,
    },
    {
      title: "Reports",
      desc: "P&L, Balance Sheets, Trial Balance, Day Books, and stock aging exported to Excel & PDF.",
      icon: FileSpreadsheet,
    },
    {
      title: "Analytics",
      desc: "Interactive visual dashboards tracking profitability, gross margins and expense trends.",
      icon: PieChart,
    },
    {
      title: "Customer Management",
      desc: "Customer credit limits, outstanding aging, WhatsApp automated payment reminder notifications.",
      icon: Users,
    },
    {
      title: "Supplier Management",
      desc: "Vendor bills, Purchase Orders, Goods Receipt Notes (GRN), and payment scheduling.",
      icon: Building2,
    },
  ];

  // Statistics
  const statistics = [
    { number: "10+", label: "Years Experience", sub: "Serving Indian Enterprises" },
    { number: "500+", label: "Businesses Empowered", sub: "Across Retail, Manufacturing & IT" },
    { number: "10,000+", label: "Invoices Processed", sub: "Daily Seamless Volume" },
    { number: "99.9%", label: "System Reliability", sub: "Cloud Uptime & Security" },
  ];

  return (
    <div className="nis-marketing-wrapper">
      
      {/* SECTION 1: WHY CHOOSE NET INFOTECH SYSTEM */}
      <section id="why-us-section" className="nis-why-choose-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Award size={14} className="badge-sparkle" />
              <span>THE PREFERRED INDIAN BUSINESS ERP</span>
            </div>
            <h2 className="nis-marketing-h2">
              Why Choose <span className="gradient-text">Net Infotech System?</span>
            </h2>
            <p className="nis-marketing-sub">
              Built specifically for Indian MSMEs, manufacturers, distributors, and enterprises requiring ironclad compliance and modern ease of use.
            </p>
          </div>

          <div className="why-choose-grid">
            {whyChooseList.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="why-card">
                  <div className="why-card-top">
                    <div className="why-icon-box" style={{ background: `linear-gradient(135deg, ${item.color}, #1239A6)` }}>
                      <Icon size={22} color="#FFFFFF" />
                    </div>
                    <span className="why-badge">{item.badge}</span>
                  </div>
                  <h3 className="why-title">{item.title}</h3>
                  <p className="why-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 2: EVERYTHING YOUR BUSINESS NEEDS. ONE POWERFUL PLATFORM */}
      <section id="features-section" className="nis-features-platform-section">
        <div className="container">
          
          <div className="section-title-center">
            <div className="nis-section-badge">
              <Zap size={14} className="badge-sparkle" />
              <span>COMPLETE SUITE OF SOLUTIONS</span>
            </div>
            <h2 className="nis-marketing-h2">
              Everything Your Business Needs.<br />
              <span className="gradient-text">One Powerful Platform.</span>
            </h2>
            <p className="nis-marketing-sub">
              Eliminate disconnected software. Net Infotech System synchronizes your billing, ledgers, inventory, and banking into a single source of truth.
            </p>
          </div>

          <div className="features-platform-grid">
            {featureCategories.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="feature-category-tile">
                  <div className="feature-cat-icon">
                    <Icon size={20} color="var(--primary-light)" />
                  </div>
                  <div>
                    <h4 className="feature-cat-title">{f.title}</h4>
                    <p className="feature-cat-desc">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3: STATISTICS SECTION */}
      <section className="nis-stats-section">
        <div className="container">
          <div className="stats-inner-banner">
            <div className="stats-grid">
              {statistics.map((st, i) => (
                <div key={i} className="stat-counter-block">
                  <span className="stat-big-num gradient-text-light">{st.number}</span>
                  <span className="stat-counter-label">{st.label}</span>
                  <span className="stat-counter-sub">{st.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HIGH-IMPACT GRADIENT CTA */}
      <section className="nis-cta-banner-section">
        <div className="container">
          <div className="cta-gradient-box">
            <div className="cta-content">
              <span className="cta-pill">SCHEDULE A 1-ON-1 DEMONSTRATION</span>
              <h2 className="cta-headline">Ready to Simplify Your Business?</h2>
              <p className="cta-subtext">
                Experience smarter accounting, automated GST e-Invoicing, and complete business management with Net Infotech System.
              </p>
              
              <div className="cta-buttons-row">
                <button 
                  type="button" 
                  className="cta-btn-white"
                  onClick={onOpenDemo}
                >
                  <Sparkles size={16} color="var(--primary)" />
                  <span>Start Free Demo</span>
                </button>

                <button 
                  type="button" 
                  className="cta-btn-translucent"
                  onClick={onOpenContact}
                >
                  <PhoneCall size={16} />
                  <span>Contact Us</span>
                </button>
              </div>

              <div className="cta-guarantee-row">
                <div className="guarantee-item">
                  <CheckCircle size={15} color="#34D399" />
                  <span>Free 14-Day Full Access</span>
                </div>
                <div className="guarantee-item">
                  <CheckCircle size={15} color="#34D399" />
                  <span>Complimentary Data Migration</span>
                </div>
                <div className="guarantee-item">
                  <CheckCircle size={15} color="#34D399" />
                  <span>Dedicated Account Manager</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

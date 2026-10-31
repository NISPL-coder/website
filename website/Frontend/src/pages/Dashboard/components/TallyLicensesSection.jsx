import React from 'react';
import { Package, ShieldCheck, CheckCircle2, ArrowUpRight, Download, RefreshCw } from 'lucide-react';

export default function TallyLicensesSection({ onOpenSupport }) {
  const license = {
    serialNumber: '768291044',
    productName: 'TallyPrime Gold (Multi-User Cloud Edition)',
    status: 'Active TSS',
    tssExpiry: '27 Oct 2027',
    usersAllocated: 'Unlimited LAN / Concurrent Cloud Users',
    version: 'TallyPrime Release 5.0 (Build 2026.1)'
  };

  return (
    <div className="cust-section-card">
      <div className="cust-section-card-header">
        <div className="cust-section-card-title-group">
          <div className="cust-section-card-icon-bubble" style={{ background: '#d1fae5', color: '#059669' }}>
            <Package size={18} />
          </div>
          <div>
            <h3 className="cust-section-title">Tally Prime License & TSS</h3>
            <span className="cust-section-desc">Statutory updates, auto e-Invoice, auto e-Way bill and connected banking.</span>
          </div>
        </div>

        <div className="cust-section-header-actions">
          <button
            type="button"
            className="cust-btn-secondary"
            onClick={onOpenSupport}
          >
            <RefreshCw size={14} />
            <span>Renew / Extend TSS</span>
          </button>
        </div>
      </div>

      <div className="cust-license-box">
        <div className="cust-license-top">
          <div>
            <div className="cust-license-badge">
              <ShieldCheck size={13} color="#059669" />
              <span>Certified Tally Partner License</span>
            </div>
            <h4 className="cust-license-title">{license.productName}</h4>
            <div className="cust-license-serial">
              Serial No: <strong>{license.serialNumber}</strong> • {license.usersAllocated}
            </div>
          </div>

          <div className="cust-license-expiry-box">
            <span className="cust-expiry-label">TSS Valid Till</span>
            <span className="cust-expiry-val">{license.tssExpiry}</span>
          </div>
        </div>

        <div className="cust-license-features-row">
          <div className="cust-feature-item">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Auto Bank Reconciliation Active</span>
          </div>
          <div className="cust-feature-item">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Real-time E-Way Bill & E-Invoicing</span>
          </div>
          <div className="cust-feature-item">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Remote Browser Access Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Building2, User, Key } from 'lucide-react';

export default function RegistrationSuccessModal({ customer, onProceed }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onProceed]);

  if (!customer) return null;

  return (
    <div className="ebolt-modal-backdrop" role="dialog" aria-modal="true">
      <div className="ebolt-dialog-card animate-fade-in" style={{ maxWidth: '480px' }}>
        <div className="ebolt-dialog-header">
          <div className="ebolt-dialog-check" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="ebolt-dialog-title">Account Created Successfully!</h3>
            <span className="ebolt-dialog-sub">Customer Onboarding Complete</span>
          </div>
        </div>

        <div className="ebolt-dialog-body">
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '14px' }}>
            Your enterprise customer profile and cloud workspace have been provisioned. Redirecting to your dashboard in <strong>{countdown}s</strong>...
          </p>

          <div className="ebolt-session-user-box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> Customer ID:
              </span>
              <span style={{ fontSize: '0.92rem', color: '#0284C7', fontWeight: 700, fontFamily: 'monospace' }}>
                {customer.customerId}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Name:
              </span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 600 }}>
                {customer.name}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} /> Company:
              </span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 600 }}>
                {customer.companyName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                GST No:
              </span>
              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontFamily: 'monospace' }}>
                {customer.gstNo}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Cloud Status:
              </span>
              <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                Provisioned & Online
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="ebolt-submit-btn"
              onClick={onProceed}
              id="btn-go-to-dashboard"
            >
              <span>Go to Customer Dashboard Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  User,
  Building,
  Mail,
  Users as UsersIcon,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contractApi } from '../../../services/contractApi';

export default function AwaitingConfirmationModal({
  isOpen,
  onClose,
  contracts = [],
  onContractConfirmed
}) {
  const [confirmingIds, setConfirmingIds] = useState({});
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getContractId = (c) => c?.id || c?.contractId;

  const handleConfirmSingle = async (contract) => {
    const cId = getContractId(contract);
    if (!cId) return;

    setConfirmingIds((prev) => ({ ...prev, [cId]: true }));
    const toastId = toast.loading(`Confirming payment for "${contract.name || cId}"...`);

    try {
      await contractApi.confirmPayment(cId);
      toast.success(
        `Payment confirmed! Contract set to Active and customer account activated.`,
        { id: toastId }
      );
      onContractConfirmed?.(cId, contract);
    } catch (err) {
      console.error('Confirmation error:', err);
      toast.error(`Confirmation failed: ${err.message || 'Server error'}`, { id: toastId });
    } finally {
      setConfirmingIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  const handleConfirmAll = async () => {
    if (!contracts.length) return;
    setIsConfirmingAll(true);
    const toastId = toast.loading(`Confirming all ${contracts.length} payments...`);

    let successCount = 0;
    for (const contract of contracts) {
      const cId = getContractId(contract);
      try {
        await contractApi.confirmPayment(cId);
        onContractConfirmed?.(cId, contract);
        successCount++;
      } catch (err) {
        console.error(`Failed to confirm ${cId}:`, err);
      }
    }

    setIsConfirmingAll(false);
    if (successCount === contracts.length) {
      toast.success(`All ${successCount} payments confirmed! All services activated.`, { id: toastId });
      onClose();
    } else {
      toast.error(`Confirmed ${successCount} of ${contracts.length}. Some failed.`, { id: toastId });
    }
  };

  const formatCurrency = (val) => {
    const num = Number(String(val || 0).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(num) && num > 0
      ? `₹${num.toLocaleString('en-IN')}`
      : String(val || '—');
  };

  const modalContent = (
    <div
      className="adm-modal-backdrop-portal"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="adm-modal-container animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '100%',
          maxHeight: '90vh',
          borderRadius: '18px',
          background: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 26px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fef08a',
                color: '#854d0e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(234, 179, 8, 0.25)',
                flexShrink: 0
              }}
            >
              <Clock size={22} strokeWidth={2.3} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: 0
                  }}
                >
                  Awaiting Payment Confirmation
                </h2>
                <span
                  style={{
                    background: '#fef08a',
                    color: '#854d0e',
                    border: '1px solid #fde047',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}
                >
                  {contracts.length} Pending
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#64748b',
                  margin: '4px 0 0 0'
                }}
              >
                Customer payments received online via Razorpay. Confirm to activate their subscriptions and resume cloud services.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '20px 26px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {contracts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
                All payments confirmed!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '380px' }}>
                No customer orders are currently awaiting admin confirmation. All services are active and running.
              </div>
            </div>
          ) : (
            contracts.map((c) => {
              const cId = getContractId(c);
              const isConfirming = !!confirmingIds[cId];
              const custId = c.customerId || c.accountId;
              const customerName = c.customer || c.name || c.person;
              const companyName = c.company;
              const usersCount = c.users || c.userCount || 1;
              const planName = c.name || c.planName || 'Cloud Subscription';

              return (
                <div
                  key={cId}
                  style={{
                    border: '1px solid #fde047',
                    background: '#fffdf5',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 6px rgba(234, 179, 8, 0.08)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.96rem',
                            color: '#0f172a'
                          }}
                        >
                          {planName}
                        </span>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}
                        >
                          {cId}
                        </span>
                        {usersCount > 0 && (
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <UsersIcon size={12} />
                            {usersCount} {usersCount === 1 ? 'User' : 'Users'}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          marginTop: '6px',
                          fontSize: '0.82rem',
                          color: '#475569',
                          flexWrap: 'wrap'
                        }}
                      >
                        {customerName && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} color="#64748b" />
                            <strong>{customerName}</strong>
                            {custId && <span style={{ color: '#6366f1' }}>({custId})</span>}
                          </span>
                        )}
                        {companyName && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={13} color="#64748b" />
                            {companyName}
                          </span>
                        )}
                        {(c.personEmail || c.email) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={13} color="#64748b" />
                            {c.personEmail || c.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status Badge */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: '#059669'
                        }}
                      >
                        {formatCurrency(c.totalContractValue || c.value || c.amount)}
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          marginTop: '4px'
                        }}
                      >
                        <Clock size={11} />
                        Confirmation Pending
                      </div>
                    </div>
                  </div>

                  {/* Payment Details & Confirm Action Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px dashed #e2e8f0',
                      paddingTop: '10px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={14} color="#059669" />
                      <span>Payment Method: <strong>Razorpay (Online)</strong></span>
                      {c.startDate && <span>· Date: <strong>{c.startDate}</strong></span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleConfirmSingle(c)}
                        disabled={isConfirming || isConfirmingAll}
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: isConfirming || isConfirmingAll ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isConfirming && !isConfirmingAll) e.currentTarget.style.background = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          if (!isConfirming && !isConfirmingAll) e.currentTarget.style.background = '#10b981';
                        }}
                        title="Set payment status to Yes and activate services"
                      >
                        <CheckCircle2 size={14} />
                        {isConfirming ? 'Activating...' : 'Set Confirmation: Yes'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 26px',
            borderTop: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {contracts.length > 0 ? (
              <span>
                Total <strong>{contracts.length}</strong> {contracts.length === 1 ? 'order' : 'orders'} waiting for admin confirmation.
              </span>
            ) : (
              <span>All customer orders up to date.</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {contracts.length > 1 && (
              <button
                type="button"
                onClick={handleConfirmAll}
                disabled={isConfirmingAll}
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: isConfirmingAll ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={14} />
                {isConfirmingAll ? 'Confirming All...' : `Confirm All (${contracts.length})`}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 3000,
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '420px',
      }}
    >
      <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1 }}>{message}</span>
      <button 
        type="button" 
        onClick={onClose} 
        style={{ color: '#94A3B8', padding: '2px', display: 'flex' }}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

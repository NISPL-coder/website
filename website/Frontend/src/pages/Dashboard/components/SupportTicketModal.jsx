import React, { useState } from 'react';
import { X, Send, CheckCircle2, HelpCircle } from 'lucide-react';

export default function SupportTicketModal({ isOpen, onClose, customer }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Tally Prime Cloud Access');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setDescription('');
      onClose();
    }, 1800);
  };

  return (
    <div className="ebolt-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="ebolt-dialog-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px' }}
      >
        <div className="ebolt-dialog-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ebolt-dialog-check" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 className="ebolt-dialog-title">Priority Support Ticket</h3>
              <span className="ebolt-dialog-sub">Net Infotech System 5-Star Support Desk</span>
            </div>
          </div>
          <button
            type="button"
            className="ebolt-dialog-close"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 6px 0' }}>Ticket Created Successfully</h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Your ticket reference #NIS-TK-{Math.floor(1000 + Math.random() * 9000)} has been assigned to our senior cloud engineer.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div className="ebolt-field-group">
              <label className="ebolt-field-lbl" htmlFor="ticket-category">Category</label>
              <select
                id="ticket-category"
                className="ebolt-input"
                style={{ paddingLeft: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Tally Prime Cloud Access">Tally Prime Cloud Access</option>
                <option value="TSS License Renewal">TSS License Renewal</option>
                <option value="Multi-User User Addition">Multi-User User Addition</option>
                <option value="GST e-Invoice / e-Way Bill">GST e-Invoice / e-Way Bill</option>
                <option value="Data Backup & Restore">Data Backup & Restore</option>
              </select>
            </div>

            <div className="ebolt-field-group">
              <label className="ebolt-field-lbl" htmlFor="ticket-subject">Subject</label>
              <input
                id="ticket-subject"
                type="text"
                className="ebolt-input"
                style={{ paddingLeft: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px' }}
                placeholder="Brief summary of request"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="ebolt-field-group">
              <label className="ebolt-field-lbl" htmlFor="ticket-desc">Description</label>
              <textarea
                id="ticket-desc"
                rows={4}
                className="ebolt-input"
                style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', resize: 'vertical' }}
                placeholder="Describe your issue or request in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="cust-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cust-btn-primary"
              >
                <Send size={14} />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';

export default function PartyModal({ isOpen, onClose, defaultType = 'customers', onAddParty }) {
  if (!isOpen) return null;

  const isCustomer = defaultType === 'customers';

  const [formData, setFormData] = useState({
    id: `${isCustomer ? 'CUST' : 'SUPP'}-0${Math.floor(Math.random() * 80) + 10}`,
    name: '',
    gstin: '27AAECB' + Math.floor(1000 + Math.random() * 9000) + 'P1Z9',
    phone: '+91 98200 ' + Math.floor(10000 + Math.random() * 90000),
    city: 'Mumbai',
    state: 'Maharashtra',
    balance: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddParty(defaultType, {
      ...formData,
      balance: Number(formData.balance || 0),
    });
    onClose();
  };

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        style={{ maxWidth: '540px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
              <Users size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="modal-main-title">Add New {isCustomer ? 'Customer' : 'Supplier'}</h2>
              <span className="modal-sub-title">Net Infotech System • Party Master Record</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-scrollable">
            <div className="form-group">
              <label>Business / Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Enterprises Pvt. Ltd."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="form-input font-mono"
                />
              </div>

              <div className="form-group">
                <label>Mobile / Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Opening Balance (₹)</label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer-bar">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action">
              <Check size={16} />
              <span>Save {isCustomer ? 'Customer' : 'Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

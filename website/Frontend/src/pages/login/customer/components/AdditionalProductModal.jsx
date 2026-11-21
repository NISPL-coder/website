import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PackagePlus,
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Users,
  HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdditionalProductModal.css';

const ADDITIONAL_PRODUCT_CATALOG = [
  {
    id: 'addon-user-license',
    name: 'Additional Cloud User (1 User)',
    category: 'Software',
    desc: 'Add 1 additional concurrent user license to your active cloud server',
    basePrice: 500,
    icon: Users,
    type: 'user'
  },
  {
    id: 'addon-user-pack-3',
    name: 'Additional Cloud Users (3 Users Pack)',
    category: 'Software',
    desc: 'Cost-effective pack of 3 concurrent user licenses with instant provisioning',
    basePrice: 1200,
    icon: Users,
    type: 'user'
  },
  {
    id: 'addon-server-node',
    name: 'Additional Enterprise Cloud Server (2 Core / 4GB RAM)',
    category: 'Service',
    desc: 'Provision an additional secondary cloud node linked to your primary contract',
    basePrice: 2500,
    icon: Server,
    type: 'server'
  },
  {
    id: 'addon-storage-100gb',
    name: '100 GB High-Speed NVMe SSD Block',
    category: 'Hardware',
    desc: 'Expand primary storage volume with enterprise NVMe speed and RAID redundancy',
    basePrice: 800,
    icon: HardDrive,
    type: 'storage'
  }
];

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdditionalProductModal({
  isOpen,
  onClose,
  primaryContract = null,
  masterExpiryDate = null,
  eligibility = null,
  customer = null,
  onAddToCart = null,
  onGoToCart = null,
  onRenew = null
}) {
  const [selectedProductId, setSelectedProductId] = useState(ADDITIONAL_PRODUCT_CATALOG[0].id);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRestricted = Boolean(eligibility?.isRestricted || eligibility?.eligible === false);
  const isExpired = Boolean(eligibility?.isExpired || eligibility?.reason === 'contract_expired');
  const expiryDateVal = masterExpiryDate || eligibility?.masterExpiryDate || primaryContract?.expiryDate || primaryContract?.endDate;
  const cutOffDateVal = eligibility?.cutOffDate;

  const selectedProduct = ADDITIONAL_PRODUCT_CATALOG.find((p) => p.id === selectedProductId) || ADDITIONAL_PRODUCT_CATALOG[0];
  const itemTotal = selectedProduct.basePrice * quantity;
  const gstAmount = Math.round(itemTotal * 0.18);
  const grandTotal = itemTotal + gstAmount;

  const handleAddAndCheckout = () => {
    if (isRestricted || isExpired) {
      toast.error('Additional product purchases are unavailable during the last 15 days of your contract.');
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        id: `addon-${selectedProduct.id}-${Date.now()}`,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        planName: selectedProduct.name,
        product: 'Additional Cloud Product',
        basePrice: itemTotal,
        unitPrice: selectedProduct.basePrice,
        finalPrice: grandTotal,
        price: itemTotal,
        quantity,
        category: selectedProduct.category,
        billingCycle: 'Synchronized with Primary Contract',
        duration: 'Contract Term',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: expiryDateVal,
        isAdditional: true,
        isAdditionalProduct: true,
        parentContractId: primaryContract?.contractId || null,
        primaryContractId: primaryContract?.contractId || null,
        description: `Additional product synchronized with Primary Contract ${primaryContract?.contractId || ''} (Master Expiry: ${formatDate(expiryDateVal)})`
      });

      toast.success(`${selectedProduct.name} added to cart!`);
      onClose();
      if (onGoToCart) onGoToCart();
    }
  };

  const modalContent = (
    <div className="apm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="apm-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="apm-modal-header">
          <div className="apm-modal-title-group">
            <span className="apm-modal-badge">
              <PackagePlus size={13} />
              Add Additional Product
            </span>
            <h2 className="apm-modal-title">Expand Contract Capabilities</h2>
            <p className="apm-modal-subtitle">
              Add extra servers, user licenses, or storage to your active contract.
            </p>
          </div>
          <button
            type="button"
            className="apm-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="apm-modal-body">
          {/* Primary Contract Card */}
          <div className="apm-contract-card">
            <div className="apm-contract-card-header">
              <span className="apm-contract-label">Primary Contract</span>
              <span className="apm-contract-id">
                {primaryContract?.contractId || 'Master Subscription'}
              </span>
            </div>

            <div className="apm-contract-meta-grid">
              <div className="apm-meta-item">
                <span className="apm-meta-title">Expiry Date</span>
                <span className="apm-meta-val" style={{ color: isRestricted ? '#b45309' : '#047857' }}>
                  <Calendar size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  {formatDate(expiryDateVal)}
                </span>
              </div>
              <div className="apm-meta-item">
                <span className="apm-meta-title">Contract Status</span>
                <span className="apm-meta-val">
                  {primaryContract?.status || (isExpired ? 'Expired' : 'Active')}
                </span>
              </div>
            </div>

            <div className="apm-sync-notice">
              <ShieldCheck size={15} color="#2563eb" style={{ flexShrink: 0 }} />
              <span>
                All additional products synchronize with your Primary Contract and inherit the <strong>{formatDate(expiryDateVal)}</strong> Expiry Date.
              </span>
            </div>
          </div>

          {/* 15-Day Restricted Cut-Off Warning Banner */}
          {isRestricted && (
            <div className={`apm-restriction-banner ${isExpired ? 'is-expired' : ''}`}>
              <div className="apm-restriction-header">
                {isExpired ? <Lock size={18} /> : <AlertTriangle size={18} />}
                <span>
                  {isExpired ? 'Contract Expired — Purchase Blocked' : 'Purchase Restriction Active (15-Day Cut-off)'}
                </span>
              </div>
              <p className="apm-restriction-message">
                Additional product purchases are unavailable during the last 15 days of your current contract. Please renew your existing contract to add more products.
              </p>
              <div className="apm-restriction-dates">
                <div className="apm-date-pill">
                  <strong>Contract Expiry Date:</strong> {formatDate(expiryDateVal)}
                </div>
                {cutOffDateVal && (
                  <div className="apm-date-pill">
                    <strong>Purchases Restricted From:</strong> {formatDate(cutOffDateVal)}
                  </div>
                )}
              </div>
              {onRenew && (
                <button
                  type="button"
                  className="apm-renew-action-btn"
                  onClick={() => {
                    onClose();
                    onRenew();
                  }}
                >
                  <span>Renew Primary Contract Now</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}

          {/* Product Selection (Interactive when eligible, dimmed when restricted) */}
          <div className="apm-product-section" style={isRestricted ? { opacity: 0.65, pointerEvents: 'none' } : {}}>
            <div className="apm-section-title">
              <Layers size={14} />
              <span>Select Product to Add</span>
            </div>

            <div className="apm-product-options-grid">
              {ADDITIONAL_PRODUCT_CATALOG.map((item) => {
                const isSelected = selectedProductId === item.id;
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`apm-product-option-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedProductId(item.id)}
                  >
                    <div className="apm-option-left">
                      <input
                        type="radio"
                        name="additional_product"
                        checked={isSelected}
                        onChange={() => setSelectedProductId(item.id)}
                        className="apm-option-radio"
                      />
                      <div className="apm-option-info">
                        <span className="apm-option-name">{item.name}</span>
                        <span className="apm-option-desc">{item.desc}</span>
                      </div>
                    </div>
                    <div className="apm-option-price">
                      ₹{item.basePrice.toLocaleString('en-IN')}
                      <span className="apm-option-cycle">/ synced validity</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="apm-modal-footer">
          <div className="apm-footer-total">
            <span className="apm-total-label">Total (+18% GST):</span>
            <span className="apm-total-amount">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="apm-footer-actions">
            <button type="button" className="apm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="apm-btn-submit"
              disabled={isRestricted || isExpired}
              onClick={handleAddAndCheckout}
              title={isRestricted ? 'Unavailable during the last 15 days of your contract' : 'Add to Cart'}
            >
              {isRestricted ? <Lock size={15} /> : <PackagePlus size={15} />}
              <span>{isRestricted ? 'Purchase Blocked' : 'Add to Cart & Checkout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

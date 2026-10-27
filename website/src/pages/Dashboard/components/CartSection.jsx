import React from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Package,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

export default function CartSection({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
  onBrowseProducts
}) {
  const subtotal = cartItems.reduce((s, i) => s + i.basePrice * (i.quantity || 1), 0);
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  const gst = cgst + sgst;
  const grandTotal = subtotal + gst;

  /* ── Empty state ────────────────────────────────────────────────────── */
  if (!cartItems?.length) {
    return (
      <div className="cliento-card cart-empty-card animate-fade-in">
        <div className="cart-empty-icon-ring">
          <ShoppingBag size={26} color="#6366f1" />
        </div>
        <h3 className="cliento-card-title" style={{ fontSize: '1.15rem', marginBottom: 6 }}>
          Your Cart is Empty
        </h3>
        <p className="cliento-card-desc" style={{ maxWidth: 400, margin: '0 auto 20px', color: '#64748b' }}>
          Explore genuine Tally licenses, dedicated cloud hosting, and automation add-ons.
        </p>
      </div>
    );
  }

  /* ── Populated cart ─────────────────────────────────────────────────── */
  return (
    <div className="cliento-payment-layout animate-fade-in">
      {/* ── Left: Cart Table Card ────────────────────────────────────────── */}
      <div className="cliento-card cliento-table-card" style={{ flex: 1 }}>
        <div className="cliento-table-head-row">
          <div className="cliento-card-title-group">
            <ShoppingCart size={18} className="cliento-card-icon" />
            <h3 className="cliento-card-title">
              Cart Items ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h3>
          </div>

          <button type="button" className="cliento-btn-filter" onClick={onBrowseProducts}>
            <span>+ Add More</span>
          </button>
        </div>

        <div className="cliento-table-responsive">
          <table className="cliento-data-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ width: 44 }} />
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const qty = item.quantity || 1;
                const lineTotal = item.basePrice * qty;

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="cliento-user-cell">
                        <div className="cliento-avatar-circle" style={{ background: '#eff6ff', color: '#2563eb' }}>
                          <Package size={15} />
                        </div>
                        <div>
                          <div className="cliento-user-name-text">{item.name}</div>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            GST Applicable: 18%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="cliento-cart-stepper">
                        <button
                          type="button"
                          className="cliento-stepper-btn"
                          onClick={() => onUpdateQuantity(item.id, qty - 1)}
                          title="Decrease"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="cliento-stepper-val">{qty}</span>
                        <button
                          type="button"
                          className="cliento-stepper-btn"
                          onClick={() => onUpdateQuantity(item.id, qty + 1)}
                          title="Increase"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: '#475569' }}>
                      ₹{item.basePrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', color: '#0f172a', fontWeight: 500 }}>
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cliento-icon-btn-ghost"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right: Order Summary ─────────────────────────────────────────── */}
      <div className="cliento-card cliento-billing-summary-card">
        <div className="cliento-card-head">
          <h3 className="cliento-card-title">Order Summary</h3>
        </div>

        <div className="cliento-summary-lines">
          <div className="cliento-summary-row">
            <span className="cliento-sum-label">Items Subtotal</span>
            <span className="cliento-sum-val">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="cliento-summary-row">
            <span className="cliento-sum-label">CGST (9%)</span>
            <span className="cliento-sum-val">₹{cgst.toLocaleString('en-IN')}</span>
          </div>
          <div className="cliento-summary-row">
            <span className="cliento-sum-label">SGST (9%)</span>
            <span className="cliento-sum-val">₹{sgst.toLocaleString('en-IN')}</span>
          </div>
          <div className="cliento-summary-divider" />
          <div className="cliento-summary-row total-row">
            <span className="cliento-sum-total-label">Grand Total</span>
            <span className="cliento-sum-total-val">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button
          type="button"
          className="cliento-pay-btn"
          onClick={onProceedToPayment}
        >
          <span>Proceed to Payment</span>
          <ArrowRight size={14} />
        </button>

        <div className="cliento-pci-badge">
          <ShieldCheck size={13} color="#059669" />
          <span>GST Input Tax Credit Eligible</span>
        </div>
      </div>
    </div>
  );
}

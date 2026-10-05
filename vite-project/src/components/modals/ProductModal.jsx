import React, { useState } from 'react';
import { X, Boxes, Plus, Check } from 'lucide-react';
import { GST_SLABS } from '../../data/mockData';

export default function ProductModal({ isOpen, onClose, onAddProduct }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    sku: `NIS-PRD-00${Math.floor(Math.random() * 80) + 10}`,
    name: '',
    category: 'Hardware',
    hsn: '847160',
    purchasePrice: 2000,
    sellingPrice: 3500,
    stock: 25,
    minStock: 10,
    gst: 18,
    unit: 'Pcs',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      ...formData,
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      gst: Number(formData.gst),
      status: Number(formData.stock) > Number(formData.minStock) ? 'In Stock' : (Number(formData.stock) === 0 ? 'Out of Stock' : 'Low Stock'),
    };
    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        style={{ maxWidth: '600px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}>
              <Boxes size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="modal-main-title">Add New Inventory Product</h2>
              <span className="modal-sub-title">Net Infotech System • Item Master Setup</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-scrollable">
            <div className="form-row-2">
              <div className="form-group">
                <label>SKU Code</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="form-input font-mono font-bold"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Software Add-on">Software Add-on</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Services">Services</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Product / Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Wireless Thermal Receipt Printer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>HSN / SAC Code</label>
                <input
                  type="text"
                  value={formData.hsn}
                  onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                  className="form-input font-mono"
                />
              </div>

              <div className="form-group">
                <label>Unit of Measure</label>
                <input
                  type="text"
                  placeholder="e.g. Pcs, Box, User"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Purchase Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="form-input font-bold text-primary"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Initial Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Min. Reorder Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Applicable GST Slab</label>
              <select
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                className="form-select"
              >
                {GST_SLABS.map(s => (
                  <option key={s.rate} value={s.rate}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer-bar">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action">
              <Check size={16} />
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

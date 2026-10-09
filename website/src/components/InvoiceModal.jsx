import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Check, 
  Calendar, 
  Building2, 
  FileText, 
  IndianRupee,
  Percent
} from 'lucide-react';
import { GST_SLABS, INITIAL_CUSTOMERS, INITIAL_PRODUCTS } from '../data/mockData';
import { formatINR } from '../utils/formatters';
import './InvoiceModal.css';

export default function InvoiceModal({ isOpen, onClose, onSaveInvoice }) {
  if (!isOpen) return null;

  // Invoice state
  const [customerName, setCustomerName] = useState(INITIAL_CUSTOMERS[0].name);
  const [customerGstin, setCustomerGstin] = useState(INITIAL_CUSTOMERS[0].gstin);
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra (27) - Intra-State');
  const [isInterState, setIsInterState] = useState(false);
  
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${1025 + Math.floor(Math.random() * 80)}`);
  const [invoiceDate, setInvoiceDate] = useState('2026-10-05');
  const [dueDate, setDueDate] = useState('2026-10-20');

  // Items table state
  const [items, setItems] = useState([
    {
      id: 1,
      product: INITIAL_PRODUCTS[0].name,
      description: 'Annual enterprise license deployment with multi-user access',
      hsn: '998314',
      quantity: 1,
      rate: 28000,
      discount: 5, // %
      taxRate: 18, // %
    },
    {
      id: 2,
      product: INITIAL_PRODUCTS[1].name,
      description: 'Heavy duty thermal printer with USB/Ethernet',
      hsn: '844332',
      quantity: 2,
      rate: 6500,
      discount: 0,
      taxRate: 18,
    }
  ]);

  // Handle Customer Selection
  const handleCustomerChange = (e) => {
    const name = e.target.value;
    setCustomerName(name);
    const found = INITIAL_CUSTOMERS.find(c => c.name === name);
    if (found) {
      setCustomerGstin(found.gstin);
      const isOutside = found.state !== 'Maharashtra';
      setIsInterState(isOutside);
      setPlaceOfSupply(isOutside ? `${found.state} - Inter-State (IGST)` : 'Maharashtra (27) - Intra-State (CGST+SGST)');
    }
  };

  // Add Item
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      product: INITIAL_PRODUCTS[2].name,
      description: 'Standard product dispatch',
      hsn: '847160',
      quantity: 1,
      rate: 3200,
      discount: 0,
      taxRate: 18,
    };
    setItems([...items, newItem]);
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  // Item Field Change
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'product') {
          const prod = INITIAL_PRODUCTS.find(p => p.name === value);
          return {
            ...item,
            product: value,
            rate: prod ? prod.sellingPrice : item.rate,
            hsn: prod ? prod.hsn : item.hsn,
            taxRate: prod ? prod.gst : item.taxRate,
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Auto-calculated totals
  const calculatedData = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const rowDetails = items.map(item => {
      const gross = Number(item.quantity || 0) * Number(item.rate || 0);
      const discAmt = (gross * Number(item.discount || 0)) / 100;
      const taxable = gross - discAmt;
      const taxRate = Number(item.taxRate || 0);
      const taxAmt = (taxable * taxRate) / 100;

      subtotal += gross;
      totalDiscount += discAmt;
      taxableAmount += taxable;

      if (isInterState) {
        totalIgst += taxAmt;
      } else {
        totalCgst += taxAmt / 2;
        totalSgst += taxAmt / 2;
      }

      return {
        ...item,
        gross,
        discAmt,
        taxable,
        taxAmt,
        rowTotal: taxable + taxAmt,
      };
    });

    const totalTax = isInterState ? totalIgst : (totalCgst + totalSgst);
    const grandTotalExact = taxableAmount + totalTax;
    const roundedGrandTotal = Math.round(grandTotalExact);
    const roundOff = roundedGrandTotal - grandTotalExact;

    return {
      rowDetails,
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      roundOff,
      grandTotal: roundedGrandTotal,
    };
  }, [items, isInterState]);

  // Form Submit / Save
  const handleSave = (isPrint = false) => {
    const newTx = {
      id: Date.now(),
      date: new Date(invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      invoiceNo: invoiceNumber,
      party: customerName,
      gstin: customerGstin,
      type: 'Sales',
      amount: calculatedData.grandTotal,
      status: 'Paid',
      dueDate: new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMode: 'Bank NEFT',
      itemsCount: items.length,
    };

    onSaveInvoice(newTx);
    if (isPrint) {
      setTimeout(() => window.print(), 300);
    }
    onClose();
  };

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <FileText size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="modal-main-title">Tax Invoice Creator (GST Compliant)</h2>
              <span className="modal-sub-title">Net Infotech System ERP • Form GSTR-1 Ready</span>
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close invoice modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="modal-body-scrollable">
          
          {/* Top Fields Grid: Customer & Invoice Details */}
          <div className="invoice-meta-grid">
            
            {/* Customer Information */}
            <div className="meta-card">
              <h4 className="meta-card-title">Bill To (Customer Information)</h4>
              
              <div className="form-group">
                <label>Select Customer / Party Name</label>
                <select 
                  value={customerName} 
                  onChange={handleCustomerChange}
                  className="form-select"
                >
                  {INITIAL_CUSTOMERS.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>GSTIN</label>
                  <input 
                    type="text" 
                    value={customerGstin} 
                    onChange={(e) => setCustomerGstin(e.target.value)} 
                    className="form-input font-mono"
                    placeholder="27AAACR1234M1Z2"
                  />
                </div>

                <div className="form-group">
                  <label>Place of Supply</label>
                  <input 
                    type="text" 
                    value={placeOfSupply} 
                    readOnly 
                    className="form-input bg-readonly"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="meta-card">
              <h4 className="meta-card-title">Invoice Credentials</h4>

              <div className="form-group">
                <label>Invoice Number</label>
                <input 
                  type="text" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                  className="form-input font-bold font-mono text-primary"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Invoice Date</label>
                  <input 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)} 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="form-input"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* LINE ITEMS TABLE */}
          <div className="invoice-items-section">
            <div className="items-header-row">
              <h4 className="section-title">Itemized Goods & Services</h4>
              <button 
                type="button" 
                className="btn-add-line-item"
                onClick={handleAddItem}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="table-responsive-container">
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Product / Service</th>
                    <th style={{ width: '12%' }}>HSN/SAC</th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '14%' }}>Rate (₹)</th>
                    <th style={{ width: '10%' }}>Disc %</th>
                    <th style={{ width: '12%' }}>GST %</th>
                    <th style={{ width: '14%' }} className="text-right">Amount (₹)</th>
                    <th style={{ width: '4%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedData.rowDetails.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <select 
                          value={row.product} 
                          onChange={(e) => handleItemChange(row.id, 'product', e.target.value)}
                          className="table-select"
                        >
                          {INITIAL_PRODUCTS.map(p => (
                            <option key={p.sku} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          value={row.description} 
                          onChange={(e) => handleItemChange(row.id, 'description', e.target.value)}
                          placeholder="Optional item notes..."
                          className="table-desc-input"
                        />
                      </td>

                      <td>
                        <input 
                          type="text" 
                          value={row.hsn} 
                          onChange={(e) => handleItemChange(row.id, 'hsn', e.target.value)}
                          className="table-input font-mono"
                        />
                      </td>

                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          value={row.quantity} 
                          onChange={(e) => handleItemChange(row.id, 'quantity', e.target.value)}
                          className="table-input text-center"
                        />
                      </td>

                      <td>
                        <input 
                          type="number" 
                          value={row.rate} 
                          onChange={(e) => handleItemChange(row.id, 'rate', e.target.value)}
                          className="table-input text-right"
                        />
                      </td>

                      <td>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={row.discount} 
                          onChange={(e) => handleItemChange(row.id, 'discount', e.target.value)}
                          className="table-input text-center"
                        />
                      </td>

                      <td>
                        <select 
                          value={row.taxRate} 
                          onChange={(e) => handleItemChange(row.id, 'taxRate', e.target.value)}
                          className="table-select"
                        >
                          {GST_SLABS.map(s => (
                            <option key={s.rate} value={s.rate}>{s.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="text-right font-bold text-main">
                        {formatINR(row.rowTotal)}
                      </td>

                      <td className="text-center">
                        <button 
                          type="button" 
                          className="btn-trash-item"
                          onClick={() => handleRemoveItem(row.id)}
                          disabled={items.length <= 1}
                          title="Remove Row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM TOTALS & TAX BREAKDOWN */}
          <div className="invoice-bottom-layout">
            
            {/* Notes / Terms */}
            <div className="invoice-terms-box">
              <h5 className="terms-title">Terms & Conditions & Bank Details</h5>
              <p className="terms-text">
                1. Goods once sold will not be taken back.<br />
                2. Interest @ 18% p.a. will be charged if payment is not made within due date.<br />
                3. Bank: HDFC Bank | A/c: 50200012345678 | IFSC: HDFC0000123
              </p>
            </div>

            {/* Calculations Card */}
            <div className="invoice-totals-card">
              <div className="totals-row">
                <span>Subtotal (Gross)</span>
                <span>{formatINR(calculatedData.subtotal)}</span>
              </div>

              {calculatedData.totalDiscount > 0 && (
                <div className="totals-row text-success">
                  <span>Less: Total Discount</span>
                  <span>-{formatINR(calculatedData.totalDiscount)}</span>
                </div>
              )}

              <div className="totals-row font-medium">
                <span>Taxable Amount</span>
                <span>{formatINR(calculatedData.taxableAmount)}</span>
              </div>

              {!isInterState ? (
                <>
                  <div className="totals-row text-muted">
                    <span>CGST (Central Tax)</span>
                    <span>{formatINR(calculatedData.totalCgst)}</span>
                  </div>
                  <div className="totals-row text-muted">
                    <span>SGST (State Tax)</span>
                    <span>{formatINR(calculatedData.totalSgst)}</span>
                  </div>
                </>
              ) : (
                <div className="totals-row text-muted">
                  <span>IGST (Integrated Tax)</span>
                  <span>{formatINR(calculatedData.totalIgst)}</span>
                </div>
              )}

              {calculatedData.roundOff !== 0 && (
                <div className="totals-row text-muted" style={{ fontSize: '0.78rem' }}>
                  <span>Round Off</span>
                  <span>{calculatedData.roundOff > 0 ? `+₹${calculatedData.roundOff.toFixed(2)}` : `-₹${Math.abs(calculatedData.roundOff).toFixed(2)}`}</span>
                </div>
              )}

              <div className="totals-row grand-total-row">
                <span>Grand Total (INR)</span>
                <span className="grand-val">{formatINR(calculatedData.grandTotal)}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="modal-footer-bar">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>

          <div className="footer-right-buttons">
            <button 
              type="button" 
              className="btn-secondary-action"
              onClick={() => handleSave(true)}
            >
              <Printer size={15} />
              <span>Save & Print</span>
            </button>

            <button 
              type="button" 
              className="btn-secondary-action"
              onClick={() => {
                alert(`PDF for ${invoiceNumber} downloaded.`);
                handleSave(false);
              }}
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>

            <button 
              type="button" 
              className="btn-primary-action"
              onClick={() => handleSave(false)}
            >
              <Check size={16} />
              <span>Save Invoice</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

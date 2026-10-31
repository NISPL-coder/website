import React from 'react';
import { Receipt, Download, FileText, CheckCircle2 } from 'lucide-react';
import { INITIAL_INVOICES } from '../data/mockDashboardData';

export default function BillingInvoicesSection({ invoices = INITIAL_INVOICES, customer }) {
  const handleDownloadInvoice = (inv) => {
    // Generate simple printable invoice text blob
    const invoiceContent = `
==============================================================
NET INFOTECH SYSTEM PVT. LTD. - OFFICIAL TAX INVOICE
==============================================================
Invoice Number: ${inv.id}
Date: ${inv.date}
Customer Name: ${customer?.name || 'Customer'}
Company Name:  ${customer?.companyName || 'Enterprise'}
GSTIN:         ${customer?.gstNo || '19AAAAA0000A1Z5'}
--------------------------------------------------------------
Service Description:
${inv.service}

Tax Details: ${inv.gstRate} (${inv.taxAmount})
Total Amount: ${inv.totalAmount}
Status: ${inv.status}
Payment Mode: ${inv.paymentMode}
==============================================================
Authorized Tally 5-Star Partner • Net Infotech System Pvt. Ltd.
    `;
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cust-section-card">
      <div className="cust-section-card-header">
        <div className="cust-section-card-title-group">
          <div className="cust-section-card-icon-bubble" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Receipt size={18} />
          </div>
          <div>
            <h3 className="cust-section-title">Invoices & GST Tax Receipts</h3>
            <span className="cust-section-desc">Download valid tax invoices with 18% GST input credit details for your accounts department.</span>
          </div>
        </div>
      </div>

      <div className="cust-table-responsive">
        <table className="cust-dash-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Description</th>
              <th>GST Tax</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-mono font-semibold" style={{ color: '#0284c7' }}>
                  {inv.id}
                </td>
                <td>{inv.date}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{inv.service}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.paymentMode}</span>
                </td>
                <td>
                  <span className="cust-gst-pill">{inv.taxAmount} ({inv.gstRate})</span>
                </td>
                <td className="font-semibold" style={{ color: '#0f172a' }}>
                  {inv.totalAmount}
                </td>
                <td>
                  <span className="cust-status-pill success">
                    <CheckCircle2 size={12} />
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="cust-btn-download-inv"
                    onClick={() => handleDownloadInvoice(inv)}
                    title="Download Tax Invoice"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

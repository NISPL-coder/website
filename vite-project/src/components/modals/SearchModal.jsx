import React, { useState } from 'react';
import { Search, X, FileText, Boxes, Users, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  transactions = [], 
  products = [], 
  onSelectAction 
}) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const filteredTx = transactions.filter(t => 
    t.party.toLowerCase().includes(query.toLowerCase()) ||
    t.invoiceNo.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredProd = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="nis-modal-backdrop" onClick={onClose}>
      <div 
        className="nis-invoice-modal animate-fade-in" 
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Search size={20} color="var(--primary-light)" style={{ marginRight: '12px' }} />
          <input
            type="text"
            autoFocus
            placeholder="Search invoices, products, reports, ledgers (e.g. INV-1024, Cloud, P&L)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', border: 'none', fontSize: '1.05rem', color: 'var(--text-main)', background: 'transparent' }}
          />
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px 20px' }}>
          {/* Quick Actions Shortcuts */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Quick Navigation
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => { onSelectAction('accounting', 'sales'); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.85rem' }}
              >
                <FileText size={16} color="var(--primary-light)" />
                <span>Sales Invoices</span>
              </button>
              <button 
                type="button" 
                onClick={() => { onSelectAction('inventory', 'products'); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.85rem' }}
              >
                <Boxes size={16} color="#7C3AED" />
                <span>Inventory & SKUs</span>
              </button>
              <button 
                type="button" 
                onClick={() => { onSelectAction('reports', 'pl'); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.85rem' }}
              >
                <FileSpreadsheet size={16} color="#10B981" />
                <span>Profit & Loss Statement</span>
              </button>
              <button 
                type="button" 
                onClick={() => { onSelectAction('parties', 'customers'); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.85rem' }}
              >
                <Users size={16} color="#C026D3" />
                <span>Customer Ledger</span>
              </button>
            </div>
          </div>

          {/* Results: Invoices */}
          {filteredTx.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Matching Invoices & Vouchers
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {filteredTx.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => { onSelectAction('accounting', 'sales'); onClose(); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: '#F8FAFC', cursor: 'pointer' }}
                  >
                    <div>
                      <b style={{ color: 'var(--primary-light)', fontFamily: 'monospace' }}>{t.invoiceNo}</b> — <span>{t.party}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{formatINR(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results: Products */}
          {filteredProd.length > 0 && (
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Matching Products in Inventory
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {filteredProd.map(p => (
                  <div 
                    key={p.sku} 
                    onClick={() => { onSelectAction('inventory', 'products'); onClose(); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: '#F8FAFC', cursor: 'pointer' }}
                  >
                    <div>
                      <b style={{ color: '#7C3AED', fontFamily: 'monospace' }}>{p.sku}</b> — <span>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.stock} in stock</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

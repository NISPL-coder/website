import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, exportToCsv } from './exportUtils';

export default function ExportDropdown({
  data = [],
  formatter,
  fileName = 'export_data',
  label = 'Export',
  itemLabel = 'records'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (type) => {
    if (!data || data.length === 0) {
      toast.error('No records available to export.');
      setIsOpen(false);
      return;
    }

    const formattedData = formatter ? formatter(data) : data;
    const dateStamp = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${dateStamp}`;

    try {
      if (type === 'excel') {
        exportToExcel(formattedData, fullFileName);
        toast.success(`Exported ${data.length} ${itemLabel} to Excel (.xlsx)!`, {
          icon: '📊',
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.85rem'
          }
        });
      } else if (type === 'csv') {
        exportToCsv(formattedData, fullFileName);
        toast.success(`Exported ${data.length} ${itemLabel} to CSV (.csv)!`, {
          icon: '📄',
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.85rem'
          }
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="adm-export-dropdown-wrapper"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        className="adm-btn-export"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Export records as CSV or Excel"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 16px',
          borderRadius: '10px',
          border: '1.5px solid #e2e8f0',
          background: '#ffffff',
          color: '#334155',
          fontSize: '0.86rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          height: '38px',
          whiteSpace: 'nowrap'
        }}
      >
        <Download size={15} style={{ color: '#6366f1' }} />
        <span>{label}</span>
        <ChevronDown
          size={14}
          style={{
            color: '#94a3b8',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {isOpen && (
        <div
          className="adm-export-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '210px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(0, 0, 0, 0.04)',
            padding: '6px',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div
            style={{
              padding: '6px 10px 4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '4px'
            }}
          >
            Export Options
          </div>

          {/* Option 1: Excel */}
          <button
            type="button"
            className="adm-export-item"
            onClick={() => handleExport('excel')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileSpreadsheet size={16} style={{ color: '#059669' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                Excel (.xlsx)
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Full formatted sheet
              </span>
            </div>
          </button>

          {/* Option 2: CSV */}
          <button
            type="button"
            className="adm-export-item"
            onClick={() => handleExport('csv')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={16} style={{ color: '#6366f1' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                CSV (.csv)
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Standard comma-separated
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

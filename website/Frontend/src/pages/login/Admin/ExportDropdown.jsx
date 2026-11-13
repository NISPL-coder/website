import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, exportToCsv } from './exportUtils';
import './ExportDropdown.css';

export default function ExportDropdown({
  data = [],
  formatter,
  fileName = 'export_data',
  label = 'Export',
  itemLabel = 'records'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAlign, setMenuAlign] = useState('left');
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

  // Compute smart left/right alignment so it never overflows off-screen
  const checkAlignment = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuWidth = 210;
      // If aligning right would push the menu past the left screen edge
      if (rect.right - menuWidth < 12) {
        setMenuAlign('left');
      } else if (rect.left + menuWidth > window.innerWidth - 12) {
        setMenuAlign('right');
      } else {
        setMenuAlign(window.innerWidth <= 768 ? 'left' : 'right');
      }
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      checkAlignment();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    checkAlignment();
    window.addEventListener('resize', checkAlignment);
    return () => window.removeEventListener('resize', checkAlignment);
  }, [isOpen]);

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
    >
      <button
        type="button"
        className="adm-btn-export"
        onClick={handleToggle}
        title="Export records as CSV or Excel"
      >
        <Download size={15} className="adm-btn-export-icon" />
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`adm-btn-export-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className={`adm-export-menu align-${menuAlign}`}>
          <div className="adm-export-menu-header">
            Export Options
          </div>

          {/* Option 1: Excel */}
          <button
            type="button"
            className="adm-export-item"
            onClick={() => handleExport('excel')}
          >
            <div className="adm-export-item-icon excel">
              <FileSpreadsheet size={16} />
            </div>
            <div className="adm-export-item-text">
              <span className="adm-export-item-title">Excel (.xlsx)</span>
              <span className="adm-export-item-subtitle">Full formatted sheet</span>
            </div>
          </button>

          {/* Option 2: CSV */}
          <button
            type="button"
            className="adm-export-item"
            onClick={() => handleExport('csv')}
          >
            <div className="adm-export-item-icon csv">
              <FileText size={16} />
            </div>
            <div className="adm-export-item-text">
              <span className="adm-export-item-title">CSV (.csv)</span>
              <span className="adm-export-item-subtitle">Standard comma-separated</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

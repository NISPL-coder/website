import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  DollarSign,
  PieChart,
  ChevronDown
} from 'lucide-react';
import { REPORT_P_AND_L, REPORT_BALANCE_SHEET } from '../../data/mockData';
import { formatINR } from '../../utils/formatters';
import './ReportsTab.css';

export default function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState('pl'); // 'pl', 'bs', 'trial', 'gst', 'sales', 'stock'
  const [dateRange, setDateRange] = useState('Current FY 2026-27');
  const [searchFilter, setSearchFilter] = useState('');

  const reportList = [
    { id: 'pl', name: 'Profit & Loss Statement', category: 'Financial' },
    { id: 'bs', name: 'Balance Sheet', category: 'Financial' },
    { id: 'trial', name: 'Trial Balance', category: 'Financial' },
    { id: 'gst', name: 'GST Summary (GSTR-1 & 3B)', category: 'Tax' },
    { id: 'sales', name: 'Sales Register', category: 'Operational' },
    { id: 'purchase', name: 'Purchase Register', category: 'Operational' },
    { id: 'stock', name: 'Stock Valuation & Aging', category: 'Inventory' },
    { id: 'receivables', name: 'Receivables Aging Report', category: 'Parties' },
  ];

  // CSV Export utility
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Report: ${selectedReport.toUpperCase()} - Net Infotech System\n`;
    csvContent += `Period: ${dateRange}\n`;
    csvContent += `Generated On: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    if (selectedReport === 'pl') {
      csvContent += "Category,Item,Amount (INR)\n";
      REPORT_P_AND_L.operatingRevenue.forEach(r => csvContent += `Revenue,"${r.item}",${r.amount}\n`);
      REPORT_P_AND_L.costOfGoodsSold.forEach(r => csvContent += `COGS,"${r.item}",${r.amount}\n`);
      REPORT_P_AND_L.operatingExpenses.forEach(r => csvContent += `Expenses,"${r.item}",${r.amount}\n`);
    } else {
      csvContent += "Category,Particulars,Amount (INR)\n";
      REPORT_BALANCE_SHEET.assets.current.forEach(a => csvContent += `Current Asset,"${a.item}",${a.amount}\n`);
      REPORT_BALANCE_SHEET.liabilities.capital.forEach(l => csvContent += `Capital & Reserves,"${l.item}",${l.amount}\n`);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NIS_Report_${selectedReport}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for P&L
  const totalRevenue = REPORT_P_AND_L.operatingRevenue.reduce((acc, r) => acc + r.amount, 0);
  const totalCOGS = REPORT_P_AND_L.costOfGoodsSold.reduce((acc, r) => acc + r.amount, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = REPORT_P_AND_L.operatingExpenses.reduce((acc, r) => acc + r.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Balance sheet totals
  const totalFixedAssets = REPORT_BALANCE_SHEET.assets.fixed.reduce((acc, a) => acc + a.amount, 0);
  const totalCurrentAssets = REPORT_BALANCE_SHEET.assets.current.reduce((acc, a) => acc + a.amount, 0);
  const totalAssets = totalFixedAssets + totalCurrentAssets;

  const totalCapital = REPORT_BALANCE_SHEET.liabilities.capital.reduce((acc, l) => acc + l.amount, 0);
  const totalCurrentLiab = REPORT_BALANCE_SHEET.liabilities.current.reduce((acc, l) => acc + l.amount, 0);
  const totalLiab = totalCapital + totalCurrentLiab;

  return (
    <div className="nis-reports-wrapper">
      
      {/* Top Selector Grid */}
      <div className="reports-nav-strip">
        {reportList.map(rep => (
          <button
            key={rep.id}
            type="button"
            className={`report-pill-btn ${selectedReport === rep.id ? 'active' : ''}`}
            onClick={() => setSelectedReport(rep.id)}
          >
            <FileSpreadsheet size={15} />
            <span>{rep.name}</span>
          </button>
        ))}
      </div>

      {/* Main Report Card */}
      <div className="nis-report-card">
        
        {/* Report Top Toolbar */}
        <div className="report-toolbar">
          <div className="toolbar-left">
            <h3 className="report-header-title">
              {reportList.find(r => r.id === selectedReport)?.name || 'Financial Statement'}
            </h3>
            <span className="report-header-sub">Net Infotech System ERP • GSTIN: 27AABCU9603R1ZM</span>
          </div>

          <div className="toolbar-right">
            {/* Date Range Selector */}
            <div className="date-selector-box">
              <Calendar size={15} color="var(--primary-light)" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="date-select-dropdown"
              >
                <option value="Current FY 2026-27">Current FY 2026-27</option>
                <option value="Q3 (Oct - Dec 2026)">Q3 (Oct - Dec 2026)</option>
                <option value="September 2026">September 2026</option>
                <option value="Previous FY 2025-26">Previous FY 2025-26</option>
              </select>
            </div>

            {/* Export & Print */}
            <button 
              type="button" 
              className="report-tool-btn"
              onClick={handleExportCSV}
              title="Export as CSV/Excel"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button 
              type="button" 
              className="report-tool-btn"
              onClick={() => window.print()}
              title="Print Document"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Report Content based on selection */}
        <div className="report-view-canvas">
          {selectedReport === 'pl' && (
            <div className="pl-report-content">
              {/* Summary Cards */}
              <div className="pl-summary-strip">
                <div className="pl-summary-box">
                  <span className="pl-box-label">Operating Revenue</span>
                  <span className="pl-box-val text-primary">{formatINR(totalRevenue)}</span>
                </div>
                <div className="pl-summary-box">
                  <span className="pl-box-label">Cost of Goods (COGS)</span>
                  <span className="pl-box-val">{formatINR(totalCOGS)}</span>
                </div>
                <div className="pl-summary-box">
                  <span className="pl-box-label">Gross Profit</span>
                  <span className="pl-box-val text-success">{formatINR(grossProfit)}</span>
                </div>
                <div className="pl-summary-box highlight-box">
                  <span className="pl-box-label">Net Profit (EBITDA)</span>
                  <span className="pl-box-val text-success">{formatINR(netProfit)}</span>
                </div>
              </div>

              {/* Detailed Breakdown Tables */}
              <div className="pl-tables-grid">
                {/* Revenue */}
                <div className="pl-section-box">
                  <h4 className="pl-section-title">Operating Revenue & Sales</h4>
                  <div className="pl-rows-list">
                    {REPORT_P_AND_L.operatingRevenue.map((r, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{r.item}</span>
                        <span className="font-bold">{formatINR(r.amount)}</span>
                      </div>
                    ))}
                    <div className="pl-data-row total-row">
                      <span>Total Revenue</span>
                      <span className="font-bold text-primary">{formatINR(totalRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* COGS */}
                <div className="pl-section-box">
                  <h4 className="pl-section-title">Cost of Goods Sold (Direct Costs)</h4>
                  <div className="pl-rows-list">
                    {REPORT_P_AND_L.costOfGoodsSold.map((r, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{r.item}</span>
                        <span className="font-bold">{formatINR(r.amount)}</span>
                      </div>
                    ))}
                    <div className="pl-data-row total-row">
                      <span>Total COGS</span>
                      <span className="font-bold">{formatINR(totalCOGS)}</span>
                    </div>
                  </div>
                </div>

                {/* Operating Overheads */}
                <div className="pl-section-box full-width">
                  <h4 className="pl-section-title">Administrative & Operating Overheads</h4>
                  <div className="pl-rows-list">
                    {REPORT_P_AND_L.operatingExpenses.map((r, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{r.item}</span>
                        <span className="font-bold">{formatINR(r.amount)}</span>
                      </div>
                    ))}
                    <div className="pl-data-row total-row final-total">
                      <span>Net Operating Profit for Period</span>
                      <span className="font-bold text-success" style={{ fontSize: '1.2rem' }}>
                        {formatINR(netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'bs' && (
            <div className="bs-report-content">
              <div className="bs-split-grid">
                {/* Assets Column */}
                <div className="bs-column">
                  <div className="bs-col-header">
                    <h4>Assets (Application of Funds)</h4>
                    <span className="font-bold text-primary">{formatINR(totalAssets)}</span>
                  </div>
                  
                  <div className="bs-group">
                    <span className="bs-group-title">Fixed & Capital Assets</span>
                    {REPORT_BALANCE_SHEET.assets.fixed.map((a, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{a.item}</span>
                        <span>{formatINR(a.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bs-group">
                    <span className="bs-group-title">Current Assets & Receivables</span>
                    {REPORT_BALANCE_SHEET.assets.current.map((a, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{a.item}</span>
                        <span className="font-bold">{formatINR(a.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities Column */}
                <div className="bs-column">
                  <div className="bs-col-header">
                    <h4>Liabilities (Sources of Funds)</h4>
                    <span className="font-bold text-success">{formatINR(totalLiab)}</span>
                  </div>

                  <div className="bs-group">
                    <span className="bs-group-title">Capital & Reserves</span>
                    {REPORT_BALANCE_SHEET.liabilities.capital.map((l, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{l.item}</span>
                        <span className="font-bold">{formatINR(l.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bs-group">
                    <span className="bs-group-title">Current Liabilities & Provisions</span>
                    {REPORT_BALANCE_SHEET.liabilities.current.map((l, i) => (
                      <div key={i} className="pl-data-row">
                        <span>{l.item}</span>
                        <span>{formatINR(l.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport !== 'pl' && selectedReport !== 'bs' && (
            <div className="gst-report-content">
              <div className="pl-summary-strip">
                <div className="pl-summary-box">
                  <span className="pl-box-label">GSTR-1 Outward Taxable Value</span>
                  <span className="pl-box-val text-primary">₹12,45,000</span>
                </div>
                <div className="pl-summary-box">
                  <span className="pl-box-label">Output CGST + SGST (9%+9%)</span>
                  <span className="pl-box-val">₹2,24,100</span>
                </div>
                <div className="pl-summary-box">
                  <span className="pl-box-label">Eligible Input Tax Credit (ITC 2B)</span>
                  <span className="pl-box-val text-success">₹1,40,760</span>
                </div>
                <div className="pl-summary-box highlight-box">
                  <span className="pl-box-label">Net Tax Payable in Cash (3B)</span>
                  <span className="pl-box-val text-danger">₹83,340</span>
                </div>
              </div>

              <div className="pl-section-box full-width" style={{ marginTop: '20px' }}>
                <h4 className="pl-section-title">Government Portal Reconciliation Status</h4>
                <div className="pl-rows-list">
                  <div className="pl-data-row">
                    <span>E-Invoicing IRP Gateway</span>
                    <span className="badge badge-success">✓ 100% IRN Generated</span>
                  </div>
                  <div className="pl-data-row">
                    <span>E-Way Bill NIC Portal</span>
                    <span className="badge badge-success">✓ Synced & Live</span>
                  </div>
                  <div className="pl-data-row">
                    <span>GSTR-2B vs Vendor Purchase Ledger</span>
                    <span className="badge badge-primary">✓ 98.4% Matched (Auto-claim ITC)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

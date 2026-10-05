import React, { useState } from 'react';
import { TIME_SERIES_ANALYTICS } from '../../data/mockData';
import { formatINR } from '../../utils/formatters';
import { TrendingUp, Calendar, Layers } from 'lucide-react';
import './SalesAnalyticsChart.css';

export default function SalesAnalyticsChart() {
  const [selectedRange, setSelectedRange] = useState('30 Days');
  const [activeSeries, setActiveSeries] = useState('all'); // 'all', 'sales', 'profit', 'purchases'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const ranges = ['7 Days', '30 Days', '3 Months', '6 Months', '1 Year'];
  const data = TIME_SERIES_ANALYTICS[selectedRange] || TIME_SERIES_ANALYTICS['30 Days'];

  // Calculate maximum for scaling
  const maxVal = Math.max(...data.map(d => Math.max(d.sales, d.purchases, d.expenses, d.profit))) * 1.15;

  return (
    <div className="nis-analytics-container">
      {/* Chart Top Header & Filter Controls */}
      <div className="chart-header-row">
        <div>
          <div className="chart-title-wrap">
            <h3 className="chart-title">Sales & Financial Performance</h3>
            <span className="badge badge-primary">
              <TrendingUp size={12} /> Live P&L
            </span>
          </div>
          <p className="chart-sub">Real-time revenue, procurement expenses and EBITDA trajectory</p>
        </div>

        {/* Time filters: 7 Days, 30 Days, 3 Months, 6 Months, 1 Year */}
        <div className="time-filter-pills" role="tablist">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              className={`time-pill ${selectedRange === r ? 'active' : ''}`}
              onClick={() => { setSelectedRange(r); setHoveredIndex(null); }}
              role="tab"
              aria-selected={selectedRange === r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Series Toggles */}
      <div className="chart-legend-row">
        <div className="legend-items">
          <button 
            type="button" 
            className={`legend-pill ${activeSeries === 'all' || activeSeries === 'sales' ? 'active' : 'dimmed'}`}
            onClick={() => setActiveSeries(activeSeries === 'sales' ? 'all' : 'sales')}
          >
            <span className="dot dot-sales" />
            <span>Sales Revenue</span>
          </button>
          <button 
            type="button" 
            className={`legend-pill ${activeSeries === 'all' || activeSeries === 'purchases' ? 'active' : 'dimmed'}`}
            onClick={() => setActiveSeries(activeSeries === 'purchases' ? 'all' : 'purchases')}
          >
            <span className="dot dot-purchases" />
            <span>Purchases</span>
          </button>
          <button 
            type="button" 
            className={`legend-pill ${activeSeries === 'all' || activeSeries === 'expenses' ? 'active' : 'dimmed'}`}
            onClick={() => setActiveSeries(activeSeries === 'expenses' ? 'all' : 'expenses')}
          >
            <span className="dot dot-expenses" />
            <span>Operating Expenses</span>
          </button>
          <button 
            type="button" 
            className={`legend-pill ${activeSeries === 'all' || activeSeries === 'profit' ? 'active' : 'dimmed'}`}
            onClick={() => setActiveSeries(activeSeries === 'profit' ? 'all' : 'profit')}
          >
            <span className="dot dot-profit" />
            <span>Net Profit</span>
          </button>
        </div>

        <div className="range-period-tag">
          <Calendar size={14} />
          <span>Period: {selectedRange}</span>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="chart-visual-area">
        <div className="chart-bars-wrap">
          {data.map((item, idx) => {
            const salesHeight = (item.sales / maxVal) * 100;
            const purchasesHeight = (item.purchases / maxVal) * 100;
            const expensesHeight = (item.expenses / maxVal) * 100;
            const profitHeight = (item.profit / maxVal) * 100;
            const isHovered = hoveredIndex === idx;

            return (
              <div 
                key={idx} 
                className={`chart-bar-column ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar tracks */}
                <div className="bar-track-group">
                  {(activeSeries === 'all' || activeSeries === 'sales') && (
                    <div 
                      className="metric-bar bar-sales" 
                      style={{ height: `${salesHeight}%` }}
                      title={`Sales: ${formatINR(item.sales)}`}
                    />
                  )}
                  {(activeSeries === 'all' || activeSeries === 'purchases') && (
                    <div 
                      className="metric-bar bar-purchases" 
                      style={{ height: `${purchasesHeight}%` }}
                      title={`Purchases: ${formatINR(item.purchases)}`}
                    />
                  )}
                  {(activeSeries === 'all' || activeSeries === 'expenses') && (
                    <div 
                      className="metric-bar bar-expenses" 
                      style={{ height: `${expensesHeight}%` }}
                      title={`Expenses: ${formatINR(item.expenses)}`}
                    />
                  )}
                  {(activeSeries === 'all' || activeSeries === 'profit') && (
                    <div 
                      className="metric-bar bar-profit" 
                      style={{ height: `${profitHeight}%` }}
                      title={`Profit: ${formatINR(item.profit)}`}
                    />
                  )}
                </div>

                {/* X Axis Label */}
                <span className="x-label">{item.label}</span>

                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="chart-tooltip animate-fade-in">
                    <span className="tooltip-title">{item.label} Breakdown</span>
                    <div className="tooltip-row">
                      <span className="tooltip-tag sales">Sales:</span>
                      <span className="tooltip-val">{formatINR(item.sales)}</span>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-tag purchases">Purchases:</span>
                      <span className="tooltip-val">{formatINR(item.purchases)}</span>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-tag expenses">Expenses:</span>
                      <span className="tooltip-val">{formatINR(item.expenses)}</span>
                    </div>
                    <div className="tooltip-row border-top">
                      <span className="tooltip-tag profit">Profit:</span>
                      <span className="tooltip-val font-bold text-success">{formatINR(item.profit)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

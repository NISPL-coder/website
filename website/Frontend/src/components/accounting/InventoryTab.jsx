import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowUpDown,
  Filter,
  PackageCheck
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import './InventoryTab.css';

export default function InventoryTab({ products, onAddProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hsn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Summary counts
  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter(p => p.status === 'Out of Stock').length;

  return (
    <div className="nis-inventory-view">
      
      {/* Inventory KPI Badges */}
      <div className="inventory-kpi-grid">
        <div className="inventory-kpi-card">
          <div className="kpi-icon-wrap bg-blue">
            <Boxes size={20} />
          </div>
          <div>
            <span className="kpi-label">Total SKUs Active</span>
            <span className="kpi-val">{products.length} Products</span>
            <span className="kpi-sub">{totalStockItems} total units in stock</span>
          </div>
        </div>

        <div className="inventory-kpi-card">
          <div className="kpi-icon-wrap bg-yellow">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="kpi-label">Low Stock Alerts</span>
            <span className="kpi-val text-warning">{lowStockCount} Items</span>
            <span className="kpi-sub">Below minimum reorder threshold</span>
          </div>
        </div>

        <div className="inventory-kpi-card">
          <div className="kpi-icon-wrap bg-red">
            <XCircle size={20} />
          </div>
          <div>
            <span className="kpi-label">Out of Stock</span>
            <span className="kpi-val text-danger">{outOfStockCount} Items</span>
            <span className="kpi-sub">Immediate vendor PO required</span>
          </div>
        </div>

        <div className="inventory-kpi-card">
          <div className="kpi-icon-wrap bg-green">
            <PackageCheck size={20} />
          </div>
          <div>
            <span className="kpi-label">Stock Valuation</span>
            <span className="kpi-val text-success">
              {formatINR(products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0))}
            </span>
            <span className="kpi-sub">At weighted average cost</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="nis-inventory-card">
        {/* Table Header Block */}
        <div className="inv-header-block">
          <div>
            <h3 className="inv-title">Product & Stock Master</h3>
            <p className="inv-sub">Manage SKUs, HSN codes, purchase/sales pricing and multi-warehouse replenishment</p>
          </div>

          <button 
            type="button" 
            className="btn-add-product"
            onClick={onAddProduct}
          >
            <Plus size={16} />
            <span>+ Add New Product</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="inv-controls-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or HSN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-group">
            <div className="filter-select-wrapper">
              <label className="filter-label">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-select-wrapper">
              <label className="filter-label">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-responsive-container">
          <table className="nis-data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>HSN / SAC</th>
                <th className="text-right">Purchase (₹)</th>
                <th className="text-right">Selling (₹)</th>
                <th className="text-center">Stock Level</th>
                <th className="text-center">Min. Stock</th>
                <th className="text-center">GST %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stockRatio = p.minStock > 0 ? (p.stock / (p.minStock * 2)) * 100 : 100;
                const progressWidth = Math.min(Math.max(stockRatio, 5), 100);

                let statusBadgeClass = 'status-in-stock';
                let barClass = 'bar-healthy';
                if (p.status === 'Low Stock') {
                  statusBadgeClass = 'status-low-stock';
                  barClass = 'bar-warning';
                } else if (p.status === 'Out of Stock') {
                  statusBadgeClass = 'status-out-of-stock';
                  barClass = 'bar-danger';
                }

                return (
                  <tr key={p.sku} className="nis-table-row">
                    <td>
                      <span className="sku-code">{p.sku}</span>
                    </td>
                    <td>
                      <div className="product-title-cell">
                        <span className="p-name">{p.name}</span>
                        {p.unit && <span className="p-unit">Unit: {p.unit}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="cat-badge">{p.category}</span>
                    </td>
                    <td>
                      <span className="hsn-tag">{p.hsn}</span>
                    </td>
                    <td className="text-right font-medium">
                      {formatINR(p.purchasePrice)}
                    </td>
                    <td className="text-right font-bold text-main">
                      {formatINR(p.sellingPrice)}
                    </td>
                    <td className="text-center">
                      <div className="stock-visual-bar-wrap">
                        <div className="stock-numbers-row">
                          <span className="stock-qty-val font-bold">{p.stock}</span>
                          <span className="stock-unit-sub">{p.unit || 'units'}</span>
                        </div>
                        <div className="stock-track">
                          <div 
                            className={`stock-fill ${barClass}`} 
                            style={{ width: `${p.stock === 0 ? 0 : progressWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-muted font-medium">
                      {p.minStock}
                    </td>
                    <td className="text-center font-bold text-secondary">
                      {p.gst}%
                    </td>
                    <td>
                      <span className={`inv-status-pill ${statusBadgeClass}`}>
                        {p.status === 'In Stock' && <CheckCircle size={12} />}
                        {p.status === 'Low Stock' && <AlertTriangle size={12} />}
                        {p.status === 'Out of Stock' && <XCircle size={12} />}
                        <span>{p.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

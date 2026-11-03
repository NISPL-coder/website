import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  Search,
  RefreshCw,
  Code2,
  Copy,
  Check,
  X,
  Shield,
  Globe,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import DateRangeFilter from './DateRangeFilter';
import { usePermissions } from './PermissionsContext';
import { activityLogApi } from '../../../services/activityLogApi';
import './ActivityLogsSection.css';

/* ------------------------------------------------------------------ *
 * Changes payload -> before/after diff
 * ------------------------------------------------------------------ */

/** Normalizes the various `changes` payload shapes into { before, after, meta }. */
function buildDiff(changes) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    return { before: {}, after: {}, meta: {} };
  }

  // Explicit before/after objects (permission updates)
  if (
    changes.before &&
    changes.after &&
    typeof changes.before === 'object' &&
    typeof changes.after === 'object'
  ) {
    const { before, after, ...meta } = changes;
    return { before, after, meta };
  }

  // Deletion: the whole record is the previous state
  if (changes.deletedStaff && typeof changes.deletedStaff === 'object') {
    const { deletedStaff, ...meta } = changes;
    return { before: deletedStaff, after: {}, meta };
  }

  // previousX / newX pairs (status toggles)
  const before = {};
  const after = {};
  const meta = {};
  let paired = false;

  Object.entries(changes).forEach(([key, value]) => {
    const prevMatch = key.match(/^previous([A-Z]\w*)$/);
    if (prevMatch) {
      const field = prevMatch[1].charAt(0).toLowerCase() + prevMatch[1].slice(1);
      before[field] = value;
      const newKey = `new${prevMatch[1]}`;
      if (newKey in changes) {
        after[field] = changes[newKey];
        paired = true;
      }
      return;
    }

    const nextMatch = key.match(/^new([A-Z]\w*)$/);
    if (nextMatch) {
      const field = nextMatch[1].charAt(0).toLowerCase() + nextMatch[1].slice(1);
      if (`previous${nextMatch[1]}` in changes) return;
      after[field] = value;
      paired = true;
      return;
    }

    meta[key] = value;
  });

  if (paired) return { before, after, meta };

  // Creation: everything present is new
  return { before: {}, after: changes, meta: {} };
}

/** Classifies every key across both sides as added / removed / modified / unchanged. */
function classifyDiffRows(before, after) {
  const keys = [...Object.keys(before), ...Object.keys(after).filter((k) => !(k in before))];

  return keys.map((key) => {
    const hasBefore = key in before;
    const hasAfter = key in after;
    let kind = 'unchanged';
    if (hasBefore && !hasAfter) kind = 'removed';
    else if (!hasBefore && hasAfter) kind = 'added';
    else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) kind = 'modified';
    return { key, kind, beforeValue: before[key], afterValue: after[key] };
  });
}

const formatDiffValue = (value) => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (Array.isArray(value) && value.every((item) => typeof item !== 'object')) {
    return `[${value.map((item) => JSON.stringify(item)).join(', ')}]`;
  }
  return JSON.stringify(value);
};

const humanizeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function ActivityLogsSection() {
  const { visibleColumns } = usePermissions();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalLogs: 0, todayLogs: 0, uniqueAdminsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Inspect Modal State
  const [inspectLog, setInspectLog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const inspectDiff = useMemo(() => {
    if (!inspectLog) return null;
    const { before, after, meta } = buildDiff(inspectLog.changes);
    const rows = classifyDiffRows(before, after);
    return { before, after, meta, rows, changedRows: rows.filter((row) => row.kind !== 'unchanged') };
  }, [inspectLog]);

  const openInspect = (log) => {
    setShowRawJson(false);
    setCopied(false);
    setInspectLog(log);
  };

  // Manage Body Scroll Lock & Escape Key for Inspect Modal
  useEffect(() => {
    if (!inspectLog) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setInspectLog(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inspectLog]);

  // Fetch Live Activity Logs
  const loadLogs = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      const data = await activityLogApi.getActivityLogs({
        limit: 100,
        startDate: dateFrom ? new Date(`${dateFrom}T00:00:00`).toISOString() : undefined,
        endDate: dateTo ? new Date(`${dateTo}T23:59:59.999`).toISOString() : undefined
      });

      if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
      if (data && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch activity logs.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Copy JSON changes to clipboard
  const handleCopyJson = () => {
    if (!inspectLog) return;
    try {
      const jsonStr = JSON.stringify(inspectLog.changes || {}, null, 2);
      navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      toast.success('JSON changes payload copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy JSON.');
    }
  };

  // Filter logs based on search and category
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const adminName = (log.adminName || '').toLowerCase();
      const adminEmail = (log.adminEmail || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      const ip = (log.ipAddress || '').toLowerCase();
      const resource = (log.resource || '').toLowerCase();

      const matchesQuery =
        !q ||
        adminName.includes(q) ||
        adminEmail.includes(q) ||
        action.includes(q) ||
        details.includes(q) ||
        ip.includes(q) ||
        resource.includes(q);

      const matchesCat =
        categoryFilter === 'all' ||
        (log.category || 'general').toLowerCase() === categoryFilter.toLowerCase();

      return matchesQuery && matchesCat;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [logs, searchQuery, categoryFilter]);

  // Format Date & Time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(dateStr);
    }
  };

  // Action badge style selector
  const getActionBadgeClass = (category, action = '') => {
    const act = action.toUpperCase();
    if (act.includes('STAFF') || category === 'staff') return 'act-badge-staff';
    if (act.includes('CUSTOMER') || category === 'customer') return 'act-badge-customer';
    if (act.includes('AUTH') || act.includes('LOGIN') || act.includes('PASSWORD') || category === 'auth')
      return 'act-badge-auth';
    return 'act-badge-general';
  };

  // React DataTable Columns
  const columns = useMemo(
    () => [
      {
        id: 'admin',
        name: 'Admin',
        selector: (row) => row.adminName,
        sortable: true,
        minWidth: '220px',
        grow: 1.2,
        cell: (row) => {
          const roleLower = (row.adminRole || 'admin').toLowerCase();
          return (
            <div className="act-admin-cell">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="act-admin-name">{row.adminName || 'System Admin'}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    background:
                      roleLower === 'admin'
                        ? '#fee2e2'
                        : roleLower === 'manager'
                        ? '#fef3c7'
                        : '#e0f2fe',
                    color:
                      roleLower === 'admin'
                        ? '#dc2626'
                        : roleLower === 'manager'
                        ? '#d97706'
                        : '#0284c7'
                  }}
                >
                  {row.adminRole || 'Admin'}
                </span>
              </div>
              <span className="act-admin-email">{row.adminEmail}</span>
            </div>
          );
        }
      },
      {
        id: 'action',
        name: 'Action',
        selector: (row) => row.action,
        sortable: true,
        minWidth: '180px',
        grow: 1,
        cell: (row) => (
          <span className={`act-action-badge ${getActionBadgeClass(row.category, row.action)}`}>
            {row.action}
          </span>
        )
      },
      {
        id: 'details',
        name: 'Details / Event',
        selector: (row) => row.details,
        sortable: true,
        minWidth: '280px',
        grow: 2,
        cell: (row) => (
          <div className="act-details-cell">
            {row.details}
          </div>
        )
      },
      {
        id: 'ipAddress',
        name: 'IP Address',
        selector: (row) => row.ipAddress,
        sortable: true,
        minWidth: '150px',
        grow: 0.8,
        cell: (row) => (
          <span className="act-ip-badge">
            <Globe size={11} style={{ color: '#64748b' }} />
            {row.ipAddress || '127.0.0.1'}
          </span>
        )
      },
      {
        id: 'createdAt',
        name: 'Timestamp',
        selector: (row) => new Date(row.createdAt).getTime(),
        sortable: true,
        minWidth: '180px',
        grow: 1,
        cell: (row) => (
          <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
            {formatDateTime(row.createdAt)}
          </span>
        )
      },
      {
        id: 'changes',
        name: 'Changes Data',
        sortable: false,
        minWidth: '160px',
        grow: 0.8,
        searchable: false,
        center: true,
        cell: (row) => (
          <button
            type="button"
            className="act-inspect-btn"
            onClick={() => openInspect(row)}
            title="Inspect audit changes JSON"
          >
            <Code2 size={13} />
            <span>Inspect JSON</span>
          </button>
        )
      }
    ],
    []
  );

  return (
    <div className="act-section-wrapper animate-fade-in">
      {/* Top Header */}
      <div className="act-header-bar">
        <div className="act-header-left">
          <div className="act-header-icon-box">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="act-header-title">Activity Logs & Audit Trail</h1>
            <p className="act-header-subtitle">
              Live audit stream of administrative actions, user access changes, and IP telemetry
            </p>
          </div>
        </div>

        <button
          type="button"
          className="act-refresh-btn"
          onClick={() => loadLogs(true)}
          disabled={isRefreshing}
        >
          <RefreshCw size={15} className={isRefreshing ? 'usr-spinner' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
        </button>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="act-stats-grid">
        <div className="act-stat-card">
          <div className="act-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Layers size={19} />
          </div>
          <div>
            <div className="act-stat-value">{stats.totalLogs || logs.length}</div>
            <div className="act-stat-label">Total Audit Events</div>
          </div>
        </div>

        <div className="act-stat-card">
          <div className="act-stat-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Calendar size={19} />
          </div>
          <div>
            <div className="act-stat-value">{stats.todayLogs || 0}</div>
            <div className="act-stat-label">Actions Today</div>
          </div>
        </div>

        <div className="act-stat-card">
          <div className="act-stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <User size={19} />
          </div>
          <div>
            <div className="act-stat-value">{stats.uniqueAdminsCount || 1}</div>
            <div className="act-stat-label">Active Administrators</div>
          </div>
        </div>

        <div className="act-stat-card">
          <div className="act-stat-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <Server size={19} />
          </div>
          <div>
            <div className="act-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'inline-block'
                }}
              />
              Live
            </div>
            <div className="act-stat-label">Audit Engine Active</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="act-toolbar">
        <div className="act-search-box">
          <Search size={16} className="act-search-icon" />
          <input
            type="text"
            className="act-search-input"
            placeholder="Search by admin name, email, action, details, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DateRangeFilter
            from={dateFrom}
            to={dateTo}
            onChange={(nextFrom, nextTo) => {
              setDateFrom(nextFrom);
              setDateTo(nextTo);
            }}
          />

          <select
            className="act-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="staff">Staff & User Access</option>
            <option value="customer">Customer Records</option>
            <option value="auth">Authentication & Security</option>
            <option value="general">System Events</option>
          </select>
        </div>
      </div>

      {/* Main React DataTable */}
      <div className="act-table-card">
        <AdminDataTable
          columns={visibleColumns('activity_logs', columns)}
          data={filteredLogs}
          keyField="id"
          defaultSortFieldId="createdAt"
          defaultSortAsc={false}
          pagination={true}
          paginationPerPage={8}
          paginationRowsPerPageOptions={[8, 15, 25, 50]}
          progressPending={isLoading}
          noDataMessage={
            dateFrom || dateTo
              ? 'No activity logs in the selected date range.'
              : 'No activity logs found.'
          }
          noDataHint={
            dateFrom || dateTo
              ? 'Widen the date range or clear the filter to see more events.'
              : 'Try adjusting your search criteria or filter options.'
          }
          scrollHeight="600px"
        />
      </div>

      {/* =========================================================================
         INSPECT JSON CHANGES MODAL (PORTALED TO DOCUMENT.BODY)
         ========================================================================= */}
      {inspectLog && typeof document !== 'undefined' && createPortal(
        <div className="act-modal-backdrop" onClick={() => setInspectLog(null)}>
          <div className="act-inspect-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="act-inspect-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`act-action-badge ${getActionBadgeClass(inspectLog.category, inspectLog.action)}`}>
                  {inspectLog.action}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: inspectLog.status === 'failed' ? '#fee2e2' : inspectLog.status === 'warning' ? '#fef3c7' : '#dcfce7',
                    color: inspectLog.status === 'failed' ? '#dc2626' : inspectLog.status === 'warning' ? '#d97706' : '#16a34a',
                    textTransform: 'uppercase'
                  }}
                >
                  {inspectLog.status || 'success'}
                </span>
              </div>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => setInspectLog(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Metadata Info Grid */}
            <div className="act-inspect-meta-grid">
              <div className="act-inspect-meta-item">
                <div className="act-inspect-meta-label">Performed By</div>
                <div className="act-inspect-meta-val">
                  {inspectLog.adminName} ({inspectLog.adminRole?.toUpperCase()})
                </div>
              </div>

              <div className="act-inspect-meta-item">
                <div className="act-inspect-meta-label">Admin Email</div>
                <div className="act-inspect-meta-val">{inspectLog.adminEmail}</div>
              </div>

              <div className="act-inspect-meta-item">
                <div className="act-inspect-meta-label">Client IP Address</div>
                <div className="act-inspect-meta-val" style={{ fontFamily: 'monospace' }}>
                  {inspectLog.ipAddress || '127.0.0.1'}
                </div>
              </div>

              <div className="act-inspect-meta-item">
                <div className="act-inspect-meta-label">Timestamp</div>
                <div className="act-inspect-meta-val">{formatDateTime(inspectLog.createdAt)}</div>
              </div>
            </div>

            {/* Body */}
            <div className="act-inspect-body">
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Event Description
                </div>
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {inspectLog.details}
                </div>
              </div>

              <div>
                <div className="act-diff-heading-row">
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    Changes Data (Previous vs Updated)
                  </div>
                  <button
                    type="button"
                    className="act-raw-toggle"
                    onClick={() => setShowRawJson((prev) => !prev)}
                  >
                    {showRawJson ? 'Show Diff View' : 'Show Raw JSON'}
                  </button>
                </div>

                {!showRawJson && inspectDiff && (
                  <>
                    {inspectDiff.changedRows.length === 0 ? (
                      <div className="act-diff-empty">
                        No field-level changes were recorded for this event.
                      </div>
                    ) : (
                      <div className="act-diff-summary">
                        {inspectDiff.changedRows.map((row) => (
                          <span key={row.key} className={`act-diff-chip ${row.kind}`}>
                            <strong>{humanizeKey(row.key)}</strong>
                            {row.kind === 'modified' && (
                              <>
                                <em>{formatDiffValue(row.beforeValue)}</em>
                                <span className="act-diff-arrow">→</span>
                                <em>{formatDiffValue(row.afterValue)}</em>
                              </>
                            )}
                            {row.kind === 'added' && <em>{formatDiffValue(row.afterValue)}</em>}
                            {row.kind === 'removed' && <em>{formatDiffValue(row.beforeValue)}</em>}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="act-diff-grid">
                      <div className="act-diff-panel">
                        <div className="act-diff-panel-head">
                          <span>Previous Data</span>
                          <span className="act-diff-panel-tag removed">before</span>
                        </div>
                        <div className="act-diff-lines">
                          {inspectDiff.rows.map((row) => (
                            <div
                              key={row.key}
                              className={`act-diff-line ${
                                row.kind === 'removed' || row.kind === 'modified' ? row.kind : 'neutral'
                              }`}
                            >
                              <span className="act-diff-sign">
                                {row.kind === 'removed' ? '-' : row.kind === 'modified' ? '~' : ' '}
                              </span>
                              <span className="act-diff-key">"{row.key}"</span>
                              <span className="act-diff-sep">: </span>
                              <span className="act-diff-val">
                                {row.kind === 'added'
                                  ? '(not set)'
                                  : formatDiffValue(row.beforeValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="act-diff-panel">
                        <div className="act-diff-panel-head">
                          <span>Changed Data</span>
                          <span className="act-diff-panel-tag added">after</span>
                        </div>
                        <div className="act-diff-lines">
                          {inspectDiff.rows.map((row) => (
                            <div
                              key={row.key}
                              className={`act-diff-line ${
                                row.kind === 'added' || row.kind === 'modified' ? row.kind : 'neutral'
                              }`}
                            >
                              <span className="act-diff-sign">
                                {row.kind === 'added' ? '+' : row.kind === 'modified' ? '~' : ' '}
                              </span>
                              <span className="act-diff-key">"{row.key}"</span>
                              <span className="act-diff-sep">: </span>
                              <span className="act-diff-val">
                                {row.kind === 'removed' ? '(deleted)' : formatDiffValue(row.afterValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {Object.keys(inspectDiff.meta).length > 0 && (
                      <div className="act-diff-meta">
                        {Object.entries(inspectDiff.meta).map(([key, value]) => (
                          <span key={key} className="act-diff-meta-item">
                            <strong>{humanizeKey(key)}</strong>
                            <span>{formatDiffValue(value)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {showRawJson && (
                  <div className="act-json-container">
                    <button type="button" className="act-copy-btn" onClick={handleCopyJson}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(inspectLog.changes || {}, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="usr-modal-footer">
              <button
                type="button"
                className="usr-btn-primary"
                onClick={() => setInspectLog(null)}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


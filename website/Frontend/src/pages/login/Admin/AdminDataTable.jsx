import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DataTable from 'react-data-table-component';
import { ArrowUp, SearchX, Loader2 } from 'lucide-react';
import './AdminDataTable.css';

const TOOLTIP_MAX_WIDTH = 384;
const TOOLTIP_HOVER_DELAY = 200;
const TOOLTIP_EDGE_GAP = 8;
const TOOLTIP_ROW_GAP = 10;

const isActionColumn = (column) => {
  const id = String(column.id ?? '').toLowerCase();
  const name = typeof column.name === 'string' ? column.name.toLowerCase() : '';
  return column.omit || id.includes('action') || name.includes('action');
};

const formatTipValue = (value) => {
  if (value == null || value === '') return '—';
  if (value instanceof Date) return value.toLocaleString('en-IN');
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const getRowValue = (column, row) => {
  if (typeof column.selector === 'function') {
    try {
      return column.selector(row);
    } catch {
      return undefined;
    }
  }
  return row?.[column.id];
};

/** Unique, sorted values for a column rendered as a search dropdown. */
const getColumnOptions = (column, data) => {
  if (Array.isArray(column.searchOptions)) return column.searchOptions;

  const values = new Map();
  data.forEach((row) => {
    const raw = getRowValue(column, row);
    if (raw == null || raw === '' || typeof raw === 'object') return;
    const text = String(raw);
    values.set(text, text);
  });

  return [...values.values()]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((value) => ({ value, label: value }));
};

/**
 * Shared, premium wrapper around react-data-table-component.
 *
 * Handles the visual theme, fixed-height scrolling body, pagination,
 * empty/loading states and the inline per-column filter row.
 *
 * Add `searchType: 'select'` (optionally with `searchOptions`) to a column to
 * render its column search as a dropdown instead of a free-text input.
 * Add `searchable: false` to opt a column out of the filter row.
 *
 * Hovering a data row lifts it and opens an anchored popup with the complete
 * row data. While a row action menu (RowActionMenu) is open, the hover lift
 * and popup are suppressed until that menu closes.
 */
export default function AdminDataTable({
  columns,
  data = [],
  keyField = 'id',
  defaultSortFieldId,
  defaultSortAsc = true,
  pagination = true,
  paginationPerPage = 8,
  paginationRowsPerPageOptions = [8, 15, 25, 50],
  paginationOptions,
  fixedHeader = true,
  scrollHeight = 'clamp(260px, 42vh, 430px)',
  persistTableHead = true,
  noDataMessage = 'No records found.',
  noDataHint = 'Try adjusting your search or filters.',
  progressPending = false,
  dense = false,
  onRowClicked,
  rowClickable = false,
  resetPageToken,
  minWidth = 1000,
  ariaLabel = 'Data table',
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState({});
  const [rowTip, setRowTip] = useState(null); // { row, rowEl }
  const [tipSize, setTipSize] = useState({ width: 0, height: 0 });
  const [positionTick, setPositionTick] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const hoverTimerRef = useRef(null);
  const hoveredRowKeyRef = useRef(null);
  const tableWrapRef = useRef(null);
  const tipRef = useRef(null);
  const actionMenuOpenRef = useRef(false);

  useEffect(
    () => () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    },
    []
  );

  const clearRowTip = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    hoveredRowKeyRef.current = null;
    setRowTip(null);
  }, []);

  // RowActionMenu broadcasts its open state; while open, row hover is disabled.
  useEffect(() => {
    const handleMenuToggle = (event) => {
      const detail = event.detail || {};
      const targetsThisTable = !detail.table || detail.table === tableWrapRef.current;
      const open = Boolean(detail.open) && targetsThisTable;
      actionMenuOpenRef.current = open;
      setActionMenuOpen(open);
      if (open) clearRowTip();
    };
    window.addEventListener('nispl_row_action_menu', handleMenuToggle);
    return () => window.removeEventListener('nispl_row_action_menu', handleMenuToggle);
  }, [clearRowTip]);

  // Keep the anchored popup glued to its row while scrolling or resizing.
  useEffect(() => {
    if (!rowTip) return undefined;
    const reposition = () => setPositionTick((tick) => tick + 1);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [rowTip]);

  // Return to the first page whenever the parent search or filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [resetPageToken]);

  // Column filters also reset pagination.
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const handleColumnFilter = useCallback((columnId, value) => {
    setColumnFilters((previous) => {
      if (!value) {
        if (!(columnId in previous)) return previous;
        const next = { ...previous };
        delete next[columnId];
        return next;
      }
      if (previous[columnId] === value) return previous;
      return { ...previous, [columnId]: value };
    });
  }, []);

  const activeFilters = useMemo(
    () => Object.entries(columnFilters).filter(([, value]) => value !== ''),
    [columnFilters]
  );

  const filteredData = useMemo(() => {
    if (!activeFilters.length) return data;

    return data.filter((row) =>
      activeFilters.every(([columnId, query]) => {
        const column = columns.find((item) => String(item.id) === columnId);
        if (!column) return true;

        const raw = getRowValue(column, row);
        if (raw == null) return false;

        const value = String(raw);
        return column.searchType === 'select'
          ? value === query
          : value.toLowerCase().includes(query.toLowerCase());
      })
    );
  }, [data, columns, activeFilters]);

  // Show a full-row detail popup when hovering a data row (body rows have id="row-<keyField>").
  const handleTableMouseOver = useCallback(
    (event) => {
      if (actionMenuOpenRef.current) {
        clearRowTip();
        return;
      }

      const rowEl = event.target.closest?.('div[id^="row-"]');
      if (!rowEl || !tableWrapRef.current?.contains(rowEl)) {
        clearRowTip();
        return;
      }

      const key = rowEl.id.slice('row-'.length);
      if (hoveredRowKeyRef.current === key) return;

      const row = filteredData.find((item) => String(item[keyField]) === key);
      if (!row) {
        clearRowTip();
        return;
      }

      hoveredRowKeyRef.current = key;
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => {
        setRowTip({ row, rowEl });
      }, TOOLTIP_HOVER_DELAY);
    },
    [filteredData, keyField, clearRowTip]
  );

  // Dynamically calculate the minimum width required so columns NEVER overflow/squish
  const calculatedMinWidth = useMemo(() => {
    let total = 0;
    (columns || []).forEach((col) => {
      if (col.omit) return;
      const w = col.width || col.minWidth;
      if (w) {
        const num = parseFloat(w);
        total += isNaN(num) ? 140 : num;
      } else {
        total += 140;
      }
    });
    return Math.max(total + 80, Number(minWidth) || 1000);
  }, [columns, minWidth]);

  const tipItems = useMemo(() => {
    if (!rowTip) return [];
    return columns
      .filter((column) => !isActionColumn(column))
      .map((column) => {
        const label =
          typeof column.name === 'string' || typeof column.name === 'number'
            ? String(column.name)
            : String(column.id ?? '');
        return { label, value: formatTipValue(getRowValue(column, rowTip.row)) };
      });
  }, [rowTip, columns]);

  useLayoutEffect(() => {
    if (rowTip && tipRef.current) {
      const rect = tipRef.current.getBoundingClientRect();
      setTipSize({ width: rect.width, height: rect.height });
    }
  }, [rowTip, tipItems, positionTick]);

  const tipStyle = useMemo(() => {
    if (!rowTip || !tipItems.length || !rowTip.rowEl) return null;
    const rect = rowTip.rowEl.getBoundingClientRect();
    const width = Math.min(TOOLTIP_MAX_WIDTH, Math.max(tipSize.width, 240));
    const height =
      tipSize.height || Math.min(tipItems.length * 24 + 52, window.innerHeight * 0.6);

    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(TOOLTIP_EDGE_GAP, Math.min(left, window.innerWidth - width - TOOLTIP_EDGE_GAP));

    let top = rect.top - height - TOOLTIP_ROW_GAP;
    if (top < TOOLTIP_EDGE_GAP) {
      top = rect.bottom + TOOLTIP_ROW_GAP;
    }
    top = Math.max(TOOLTIP_EDGE_GAP, Math.min(top, window.innerHeight - height - TOOLTIP_EDGE_GAP));

    return { left, top, maxWidth: TOOLTIP_MAX_WIDTH };
  }, [rowTip, tipItems, tipSize, positionTick]);

  const searchableColumns = useMemo(
    () => (columns || []).map((column) => {
      const columnId = String(column.id ?? column.name ?? '');
      const isActionCol =
        columnId.toLowerCase().includes('action') ||
        (typeof column.name === 'string' && column.name.toLowerCase().includes('action'));
      const canSearch =
        column.searchable !== false && !column.omit && !isActionCol;

      if (!canSearch) {
        if (isActionCol) {
          return {
            ...column,
            button: true,
            allowOverflow: true,
            searchable: false,
          };
        }
        return column;
      }

      const label =
        typeof column.name === 'string' || typeof column.name === 'number'
          ? String(column.name)
          : columnId;
      const value = columnFilters[columnId] ?? '';
      const stopPropagation = (event) => event.stopPropagation();

      const control =
        column.searchType === 'select' ? (
          <select
            className="adm-col-search adm-col-search-select"
            value={value}
            onChange={(event) => handleColumnFilter(columnId, event.target.value)}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            onDoubleClick={stopPropagation}
            onKeyDown={stopPropagation}
            aria-label={`Filter ${label}`}
          >
            <option value="">All</option>
            {getColumnOptions(column, data).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="adm-col-search"
            placeholder="Search..."
            value={value}
            onChange={(event) => handleColumnFilter(columnId, event.target.value)}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            onDoubleClick={stopPropagation}
            onKeyDown={stopPropagation}
            aria-label={`Search ${label}`}
          />
        );

      return {
        ...column,
        name: (
          <div className="adm-col-head">
            <span className="adm-col-head-label">{column.name}</span>
            {control}
          </div>
        ),
      };
    }),
    [columns, columnFilters, data, handleColumnFilter]
  );

  const noDataComponent = (
    <div className="admin-datatable-empty">
      <span className="admin-datatable-empty-icon">
        <SearchX size={22} />
      </span>
      <div className="admin-datatable-empty-title">{noDataMessage}</div>
      <div className="admin-datatable-empty-hint">{noDataHint}</div>
    </div>
  );

  const progressComponent = (
    <div className="admin-datatable-loading">
      <Loader2 size={22} className="admin-datatable-spinner" />
      <span>Loading records…</span>
    </div>
  );

  return (
    <div
      ref={tableWrapRef}
      className={`admin-datatable${actionMenuOpen ? ' action-menu-open' : ''}`}
      style={{ '--admin-datatable-min-width': `${calculatedMinWidth}px` }}
      onMouseOver={handleTableMouseOver}
      onMouseLeave={clearRowTip}
    >
      <DataTable
        columns={searchableColumns}
        data={filteredData}
        keyField={keyField}
        className="admin-datatable-inner"
        ariaLabel={ariaLabel}
        defaultSortFieldId={defaultSortFieldId}
        defaultSortAsc={defaultSortAsc}
        sortIcon={<ArrowUp size={14} strokeWidth={2.4} />}
        pagination={pagination}
        paginationPerPage={paginationPerPage}
        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
        paginationComponentOptions={{
          rowsPerPageText: 'Rows per page',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: false,
          ...paginationOptions,
        }}
        paginationPage={currentPage}
        onChangePage={setCurrentPage}
        onChangeRowsPerPage={() => setCurrentPage(1)}
        paginationPosition="bottom"
        fixedHeader={fixedHeader}
        fixedHeaderScrollHeight={scrollHeight}
        persistTableHead={persistTableHead}
        responsive
        dense={dense}
        highlightOnHover
        pointerOnHover={rowClickable}
        onRowClicked={onRowClicked}
        noDataComponent={noDataComponent}
        progressPending={progressPending}
        progressComponent={progressComponent}
      />

      {rowTip &&
        tipStyle &&
        createPortal(
          <div ref={tipRef} className="adm-row-tooltip" style={tipStyle} role="tooltip">
            <div className="adm-row-tooltip-title">Row Details</div>
            <div className="adm-row-tooltip-grid">
              {tipItems.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="adm-row-tooltip-label">{item.label}</span>
                  <span className="adm-row-tooltip-value">{item.value}</span>
                </React.Fragment>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

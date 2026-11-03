import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DataTable from 'react-data-table-component';
import { ArrowUp, SearchX, Loader2 } from 'lucide-react';
import './AdminDataTable.css';

const TOOLTIP_MAX_WIDTH = 384;
const TOOLTIP_HOVER_DELAY = 200;
const TOOLTIP_EDGE_GAP = 8;
const TOOLTIP_ROW_GAP = 10;

/* Column auto-sizing: horizontal cell padding + the sort arrow + a glyph safety margin. */
const CELL_PADDING_PX = 40;
const SORT_ICON_PX = 30;
const FILTER_FLOOR_PX = 120;
const STATIC_FLOOR_PX = 90;
const DEFAULT_CAP_PX = 460;
// Hard ceiling for DOM-measured overflow repairs, so one bad cell cannot stretch a table.
const HARD_CAP_PX = 760;
// Values longer than this are prose/JSON meant to wrap, so they keep the authored width.
const WRAPPING_TEXT_LIMIT = 90;
const MEASURE_FONT = '600 14.4px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

let measureCtx = null;
const measureTextWidth = (text) => {
  const value = String(text ?? '');
  if (!value) return 0;
  try {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  } catch {
    measureCtx = null;
  }
  if (!measureCtx) return value.length * 8;
  measureCtx.font = MEASURE_FONT;
  return measureCtx.measureText(value).width;
};

/** Widest string a column will ever render, across the current data set. */
const measureColumn = (column, data) => {
  const label = typeof column.name === 'string' ? column.name : '';
  let widest = measureTextWidth(label) * 1.1; // headers are uppercase + letter-spaced
  let longest = label.length;

  data.forEach((row) => {
    const raw = typeof column.autoSizeValue === 'function'
      ? column.autoSizeValue(row)
      : getRowValue(column, row);
    const text = formatTipValue(raw);
    if (text.length > longest) longest = text.length;
    const width = measureTextWidth(text);
    if (width > widest) widest = width;
  });

  return { widest: Math.ceil(widest), longest };
};

const isActionColumn = (column) => {
  const id = String(column.id ?? '').toLowerCase();
  const name = typeof column.name === 'string' ? column.name.toLowerCase() : '';
  return (
    column.omit ||
    id.includes('action') ||
    name.includes('action') ||
    id === 'sno' ||
    name.includes('s/no') ||
    name === '#'
  );
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
 * empty/loading states, automatic S/No. column, inline per-column filter row,
 * and content-driven column widths: every column is measured against the rows
 * it renders, so nothing is cut off and the columns still fill the card.
 *
 * Add `searchType: 'select'` (optionally with `searchOptions`) to a column to
 * render its column search as a dropdown instead of a free-text input.
 * Add `searchable: false` to opt a column out of the filter row.
 * `minWidth` / `maxWidth` bound the measured width, `width` pins it, and
 * `autoSize: false` / `button: true` keep a column at its authored width.
 */
export default function AdminDataTable({
  columns,
  data = [],
  keyField = 'id',
  defaultSortFieldId,
  defaultSortAsc = false, // Latest on top by default
  showSno = true,         // S/No. serial column enabled by default
  pagination = true,
  paginationPerPage = 8,
  paginationRowsPerPageOptions = [8, 15, 25, 50],
  paginationOptions,
  fixedHeader = true,
  scrollHeight = 'clamp(400px, 65vh, 700px)',
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
  const [perPage, setPerPage] = useState(paginationPerPage);

  useEffect(() => {
    setPerPage(paginationPerPage);
  }, [paginationPerPage]);

  const [columnFilters, setColumnFilters] = useState({});
  const [rowTip, setRowTip] = useState(null); // { row, rowEl }
  const [tipSize, setTipSize] = useState({ width: 0, height: 0 });
  const [positionTick, setPositionTick] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const hoverTimerRef = useRef(null);
  const hoveredRowKeyRef = useRef(null);
  const tableWrapRef = useRef(null);
  const tipRef = useRef(null);
  const actionMenuOpenRef = useRef(false);

  // The scroll container's own width is what the columns have to fill.
  useLayoutEffect(() => {
    const outer = tableWrapRef.current;
    if (!outer) return undefined;

    const read = () => {
      const scroller = outer.querySelector('.rdt_responsiveWrapper');
      const width = (scroller || outer).clientWidth;
      setContainerWidth((previous) => (Math.abs(previous - width) > 1 ? width : previous));
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  // Automatically prepend S/No. column if showSno is true and not already present
  const tableColumns = useMemo(() => {
    if (showSno === false) return columns || [];
    const hasSno = (columns || []).some(
      (c) =>
        String(c.id || '').toLowerCase() === 'sno' ||
        String(c.name || '').toLowerCase().includes('s/no') ||
        String(c.name || '').toLowerCase() === 's.no' ||
        String(c.name || '').toLowerCase() === '#'
    );
    if (hasSno) return columns || [];

    const snoCol = {
      id: 'sno',
      name: 'S/No.',
      width: '75px',
      minWidth: '75px',
      grow: 0,
      sortable: false,
      searchable: false,
      center: true,
      cell: (row, index) => {
        const pageOffset = pagination ? (currentPage - 1) * perPage : 0;
        return (
          <span
            className="adm-sno-cell"
            style={{
              fontWeight: 600,
              color: '#64748b',
              fontSize: '0.82rem',
              display: 'inline-block',
              textAlign: 'center',
              width: '100%'
            }}
          >
            {pageOffset + index + 1}
          </span>
        );
      }
    };
    return [snoCol, ...(columns || [])];
  }, [columns, showSno, pagination, currentPage, perPage]);

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
        const column = tableColumns.find((item) => String(item.id) === columnId);
        if (!column) return true;

        const raw = getRowValue(column, row);
        if (raw == null) return false;

        const value = String(raw);
        return column.searchType === 'select'
          ? value === query
          : value.toLowerCase().includes(query.toLowerCase());
      })
    );
  }, [data, tableColumns, activeFilters]);

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

  // Cells can still need more room than the raw text implies (badges, chips,
  // stacked lines). One bounded repair pass per data/columns change reads the
  // real overflow from the DOM (see below) and widens just those columns.
  const [widthBumps, setWidthBumps] = useState({});
  const healedForRef = useRef(null);
  const healKey = useMemo(
    () => `${data.length}|${(tableColumns || []).map((c) => String(c.id ?? c.name ?? '')).join(',')}`,
    [data.length, tableColumns]
  );

  // Every column measured against the values it actually renders.
  const measuredWidths = useMemo(() => {
    const widths = {};
    const pinned = new Set();
    (tableColumns || []).forEach((column) => {
      const id = String(column.id ?? column.name ?? '');
      if (!id) return;

      const floor =
        parseFloat(column.minWidth) ||
        (column.searchable === false || column.omit ? STATIC_FLOOR_PX : FILTER_FLOOR_PX);
      const cap = parseFloat(column.maxWidth) || DEFAULT_CAP_PX;

      if (column.width) {
        const explicit = parseFloat(column.width);
        widths[id] = Number.isFinite(explicit) ? Math.max(explicit, floor) : floor;
        pinned.add(id);
        return;
      }
      if (column.autoSize === false || column.button || isActionColumn(column)) {
        widths[id] = Math.max(floor, STATIC_FLOOR_PX);
        return;
      }

      const { widest, longest } = measureColumn(column, data);
      if (longest > WRAPPING_TEXT_LIMIT) {
        widths[id] = floor; // wrapping prose / JSON payload keeps its authored width
        return;
      }

      const padding =
        CELL_PADDING_PX + (column.sortable ? SORT_ICON_PX : 0) + (column.autoSizeExtra || 0);
      widths[id] = Math.min(Math.max(widest + padding, floor), cap);
    });

    // Overflow measured from the previous paint, valid only for the current data set.
    if (healedForRef.current === healKey) {
      Object.entries(widthBumps).forEach(([id, bump]) => {
        if (!widths[id] || pinned.has(id)) return;
        widths[id] = Math.min(widths[id] + bump, HARD_CAP_PX);
      });
    }
    return widths;
  }, [tableColumns, data, healKey, widthBumps]);

  // Content widths first, then any leftover space is shared by the `grow` weights
  // so the table still fills the card instead of leaving a gap on the right.
  const sizedColumns = useMemo(() => {
    const base = (tableColumns || []).map((column) => ({
      column,
      id: String(column.id ?? column.name ?? ''),
      width: measuredWidths[String(column.id ?? column.name ?? '')] || FILTER_FLOOR_PX
    }));

    const contentTotal = base.reduce((sum, item) => sum + item.width, 0);
    const target = Math.max(containerWidth, contentTotal, Number(minWidth) || 0);
    const surplus = Math.max(0, target - contentTotal);
    const weightTotal = base.reduce((sum, item) => sum + (item.column.grow ?? 1), 0) || 1;

    const sized = base.map(({ column, width }) => ({
      ...column,
      width: `${width + Math.floor((surplus * (column.grow ?? 1)) / weightTotal)}px`,
      minWidth: undefined,
      maxWidth: undefined,
      grow: 0
    }));

    return { sized, total: sized.reduce((sum, column) => sum + (parseFloat(column.width) || 0), 0) };
  }, [tableColumns, measuredWidths, containerWidth, minWidth]);

  const calculatedMinWidth = sizedColumns.total + 8;

  // Measure real overflow once per data/columns change, then widen those columns.
  useLayoutEffect(() => {
    const el = tableWrapRef.current;
    if (!el || healedForRef.current === healKey) return;
    healedForRef.current = healKey;

    const next = {};
    el.querySelectorAll('.rdt_TableCell[data-column-id]').forEach((cell) => {
      const needed = cell.scrollWidth - cell.clientWidth;
      if (needed <= 1) return;
      const id = cell.getAttribute('data-column-id');
      next[id] = Math.max(next[id] || 0, needed);
    });

    if (Object.keys(next).length) {
      setWidthBumps((previous) => ({ ...previous, ...next }));
    }
  }, [healKey, sizedColumns]);

  const tipItems = useMemo(() => {
    if (!rowTip) return [];
    return tableColumns
      .filter((column) => !isActionColumn(column))
      .map((column) => {
        const label =
          typeof column.name === 'string' || typeof column.name === 'number'
            ? String(column.name)
            : String(column.id ?? '');
        return { label, value: formatTipValue(getRowValue(column, rowTip.row)) };
      });
  }, [rowTip, tableColumns]);

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
    () => sizedColumns.sized.map((column) => {
      const columnId = String(column.id ?? column.name ?? '');
      const isActionCol =
        columnId.toLowerCase().includes('action') ||
        (typeof column.name === 'string' && column.name.toLowerCase().includes('action'));
      const isSnoCol =
        columnId.toLowerCase() === 'sno' ||
        (typeof column.name === 'string' && column.name.toLowerCase().includes('s/no'));
      const canSearch =
        column.searchable !== false && !column.omit && !isActionCol && !isSnoCol;

      if (!canSearch) {
        return {
          ...column,
          button: column.button ?? false,
          allowOverflow: column.allowOverflow ?? false,
          searchable: false,
          name: (
            <div
              className="adm-col-head"
              style={column.center ? { alignItems: 'center', textAlign: 'center' } : {}}
            >
              <span className="adm-col-head-label">{column.name}</span>
              <div style={{ height: '30px', visibility: 'hidden' }} aria-hidden="true" />
            </div>
          )
        };
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
    [sizedColumns, columnFilters, data, handleColumnFilter]
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
        onChangeRowsPerPage={(newPerPage, page) => {
          setPerPage(newPerPage);
          setCurrentPage(page || 1);
        }}
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

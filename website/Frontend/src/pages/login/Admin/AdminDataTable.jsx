import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { ArrowUp, SearchX, Loader2 } from 'lucide-react';
import './AdminDataTable.css';

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

  const searchableColumns = useMemo(
    () =>
      (columns || []).map((column) => {
        const columnId = String(column.id ?? column.name ?? '');
        const canSearch =
          column.searchable !== false && !column.omit && columnId !== 'actions';

        if (!canSearch) return column;

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
    <div className="admin-datatable" style={{ '--admin-datatable-min-width': `${minWidth}px` }}>
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
    </div>
  );
}

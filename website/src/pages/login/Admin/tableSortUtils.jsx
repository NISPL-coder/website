import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Universal Hook for multi-column sorting (strings, numbers, currencies, and dates).
 */
export function useTableSort(items = [], defaultKey = '', defaultDirection = 'asc') {
  const [sortConfig, setSortConfig] = useState({
    key: defaultKey,
    direction: defaultDirection
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !Array.isArray(items)) return items;

    return [...items].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      // Clean strings to check for numeric or currency content (e.g. "₹14,500", "28,000", "15000")
      const aClean = typeof aVal === 'string' ? aVal.replace(/[^\d.-]/g, '') : aVal;
      const bClean = typeof bVal === 'string' ? bVal.replace(/[^\d.-]/g, '') : bVal;

      const aNum = parseFloat(aClean);
      const bNum = parseFloat(bClean);

      // Check if it's a numeric comparison (and NOT a strict ISO date format like 2026-10-24)
      const isDate =
        typeof aVal === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(aVal) &&
        typeof bVal === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(bVal);

      const isNumeric =
        !isDate &&
        !isNaN(aNum) &&
        !isNaN(bNum) &&
        (typeof aVal === 'number' || (typeof aVal === 'string' && /\d/.test(aVal)));

      let comparison = 0;
      if (isNumeric) {
        comparison = aNum - bNum;
      } else {
        comparison = aVal.toString().localeCompare(bVal.toString(), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortConfig]);

  return {
    sortedItems,
    sortConfig,
    requestSort
  };
}

/**
 * Reusable Sortable Table Header Component with visual Lucide direction icons.
 */
export function SortableTh({
  label,
  sortKey,
  currentSort,
  onSort,
  style = {},
  className = ''
}) {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  return (
    <th
      className={`sortable ${isActive ? 'active-sort' : ''} ${className}`}
      onClick={() => onSort(sortKey)}
      style={{ cursor: 'pointer', userSelect: 'none', ...style }}
      title={`Click to sort by ${label} (${direction === 'asc' ? 'Descending' : 'Ascending'})`}
      role="columnheader"
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
    >
      <div className="adm-th-content">
        <span>{label}</span>
        <span className="adm-sort-icon-wrap">
          {direction === 'asc' ? (
            <ArrowUp size={13} className="adm-sort-icon active" />
          ) : direction === 'desc' ? (
            <ArrowDown size={13} className="adm-sort-icon active" />
          ) : (
            <ArrowUpDown size={12} className="adm-sort-icon inactive" />
          )}
        </span>
      </div>
    </th>
  );
}

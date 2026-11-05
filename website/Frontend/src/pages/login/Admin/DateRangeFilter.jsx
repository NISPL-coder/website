import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import './DateRangeFilter.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 252;
const MOBILE_POPOVER_HEIGHT = 340;

/** "2026-10-31" -> "31 Oct 2026" */
const formatDate = (value) => {
  if (!value) return '';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
};

/**
 * Custom from/to date range filter used by the admin list toolbars.
 * The popover keeps draft values until "Apply" is pressed and is rendered in
 * a portal so the table card's overflow clipping never cuts it off.
 */
export default function DateRangeFilter({ from = '', to = '', onChange, label = 'Date Range' }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [draftFrom, setDraftFrom] = useState(from || '');
  const [draftTo, setDraftTo] = useState(to || '');
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setDraftFrom(from || '');
    setDraftTo(to || '');
  }, [from, to]);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event) => {
      if (
        containerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const handleViewportChange = () => setOpen(false);

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open]);

  const isActive = Boolean(from || to);
  const summary = isActive
    ? from && to
      ? `${formatDate(from)} – ${formatDate(to)}`
      : from
      ? `From ${formatDate(from)}`
      : `Until ${formatDate(to)}`
    : label;

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }

    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    const popoverHeight = window.innerWidth <= 640 ? MOBILE_POPOVER_HEIGHT : POPOVER_HEIGHT;
    const openAbove =
      rect.bottom + popoverHeight + 16 > window.innerHeight &&
      rect.top - popoverHeight - 8 > 12;
    const rawTop = openAbove ? rect.top - popoverHeight - 8 : rect.bottom + 8;
    const top = Math.min(rawTop, Math.max(12, window.innerHeight - popoverHeight - 12));

    setCoords({
      left,
      width,
      top,
    });
    setOpen(true);
  };

  const handleApply = () => {
    let nextFrom = draftFrom;
    let nextTo = draftTo;

    if (nextFrom && nextTo && nextFrom > nextTo) {
      [nextFrom, nextTo] = [nextTo, nextFrom];
    }

    onChange?.(nextFrom, nextTo);
    setOpen(false);
  };

  const handleClear = () => {
    setDraftFrom('');
    setDraftTo('');
    onChange?.('', '');
    setOpen(false);
  };

  return (
    <div
      className={`adm-date-range${isActive ? ' is-active' : ''}`}
      ref={containerRef}
    >
      <button
        type="button"
        ref={triggerRef}
        className="adm-date-range-trigger"
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Filter by date range"
      >
        <CalendarDays size={15} className="adm-date-range-icon" />
        <span className="adm-date-range-label">{summary}</span>
        {!isActive && <ChevronDown size={14} className="adm-date-range-caret" />}
      </button>

      {isActive && (
        <button
          type="button"
          className="adm-date-range-clear"
          aria-label="Clear date range"
          onClick={handleClear}
        >
          <X size={12} />
        </button>
      )}

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            className="adm-date-range-popover"
            role="dialog"
            aria-label="Filter by date range"
            style={{ left: coords.left, top: coords.top, width: coords.width }}
          >
            <div className="adm-date-range-heading">Date range</div>
            <div className="adm-date-range-fields">
              <label className="adm-date-range-field">
                <span>From date</span>
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo || undefined}
                  onChange={(event) => setDraftFrom(event.target.value)}
                />
              </label>
              <label className="adm-date-range-field">
                <span>To date</span>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  onChange={(event) => setDraftTo(event.target.value)}
                />
              </label>
            </div>
            <div className="adm-date-range-actions">
              <button type="button" className="adm-date-range-btn ghost" onClick={handleClear}>
                Clear
              </button>
              <button type="button" className="adm-date-range-btn primary" onClick={handleApply}>
                Apply filter
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

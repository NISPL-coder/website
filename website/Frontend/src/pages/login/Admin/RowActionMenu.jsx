import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Edit3, Trash2, Printer } from 'lucide-react';
import './RowActionMenu.css';

export default function RowActionMenu({ onView, onEdit, onDelete, onPrint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const computePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    const estimatedMenuHeight = 190;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
    return openAbove
      ? { top: 'auto', bottom: window.innerHeight - rect.top + 6, right: window.innerWidth - rect.right }
      : { top: rect.bottom + 6, bottom: 'auto', right: window.innerWidth - rect.right };
  }, []);

  const toggleMenu = useCallback((e) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      if (prev) {
        setMenuPosition(null);
        return false;
      }
      const pos = computePosition();
      setMenuPosition(pos);
      return true;
    });
  }, [computePosition]);

  // Tell the surrounding data table to pause its row-hover lift/popup while
  // this menu is open; closing (or unmounting) the menu restores row hover.
  useEffect(() => {
    if (!isOpen) return undefined;
    const tableEl = menuRef.current?.closest('.admin-datatable') ?? null;
    window.dispatchEvent(
      new CustomEvent('nispl_row_action_menu', { detail: { open: true, table: tableEl } })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent('nispl_row_action_menu', { detail: { open: false, table: tableEl } })
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return undefined;
    }
    if (!menuPosition) {
      const pos = computePosition();
      if (pos) setMenuPosition(pos);
    }

    const handleClickOutside = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, menuPosition, computePosition]);

  const dropdown =
    isOpen && menuPosition
      ? createPortal(
          <div
            ref={dropdownRef}
            className="adm-action-dropdown adm-action-dropdown-portal"
            style={{
              position: 'fixed',
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              right: menuPosition.right,
              zIndex: 2147483000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="adm-action-dropdown-item"
              onClick={() => {
                setIsOpen(false);
                onView?.();
              }}
            >
              <Eye size={14} className="adm-action-icon blue" />
              <span>View</span>
            </button>

            <button
              type="button"
              className="adm-action-dropdown-item"
              onClick={() => {
                setIsOpen(false);
                onEdit?.();
              }}
            >
              <Edit3 size={14} className="adm-action-icon purple" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="adm-action-dropdown-item"
              onClick={() => {
                setIsOpen(false);
                onPrint?.();
              }}
            >
              <Printer size={14} className="adm-action-icon green" />
              <span>Print (PDF)</span>
            </button>

            <div className="adm-action-dropdown-divider" />

            <button
              type="button"
              className="adm-action-dropdown-item danger"
              onClick={() => {
                setIsOpen(false);
                onDelete?.();
              }}
            >
              <Trash2 size={14} className="adm-action-icon red" />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="adm-action-menu-wrap" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`adm-action-dots-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        title="Actions"
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {dropdown}
    </div>
  );
}

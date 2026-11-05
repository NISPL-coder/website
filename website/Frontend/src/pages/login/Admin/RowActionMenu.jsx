import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Edit3, Trash2, Printer } from 'lucide-react';
import { usePermissions } from './PermissionsContext';
import './RowActionMenu.css';

/**
 * Three-dots row action menu.
 *
 * Either pass the classic `onView/onEdit/onPrint/onDelete` handlers (Edit and
 * Delete disappear when `module` denies the operation), or pass an explicit
 * `items` array of `{ label, icon, tone, danger, divider, hidden, onClick }`
 * for module-specific actions such as staff access grants.
 */
export default function RowActionMenu({ onView, onEdit, onDelete, onPrint, module, items }) {
  const { can } = usePermissions();
  const allowEdit = !module || can(module, 'edit');
  const allowDelete = !module || can(module, 'delete');
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const menuItems = useMemo(() => {
    if (items) return items.filter((item) => item && !item.hidden);

    const legacy = [];
    if (onView) legacy.push({ label: 'View', icon: Eye, tone: 'blue', onClick: onView });
    if (onEdit && allowEdit) {
      legacy.push({ label: 'Edit', icon: Edit3, tone: 'purple', onClick: onEdit });
    }
    if (onPrint) legacy.push({ label: 'Print (PDF)', icon: Printer, tone: 'green', onClick: onPrint });
    if (onDelete && allowDelete) {
      legacy.push({
        label: 'Delete',
        icon: Trash2,
        tone: 'red',
        danger: true,
        divider: true,
        onClick: onDelete
      });
    }
    return legacy;
  }, [items, onView, onEdit, onPrint, onDelete, allowEdit, allowDelete]);

  const computePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    const isTouchLayout = window.innerWidth <= 768;
    const estimatedMenuHeight = menuItems.length * (isTouchLayout ? 46 : 34) + 24;
    const menuWidth = isTouchLayout ? 180 : 155;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
    const maxRight = Math.max(8, window.innerWidth - menuWidth - 8);
    const right = Math.min(window.innerWidth - rect.right, maxRight);
    const top = Math.min(
      rect.bottom + 6,
      Math.max(8, window.innerHeight - estimatedMenuHeight - 8)
    );

    return openAbove
      ? { top: 'auto', bottom: window.innerHeight - rect.top + 6, right }
      : { top, bottom: 'auto', right };
  }, [menuItems.length]);

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
            {menuItems.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {item.divider && index > 0 && <div className="adm-action-dropdown-divider" />}

                <button
                  type="button"
                  className={`adm-action-dropdown-item${item.danger ? ' danger' : ''}`}
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick?.();
                  }}
                >
                  <item.icon size={14} className={`adm-action-icon ${item.tone || 'blue'}`} />
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            ))}
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

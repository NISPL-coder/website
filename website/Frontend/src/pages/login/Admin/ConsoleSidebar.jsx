import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Console navigation rail shared by every signed-in portal.
 *
 * `items` is a flat config list; each entry is
 *   { id, label, icon, path, badge, title, group, submenu: [child] }
 * `group` prints a divider + section label above the entry, `submenu` turns it
 * into an expandable parent. Visibility is decided by the caller, so the admin
 * console can pass only the RBAC-granted modules.
 */
export default function ConsoleSidebar({
  items = [],
  activeNav,
  onNavigate,
  isMobileOpen = false,
  ariaLabel = 'Portal Navigation',
  emptyNote = ''
}) {
  // All expandable sections/submenus are open by default
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    (items || []).forEach((item) => {
      if (item.submenu?.length) {
        initial[item.id] = true;
      }
    });
    return initial;
  });

  // Keep all submenu items open by default even if items change dynamically
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      (items || []).forEach((item) => {
        if (item.submenu?.length && next[item.id] === undefined) {
          next[item.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  // A child route keeps its parent expanded, so deep links stay navigable.
  useEffect(() => {
    const parent = items.find((item) => item.submenu?.some((child) => child.id === activeNav));
    if (parent && !openGroups[parent.id]) {
      setOpenGroups((prev) => ({ ...prev, [parent.id]: true }));
    }
  }, [items, activeNav]);

  const toggleGroup = (event, id) => {
    event.stopPropagation();
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSubmenu = (item) => (
    <div className="adm-submenu animate-fade-in">
      {item.submenu.map((child) =>
        child.readOnly ? (
          <div
            key={child.id}
            className="adm-submenu-item is-readonly"
            title={child.title || child.label}
            aria-disabled="true"
          >
            <child.icon size={16} />
            <span>{child.label}</span>
          </div>
        ) : (
          <button
            key={child.id}
            type="button"
            className={`adm-submenu-item ${activeNav === child.id ? 'active' : ''}`}
            onClick={() => onNavigate(child)}
            title={child.title || child.label}
          >
            <child.icon size={16} />
            <span>{child.label}</span>
          </button>
        )
      )}
    </div>
  );

  return (
    <aside className={`adm-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <nav className="adm-sidebar-nav" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const showGroupLabel = item.group && items[index - 1]?.group !== item.group;
          const isOpen = Boolean(openGroups[item.id]);

          return (
            <React.Fragment key={item.id}>
              {showGroupLabel && <div className="adm-sidebar-divider" aria-hidden="true" />}
              {showGroupLabel && <div className="adm-sidebar-tools-label">{item.group}</div>}

              {item.readOnly ? (
                <div
                  className="adm-nav-item is-readonly"
                  title={item.title || item.label}
                  aria-disabled="true"
                >
                  <div className="adm-nav-item-left">
                    <item.icon size={19} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                </div>
              ) : (
                <button
                  type="button"
                  className={`adm-nav-item ${item.submenu ? 'has-submenu' : ''} ${
                    activeNav === item.id ? 'active' : ''
                  }`}
                  onClick={() => onNavigate(item)}
                  title={item.title || item.label}
                  aria-expanded={item.submenu ? isOpen : undefined}
                >
                  <div className="adm-nav-item-left">
                    <item.icon size={19} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}

                  {item.submenu && (
                    <span
                      className={`adm-nav-chevron ${isOpen ? 'open' : ''}`}
                      onClick={(event) => toggleGroup(event, item.id)}
                      title={isOpen ? 'Collapse Submenu' : 'Expand Submenu'}
                    >
                      <ChevronDown size={16} />
                    </span>
                  )}
                </button>
              )}

              {item.submenu && isOpen && renderSubmenu(item)}
            </React.Fragment>
          );
        })}

        {emptyNote && <div className="adm-sidebar-empty-note">{emptyNote}</div>}
      </nav>
    </aside>
  );
}

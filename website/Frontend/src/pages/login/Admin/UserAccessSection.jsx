import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  UserPlus,
  Trash2,
  Key,
  PlayCircle,
  PauseCircle,
  X,
  Loader2,
  Check,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { staffApi } from '../../../services/staffApi';
import { authApi } from '../../../services/authApi';
import { useIsPhone } from '../../../utils/useResponsive';
import AdminDataTable from './AdminDataTable';
import RowActionMenu from './RowActionMenu';
import {
  usePermissions,
  PERMISSION_ACTIONS,
  fromPermissionMatrix,
  fromColumnMatrix,
  toColumnMatrix,
  toPermissionMatrix
} from './PermissionsContext';
import './UserAccessSection.css';

const MODULE_OPTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'customer', label: 'Customer' },
  { id: 'contract', label: 'Contract' },
  { id: 'payment', label: 'Payment' },
  { id: 'manual_payment', label: 'Manual Payment' },
  { id: 'product', label: 'Product' },
  { id: 'receipt', label: 'Receipt' },
  { id: 'import_csv', label: 'Import CSV' },
  { id: 'sangam_sync', label: 'Sangam Sync' },
  { id: 'user_access', label: 'User Access' },
  { id: 'activity_logs', label: 'Activity Logs' }
];

const ACTION_META = {
  view: { label: 'View', hint: 'Open the module and read records' },
  create: { label: 'Add', hint: 'Create new records' },
  edit: { label: 'Edit', hint: 'Update existing records' },
  delete: { label: 'Delete', hint: 'Permanently remove records' }
};

const emptyMatrix = () => toPermissionMatrix([]);

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', support: 'Support' };
const STATUS_LABELS = { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' };

const roleLabel = (role) => ROLE_LABELS[String(role || 'support').toLowerCase()] || 'Support';
const statusLabel = (status) => STATUS_LABELS[String(status || 'inactive').toLowerCase()] || 'Inactive';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateString);
  }
};

function PermissionMatrix({ matrix, onChange, columns, onColumnsChange, registry }) {
  const [expanded, setExpanded] = useState([]);

  const defsFor = (moduleId) => (registry && registry[moduleId]) || [];
  const flagsFor = (moduleId) => {
    const defs = defsFor(moduleId);
    if (defs.length === 0) return {};
    const base = {};
    defs.forEach((def) => { base[def.id] = true; });
    return { ...base, ...(columns && columns[moduleId] ? columns[moduleId] : {}) };
  };

  const clearModule = (moduleId) => {
    onChange((prev) => ({
      ...prev,
      [moduleId]: { view: false, create: false, edit: false, delete: false }
    }));
    if (onColumnsChange) onColumnsChange((prev) => ({ ...prev, [moduleId]: {} }));
  };

  // A module opened from this row starts unrestricted; the admin then withholds
  // individual columns, and an empty column set means the module is closed.
  const releaseColumns = (moduleId) => {
    if (onColumnsChange) onColumnsChange((prev) => ({ ...prev, [moduleId]: {} }));
  };

  const toggle = (moduleId, action, next) => {
    onChange((prev) => {
      const moduleState = { ...(prev[moduleId] || {}) };
      moduleState[action] = next;
      // Read access is the prerequisite for every other operation.
      if (action === 'view' && !next) {
        PERMISSION_ACTIONS.forEach((a) => { moduleState[a] = false; });
      }
      if (action !== 'view' && next) moduleState.view = true;
      return { ...prev, [moduleId]: moduleState };
    });
    if (action === 'view') releaseColumns(moduleId);
  };

  const toggleModule = (moduleId, next) => {
    onChange((prev) => ({
      ...prev,
      [moduleId]: next
        ? { view: true, create: true, edit: true, delete: true }
        : { view: false, create: false, edit: false, delete: false }
    }));
    releaseColumns(moduleId);
  };

  const toggleColumn = (moduleId, columnId, next) => {
    const defs = defsFor(moduleId);
    const state = { ...flagsFor(moduleId), [columnId]: next };
    onColumnsChange((prev) => ({ ...prev, [moduleId]: state }));
    if (!defs.some((def) => state[def.id])) clearModule(moduleId);
  };

  const setAllColumns = (moduleId, value) => {
    const defs = defsFor(moduleId);
    if (!value) {
      clearModule(moduleId);
      return;
    }
    onColumnsChange((prev) => ({ ...prev, [moduleId]: {} }));
    if (!matrix[moduleId]?.view) toggle(moduleId, 'view', true);
  };

  return (
    <div className="usr-matrix">
      <div className="usr-matrix-head">
        <span>Module</span>
        {PERMISSION_ACTIONS.map((action) => (
          <span key={action} title={ACTION_META[action].hint}>
            {ACTION_META[action].label}
          </span>
        ))}
      </div>

      {MODULE_OPTIONS.map((option) => {
        const flags = matrix[option.id] || {};
        const allOn = PERMISSION_ACTIONS.every((action) => flags[action]);
        const anyOn = PERMISSION_ACTIONS.some((action) => flags[action]);
        const defs = defsFor(option.id);
        const columnFlags = flagsFor(option.id);
        const checkedCount = defs.filter((def) => columnFlags[def.id]).length;
        const unrestricted = defs.length === 0 || checkedCount === defs.length;
        const isExpanded = expanded.includes(option.id);

        return (
          <div className={`usr-matrix-row ${anyOn ? 'is-on' : ''}`} key={option.id}>
            <div className="usr-matrix-module">
              <div
                className={`usr-custom-checkbox ${allOn ? 'checked' : 'indeterminate'}`}
                role="checkbox"
                aria-checked={allOn ? true : anyOn ? 'mixed' : false}
                tabIndex={0}
                title={allOn ? 'Remove all access to this module' : 'Grant full access to this module'}
                onClick={() => toggleModule(option.id, !allOn)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleModule(option.id, !allOn);
                  }
                }}
              >
                {allOn && <Check size={11} strokeWidth={3} />}
              </div>
              <span>{option.label}</span>
            </div>

            {PERMISSION_ACTIONS.map((action) => {
              const on = Boolean(flags[action]);
              return (
                <div
                  key={action}
                  className={`usr-matrix-cell ${on ? 'checked' : ''}`}
                  title={ACTION_META[action].hint}
                  onClick={() => toggle(option.id, action, !on)}
                >
                  <div className="usr-custom-checkbox">{on && <Check size={11} strokeWidth={3} />}</div>
                </div>
              );
            })}

            {defs.length > 0 && flags.view && (
              <div className="usr-matrix-columns">
                <button
                  type="button"
                  className="usr-columns-toggle"
                  onClick={() =>
                    setExpanded((prev) =>
                      prev.includes(option.id) ? prev.filter((id) => id !== option.id) : [...prev, option.id]
                    )
                  }
                >
                  <ChevronDown size={13} className={`usr-columns-caret ${isExpanded ? 'is-open' : ''}`} />
                  <span>Columns</span>
                  <em>{unrestricted ? `All ${defs.length}` : `${checkedCount} of ${defs.length}`}</em>
                </button>

                {isExpanded && (
                  <div className="usr-columns-grid">
                    {defs.map((def) => {
                      const on = Boolean(columnFlags[def.id]);
                      return (
                        <div
                          key={def.id}
                          className={`usr-column-item ${on ? 'is-on' : ''}`}
                          role="checkbox"
                          aria-checked={on}
                          tabIndex={0}
                          onClick={() => toggleColumn(option.id, def.id, !on)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleColumn(option.id, def.id, !on);
                            }
                          }}
                        >
                          <div className="usr-custom-checkbox">{on && <Check size={11} strokeWidth={3} />}</div>
                          <span>{def.label}</span>
                        </div>
                      );
                    })}

                    <div className="usr-columns-foot">
                      <button type="button" onClick={() => setAllColumns(option.id, true)}>
                        Show all columns
                      </button>
                      <span className="usr-columns-hint">
                        Withheld columns are removed from the table and from the records the API returns.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function UserAccessSection() {
  const isPhone = useIsPhone();
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { can, refresh: refreshOwnPermissions, columnRegistry, columnsByModule, visibleColumns } = usePermissions();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Add Staff Form state
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    status: 'active',
    designation: ''
  });
  const [addMatrix, setAddMatrix] = useState(emptyMatrix);
  const [addColumns, setAddColumns] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Edit Permissions state
  const [editRole, setEditRole] = useState('manager');
  const [editMatrix, setEditMatrix] = useState(emptyMatrix);
  const [editColumns, setEditColumns] = useState({});

  // Check if any modal is active
  const isAnyModalOpen = isAddModalOpen || isPermissionsModalOpen || isDeleteModalOpen;

  // Manage Body Scroll Lock & Escape Key
  useEffect(() => {
    if (!isAnyModalOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsAddModalOpen(false);
        setIsPermissionsModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyModalOpen, isSubmitting]);

  // Load Current Admin
  useEffect(() => {
    const user = authApi.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Fetch Staff Accounts
  const loadStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await staffApi.getStaff();
      const sorted = (data || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setStaffList(sorted);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch staff members.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Handle Add Staff Form
  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      role: 'manager',
      status: 'active',
      designation: ''
    });
    setAddMatrix(emptyMatrix());
    setAddColumns({});
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast.error('Please enter name, email, and password.');
      return;
    }
    try {
      setIsSubmitting(true);
      await staffApi.createStaff({
        ...addForm,
        permissions: [...fromPermissionMatrix(addMatrix), ...fromColumnMatrix(addColumns, columnRegistry)]
      });
      toast.success(`Staff account for ${addForm.name} created successfully!`);
      setIsAddModalOpen(false);
      loadStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to create staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === 'active' ? 'inactive' : 'active';
    try {
      await staffApi.toggleStaffStatus(staff.id || staff._id, nextStatus);
      toast.success(`${staff.name} is now ${nextStatus}.`);
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id || s._id === staff.id ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  // Handle Open Permissions Modal
  const handleOpenPermissions = (staff) => {
    const permissions = Array.isArray(staff.permissions) ? staff.permissions : [];
    setSelectedStaff(staff);
    setEditRole(staff.role || 'manager');
    setEditMatrix(toPermissionMatrix(permissions));
    setEditColumns(toColumnMatrix(permissions, columnRegistry));
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    const permissions = [...fromPermissionMatrix(editMatrix), ...fromColumnMatrix(editColumns, columnRegistry)];
    try {
      setIsSubmitting(true);
      await staffApi.updatePermissions(selectedStaff.id || selectedStaff._id, {
        role: editRole,
        permissions
      });
      toast.success(`Access permissions updated for ${selectedStaff.name}!`);
      setIsPermissionsModalOpen(false);
      loadStaff();
      // Any other console tab (including the affected staff member's) picks this up live.
      window.dispatchEvent(new Event('nispl_permissions_changed'));
      if (isCurrentUser(selectedStaff)) refreshOwnPermissions();
    } catch (err) {
      toast.error(err.message || 'Failed to update permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Staff
  const handleOpenDelete = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStaff) return;
    try {
      setIsSubmitting(true);
      await staffApi.deleteStaff(selectedStaff.id || selectedStaff._id);
      toast.success(`Account for ${selectedStaff.name} has been removed.`);
      setIsDeleteModalOpen(false);
      setStaffList((prev) => prev.filter((s) => s.id !== selectedStaff.id && s._id !== selectedStaff.id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentUser = (staff) => {
    if (!currentUser) return false;
    if (staff.email?.toLowerCase() === currentUser.email?.toLowerCase()) return true;
    if (currentUser.id && (staff.id === currentUser.id || staff._id === currentUser.id)) return true;
    return false;
  };

  const columns = useMemo(
    () => [
      {
        id: 'name',
        name: 'Name',
        selector: (row) => row.name || '',
        sortable: true,
        minWidth: '200px',
        grow: 1.5,
        autoSizeExtra: 84, // room for the inline "Primary" chip
        cell: (row) => (
          <div className="usr-name-cell">
            <span>{row.name || '—'}</span>
            {row.isPrimaryAdmin && <span className="usr-primary-chip">Primary</span>}
          </div>
        )
      },
      {
        id: 'email',
        name: 'Email',
        selector: (row) => row.email || '',
        sortable: true,
        minWidth: '240px',
        grow: 2,
        cell: (row) => <span className="usr-email-cell">{row.email}</span>
      },
      {
        id: 'role',
        name: 'Role',
        selector: (row) => roleLabel(row.role),
        sortable: true,
        searchType: 'select',
        minWidth: '130px',
        grow: 0.8,
        cell: (row) => (
          <span className={`usr-pill usr-pill-${String(row.role || 'support').toLowerCase()}`}>
            {roleLabel(row.role)}
          </span>
        )
      },
      {
        id: 'status',
        name: 'Status',
        selector: (row) => statusLabel(row.status),
        sortable: true,
        searchType: 'select',
        minWidth: '130px',
        grow: 0.8,
        cell: (row) => (
          <span className={`usr-pill usr-pill-${String(row.status || 'inactive').toLowerCase()}`}>
            {statusLabel(row.status)}
          </span>
        )
      },
      {
        id: 'createdAt',
        name: 'Created',
        selector: (row) => new Date(row.createdAt || 0).getTime(),
        autoSizeValue: (row) => formatDate(row.createdAt),
        sortable: true,
        searchable: false,
        minWidth: '150px',
        grow: 1,
        cell: (row) => <span className="usr-date-cell">{formatDate(row.createdAt)}</span>
      },
      {
        id: 'actions',
        name: 'Actions',
        center: true,
        width: '110px',
        button: true,
        allowOverflow: true,
        ignoreRowClick: true,
        cell: (row) => {
          

          const isActive = String(row.status || 'inactive').toLowerCase() === 'active';
          const canEdit = can('user_access', 'edit');
          const canDelete = can('user_access', 'delete');

          const items = [
            {
              label: isActive ? 'Deactivate' : 'Activate',
              icon: isActive ? PauseCircle : PlayCircle,
              tone: isActive ? 'orange' : 'green',
              hidden: !canEdit || row.isPrimaryAdmin,
              onClick: () => handleToggleStatus(row)
            },
            {
              label: 'Grant Access',
              icon: Key,
              tone: 'purple',
              hidden: !canEdit || row.isPrimaryAdmin,
              onClick: () => handleOpenPermissions(row)
            },
            {
              label: 'Delete',
              icon: Trash2,
              tone: 'red',
              danger: true,
              divider: true,
              hidden: !canDelete || row.isPrimaryAdmin,
              onClick: () => handleOpenDelete(row)
            }
          ];

          if (items.every((item) => item.hidden)) {
            return <span className="usr-you-badge"></span>;
          }

          return <RowActionMenu items={items} />;
        }
      }
    ],
    [can, currentUser]
  );

  return (
    <div className="usr-section-wrapper animate-fade-in">
      {/* Top Header matching reference image */}
      <div className="usr-header-bar">
        <div className="usr-header-left">
          <div className="usr-header-icon-box">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="usr-header-title">User Access</h1>
            <p className="usr-header-subtitle">
              Manage admin, manager, and support agent accounts
            </p>
          </div>
        </div>

        {can('user_access', 'create') && (
          <button type="button" className="usr-add-btn" onClick={handleOpenAdd}>
            <UserPlus size={17} />
            <span>+ Add Staff</span>
          </button>
        )}
      </div>

      {/* Main React DataTable */}
      <div className="usr-table-card">
        <AdminDataTable
          columns={visibleColumns('user_access', columns)}
          data={staffList}
          keyField="id"
          defaultSortFieldId="createdAt"
          defaultSortAsc={false}
          paginationPerPage={8}
          paginationRowsPerPageOptions={[8, 15, 25, 50]}
          progressPending={isLoading}
          noDataMessage="No staff members registered yet."
          noDataHint="Create an admin, manager, or support account to grant console access."
          scrollHeight="600px"
          minWidth={1150}
          ariaLabel="Staff accounts"
        />
      </div>

      {/* =========================================================================
         MODAL 1: ADD STAFF MODAL (PORTALED TO DOCUMENT.BODY)
         ========================================================================= */}
      {isAddModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="usr-modal-backdrop" onClick={() => !isSubmitting && setIsAddModalOpen(false)}>
          <div className="usr-modal-card usr-modal-card--wide" onClick={(e) => e.stopPropagation()}>
            <div className="usr-modal-header">
              <div>
                <h3 className="usr-modal-title">Create New Staff Account</h3>
                <div className="usr-modal-subtitle">Add administrative, management, or support personnel</div>
              </div>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="usr-modal-body">
                <div className="usr-form-group">
                  <label className="usr-form-label">Full Name <span className="usr-req">*</span></label>
                  <input
                    type="text"
                    required
                    className="usr-form-input"
                    placeholder="Enter Name"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div className="usr-form-group">
                  <label className="usr-form-label">Email Address <span className="usr-req">*</span></label>
                  <input
                    type="email"
                    required
                    className="usr-form-input"
                    placeholder="Enter Email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>

                <div className="usr-form-group">
                  <label className="usr-form-label" htmlFor="usr-staff-password">Password <span className="usr-req">*</span></label>
                  <div className="usr-password-wrap">
                    <input
                      id="usr-staff-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="usr-form-input"
                      placeholder="Set password (min 6 characters)"
                      autoComplete="new-password"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="usr-password-eye"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr',
                    gap: '14px'
                  }}
                >
                  <div className="usr-form-group">
                    <label className="usr-form-label">Role <span className="usr-req">*</span></label>
                    <select
                      className="usr-form-select"
                      value={addForm.role}
                      onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  <div className="usr-form-group">
                    <label className="usr-form-label">Status <span className="usr-req">*</span></label>
                    <select
                      className="usr-form-select"
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="usr-form-group">
                  <label className="usr-form-label">Granted Access Modules</label>
                  <p className="usr-matrix-note">
                    Tick a module name for full access, or grant View / Add / Edit / Delete individually.
                  </p>
                  <PermissionMatrix
                    matrix={addMatrix}
                    onChange={setAddMatrix}
                    columns={addColumns}
                    onColumnsChange={setAddColumns}
                    registry={columnsByModule}
                  />
                </div>
              </div>

              <div className="usr-modal-footer">
                <button
                  type="button"
                  className="usr-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="usr-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="usr-spinner" style={{ margin: 0 }} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Staff Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
         MODAL 2: GRANT ACCESS / PERMISSIONS MODAL (PORTALED TO DOCUMENT.BODY)
         ========================================================================= */}
      {isPermissionsModalOpen && selectedStaff && typeof document !== 'undefined' && createPortal(
        <div className="usr-modal-backdrop" onClick={() => !isSubmitting && setIsPermissionsModalOpen(false)}>
          <div className="usr-modal-card usr-modal-card--wide" onClick={(e) => e.stopPropagation()}>
            <div className="usr-modal-header">
              <div>
                <h3 className="usr-modal-title">Grant Access & Permissions</h3>
                <div className="usr-modal-subtitle">
                  {selectedStaff.name} ({selectedStaff.email})
                </div>
              </div>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => !isSubmitting && setIsPermissionsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="usr-modal-body">
              <div className="usr-form-group">
                <label className="usr-form-label">Assigned Role</label>
                <select
                  className="usr-form-select"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={selectedStaff.isPrimaryAdmin}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className="usr-form-group">
                <label className="usr-form-label">Module Access Permissions</label>
                <p className="usr-matrix-note">
                  {editRole === 'admin'
                    ? 'Admins always have unrestricted access to every module. These switches take effect once the role is Manager or Support.'
                    : 'Changes take effect immediately — the next request this user makes is already checked against these permissions, without signing them out.'}
                </p>
                <PermissionMatrix
                  matrix={editMatrix}
                  onChange={setEditMatrix}
                  columns={editColumns}
                  onColumnsChange={setEditColumns}
                  registry={columnsByModule}
                />
              </div>
            </div>

            <div className="usr-modal-footer">
              <button
                type="button"
                className="usr-btn-secondary"
                onClick={() => setIsPermissionsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="usr-btn-primary"
                onClick={handleSavePermissions}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
         MODAL 3: DELETE CONFIRMATION MODAL (PORTALED TO DOCUMENT.BODY)
         ========================================================================= */}
      {isDeleteModalOpen && selectedStaff && typeof document !== 'undefined' && createPortal(
        <div className="usr-modal-backdrop" onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}>
          <div className="usr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="usr-modal-header">
              <div>
                <h3 className="usr-modal-title">Delete Staff Account</h3>
                <div className="usr-modal-subtitle">Revoke all administrative access</div>
              </div>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="usr-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete the staff account for{' '}
                <strong style={{ color: '#0f172a' }}>{selectedStaff.name}</strong> (
                {selectedStaff.email})?
              </p>
              <p style={{ margin: '14px 0 0', fontSize: '0.84rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                This user will immediately lose all access to the administrative dashboard and their active sessions will be terminated.
              </p>
            </div>

            <div className="usr-modal-footer">
              <button
                type="button"
                className="usr-btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="usr-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

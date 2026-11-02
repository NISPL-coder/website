import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  UserPlus,
  Trash2,
  Shield,
  Key,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  X,
  Loader2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { staffApi } from '../../../services/staffApi';
import { authApi } from '../../../services/authApi';
import './UserAccessSection.css';

const AVAILABLE_PERMISSIONS = [
  { id: 'overview', label: 'Dashboard & Telemetry' },
  { id: 'customer', label: 'Customer Management' },
  { id: 'contract', label: 'Contract Directory' },
  { id: 'payment', label: 'Payment Records' },
  { id: 'product', label: 'Product Catalog' },
  { id: 'receipt', label: 'Receipt Generation' },
  { id: 'data_tools', label: 'Import CSV & Sangam Sync' },
  { id: 'user_access', label: 'User Access Control' },
  { id: 'activity_logs', label: 'Activity Logs & Audit' }
];

export default function UserAccessSection() {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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
    permissions: ['customer', 'contract'],
    designation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Permissions state
  const [editRole, setEditRole] = useState('manager');
  const [editPermissions, setEditPermissions] = useState([]);

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
      setStaffList(data || []);
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
      permissions: ['customer', 'contract'],
      designation: ''
    });
    setIsAddModalOpen(true);
  };

  const handleToggleAddPermission = (permId) => {
    setAddForm((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId]
      };
    });
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast.error('Please enter name, email, and password.');
      return;
    }
    try {
      setIsSubmitting(true);
      await staffApi.createStaff(addForm);
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
    setSelectedStaff(staff);
    setEditRole(staff.role || 'manager');
    setEditPermissions(Array.isArray(staff.permissions) ? staff.permissions : []);
    setIsPermissionsModalOpen(true);
  };

  const handleToggleEditPermission = (permId) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    try {
      setIsSubmitting(true);
      await staffApi.updatePermissions(selectedStaff.id || selectedStaff._id, {
        role: editRole,
        permissions: editPermissions
      });
      toast.success(`Access permissions updated for ${selectedStaff.name}!`);
      setIsPermissionsModalOpen(false);
      loadStaff();
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

  const isCurrentUser = (staff) => {
    if (!currentUser) return false;
    if (staff.email?.toLowerCase() === currentUser.email?.toLowerCase()) return true;
    if (currentUser.id && (staff.id === currentUser.id || staff._id === currentUser.id)) return true;
    return false;
  };

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

        <button type="button" className="usr-add-btn" onClick={handleOpenAdd}>
          <UserPlus size={17} />
          <span>+ Add Staff</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="usr-table-card">
        <div className="usr-table-responsive">
          <table className="usr-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Name</th>
                <th style={{ width: '28%' }}>Email</th>
                <th style={{ width: '14%' }}>Role</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '12%' }}>Created</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="usr-state-box">
                      <Loader2 size={24} className="usr-spinner" />
                      <div>Loading staff accounts...</div>
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="usr-state-box">
                      <AlertCircle size={28} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                      <div>No staff members registered yet.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const isSelf = isCurrentUser(staff);
                  const roleLower = (staff.role || 'support').toLowerCase();
                  const statusLower = (staff.status || 'inactive').toLowerCase();

                  return (
                    <tr key={staff.id || staff._id || staff.email}>
                      <td className="usr-name-cell">
                        {staff.name}
                        {staff.isPrimaryAdmin && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.68rem',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </td>
                      <td className="usr-email-cell">{staff.email}</td>
                      <td>
                        <span className={`usr-pill usr-pill-${roleLower}`}>
                          {roleLower === 'admin'
                            ? 'Admin'
                            : roleLower === 'manager'
                            ? 'Manager'
                            : 'Support'}
                        </span>
                      </td>
                      <td>
                        <span className={`usr-pill usr-pill-${statusLower}`}>
                          {statusLower === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="usr-date-cell">{formatDate(staff.createdAt)}</td>
                      <td>
                        <div className="usr-actions-cell">
                          {isSelf ? (
                            <span className="usr-you-badge">You</span>
                          ) : (
                            <>
                              {/* Activate / Deactivate Toggle */}
                              {statusLower === 'active' ? (
                                <button
                                  type="button"
                                  className="usr-btn-action usr-btn-deactivate"
                                  onClick={() => handleToggleStatus(staff)}
                                  title="Deactivate account"
                                >
                                  <PauseCircle size={14} />
                                  <span>Deactivate</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="usr-btn-action usr-btn-activate"
                                  onClick={() => handleToggleStatus(staff)}
                                  title="Activate account"
                                >
                                  <PlayCircle size={14} />
                                  <span>Activate</span>
                                </button>
                              )}

                              {/* Grant Access / Permissions */}
                              <button
                                type="button"
                                className="usr-btn-action usr-btn-permissions"
                                onClick={() => handleOpenPermissions(staff)}
                                title="Grant access and configure permissions"
                              >
                                <Key size={13} />
                                <span>Access</span>
                              </button>

                              {/* Delete Account */}
                              <button
                                type="button"
                                className="usr-btn-action usr-btn-delete"
                                onClick={() => handleOpenDelete(staff)}
                                title="Delete staff member"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
         MODAL 1: ADD STAFF MODAL
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="usr-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="usr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="usr-modal-header">
              <h3 className="usr-modal-title">Create New Staff Account</h3>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd}>
              <div className="usr-modal-body">
                <div className="usr-form-group">
                  <label className="usr-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="usr-form-input"
                    placeholder="e.g. Baban Patra"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div className="usr-form-group">
                  <label className="usr-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="usr-form-input"
                    placeholder="e.g. thebabanpatra@gmail.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>

                <div className="usr-form-group">
                  <label className="usr-form-label">Initial Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="usr-form-input"
                    placeholder="Set temporary password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="usr-form-group">
                    <label className="usr-form-label">Role *</label>
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
                    <label className="usr-form-label">Status *</label>
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
                  <div className="usr-perm-grid">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = addForm.permissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className={`usr-perm-item ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleToggleAddPermission(perm.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{perm.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="usr-modal-footer">
                <button
                  type="button"
                  className="usr-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
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
        </div>
      )}

      {/* =========================================================================
         MODAL 2: GRANT ACCESS / PERMISSIONS MODAL
         ========================================================================= */}
      {isPermissionsModalOpen && selectedStaff && (
        <div className="usr-modal-backdrop" onClick={() => setIsPermissionsModalOpen(false)}>
          <div className="usr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="usr-modal-header">
              <div>
                <h3 className="usr-modal-title">Grant Access & Permissions</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedStaff.name} ({selectedStaff.email})
                </div>
              </div>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => setIsPermissionsModalOpen(false)}
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
                <div className="usr-perm-grid">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = editPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        className={`usr-perm-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleToggleEditPermission(perm.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="usr-modal-footer">
              <button
                type="button"
                className="usr-btn-secondary"
                onClick={() => setIsPermissionsModalOpen(false)}
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
        </div>
      )}

      {/* =========================================================================
         MODAL 3: DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {isDeleteModalOpen && selectedStaff && (
        <div className="usr-modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="usr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="usr-modal-header">
              <h3 className="usr-modal-title">Delete Staff Account</h3>
              <button
                type="button"
                className="usr-modal-close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="usr-modal-body">
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete the staff account for{' '}
                <strong style={{ color: '#0f172a' }}>{selectedStaff.name}</strong> (
                {selectedStaff.email})?
              </p>
              <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: '#dc2626' }}>
                This user will immediately lose all access to the administrative dashboard.
              </p>
            </div>

            <div className="usr-modal-footer">
              <button
                type="button"
                className="usr-btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
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
        </div>
      )}
    </div>
  );
}


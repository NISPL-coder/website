import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  ArrowLeft,
  Check,
  UserCheck,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';
import { salesPersonApi } from '../../../services/salesPersonApi';
import { notificationApi } from '../../../services/notificationApi';
import { notifyDataChanged } from '../../../utils/dataBus';

const STATUS_PORTAL_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

export default function CreateSalesPersonPage() {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    status: 'Active',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast.error('Representative full name is required');
      return;
    }

    const cleanPhone = formState.phone.trim().replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      toast.error(`Phone number must be exactly 10 digits (currently ${cleanPhone.length} digits)`);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Adding sales representative...');

    const payload = {
      name: formState.name.trim(),
      designation: formState.designation.trim(),
      email: formState.email.trim(),
      phone: cleanPhone,
      status: formState.status || 'Active',
      notes: formState.notes.trim()
    };

    try {
      const res = await salesPersonApi.create(payload);
      toast.success(res.message || 'Sales representative added successfully!', { id: toastId });

      try {
        notificationApi.createNotification({
          type: 'system',
          title: 'New Sales Representative Added',
          message: `Sales representative "${payload.name}" was registered and set to ${payload.status}.`,
          severity: 'info',
          entityType: 'salesPerson',
          entityId: res.data?.id || res.data?.salesPersonId
        });
      } catch {
        // Notification failure shouldn't block navigation
      }

      notifyDataChanged(['salesPersons', 'salesPerson', '*']);
      navigate('/admin/sales-person');
    } catch (err) {
      console.error('Failed to create sales person:', err);
      toast.error(err.message || 'Failed to create sales person', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adm-create-page-container animate-fade-in">
      {/* Top Navigation & Action Header */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Sales Management</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/sales-person')}
            >
              Sales Person Allocation
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Create</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Add Sales Person</h1>
            <p className="adm-section-sub">
              Register a new sales representative and configure customer portal order allocation visibility.
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="adm-create-header-action adm-header-actions-group">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/sales-person')}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} />
            <span>Back to Sales Person</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Representative Identity & Contact */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <span className="adm-form-section-icon purple">
                <UserCheck size={18} />
              </span>
              <span>Representative Details</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Full Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="adm-form-input"
                  placeholder="Enter full name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
                <span className="adm-form-hint">
                  This exact name appears in the Customer Portal order term dropdown.
                </span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Designation / Role</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter designation (e.g. Senior Sales Executive)"
                  value={formState.designation}
                  onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                />
                <span className="adm-form-hint">
                  Representative's official designation or corporate role.
                </span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Email Address</label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="Enter email address"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                />
                <span className="adm-form-hint">
                  Official corporate email for notifications.
                </span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Phone / Mobile</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="adm-form-input"
                  placeholder="10-digit mobile number"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                    })
                  }
                />
                <span className="adm-form-hint">
                  10-digit primary contact number.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Visibility & Assignment */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <span className="adm-form-section-icon emerald">
                <Globe size={18} />
              </span>
              <span>Portal Visibility &amp; Allocation</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Customer Portal Visibility <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={STATUS_PORTAL_OPTIONS}
                  value={
                    STATUS_PORTAL_OPTIONS.find((opt) => opt.value === formState.status) ||
                    STATUS_PORTAL_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, status: opt ? opt.value : 'Active' })
                  }
                  classNamePrefix="react-select"
                />
                <span className="adm-form-hint">
                  Active representatives are visible in the checkout dropdown for customer self-service.
                </span>
              </div>

              <div className="adm-form-field full-width">
                <label className="adm-form-label">Notes / Territory Allocation (Optional)</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter territory details, assigned accounts or notes..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
                <span className="adm-form-hint">
                  Optional notes or regional coverage details.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Form Actions */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/sales-person')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Saving Representative...' : 'Save Representative'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

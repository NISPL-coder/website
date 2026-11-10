import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  ArrowLeft,
  Check,
  Globe,
  Radio,
  Server,
  Network
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';
import { ipApi } from '../../../services/ipApi';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

const SERVER_OPTIONS = [
  { value: 'Dedicated', label: 'Dedicated' },
  { value: 'Shared', label: 'Shared' }
];

export default function CreateIpPage({ onCreated }) {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    wanIp: '',
    lanIp: '',
    rdpPort: '3389',
    httpPort: '80',
    vmId: '',
    status: 'Active',
    serverType: 'Dedicated',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.wanIp.trim()) {
      toast.error('WAN IP is required');
      return;
    }
    if (!formState.lanIp.trim()) {
      toast.error('LAN IP is required');
      return;
    }
    if (!formState.vmId.trim()) {
      toast.error('VM ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ipApi.createIp(formState);
      toast.success('IP record created successfully!');
      if (onCreated) {
        onCreated(created);
      } else {
        navigate('/admin/ip-monitor');
      }
    } catch (err) {
      console.error('Failed to create IP record:', err);
      toast.error(err.message || 'Failed to create IP record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adm-create-page-container adm-create-ip-page animate-fade-in">
      {/* Top Navigation & Action Header (same layout as Create Customer/Contract/Payment) */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Network Operations</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/ip-monitor')}
            >
              Active &amp; Inactive IP
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Create</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Create Network IP</h1>
            <p className="adm-section-sub">
              Register a new WAN/LAN IP routing configuration with ports, VM ID, status, and server type.
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="adm-create-header-action adm-header-actions-group">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/ip-monitor')}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: IP Addresses & Routing */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <span className="adm-form-section-icon blue">
                <Globe size={17} />
              </span>
              <span>IP Addresses &amp; Routing</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  WAN IP <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. 103.208.72.14"
                  value={formState.wanIp}
                  onChange={(e) => setFormState({ ...formState, wanIp: e.target.value })}
                  required
                />
                <span className="adm-form-hint">Public facing IP address</span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  LAN IP <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. 192.168.1.10 or 10.0.0.14"
                  value={formState.lanIp}
                  onChange={(e) => setFormState({ ...formState, lanIp: e.target.value })}
                  required
                />
                <span className="adm-form-hint">Internal private network IP</span>
              </div>
            </div>
          </div>

          {/* Section 2: Ports & Machine Identity */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <span className="adm-form-section-icon purple">
                <Radio size={17} />
              </span>
              <span>Ports &amp; Machine Identity</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  RDP Port <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. 3389 or 53389"
                  value={formState.rdpPort}
                  onChange={(e) => setFormState({ ...formState, rdpPort: e.target.value })}
                  required
                />
                <span className="adm-form-hint">Remote Desktop gateway port</span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  HTTP Port <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. 80 or 8080"
                  value={formState.httpPort}
                  onChange={(e) => setFormState({ ...formState, httpPort: e.target.value })}
                  required
                />
                <span className="adm-form-hint">Web services endpoint port</span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  VM ID <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. VM-101 or VM-KOL-NODE-01"
                  value={formState.vmId}
                  onChange={(e) => setFormState({ ...formState, vmId: e.target.value })}
                  required
                />
                <span className="adm-form-hint">Virtual machine or hypervisor node identifier</span>
              </div>
            </div>
          </div>

          {/* Section 3: Status & Server Architecture */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <span className="adm-form-section-icon emerald">
                <Server size={17} />
              </span>
              <span>Status &amp; Server Architecture</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Status <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={STATUS_OPTIONS}
                  value={STATUS_OPTIONS.find((opt) => opt.value === formState.status)}
                  onChange={(opt) => setFormState({ ...formState, status: opt?.value || 'Active' })}
                />
                <span className="adm-form-hint">Active or Inactive operational state</span>
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Server Type <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={SERVER_OPTIONS}
                  value={SERVER_OPTIONS.find((opt) => opt.value === formState.serverType)}
                  onChange={(opt) => setFormState({ ...formState, serverType: opt?.value || 'Dedicated' })}
                />
                <span className="adm-form-hint">Server allocation tier (Shared or Dedicated)</span>
              </div>

              <div className="adm-form-field full-width">
                <label className="adm-form-label">Network Notes / Remarks</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. Primary egress for Tally Prime Cloud / RDP Gateway pool"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Bottom Form Actions */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/ip-monitor')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Saving IP Record...' : 'Save IP Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

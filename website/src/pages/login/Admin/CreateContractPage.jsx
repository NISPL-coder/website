import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Check,
  X,
  CreditCard,
  Building2,
  Clock,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft / Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'closed', label: 'Closed / Terminated' }
];

const SUBSCRIPTION_PERIOD_OPTIONS = [
  { value: '1 Month', label: '1 Month' },
  { value: '3 Months', label: '3 Months' },
  { value: '6 Months', label: '6 Months' },
  { value: '1 Year', label: '1 Year' },
  { value: '2 Years', label: '2 Years' },
  { value: '3 Years', label: '3 Years' }
];

const CONTRACT_TYPE_OPTIONS = [
  { value: 'Subscription', label: 'Subscription' },
  { value: 'AMC', label: 'AMC' }
];

export default function CreateContractPage({ contracts, setContracts, customers = [] }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const oneYearFromNow = nextYear.toISOString().split('T')[0];

  const [formState, setFormState] = useState({
    name: '',
    accountName: customers[0]?.company || '',
    status: 'active',
    startDate: today,
    endDate: oneYearFromNow,
    totalContractValue: '',
    subscriptionPeriod: '1 Year',
    contractType: 'Subscription'
  });

  const accountOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.company,
      label: `${c.company} (${c.name})`
    }));
  }, [customers]);

  // Adjust End Date automatically when Subscription Period changes
  const handlePeriodChange = (selectedPeriod) => {
    const start = new Date(formState.startDate || today);
    const end = new Date(start);

    if (selectedPeriod === '1 Month') end.setMonth(end.getMonth() + 1);
    else if (selectedPeriod === '3 Months') end.setMonth(end.getMonth() + 3);
    else if (selectedPeriod === '6 Months') end.setMonth(end.getMonth() + 6);
    else if (selectedPeriod === '1 Year') end.setFullYear(end.getFullYear() + 1);
    else if (selectedPeriod === '2 Years') end.setFullYear(end.getFullYear() + 2);
    else if (selectedPeriod === '3 Years') end.setFullYear(end.getFullYear() + 3);

    setFormState((prev) => ({
      ...prev,
      subscriptionPeriod: selectedPeriod,
      endDate: end.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.totalContractValue.trim()) {
      toast.error('Please enter the Contract Name and Total Contract Value.');
      return;
    }

    const cleanVal = formState.totalContractValue.trim();
    const formattedVal = cleanVal.startsWith('₹') ? cleanVal : `₹${cleanVal}`;

    const newContract = {
      id: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formState.name.trim(),
      status: formState.status,
      startDate: formState.startDate,
      endDate: formState.endDate,
      expiryDate: formState.endDate,
      totalContractValue: formattedVal,
      value: formattedVal,
      subscriptionPeriod: formState.subscriptionPeriod,
      contractType: formState.contractType,
      // Backward compatibility aliases
      company: formState.accountName || formState.name.trim(),
      customer: formState.name.trim(),
      email: 'contracts@nispl.in',
      service: `${formState.contractType} (${formState.subscriptionPeriod})`,
      slaTier: 'Tier-1 Priority NOC 99.99%'
    };

    setContracts([newContract, ...contracts]);
    toast.success(`Contract "${newContract.name}" created successfully!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    navigate('/admin/customer/contract');
  };

  return (
    <div className="adm-create-page-container animate-fade-in">
      {/* Top Header with Breadcrumbs & Action Buttons */}
      <div className="adm-create-page-header">
        <div className="adm-create-header-left">
          <div className="adm-breadcrumb-row">
            <span className="adm-breadcrumb-mute">Contracts</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/customer/contract')}
            >
              Management
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Create</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Create Contract</h1>
            <p className="adm-section-sub">
              Enter contract overview parameters, validity periods, and commercial values.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form id="create-contract-form" onSubmit={handleSubmit}>
          {/* Section: Overview (All Highlighted Fields) */}
          <div className="adm-form-section">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                marginTop: '16px'
              }}
            >
              {/* 1. Name */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your contract name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </div>

              {/* 2. Status */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Status <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((s) => s.value === formState.status) || STATUS_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, status: opt ? opt.value : 'active' })
                  }
                  placeholder="Select status..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* 3. Start Date */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Start Date <span className="adm-required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="adm-form-input"
                    value={formState.startDate}
                    onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                    required
                    style={{ paddingRight: '36px' }}
                  />
                  <Calendar
                    size={16}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* 4. End Date */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  End Date <span className="adm-required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="adm-form-input"
                    value={formState.endDate}
                    onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                    required
                    style={{ paddingRight: '36px' }}
                  />
                  <Calendar
                    size={16}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* 5. Subscription Period */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Subscription Period <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={SUBSCRIPTION_PERIOD_OPTIONS}
                  value={
                    SUBSCRIPTION_PERIOD_OPTIONS.find(
                      (p) => p.value === formState.subscriptionPeriod
                    ) || SUBSCRIPTION_PERIOD_OPTIONS[3]
                  }
                  onChange={(opt) => handlePeriodChange(opt ? opt.value : '1 Year')}
                  placeholder="Select subscription period..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* 6. Contract Type */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Contract Type <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={CONTRACT_TYPE_OPTIONS}
                  value={
                    CONTRACT_TYPE_OPTIONS.find((t) => t.value === formState.contractType) ||
                    CONTRACT_TYPE_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({
                      ...formState,
                      contractType: opt ? opt.value : 'Subscription'
                    })
                  }
                  placeholder="Select contract type..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* 7. Total Contract Value */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Total Contract Value <span className="adm-required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6366f1',
                      fontWeight: 700,
                      fontSize: '1rem',
                      pointerEvents: 'none'
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder="Enter total contract value"
                    value={formState.totalContractValue}
                    onChange={(e) =>
                      setFormState({ ...formState, totalContractValue: e.target.value })
                    }
                    style={{ paddingLeft: '32px' }}
                    required
                  />
                </div>
              </div>

              {/* Optional: Linked Account Name */}
              {customers && customers.length > 0 && (
                <div className="adm-form-field">
                  <label className="adm-form-label">Linked Client / Account Name</label>
                  <Select
                    styles={customSelectStyles}
                    isSearchable={true}
                    options={accountOptions}
                    value={accountOptions.find((a) => a.value === formState.accountName)}
                    onChange={(opt) =>
                      setFormState({
                        ...formState,
                        accountName: opt ? opt.value : ''
                      })
                    }
                    placeholder="Select client account..."
                    classNamePrefix="react-select"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/contract')}
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
            <button type="submit" className="adm-btn-primary">
              <Check size={15} />
              <span>Save Contract</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

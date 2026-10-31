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
  Layers,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';
import { contractApi } from '../../../services/contractApi';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'NotStarted', label: 'NotStarted' },
  { value: 'Inactive', label: 'Inactive' }
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deduplicate account options by unique Customer Name / Company Name
  const accountOptions = useMemo(() => {
    const seen = new Set();
    const uniqueOptions = [];

    for (const c of customers) {
      const nameKey = (c.company || c.name || '').trim();
      if (!nameKey) continue;
      const lowerKey = nameKey.toLowerCase();
      if (!seen.has(lowerKey)) {
        seen.add(lowerKey);
        uniqueOptions.push({
          value: nameKey,
          label: nameKey,
          customer: c
        });
      }
    }

    return uniqueOptions;
  }, [customers]);

  const [formState, setFormState] = useState({
    name: '',
    accountName: accountOptions[0]?.value || customers[0]?.company || customers[0]?.name || '',
    status: 'Active',
    startDate: today,
    endDate: oneYearFromNow,
    totalContractValue: '',
    subscriptionPeriod: '1 Year',
    contractType: 'Subscription'
  });

  // Sync default account name when account options are loaded
  React.useEffect(() => {
    if (!formState.accountName && accountOptions.length > 0) {
      setFormState((prev) => ({
        ...prev,
        accountName: accountOptions[0].value
      }));
    }
  }, [accountOptions, formState.accountName]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerAccountName = (formState.accountName || '').trim();
    if (!formState.name.trim() || !customerAccountName || !formState.totalContractValue.trim()) {
      toast.error('Please enter Contract Name, Account Name, and Total Contract Value.');
      return;
    }

    setIsSubmitting(true);
    const cleanVal = formState.totalContractValue.trim();
    const formattedVal = cleanVal.startsWith('₹') ? cleanVal : `₹${cleanVal}`;

    // Find if selected customer/account has Sangam CRM recordId
    const matchedCustomer = customers.find(
      (c) =>
        c.name?.toLowerCase() === customerAccountName.toLowerCase() ||
        c.company?.toLowerCase() === customerAccountName.toLowerCase() ||
        c.customerId === customerAccountName
    );
    const sangamAccountId =
      matchedCustomer?.sangamCrm?.recordId &&
      !matchedCustomer.sangamCrm.recordId.startsWith('SGM-ACC-')
        ? matchedCustomer.sangamCrm.recordId
        : null;

    const payload = {
      name: formState.name.trim(),
      accountName: customerAccountName,
      customer: customerAccountName,
      company: matchedCustomer?.company || customerAccountName,
      status: formState.status,
      startDate: formState.startDate,
      endDate: formState.endDate,
      totalContractValue: formattedVal,
      value: formattedVal,
      subscriptionPeriod: formState.subscriptionPeriod,
      contractType: formState.contractType,
      accountId: sangamAccountId,
      email: matchedCustomer?.email || 'contracts@nispl.in',
      phone: matchedCustomer?.phone || '',
      service: `${formState.contractType} (${formState.subscriptionPeriod})`,
      slaTier: 'Tier-1 Priority NOC 99.99%'
    };

    try {
      const res = await contractApi.createContract(payload);
      const createdContract = res.contract || {
        id: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload
      };

      setContracts([createdContract, ...contracts]);

      if (res.sangamCrm?.status === 'synced') {
        toast.success(
          `Contract created for ${customerAccountName} and synchronized to Sangam CRM! (Record ID: ${res.sangamCrm.recordId})`,
          {
            duration: 6000,
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '0.85rem'
            }
          }
        );
      } else {
        toast.success(`Contract "${createdContract.name}" created successfully!`, {
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.85rem'
          }
        });
      }

      navigate('/admin/customer/contract');
    } catch (err) {
      console.error('[CreateContractPage] error:', err);
      toast.error(err.message || 'Failed to create contract.');
    } finally {
      setIsSubmitting(false);
    }
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

              {/* 2. Account Name (Customer Name in Sangam CRM) */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Account Name <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={accountOptions}
                  value={
                    accountOptions.find(
                      (a) =>
                        a.value === formState.accountName ||
                        a.customer?.name === formState.accountName ||
                        a.customer?.company === formState.accountName
                    ) || (formState.accountName ? {
                      value: formState.accountName,
                      label: formState.accountName
                    } : null)
                  }
                  onChange={(opt) =>
                    setFormState({
                      ...formState,
                      accountName: opt ? opt.value : ''
                    })
                  }
                  placeholder="Select customer account..."
                  classNamePrefix="react-select"
                  required
                />
              </div>

              {/* 3. Status */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Status <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((s) => s.value.toLowerCase() === (formState.status || 'Active').toLowerCase()) || STATUS_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, status: opt ? opt.value : 'Active' })
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
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer/contract')}
              disabled={isSubmitting}
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Syncing to Sangam CRM...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Save Contract</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

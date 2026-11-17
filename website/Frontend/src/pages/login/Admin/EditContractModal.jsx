import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import CreatableSelect from 'react-select/creatable';
import {
  X,
  Save,
  FileText,
  Building2,
  User,
  Mail,
  Layers,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Tag,
  AlertCircle,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contractApi } from '../../../services/contractApi';
import { productApi } from '../../../services/productApi';
import { salesPersonApi } from '../../../services/salesPersonApi';
import { customerApi } from '../../../services/customerApi';
import { notificationApi } from '../../../services/notificationApi';
import {
  CONTRACT_STATUSES,
  CONTRACT_TYPES,
  LEGACY_CONTRACT_TYPES,
  normalizeContractStatus,
  normalizeContractType,
  contractPersonEmail
} from './contractVocabulary';
import './EditContractModal.css';

const DEFAULT_SLA_TIERS = [
  'Tier-1 Priority NOC 99.99%',
  'Tier-2 Standard Support 99.9%',
  'Enterprise Dedicated NOC 99.999%',
  'Demo Trial 99.99%',
  'Basic SLA 99.5%'
];

const modalSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    height: '40px',
    borderRadius: '9px',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    borderWidth: '1.5px',
    backgroundColor: '#ffffff',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
    fontSize: '0.86rem',
    color: '#0f172a',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    paddingLeft: '28px',
    cursor: 'text',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 6px',
    height: '38px',
    display: 'flex',
    alignItems: 'center'
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: '#0f172a',
    fontWeight: '500',
    fontSize: '0.86rem'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: '0.86rem'
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '500',
    fontSize: '0.86rem'
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999999
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '10px',
    boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.2), 0 4px 12px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    zIndex: 99999999,
    backgroundColor: '#ffffff',
    overflow: 'hidden'
  }),
  menuList: (base) => ({
    ...base,
    padding: '6px',
    maxHeight: '220px'
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '7px',
    padding: '8px 12px',
    fontSize: '0.84rem',
    fontWeight: state.isSelected ? '600' : '500',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    backgroundColor: state.isSelected
      ? '#2563eb'
      : state.isFocused
      ? '#eff6ff'
      : 'transparent',
    cursor: 'pointer',
    marginBottom: '2px',
    '&:active': {
      backgroundColor: '#1d4ed8',
      color: '#ffffff'
    }
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#3b82f6' : '#64748b',
    padding: '0 8px',
    cursor: 'pointer',
    '&:hover': { color: '#3b82f6' }
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    padding: '0 6px',
    cursor: 'pointer',
    '&:hover': { color: '#ef4444' }
  })
};

function toDateInputFormat(val) {
  if (!val) return '';
  const s = String(val).trim();
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return '';
}

function calculateDurationString(start, end) {
  if (!start || !end) return '';
  const sDate = new Date(start);
  const eDate = new Date(end);
  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime()) || eDate < sDate) return '';

  const diffTime = Math.abs(eDate - sDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 365) {
    const years = Math.round((diffDays / 365) * 10) / 10;
    return `${years} Year${years !== 1 ? 's' : ''} (${diffDays} Days)`;
  }
  if (diffDays >= 30) {
    const months = Math.round(diffDays / 30);
    return `${months} Month${months !== 1 ? 's' : ''} (${diffDays} Days)`;
  }
  return `${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
}

export default function EditContractModal({ contract, isOpen, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    customer: '',
    email: '',
    service: '',
    productId: '',
    salesPerson: '',
    contractType: 'Comprehensive',
    orderDate: '',
    startDate: '',
    endDate: '',
    subscriptionPeriod: '1 Year',
    totalContractValue: '₹0',
    paymentStatus: 'No',
    status: 'In Progress',
    slaTier: 'Tier-1 Priority NOC 99.99%',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [isCustomSalesPerson, setIsCustomSalesPerson] = useState(false);
  const [isCustomSla, setIsCustomSla] = useState(false);

  // Dynamic API state
  const [apiProducts, setApiProducts] = useState([]);
  const [apiSalesPersons, setApiSalesPersons] = useState([]);
  const [apiCustomers, setApiCustomers] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

  // Load dynamic data from APIs when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingDropdowns(true);

    Promise.allSettled([
      productApi.getProducts().catch(() => []),
      salesPersonApi.getAll().catch(() => ({ data: [] })),
      customerApi.getCustomers().catch(() => [])
    ]).then(([prodRes, spRes, custRes]) => {
      if (!isMounted) return;

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setApiProducts(prodRes.value);
      }
      if (spRes.status === 'fulfilled') {
        const data = spRes.value?.data || (Array.isArray(spRes.value) ? spRes.value : []);
        setApiSalesPersons(data);
      }
      if (custRes.status === 'fulfilled' && Array.isArray(custRes.value)) {
        setApiCustomers(custRes.value);
      }
      setIsLoadingDropdowns(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Sync incoming contract to form state
  useEffect(() => {
    if (contract) {
      const sDate = toDateInputFormat(contract.startDate);
      const eDate = toDateInputFormat(contract.endDate || contract.expiryDate);
      const oDate = toDateInputFormat(contract.orderDate);

      const val = contract.totalContractValue || contract.value || '₹0';
      const formattedValue = String(val).startsWith('₹') ? val : `₹${val}`;

      const sType = normalizeContractType(contract.contractType) || 'Comprehensive';
      const sStatus = normalizeContractStatus(contract.status, contract) || 'In Progress';
      const pStatus = ['yes', 'true', '1', 'paid'].includes(String(contract.paymentStatus || '').toLowerCase())
        ? 'Yes'
        : 'No';

      const sService = contract.service || contract.productName || contract.plan || '';
      const sSla = contract.slaTier || 'Tier-1 Priority NOC 99.99%';
      const sSalesPerson = contract.salesPerson || '';

      setFormData({
        name: contract.name || contract.contractId || '',
        company: contract.company || '',
        customer: contract.customer || '',
        email: contractPersonEmail(contract),
        service: sService,
        productId: contract.productId || '',
        salesPerson: sSalesPerson,
        contractType: sType,
        orderDate: oDate,
        startDate: sDate,
        endDate: eDate,
        subscriptionPeriod: contract.subscriptionPeriod || calculateDurationString(sDate, eDate) || '1 Year',
        totalContractValue: formattedValue,
        paymentStatus: pStatus,
        status: sStatus,
        slaTier: sSla,
        description: contract.description || ''
      });

      setIsCustomProduct(false);
      setIsCustomSalesPerson(false);
      setIsCustomSla(false);
    }
  }, [contract]);

  // Lock body scroll and Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose?.();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isSubmitting]);

  // Dynamic Contact Person Options from apiCustomers
  const personOptions = useMemo(() => {
    const list = [];
    const seen = new Set();
    const targetComp = (formData.company || '').trim().toLowerCase();

    (apiCustomers || []).forEach((c) => {
      const name = String(c.name || c.contactPerson || '').trim();
      const comp = String(c.company || '').trim();
      const email = String(c.email || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          value: name,
          label: name,
          company: comp,
          email: email,
          isMatch: Boolean(targetComp && comp.toLowerCase() === targetComp)
        });
      }
      if (Array.isArray(c.contacts)) {
        c.contacts.forEach((ct) => {
          const ctName =
            String(ct.name || ct.fullName || '').trim() ||
            [ct.firstName, ct.lastName].filter(Boolean).join(' ');
          const ctEmail = String(ct.email || '').trim();
          if (ctName && !seen.has(ctName.toLowerCase())) {
            seen.add(ctName.toLowerCase());
            list.push({
              value: ctName,
              label: ctName,
              company: comp,
              email: ctEmail || email,
              isMatch: Boolean(targetComp && comp.toLowerCase() === targetComp)
            });
          }
        });
      }
    });

    if (formData.customer && !seen.has(formData.customer.trim().toLowerCase())) {
      list.unshift({
        value: formData.customer.trim(),
        label: formData.customer.trim(),
        company: formData.company || '',
        email: formData.email || '',
        isMatch: true
      });
    }

    return list.sort((a, b) => {
      if (a.isMatch && !b.isMatch) return -1;
      if (!a.isMatch && b.isMatch) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [apiCustomers, formData.customer, formData.company, formData.email]);

  // Dynamic Company Options from apiCustomers
  const companyOptions = useMemo(() => {
    const map = new Map();
    (apiCustomers || []).forEach((c) => {
      const comp = String(c.company || c.name || '').trim();
      if (!comp) return;
      const key = comp.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          value: comp,
          label: comp,
          contact: c.name || c.contactPerson || '',
          email: c.email || ''
        });
      }
    });
    if (formData.company && !map.has(formData.company.trim().toLowerCase())) {
      map.set(formData.company.trim().toLowerCase(), {
        value: formData.company.trim(),
        label: formData.company.trim(),
        contact: formData.customer || '',
        email: formData.email || ''
      });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [apiCustomers, formData.company, formData.customer, formData.email]);

  // Memoized dynamic dropdown options
  const productOptions = useMemo(() => {
    const names = new Set();
    apiProducts.forEach((p) => {
      if (p.name) names.add(p.name);
      if (p.title) names.add(p.title);
    });
    // Add default popular catalogue plans if empty
    if (names.size === 0) {
      names.add('Enterprise Cloud Server');
      names.add('Tally Prime Cloud Server');
      names.add('Dedicated Cloud Server');
      names.add('Shared Cloud Server');
      names.add('Demo Trial');
    }
    if (formData.service && !names.has(formData.service)) {
      names.add(formData.service);
    }
    return Array.from(names);
  }, [apiProducts, formData.service]);

  const salesPersonOptions = useMemo(() => {
    const list = new Set();
    apiSalesPersons.forEach((sp) => {
      if (sp.name) list.add(sp.name.trim());
    });
    // Standard sales executives fallback
    if (list.size === 0) {
      list.add('Nilmoni Ghosal');
      list.add('Debasish Chakraborty');
      list.add('Sales Team Direct');
    }
    if (formData.salesPerson && !list.has(formData.salesPerson)) {
      list.add(formData.salesPerson.trim());
    }
    return Array.from(list);
  }, [apiSalesPersons, formData.salesPerson]);

  const contractTypeOptions = useMemo(() => {
    const types = new Set([...CONTRACT_TYPES, ...LEGACY_CONTRACT_TYPES]);
    if (formData.contractType) types.add(formData.contractType);
    return Array.from(types);
  }, [formData.contractType]);

  const slaOptions = useMemo(() => {
    const tiers = new Set(DEFAULT_SLA_TIERS);
    if (formData.slaTier) tiers.add(formData.slaTier);
    return Array.from(tiers);
  }, [formData.slaTier]);

  const statusOptions = useMemo(() => {
    const statuses = new Set([
      'In Progress',
      'DEMO',
      'DEMO-Inactive',
      'Converted',
      'Not Started',
      'Inactive',
      'Closed',
      'DISABLED',
      ...CONTRACT_STATUSES
    ]);
    if (formData.status) statuses.add(formData.status);
    return Array.from(statuses);
  }, [formData.status]);

  if (!isOpen || !contract) return null;

  // Handle auto-calculating term when start or end date changes
  const handleDateChange = (field, value) => {
    const next = { ...formData, [field]: value };
    const computedDuration = calculateDurationString(next.startDate, next.endDate);
    if (computedDuration) {
      next.subscriptionPeriod = computedDuration;
    }
    setFormData(next);
  };

  // Handlers for Person and Company
  const handlePersonSelect = (selected) => {
    if (!selected) {
      setFormData((prev) => ({ ...prev, customer: '' }));
      return;
    }
    const personName = selected.value;
    setFormData((prev) => ({
      ...prev,
      customer: personName,
      company: prev.company || selected.company,
      email: prev.email || selected.email
    }));
  };

  const handlePersonCreate = (newVal) => {
    const clean = newVal.trim();
    if (!clean) return;
    setFormData((prev) => ({
      ...prev,
      customer: clean
    }));
  };

  const handleCompanySelect = (selected) => {
    if (!selected) {
      setFormData((prev) => ({ ...prev, company: '' }));
      return;
    }
    const compName = selected.value;
    setFormData((prev) => ({
      ...prev,
      company: compName,
      customer: prev.customer || selected.contact || '',
      email: prev.email || selected.email || ''
    }));
  };

  const handleCompanyCreate = (newVal) => {
    const clean = newVal.trim();
    if (!clean) return;
    setFormData((prev) => ({
      ...prev,
      company: clean
    }));
  };

  const handleProductSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomProduct(true);
      return;
    }
    setIsCustomProduct(false);
    const matched = apiProducts.find((p) => p.name === val || p.title === val);
    setFormData((prev) => ({
      ...prev,
      service: val,
      productId: matched?._id || matched?.id || prev.productId || ''
    }));
  };

  const handleSalesPersonSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomSalesPerson(true);
      return;
    }
    setIsCustomSalesPerson(false);
    setFormData((prev) => ({ ...prev, salesPerson: val }));
  };

  const handleSlaSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomSla(true);
      return;
    }
    setIsCustomSla(false);
    setFormData((prev) => ({ ...prev, slaTier: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter the contract name or ID.');
      return;
    }
    if (!formData.company.trim()) {
      toast.error('Please enter the company name.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving contract updates & syncing to Sangam CRM...');

    try {
      const cId = contract.id || contract.contractId || contract._id;
      const res = await contractApi.updateContract(cId, formData);
      const updated = res.contract || { ...contract, ...formData };

      onUpdated?.(updated);

      notificationApi.createNotification({
        type: 'contract_updated',
        title: 'Contract Agreement Updated',
        message: `Contract "${formData.name || cId}" for ${formData.company} was updated (Status: ${formData.status}).`,
        severity: 'info',
        entityType: 'contract',
        entityId: cId,
        user: {
          company: formData.company
        },
        metadata: {
          status: formData.status,
          contractValue: formData.totalContractValue,
          expiryDate: formData.endDate
        }
      });

      toast.success('Contract updated & synced with Sangam CRM!', { id: toastId });
      onClose();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="adm-modal-backdrop-portal" onClick={onClose}>
      <div
        className="ecm-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ecm-title"
      >
        {/* Modal Header */}
        <div className="ecm-header">
          <div className="ecm-header-left">
            <div className="ecm-header-icon-wrap">
              <FileText size={22} />
            </div>
            <div>
              <h2 id="ecm-title" className="ecm-header-title">
                Edit Contract Agreement
              </h2>
              <div className="ecm-header-meta">
                <span className="ecm-ref-chip">
                  Ref ID: {contract.contractId || contract.id || 'N/A'}
                </span>
                {contract.customerId && (
                  <span
                    className="ecm-ref-chip"
                    style={{
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      border: '1px solid #c7d2fe',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  >
                    Cust ID: {contract.customerId}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background:
                      formData.status === 'DEMO'
                        ? '#e0e7ff'
                        : formData.status === 'In Progress'
                        ? '#dcfce7'
                        : formData.status === 'DEMO-Inactive'
                        ? '#fee2e2'
                        : '#f1f5f9',
                    color:
                      formData.status === 'DEMO'
                        ? '#4338ca'
                        : formData.status === 'In Progress'
                        ? '#15803d'
                        : formData.status === 'DEMO-Inactive'
                        ? '#b91c1c'
                        : '#475569'
                  }}
                >
                  {formData.status}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ecm-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            title="Close (Esc)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="ecm-body">
            {/* Section 1: Customer & Company Identity */}
            <div className="ecm-card">
              <div className="ecm-card-header">
                <span className="ecm-card-badge ecm-badge-indigo">
                  <Building2 size={13} /> Customer &amp; Account Identity
                </span>
              </div>

              <div className="ecm-grid-2">
                {/* Contract Name / ID */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Contract ID / Name *</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <FileText size={16} className="ecm-input-icon" />
                    <input
                      type="text"
                      className="ecm-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. CTR-2026-0042 or Demo Trial"
                      required
                    />
                  </div>
                </div>

                {/* Company Name with Searchable CreatableSelect */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Company Name *</span>
                  
                  </label>
                  <div className="ecm-input-wrapper">
                    <Building2 size={16} className="ecm-input-icon" />
                    <CreatableSelect
                      styles={modalSelectStyles}
                      isSearchable={true}
                      isClearable={true}
                      options={companyOptions}
                      value={formData.company ? { value: formData.company, label: formData.company } : null}
                      onChange={handleCompanySelect}
                      onCreateOption={handleCompanyCreate}
                      placeholder={isLoadingDropdowns ? 'Loading accounts...' : 'Search or enter company...'}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue ? `Press Enter to use "${inputValue}"` : 'No matching companies'
                      }
                      formatCreateLabel={(val) => `Use "${val}"`}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      menuPosition="fixed"
                      className="ecm-react-select-container"
                      classNamePrefix="ecm-company-select"
                    />
                  </div>
                </div>

                {/* Contact Person with Searchable CreatableSelect */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Contact Person *</span>
                   
                  </label>
                  <div className="ecm-input-wrapper">
                    <User size={16} className="ecm-input-icon" />
                    <CreatableSelect
                      styles={modalSelectStyles}
                      isSearchable={true}
                      isClearable={true}
                      options={personOptions}
                      value={formData.customer ? { value: formData.customer, label: formData.customer } : null}
                      onChange={handlePersonSelect}
                      onCreateOption={handlePersonCreate}
                      placeholder={isLoadingDropdowns ? 'Loading contacts...' : 'Search or enter contact person...'}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue ? `Press Enter to use "${inputValue}"` : 'No matching contacts'
                      }
                      formatCreateLabel={(val) => `Use "${val}"`}
                      formatOptionLabel={(option, info) => {
                        if (info.context === 'value') return option.label;
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontWeight: 600 }}>{option.label}</span>
                            {option.company && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#4f46e5',
                                  background: '#eef2ff',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  maxWidth: '160px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {option.company}
                              </span>
                            )}
                          </div>
                        );
                      }}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      menuPosition="fixed"
                      className="ecm-react-select-container"
                      classNamePrefix="ecm-person-select"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Contact Email</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <Mail size={16} className="ecm-input-icon" />
                    <input
                      type="email"
                      className="ecm-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. client@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Service, Product & Sales Attribution */}
            <div className="ecm-card">
              <div className="ecm-card-header">
                <span className="ecm-card-badge ecm-badge-blue">
                  <Layers size={13} /> Product, Service &amp; Sales Attribution
                </span>
                {isLoadingDropdowns && (
                  <span style={{ fontSize: '0.72rem', color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} className="animate-spin" /> Loading API catalog...
                  </span>
                )}
              </div>

              <div className="ecm-grid-2">
                {/* Product / Service Plan Dropdown */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Product / Service Plan *</span>
                   
                  </label>
                  {!isCustomProduct ? (
                    <div className="ecm-input-wrapper">
                      <Layers size={16} className="ecm-input-icon" />
                      <select
                        className="ecm-select"
                        value={formData.service}
                        onChange={handleProductSelect}
                      >
                        <option value="">-- Select Product / Service --</option>
                        {productOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        <option value="__custom__">+ Enter Custom Service / Plan...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="ecm-input-wrapper">
                      <Layers size={16} className="ecm-input-icon" />
                      <input
                        type="text"
                        className="ecm-input"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        placeholder="Type custom service name..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomProduct(false)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          border: 'none',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        Select List
                      </button>
                    </div>
                  )}
                </div>

                {/* Sales Executive Dropdown */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Assigned Sales Executive</span>
                   
                  </label>
                  {!isCustomSalesPerson ? (
                    <div className="ecm-input-wrapper">
                      <UserCheck size={16} className="ecm-input-icon" />
                      <select
                        className="ecm-select"
                        value={formData.salesPerson}
                        onChange={handleSalesPersonSelect}
                      >
                        <option value="">-- Unassigned / Direct --</option>
                        {salesPersonOptions.map((sp) => (
                          <option key={sp} value={sp}>
                            {sp}
                          </option>
                        ))}
                        <option value="__custom__">+ Enter Custom Sales Person...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="ecm-input-wrapper">
                      <UserCheck size={16} className="ecm-input-icon" />
                      <input
                        type="text"
                        className="ecm-input"
                        value={formData.salesPerson}
                        onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                        placeholder="Type sales executive name..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomSalesPerson(false)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          border: 'none',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        Select List
                      </button>
                    </div>
                  )}
                </div>

                {/* Contract Type Dropdown */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Contract Type</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <Tag size={16} className="ecm-input-icon" />
                    <select
                      className="ecm-select"
                      value={formData.contractType}
                      onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    >
                      {contractTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SLA Tier Dropdown */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>SLA Guarantee Tier</span>
                  </label>
                  {!isCustomSla ? (
                    <div className="ecm-input-wrapper">
                      <ShieldCheck size={16} className="ecm-input-icon" />
                      <select
                        className="ecm-select"
                        value={formData.slaTier}
                        onChange={handleSlaSelect}
                      >
                        {slaOptions.map((tier) => (
                          <option key={tier} value={tier}>
                            {tier}
                          </option>
                        ))}
                        <option value="__custom__">+ Enter Custom SLA Tier...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="ecm-input-wrapper">
                      <ShieldCheck size={16} className="ecm-input-icon" />
                      <input
                        type="text"
                        className="ecm-input"
                        value={formData.slaTier}
                        onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                        placeholder="e.g. 99.9% Uptime with 4h SLA"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomSla(false)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          border: 'none',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        Select List
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Timeline & Schedule */}
            <div className="ecm-card">
              <div className="ecm-card-header">
                <span className="ecm-card-badge ecm-badge-amber">
                  <Calendar size={13} /> Agreement Validity &amp; Timeline
                </span>
                {formData.subscriptionPeriod && (
                  <span className="ecm-duration-chip">
                    <Clock size={11} /> {formData.subscriptionPeriod}
                  </span>
                )}
              </div>

              <div className="ecm-grid-3">
                {/* Order Date */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Order Date</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <Calendar size={16} className="ecm-input-icon" />
                    <input
                      type="date"
                      className="ecm-input"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Start Date *</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <Calendar size={16} className="ecm-input-icon" />
                    <input
                      type="date"
                      className="ecm-input"
                      value={formData.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>End Date *</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <Calendar size={16} className="ecm-input-icon" />
                    <input
                      type="date"
                      className="ecm-input"
                      value={formData.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Financials & Agreement Lifecycle */}
            <div className="ecm-card">
              <div className="ecm-card-header">
                <span className="ecm-card-badge ecm-badge-emerald">
                  <IndianRupee size={13} /> Financials &amp; Lifecycle Status
                </span>
              </div>

              <div className="ecm-grid-3">
                {/* Total Value */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Total Value *</span>
                    
                  </label>
                  <div className="ecm-input-wrapper">
                    <IndianRupee size={16} className="ecm-input-icon" />
                    <input
                      type="text"
                      className="ecm-input"
                      value={formData.totalContractValue}
                      onChange={(e) => setFormData({ ...formData, totalContractValue: e.target.value })}
                      placeholder="e.g. ₹39,648"
                      required
                    />
                  </div>
                </div>

                {/* Payment Status Dropdown */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Payment Status *</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <CheckCircle2 size={16} className="ecm-input-icon" />
                    <select
                      className="ecm-select"
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    >
                      <option value="Yes">Yes (Active Client &amp; Paid)</option>
                      <option value="No">No (Demo Trial / Unpaid)</option>
                    </select>
                  </div>
                </div>

                {/* Contract Status Dropdown */}
                <div className="ecm-field">
                  <label className="ecm-label">
                    <span>Contract Lifecycle Status *</span>
                  </label>
                  <div className="ecm-input-wrapper">
                    <Activity size={16} className="ecm-input-icon" />
                    <select
                      className="ecm-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Remarks & Scope Description */}
            <div className="ecm-card" style={{ marginBottom: 0 }}>
              <div className="ecm-card-header">
                <span className="ecm-card-badge ecm-badge-slate">
                  <FileText size={13} /> Agreement Scope &amp; Notes
                </span>
              </div>

              <div className="ecm-field">
                <textarea
                  className="ecm-textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional contractual terms, SLA specifics, or Sangam CRM internal notes..."
                />
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="ecm-footer">
            <div className="ecm-sync-badge">
              <span className="ecm-sync-dot" />
              <span>Auto-syncs to Sangam CRM</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="ecm-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ecm-btn-save"
                disabled={isSubmitting}
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

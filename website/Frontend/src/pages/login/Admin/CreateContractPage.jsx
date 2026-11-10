import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  Calendar,
  Check,
  X,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customSelectStyles } from './reactSelectStyles';
import { contractApi } from '../../../services/contractApi';
import { customerApi } from '../../../services/customerApi';
import { CONTRACT_STATUSES, CONTRACT_TYPES } from './contractVocabulary';

const statusOptions = CONTRACT_STATUSES.map((status) => ({ value: status, label: status }));
const typeOptions = CONTRACT_TYPES.map((type) => ({ value: type, label: type }));

/**
 * Every person the desk can put on a contract, with the companies that person
 * belongs to. Read from the live customer directory at open time, so a company
 * renamed or added after the page loaded shows up on the next contract.
 */
function buildPartyDirectory(customers) {
  const byPerson = new Map();

  const add = (personName, companyName) => {
    const name = String(personName || '').trim();
    const company = String(companyName || '').trim();
    if (!name || !company) return;

    const personKey = name.toLowerCase();
    if (!byPerson.has(personKey)) byPerson.set(personKey, { name, companies: new Set() });
    byPerson.get(personKey).companies.add(company);
  };

  (customers || []).forEach((customer) => {
    add(customer.name, customer.company);
    (customer.contacts || []).forEach((contact) => {
      const fullName = String(contact.name || '').trim() ||
        [contact.firstName, contact.lastName].filter(Boolean).join(' ');
      add(fullName, customer.company);
    });
  });

  return [...byPerson.values()]
    .map((person) => ({
      name: person.name,
      companies: [...person.companies].sort((a, b) => a.localeCompare(b))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function CreateContractPage({ contracts, setContracts }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const oneYearFromNow = nextYear.toISOString().split('T')[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  // 'loading' until the directory answers, 'ready' with rows, 'unavailable'
  // when the signed-in account cannot read customers or none exist yet.
  const [directoryState, setDirectoryState] = useState('loading');
  const [people, setPeople] = useState([]);

  useEffect(() => {
    let cancelled = false;

    customerApi
      .getCustomers()
      .then((data) => {
        if (cancelled) return;
        const directory = buildPartyDirectory(Array.isArray(data) ? data : []);
        setPeople(directory);
        setDirectoryState(directory.length ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (cancelled) return;
        setPeople([]);
        setDirectoryState('unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [formState, setFormState] = useState({
    name: '',
    status: 'In Progress',
    orderDate: today,
    person: '',
    company: '',
    startDate: today,
    endDate: oneYearFromNow,
    contractType: 'Comprehensive',
    contractValue: ''
  });

  const setField = (field) => (value) => setFormState((prev) => ({ ...prev, [field]: value }));

  const personOptions = useMemo(
    () => people.map((person) => ({ value: person.name, label: person.name, companies: person.companies })),
    [people]
  );

  const selectedPerson = useMemo(
    () => personOptions.find((option) => option.value === formState.person) || null,
    [personOptions, formState.person]
  );

  // One company means there is nothing to choose; several means the desk has
  // to say which account this contract is raised for.
  const personCompanyOptions = useMemo(
    () => (selectedPerson && selectedPerson.companies.length > 1
      ? selectedPerson.companies.map((company) => ({ value: company, label: company }))
      : []),
    [selectedPerson]
  );

  const handlePersonChange = (option) => {
    const companies = option ? option.companies : [];
    setFormState((prev) => ({
      ...prev,
      person: option ? option.value : '',
      company: companies.length === 1 ? companies[0] : ''
    }));
  };

  const directoryHint = {
    loading: 'Loading the customer directory...',
    unavailable: 'No customer records available. Add the customer first, then raise the contract.'
  }[directoryState];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formState.name.trim();
    const person = formState.person.trim();
    const company = formState.company.trim();
    const contractValue = formState.contractValue.trim();

    if (!name || !person || !company || !contractValue) {
      toast.error('Please complete the contract ID, person, company name and value.');
      return;
    }
    if (!formState.orderDate || !formState.startDate || !formState.endDate) {
      toast.error('Please set the order, start and end dates.');
      return;
    }
    if (formState.endDate <= formState.startDate) {
      toast.error('The end date must fall after the start date.');
      return;
    }

    setIsSubmitting(true);

    const formattedVal = contractValue.startsWith('₹') ? contractValue : `₹${contractValue}`;

    // The term, the service line and the Sangam account link are all worked out
    // from these dates and this company name by the register, so the form sends
    // only what the desk actually typed. The Contract ID travels as `name`,
    // which is the field Sangam CRM labels Contract Name.
    const payload = {
      name,
      status: formState.status,
      orderDate: formState.orderDate,
      customer: person,
      company,
      startDate: formState.startDate,
      endDate: formState.endDate,
      contractType: formState.contractType,
      totalContractValue: formattedVal,
      value: formattedVal
    };

    try {
      const res = await contractApi.createContract(payload);
      const createdContract = res.contract || {
        id: `CTR-${new Date().getFullYear()}-0000`,
        ...payload
      };

      setContracts([createdContract, ...(contracts || [])]);

      contractApi.getContracts().then((live) => {
        if (live && Array.isArray(live)) setContracts(live);
      });

      if (res.sangamCrm?.status === 'synced') {
        toast.success(
          `Contract created for ${company} and synchronized to Sangam CRM! (Record ID: ${res.sangamCrm.recordId})`,
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

  const dateField = (field, label, options = {}) => (
    <div className="adm-form-field">
      <label className="adm-form-label">
        {label} <span className="adm-required-star">*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="date"
          className="adm-form-input"
          value={formState[field]}
          min={options.min}
          onChange={(e) => setField(field)(e.target.value)}
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
  );

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

        <div className="adm-create-header-action">
          <button
            type="button"
            className="adm-back-btn"
            onClick={() => navigate('/admin/customer/contract')}
          >
            <ArrowLeft size={16} />
            <span>Back to Contracts</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card adm-create-contract-card">
        <form id="create-contract-form" onSubmit={handleSubmit}>
          <div className="adm-form-section adm-create-contract-section">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                gap: '20px',
                marginTop: '16px'
              }}
            >
              {/* 1. Contract ID */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Contract Name/ID <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the contract ID"
                  value={formState.name}
                  onChange={(e) => setField('name')(e.target.value)}
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
                  options={statusOptions}
                  value={statusOptions.find((s) => s.value === formState.status) || statusOptions[0]}
                  onChange={(opt) => setField('status')(opt ? opt.value : 'In Progress')}
                  placeholder="Select status..."
                  classNamePrefix="react-select"
                  menuPlacement="auto"
                />
              </div>

              {/* 3. Order Date */}
              {dateField('orderDate', 'Order Date')}

              {/* 4. Person */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Person <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  options={personOptions}
                  value={personOptions.find((option) => option.value === formState.person) || null}
                  onChange={handlePersonChange}
                  isClearable
                  placeholder={directoryState === 'loading'
                    ? 'Loading customers...'
                    : directoryState === 'unavailable'
                      ? 'No customer records found'
                      : 'Search customer by name...'}
                  noOptionsMessage={() => 'No matching customer in the directory'}
                  formatOptionLabel={(option, info) => {
                    if (info.context === 'value') return option.label;
                    const [first, ...rest] = option.companies;
                    return (
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', width: '100%' }}>
                        <span>{option.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                          {first ? `${first}${rest.length ? ` +${rest.length}` : ''}` : ''}
                        </span>
                      </span>
                    );
                  }}
                  classNamePrefix="react-select"
                  menuPlacement="auto"
                />
                {directoryState !== 'ready' && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{directoryHint}</p>
                )}
              </div>

              {/* 5. Company Name */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Company Name <span className="adm-required-star">*</span>
                </label>
                {personCompanyOptions.length > 1 ? (
                  <Select
                    styles={customSelectStyles}
                    options={personCompanyOptions}
                    value={personCompanyOptions.find((option) => option.value === formState.company) || null}
                    onChange={(opt) => setField('company')(opt ? opt.value : '')}
                    placeholder="Select company..."
                    classNamePrefix="react-select"
                    menuPlacement="auto"
                  />
                ) : (
                  <input
                    type="text"
                    className="adm-form-input"
                    placeholder={selectedPerson ? '' : 'Choose the person first'}
                    value={formState.company}
                    onChange={(e) => setField('company')(e.target.value)}
                    readOnly={!!selectedPerson}
                    required
                  />
                )}
                {personCompanyOptions.length > 1 && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                    This person is on more than one account — pick the company this contract covers.
                  </p>
                )}
              </div>

              {/* 6. Start Date */}
              {dateField('startDate', 'Start Date')}

              {/* 7. End Date */}
              {dateField('endDate', 'End Date', { min: formState.startDate })}

              {/* 8. Contract Type */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Contract Type <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={typeOptions}
                  value={typeOptions.find((t) => t.value === formState.contractType) || typeOptions[0]}
                  onChange={(opt) => setField('contractType')(opt ? opt.value : 'Comprehensive')}
                  placeholder="Select contract type..."
                  classNamePrefix="react-select"
                  menuPlacement="auto"
                />
              </div>

              {/* 9. Contract Value */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Contract Value <span className="adm-required-star">*</span>
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
                    value={formState.contractValue}
                    onChange={(e) => setField('contractValue')(e.target.value)}
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

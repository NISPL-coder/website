import { notificationApi } from '../../../services/notificationApi';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  ArrowLeft,
  Mail,
  Phone,
  Check,
  UserCheck,
  MapPin,
  X,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  COUNTRIES,
  getStatesByCountry,
  getCitiesByState
} from './locationData';
import { customSelectStyles } from './reactSelectStyles';
import { customerApi } from '../../../services/customerApi';

export default function CreateCustomerPage({ customers, setCustomers }) {
  const navigate = useNavigate();

  // Selected Country, State, City for cascading filtration
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedCity, setSelectedCity] = useState('Kolkata');
  const [customCityInput, setCustomCityInput] = useState('');

  // Contact & Address Details
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    email: '',
    phone: '',
    company: '',
    gstNo: '',
    tallySerialNo: '',
    street: '',
    area: '',
    postalCode: ''
  });

  // Country Options formatted for React Select
  const countryOptions = useMemo(() => {
    return COUNTRIES.map((c) => ({ value: c, label: c }));
  }, []);

  // Dynamically derive filtered States based on selected Country
  const availableStates = useMemo(() => {
    return getStatesByCountry(selectedCountry);
  }, [selectedCountry]);

  const stateOptions = useMemo(() => {
    return availableStates.map((s) => ({ value: s, label: s }));
  }, [availableStates]);

  // Dynamically derive filtered Cities based on selected State & Country
  const availableCities = useMemo(() => {
    return getCitiesByState(selectedCountry, selectedState);
  }, [selectedCountry, selectedState]);

  const cityOptions = useMemo(() => {
    const list = availableCities.map((city) => ({ value: city, label: city }));
    list.push({ value: 'Other', label: 'Other (Custom City)...' });
    return list;
  }, [availableCities]);

  // Handler for Country change: updates State and City automatically
  const handleCountryChange = (selected) => {
    const nextCountry = selected?.value || 'India';
    setSelectedCountry(nextCountry);

    const states = getStatesByCountry(nextCountry);
    const nextState = states[0] || '';
    setSelectedState(nextState);

    const cities = getCitiesByState(nextCountry, nextState);
    const nextCity = cities[0] || '';
    setSelectedCity(nextCity);
    setCustomCityInput('');
  };

  // Handler for State change: updates City automatically
  const handleStateChange = (selected) => {
    const nextState = selected?.value || '';
    setSelectedState(nextState);

    const cities = getCitiesByState(selectedCountry, nextState);
    const nextCity = cities[0] || '';
    setSelectedCity(nextCity);
    setCustomCityInput('');
  };

  // Handler for City change
  const handleCityChange = (selected) => {
    const nextCity = selected?.value || '';
    setSelectedCity(nextCity);
    if (nextCity !== 'Other') {
      setCustomCityInput('');
    }
  };

  const isCustomCity = selectedCity === 'Other';
  const effectiveCity = isCustomCity ? customCityInput.trim() || 'Custom City' : selectedCity;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // The register keeps one display name for the person, so the two halves are
    // joined before they leave the form; the halves are stored alongside it.
    const fullName = [formState.firstName, formState.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ');

    if (!fullName) {
      toast.error('Please enter the first name.');
      return;
    }
    if (!formState.company.trim()) {
      toast.error('Please enter the company name.');
      return;
    }
    if (!formState.email.trim()) {
      toast.error('Please enter the email address.');
      return;
    }
    if (!formState.phone.trim()) {
      toast.error('Please enter the phone number.');
      return;
    }
    if (isCustomCity && !customCityInput.trim()) {
      toast.error('Please enter your custom city name.');
      return;
    }

    const cityLoc = `${effectiveCity}, ${selectedState}`;
    const addressParts = [
      formState.street,
      formState.area,
      effectiveCity,
      selectedState,
      formState.postalCode,
      selectedCountry
    ].filter(Boolean).join(', ');

    const customerPayload = {
      name: fullName,
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      designation: formState.designation.trim(),
      company: formState.company.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      gstNo: formState.gstNo.trim(),
      tallySerialNo: formState.tallySerialNo.trim(),
      city: cityLoc,
      address: {
        street: formState.street || '',
        area: formState.area || '',
        city: effectiveCity,
        state: selectedState,
        country: selectedCountry,
        postalCode: formState.postalCode || ''
      },
      plan: 'Tally Prime Cloud + VPS Gold',
      serverNode: 'CtrlS-KOL-NODE-01',
      status: 'active',
      mrr: '₹15,000',
      accountRelationship: 'Customer'
    };

    setIsSubmitting(true);
    const toastId = toast.loading('Saving customer & synchronizing to Sangam CRM...');

    try {
      // 1. Send to backend to save locally & sync with Sangam CRM
      const res = await customerApi.createCustomer(customerPayload);
      const createdCustomer = res.customer;
      const sangamStatus = res.sangamCrm?.status;

      setCustomers((prev) => [createdCustomer, ...prev.filter((c) => c.id !== createdCustomer.id)]);

      notificationApi.createNotification({
        type: 'customer_created',
        title: 'Customer Account Created',
        message: `New customer account "${customerPayload.name}" (${customerPayload.company || customerPayload.email}) created for plan ${customerPayload.plan || 'Tally Prime Cloud'}.`,
        severity: 'success',
        entityType: 'customer',
        entityId: createdCustomer.customerId || createdCustomer.id || customerPayload.customerId,
        user: {
          name: customerPayload.name,
          email: customerPayload.email,
          company: customerPayload.company
        },
        metadata: {
          customerId: createdCustomer.customerId || createdCustomer.id,
          plan: customerPayload.plan,
          serverNode: customerPayload.serverNode,
          mrr: customerPayload.mrr
        }
      });

      if (sangamStatus === 'synced') {
        toast.success(
          `Customer created & synced to Sangam CRM Companies (Record ID: ${res.sangamCrm.recordId})!`,
          { id: toastId, duration: 4500 }
        );
      } else {
        toast.success(
          `Customer saved locally. Sangam CRM sync pending/retryable (${res.sangamCrm?.syncError || 'queued'}).`,
          { id: toastId, duration: 4000 }
        );
      }

      customerApi.getCustomers().then((live) => {
        if (live && Array.isArray(live)) setCustomers(live);
      });

      navigate('/admin/customer');
    } catch (err) {
      console.warn('[CreateCustomerPage] Backend sync call failed, falling back to local state:', err.message);

      // Fallback local resilience if backend server is not running
      const fallbackCustomer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: fullName,
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        designation: formState.designation.trim(),
        company: customerPayload.company,
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        gstNo: formState.gstNo.trim(),
        tallySerialNo: formState.tallySerialNo.trim(),
        city: cityLoc,
        address: addressParts || cityLoc,
        country: selectedCountry,
        state: selectedState,
        plan: 'Tally Prime Cloud + VPS Gold',
        serverNode: 'CtrlS-KOL-NODE-01',
        status: 'active',
        registered: new Date().toISOString().split('T')[0],
        mrr: '₹15,000',
        sangamCrm: {
          status: 'failed',
          recordId: null,
          lastSyncedAt: new Date().toISOString(),
          syncError: err.message
        }
      };

      setCustomers((prev) => [fallbackCustomer, ...prev]);

      notificationApi.createNotification({
        type: 'customer_created',
        title: 'Customer Account Created',
        message: `Customer "${fallbackCustomer.name}" (${fallbackCustomer.company}) registered.`,
        severity: 'success',
        entityType: 'customer',
        entityId: fallbackCustomer.customerId || fallbackCustomer.id,
        user: {
          name: fallbackCustomer.name,
          email: fallbackCustomer.email,
          company: fallbackCustomer.company
        },
        metadata: {
          customerId: fallbackCustomer.customerId,
          plan: fallbackCustomer.plan
        }
      });
      toast.error(`Saved locally. Sangam CRM synchronization failed: ${err.message}`, {
        id: toastId,
        duration: 4000
      });
      customerApi.getCustomers().then((live) => {
        if (live && Array.isArray(live)) setCustomers(live);
      });

      navigate('/admin/customer');
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
            <span className="adm-breadcrumb-mute">Companies</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span
              className="adm-breadcrumb-link"
              onClick={() => navigate('/admin/customer')}
            >
              Customer Accounts
            </span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-active">Create</span>
          </div>

          <div className="adm-create-title-group">
            <h1 className="adm-section-title">Create Customer</h1>
            <p className="adm-section-sub">
              Enter primary contact details and physical address information.
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="adm-create-header-action adm-header-actions-group">
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => navigate('/admin/customer')}
            disabled={isSubmitting}
          >
            <X size={15} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            form="create-customer-form"
            className="adm-btn-primary"
            disabled={isSubmitting}
          >
            <Check size={15} />
            <span>{isSubmitting ? 'Syncing...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="adm-table-card adm-form-card">
        <form id="create-customer-form" onSubmit={handleSubmit}>
          {/* Section 1: Overview (Name, Email, Phone) */}
          <div className="adm-form-section">
            <div className="adm-form-section-title">
              <UserCheck size={18} className="adm-form-section-icon purple" />
              <span>Contact Overview</span>
            </div>

            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label className="adm-form-label">
                  First Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the first name"
                  value={formState.firstName}
                  onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Last Name</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the last name"
                  value={formState.lastName}
                  onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Designation</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="e.g. Finance Manager"
                  value={formState.designation}
                  onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Email <span className="adm-required-star">*</span>
                </label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="Enter your email address"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Phone No. <span className="adm-required-star">*</span>
                </label>
                <input
                  type="tel"
                  className="adm-form-input"
                  placeholder="Enter your phone number"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">
                  Company Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter company / firm name"
                  value={formState.company}
                  onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">GSTIN</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the GSTIN"
                  value={formState.gstNo}
                  onChange={(e) => setFormState({ ...formState, gstNo: e.target.value })}
                />
              </div>

              <div className="adm-form-field">
                <label className="adm-form-label">Tally SL No.</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter the Tally serial number"
                  value={formState.tallySerialNo}
                  onChange={(e) => setFormState({ ...formState, tallySerialNo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Information (React Select Cascading Dropdowns) */}
          <div className="adm-form-section" style={{ marginTop: '28px' }}>
            <div className="adm-form-section-title">
              <MapPin size={18} className="adm-form-section-icon blue" />
              <span>Address Information</span>
            </div>

            <div className="adm-form-grid">
              {/* Country Selection with React Select */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  Country <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={countryOptions}
                  value={{ value: selectedCountry, label: selectedCountry }}
                  onChange={handleCountryChange}
                  placeholder="Search and select country..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* State Selection with React Select (Filtered by Country) */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  State / Province <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={stateOptions}
                  value={selectedState ? { value: selectedState, label: selectedState } : null}
                  onChange={handleStateChange}
                  placeholder="Search and select state..."
                  classNamePrefix="react-select"
                />
              </div>

              {/* City Selection with React Select (Filtered by State) */}
              <div className="adm-form-field">
                <label className="adm-form-label">
                  City <span className="adm-required-star">*</span>
                </label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={true}
                  options={cityOptions}
                  value={
                    selectedCity
                      ? selectedCity === 'Other'
                        ? { value: 'Other', label: 'Other (Custom City)...' }
                        : { value: selectedCity, label: selectedCity }
                      : null
                  }
                  onChange={handleCityChange}
                  placeholder="Search and select city..."
                  classNamePrefix="react-select"
                />

                {isCustomCity && (
                  <input
                    type="text"
                    className="adm-form-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Enter custom city name"
                    value={customCityInput}
                    onChange={(e) => setCustomCityInput(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Postal Code */}
              <div className="adm-form-field">
                <label className="adm-form-label">Postal / PIN Code</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your postal code"
                  value={formState.postalCode}
                  onChange={(e) => setFormState({ ...formState, postalCode: e.target.value })}
                />
              </div>

              {/* Street Address (Full Width for clarity) */}
              <div className="adm-form-field full-width">
                <label className="adm-form-label">Street / Location</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter street address, building or suite"
                  value={formState.street}
                  onChange={(e) => setFormState({ ...formState, street: e.target.value })}
                />
              </div>

              {/* Area / Locality */}
              <div className="adm-form-field">
                <label className="adm-form-label">Area / Locality</label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your area"
                  value={formState.area}
                  onChange={(e) => setFormState({ ...formState, area: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Bottom Form Actions */}
          <div className="adm-form-footer">
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => navigate('/admin/customer')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Syncing to Sangam CRM...' : 'Save Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

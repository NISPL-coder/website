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

const ADDRESS_TYPE_OPTIONS = [
  { value: 'Office / Billing', label: 'Office / Billing Address' },
  { value: 'Corporate HQ', label: 'Corporate Headquarters' },
  { value: 'Branch Office', label: 'Branch / Regional Office' },
  { value: 'Datacenter Node', label: 'Datacenter / Hypervisor Node' },
  { value: 'Registered Legal', label: 'Registered Legal Entity' }
];

export default function CreateCustomerPage({ customers, setCustomers }) {
  const navigate = useNavigate();

  // Selected Country, State, City for cascading filtration
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedCity, setSelectedCity] = useState('Kolkata');
  const [customCityInput, setCustomCityInput] = useState('');

  // Contact & Address Details
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    addressType: 'Office / Billing',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast.error('Please enter the customer name.');
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
      formState.addressType,
      formState.street,
      formState.area,
      effectiveCity,
      selectedState,
      formState.postalCode,
      selectedCountry
    ].filter(Boolean).join(', ');

    const newCustomer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formState.name.trim(),
      company: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      city: cityLoc,
      address: addressParts || cityLoc,
      country: selectedCountry,
      state: selectedState,
      plan: 'Tally Prime Cloud + VPS Gold',
      serverNode: 'CtrlS-KOL-NODE-01',
      status: 'active',
      registered: new Date().toISOString().split('T')[0],
      mrr: '₹15,000'
    };

    setCustomers([newCustomer, ...customers]);
    toast.success(`Customer "${newCustomer.name}" created successfully!`, {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '0.85rem'
      }
    });

    navigate('/admin/customer');
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
              <div className="adm-form-field full-width">
                <label className="adm-form-label">
                  Name <span className="adm-required-star">*</span>
                </label>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Enter your name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
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
                  Phone <span className="adm-required-star">*</span>
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

              {/* Address Type with React Select */}
              <div className="adm-form-field">
                <label className="adm-form-label">Address Type</label>
                <Select
                  styles={customSelectStyles}
                  isSearchable={false}
                  options={ADDRESS_TYPE_OPTIONS}
                  value={
                    ADDRESS_TYPE_OPTIONS.find((t) => t.value === formState.addressType) ||
                    ADDRESS_TYPE_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    setFormState({ ...formState, addressType: opt?.value || 'Office / Billing' })
                  }
                  classNamePrefix="react-select"
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
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              <Check size={16} />
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

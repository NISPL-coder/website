import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterHeader from './components/RegisterHeader';
import CustomerFormCard from './components/CustomerFormCard';
import RegistrationSuccessModal from './components/RegistrationSuccessModal';
import { customerAuthService } from './services/customerAuthService';
import { 
  validateName, 
  validateEmail, 
  validateMobile, 
  validateCompanyName, 
  validateGstNo, 
  validatePassword, 
  validatePasswordMatch 
} from './utils/validation';
import '../login/LoginPage.css';
import './CustomerRegister.css';

export default function CustomerRegisterPage() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    companyName: '',
    companyLogo: '',
    gstNo: '',
    password: '',
    retypePassword: ''
  });

  // Validation Errors State
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);

  // Field change handler with live validation clearance
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear individual error when user modifies field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
    if (globalError) {
      setGlobalError('');
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const mobileErr = validateMobile(formData.mobile);
    if (mobileErr) newErrors.mobile = mobileErr;

    const companyErr = validateCompanyName(formData.companyName);
    if (companyErr) newErrors.companyName = companyErr;

    const gstErr = validateGstNo(formData.gstNo);
    if (gstErr) newErrors.gstNo = gstErr;

    const pwdErr = validatePassword(formData.password);
    if (pwdErr) newErrors.password = pwdErr;

    const retypeErr = validatePasswordMatch(formData.password, formData.retypePassword);
    if (retypeErr) newErrors.retypePassword = retypeErr;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      setGlobalError(firstError);
      return false;
    }

    return true;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newCustomer = await customerAuthService.createCustomer({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        companyName: formData.companyName,
        companyLogo: formData.companyLogo,
        gstNo: formData.gstNo,
        password: formData.password
      });

      setCreatedCustomer(newCustomer);
    } catch (err) {
      setGlobalError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToDashboard = () => {
    navigate('/customer/dashboard');
  };

  return (
    <div className="ebolt-login-viewport">
      {/* Top Header Navigation */}
      <RegisterHeader />

      {/* Main Registration Section */}
      <main className="cust-reg-container">
        <CustomerFormCard
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          globalError={globalError}
        />
      </main>

      {/* Confirmation Modal upon Successful Account Creation */}
      {createdCustomer && (
        <RegistrationSuccessModal
          customer={createdCustomer}
          onProceed={handleProceedToDashboard}
        />
      )}
    </div>
  );
}

/**
 * Validation utilities for NISPL Customer Registration
 */

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g., name@company.com).';
  }
  return '';
};

export const validateMobile = (mobile) => {
  if (!mobile || !mobile.trim()) {
    return 'Mobile number is required.';
  }
  // Remove non-digit characters
  const cleanNumber = mobile.replace(/\D/g, '');
  // Match standard 10 digit Indian mobile numbers (or 11/12 with prefix)
  const mobileRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;
  if (!mobileRegex.test(mobile.trim()) && cleanNumber.length !== 10) {
    return 'Please enter a valid 10-digit mobile number.';
  }
  return '';
};

export const validateCompanyName = (companyName) => {
  if (!companyName || !companyName.trim()) {
    return 'Company / Enterprise name is required.';
  }
  if (companyName.trim().length < 2) {
    return 'Company name must be at least 2 characters.';
  }
  return '';
};

export const validateGstNo = (gstNo) => {
  if (!gstNo || !gstNo.trim()) {
    return 'GST number is required.';
  }
  const cleanGst = gstNo.trim().toUpperCase();
  // Standard Indian GSTIN pattern: 2 digits state code + 10 PAN chars + 1 entity + Z + 1 check digit = 15 chars
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (cleanGst.length !== 15) {
    return 'GST number must be exactly 15 alphanumeric characters.';
  }
  if (!gstRegex.test(cleanGst)) {
    return 'Invalid GSTIN format (e.g. 19AAAAA0000A1Z5).';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return '';
};

export const validatePasswordMatch = (password, retypePassword) => {
  if (!retypePassword) {
    return 'Please re-enter your password to confirm.';
  }
  if (password !== retypePassword) {
    return 'Passwords do not match.';
  }
  return '';
};

export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: '', color: '#CBD5E1', percent: 0 };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Weak', color: '#EF4444', percent: 33 };
  } else if (score <= 3) {
    return { score: 2, label: 'Medium', color: '#F59E0B', percent: 66 };
  } else {
    return { score: 3, label: 'Strong', color: '#10B981', percent: 100 };
  }
};

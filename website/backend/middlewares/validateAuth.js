/**
 * Input validation middleware for Auth routes
 */

export const validateRegister = (req, res, next) => {
  const { name, email, mobile, companyName, gstNo, password } = req.body || {};
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full Name is required (minimum 2 characters).');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid corporate email address is required.');
  }

  // Mobile validation (Indian 10-digit format)
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '') : '';
  if (!cleanMobile || cleanMobile.length < 10) {
    errors.push('A valid 10-digit mobile number is required.');
  }

  // Company Name
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
    errors.push('Company or enterprise name is required.');
  }

  // GST No validation (15-character Indian GSTIN format)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  if (!gstNo || typeof gstNo !== 'string' || !gstRegex.test(gstNo.trim())) {
    errors.push('A valid 15-character GSTIN format is required (e.g. 19AAACA1234A1Z5).');
  }

  // Password validation (minimum 6 characters)
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email address or Customer ID is required.');
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      errors
    });
  }

  next();
};

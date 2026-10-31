// Custom styles for React Select to seamlessly match the FlowMail Admin Design System
export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '44px',
    height: '44px',
    borderRadius: '10px',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderWidth: '1.5px',
    backgroundColor: '#ffffff',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(99, 102, 241, 0.12)' : 'none',
    fontSize: '0.95rem',
    color: '#0f172a',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      borderColor: state.isFocused ? '#6366f1' : '#cbd5e1'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 14px',
    height: '42px',
    display: 'flex',
    alignItems: 'center'
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: '#0f172a',
    fontWeight: '500'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: '0.90rem'
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '500',
    fontSize: '0.95rem'
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    boxShadow: '0 14px 35px -4px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    zIndex: 9999,
    marginTop: '6px',
    backgroundColor: '#ffffff'
  }),
  menuList: (base) => ({
    ...base,
    padding: '6px',
    maxHeight: '260px'
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '0.90rem',
    fontWeight: state.isSelected ? '600' : '500',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
      ? '#f1f5f9'
      : 'transparent',
    cursor: 'pointer',
    marginBottom: '2px',
    '&:active': {
      backgroundColor: '#4f46e5',
      color: '#ffffff'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#6366f1' : '#64748b',
    padding: '0 12px',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#6366f1'
    }
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    padding: '0 8px',
    cursor: 'pointer',
    '&:hover': {
      color: '#dc2626'
    }
  })
};

// Compact variant for table toolbar filters and header bars
export const compactSelectStyles = {
  ...customSelectStyles,
  control: (base, state) => ({
    ...customSelectStyles.control(base, state),
    minHeight: '36px',
    height: '36px',
    borderRadius: '9px',
    fontSize: '0.84rem',
    fontWeight: '600',
    minWidth: '175px'
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 10px',
    height: '34px',
    display: 'flex',
    alignItems: 'center'
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.84rem'
  }),
  option: (base, state) => ({
    ...customSelectStyles.option(base, state),
    padding: '7px 11px',
    fontSize: '0.82rem'
  })
};

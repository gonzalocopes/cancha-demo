export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  // Validar formato de teléfono (acepta varios formatos)
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = 'Este campo es requerido';
      return;
    }

    if (fieldRules.minLength && !validateMinLength(value, fieldRules.minLength)) {
      errors[field] = `Debe tener al menos ${fieldRules.minLength} caracteres`;
      return;
    }

    if (fieldRules.maxLength && !validateMaxLength(value, fieldRules.maxLength)) {
      errors[field] = `No puede tener más de ${fieldRules.maxLength} caracteres`;
      return;
    }

    if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Email inválido';
      return;
    }

    if (fieldRules.phone && !validatePhone(value)) {
      errors[field] = 'Teléfono inválido';
      return;
    }

    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.customMessage || 'Valor inválido';
      return;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

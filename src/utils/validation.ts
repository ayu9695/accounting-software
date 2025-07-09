
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (data: Record<string, any>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return;
    
    // Min length validation
    if (rule.min && typeof value === 'string' && value.length < rule.min) {
      errors[field] = `${field} must be at least ${rule.min} characters`;
      return;
    }
    
    // Max length validation
    if (rule.max && typeof value === 'string' && value.length > rule.max) {
      errors[field] = `${field} must be no more than ${rule.max} characters`;
      return;
    }
    
    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[field] = `${field} format is invalid`;
      return;
    }
    
    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+/,
  number: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: patterns.email,
    max: 100
  },
  phone: {
    pattern: patterns.phone,
    max: 20
  },
  name: {
    required: true,
    min: 2,
    max: 50
  },
  amount: {
    required: true,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return 'Amount must be a positive number';
      return null;
    }
  }
};

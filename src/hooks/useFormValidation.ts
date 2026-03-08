import { useState, useCallback } from 'react';

/**
 * Validation rule function
 */
export type ValidationRule = (value: any) => string | null;

/**
 * Validation rules by field
 */
export interface ValidationRules {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

/**
 * Validation errors by field
 */
export interface ValidationErrors {
  [fieldName: string]: string | null;
}

/**
 * Form validation state
 */
export interface FormState {
  [fieldName: string]: any;
}

/**
 * useFormValidation hook
 * Provides form validation with error tracking and form state management
 *
 * Usage:
 * ```tsx
 * const validation = useFormValidation(
 *   { email: '', password: '' },
 *   {
 *     email: [isRequired, isEmail],
 *     password: [isRequired, minLength(8)]
 *   }
 * );
 *
 * const { form, errors, isValid, setField, validate, reset } = validation;
 * ```
 */
export function useFormValidation(initialForm: FormState, rules: ValidationRules) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const fieldRules = rules[fieldName];
      if (!fieldRules) return null;

      const ruleArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

      for (const rule of ruleArray) {
        const error = rule(value);
        if (error) {
          return error;
        }
      }

      return null;
    },
    [rules]
  );

  const setField = useCallback(
    (fieldName: string, value: any) => {
      setForm((prev) => ({ ...prev, [fieldName]: value }));

      // Validate only if field has been touched
      if (touched.has(fieldName)) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    },
    [validateField, touched]
  );

  const markTouched = useCallback((fieldName: string) => {
    setTouched((prev) => new Set([...prev, fieldName]));

    // Validate when field is touched
    const error = validateField(fieldName, form[fieldName]);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, [validateField, form]);

  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, form[fieldName]);
      newErrors[fieldName] = error;
      if (error) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(new Set(Object.keys(rules)));
    return isValid;
  }, [rules, form, validateField]);

  const reset = useCallback(() => {
    setForm(initialForm);
    setErrors({});
    setTouched(new Set());
  }, [initialForm]);

  const hasError = useCallback((fieldName: string): boolean => {
    return errors[fieldName] !== null && errors[fieldName] !== undefined;
  }, [errors]);

  const isValid = Object.values(errors).every((error) => error === null || error === undefined);

  return {
    form,
    errors,
    touched,
    isValid,
    setField,
    markTouched,
    validate,
    reset,
    hasError,
  };
}

// ============================================================================
// BUILT-IN VALIDATION RULES
// ============================================================================

export function isRequired(value: any): string | null {
  if (value === null || value === undefined || value === '') {
    return 'This field is required';
  }
  return null;
}

export function isEmail(value: string): string | null {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function minLength(min: number) {
  return (value: string): string | null => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  };
}

export function maxLength(max: number) {
  return (value: string): string | null => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  };
}

export function isNumber(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (isNaN(Number(value))) {
    return 'Must be a valid number';
  }
  return null;
}

export function minValue(min: number) {
  return (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) < min) {
      return `Must be at least ${min}`;
    }
    return null;
  };
}

export function maxValue(max: number) {
  return (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  };
}

export function matches(pattern: RegExp) {
  return (value: string): string | null => {
    if (!value) return null;
    if (!pattern.test(value)) {
      return 'Invalid format';
    }
    return null;
  };
}

export function custom(fn: (value: any) => boolean, message: string) {
  return (value: any): string | null => {
    if (!fn(value)) {
      return message;
    }
    return null;
  };
}

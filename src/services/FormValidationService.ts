/**
 * FormValidationService - Unified form validation schemas
 * Consolidates validation rules for Setup, Settings, EventPlanner, etc.
 * Single source of truth for form validation across the app
 */

import {
  isRequired,
  isEmail,
  minLength,
  maxLength,
  isNumber,
  minValue,
  maxValue,
  matches,
  custom,
  type ValidationRule,
} from '@/hooks/useFormValidation';

// ============================================================================
// RIDER PROFILE VALIDATION
// ============================================================================

export const RiderProfileValidation = {
  name: [isRequired, minLength(2), maxLength(100)],
  email: [isRequired, isEmail],
  ftp: [isRequired, isNumber, minValue(50), maxValue(600)],
  weight: [isRequired, isNumber, minValue(30), maxValue(150)],
  maxHr: [isNumber, minValue(100), maxValue(220)],
  restingHr: [isNumber, minValue(30), maxValue(100)],
  lthr: [isNumber, minValue(100), maxValue(220)],
  experience: [isRequired, custom((v) => ['beginner', 'intermediate', 'advanced'].includes(v), 'Invalid experience level')],
};

// ============================================================================
// SETUP WIZARD VALIDATION
// ============================================================================

export const SetupWizardValidation = {
  step1: {
    name: [isRequired, minLength(2)],
    email: [isRequired, isEmail],
  },
  step2: {
    ftp: [isRequired, isNumber, minValue(50), maxValue(600)],
    weight: [isRequired, isNumber, minValue(30), maxValue(150)],
  },
  step3: {
    experience: [isRequired],
    trainingDays: [custom((v: string[]) => v.length >= 3, 'Select at least 3 training days')],
  },
};

// ============================================================================
// RACE EVENT VALIDATION
// ============================================================================

export const RaceEventValidation = {
  name: [isRequired, minLength(3), maxLength(100)],
  date: [isRequired, custom((v) => new Date(v) > new Date(), 'Event must be in the future')],
  type: [isRequired, custom((v) => ['ROAD', 'MOUNTAIN', 'GRAVEL', 'TRIATHLON'].includes(v), 'Invalid event type')],
  priority: [isRequired, custom((v) => ['A', 'B', 'C'].includes(v), 'Invalid priority')],
  location: [maxLength(100)],
  distance: [custom((v) => !v || /^\d+(\.\d+)?$/.test(v), 'Distance must be a number')],
};

// ============================================================================
// VACATION VALIDATION
// ============================================================================

export const VacationValidation = {
  startDate: [isRequired, custom((v) => new Date(v) > new Date(), 'Start date must be in the future')],
  endDate: [isRequired],
  type: [isRequired, custom((v) => ['complete_break', 'light_activity', 'cross_training'].includes(v), 'Invalid vacation type')],
  description: [maxLength(500)],
  location: [maxLength(100)],
};

// ============================================================================
// WORKOUT LOGGING VALIDATION
// ============================================================================

export const WorkoutValidation = {
  date: [isRequired],
  sessionTitle: [isRequired, minLength(3), maxLength(100)],
  duration: [isRequired, isNumber, minValue(5), maxValue(600)],
  avgPower: [isNumber, minValue(0), maxValue(1000)],
  rpe: [isNumber, minValue(1), maxValue(10)],
  notes: [maxLength(1000)],
};

// ============================================================================
// TRAINING PREFERENCES VALIDATION
// ============================================================================

export const TrainingPreferencesValidation = {
  trainingDays: [custom((v: string[]) => v.length >= 3, 'Select at least 3 training days')],
  indoorSessionDuration: [isNumber, minValue(30), maxValue(180)],
  coachTone: [isRequired, custom((v) => ['friendly', 'motivational', 'sarcastic', 'clinical'].includes(v), 'Invalid tone')],
};

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

/**
 * Validate FTP change (can't change by more than 10% at once)
 */
export function validateFtpChange(oldFtp: number, newFtp: number): ValidationRule {
  return (value: number) => {
    const percentChange = Math.abs((value - oldFtp) / oldFtp) * 100;
    if (percentChange > 10) {
      return `FTP change limited to ±10%. Current: ${oldFtp}W, proposed: ${value}W (${percentChange.toFixed(1)}% change)`;
    }
    return null;
  };
}

/**
 * Validate dates don't overlap
 */
export function validateNoDateOverlap(existingDates: { start: Date; end: Date }[]): ValidationRule {
  return (value: any) => {
    const newStart = new Date(value.startDate);
    const newEnd = new Date(value.endDate);

    for (const { start, end } of existingDates) {
      if ((newStart >= start && newStart <= end) || (newEnd >= start && newEnd <= end)) {
        return 'Date range overlaps with existing event';
      }
    }
    return null;
  };
}

/**
 * Validate end date is after start date
 */
export function validateDateRange(startFieldName: string): ValidationRule {
  return (endDate: string, formData?: any) => {
    if (!formData || !formData[startFieldName]) return null;
    
    const start = new Date(formData[startFieldName]);
    const end = new Date(endDate);

    if (end <= start) {
      return 'End date must be after start date';
    }
    return null;
  };
}

/**
 * Validate time of day
 */
export function validateTimeOfDay(value: string): string | null {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) {
    return 'Invalid time format (use HH:MM)';
  }
  return null;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Get validation schema for a form type
 */
export function getValidationSchema(formType: string): any {
  const schemas: { [key: string]: any } = {
    'rider-profile': RiderProfileValidation,
    'setup-step1': SetupWizardValidation.step1,
    'setup-step2': SetupWizardValidation.step2,
    'setup-step3': SetupWizardValidation.step3,
    'race-event': RaceEventValidation,
    'vacation': VacationValidation,
    'workout': WorkoutValidation,
    'training-preferences': TrainingPreferencesValidation,
  };

  return schemas[formType] || {};
}

/**
 * Get error messages specific to field type
 */
export function getFieldHint(fieldName: string): string {
  const hints: { [key: string]: string } = {
    ftp: 'Functional Threshold Power (watts) - your average power for 60 minutes',
    weight: 'Body weight in kilograms',
    maxHr: 'Maximum heart rate (bpm)',
    restingHr: 'Resting heart rate (bpm)',
    lthr: 'Lactate Threshold Heart Rate (bpm)',
    trainingDays: 'Select the days you\'ll train each week',
    coachTone: 'Choose your preferred coaching style',
    experience: 'Your cycling experience level',
    indoorSessionDuration: 'How long you prefer indoor training sessions (minutes)',
  };

  return hints[fieldName] || '';
}

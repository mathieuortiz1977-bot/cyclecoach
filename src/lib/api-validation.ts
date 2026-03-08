/**
 * API Response Validation
 *
 * Validates API responses match expected schemas at runtime
 * Catches unexpected changes in API contracts early
 */

import type { RiderProfile, TrainingPlan, WorkoutData, StravaActivity } from '@/types';

/**
 * Validation result
 */
export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: string[];
}

/**
 * Type guard for checking object properties
 */
function hasProperties<T extends Record<string, any>>(
  obj: unknown,
  properties: (keyof T)[]
): obj is T {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const objAsRecord = obj as Record<string, any>;
  return properties.every((prop) => prop in objAsRecord);
}

/**
 * Validate RiderProfile response
 */
export function validateRiderProfile(data: unknown): ValidationResult<RiderProfile> {
  const errors: string[] = [];

  // Type guard check
  if (!hasProperties<RiderProfile>(data, ['id', 'ftp', 'weight'])) {
    errors.push('Missing required rider properties: id, ftp, weight');
    return { valid: false, data: undefined, errors };
  }

  // Type validation
  if (typeof data.id !== 'string') {
    errors.push('rider.id must be a string');
  }
  if (typeof data.ftp !== 'number') {
    errors.push('rider.ftp must be a number');
  }
  if (typeof data.weight !== 'number') {
    errors.push('rider.weight must be a number');
  }

  // Value range validation
  if (data.ftp < 0 || data.ftp > 600) {
    errors.push('rider.ftp must be between 0 and 600 watts');
  }
  if (data.weight < 30 || data.weight > 150) {
    errors.push('rider.weight must be between 30 and 150 kg');
  }

  return { valid: errors.length === 0, data: errors.length === 0 ? data : undefined, errors };
}

/**
 * Validate TrainingPlan response
 */
export function validateTrainingPlan(data: unknown): ValidationResult<TrainingPlan> {
  const errors: string[] = [];

  if (!hasProperties<TrainingPlan>(data, ['blocks'])) {
    errors.push('Missing required plan properties: blocks');
    return { valid: false, data: undefined, errors };
  }

  if (!Array.isArray(data.blocks)) {
    errors.push('plan.blocks must be an array');
    return { valid: false, data: undefined, errors };
  }

  if (data.blocks.length === 0) {
    errors.push('plan.blocks must contain at least one block');
  }

  // Validate block structure
  data.blocks.forEach((block: any, idx: number) => {
    if (!hasProperties<any>(block, ['type', 'weeks'])) {
      errors.push(`plan.blocks[${idx}] missing required properties: type, weeks`);
    }
    if (!Array.isArray(block.weeks) || block.weeks.length === 0) {
      errors.push(`plan.blocks[${idx}].weeks must be a non-empty array`);
    }
  });

  return { valid: errors.length === 0, data: errors.length === 0 ? data : undefined, errors };
}

/**
 * Validate WorkoutData response
 */
export function validateWorkoutData(data: unknown): ValidationResult<WorkoutData> {
  const errors: string[] = [];

  if (!hasProperties<WorkoutData>(data, ['id', 'date', 'completed'])) {
    errors.push('Missing required workout properties: id, date, completed');
    return { valid: false, data: undefined, errors };
  }

  if (typeof data.id !== 'string') {
    errors.push('workout.id must be a string');
  }
  if (typeof data.date !== 'string') {
    errors.push('workout.date must be a string (ISO format)');
  }
  if (typeof data.completed !== 'boolean') {
    errors.push('workout.completed must be a boolean');
  }

  // Validate date format
  if (typeof data.date === 'string') {
    try {
      new Date(data.date);
    } catch {
      errors.push('workout.date must be a valid ISO date string');
    }
  }

  return { valid: errors.length === 0, data: errors.length === 0 ? data : undefined, errors };
}

/**
 * Validate StravaActivity response
 */
export function validateStravaActivity(data: unknown): ValidationResult<StravaActivity> {
  const errors: string[] = [];

  if (!hasProperties<StravaActivity>(data, ['id', 'name'])) {
    errors.push('Missing required activity properties: id, name');
    return { valid: false, data: undefined, errors };
  }

  if (typeof data.id !== 'string' && typeof data.id !== 'number') {
    errors.push('activity.id must be a string or number');
  }
  if (typeof data.name !== 'string') {
    errors.push('activity.name must be a string');
  }

  return { valid: errors.length === 0, data: errors.length === 0 ? data : undefined, errors };
}

/**
 * Validate array of workouts
 */
export function validateWorkoutArray(data: unknown): ValidationResult<WorkoutData[]> {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Workouts response must be an array');
    return { valid: false, data: undefined, errors };
  }

  const validatedWorkouts: WorkoutData[] = [];

  data.forEach((workout, idx) => {
    const result = validateWorkoutData(workout);
    if (!result.valid) {
      errors.push(`workouts[${idx}]: ${result.errors.join(', ')}`);
    } else if (result.data) {
      validatedWorkouts.push(result.data);
    }
  });

  return { valid: errors.length === 0, data: errors.length === 0 ? validatedWorkouts : undefined, errors };
}

/**
 * Validate array of activities
 */
export function validateActivityArray(data: unknown): ValidationResult<StravaActivity[]> {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Activities response must be an array');
    return { valid: false, data: undefined, errors };
  }

  const validatedActivities: StravaActivity[] = [];

  data.forEach((activity, idx) => {
    const result = validateStravaActivity(activity);
    if (!result.valid) {
      errors.push(`activities[${idx}]: ${result.errors.join(', ')}`);
    } else if (result.data) {
      validatedActivities.push(result.data);
    }
  });

  return { valid: errors.length === 0, data: errors.length === 0 ? validatedActivities : undefined, errors };
}

/**
 * Log validation errors with context
 */
export function logValidationError(
  endpoint: string,
  validationResult: ValidationResult<any>,
  responseData?: any
) {
  if (!validationResult.valid) {
    console.error(`[API Validation] ${endpoint}:`, {
      errors: validationResult.errors,
      received: responseData,
    });
  }
}

/**
 * Safe data extraction with validation
 * Logs errors but doesn't throw, returns undefined on invalid data
 */
export function safeExtractData<T>(
  endpoint: string,
  data: unknown,
  validator: (data: unknown) => ValidationResult<T>
): T | undefined {
  const result = validator(data);

  if (!result.valid) {
    logValidationError(endpoint, result, data);
    return undefined;
  }

  return result.data;
}

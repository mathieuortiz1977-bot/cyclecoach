/**
 * MEDIUM PRIORITY EXAMPLES
 *
 * Examples for the 4 medium-priority code quality items:
 * 1. Form Validation
 * 2. Loading States & Skeleton UI
 * 3. API Response Validation
 * 4. TrainingCalendar Refactoring
 *
 * Delete this file after reviewing - it's reference documentation
 */

// ============================================================================
// 1. FORM VALIDATION EXAMPLE
// ============================================================================

/*
'use client';
import { useFormValidation, isRequired, isEmail, minLength, maxLength } from '@/hooks/useFormValidation';

export function SignupForm() {
  const validation = useFormValidation(
    { email: '', password: '', confirmPassword: '' },
    {
      email: [isRequired, isEmail],
      password: [isRequired, minLength(8)],
      confirmPassword: [
        isRequired,
        (value) => {
          if (value !== validation.form.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      ]
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.validate()) {
      // Form has errors, show them
      return;
    }

    // Form is valid, submit
    console.log('Submit:', validation.form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={validation.form.email}
          onChange={(e) => validation.setField('email', e.target.value)}
          onBlur={() => validation.markTouched('email')}
        />
        {validation.hasError('email') && (
          <span className="error">{validation.errors.email}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={validation.form.password}
          onChange={(e) => validation.setField('password', e.target.value)}
          onBlur={() => validation.markTouched('password')}
        />
        {validation.hasError('password') && (
          <span className="error">{validation.errors.password}</span>
        )}
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          value={validation.form.confirmPassword}
          onChange={(e) => validation.setField('confirmPassword', e.target.value)}
          onBlur={() => validation.markTouched('confirmPassword')}
        />
        {validation.hasError('confirmPassword') && (
          <span className="error">{validation.errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" disabled={!validation.isValid}>
        Sign Up
      </button>
    </form>
  );
}
*/

// ============================================================================
// 2. LOADING STATES & SKELETON UI EXAMPLE
// ============================================================================

/*
'use client';
import { useState, useEffect } from 'react';
import { PageSkeleton, CardSkeleton, ListSkeleton } from '@/components/Skeletons';

export function WorkoutHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workouts');
      const data = await response.json();
      setWorkouts(data.workouts || []);
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4">
      <h1>Workout History</h1>
      {workouts.length === 0 ? (
        <p>No workouts yet.</p>
      ) : (
        <div className="space-y-2">
          {workouts.map((workout) => (
            <div key={workout.id} className="p-4 border rounded">
              <h3>{workout.title}</h3>
              <p>{workout.duration} minutes</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// For individual card loading:
export function WorkoutCard({ workoutId }: { workoutId: string }) {
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    fetch(`/api/workouts/${workoutId}`)
      .then(r => r.json())
      .then(data => {
        setWorkout(data.workout);
        setLoading(false);
      });
  }, [workoutId]);

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <div className="p-4 border rounded">
      <h3>{workout.title}</h3>
      <p>{workout.duration} minutes</p>
    </div>
  );
}
*/

// ============================================================================
// 3. API RESPONSE VALIDATION EXAMPLE
// ============================================================================

/*
'use client';
import { api } from '@/lib/api';
import {
  validateWorkoutArray,
  validateRiderProfile,
  safeExtractData,
  logValidationError,
} from '@/lib/api-validation';

export function useSafeWorkoutData() {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);

  const loadWorkouts = async () => {
    try {
      const response = await api.workouts.list();
      
      // Validate response
      const validation = validateWorkoutArray(response.data?.workouts);
      
      if (!validation.valid) {
        logValidationError('/api/workouts', validation, response.data);
        setError('Invalid workout data from server');
        return;
      }

      setWorkouts(validation.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load workouts');
      console.error(err);
    }
  };

  return { workouts, error, loadWorkouts };
}

// Safer version with automatic validation:
export async function loadValidatedRiderProfile() {
  const response = await api.rider.get();
  
  // Automatically validates and logs errors
  const rider = safeExtractData(
    '/api/rider',
    response.data?.rider,
    validateRiderProfile
  );
  
  // rider is undefined if validation failed, properly logged
  return rider;
}
*/

// ============================================================================
// 4. TRAININGCALENDAR REFACTORING EXAMPLE
// ============================================================================

/*
See TrainingCalendar.refactored.tsx for full refactored component.

Key improvements:
- Uses useTrainingCalendarData() hook instead of inline loadWorkoutData
- Data parsing broken into pure functions:
  - parseCompletedWorkouts()
  - parseStravaActivities()
  - generatePlannedSessions()
  - combineWorkoutData()
- Proper useCallback dependencies
- Better error handling with useNotification
- Loading skeleton instead of custom loading state
- Uses contexts (RiderContext, TrainingDataContext)

Migration steps:
1. Copy the pure parsing functions
2. Replace loadWorkoutData with useTrainingCalendarData hook
3. Use PageSkeleton for loading UI
4. Add error handling with useNotification
5. Test thoroughly
*/

// ============================================================================
// KEY BENEFITS OF THESE IMPROVEMENTS
// ============================================================================

/*
Form Validation:
✅ Reusable validation rules
✅ Type-safe field values
✅ Built-in validation functions (isRequired, isEmail, etc.)
✅ Custom validation support
✅ Error messages per field
✅ Touch tracking for better UX

Loading States & Skeletons:
✅ Smooth loading experience
✅ Variety of skeleton types
✅ Animated loaders
✅ Reduced CLS (Cumulative Layout Shift)
✅ Better perceived performance
✅ Consistent across app

API Response Validation:
✅ Catch API contract changes early
✅ Type safety at runtime
✅ Clear error messages for debugging
✅ Automatic logging with context
✅ Safe data extraction with fallbacks
✅ Prevents runtime errors from bad data

TrainingCalendar Refactoring:
✅ Smaller, testable functions
✅ Uses contexts (no prop drilling)
✅ Better error handling
✅ Easier to maintain and extend
✅ Clearer data flow
✅ Proper dependency management
*/

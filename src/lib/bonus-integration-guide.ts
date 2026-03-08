/**
 * BONUS INTERCONNECTION INTEGRATION GUIDE
 *
 * Shows how the 5 new interconnection services work together
 * Delete this file after reviewing - it's reference documentation
 */

// ============================================================================
// 1. WORKOUT CONTEXT IN DASHBOARD
// ============================================================================

/*
'use client';
import { useWorkoutContext } from '@/contexts/WorkoutContext';

export function Dashboard() {
  const { stats, getWorkoutsForWeek, filterByCompleted, loading } = useWorkoutContext();

  const thisWeek = getWorkoutsForWeek(new Date());
  const completed = filterByCompleted(true);

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="stats">
        <p>Total Workouts: {stats.total}</p>
        <p>Completed: {stats.completed}/{stats.total}</p>
        <p>Completion Rate: {stats.completionRate.toFixed(1)}%</p>
        <p>Avg Duration: {stats.avgDuration.toFixed(1)} min</p>
        {stats.avgPower && <p>Avg Power: {stats.avgPower.toFixed(0)}W</p>}
      </div>

      <div className="workouts">
        {thisWeek.map(w => (
          <div key={w.id}>{w.sessionTitle}</div>
        ))}
      </div>
    </div>
  );
}
*/

// ============================================================================
// 2. STRAVA HUB SYNC WITH PROGRESS TRACKING
// ============================================================================

/*
'use client';
import { useEffect, useState } from 'react';
import { stravaHub } from '@/services/StravaHub';

export function SyncButton() {
  const [progress, setProgress] = useState(stravaHub.getProgress());

  useEffect(() => {
    // Subscribe to progress updates
    const unsubscribe = stravaHub.onSyncProgress((newProgress) => {
      setProgress(newProgress);
    });

    return unsubscribe;
  }, []);

  const handleSync = async () => {
    try {
      const activities = await stravaHub.syncRecent();
      const stats = stravaHub.calculateStats(activities);
      
      console.log('Sync complete:', stats);
      // Update UI with stats...
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSync} disabled={progress.status === 'syncing'}>
        {progress.status === 'syncing' ? `Syncing... ${progress.progress}%` : 'Sync Strava'}
      </button>
      
      {progress.message && (
        <p className="progress-message">{progress.message}</p>
      )}
      
      {progress.status === 'syncing' && (
        <div className="progress-bar" style={{ width: `${progress.progress}%` }} />
      )}
    </div>
  );
}
*/

// ============================================================================
// 3. AI COACHING SERVICE FOR RACE PLANNING
// ============================================================================

/*
'use client';
import { useEffect, useState } from 'react';
import { aiCoaching } from '@/services/AICoachingService';
import type { CoachingInsight } from '@/services/AICoachingService';

export function RaceEventPlanner() {
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRaceSelected = async (eventDate: string, priority: 'A' | 'B' | 'C') => {
    setLoading(true);
    try {
      const { insight, periodization, adjustments } = await aiCoaching.analyzeRaceEvent(
        eventDate,
        'ROAD',
        priority,
        300, // Current FTP
        0    // Current block
      );

      setInsights([insight]);
      
      // Apply periodization adjustments...
      console.log('Adjustments:', adjustments);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Race Planning</h2>
      {loading && <p>Analyzing event...</p>}
      
      {insights.map(insight => (
        <div key={insight.type} className={`insight ${insight.urgency}`}>
          <h3>{insight.title}</h3>
          <p>{insight.message}</p>
          <p><strong>Recommendation:</strong> {insight.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================================================
// 4. UNIFIED FORM VALIDATION
// ============================================================================

/*
'use client';
import { useFormValidation } from '@/hooks/useFormValidation';
import { getValidationSchema, getFieldHint } from '@/services/FormValidationService';

export function RiderProfileForm() {
  const validation = useFormValidation(
    { name: '', email: '', ftp: '', weight: '' },
    getValidationSchema('rider-profile')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.validate()) {
      return; // Show errors
    }

    // Submit form...
    console.log('Submit:', validation.form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>FTP</label>
        <input
          type="number"
          value={validation.form.ftp}
          onChange={(e) => validation.setField('ftp', e.target.value)}
          onBlur={() => validation.markTouched('ftp')}
        />
        <small>{getFieldHint('ftp')}</small>
        {validation.hasError('ftp') && (
          <span className="error">{validation.errors.ftp}</span>
        )}
      </div>

      <div className="field">
        <label>Weight</label>
        <input
          type="number"
          value={validation.form.weight}
          onChange={(e) => validation.setField('weight', e.target.value)}
          onBlur={() => validation.markTouched('weight')}
        />
        <small>{getFieldHint('weight')}</small>
        {validation.hasError('weight') && (
          <span className="error">{validation.errors.weight}</span>
        )}
      </div>

      <button type="submit" disabled={!validation.isValid}>
        Save Profile
      </button>
    </form>
  );
}
*/

// ============================================================================
// 5. INTEGRATED DASHBOARD WITH ALL SERVICES
// ============================================================================

// See implementation example in files:
// - src/contexts/WorkoutContext.tsx
// - src/services/StravaHub.ts
// - src/services/AICoachingService.ts
//
// Usage pattern:
// 1. Use useWorkoutContext() to get stats and filtered workouts
// 2. Use stravaHub.onSyncProgress() to track sync status
// 3. Use aiCoaching.generateRecommendations() for coaching insights
// 4. Combine all three on dashboard page

// ============================================================================
// KEY BENEFITS OF INTERCONNECTIONS
// ============================================================================

/*
1. WORKOUT CONTEXT
   ✅ Single source for all workout data
   ✅ Pre-calculated stats (no duplication)
   ✅ Filtering methods available everywhere
   ✅ Shared date range logic
   ✅ Used by: Dashboard, Calendar, Plan page

2. STRAVA HUB SERVICE
   ✅ Unified sync/extract/analysis logic
   ✅ Progress tracking and notifications
   ✅ Stats calculation centralized
   ✅ Single configuration point
   ✅ Reusable in multiple components

3. AI COACHING SERVICE
   ✅ All AI operations in one place
   ✅ Error handling for all AI APIs
   ✅ Fallback values when APIs fail
   ✅ Consistent coaching interface
   ✅ Easy to swap AI providers

4. FORM VALIDATION SERVICE
   ✅ Validation schemas defined once
   ✅ Reused across Setup, Settings, EventPlanner
   ✅ Consistent error messages
   ✅ Field hints in one place
   ✅ Easy to add new forms

5. INTERCONNECTION BENEFITS
   ✅ Less code duplication
   ✅ Easier to maintain
   ✅ Consistent behavior across app
   ✅ Centralized configuration
   ✅ Clear interfaces
   ✅ Better testability
*/

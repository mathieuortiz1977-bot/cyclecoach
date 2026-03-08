/**
 * CONTEXT USAGE EXAMPLES
 * 
 * This file shows how to use the global context system
 * Delete this file after reviewing - it's reference documentation
 */

// ============================================================================
// EXAMPLE 1: Using RiderContext for Profile Data
// ============================================================================

/*
'use client';
import { useRiderContext } from '@/contexts';

export function ProfileCard() {
  const { rider, loading, error, updateRider } = useRiderContext();

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!rider) return null;

  const handleFTPUpdate = async (newFTP: number) => {
    try {
      await updateRider({ ftp: newFTP });
      // Success! rider is automatically updated
    } catch (err) {
      console.error('Failed to update FTP', err);
    }
  };

  return (
    <div>
      <h2>{rider.name}</h2>
      <p>FTP: {rider.ftp}W</p>
      <p>Weight: {rider.weight}kg</p>
      <button onClick={() => handleFTPUpdate(280)}>Update FTP</button>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 2: Using PlanContext for Training Plan
// ============================================================================

/*
'use client';
import { usePlanContext } from '@/contexts';

export function TrainingPlan() {
  const { plan, loading, regenerate } = usePlanContext();

  if (loading) return <div>Loading plan...</div>;
  if (!plan) return null;

  const handleRegeneratePlan = async () => {
    try {
      await regenerate(300); // New FTP
      // Success! Plan is regenerated and updated
    } catch (err) {
      console.error('Failed to regenerate', err);
    }
  };

  return (
    <div>
      <h3>Current Block: {plan.blocks[0].type}</h3>
      <p>Total Weeks: {plan.blocks.reduce((sum, b) => sum + b.weeks.length, 0)}</p>
      <button onClick={handleRegeneratePlan}>Regenerate Plan</button>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 3: Using TrainingDataContext for Workouts & Activities
// ============================================================================

/*
'use client';
import { useTrainingDataContext } from '@/contexts';

export function WorkoutHistory() {
  const { 
    workouts, 
    activities, 
    loading, 
    syncing,
    refetch,
    syncStrava,
    deleteWorkout,
  } = useTrainingDataContext();

  return (
    <div>
      <h2>Recent Workouts ({workouts.length})</h2>
      
      <button onClick={syncStrava} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync Strava'}
      </button>
      
      <button onClick={refetch} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>

      <div>
        {workouts.map((w) => (
          <div key={w.id}>
            <p>{w.sessionTitle} - {w.duration}min</p>
            <button onClick={() => deleteWorkout(w.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h3>Strava Activities ({activities.length})</h3>
      {activities.map((a) => (
        <div key={a.id}>
          <p>{a.name} - {a.distance}km</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 4: Using UIContext for Loading States & Modals
// ============================================================================

/*
'use client';
import { useUIContext, usePageLoading } from '@/contexts';

export function PageHeader() {
  const { isPageLoading, setPageLoading } = usePageLoading();
  const { openModal } = useUIContext();

  const handleDeleteAccount = () => {
    openModal({
      type: 'confirmation',
      title: 'Delete Account?',
      message: 'This action cannot be undone.',
      actionLabel: 'Delete',
      onConfirm: async () => {
        setPageLoading(true);
        try {
          await deleteAccountAPI();
          // Redirect to login
        } finally {
          setPageLoading(false);
        }
      },
    });
  };

  return (
    <header>
      {isPageLoading && <div className="spinner" />}
      <button onClick={handleDeleteAccount}>Delete Account</button>
    </header>
  );
}
*/

// ============================================================================
// EXAMPLE 5: Multiple Contexts in One Component
// ============================================================================

/*
'use client';
import { useRiderContext, usePlanContext, useTrainingDataContext } from '@/contexts';

export function Dashboard() {
  const { rider } = useRiderContext();
  const { plan } = usePlanContext();
  const { workouts } = useTrainingDataContext();

  return (
    <div>
      <h1>{rider?.name}'s Dashboard</h1>
      <div className="grid">
        <div>FTP: {rider?.ftp}W</div>
        <div>Current Block: {plan?.blocks[0].type}</div>
        <div>Completed: {workouts.filter(w => w.completed).length}</div>
      </div>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 6: Error Handling with Contexts
// ============================================================================

/*
'use client';
import { useRiderContext, useTrainingDataContext } from '@/contexts';
import { useNotification } from '@/hooks/useApi';

export function SyncButton() {
  const { syncStrava, error: dataError } = useTrainingDataContext();
  const notify = useNotification();

  const handleSync = async () => {
    try {
      await syncStrava();
      notify.success('Sync complete!');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Sync failed');
    }
  };

  return (
    <div>
      <button onClick={handleSync}>Sync Strava</button>
      {dataError && <p style={{ color: 'red' }}>{dataError}</p>}
    </div>
  );
}
*/

// ============================================================================
// KEY BENEFITS OF CONTEXTS
// ============================================================================

/*
1. NO PROP DRILLING
   Before: <Dashboard rider={rider} plan={plan} workouts={workouts} .../>
   After:  const { rider, plan } = useRiderContext(); // Clean!

2. GLOBAL STATE ACCESS
   - Access rider, plan, workouts from anywhere in the app
   - No need to pass through intermediate components

3. AUTOMATIC REFETCHING
   - Each context refetches on visibility change
   - Tab becomes visible → fresh data automatically

4. BUILT-IN LOADING/ERROR STATES
   - loading, error properties on each context
   - No need to manage these separately in every component

5. AUTOMATIC UPDATES
   - Update rider → rider state automatically updates
   - All components using rider get fresh data
   - No need to manually refetch

6. EASY TO TEST
   - Can mock contexts for testing components
   - No need to set up complex prop trees

// ============================================================================
// MIGRATION CHECKLIST: Moving from Props to Contexts
// ============================================================================

// Component using props (BEFORE):
function WorkoutList({ workouts, loading, onDelete }) {
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {workouts.map(w => (
        <div key={w.id}>
          {w.title}
          <button onClick={() => onDelete(w.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// Component using context (AFTER):
function WorkoutList() {
  const { workouts, loading, deleteWorkout } = useTrainingDataContext();
  
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {workouts.map(w => (
        <div key={w.id}>
          {w.title}
          <button onClick={() => deleteWorkout(w.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// And the parent component no longer needs to pass props:
function Page() {
  return <WorkoutList />; // No props needed!
}

// ============================================================================
// CONTEXT HIERARCHY
// ============================================================================

// AppProviders wraps everything in this order:

1. NextAuthSessionProvider         // Authentication
   ↓
2. ErrorBoundary                   // Error catching
   ↓
3. UIProvider                      // UI state (modal, loading, sidebar)
   ↓
4. RiderProvider                   // Rider/profile data
   ↓
5. PlanProvider                    // Training plan
   ↓
6. TrainingDataProvider            // Workouts + activities
   ↓
7. UpdateBanner, ToastContainer    // Notifications
   ↓
8. Children                        // Your page content

// This order matters because:
// - UIProvider is first (doesn't depend on data)
// - RiderProvider before PlanProvider (plan might need rider FTP)
// - TrainingDataProvider last (can use both rider + plan)

// ============================================================================
*/

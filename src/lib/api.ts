/**
 * Centralized API Client for CycleCoach
 * 
 * RULE: Use this client for ALL API calls instead of direct fetch()
 * Benefits:
 * - Single source of truth for API endpoints
 * - Consistent error handling
 * - Easy to add logging/monitoring
 * - Type-safe responses
 * - Built-in loading/error states
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number; // HTTP status code
  [key: string]: any; // Allow additional properties from API responses (like requiresConfirmation, pendingCount)
}

interface ApiError {
  status: number;
  message: string;
  error?: any;
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi<T = any>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data.error || `API error: ${response.status}`,
        ...data, // Include all response properties (requiresConfirmation, pendingCount, etc.)
      };
    }

    return {
      success: true,
      status: response.status,
      data: data.data || data,
      ...data, // Include all response properties
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Rider API endpoints
 */
export const api = {
  // ─── RIDER ───────────────────────────────────────────────────────
  rider: {
    /**
     * Get current rider profile
     */
    get: () => fetchApi("/api/rider"),

    /**
     * Update rider profile
     */
    update: (data: {
      ftp?: number;
      weight?: number;
      experience?: string;
      coachTone?: string;
      trainingDays?: string;
      outdoorDay?: string;
      sundayDuration?: number;
      programStartDate?: string;
      maxHr?: number;
      restingHr?: number;
      lthr?: number;
    }) =>
      fetchApi("/api/rider", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // ─── PLAN ────────────────────────────────────────────────────────
  plan: {
    /**
     * Get current training plan
     */
    get: () => fetchApi("/api/plan"),

    /**
     * Generate/regenerate training plan
     */
    regenerate: (options?: { blocks?: number; confirmUpdate?: boolean }) =>
      fetchApi("/api/plan", {
        method: "POST",
        body: JSON.stringify({ 
          blocks: options?.blocks || 4,
          confirmUpdate: options?.confirmUpdate || false
        }),
      }),
  },

  // ─── WORKOUTS ────────────────────────────────────────────────────
  workouts: {
    /**
     * Get all workouts
     */
    list: () => fetchApi("/api/workouts"),

    /**
     * Create/log a workout
     */
    create: (data: {
      date?: string;
      sessionTitle?: string;
      avgPower?: number;
      normalizedPower?: number;
      duration?: number;
      actualDuration?: number;
      rpe?: number;
      feelings?: string[];
      notes?: string;
      completed?: boolean;
      compliance?: number;
    }) =>
      fetchApi("/api/workouts", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Cancel a workout
     */
    cancel: (workoutId: string, reason: string) =>
      fetchApi("/api/workouts/cancel", {
        method: "POST",
        body: JSON.stringify({ workoutId, reason }),
      }),

    /**
     * Reschedule a workout
     */
    reschedule: (workoutId: string, newDate: string) =>
      fetchApi("/api/workouts/reschedule", {
        method: "POST",
        body: JSON.stringify({ workoutId, newDate }),
      }),
  },

  // ─── STRAVA ──────────────────────────────────────────────────────
  strava: {
    /**
     * Get Strava authentication URL
     */
    getAuthUrl: () => fetchApi("/api/strava/auth"),

    /**
     * Sync recent Strava rides (2020-present)
     */
    sync: () =>
      fetchApi("/api/strava/sync", {
        method: "POST",
      }),

    /**
     * Sync 5 years of Strava history
     */
    sync5Years: () =>
      fetchApi("/api/strava/sync-5years", {
        method: "POST",
      }),

    /**
     * Extract segment efforts from Strava activities
     */
    extractSegments: () =>
      fetchApi("/api/strava/extract-segments", {
        method: "POST",
      }),

    /**
     * Get Strava activities
     * @param weeks - Number of weeks to fetch (default 20)
     */
    getActivities: (weeks?: number) => fetchApi(`/api/strava/activities${weeks ? `?weeks=${weeks}` : ""}`),

    /**
     * Get segment performance data
     */
    getSegments: () => fetchApi("/api/strava/segments"),
  },

  // ─── VACATIONS ───────────────────────────────────────────────────
  vacations: {
    /**
     * Get all vacations
     */
    list: () => fetchApi("/api/vacations"),

    /**
     * Create vacation
     */
    create: (data: {
      startDate: string;
      endDate: string;
      type: "complete_break" | "light_activity" | "cross_training";
      description?: string;
      location?: string;
    }) =>
      fetchApi("/api/vacations", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Apply vacation to training program
     */
    apply: (vacationId: string) =>
      fetchApi("/api/vacations/apply", {
        method: "POST",
        body: JSON.stringify({ vacationId }),
      }),
  },

  // ─── RACE EVENTS ──────────────────────────────────────────────────
  events: {
    /**
     * Get all race events
     */
    list: () => fetchApi("/api/events"),

    /**
     * Create race event
     */
    create: (data: {
      name: string;
      date: string;
      type: string;
      priority: "A" | "B" | "C";
      location?: string;
      distance?: string;
      description?: string;
      peakDate?: string;
      taperWeeks?: number;
    }) =>
      fetchApi("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Update race event
     */
    update: (eventId: string, data: any) =>
      fetchApi("/api/events", {
        method: "PUT",
        body: JSON.stringify({ id: eventId, ...data }),
      }),

    /**
     * Delete race event
     */
    delete: (eventId: string) =>
      fetchApi(`/api/events?id=${eventId}`, {
        method: "DELETE",
      }),
  },

  // ─── AI SERVICES ──────────────────────────────────────────────────
  ai: {
    /**
     * Get AI coaching advice
     */
    coach: (data: {
      riderFtp: number;
      recentActivities?: any[];
      currentForm?: number;
      question?: string;
    }) =>
      fetchApi("/api/ai/coach", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Analyze event periodization
     */
    eventPeriodization: (data: {
      event: any;
      trainingProgram: any;
      existingEvents?: any[];
    }) =>
      fetchApi("/api/ai/event-periodization", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Analyze vacation impact
     */
    vacationAnalysis: (data: {
      vacation: any;
      trainingProgram: any;
      riderFtp: number;
    }) =>
      fetchApi("/api/ai/vacation-analysis", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Get rescheduling suggestions
     */
    reschedule: (data: {
      workoutId: string;
      reason: string;
      trainingProgram: any;
    }) =>
      fetchApi("/api/ai/reschedule", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Get weekly recap
     */
    weeklyRecap: (data: { week: any; workouts: any[]; riderFtp: number }) =>
      fetchApi("/api/ai/weekly-recap", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ─── IMPORT/EXPORT ────────────────────────────────────────────────
  import: {
    /**
     * Import workout from file
     */
    fit: (formData: FormData) =>
      fetch("/api/import", {
        method: "POST",
        body: formData,
      }).then((r) => r.json()),
  },

  // ─── CALENDAR ──────────────────────────────────────────────────────
  calendar: {
    /**
     * Sync to Google Calendar
     */
    sync: (data: { email: string; calendarId?: string }) =>
      fetchApi("/api/calendar/sync", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ─── HEALTH/FITNESS ───────────────────────────────────────────────
  fitness: {
    /**
     * Get fitness metrics (CTL, ATL, TSB)
     */
    getMetrics: () => fetchApi("/api/fitness"),

    /**
     * Calculate FTP decline estimate
     */
    estimateFtpDecay: (daysSinceLastRide: number) =>
      fetchApi("/api/fitness", {
        method: "POST",
        body: JSON.stringify({ daysSinceLastRide }),
      }),
  },

  // ─── ADAPTATION ────────────────────────────────────────────────────
  adaptation: {
    /**
     * Get adaptation decision
     */
    decide: (data: {
      currentFtp: number;
      weeklyTss: number;
      weeklyVolume: number;
      averageRpe: number;
    }) =>
      fetchApi("/api/adapt/decide", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ─── ZWIFT ────────────────────────────────────────────────────────
  zwift: {
    /**
     * Export workout to Zwift format
     */
    export: (data: {
      workoutId: string;
      format?: "zwo" | "erg" | "mrc";
    }) =>
      fetchApi("/api/zwift", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

/**
 * Hook-friendly API client
 * Used by useRider, usePlan, etc.
 */
export async function apiCall<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  const response = await fetchApi<T>(url, options);
  if (!response.success) {
    console.error(`API Error: ${url}`, response.error);
    return null;
  }
  return response.data || null;
}

/**
 * Usage Examples:
 * 
 * // Get rider profile
 * const riderResponse = await api.rider.get();
 * if (riderResponse.success) {
 *   const riderData = riderResponse.data;
 * }
 * 
 * // Update rider
 * const updateResponse = await api.rider.update({ ftp: 250 });
 * 
 * // Sync Strava
 * const syncResponse = await api.strava.sync();
 * 
 * // Create workout
 * const workoutResponse = await api.workouts.create({
 *   sessionTitle: "Easy spin",
 *   duration: 3600,
 *   rpe: 4
 * });
 */

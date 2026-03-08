/**
 * StravaHub - Unified Strava operations service
 * Consolidates sync, extraction, and activity management
 * Single source of truth for all Strava interactions
 */

import { api } from '@/lib/api';
import type { StravaActivity } from '@/types';

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'extracting' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  totalActivities?: number;
  processedActivities?: number;
}

export interface StravaStats {
  totalActivities: number;
  totalDistance: number; // km
  totalElevation: number; // m
  totalDuration: number; // hours
  avgPower?: number; // watts
  lastSyncDate?: Date;
}

class StravaHubService {
  private syncProgress: SyncProgress = {
    status: 'idle',
    progress: 0,
    message: '',
  };

  private syncListeners: Set<(progress: SyncProgress) => void> = new Set();

  /**
   * Subscribe to sync progress updates
   */
  onSyncProgress(listener: (progress: SyncProgress) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Notify all listeners of progress change
   */
  private notifyProgress(progress: SyncProgress) {
    this.syncProgress = progress;
    this.syncListeners.forEach((listener) => listener(progress));
  }

  /**
   * Get current sync progress
   */
  getProgress(): SyncProgress {
    return { ...this.syncProgress };
  }

  /**
   * Sync recent Strava activities (2020-present)
   */
  async syncRecent(): Promise<StravaActivity[]> {
    this.notifyProgress({
      status: 'syncing',
      progress: 10,
      message: 'Connecting to Strava...',
    });

    try {
      const response = await api.strava.sync();

      this.notifyProgress({
        status: 'syncing',
        progress: 50,
        message: 'Downloading activities...',
        totalActivities: response.data?.activities?.length || 0,
        processedActivities: 0,
      });

      const activities = response.data?.activities || [];

      this.notifyProgress({
        status: 'syncing',
        progress: 100,
        message: `Synced ${activities.length} activities`,
        totalActivities: activities.length,
        processedActivities: activities.length,
      });

      return activities;
    } catch (error) {
      this.notifyProgress({
        status: 'error',
        progress: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  }

  /**
   * Sync 5 years of Strava history
   */
  async sync5Years(): Promise<StravaActivity[]> {
    this.notifyProgress({
      status: 'syncing',
      progress: 10,
      message: 'Syncing 5 years of history...',
    });

    try {
      const response = await api.strava.sync5Years();

      this.notifyProgress({
        status: 'syncing',
        progress: 75,
        message: 'Processing activities...',
        totalActivities: response.data?.activities?.length || 0,
      });

      const activities = response.data?.activities || [];

      this.notifyProgress({
        status: 'syncing',
        progress: 100,
        message: `Synced ${activities.length} activities from 5 years`,
        totalActivities: activities.length,
        processedActivities: activities.length,
      });

      return activities;
    } catch (error) {
      this.notifyProgress({
        status: 'error',
        progress: 0,
        message: `5-year sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  }

  /**
   * Extract segment data from activities
   */
  async extractSegments(): Promise<any> {
    this.notifyProgress({
      status: 'extracting',
      progress: 10,
      message: 'Analyzing segments...',
    });

    try {
      const response = await api.strava.extractSegments();

      this.notifyProgress({
        status: 'extracting',
        progress: 100,
        message: 'Segment extraction complete',
      });

      return response.data;
    } catch (error) {
      this.notifyProgress({
        status: 'error',
        progress: 0,
        message: `Segment extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  }

  /**
   * Get activity details
   */
  async getActivities(): Promise<StravaActivity[]> {
    try {
      const response = await api.strava.getActivities();
      return response.data?.activities || [];
    } catch (error) {
      console.error('Failed to get activities:', error);
      return [];
    }
  }

  /**
   * Calculate Strava stats from activities
   */
  calculateStats(activities: StravaActivity[]): StravaStats {
    if (!activities || activities.length === 0) {
      return {
        totalActivities: 0,
        totalDistance: 0,
        totalElevation: 0,
        totalDuration: 0,
      };
    }

    const totalDistance = activities.reduce((sum, a) => sum + ((a.distance || 0) / 1000), 0);
    const totalElevation = activities.reduce((sum, a) => sum + (a.elevation || 0), 0);
    const totalDuration = activities.reduce((sum, a) => sum + ((a.duration || 0) / 3600), 0);
    
    const activitiesWithPower = activities.filter((a) => a.avgPower);
    const avgPower = activitiesWithPower.length > 0
      ? activitiesWithPower.reduce((sum, a) => sum + (a.avgPower || 0), 0) / activitiesWithPower.length
      : undefined;

    return {
      totalActivities: activities.length,
      totalDistance,
      totalElevation,
      totalDuration,
      avgPower,
      lastSyncDate: activities[0]?.date ? new Date(activities[0].date) : undefined,
    };
  }

  /**
   * Filter activities by type
   */
  filterByType(activities: StravaActivity[], type: string): StravaActivity[] {
    if (!activities) return [];
    return activities.filter((a) => {
      const actType = a.type || '';
      return actType.toLowerCase().includes(type.toLowerCase());
    });
  }

  /**
   * Filter activities by date range
   */
  filterByDateRange(activities: StravaActivity[], startDate: Date, endDate: Date): StravaActivity[] {
    return activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= startDate && actDate <= endDate;
    });
  }

  /**
   * Get activities for a specific month
   */
  getActivitiesForMonth(activities: StravaActivity[], year: number, month: number): StravaActivity[] {
    if (!activities) return [];
    return activities.filter((a) => {
      const date = new Date(a.date || '');
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }
}

// Export singleton instance
export const stravaHub = new StravaHubService();

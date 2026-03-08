'use client';

import { useState, useMemo } from 'react';
import type { SegmentStat } from '@/types';
import * as tz from '@/lib/timezone';

interface SegmentTrackerFiltersProps {
  segments: SegmentStat[];
  onFilterChange: (filtered: SegmentStat[], filters: FilterState) => void;
}

export interface FilterState {
  status: 'all' | 'opportunity' | 'improving' | 'declining';
  activityType: 'all' | 'outdoor' | 'indoor';
  sortBy: 'name' | 'attempts' | 'distance' | 'formScore';
}

/**
 * Segment Tracker Filters Component
 * 
 * Allows filtering segments by:
 * 1. Status: All, PR Opportunities, Improving, Declining
 * 2. Activity Type: All, Outdoor, Indoor
 * 3. Sort: Name, Attempts, Distance, Form Score
 */
export function SegmentTrackerFilters({ segments, onFilterChange }: SegmentTrackerFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    activityType: 'all',
    sortBy: 'attempts',
  });

  // Apply filters
  const filtered = useMemo(() => {
    let result = segments;

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(s => {
        if (filters.status === 'opportunity') {
          return s.formScore < 85 && s.distanceFromPr > 0;
        }
        if (filters.status === 'improving') {
          return (s.trend || 0) > 0;
        }
        if (filters.status === 'declining') {
          return (s.trend || 0) < 0;
        }
        return true;
      });
    }

    // Filter by activity type
    if (filters.activityType !== 'all') {
      result = result.filter(s => {
        const isIndoor = s.activityType?.toLowerCase().includes('virtual') ||
                        s.activityType?.toLowerCase() === 'indoorcycling' ||
                        s.activityType?.includes('Zwift');
        
        if (filters.activityType === 'indoor') return isIndoor;
        if (filters.activityType === 'outdoor') return !isIndoor;
        return true;
      });
    }

    // Sort
    result = result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'attempts':
          return (b.attempts || 0) - (a.attempts || 0);
        case 'distance':
          return (b.distance || 0) - (a.distance || 0);
        case 'formScore':
          return (b.formScore || 0) - (a.formScore || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [segments, filters]);

  const handleStatusChange = (status: FilterState['status']) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(filtered, newFilters);
  };

  const handleActivityTypeChange = (type: FilterState['activityType']) => {
    const newFilters = { ...filters, activityType: type };
    setFilters(newFilters);
    onFilterChange(filtered, newFilters);
  };

  const handleSortChange = (sort: FilterState['sortBy']) => {
    const newFilters = { ...filters, sortBy: sort };
    setFilters(newFilters);
    onFilterChange(filtered, newFilters);
  };

  // Count segments in each category
  const counts = {
    all: segments.length,
    opportunity: segments.filter(s => s.formScore < 85 && s.distanceFromPr > 0).length,
    improving: segments.filter(s => (s.trend || 0) > 0).length,
    declining: segments.filter(s => (s.trend || 0) < 0).length,
    outdoor: segments.filter(s => {
      const isIndoor = s.activityType?.toLowerCase().includes('virtual') ||
                      s.activityType?.toLowerCase() === 'indoorcycling' ||
                      s.activityType?.includes('Zwift');
      return !isIndoor;
    }).length,
    indoor: segments.filter(s => {
      const isIndoor = s.activityType?.toLowerCase().includes('virtual') ||
                      s.activityType?.toLowerCase() === 'indoorcycling' ||
                      s.activityType?.includes('Zwift');
      return isIndoor;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Status
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusChange('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => handleStatusChange('opportunity')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'opportunity'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            🎯 Opportunities ({counts.opportunity})
          </button>
          <button
            onClick={() => handleStatusChange('improving')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'improving'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            📈 Improving ({counts.improving})
          </button>
          <button
            onClick={() => handleStatusChange('declining')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'declining'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            📉 Declining ({counts.declining})
          </button>
        </div>
      </div>

      {/* Activity Type Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Activity Type
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleActivityTypeChange('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.activityType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => handleActivityTypeChange('outdoor')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.activityType === 'outdoor'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            🚴 Outdoor ({counts.outdoor})
          </button>
          <button
            onClick={() => handleActivityTypeChange('indoor')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.activityType === 'indoor'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            📱 Indoor ({counts.indoor})
          </button>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Sort By
        </h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="attempts">Most Attempts</option>
          <option value="distance">Longest Distance</option>
          <option value="formScore">Best Form Score</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <strong>{filtered.length}</strong> of <strong>{segments.length}</strong> segments
        </p>
      </div>
    </div>
  );
}

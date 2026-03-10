'use client';

import { useState, useEffect, useMemo } from 'react';
import { WorkoutCard } from '@/components/WorkoutCard';
import { useRider } from '@/hooks/useRider';
import Link from 'next/link';
import type { WorkoutTemplate } from '@/lib/periodization';

export default function WorkoutsPage() {
  const { rider } = useRider();
  const ftp = rider?.ftp || 200;

  // State
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Load workouts from API
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/workout-templates?limit=500');
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        if (!data.workouts || data.workouts.length === 0) {
          throw new Error('No workouts received from API');
        }
        
        setWorkouts(data.workouts);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load workouts';
        console.error('Workouts load error:', errorMsg);
        setError(errorMsg);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  // Get unique categories and zones
  const categories = useMemo(() => {
    const cats = new Set(workouts.map(w => w.category));
    return Array.from(cats).sort();
  }, [workouts]);

  const zones = useMemo(() => {
    const z = new Set<string>();
    workouts.forEach(w => {
      const intervals = typeof w.intervals === 'function' ? w.intervals() : w.intervals;
      if (Array.isArray(intervals)) {
        intervals.forEach(i => {
          const zone = i.intensity?.zone || i.zone;
          if (zone) z.add(zone);
        });
      }
    });
    return Array.from(z).sort();
  }, [workouts]);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      // Text search
      if (searchQuery && !w.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && w.category !== selectedCategory) {
        return false;
      }

      // Zone filter
      if (selectedZone) {
        const intervals = typeof w.intervals === 'function' ? w.intervals() : w.intervals;
        if (Array.isArray(intervals)) {
          if (!intervals.some(i => (i.intensity?.zone || i.zone) === selectedZone)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [workouts, searchQuery, selectedCategory, selectedZone]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">💪 Workouts Database</h1>
            <p className="text-[var(--muted)] mt-1">
              {loading ? 'Loading...' : `${workouts.length} total workouts · ${filteredWorkouts.length} shown`}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 rounded bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 font-semibold">❌ Error Loading Workouts</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
          >
            Try reloading the page
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass p-6 space-y-4">
          <div className="h-8 bg-[var(--surface)] rounded animate-pulse"></div>
          <div className="h-12 bg-[var(--surface)] rounded animate-pulse"></div>
        </div>
      )}

      {/* Search & Filters */}
      {!loading && (
        <div className="glass p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Search Workouts</label>
            <input
              type="text"
              placeholder="e.g., 'Fartlek', 'VO2MAX', 'Threshold'..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[var(--surface)] text-white placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={e => setSelectedCategory(e.target.value || null)}
                className="w-full px-4 py-2 rounded bg-[var(--surface)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">Zone</label>
              <select
                value={selectedZone || ''}
                onChange={e => setSelectedZone(e.target.value || null)}
                className="w-full px-4 py-2 rounded bg-[var(--surface)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">All Zones</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex gap-2 flex-wrap pt-2">
            {searchQuery && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)] text-black text-sm">
                <span>🔍 "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)] text-black text-sm">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            )}
            {selectedZone && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)] text-black text-sm">
                <span>{selectedZone}</span>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Stats */}
      {!loading && (
        <div className="text-sm text-[var(--muted)]">
          Showing <span className="font-semibold text-white">{filteredWorkouts.length}</span> of{' '}
          <span className="font-semibold text-white">{workouts.length}</span> workouts
        </div>
      )}

      {/* Workout Cards Grid */}
      {!loading && filteredWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} ftp={ftp} />
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">No workouts match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setSelectedZone(null);
            }}
            className="text-[var(--accent)] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Database Info */}
      {!loading && (
        <div className="glass p-6 space-y-3 text-sm text-[var(--muted)]">
          <h3 className="font-semibold text-white">Database Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-semibold text-white">{workouts.length}</p>
              <p>Total Workouts</p>
            </div>
            <div>
              <p className="font-semibold text-white">{categories.length}</p>
              <p>Categories</p>
            </div>
            <div>
              <p className="font-semibold text-white">{zones.length}</p>
              <p>Power Zones</p>
            </div>
            <div>
              <p className="font-semibold text-white">100%</p>
              <p>Coverage</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

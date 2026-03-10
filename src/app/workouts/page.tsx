'use client';

import { useState, useMemo } from 'react';
import { MASTER_WORKOUTS } from '@/lib/sessions-data-all';
import { WorkoutCard } from '@/components/WorkoutCard';
import { useRider } from '@/hooks/useRider';
import Link from 'next/link';

export default function WorkoutsPage() {
  const { rider } = useRider();
  const ftp = rider?.ftp || 200;

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Get unique categories and zones
  const categories = useMemo(() => {
    const cats = new Set(MASTER_WORKOUTS.map(w => w.category));
    return Array.from(cats).sort();
  }, []);

  const zones = useMemo(() => {
    const z = new Set<string>();
    MASTER_WORKOUTS.forEach(w => {
      const intervals = w.intervals();
      intervals.forEach(i => z.add(i.zone));
    });
    return Array.from(z).sort();
  }, []);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return MASTER_WORKOUTS.filter(w => {
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
        const intervals = w.intervals();
        if (!intervals.some(i => i.zone === selectedZone)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedZone]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">💪 Workouts Database</h1>
            <p className="text-[var(--muted)] mt-1">
              {MASTER_WORKOUTS.length} total workouts · {filteredWorkouts.length} shown
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

      {/* Search & Filters */}
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

      {/* Results Stats */}
      <div className="text-sm text-[var(--muted)]">
        Showing <span className="font-semibold text-white">{filteredWorkouts.length}</span> of{' '}
        <span className="font-semibold text-white">{MASTER_WORKOUTS.length}</span> workouts
      </div>

      {/* Workout Cards Grid */}
      {filteredWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} ftp={ftp} />
          ))}
        </div>
      ) : (
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
      <div className="glass p-6 space-y-3 text-sm text-[var(--muted)]">
        <h3 className="font-semibold text-white">Database Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="font-semibold text-white">{MASTER_WORKOUTS.length}</p>
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
    </div>
  );
}

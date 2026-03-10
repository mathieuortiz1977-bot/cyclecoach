'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { WorkoutTemplate } from '@/lib/periodization';
import { getZoneColor } from '@/lib/zones';

interface WorkoutBrowserProps {
  onSelectWorkout?: (workout: WorkoutTemplate) => void;
}

interface Category {
  name: string;
  count: number;
}

interface Source {
  name: string;
  count: number;
}

export function WorkoutBrowser({ onSelectWorkout }: WorkoutBrowserProps) {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const LIMIT = 20;

  // Load categories and sources on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, srcRes] = await Promise.all([
          fetch('/api/workout-templates/categories'),
          fetch('/api/workout-templates/sources'),
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        }

        if (srcRes.ok) {
          const data = await srcRes.json();
          setSources(data.sources || []);
        }
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };

    loadFilters();
  }, []);

  // Load workouts when filters change
  useEffect(() => {
    loadWorkouts(0);
  }, [selectedCategory, selectedSource, searchQuery]);

  const loadWorkouts = async (newOffset: number) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: newOffset.toString(),
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSource) params.append('source', selectedSource);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/workout-templates?${params}`);

      if (!response.ok) {
        throw new Error('Failed to load workouts');
      }

      const data = await response.json();
      setWorkouts(data.workouts || []);
      setHasMore(data.hasMore || false);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadWorkouts(offset + LIMIT);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        className="bg-dark/40 border border-accent/20 rounded-lg p-4 space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search workouts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-dark border border-accent/30 rounded text-light placeholder-light/50 focus:outline-none focus:border-accent"
        />

        {/* Category Filter */}
        <div>
          <label className="text-sm text-light/70 block mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-dark border border-accent/30 rounded text-light focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="text-sm text-light/70 block mb-2">Source</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2 bg-dark border border-accent/30 rounded text-light focus:outline-none focus:border-accent"
          >
            <option value="">All Sources</option>
            {sources.map((src) => (
              <option key={src.name} value={src.name}>
                {src.name} ({src.count})
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-dark/40 border border-accent/20 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Workout List */}
      {!loading && workouts.length > 0 && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {workouts.map((workout, idx) => (
            <motion.div
              key={workout.id}
              className="bg-dark/40 border border-accent/20 rounded-lg p-4 hover:border-accent/50 cursor-pointer transition"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectWorkout?.(workout)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-light font-semibold">{workout.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                      {workout.category}
                    </span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {workout.source}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-light/70">{workout.duration}m</div>
                  {workout.tss && (
                    <div className="text-xs text-light/50">TSS: {workout.tss}</div>
                  )}
                </div>
              </div>

              {/* Interval Preview */}
              <div className="flex gap-1 mt-3">
                {workout.intervals?.slice(0, 5).map((interval, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 rounded"
                    style={{
                      backgroundColor: getZoneColor(interval.intensity?.zone || 'Z2'),
                      opacity: 0.6,
                    }}
                    title={interval.name}
                  />
                ))}
                {(workout.intervals?.length || 0) > 5 && (
                  <div className="w-8 h-8 rounded bg-light/10 flex items-center justify-center text-xs text-light/50">
                    +{(workout.intervals?.length || 0) - 5}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && workouts.length === 0 && (
        <div className="text-center py-8 text-light/50">
          No workouts found. Try adjusting your filters.
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <motion.button
          onClick={handleLoadMore}
          className="w-full py-3 bg-accent/20 hover:bg-accent/30 border border-accent/50 rounded-lg text-accent font-semibold transition"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Load More ({LIMIT} per page)
        </motion.button>
      )}
    </div>
  );
}

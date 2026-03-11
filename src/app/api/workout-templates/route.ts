/**
 * Workout Template API Endpoints
 * 
 * GET /api/workout-templates - List all templates with filtering
 *   ?category=BASE&source=carlos&limit=20&offset=0&search=tempo
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

interface WorkoutTemplate {
  id: string;
  title: string;
  source: string;
  category: string;
  primaryZone: string;
  duration: number;
  difficulty: number;
  tss?: number;
  intervals: Array<any>;
}

// Load metadata once
let workoutMetadata: any = null;

function loadMetadata() {
  if (workoutMetadata) return workoutMetadata;
  
  try {
    const metadataPath = path.join(
      process.cwd(),
      'src/lib/workouts/workouts-metadata.json'
    );
    const raw = fs.readFileSync(metadataPath, 'utf8');
    workoutMetadata = JSON.parse(raw);
    return workoutMetadata;
  } catch (error) {
    console.error('Failed to load workout metadata:', error);
    return null;
  }
}

function loadWorkout(workoutPath: string): WorkoutTemplate | null {
  try {
    const fullPath = path.join(process.cwd(), 'src/lib/workouts', workoutPath);
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to load workout ${workoutPath}:`, error);
    return null;
  }
}

/**
 * GET /api/workout-templates
 * List all workout templates with optional filtering
 * 
 * Query params:
 * - category: Filter by category (e.g., BASE, VO2MAX, THRESHOLD)
 * - source: Filter by source (carlos, zwift, research, etc.)
 * - search: Search by title or description
 * - limit: Max results (default 20, max 100)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const metadata = loadMetadata();
    if (!metadata) {
      return NextResponse.json(
        { error: 'Workout database unavailable' },
        { status: 500 }
      );
    }

    // Get query params
    const category = request.nextUrl.searchParams.get('category');
    const source = request.nextUrl.searchParams.get('source');
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase();
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '20'),
      500  // Increased from 100 to 500 to support full 260-workout database
    );
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    // Filter from metadata
    let results = metadata.all || [];

    if (!Array.isArray(results) || results.length === 0) {
      console.warn('[API] No workouts found in metadata.all, trying byCategory');
      // Fallback: build from byCategory
      results = [];
      for (const [category, workouts] of Object.entries(metadata.byCategory || {})) {
        if (Array.isArray(workouts)) {
          results.push(...workouts.map((w: any) => ({
            ...w,
            category,
            file: `${w.source}/${w.id}.json`
          })));
        }
      }
    }

    // Apply filters
    if (category) {
      results = results.filter((w: any) => w.category === category.toUpperCase());
    }

    if (source) {
      results = results.filter((w: any) => w.source === source.toLowerCase());
    }

    if (search) {
      results = results.filter((w: any) =>
        w.title.toLowerCase().includes(search) ||
        (w.description && w.description.toLowerCase().includes(search))
      );
    }

    // Pagination
    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    // Load full workout details for results
    const fullWorkouts = paginated
      .map((w: any) => {
        const filePath = w.file || `${w.source}/${w.id}.json`;
        return loadWorkout(filePath);
      })
      .filter((w: any) => w !== null);

    return NextResponse.json({
      workouts: fullWorkouts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Workout template API error:', error);
    return NextResponse.json(
      { error: 'Failed to list workouts' },
      { status: 500 }
    );
  }
}

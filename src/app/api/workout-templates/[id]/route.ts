/**
 * Single Workout Template Endpoint
 * 
 * GET /api/workout-templates/[id] - Get workout by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

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

/**
 * GET /api/workout-templates/[id]
 * Get a single workout by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const metadata = loadMetadata();
    if (!metadata) {
      return NextResponse.json(
        { error: 'Workout database unavailable' },
        { status: 500 }
      );
    }

    const workoutId = id;

    // Find workout in metadata
    const workoutMeta = metadata.all?.find(
      (w: any) => w.id === workoutId
    );

    if (!workoutMeta) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Load full workout
    const workoutPath = path.join(
      process.cwd(),
      'src/lib/workouts',
      workoutMeta.file
    );

    const raw = fs.readFileSync(workoutPath, 'utf8');
    const workout = JSON.parse(raw);

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Workout template API error:', error);
    return NextResponse.json(
      { error: 'Failed to get workout' },
      { status: 500 }
    );
  }
}

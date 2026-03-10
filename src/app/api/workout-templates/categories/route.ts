/**
 * Get all available categories
 * GET /api/workout-templates/categories
 */

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const metadataPath = path.join(
      process.cwd(),
      'src/lib/workouts/workouts-metadata.json'
    );
    const raw = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(raw);

    const byCategory = metadata.byCategory || {};
    const categories = Object.entries(byCategory).map(
      ([name, workouts]: [string, any]) => ({
        name,
        count: Array.isArray(workouts) ? workouts.length : 0,
      })
    );

    return NextResponse.json({
      categories: categories.sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
}

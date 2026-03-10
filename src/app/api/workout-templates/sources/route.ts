/**
 * Get all available sources
 * GET /api/workout-templates/sources
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

    const bySource = metadata.bySource || {};
    const sources = Object.entries(bySource).map(
      ([name, data]: [string, any]) => ({
        name,
        count: typeof data === 'object' && data.count ? data.count : 0,
      })
    );

    return NextResponse.json({
      sources: sources.sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error('Sources API error:', error);
    return NextResponse.json(
      { error: 'Failed to load sources' },
      { status: 500 }
    );
  }
}

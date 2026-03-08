# Segments Tracker Feature Documentation

## Overview

The Segments Tracker allows cyclists to monitor their performance on Strava segments, track personal records (PRs), and identify opportunities for improvement.

## How It Works

### Data Collection

**Activity Extraction (94 activities):**
- Out of 887 total rides synced, 94 contain Strava segment data
- Segments only appear on outdoor rides with GPS data
- Indoor trainer rides (Zwift, Peloton, etc.) don't have segments
- Shorter rides in low-segment-density areas may not have segments

**Segment Identification:**
- Each activity contains multiple "segment_efforts"
- Same segment appears across multiple rides → shows frequency
- "Popular" segments = ones you've ridden most often
- Example: "Fuego Flats Forward Sprint" = 56 attempts

**Segment Data Includes:**
- Name, distance, elevation gain
- Your best time (PR)
- Number of attempts
- Recent performance trend
- Form score (fitness level at time of ride)

### Filtering Capabilities

#### 1. Status Filters
- **All (20)** - All segments with data
- **🎯 PR Opportunities (20)** - Segments where you can improve
- **📈 Improving (20)** - Segments getting faster (positive trend)
- **📉 Declining (0)** - Segments getting slower (negative trend)

#### 2. Activity Type Filters (NEW)
- **All** - All segments
- **🚴 Outdoor** - Segments from outdoor rides (Road, Gravel, Mountain)
- **📱 Indoor** - Segments from indoor trainer rides (Zwift, Peloton, etc.)

**Why This Matters:**
- Outdoor segments are affected by weather, road conditions, traffic
- Indoor segments show pure power/fitness on standardized courses
- Indoor segments (Zwift) have worldwide leaderboards
- Different strategies for improving each type

#### 3. Sorting Options
- **Most Attempts** - Segments you ride most frequently
- **Longest Distance** - Segments by distance
- **Best Form Score** - Segments where you're currently strongest
- **Name (A-Z)** - Alphabetical order

### Segment Card Details

Each segment card shows:
```
[Segment Name] 
[Distance] · [Elevation]

Best Time (PR): [time]
Distance from PR: [gap] ([slower %])

Attempts: [number]          Form Score: [%]

Trend: [faster/slower]
```

**Example:**
```
Fuego Flats Forward Sprint
0.50 km · 0m elevation

Best Time (PR): 0:48
Distance from PR: +11s (23% slower)

Attempts: 56          Form Score: 75%

↓ -19.1% faster
```

**What Each Metric Means:**

- **Best Time (PR)** - Your personal record on this segment
- **Distance from PR** - How far off your PR you are currently
  - `+11s` means you're 11 seconds slower
  - `(23% slower)` means 23% longer than your best time
- **Attempts** - Total times you've ridden this segment
- **Form Score** - Your fitness level at this ride (75% = good)
- **Trend** - Direction of performance
  - `↓ -19.1% faster` = Getting faster (improving)
  - `↑ +5% slower` = Getting slower (declining)

### Performance Insights

#### PR Opportunities
Shows segments where you're close to improving your PR:
- Current fitness is high (Form Score > 85%)
- You're within striking distance of your PR
- Good targets for training focus

#### Improving Segments
Positive trend - you're getting faster:
- Recent attempts are faster than your average
- Good signs of training effect
- Consider these for confidence/momentum

#### Declining Segments
Negative trend - you're getting slower:
- Could indicate fatigue, lack of practice, or deconditioning
- May need specific training to address
- Good data points for coaching adjustments

## Data Flow

```
Strava API
    ↓
Sync Activities (887 total)
    ↓
Extract Segment Data (94 with segments, 771 segments)
    ↓
Calculate Stats (attempts, PR, trend, form score)
    ↓
Store in Database
    ↓
Display in Segments Tracker
    ↓
Filter by: Status, Activity Type, Sort
    ↓
User sees relevant segments for training
```

## Implementation Details

### Files
- `src/app/segments/page.tsx` - Page component
- `src/components/StravaSegments.tsx` - Main segments tracker
- `src/components/SegmentTrackerFilters.tsx` - NEW filter component
- `src/services/StravaHub.ts` - Strava operations (sync, extract, etc.)
- `src/types/index.ts` - Type definitions

### API Endpoints
- `GET /api/strava/segments` - Get segment data
- `POST /api/strava/sync-5years` - Sync all historical activities
- `POST /api/strava/extract-segments` - Extract segments from activities

### Database Schema (Prisma)
```prisma
model Segment {
  id             String   @id
  userId         String
  segmentId      String
  name           String
  distance       Float
  elevation      Float
  avgGrade       Float
  attempts       Int
  bestTime       Int
  trend          String   // "improving" | "declining" | "stable"
  formScore      Int      // 0-100
  isPR           Boolean
  activityType   String   // "Ride", "VirtualRide", "Indoor Cycling"
  lastAttempt    DateTime
  createdAt      DateTime
  updatedAt      DateTime

  @@unique([userId, segmentId])
}
```

## Usage Examples

### Find PR Opportunities
1. Filter by: Status = "🎯 PR Opportunities"
2. Sort by: "Best Form Score"
3. Focus on top 3-5 segments this week

### Indoor vs Outdoor Training
1. Toggle "Activity Type = 📱 Indoor"
2. See only Zwift/trainer segments
3. Compare power/fitness vs outdoor

### Track Progress on Key Segments
1. Filter by: Status = "📈 Improving"
2. All segments here show positive trend
3. Great for motivation/validation

### Identify Problem Areas
1. Filter by: Status = "📉 Declining"
2. These segments need attention
3. Could indicate specific weakness or fatigue

## Future Enhancements

- [ ] Segment-specific training plans
- [ ] PR prediction based on form score
- [ ] Compare performance vs other riders
- [ ] Segment leaderboards (with friends)
- [ ] Export segment data (CSV/PDF)
- [ ] Segment heat map (most ridden areas)
- [ ] Weather impact analysis
- [ ] Time-of-day performance analysis

## Tips for Using Segments

1. **Set a Weekly Goal** - Pick 1-2 PR opportunity segments to target
2. **Track Trends** - Use "Improving" filter to see progress
3. **Manage Fatigue** - "Declining" segments can indicate overtraining
4. **Indoor Focus** - Use Zwift segments for consistent power data
5. **Outdoor Variety** - Mix outdoor segments for real-world conditions
6. **Form Score** - Only go for PRs when form score is 80%+
7. **Recovery** - Don't chase all segments simultaneously

## See Also
- Trainer Guide: `/docs/training-guide.md`
- Strava Integration: `/docs/strava-setup.md`
- AI Coaching: `/docs/ai-coaching.md`

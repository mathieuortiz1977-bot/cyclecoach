import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

interface WorkoutData {
  id: string;
  date: string;
  sessionTitle?: string;
  duration?: number;
  plannedSession?: {
    title: string;
    duration: number;
    targetPower: number;
    sessionType: string;
  };
}

interface WeeklyGoals {
  totalTSS: number;
  zoneDistribution: { [zone: string]: number };
  keyWorkouts: string[];
  totalDuration: number;
}

export async function POST(request: NextRequest) {
  try {
    const { cancelledWorkout, remainingWorkouts, weeklyGoals, cancelReason } = await request.json();

    // Use Anthropic model for AI coaching
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }
    
    const model = anthropic("claude-3-5-sonnet-20241022");

    const prompt = `You are a world-class cycling coach and training scientist. A cyclist has cancelled a workout and needs intelligent rescheduling for the rest of the week.

**CANCELLED WORKOUT:**
- Session: ${cancelledWorkout.plannedSession?.title || "Unknown Session"}
- Date: ${new Date(cancelledWorkout.date).toLocaleDateString('en-US', { weekday: 'long' })}
- Duration: ${cancelledWorkout.plannedSession?.duration || 0} minutes
- Type: ${cancelledWorkout.plannedSession?.sessionType || "Unknown"}
- Reason: ${cancelReason}

**REMAINING WORKOUTS THIS WEEK:**
${remainingWorkouts.map((w: WorkoutData, i: number) => `${i + 1}. ${w.plannedSession?.title} (${new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' })}) - ${w.plannedSession?.duration}min - ${w.plannedSession?.sessionType}`).join('\n')}

**ORIGINAL WEEKLY GOALS:**
- Target TSS: ${weeklyGoals.totalTSS}
- Total Duration: ${Math.round(weeklyGoals.totalDuration / 60)}h ${weeklyGoals.totalDuration % 60}m
- Key Workouts: ${weeklyGoals.keyWorkouts.join(', ') || 'None identified'}
- Zone Distribution: ${Object.entries(weeklyGoals.zoneDistribution).map(([zone, minutes]) => `${zone}: ${minutes}min`).join(', ')}

**TRAINING SCIENCE PRINCIPLES TO FOLLOW:**
1. Maintain weekly training stress (TSS) as close to original target as possible
2. Preserve key interval sessions - never skip high-intensity work completely
3. Extend existing sessions intelligently (10-20% max increase per session)
4. Maintain polarized training distribution (80/20 easy/hard)
5. Consider fatigue and recovery based on cancellation reason
6. Don't overload any single day beyond reasonable limits

**RESCHEDULING STRATEGY BY CANCELLATION REASON:**
- Feeling unwell: Reduce intensity, maintain aerobic base
- Schedule conflict: Redistribute workload evenly
- Weather conditions: Prioritize indoor alternatives
- Equipment issues: Focus on bodyweight/alternative training
- Recovery needed: Reduce total stress, emphasize easy sessions

**OUTPUT FORMAT (JSON):**
Provide a JSON response with exactly this structure:
{
  "success": true,
  "explanation": "Brief explanation of your rescheduling strategy (2-3 sentences)",
  "modifications": [
    {
      "workoutId": "workout_id_here", 
      "changes": "Description of what changed",
      "newDuration": 90,
      "newTitle": "Modified Session Title",
      "intensityAdjustment": "increased/decreased/maintained",
      "reasoning": "Why this change makes sense"
    }
  ],
  "weeklyImpact": {
    "tssPreserved": 85,
    "stressReduction": 15,
    "trainingFocus": "aerobic base/threshold/vo2max/mixed"
  }
}

Be practical, scientifically sound, and considerate of the athlete's situation. Quality over quantity.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    // Parse AI response
    let aiResponse;
    try {
      // Extract JSON from the response text
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", result.text);
      
      // Fallback response
      aiResponse = {
        success: true,
        explanation: "Applied simple redistribution due to AI parsing error. Extended remaining sessions proportionally.",
        modifications: remainingWorkouts.slice(0, 2).map((w: WorkoutData, i: number) => ({
          workoutId: w.id,
          changes: "Duration extended by 10-15 minutes",
          newDuration: (w.plannedSession?.duration || 60) + (i === 0 ? 15 : 10),
          newTitle: `${w.plannedSession?.title} (Extended)`,
          intensityAdjustment: "maintained",
          reasoning: "Redistributing cancelled workout load"
        })),
        weeklyImpact: {
          tssPreserved: 75,
          stressReduction: 25,
          trainingFocus: "mixed"
        }
      };
    }

    // Convert AI response back to workout format
    const reschedule = remainingWorkouts.map((workout: WorkoutData) => {
      const modification = aiResponse.modifications?.find((mod: any) => mod.workoutId === workout.id);
      
      if (modification) {
        return {
          ...workout,
          plannedSession: {
            ...workout.plannedSession!,
            title: modification.newTitle || workout.plannedSession!.title,
            duration: modification.newDuration || workout.plannedSession!.duration,
          }
        };
      }
      
      return workout;
    });

    return NextResponse.json({
      success: true,
      reschedule,
      aiExplanation: aiResponse.explanation,
      weeklyImpact: aiResponse.weeklyImpact,
      modifications: aiResponse.modifications,
    });

  } catch (error) {
    console.error("AI rescheduling error:", error);
    
    // Simple fallback reschedule
    const { remainingWorkouts, cancelledWorkout } = await request.json();
    const fallbackReschedule = remainingWorkouts.map((workout: WorkoutData, index: number) => {
      if (index < 2 && workout.plannedSession) {
        const extraMinutes = Math.round((cancelledWorkout.plannedSession?.duration || 60) / 2 / (index + 1));
        return {
          ...workout,
          plannedSession: {
            ...workout.plannedSession,
            duration: workout.plannedSession.duration + extraMinutes,
            title: `${workout.plannedSession.title} (Extended)`
          }
        };
      }
      return workout;
    });

    return NextResponse.json({
      success: true,
      reschedule: fallbackReschedule,
      aiExplanation: "Applied simple redistribution to maintain weekly training load.",
      weeklyImpact: { tssPreserved: 70, stressReduction: 30, trainingFocus: "mixed" }
    });
  }
}
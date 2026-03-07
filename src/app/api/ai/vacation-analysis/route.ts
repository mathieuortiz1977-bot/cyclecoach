import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

interface Vacation {
  startDate: string;
  endDate: string;
  type: "complete_break" | "light_activity" | "cross_training";
  duration: number;
  description?: string;
  location?: string;
}

interface TrainingProgram {
  currentBlock: number;
  currentWeek: number;
  totalBlocks: number;
  totalWeeks: number;
  programStartDate: string;
  programEndDate: string;
  currentFocus: string;
  upcomingGoals: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { vacation, trainingProgram, existingVacations } = await request.json();

    // Use Anthropic model for vacation analysis
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }
    
    const model = anthropic("claude-3-5-sonnet-20241022");

    const prompt = `You are a world-class cycling coach and exercise scientist specializing in periodization and detraining/retraining protocols. A cyclist is planning a vacation and needs intelligent program adjustments.

**VACATION DETAILS:**
- Duration: ${vacation.duration} days (${new Date(vacation.startDate).toLocaleDateString()} to ${new Date(vacation.endDate).toLocaleDateString()})
- Activity Level: ${vacation.type.replace('_', ' ')}
- Location: ${vacation.location || "Not specified"}
- Description: ${vacation.description || "Not specified"}

**CURRENT TRAINING PROGRAM:**
- Program Week: ${trainingProgram.currentWeek}/${trainingProgram.totalWeeks}
- Training Block: ${trainingProgram.currentBlock}/${trainingProgram.totalBlocks}
- Current Focus: ${trainingProgram.currentFocus}
- Program Start: ${new Date(trainingProgram.programStartDate).toLocaleDateString()}
- Program End: ${new Date(trainingProgram.programEndDate).toLocaleDateString()}
- Upcoming Goals: ${trainingProgram.upcomingGoals?.join(', ') || 'Not specified'}

**EXISTING VACATIONS:**
${existingVacations?.length > 0 ? existingVacations.map((v: any) => `${new Date(v.startDate).toLocaleDateString()} to ${new Date(v.endDate).toLocaleDateString()} (${v.type})`).join('\n') : 'None'}

**DETRAINING SCIENCE TO CONSIDER:**
- 1-3 days: Minimal impact, mostly glycogen depletion
- 4-7 days: 5-10% VO2max decline, strength maintained
- 8-14 days: 10-15% aerobic fitness loss, noticeable power decline
- 15-21 days: 15-25% fitness loss, significant detraining
- 21+ days: Major detraining, substantial rebuilding required

**ACTIVITY TYPE IMPACT:**
- Complete Break: Full detraining timeline applies
- Light Activity: 50% slower detraining (walking, easy movement)
- Cross Training: 25% slower detraining if cardiovascular maintained

**PERIODIZATION CONSIDERATIONS:**
- Base Phase: Lower impact, easier to resume
- Build Phase: Moderate impact, fitness gains may be lost
- Peak Phase: High impact, timing critical for events
- Recovery Phase: Actually beneficial if timed well

**PROGRAM TIMING ANALYSIS:**
Consider where in the periodization cycle this vacation falls and how it affects:
- Training stimulus progression
- Adaptation windows
- Goal event timing
- Seasonal planning

**OUTPUT FORMAT (JSON):**
Provide a JSON response with exactly this structure:
{
  "success": true,
  "analysis": {
    "impact": {
      "fitnessLoss": "Expected percentage range (e.g., 5-15%)",
      "detrainingLevel": "Low/Moderate/High",
      "recoveryTime": "Time to return to pre-vacation fitness",
      "description": "2-3 sentence summary of overall impact"
    },
    "periodizationImpact": {
      "phaseDisruption": "How this affects current training phase",
      "goalImpact": "Effect on upcoming goals/events",
      "optimalTiming": "Whether timing is good/bad and why"
    },
    "recommendations": [
      "Specific pre-vacation recommendations",
      "During-vacation activity suggestions",
      "Post-vacation return protocols",
      "Program modification suggestions"
    ],
    "programAdjustments": {
      "preVacation": "1-2 weeks before departure adjustments",
      "duringVacation": "Minimal activity recommendations",
      "postVacation": "Return-to-training protocol",
      "programExtension": "How much to extend program (if any)",
      "intensityModifications": "How to modify training intensity",
      "volumeAdjustments": "Changes to training volume"
    },
    "maintenanceStrategy": {
      "minimalEffectiveDose": "Absolute minimum to maintain fitness",
      "crossTrainingOptions": "Alternative activities if available",
      "nutritionFocus": "Dietary considerations during break"
    }
  }
}

Be specific, practical, and scientifically accurate. Consider the athlete's goals, current program phase, and vacation timing in your recommendations.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
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
      
      // Fallback analysis
      aiResponse = {
        success: true,
        analysis: generateFallbackAnalysis(vacation, trainingProgram)
      };
    }

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("Vacation analysis error:", error);
    
    // Return fallback analysis
    const { vacation, trainingProgram } = await request.json();
    
    return NextResponse.json({
      success: true,
      analysis: generateFallbackAnalysis(vacation, trainingProgram)
    });
  }
}

function generateFallbackAnalysis(vacation: Vacation, program: TrainingProgram) {
  const duration = vacation.duration;
  
  // Determine impact based on duration and activity type
  let fitnessLoss = "5-10%";
  let detrainingLevel = "Low";
  let recoveryTime = "1-2 weeks";
  let description = "Short vacation with minimal fitness impact";

  if (duration <= 7) {
    fitnessLoss = "0-5%";
    detrainingLevel = "Minimal";
    recoveryTime = "3-7 days";
    description = "Brief break - minimal fitness loss expected. Quick return to training possible.";
  } else if (duration <= 14) {
    fitnessLoss = "5-15%";
    detrainingLevel = "Moderate";
    recoveryTime = "2-3 weeks";
    description = "Moderate vacation length. Some fitness decline expected but manageable with proper return protocol.";
  } else if (duration <= 21) {
    fitnessLoss = "15-25%";
    detrainingLevel = "High";
    recoveryTime = "3-5 weeks";
    description = "Extended vacation. Significant detraining expected, requiring careful rebuilding phase.";
  } else {
    fitnessLoss = "20-35%";
    detrainingLevel = "Very High";
    recoveryTime = "5-8 weeks";
    description = "Long vacation period. Major detraining expected, essentially starting over with base fitness.";
  }

  // Adjust for activity type
  if (vacation.type === "cross_training") {
    fitnessLoss = fitnessLoss.split('-').map(n => Math.round(parseInt(n.replace('%', '')) * 0.7) + '%').join('-');
    description += " Cross-training activities will help maintain cardiovascular fitness.";
  } else if (vacation.type === "light_activity") {
    fitnessLoss = fitnessLoss.split('-').map(n => Math.round(parseInt(n.replace('%', '')) * 0.8) + '%').join('-');
    description += " Light activities will provide some fitness maintenance benefits.";
  }

  return {
    impact: {
      fitnessLoss,
      detrainingLevel,
      recoveryTime,
      description
    },
    periodizationImpact: {
      phaseDisruption: determinePhaseDisruption(program),
      goalImpact: "Goals may need to be adjusted based on fitness loss",
      optimalTiming: analyzeVacationTiming(vacation, program)
    },
    recommendations: generateRecommendations(vacation, duration),
    programAdjustments: {
      preVacation: "Light taper week with reduced volume, maintain intensity",
      duringVacation: vacation.type === "complete_break" ? "Complete rest and recovery" : "Light recreational activities as desired",
      postVacation: `Progressive 2-${Math.ceil(duration/7)}-week return focusing on aerobic base before intensity`,
      programExtension: duration > 14 ? `${Math.ceil(duration/7)} weeks` : "No extension needed",
      intensityModifications: "Reduce intensity by 20-30% first week back, gradual progression",
      volumeAdjustments: `Start at 50-60% of pre-vacation volume, build by 10-15% weekly`
    },
    maintenanceStrategy: {
      minimalEffectiveDose: duration > 10 ? "2 x 30-45min easy activities per week" : "Not necessary for short break",
      crossTrainingOptions: "Walking, swimming, hiking, recreational cycling",
      nutritionFocus: "Maintain protein intake, enjoy vacation foods in moderation"
    }
  };
}

function determinePhaseDisruption(program: TrainingProgram): string {
  const weekProgress = program.currentWeek / program.totalWeeks;
  
  if (weekProgress < 0.3) {
    return "Low disruption - still in base building phase";
  } else if (weekProgress < 0.7) {
    return "Moderate disruption - may interrupt build phase progression";
  } else {
    return "High disruption - occurs during peak/taper phase";
  }
}

function analyzeVacationTiming(vacation: Vacation, program: TrainingProgram): string {
  const vacationStart = new Date(vacation.startDate);
  const programEnd = new Date(program.programEndDate);
  const weeksToEnd = (programEnd.getTime() - vacationStart.getTime()) / (1000 * 60 * 60 * 24 * 7);
  
  if (weeksToEnd > 8) {
    return "Good timing - plenty of time to rebuild before program completion";
  } else if (weeksToEnd > 4) {
    return "Acceptable timing - adequate rebuild time available";
  } else {
    return "Challenging timing - limited time for full recovery before program end";
  }
}

function generateRecommendations(vacation: Vacation, duration: number): string[] {
  const recs = [];
  
  recs.push("Complete a light taper week before departure to arrive fresh");
  
  if (vacation.type === "complete_break") {
    recs.push("Embrace complete rest - mental and physical recovery is valuable");
  } else if (vacation.type === "light_activity") {
    recs.push("Enjoy walking, easy swimming, or recreational movement without pressure");
  } else {
    recs.push("Maintain cardiovascular fitness with hiking, running, or swimming");
  }
  
  if (duration > 7) {
    recs.push("Start with easy aerobic activities for first week back");
  }
  
  if (duration > 14) {
    recs.push("Plan a progressive 2-3 week rebuilding phase");
    recs.push("Consider extending your program to accommodate fitness rebuilding");
  }
  
  recs.push("Listen to your body - may feel stronger after proper rest");
  
  return recs;
}
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

interface RaceEvent {
  id?: string;
  name: string;
  date: string;
  type: string;
  priority: "A" | "B" | "C";
  location?: string;
  distance?: string;
  description?: string;
  weeksUntilEvent: number;
}

interface TrainingProgram {
  currentBlock: number;
  currentWeek: number;
  totalBlocks: number;
  totalWeeks: number;
  programStartDate: string;
  programEndDate: string;
  currentFocus: string;
}

export async function POST(request: NextRequest) {
  try {
    const { event, trainingProgram, existingEvents } = await request.json();

    // Use Anthropic model for periodization analysis
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }
    
    const model = anthropic("claude-3-5-sonnet-20241022");

    const prompt = `You are a world-class cycling coach and periodization expert specializing in peak performance planning. An athlete wants to schedule a race event and needs optimal periodization strategy.

**RACE EVENT DETAILS:**
- Event: ${event.name}
- Date: ${new Date(event.date).toLocaleDateString()} (${event.weeksUntilEvent} weeks away)
- Type: ${event.type.replace('_', ' ')}
- Priority: ${event.priority} Priority
- Location: ${event.location || "Not specified"}
- Distance: ${event.distance || "Not specified"}
- Description: ${event.description || "Not specified"}

**CURRENT TRAINING PROGRAM:**
- Program Week: ${trainingProgram.currentWeek}/${trainingProgram.totalWeeks}
- Training Block: ${trainingProgram.currentBlock}/${trainingProgram.totalBlocks}
- Current Focus: ${trainingProgram.currentFocus}
- Program Start: ${new Date(trainingProgram.programStartDate).toLocaleDateString()}
- Program End: ${new Date(trainingProgram.programEndDate).toLocaleDateString()}

**EXISTING EVENTS:**
${existingEvents?.length > 0 ? existingEvents.map((e: any) => `${new Date(e.date).toLocaleDateString()} - ${e.name} (${e.priority} Priority, ${e.type})`).join('\n') : 'None scheduled'}

**PERIODIZATION SCIENCE TO APPLY:**

**A Priority Events (Primary Goals):**
- Full periodization cycle: Base → Build → Peak → Taper
- Taper: 2-3 weeks with volume reduction and intensity maintenance
- Peak form timing: 7-10 days before event
- CTL/ATL management for optimal TSB (Training Stress Balance)
- Full recovery protocol post-event

**B Priority Events (Secondary Goals):**
- Mini-peak approach: Focused build phase
- Taper: 1-2 weeks, less volume reduction
- Maintain some training through event
- Good form but not complete peak

**C Priority Events (Training Races):**
- Training continuity priority
- Minimal taper: 3-7 days freshen-up
- Use as training stimulus
- Quick return to training post-event

**PHYSIOLOGICAL TIMING:**
- Fitness peaks naturally 7-14 days after training stress reduction
- VO2max adaptations: 4-6 weeks
- Lactate threshold improvements: 6-12 weeks
- Neuromuscular power: 2-4 weeks
- CTL (Chronic Training Load) should peak 2-3 weeks before A events

**EVENT TYPE CONSIDERATIONS:**
- Time Trial: Focus on FTP/lactate threshold, aerodynamics
- Road Race: Balance endurance, tactical fitness, sprint power
- Criterium: Emphasis on repeatability, neuromuscular power
- Gran Fondo: Aerobic endurance, pacing strategy
- Stage Race: Multi-day recovery, sustained power

**CONFLICT RESOLUTION:**
- Events within 4 weeks: Choose primary focus
- Events 4-8 weeks apart: Mini-peak for first, full peak for second
- Events >8 weeks apart: Independent periodization cycles

**ALTITUDE/ENVIRONMENTAL FACTORS:**
- If location has significant altitude/climate difference, plan adaptation
- Heat acclimatization: 7-14 days
- Altitude adaptation: 2-3 weeks minimum

**OUTPUT FORMAT (JSON):**
Provide a JSON response with exactly this structure:

{
  "success": true,
  "analysis": {
    "periodization": {
      "taperWeeks": 2,
      "peakDate": "2024-05-15T00:00:00Z",
      "phases": {
        "base": "8 weeks - build aerobic capacity",
        "build": "6 weeks - lactate threshold focus", 
        "peak": "3 weeks - race-specific intensity",
        "recover": "2 weeks - active recovery"
      },
      "peakFormWindow": "7-10 days before event",
      "ctlTarget": "Peak CTL 2-3 weeks before event"
    },
    "peakTiming": {
      "optimalPeakDate": "2024-05-20T00:00:00Z",
      "reasoning": "Based on [priority] event and physiological adaptation timing",
      "formPrediction": "Peak/Good/Moderate form expected",
      "taperStrategy": "Specific taper protocol based on priority"
    },
    "programImpact": {
      "currentProgramAdjustment": "How to modify existing program",
      "conflictsWith": ["List any conflicts with existing events"],
      "recommendations": [
        "Specific training phase recommendations",
        "Volume and intensity guidelines",
        "Key workout types to prioritize"
      ]
    },
    "eventSpecificPrep": {
      "keyWorkouts": ["Race-specific training sessions"],
      "tacticalPrep": "Race strategy considerations",
      "equipmentTiming": "When to finalize race equipment",
      "nutritionStrategy": "Race nutrition rehearsal timing"
    },
    "riskFactors": {
      "timeConstraints": "Assessment of preparation time",
      "overlapConcerns": "Conflicts with other events",
      "recommendedAdjustments": ["Suggested modifications"]
    }
  }
}

Be specific about dates, training phases, and physiological reasoning. Consider the athlete's current program state and existing event schedule. Provide actionable periodization strategy based on proven training science.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
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
        analysis: generateFallbackPeriodizationAnalysis(event, trainingProgram, existingEvents)
      };
    }

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("Event periodization analysis error:", error);
    
    // Return fallback analysis
    const { event, trainingProgram, existingEvents } = await request.json();
    
    return NextResponse.json({
      success: true,
      analysis: generateFallbackPeriodizationAnalysis(event, trainingProgram, existingEvents)
    });
  }
}

function generateFallbackPeriodizationAnalysis(event: RaceEvent, program: TrainingProgram, existingEvents: any[]) {
  const weeksUntilEvent = event.weeksUntilEvent;
  
  // Determine taper duration based on priority
  const taperWeeks = event.priority === "A" ? 3 : event.priority === "B" ? 2 : 1;
  
  // Calculate optimal peak date (1 week before A events, 3-5 days before B/C events)
  const peakDaysOffset = event.priority === "A" ? 7 : event.priority === "B" ? 5 : 3;
  const optimalPeakDate = new Date(event.date);
  optimalPeakDate.setDate(optimalPeakDate.getDate() - peakDaysOffset);
  
  // Calculate phase distribution
  const remainingWeeks = Math.max(0, weeksUntilEvent - taperWeeks);
  const buildWeeks = event.priority === "A" ? Math.min(8, Math.max(4, Math.floor(remainingWeeks * 0.4))) : Math.min(4, remainingWeeks);
  const baseWeeks = Math.max(0, remainingWeeks - buildWeeks);
  
  // Check for conflicts
  const conflicts = existingEvents.filter(existingEvent => {
    const existingDate = new Date(existingEvent.date);
    const eventDate = new Date(event.date);
    const diffWeeks = Math.abs((eventDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks < 4 && (!event.id || existingEvent.id !== event.id);
  }).map(e => e.name);
  
  // Generate recommendations based on event type and priority
  const recommendations = [];
  
  if (event.priority === "A") {
    recommendations.push("Implement full periodization with 3-phase approach");
    recommendations.push("Target CTL peak 2-3 weeks before event");
    recommendations.push("Include race-specific intensity in final build phase");
  } else if (event.priority === "B") {
    recommendations.push("Focus on targeted build phase for mini-peak");
    recommendations.push("Maintain base fitness throughout preparation");
  } else {
    recommendations.push("Continue current training with minimal disruption");
    recommendations.push("Use event as training stimulus");
  }
  
  // Add event-type specific recommendations
  if (event.type.includes("time_trial")) {
    recommendations.push("Emphasize FTP and lactate threshold work");
    recommendations.push("Include aerodynamic position training");
  } else if (event.type.includes("criterium")) {
    recommendations.push("Focus on repeatability and neuromuscular power");
    recommendations.push("Practice short, intense efforts with quick recovery");
  } else if (event.type.includes("road_race")) {
    recommendations.push("Balance endurance with tactical positioning practice");
    recommendations.push("Include surge and sprint training");
  }
  
  // Assess time constraints
  let timeConstraintAssessment = "Adequate time available";
  if (weeksUntilEvent < 8 && event.priority === "A") {
    timeConstraintAssessment = "Compressed timeline - focus on key adaptations";
  } else if (weeksUntilEvent < 4) {
    timeConstraintAssessment = "Very limited time - maintain fitness and freshen up";
  } else if (weeksUntilEvent > 20) {
    timeConstraintAssessment = "Extended timeline - full periodization possible";
  }
  
  return {
    periodization: {
      taperWeeks,
      peakDate: optimalPeakDate.toISOString(),
      phases: {
        base: baseWeeks > 0 ? `${baseWeeks} weeks - aerobic development` : "Minimal base phase",
        build: buildWeeks > 0 ? `${buildWeeks} weeks - threshold and VO2max work` : "Limited build phase",
        peak: `${taperWeeks} weeks - taper and race preparation`,
        recover: event.priority === "A" ? "2-3 weeks active recovery" : "3-7 days easy training"
      },
      peakFormWindow: event.priority === "A" ? "7-10 days before event" : "3-5 days before event",
      ctlTarget: event.priority === "A" ? "Peak CTL 2-3 weeks before event" : "Maintain current CTL through event"
    },
    peakTiming: {
      optimalPeakDate: optimalPeakDate.toISOString(),
      reasoning: `${event.priority}-priority event with ${taperWeeks}-week taper for optimal form`,
      formPrediction: event.priority === "A" ? "Peak form expected" : event.priority === "B" ? "Good form expected" : "Moderate form expected",
      taperStrategy: getTaperStrategy(event.priority, event.type)
    },
    programImpact: {
      currentProgramAdjustment: getProgramAdjustment(weeksUntilEvent, event.priority, program.currentFocus),
      conflictsWith: conflicts,
      recommendations
    },
    eventSpecificPrep: {
      keyWorkouts: getKeyWorkouts(event.type),
      tacticalPrep: getTacticalPrep(event.type),
      equipmentTiming: "Finalize equipment 2-3 weeks before event",
      nutritionStrategy: "Practice race nutrition 4-6 weeks before event"
    },
    riskFactors: {
      timeConstraints: timeConstraintAssessment,
      overlapConcerns: conflicts.length > 0 ? "Event conflicts detected" : "No conflicts",
      recommendedAdjustments: getRecommendedAdjustments(weeksUntilEvent, event.priority, conflicts.length)
    }
  };
}

function getTaperStrategy(priority: string, eventType: string): string {
  if (priority === "A") {
    return "Progressive volume reduction (50-60%) while maintaining intensity. Include race-pace efforts.";
  } else if (priority === "B") {
    return "Moderate volume reduction (70-80%) with key intensity sessions maintained.";
  } else {
    return "Light freshen-up: reduce volume slightly, maintain training rhythm.";
  }
}

function getProgramAdjustment(weeksUntilEvent: number, priority: string, currentFocus: string): string {
  if (weeksUntilEvent < 4) {
    return "Transition immediately to race-specific preparation and taper.";
  } else if (weeksUntilEvent < 8) {
    return "Accelerate current phase and move to targeted build for event.";
  } else if (priority === "A") {
    return "Plan full periodization cycle starting with base phase extension.";
  } else {
    return "Continue current program with event-specific modifications in final 4-6 weeks.";
  }
}

function getKeyWorkouts(eventType: string): string[] {
  const typeMap: { [key: string]: string[] } = {
    time_trial: ["FTP intervals (2x20min)", "Time trial position practice", "Lactate threshold work"],
    road_race: ["Group ride simulations", "Surge and attack practice", "Endurance with surges"],
    criterium: ["Short intervals with recovery", "Cornering practice", "Repeated sprint efforts"],
    gran_fondo: ["Long steady rides", "Pacing practice", "Back-to-back weekend rides"],
    stage_race: ["Multi-day simulation", "Recovery between efforts", "Consistent pacing"],
    cyclocross: ["Skill practice off-road", "Repeated short efforts", "Running practice"],
    track: ["Speed work on track", "Lactate tolerance", "Specific event preparation"],
    triathlon: ["Brick sessions", "Transition practice", "Multi-sport endurance"]
  };
  
  return typeMap[eventType] || ["Race-specific intervals", "Endurance base", "Intensity work"];
}

function getTacticalPrep(eventType: string): string {
  const tacticsMap: { [key: string]: string } = {
    time_trial: "Pacing strategy and aerodynamic positioning",
    road_race: "Group dynamics, positioning, and sprint timing",
    criterium: "Cornering lines, field position, and sprint preparation",
    gran_fondo: "Pacing strategy and nutrition timing",
    stage_race: "Energy management across multiple days",
    cyclocross: "Obstacle navigation and running technique",
    track: "Event-specific tactics and track positioning",
    triathlon: "Transition efficiency and multi-sport pacing"
  };
  
  return tacticsMap[eventType] || "Race-specific strategy and positioning";
}

function getRecommendedAdjustments(weeksUntilEvent: number, priority: string, conflictCount: number): string[] {
  const adjustments = [];
  
  if (weeksUntilEvent < 6 && priority === "A") {
    adjustments.push("Consider compressed periodization model");
  }
  
  if (conflictCount > 0) {
    adjustments.push("Prioritize events by importance and adjust expectations");
    adjustments.push("Consider using lower priority events as training races");
  }
  
  if (weeksUntilEvent > 20) {
    adjustments.push("Plan extended base phase before targeted preparation");
  }
  
  if (adjustments.length === 0) {
    adjustments.push("Current timeline allows for optimal preparation");
  }
  
  return adjustments;
}
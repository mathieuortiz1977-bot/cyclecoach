/**
 * AICoachingService - Unified AI coaching operations
 * Consolidates vacation analysis, event periodization, and coaching
 * Single interface for all AI-powered training decisions
 */

import { api } from '@/lib/api';
import type { Vacation, RaceEvent, PeriodizationAnalysis } from '@/types';

export interface CoachingInsight {
  type: 'vacation' | 'race' | 'training' | 'fitness';
  title: string;
  message: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ProgramAdjustment {
  blockIndex: number;
  weekIndex: number;
  changes: string[];
  reason: string;
}

class AICoachingService {
  /**
   * Analyze vacation impact on training program
   */
  async analyzeVacation(
    startDate: string,
    endDate: string,
    type: 'complete_break' | 'light_activity' | 'cross_training',
    currentFtp: number
  ): Promise<CoachingInsight> {
    try {
      const response = await api.ai.vacationAnalysis({
        vacation: { startDate, endDate, type },
        trainingProgram: { currentFtp },
        riderFtp: currentFtp,
      } as any);

      return {
        type: 'vacation',
        title: 'Vacation Analysis',
        message: response.data?.impact || 'Vacation impact calculated',
        recommendation: response.data?.recommendations || 'Continue normal training',
        urgency: 'medium',
      };
    } catch (error) {
      throw new Error(`Failed to analyze vacation: ${error}`);
    }
  }

  /**
   * Analyze race event and create periodization plan
   */
  async analyzeRaceEvent(
    eventDate: string,
    eventType: string,
    priority: 'A' | 'B' | 'C',
    currentFtp: number,
    currentBlock: number
  ): Promise<{
    insight: CoachingInsight;
    periodization: PeriodizationAnalysis;
    adjustments: ProgramAdjustment[];
  }> {
    try {
      const response = await api.ai.eventPeriodization({
        event: { date: eventDate, type: eventType, priority },
        trainingProgram: { currentFtp, currentBlock },
      });

      return {
        insight: {
          type: 'race',
          title: 'Race Periodization Plan',
          message: response.data?.plan || 'Periodization plan created',
          recommendation: response.data?.strategy || 'Follow suggested plan',
          urgency: priority === 'A' ? 'high' : priority === 'B' ? 'medium' : 'low',
        },
        periodization: response.data?.periodization || {},
        adjustments: response.data?.adjustments || [],
      };
    } catch (error) {
      throw new Error(`Failed to analyze race event: ${error}`);
    }
  }

  /**
   * Get coaching note for current training phase
   */
  async getCoachingNote(
    blockType: string,
    currentFtp: number,
    compliance: number
  ): Promise<string> {
    try {
      const response = await api.ai.coach({
        riderFtp: currentFtp,
        question: `What's your coaching advice for the ${blockType} block with current compliance at ${compliance}%?`,
      });

      return response.data?.message || 'Keep pushing! You\'ve got this.';
    } catch (error) {
      console.error('Failed to get coaching note:', error);
      return 'Focus on consistency and listen to your body.';
    }
  }

  /**
   * Get fitness insights based on recent performance
   */
  async analyzeFitness(
    recentWorkouts: any[],
    currentFtp: number,
    trainingAge: number
  ): Promise<CoachingInsight> {
    try {
      const response = await api.ai.coach({
        riderFtp: currentFtp,
        recentActivities: recentWorkouts,
        question: 'How is my current fitness level? What should I focus on?',
      });

      return {
        type: 'fitness',
        title: 'Fitness Analysis',
        message: response.data?.message || 'Fitness assessment complete',
        recommendation: 'Continue current training',
        urgency: 'low',
      };
    } catch (error) {
      console.error('Failed to analyze fitness:', error);
      return {
        type: 'fitness',
        title: 'Fitness Analysis',
        message: 'Unable to analyze at this time',
        recommendation: 'Check back soon',
        urgency: 'low',
      };
    }
  }

  /**
   * Generate training recommendations based on all factors
   */
  async generateRecommendations(
    currentPhase: string,
    recentCompliance: number,
    upcomingEvents: RaceEvent[],
    plannedVacations: Vacation[],
    currentFtp: number
  ): Promise<CoachingInsight[]> {
    try {
      const insights: CoachingInsight[] = [];

      // Get phase coaching note
      const coachNote = await this.getCoachingNote(currentPhase, currentFtp, recentCompliance);
      insights.push({
        type: 'training',
        title: 'Training Focus',
        message: coachNote,
        recommendation: 'Follow the week\'s prescribed workouts',
        urgency: 'high',
      });

      // Analyze upcoming events (if any)
      for (const event of upcomingEvents || []) {
        try {
          const raceAnalysis = await this.analyzeRaceEvent(
            event.date,
            event.type,
            event.priority,
            currentFtp,
            0
          );
          insights.push(raceAnalysis.insight);
        } catch (err) {
          console.warn('Failed to analyze event:', err);
        }
      }

      // Analyze planned vacations (if any)
      for (const vacation of plannedVacations || []) {
        try {
          const vacationInsight = await this.analyzeVacation(
            vacation.startDate,
            vacation.endDate,
            vacation.type as any,
            currentFtp
          );
          insights.push(vacationInsight);
        } catch (err) {
          console.warn('Failed to analyze vacation:', err);
        }
      }

      return insights;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Suggest next block type based on current progress
   */
  async suggestNextBlock(
    currentBlockType: string,
    recentProgress: number,
    fatigueLevel: number,
    currentFtp: number
  ): Promise<{
    suggestedType: string;
    reasoning: string;
    confidence: number;
  }> {
    try {
      const response = await api.ai.coach({
        riderFtp: currentFtp,
        currentForm: recentProgress * 100,
        question: `After completing my ${currentBlockType} block, what should be my next block? Current fatigue: ${fatigueLevel}/10`,
      });

      return {
        suggestedType: 'BUILD',
        reasoning: response.data?.message || 'Continue progressive overload',
        confidence: 0.7,
      };
    } catch (error) {
      console.error('Failed to suggest next block:', error);
      return {
        suggestedType: 'BUILD',
        reasoning: 'Continue progressive overload',
        confidence: 0.6,
      };
    }
  }
}

// Export singleton instance
export const aiCoaching = new AICoachingService();

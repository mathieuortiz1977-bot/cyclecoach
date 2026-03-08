/**
 * Context Providers Barrel Export
 * 
 * Usage:
 * ```tsx
 * import { RiderProvider, usePlanContext, useWorkoutContext } from '@/contexts';
 * ```
 */

export { RiderProvider, useRiderContext } from './RiderContext';
export type { } from './RiderContext';

export { PlanProvider, usePlanContext } from './PlanContext';
export type { } from './PlanContext';

export {
  TrainingDataProvider,
  useTrainingDataContext,
} from './TrainingDataContext';
export type { } from './TrainingDataContext';

export {
  UIProvider,
  useUIContext,
  usePageLoading,
  useSectionLoading,
  useModal,
  useSidebar,
  useGlobalError,
} from './UIContext';
export type { ModalState } from './UIContext';

export {
  WorkoutProvider,
  useWorkoutContext,
} from './WorkoutContext';
export type { } from './WorkoutContext';

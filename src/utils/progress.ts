import type { WorkoutProgress } from '@/types';

export function exercisePercent(done: number | undefined, quantity: number) {
  if (!done || quantity <= 0) return 0;
  return Math.min(100, Math.round((done / quantity) * 100));
}

export function coursePercent(
  workoutIds: string[],
  progress: WorkoutProgress[],
) {
  if (workoutIds.length === 0) return 0;
  const completed = progress.filter(
    (item) => item.workoutCompleted && workoutIds.includes(item.workoutId),
  ).length;
  return Math.round((completed / workoutIds.length) * 100);
}

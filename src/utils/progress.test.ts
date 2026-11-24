import { coursePercent, exercisePercent } from './progress';

describe('exercisePercent', () => {
  it('is 0 without progress', () => {
    expect(exercisePercent(undefined, 10)).toBe(0);
    expect(exercisePercent(0, 10)).toBe(0);
  });
  it('rounds and caps at 100', () => {
    expect(exercisePercent(4, 10)).toBe(40);
    expect(exercisePercent(1, 3)).toBe(33);
    expect(exercisePercent(25, 10)).toBe(100);
  });
  it('does not divide by zero', () => {
    expect(exercisePercent(5, 0)).toBe(0);
  });
});

describe('coursePercent', () => {
  const done = (workoutId: string, workoutCompleted = true) => ({
    workoutId,
    workoutCompleted,
    progressData: [],
  });
  it('counts completed workouts of this course only', () => {
    expect(
      coursePercent(
        ['a', 'b', 'c', 'd'],
        [done('a'), done('b', false), done('x')],
      ),
    ).toBe(25);
  });
  it('is 0 for a course without workouts', () => {
    expect(coursePercent([], [done('a')])).toBe(0);
  });
});

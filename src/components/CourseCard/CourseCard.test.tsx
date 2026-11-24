import { fireEvent, render, screen } from '@testing-library/react';
import type { Course } from '@/types';
import CourseCard from './CourseCard';

const course: Course = {
  _id: 'ab1c3f',
  nameRU: 'Йога',
  nameEN: 'Yoga',
  description: '',
  directions: [],
  fitting: [],
  workouts: [],
  order: 1,
  difficulty: 'сложный',
  durationInDays: 25,
  dailyDurationInMinutes: { from: 20, to: 50 },
};

describe('CourseCard', () => {
  it('shows course data from the API and links to the course page', () => {
    render(<CourseCard course={course} />);
    expect(screen.getByRole('heading', { name: 'Йога' })).toBeInTheDocument();
    expect(screen.getByText('25 дней')).toBeInTheDocument();
    expect(screen.getByText('20-50 мин/день')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/course/ab1c3f');
  });

  it('calls the action handler', () => {
    const onClick = jest.fn();
    render(
      <CourseCard
        course={course}
        action={{ icon: 'plus', label: 'Добавить курс', onClick }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Добавить курс' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens the handler instead of a link when onOpen is set', () => {
    const onOpen = jest.fn();
    render(<CourseCard course={course} onOpen={onOpen} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

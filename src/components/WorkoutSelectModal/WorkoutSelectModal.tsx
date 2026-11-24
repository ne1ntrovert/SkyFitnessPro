'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCourseWorkouts, getErrorMessage } from '@/api/fitness';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Modal from '@/components/Modal/Modal';
import type { Course, Workout, WorkoutProgress } from '@/types';
import styles from './WorkoutSelectModal.module.css';

interface WorkoutSelectModalProps {
  course: Course;
  token: string;
  progress: WorkoutProgress[];
  onClose: () => void;
}

export default function WorkoutSelectModal({
  course,
  token,
  progress,
  onClose,
}: WorkoutSelectModalProps) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getCourseWorkouts(course._id, token)
      .then((data) => {
        if (cancelled) return;
        const order = (workout: Workout) =>
          course.workouts.indexOf(workout._id);
        setWorkouts([...data].sort((a, b) => order(a) - order(b)));
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(getErrorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [course, token]);

  const completedIds = progress
    .filter((item) => item.workoutCompleted)
    .map((item) => item.workoutId);

  return (
    <Modal label="Выберите тренировку" onClose={onClose} width={460}>
      <h2 className={styles.title}>Выберите тренировку</h2>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!workouts && !error && <p className={styles.note}>Загрузка…</p>}
      {workouts?.length === 0 && (
        <p className={styles.note}>В этом курсе пока нет тренировок</p>
      )}
      {workouts && workouts.length > 0 && (
        <ul className={styles.list}>
          {workouts.map((workout) => {
            const [name, ...details] = workout.name.split(' / ');
            const completed = completedIds.includes(workout._id);
            return (
              <li key={workout._id}>
                <label className={styles.item}>
                  <input
                    className={styles.radio}
                    type="radio"
                    name="workout"
                    checked={selectedId === workout._id}
                    onChange={() => setSelectedId(workout._id)}
                  />
                  <span className={styles.mark}>
                    {completed && <Icon name="check" size={24} />}
                  </span>
                  <span>
                    <span className={styles.name}>
                      {name}
                      {completed && (
                        <span className="visuallyHidden"> (завершена)</span>
                      )}
                    </span>
                    {details.length > 0 && (
                      <span className={styles.details}>
                        {details.join(' / ')}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <Button
        fullWidth
        disabled={!selectedId}
        onClick={() => router.push(`/workout/${course._id}/${selectedId}`)}
      >
        Начать
      </Button>
    </Modal>
  );
}

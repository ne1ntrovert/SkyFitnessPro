'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getCourse,
  getCourseProgress,
  getErrorMessage,
  getWorkout,
  saveWorkoutProgress,
} from '@/api/fitness';
import Button from '@/components/Button/Button';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import ProgressModal from '@/components/ProgressModal/ProgressModal';
import { useRequireAuth } from '@/context/AuthContext/AuthContext';
import type { Course, Workout } from '@/types';
import { exercisePercent } from '@/utils/progress';
import styles from './page.module.css';

interface WorkoutData {
  course: Course;
  workout: Workout;
  progress: number[];
  completed: boolean;
}

async function loadWorkout(
  courseId: string,
  workoutId: string,
  token: string,
): Promise<WorkoutData> {
  const [course, workout, courseProgress] = await Promise.all([
    getCourse(courseId),
    getWorkout(workoutId, token),
    getCourseProgress(courseId, token),
  ]);
  const own = courseProgress.workoutsProgress.find(
    (item) => item.workoutId === workoutId,
  );
  return {
    course,
    workout,
    progress: own?.progressData ?? [],
    completed: own?.workoutCompleted ?? false,
  };
}

function embedUrl(video: string) {
  const match = video.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : video;
}

export default function WorkoutPage() {
  const { courseId, workoutId } = useParams<{
    courseId: string;
    workoutId: string;
  }>();
  const token = useRequireAuth();
  const [data, setData] = useState<WorkoutData | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    loadWorkout(courseId, workoutId, token)
      .then((loaded) => {
        if (!cancelled) setData(loaded);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(getErrorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, workoutId, token, reloadKey]);

  if (error && !data) {
    return (
      <main className="container">
        <p className="pageError" role="alert">
          {error}
        </p>
      </main>
    );
  }
  if (!token || !data) {
    return (
      <main className="container">
        <p className="pageNote">Загрузка тренировки…</p>
      </main>
    );
  }

  const { course, workout, progress, completed } = data;
  const number = course.workouts.indexOf(workout._id) + 1;
  const hasProgress = progress.some((value) => value > 0);

  const save = async (values: number[]) => {
    await saveWorkoutProgress(courseId, workoutId, values, token);
    setReloadKey((key) => key + 1);
  };

  const markDone = async () => {
    setMarking(true);
    setError('');
    try {
      await save([]);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setMarking(false);
    }
  };

  return (
    <main className={`container ${styles.main}`}>
      <h1 className={styles.title}>{course.nameRU}</h1>
      <nav className={styles.crumbs} aria-label="Навигация">
        <Link href="/profile">Мой профиль</Link>
        <span aria-hidden="true"> / </span>
        <span>{workout.name.split(' / ')[0]}</span>
      </nav>
      <div className={styles.video}>
        <iframe
          src={embedUrl(workout.video)}
          title={workout.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <section className={styles.card}>
        <h2 className={styles.heading}>
          Упражнения тренировки{number > 0 ? ` ${number}` : ''}
        </h2>
        {error && (
          <p className="pageError" role="alert">
            {error}
          </p>
        )}
        {workout.exercises.length > 0 ? (
          <>
            <ul className={styles.exercises}>
              {workout.exercises.map((exercise, index) => (
                <li key={exercise._id}>
                  <ProgressBar
                    label={exercise.name.replace(/\s*\(.*\)\s*$/, '')}
                    percent={exercisePercent(
                      progress[index],
                      exercise.quantity,
                    )}
                  />
                </li>
              ))}
            </ul>
            <Button
              className={styles.action}
              onClick={() => setModalOpen(true)}
            >
              {hasProgress
                ? 'Обновить свой прогресс'
                : 'Заполнить свой прогресс'}
            </Button>
          </>
        ) : (
          <>
            <p className={styles.note}>
              {completed
                ? 'Тренировка выполнена'
                : 'В этой тренировке нет упражнений с подсчётом повторений'}
            </p>
            {!completed && (
              <Button
                className={styles.action}
                disabled={marking}
                onClick={markDone}
              >
                Отметить выполненной
              </Button>
            )}
          </>
        )}
      </section>
      {modalOpen && (
        <ProgressModal
          exercises={workout.exercises}
          initial={progress}
          onSave={save}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}

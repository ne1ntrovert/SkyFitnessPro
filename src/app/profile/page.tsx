'use client';

import { useEffect, useState } from 'react';
import {
  getCourseProgress,
  getCourses,
  getErrorMessage,
  removeCourse,
  resetCourseProgress,
} from '@/api/fitness';
import Button from '@/components/Button/Button';
import CourseCard from '@/components/CourseCard/CourseCard';
import Icon from '@/components/Icon/Icon';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import WorkoutSelectModal from '@/components/WorkoutSelectModal/WorkoutSelectModal';
import { useAuth, useRequireAuth } from '@/context/AuthContext/AuthContext';
import type { Course, WorkoutProgress } from '@/types';
import { coursePercent } from '@/utils/progress';
import styles from './page.module.css';

type ProgressMap = Record<string, WorkoutProgress[]>;

interface ProfileData {
  courses: Course[];
  progress: ProgressMap;
}

async function loadProfile(
  token: string,
  selectedIds: string[],
): Promise<ProfileData> {
  const all = await getCourses();
  const courses = all
    .filter((course) => selectedIds.includes(course._id))
    .sort((a, b) => a.order - b.order);
  const entries = await Promise.all(
    courses.map(async (course) => {
      const data = await getCourseProgress(course._id, token);
      return [course._id, data.workoutsProgress] as const;
    }),
  );
  return { courses, progress: Object.fromEntries(entries) };
}

function actionText(percent: number) {
  if (percent === 0) return 'Начать тренировки';
  return percent === 100 ? 'Начать заново' : 'Продолжить';
}

export default function ProfilePage() {
  const token = useRequireAuth();
  const { user, logout, refreshUser } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingId, setPendingId] = useState('');
  const [openCourse, setOpenCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    loadProfile(token, user.selectedCourses)
      .then((loaded) => {
        if (!cancelled) setData(loaded);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(getErrorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [token, user, reloadKey]);

  if (!token || !user) {
    return (
      <main className="container">
        <p className="pageNote">Загрузка профиля…</p>
      </main>
    );
  }

  const run = async (courseId: string, task: () => Promise<unknown>) => {
    setPendingId(courseId);
    setError('');
    try {
      await task();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPendingId('');
    }
  };

  const handleRemove = (courseId: string) =>
    run(courseId, async () => {
      await removeCourse(courseId, token);
      await refreshUser();
    });

  const handleRestart = (course: Course) =>
    run(course._id, async () => {
      await resetCourseProgress(course._id, token);
      setReloadKey((key) => key + 1);
      setOpenCourse(course);
    });

  const name = user.email.split('@')[0];

  return (
    <main className={`container ${styles.main}`}>
      <h1 className="pageTitle">Профиль</h1>
      <section className={styles.user}>
        <div className={styles.avatar}>
          <Icon name="user" size={197} />
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{name}</p>
          <p className={styles.login}>Логин: {user.email}</p>
          <Button
            variant="secondary"
            className={styles.logout}
            onClick={logout}
          >
            Выйти
          </Button>
        </div>
      </section>

      <h2 className={`pageTitle ${styles.coursesTitle}`}>Мои курсы</h2>
      {error && (
        <p className="pageError" role="alert">
          {error}
        </p>
      )}
      {!data && !error && <p className="pageNote">Загрузка курсов…</p>}
      {data?.courses.length === 0 && (
        <p className="pageNote">Вы пока не добавили ни одного курса</p>
      )}
      {data && data.courses.length > 0 && (
        <ul className="courseGrid">
          {data.courses.map((course) => {
            const percent = coursePercent(
              course.workouts,
              data.progress[course._id] ?? [],
            );
            const pending = pendingId === course._id;
            return (
              <li key={course._id}>
                <CourseCard
                  course={course}
                  onOpen={() => setOpenCourse(course)}
                  action={{
                    icon: 'minus',
                    label: 'Удалить курс',
                    onClick: () => handleRemove(course._id),
                    disabled: pending,
                  }}
                >
                  <ProgressBar label="Прогресс" percent={percent} />
                  <Button
                    fullWidth
                    disabled={pending}
                    onClick={() =>
                      percent === 100
                        ? handleRestart(course)
                        : setOpenCourse(course)
                    }
                  >
                    {actionText(percent)}
                  </Button>
                </CourseCard>
              </li>
            );
          })}
        </ul>
      )}
      {openCourse && (
        <WorkoutSelectModal
          course={openCourse}
          token={token}
          progress={data?.progress[openCourse._id] ?? []}
          onClose={() => setOpenCourse(null)}
        />
      )}
    </main>
  );
}

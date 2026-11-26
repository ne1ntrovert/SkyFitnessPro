'use client';

import { useEffect, useState } from 'react';
import { addCourse, getCourses, getErrorMessage } from '@/api/fitness';
import Button from '@/components/Button/Button';
import CourseCard from '@/components/CourseCard/CourseCard';
import { useAuth } from '@/context/AuthContext/AuthContext';
import type { Course } from '@/types';
import styles from './page.module.css';

export default function CoursesPage() {
  const { token, user, openAuth, refreshUser } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState('');

  useEffect(() => {
    getCourses()
      .then((data) => setCourses([...data].sort((a, b) => a.order - b.order)))
      .catch((caught: unknown) => setError(getErrorMessage(caught)));
  }, []);

  const handleAdd = async (courseId: string) => {
    if (!token) {
      openAuth('login');
      return;
    }
    setPendingId(courseId);
    setError('');
    try {
      await addCourse(courseId, token);
      await refreshUser();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPendingId('');
    }
  };

  return (
    <main className={`container ${styles.main}`}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Начните заниматься спортом и улучшите качество жизни
        </h1>
        <p className={styles.bubble}>Измените своё тело за полгода!</p>
      </div>
      {error && (
        <p className="pageError" role="alert">
          {error}
        </p>
      )}
      {!courses && !error && <p className="pageNote">Загрузка курсов…</p>}
      {courses && (
        <ul className="courseGrid">
          {courses.map((course) => {
            const added = user?.selectedCourses.includes(course._id) ?? false;
            return (
              <li key={course._id}>
                <CourseCard
                  course={course}
                  action={
                    added
                      ? {
                          icon: 'check',
                          label: 'Курс уже добавлен',
                          onClick: () => undefined,
                          disabled: true,
                        }
                      : {
                          icon: 'plus',
                          label: 'Добавить курс',
                          onClick: () => handleAdd(course._id),
                          disabled: pendingId === course._id,
                        }
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
      <div className={styles.up}>
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Наверх ↑
        </Button>
      </div>
    </main>
  );
}

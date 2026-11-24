'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  addCourse,
  getCourse,
  getErrorMessage,
  removeCourse,
} from '@/api/fitness';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { useAuth } from '@/context/AuthContext/AuthContext';
import type { Course } from '@/types';
import { getCourseVisual } from '@/utils/courseVisual';
import styles from './page.module.css';

const BENEFITS = [
  'проработка всех групп мышц',
  'тренировка суставов',
  'улучшение циркуляции крови',
  'упражнения заряжают бодростью',
  'помогают противостоять стрессам',
];

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const { token, user, openAuth, refreshUser } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCourse(id)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError) {
    return (
      <main className="container">
        <p className="pageError" role="alert">
          {loadError}
        </p>
      </main>
    );
  }
  if (!course) {
    return (
      <main className="container">
        <p className="pageNote">Загрузка курса…</p>
      </main>
    );
  }

  const visual = getCourseVisual(course.nameEN);
  const added = user?.selectedCourses.includes(course._id) ?? false;

  const handleToggle = async () => {
    if (!token) {
      openAuth('login');
      return;
    }
    setPending(true);
    setActionError('');
    try {
      await (added ? removeCourse : addCourse)(course._id, token);
      await refreshUser();
    } catch (caught) {
      setActionError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  let buttonText = 'Войти, чтобы добавить курс';
  if (token) buttonText = added ? 'Удалить курс' : 'Добавить курс';

  return (
    <main className={`container ${styles.main}`}>
      <section className={styles.banner} style={{ background: visual.color }}>
        <h1 className={styles.name}>{course.nameRU}</h1>
        <div className={styles.bannerImage}>
          <Image
            src={visual.image}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 767px) 100vw, 580px"
            style={{ objectFit: 'cover', objectPosition: visual.position }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Подойдет для вас, если:</h2>
        <ol className={styles.fitting}>
          {course.fitting.map((text, index) => (
            <li key={text} className={styles.fit}>
              <span className={styles.fitNumber}>{index + 1}</span>
              {text}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Направления</h2>
        <ul className={styles.directions}>
          {course.directions.map((direction) => (
            <li key={direction} className={styles.direction}>
              <Icon name="star" size={26} />
              {direction}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.promo}>
        <div className={styles.promoArt} aria-hidden="true">
          <svg
            className={styles.swoosh}
            viewBox="0 0 670 390"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-10 330C120 250 300 120 520 60c110-30 170 20 110 90-70 80-260 150-420 200-80 25-60 60 40 45 150-22 310-80 440-150"
              stroke="#bcec30"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M330 120c40-60 110-90 170-70"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <Image
          className={styles.runner}
          src="/img/runner.png"
          alt=""
          width={520}
          height={520}
        />
        <div className={styles.promoText}>
          <h2 className={styles.promoTitle}>Начните путь к новому телу</h2>
          <ul className={styles.benefits}>
            {BENEFITS.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          {actionError && (
            <p className={styles.error} role="alert">
              {actionError}
            </p>
          )}
          <Button
            variant={added ? 'secondary' : 'primary'}
            fullWidth
            disabled={pending || token === undefined}
            onClick={handleToggle}
          >
            {buttonText}
          </Button>
        </div>
      </section>
    </main>
  );
}

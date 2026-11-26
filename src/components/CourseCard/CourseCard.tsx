import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Icon, { type IconName } from '@/components/Icon/Icon';
import type { Course } from '@/types';
import { getCourseVisual } from '@/utils/courseVisual';
import styles from './CourseCard.module.css';

interface CardAction {
  icon: Extract<IconName, 'plus' | 'minus' | 'check'>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface CourseCardProps {
  course: Course;
  action?: CardAction;
  /** When set, the card opens this handler instead of the course page. */
  onOpen?: () => void;
  children?: ReactNode;
}

const BAR_COUNT = 5;

function difficultyLevel(difficulty: string) {
  if (/лег|нач/i.test(difficulty)) return 2;
  if (/слож/i.test(difficulty)) return 5;
  return 3;
}

export default function CourseCard({
  course,
  action,
  onOpen,
  children,
}: CourseCardProps) {
  const visual = getCourseVisual(course.nameEN);
  const level = difficultyLevel(course.difficulty);
  const { from, to } = course.dailyDurationInMinutes;

  const picture = (
    <Image
      src={visual.image}
      alt=""
      fill
      loading="eager"
      sizes="(max-width: 767px) 100vw, 360px"
      style={{ objectFit: 'cover', objectPosition: visual.position }}
    />
  );

  return (
    <article className={styles.card}>
      <div className={styles.picture} style={{ background: visual.color }}>
        {onOpen ? (
          <button
            type="button"
            className={styles.open}
            aria-label={`${course.nameRU}: выбрать тренировку`}
            onClick={onOpen}
          >
            {picture}
          </button>
        ) : (
          <Link
            href={`/course/${course._id}`}
            className={styles.open}
            aria-label={`Курс «${course.nameRU}»`}
          >
            {picture}
          </Link>
        )}
        {action && (
          <button
            type="button"
            className={styles.action}
            aria-label={action.label}
            data-tooltip={action.label}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            <Icon name={action.icon} size={30} />
          </button>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{course.nameRU}</h3>
        <ul className={styles.chips}>
          <li className={styles.chip}>
            <Icon name="calendar" />
            {course.durationInDays} дней
          </li>
          <li className={styles.chip}>
            <Icon name="clock" />
            {from}-{to} мин/день
          </li>
          <li className={styles.chip} title={course.difficulty}>
            <span className={styles.bars} aria-hidden="true">
              {Array.from({ length: BAR_COUNT }, (_, index) => (
                <span
                  key={index}
                  className={index < level ? styles.barOn : styles.bar}
                  style={{ height: 4 + index * 3 }}
                />
              ))}
            </span>
            Сложность
          </li>
        </ul>
        {children}
      </div>
    </article>
  );
}

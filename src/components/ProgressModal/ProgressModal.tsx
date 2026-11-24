'use client';

import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/fitness';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Modal from '@/components/Modal/Modal';
import type { Exercise } from '@/types';
import { validateReps } from '@/utils/validation';
import styles from './ProgressModal.module.css';

interface ProgressModalProps {
  exercises: Exercise[];
  initial: number[];
  onSave: (values: number[]) => Promise<void>;
  onClose: () => void;
}

const SUCCESS_DELAY_MS = 1500;

function questionFor(exerciseName: string) {
  const name = exerciseName.replace(/\s*\(.*\)\s*$/, '').toLowerCase();
  return `Сколько раз вы сделали ${name}?`;
}

export default function ProgressModal({
  exercises,
  initial,
  onSave,
  onClose,
}: ProgressModalProps) {
  const [values, setValues] = useState(() =>
    exercises.map((_, index) => (initial[index] ? String(initial[index]) : '')),
  );
  const [invalidIndex, setInvalidIndex] = useState(-1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const firstInvalid = values.findIndex((value) => validateReps(value));
    setInvalidIndex(firstInvalid);
    if (firstInvalid !== -1) {
      setError(validateReps(values[firstInvalid]) ?? '');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(values.map(Number));
      setSaved(true);
      setTimeout(onClose, SUCCESS_DELAY_MS);
    } catch (caught) {
      setError(getErrorMessage(caught));
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <Modal label="Прогресс сохранён" onClose={onClose} width={426}>
        <div className={styles.success} role="status">
          <p className={styles.successText}>Ваш прогресс засчитан!</p>
          <Icon name="check" size={57} />
        </div>
      </Modal>
    );
  }

  return (
    <Modal label="Мой прогресс" onClose={onClose} width={426}>
      <form onSubmit={handleSubmit} noValidate>
        <h2 className={styles.title}>Мой прогресс</h2>
        <div className={styles.fields}>
          {exercises.map((exercise, index) => (
            <label key={exercise._id} className={styles.field}>
              {questionFor(exercise.name)}
              <input
                className={`${styles.input} ${index === invalidIndex ? styles.invalid : ''}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={9999}
                step={1}
                placeholder="0"
                value={values[index]}
                onChange={(event) =>
                  setValues((current) =>
                    current.map((value, i) =>
                      i === index ? event.target.value : value,
                    ),
                  )
                }
              />
            </label>
          ))}
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={saving}>
          Сохранить
        </Button>
      </form>
    </Modal>
  );
}

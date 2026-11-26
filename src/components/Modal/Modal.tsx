'use client';

import { useEffect, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export default function Modal({
  label,
  onClose,
  children,
  width = 360,
}: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={styles.window}
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}

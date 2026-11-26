'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { useAuth } from '@/context/AuthContext/AuthContext';
import styles from './UserMenu.module.css';

export default function UserMenu({ email }: { email: string }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = email.split('@')[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="user" size={42} />
        <span className={styles.name}>{name}</span>
        <Icon name="chevron" size={16} />
      </button>
      {open && (
        <div className={styles.popup}>
          <p className={styles.popupName}>{name}</p>
          <p className={styles.email}>{email}</p>
          <Button
            fullWidth
            onClick={() => {
              setOpen(false);
              router.push('/profile');
            }}
          >
            Мой профиль
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Выйти
          </Button>
        </div>
      )}
    </div>
  );
}

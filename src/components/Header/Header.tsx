'use client';

import Link from 'next/link';
import Button from '@/components/Button/Button';
import Logo from '@/components/Logo/Logo';
import UserMenu from '@/components/UserMenu/UserMenu';
import { useAuth } from '@/context/AuthContext/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { token, user, openAuth } = useAuth();

  return (
    <header className={`container ${styles.header}`}>
      <div>
        <Link href="/" aria-label="SkyFitnessPro — на главную">
          <Logo />
        </Link>
        <p className={styles.tagline}>Онлайн-тренировки для занятий дома</p>
      </div>
      {user && <UserMenu email={user.email} />}
      {token === null && (
        <Button className={styles.login} onClick={() => openAuth('login')}>
          Войти
        </Button>
      )}
    </header>
  );
}

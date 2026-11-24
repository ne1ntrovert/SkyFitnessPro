'use client';

import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/fitness';
import Button from '@/components/Button/Button';
import Logo from '@/components/Logo/Logo';
import Modal from '@/components/Modal/Modal';
import { useAuth, type AuthMode } from '@/context/AuthContext/AuthContext';
import { validateEmail, validatePassword } from '@/utils/validation';
import styles from './AuthModal.module.css';

type Field = 'email' | 'password' | 'repeat';

interface FormError {
  field: Field;
  message: string;
}

function validate(
  mode: AuthMode,
  email: string,
  password: string,
  repeat: string,
): FormError | null {
  const emailError = validateEmail(email);
  if (emailError) return { field: 'email', message: emailError };
  if (mode === 'login') {
    return password ? null : { field: 'password', message: 'Введите пароль' };
  }
  const passwordError = validatePassword(password);
  if (passwordError) return { field: 'password', message: passwordError };
  if (password !== repeat) {
    return { field: 'repeat', message: 'Пароли не совпадают' };
  }
  return null;
}

function AuthForm({ mode }: { mode: AuthMode }) {
  const { login, register, openAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validate(mode, email, password, repeat);
    setError(invalid);
    if (invalid) return;
    setSubmitting(true);
    try {
      await (isLogin ? login : register)(email.trim(), password);
    } catch (caught) {
      const message = getErrorMessage(caught);
      setError({
        field: /парол/i.test(message) ? 'password' : 'email',
        message,
      });
      setSubmitting(false);
    }
  };

  const inputClass = (field: Field) =>
    `${styles.input} ${error?.field === field ? styles.invalid : ''}`;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.fields}>
        <input
          className={inputClass('email')}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Эл. почта"
          aria-label="Эл. почта"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className={inputClass('password')}
          type="password"
          name="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          placeholder="Пароль"
          aria-label="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {!isLogin && (
          <input
            className={inputClass('repeat')}
            type="password"
            name="repeat"
            autoComplete="new-password"
            placeholder="Повторите пароль"
            aria-label="Повторите пароль"
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
          />
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error.message}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        <Button type="submit" fullWidth disabled={submitting}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => openAuth(isLogin ? 'register' : 'login')}
        >
          {isLogin ? 'Зарегистрироваться' : 'Войти'}
        </Button>
      </div>
    </form>
  );
}

export default function AuthModal() {
  const { authMode, closeAuth } = useAuth();
  if (!authMode) return null;
  return (
    <Modal
      label={authMode === 'login' ? 'Вход' : 'Регистрация'}
      onClose={closeAuth}
    >
      <AuthForm key={authMode} mode={authMode} />
    </Modal>
  );
}

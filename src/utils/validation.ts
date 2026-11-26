const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  return EMAIL_RE.test(email.trim()) ? null : 'Введите корректный Email';
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return 'Пароль должен содержать не менее 6 символов';
  }
  if ((password.match(/[^\p{L}\p{N}\s]/gu) ?? []).length < 2) {
    return 'Пароль должен содержать не менее 2 спецсимволов';
  }
  if (!/\p{Lu}/u.test(password)) {
    return 'Пароль должен содержать как минимум одну заглавную букву';
  }
  return null;
}

export function validateReps(value: string): string | null {
  return /^\d{1,4}$/.test(value.trim())
    ? null
    : 'Введите целое число от 0 до 9999';
}

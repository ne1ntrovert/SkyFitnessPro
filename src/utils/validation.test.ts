import { validateEmail, validatePassword, validateReps } from './validation';

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });
  it.each(['', 'user', 'user@', 'user@example', 'us er@example.com'])(
    'rejects %p',
    (value) => {
      expect(validateEmail(value)).toBe('Введите корректный Email');
    },
  );
});

describe('validatePassword', () => {
  it('accepts a password matching all API rules', () => {
    expect(validatePassword('Secure@!')).toBeNull();
  });
  it('requires 6 characters', () => {
    expect(validatePassword('A@!b')).toMatch(/не менее 6/);
  });
  it('requires 2 special characters', () => {
    expect(validatePassword('Secure1@')).toMatch(/2 спецсимволов/);
  });
  it('requires an uppercase letter', () => {
    expect(validatePassword('secure@!')).toMatch(/заглавную/);
  });
});

describe('validateReps', () => {
  it.each(['0', '15', ' 20 '])('accepts %p', (value) => {
    expect(validateReps(value)).toBeNull();
  });
  it.each(['', '-1', '1.5', 'abc', '10000'])('rejects %p', (value) => {
    expect(validateReps(value)).not.toBeNull();
  });
});

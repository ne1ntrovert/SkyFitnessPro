import styles from './Logo.module.css';

export default function Logo() {
  return (
    <span className={styles.logo}>
      <svg width="29" height="23" viewBox="0 0 29 23" aria-hidden="true">
        <path d="M2 2l14 9.5L2 21z" fill="#00c1ff" />
        <path d="M12 2l15 9.5L12 21z" fill="#bcec30" />
      </svg>
      SkyFitnessPro
    </span>
  );
}

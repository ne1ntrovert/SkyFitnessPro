import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  label: string;
  percent: number;
}

export default function ProgressBar({ label, percent }: ProgressBarProps) {
  return (
    <div className={styles.root}>
      <p className={styles.label}>
        {label} {percent}%
      </p>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

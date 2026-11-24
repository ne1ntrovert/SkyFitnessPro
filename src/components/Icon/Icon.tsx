import type { ReactNode } from 'react';

export type IconName =
  | 'plus'
  | 'minus'
  | 'check'
  | 'calendar'
  | 'clock'
  | 'star'
  | 'chevron'
  | 'user';

const ICONS: Record<IconName, ReactNode> = {
  plus: (
    <>
      <circle cx="12" cy="12" r="11" fill="#fff" />
      <path
        d="M12 7v10M7 12h10"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  minus: (
    <>
      <circle cx="12" cy="12" r="11" fill="#fff" />
      <path d="M7 12h10" stroke="#000" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="11" fill="#bcec30" />
      <path
        d="M7 12.5l3.5 3.5L17 9"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  calendar: (
    <path
      d="M7 3v3m10-3v3M4 10h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      stroke="#202020"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" fill="#202020" />
      <path
        d="M12 7v5l3 2"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  star: (
    <path
      d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"
      fill="#000"
    />
  ),
  chevron: (
    <path
      d="M6 9l6 6 6-6"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  user: (
    <>
      <circle cx="12" cy="12" r="12" fill="#d9d9d9" />
      <circle cx="12" cy="9.5" r="4" fill="#fff" />
      <path
        d="M4.5 20.5a7.5 7.5 0 0115 0A11.9 11.9 0 0112 24a11.9 11.9 0 01-7.5-3.5z"
        fill="#fff"
      />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

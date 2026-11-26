interface CourseVisual {
  image: string;
  color: string;
  position: string;
}

const VISUALS: [RegExp, CourseVisual][] = [
  [/yoga/i, { image: '/img/yoga.jpg', color: '#FFC700', position: 'center' }],
  [
    /stretch/i,
    { image: '/img/stretching.jpg', color: '#2491D2', position: 'center top' },
  ],
  [
    /step/i,
    { image: '/img/step.jpg', color: '#FF7E65', position: 'center bottom' },
  ],
  [
    /body/i,
    { image: '/img/bodyflex.jpg', color: '#7D458C', position: 'center' },
  ],
];

const FALLBACK: CourseVisual = {
  image: '/img/fitness.jpg',
  color: '#F7A012',
  position: 'center',
};

export function getCourseVisual(nameEN: string): CourseVisual {
  return VISUALS.find(([pattern]) => pattern.test(nameEN))?.[1] ?? FALLBACK;
}

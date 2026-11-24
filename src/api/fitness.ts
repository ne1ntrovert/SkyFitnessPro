import type { Course, CourseProgress, User, Workout } from '@/types';

const BASE_URL = 'https://wedev-api.sky.pro/api/fitness';
const FALLBACK_ERROR = 'Что-то пошло не так. Попробуйте позже';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string;
  body?: unknown;
}

interface MessageResponse {
  message: string;
}

function hasMessage(data: unknown): data is MessageResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : FALLBACK_ERROR;
}

async function request<T>(
  path: string,
  { method = 'GET', token, body }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    // The API rejects a JSON Content-Type header, so the body goes as plain text.
    response = await fetch(BASE_URL + path, {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Нет соединения с сервером. Попробуйте позже', 0);
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      hasMessage(data) ? data.message : FALLBACK_ERROR,
      response.status,
    );
  }
  return data as T;
}

const id = encodeURIComponent;

export const registerUser = (email: string, password: string) =>
  request<MessageResponse>('/auth/register', {
    method: 'POST',
    body: { email, password },
  });

export const loginUser = (email: string, password: string) =>
  request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

export const getUser = (token: string) => request<User>('/users/me', { token });

export const getCourses = () => request<Course[]>('/courses');

export const getCourse = (courseId: string) =>
  request<Course>(`/courses/${id(courseId)}`);

export const getCourseWorkouts = (courseId: string, token: string) =>
  request<Workout[]>(`/courses/${id(courseId)}/workouts`, { token });

export const getWorkout = (workoutId: string, token: string) =>
  request<Workout>(`/workouts/${id(workoutId)}`, { token });

export const addCourse = (courseId: string, token: string) =>
  request<MessageResponse>('/users/me/courses', {
    method: 'POST',
    token,
    body: { courseId },
  });

export const removeCourse = (courseId: string, token: string) =>
  request<MessageResponse>(`/users/me/courses/${id(courseId)}`, {
    method: 'DELETE',
    token,
  });

export const resetCourseProgress = (courseId: string, token: string) =>
  request<MessageResponse>(`/courses/${id(courseId)}/reset`, {
    method: 'PATCH',
    token,
  });

export const getCourseProgress = (courseId: string, token: string) =>
  request<CourseProgress>(`/users/me/progress?courseId=${id(courseId)}`, {
    token,
  });

export const saveWorkoutProgress = (
  courseId: string,
  workoutId: string,
  progressData: number[],
  token: string,
) =>
  request<MessageResponse>(
    `/courses/${id(courseId)}/workouts/${id(workoutId)}`,
    { method: 'PATCH', token, body: { progressData } },
  );

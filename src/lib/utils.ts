import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';

dayjs.locale('en');

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(iso?: string | null, fallback = ''): string {
  if (!iso) return fallback;
  const date = dayjs(iso);
  if (!date.isValid()) return fallback;
  return date.format('YYYY.MM.DD HH:mm');
}

export function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL ??
    'http://localhost:8000';
  return base.replace(/\/?$/, '');
}

export function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

/**
 * Application constants
 */

export const APP_NAME = 'Metahodos Agile App';
export const APP_VERSION = '0.1.0';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

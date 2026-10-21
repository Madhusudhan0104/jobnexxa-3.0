import {
  EmployerProfile,
  HireRequest,
  JobApplication,
  JobPosting,
  NotificationItem,
  Review,
  SkillCategory,
  WorkerProfile,
} from '../types.ts';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Driver',
  'Domestic Help',
  'Construction Worker',
  'Mason',
  'Appliance Repair',
];

export const CITIES_AND_AREAS = {
  Bangalore: [
    'Koramangala',
    'Indiranagar',
    'Whitefield',
    'HSR Layout',
    'Jayanagar',
    'BTM Layout',
  ],
};

// All fake mock profiles removed. Empty array defaults for real authenticated users only.
export const INITIAL_WORKERS: WorkerProfile[] = [];

export const INITIAL_EMPLOYERS: EmployerProfile[] = [];

export const INITIAL_JOBS: JobPosting[] = [];

export const INITIAL_HIRE_REQUESTS: HireRequest[] = [];

export const INITIAL_APPLICATIONS: JobApplication[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

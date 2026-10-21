export type UserRole = 'worker' | 'employer';

export type SkillCategory =
  | 'Plumber'
  | 'Electrician'
  | 'Carpenter'
  | 'Painter'
  | 'Driver'
  | 'Domestic Help'
  | 'Construction Worker'
  | 'Mason'
  | 'Appliance Repair';

export type JobType = 'Full-Time' | 'Part-Time' | 'Daily Wage' | 'Contract';

export type WorkerAvailability = 'available' | 'unavailable' | 'busy' | 'hired';

export type JobStatus = 'Open' | 'Filled' | 'Closed';

export type HireRequestStatus = 'Pending' | 'Accepted' | 'Declined' | 'Completed';

export type ApplicationStatus = 'Pending' | 'Accepted' | 'Declined';

export type WorkerTab = 'home' | 'jobs' | 'requests' | 'alerts' | 'profile';
export type EmployerTab = 'home' | 'availability' | 'workers' | 'my-jobs' | 'profile';

export interface WorkExperience {
  id: string;
  title: string;
  companyOrClient: string;
  duration: string;
  description: string;
}

export interface Review {
  id: string;
  targetId: string; // worker or employer ID
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: UserRole;
  rating: number; // 1 to 5
  comment: string;
  jobTitle: string;
  date: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  username?: string;
  phone: string;
  email: string;
  avatar: string;
  primarySkill: SkillCategory;
  secondarySkills: string[];
  experienceYears: number;
  preferredJobTypes: JobType[];
  availabilityStatus: WorkerAvailability;
  city: string;
  area: string;
  expectedWage: number;
  wageType: 'day' | 'hour';
  bio: string;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  pastExperience: WorkExperience[];
}

export interface EmployerProfile {
  id: string;
  name: string;
  username?: string;
  contactPerson: string;
  phone: string;
  email: string;
  logo: string;
  businessType: string;
  city: string;
  area: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface JobPosting {
  id: string;
  employerId: string;
  employerName: string;
  employerLogo: string;
  employerRating: number;
  title: string;
  skillCategory: SkillCategory;
  description: string;
  responsibilities: string[];
  city: string;
  area: string;
  duration: string;
  payRate: number;
  payType: 'Hourly' | 'Daily' | 'Fixed';
  jobType: JobType;
  workersNeeded: number;
  workersHired: number;
  deadline: string;
  status: JobStatus;
  createdAt: string;
  matchScore?: number;
  aiMatchReason?: string;
}

export interface HireRequest {
  id: string;
  jobId?: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  employerLogo: string;
  employerPhone: string;
  workerId: string;
  workerName: string;
  workerSkill: SkillCategory;
  workerAvatar: string;
  proposedWage: number;
  payType: 'Hourly' | 'Daily' | 'Fixed';
  startDate: string;
  duration: string;
  location: string;
  message: string;
  status: HireRequestStatus;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerSkill: SkillCategory;
  workerExperienceYears: number;
  workerRating: number;
  expectedWage: number;
  status: ApplicationStatus;
  appliedAt: string;
  matchScore: number;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole;
  recipientId: string;
  title: string;
  message: string;
  type: 'hire_request' | 'job_match' | 'application' | 'system' | 'completion';
  read: boolean;
  timestamp: string;
  actionTab?: WorkerTab | EmployerTab;
}

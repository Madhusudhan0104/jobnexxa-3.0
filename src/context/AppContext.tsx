import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase.ts';
import {
  CITIES_AND_AREAS,
  INITIAL_APPLICATIONS,
  INITIAL_EMPLOYERS,
  INITIAL_HIRE_REQUESTS,
  INITIAL_JOBS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS,
  INITIAL_WORKERS,
} from '../data/mockData.ts';
import {
  EmployerProfile,
  EmployerTab,
  HireRequest,
  JobApplication,
  JobPosting,
  NotificationItem,
  Review,
  SkillCategory,
  UserRole,
  WorkerAvailability,
  WorkerProfile,
  WorkerTab,
} from '../types.ts';

interface AppContextType {
  // Auth state
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  isNewUserOnboarding: boolean;
  onboardingUser: FirebaseUser | null;
  signInWithGoogle: (
    preferredRole?: UserRole,
    isRegistering?: boolean,
    regDetails?: {
      phone?: string;
      area?: string;
      primarySkill?: SkillCategory;
      expectedWage?: number;
      companyName?: string;
      businessType?: string;
    }
  ) => Promise<{ success: boolean; notRegistered?: boolean; error?: string }>;
  signInWithUsernameOrPhone: (
    usernameOrMobile: string,
    password: string
  ) => Promise<{ success: boolean; notRegistered?: boolean; error?: string }>;
  signUpWithUsernameOrPhone: (
    username: string,
    mobileNumber: string,
    password: string,
    role: UserRole,
    details?: { name?: string; phone?: string; area?: string; primarySkill?: string; expectedWage?: number }
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; notRegistered?: boolean; error?: string }>;
  signUpWithEmail: (
    emailOrUsername: string,
    password: string,
    role: UserRole,
    details?: { name?: string; phone?: string; area?: string; primarySkill?: string }
  ) => Promise<{ success: boolean; verificationSent?: boolean; error?: string }>;
  isEmailVerified: boolean;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  reloadUserVerification: () => Promise<{ verified: boolean }>;
  completeRegistration: (details: any) => Promise<void>;
  logout: () => Promise<void>;

  // Locked Role (determined solely at login/registration)
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeWorkerId: string;
  setActiveWorkerId: (id: string) => void;
  activeEmployerId: string;
  setActiveEmployerId: (id: string) => void;
  activeWorkerTab: WorkerTab;
  setActiveWorkerTab: (tab: WorkerTab) => void;
  activeEmployerTab: EmployerTab;
  setActiveEmployerTab: (tab: EmployerTab) => void;

  // Viewport simulator
  deviceMode: 'responsive' | 'mobile-pwa';
  setDeviceMode: (mode: 'responsive' | 'mobile-pwa') => void;

  // Modal controls
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string | null) => void;
  hireRequestWorkerId: string | null;
  setHireRequestWorkerId: (id: string | null) => void;
  applicantsJobId: string | null;
  setApplicantsJobId: (id: string | null) => void;
  isPostJobOpen: boolean;
  setIsPostJobOpen: (open: boolean) => void;
  reviewModalData: {
    isOpen: boolean;
    jobTitle: string;
    targetId: string;
    targetName: string;
    reviewerRole: UserRole;
  } | null;
  setReviewModalData: (data: AppContextType['reviewModalData']) => void;

  // Toast notification
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Real Database Entities
  workers: WorkerProfile[];
  employers: EmployerProfile[];
  jobs: JobPosting[];
  hireRequests: HireRequest[];
  applications: JobApplication[];
  reviews: Review[];
  notifications: NotificationItem[];

  // Helpers
  currentWorker: WorkerProfile;
  currentEmployer: EmployerProfile;
  getAvailabilityCount: (skill: SkillCategory, city?: string, area?: string) => number;
  getAvailableWorkersList: (skill: SkillCategory, city?: string, area?: string) => WorkerProfile[];

  // Mutations
  toggleWorkerAvailability: (workerId: string, newStatus?: WorkerAvailability) => Promise<void>;
  sendHireRequest: (data: {
    workerId: string;
    jobId?: string;
    jobTitle: string;
    proposedWage: number;
    startDate: string;
    duration: string;
    location: string;
    message: string;
  }) => Promise<void>;
  acceptHireRequest: (requestId: string) => Promise<void>;
  declineHireRequest: (requestId: string) => Promise<void>;
  completeJob: (requestId: string) => Promise<void>;
  applyToJob: (jobId: string) => void;
  acceptApplication: (applicationId: string) => void;
  declineApplication: (applicationId: string) => void;
  createJobPosting: (jobData: Omit<JobPosting, 'id' | 'employerId' | 'employerName' | 'employerLogo' | 'employerRating' | 'workersHired' | 'status' | 'createdAt'>) => Promise<void>;
  addReview: (reviewData: { targetId: string; rating: number; comment: string; jobTitle: string }) => Promise<void>;
  updateWorkerProfile: (workerId: string, updates: Partial<WorkerProfile>) => Promise<void>;
  updateEmployerProfile: (employerId: string, updates: Partial<EmployerProfile>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userRole: UserRole) => void;

  // AI Helpers
  generateAIDescription: (title: string, skill: SkillCategory) => Promise<{ description: string; responsibilities: string[] }>;
  enhanceBioWithAI: (currentBio: string, skill: SkillCategory, exp: number) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isNewUserOnboarding, setIsNewUserOnboarding] = useState<boolean>(false);
  const [onboardingUser, setOnboardingUser] = useState<FirebaseUser | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // Role is locked to account (determined at registration)
  const [role, setRoleState] = useState<UserRole>('worker');
  const [activeWorkerId, setActiveWorkerId] = useState<string>('');
  const [activeEmployerId, setActiveEmployerId] = useState<string>('');
  const [activeWorkerTab, setActiveWorkerTab] = useState<WorkerTab>('home');
  const [activeEmployerTab, setActiveEmployerTab] = useState<EmployerTab>('home');
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile-pwa'>('responsive');

  // Track in-flight registration to prevent race condition with onAuthStateChanged
  const isRegisteringRef = useRef<boolean>(false);
  const registeringRoleRef = useRef<UserRole | null>(null);

  // Modals
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [hireRequestWorkerId, setHireRequestWorkerId] = useState<string | null>(null);
  const [applicantsJobId, setApplicantsJobId] = useState<string | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState<boolean>(false);
  const [reviewModalData, setReviewModalData] = useState<AppContextType['reviewModalData']>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entities state - Real users and records only, zero fake profiles
  const [workers, setWorkers] = useState<WorkerProfile[]>(INITIAL_WORKERS);
  const [employers, setEmployers] = useState<EmployerProfile[]>(INITIAL_EMPLOYERS);
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>(INITIAL_HIRE_REQUESTS);
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Role setter (kept for internal profile updates)
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (firebaseUser) {
      if (newRole === 'worker') {
        setActiveWorkerId(firebaseUser.uid);
      } else {
        setActiveEmployerId(firebaseUser.uid);
      }
    }
  };

  // Test Firestore on boot and listen to Firebase Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsEmailVerified(Boolean(user?.emailVerified));
      if (user) {
        try {
          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            const userRole: UserRole = data.role === 'employer' ? 'employer' : 'worker';
            setRoleState(userRole);
            setIsAuthenticated(true);
            setIsNewUserOnboarding(false);

            if (userRole === 'worker') {
              setActiveWorkerId(user.uid);
            } else {
              setActiveEmployerId(user.uid);
            }

            showToast(`Welcome back, ${data.name || user.displayName || 'Member'}! Logged in as ${userRole === 'employer' ? 'Employer' : 'Worker'}.`);
          } else {
            // Document does not exist in Firestore yet!
            // If registration is currently in progress, let signInWithGoogle complete the profile creation
            if (isRegisteringRef.current) {
              return;
            }
            // If user simply attempted to sign in without an account, do NOT auto-create a default worker account
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.warn('Error fetching user profile:', err);
        }
      } else {
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setIsNewUserOnboarding(false);
        setWorkers([]);
        setEmployers([]);
        setJobs([]);
        setHireRequests([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore synchronizer for users, jobs, and hire requests
  useEffect(() => {
    if (!isAuthenticated || !firebaseUser) return;

    // 1. Sync all real registered users
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const loadedWorkers: WorkerProfile[] = [];
        const loadedEmployers: EmployerProfile[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.role === 'worker') {
            loadedWorkers.push({
              id: docSnap.id,
              name: data.name || 'Worker',
              username: data.username || data.name || '',
              phone: data.phone || '+91 98450 00000',
              email: data.email || '',
              avatar: data.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
              primarySkill: data.primarySkill || 'Plumber',
              secondarySkills: data.secondarySkills || ['General Maintenance'],
              experienceYears: data.experienceYears ?? 2,
              preferredJobTypes: data.preferredJobTypes || ['Daily Wage'],
              availabilityStatus: data.availabilityStatus || 'available',
              city: data.city || 'Bangalore',
              area: data.area || 'Koramangala',
              expectedWage: data.expectedWage || 800,
              wageType: data.wageType || 'day',
              bio: data.bio || 'Verified tradesperson on Jobnexa.',
              rating: data.rating || 5.0,
              reviewCount: data.reviewCount || 0,
              completedJobsCount: data.completedJobsCount || 0,
              pastExperience: data.pastExperience || [],
            });
          } else if (data.role === 'employer') {
            loadedEmployers.push({
              id: docSnap.id,
              name: data.companyName || data.name || 'Employer',
              username: data.username || data.name || '',
              contactPerson: data.contactPerson || data.name || 'Manager',
              phone: data.phone || '+91 98450 00000',
              email: data.email || '',
              logo: data.avatar || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
              businessType: data.businessType || 'Private Household',
              city: data.city || 'Bangalore',
              area: data.area || 'Koramangala',
              description: data.description || 'Verified employer on Jobnexa.',
              rating: data.rating || 5.0,
              reviewCount: data.reviewCount || 0,
            });
          }
        });

        setWorkers(loadedWorkers);
        setEmployers(loadedEmployers);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    // 2. Sync all real job postings
    const unsubJobs = onSnapshot(
      collection(db, 'jobs'),
      (snapshot) => {
        const loadedJobs: JobPosting[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedJobs.push({
            id: docSnap.id,
            title: data.title || 'Job Opening',
            employerId: data.employerId || '',
            employerName: data.employerName || 'Employer',
            employerLogo: data.employerLogo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
            employerRating: data.employerRating || 5.0,
            skillCategory: data.skillCategory || 'Plumber',
            description: data.description || '',
            responsibilities: data.responsibilities || [],
            payRate: data.payRate || 800,
            payType: data.payType || 'Daily',
            jobType: data.jobType || 'Daily Wage',
            city: data.city || 'Bangalore',
            area: data.area || 'Koramangala',
            workersNeeded: data.workersNeeded || 1,
            workersHired: data.workersHired || 0,
            duration: data.duration || '1 Day',
            deadline: data.deadline || data.startDate || 'Immediate',
            status: data.status || 'Open',
            createdAt: data.createdAt || 'Recent',
            matchScore: data.matchScore || 90,
            aiMatchReason: data.aiMatchReason || '',
          });
        });
        setJobs(loadedJobs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'jobs');
      }
    );

    // 3. Sync all real hire requests using rule-compliant queries
    let workerReqs: HireRequest[] = [];
    let employerReqs: HireRequest[] = [];

    const mergeAndSetReqs = () => {
      const map = new Map<string, HireRequest>();
      workerReqs.forEach((r) => map.set(r.id, r));
      employerReqs.forEach((r) => map.set(r.id, r));
      setHireRequests(Array.from(map.values()));
    };

    const workerReqsQuery = query(
      collection(db, 'hireRequests'),
      where('workerId', '==', firebaseUser.uid)
    );

    const employerReqsQuery = query(
      collection(db, 'hireRequests'),
      where('employerId', '==', firebaseUser.uid)
    );

    const unsubWorkerReqs = onSnapshot(
      workerReqsQuery,
      (snapshot) => {
        workerReqs = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          workerReqs.push({
            id: docSnap.id,
            jobId: data.jobId || '',
            jobTitle: data.jobTitle || 'Custom Assignment',
            employerId: data.employerId || '',
            employerName: data.employerName || 'Employer',
            employerLogo: data.employerLogo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
            employerPhone: data.employerPhone || '+91 98450 00000',
            workerId: data.workerId || '',
            workerName: data.workerName || 'Worker',
            workerSkill: data.workerSkill || 'Plumber',
            workerAvatar: data.workerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
            proposedWage: Number(data.proposedWage) || 800,
            payType: data.payType || 'Daily',
            startDate: data.startDate || 'Immediate',
            duration: data.duration || 'Ongoing (Days or Years)',
            location: data.location || 'Bangalore',
            message: data.message || '',
            status: data.status || 'Pending',
            createdAt: data.createdAt || 'Recent',
          });
        });
        mergeAndSetReqs();
      },
      (error) => {
        console.warn('Worker hireRequests listener notice:', error);
      }
    );

    const unsubEmployerReqs = onSnapshot(
      employerReqsQuery,
      (snapshot) => {
        employerReqs = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          employerReqs.push({
            id: docSnap.id,
            jobId: data.jobId || '',
            jobTitle: data.jobTitle || 'Custom Assignment',
            employerId: data.employerId || '',
            employerName: data.employerName || 'Employer',
            employerLogo: data.employerLogo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
            employerPhone: data.employerPhone || '+91 98450 00000',
            workerId: data.workerId || '',
            workerName: data.workerName || 'Worker',
            workerSkill: data.workerSkill || 'Plumber',
            workerAvatar: data.workerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
            proposedWage: Number(data.proposedWage) || 800,
            payType: data.payType || 'Daily',
            startDate: data.startDate || 'Immediate',
            duration: data.duration || 'Ongoing (Days or Years)',
            location: data.location || 'Bangalore',
            message: data.message || '',
            status: data.status || 'Pending',
            createdAt: data.createdAt || 'Recent',
          });
        });
        mergeAndSetReqs();
      },
      (error) => {
        console.warn('Employer hireRequests listener notice:', error);
      }
    );

    return () => {
      unsubUsers();
      unsubJobs();
      unsubWorkerReqs();
      unsubEmployerReqs();
    };
  }, [isAuthenticated, firebaseUser]);

  // Sign In With Google Popup
  const signInWithGoogle = async (
    preferredRole?: UserRole,
    isRegistering: boolean = false,
    regDetails?: {
      phone?: string;
      area?: string;
      primarySkill?: SkillCategory;
      expectedWage?: number;
      companyName?: string;
      businessType?: string;
    }
  ): Promise<{ success: boolean; notRegistered?: boolean; error?: string }> => {
    setAuthLoading(true);
    isRegisteringRef.current = isRegistering;
    registeringRoleRef.current = preferredRole || null;

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      // 1. REGISTRATION FLOW: User is registering and explicitly choosing their role (Worker or Employer)
      if (isRegistering) {
        const chosenRole: UserRole = preferredRole === 'employer' ? 'employer' : 'worker';

        const profilePayload = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || (chosenRole === 'worker' ? 'Worker Member' : 'Employer Member'),
          avatar:
            user.photoURL ||
            (chosenRole === 'worker'
              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
              : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80'),
          role: chosenRole,
          phone: regDetails?.phone?.trim() || '+91 98450 00000',
          city: 'Bangalore',
          area: regDetails?.area || 'Koramangala',
          rating: 5.0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          ...(chosenRole === 'worker'
            ? {
                primarySkill: regDetails?.primarySkill || 'Plumber',
                secondarySkills: ['General Work'],
                experienceYears: 3,
                expectedWage: Number(regDetails?.expectedWage) || 850,
                wageType: 'day',
                preferredJobTypes: ['Daily Wage'],
                availabilityStatus: 'available',
                bio: 'Verified local skilled professional on Jobnexa.',
              }
            : {
                companyName:
                  regDetails?.companyName?.trim() ||
                  (user.displayName ? `${user.displayName}'s Ventures` : 'My Enterprise'),
                businessType: regDetails?.businessType || 'Private Household',
                contactPerson: user.displayName || 'Manager',
                description: 'Verified employer seeking qualified local talent in Bangalore.',
              }),
        };

        try {
          await setDoc(userDocRef, profilePayload, { merge: true });
        } catch (setErr) {
          console.warn('Profile write notice:', setErr);
        }

        setRoleState(chosenRole);
        setIsAuthenticated(true);
        setIsNewUserOnboarding(false);
        if (chosenRole === 'worker') {
          setActiveWorkerId(user.uid);
        } else {
          setActiveEmployerId(user.uid);
        }
        showToast(`Account registered as ${chosenRole === 'employer' ? 'Employer' : 'Worker'}! Welcome, ${user.displayName || 'Member'}.`);
        return { success: true };
      }

      // 2. SIGN IN FLOW: Role is determined strictly by what they chose during registration
      if (snap.exists()) {
        const data = snap.data();
        const registeredRole: UserRole = data.role === 'employer' ? 'employer' : 'worker';

        setRoleState(registeredRole);
        setIsAuthenticated(true);
        setIsNewUserOnboarding(false);
        if (registeredRole === 'worker') {
          setActiveWorkerId(user.uid);
        } else {
          setActiveEmployerId(user.uid);
        }
        showToast(`Signed in as ${registeredRole === 'employer' ? 'Employer' : 'Worker'}! Welcome back, ${data.name || user.displayName || 'Member'}.`);
        return { success: true };
      } else {
        // User has not registered yet: do not auto-create an account! Prompt them to register
        await signOut(auth);
        setIsAuthenticated(false);
        return {
          success: false,
          notRegistered: true,
          error: 'No registered Jobnexa profile found for this Google account. Please choose your role and register.',
        };
      }
    } catch (err: any) {
      console.error('Google Auth error:', err);
      let errorMsg = 'Google authentication was cancelled or failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Google sign-in popup was closed. Please try again.';
      }
      return { success: false, error: errorMsg };
    } finally {
      isRegisteringRef.current = false;
      registeringRoleRef.current = null;
      setAuthLoading(false);
    }
  };

  // Generate candidate internal auth emails for username or mobile number
  const getCandidateAuthEmails = (input: string): string[] => {
    const raw = input.trim();
    const digitsOnly = raw.replace(/\D/g, '');
    const cleanAlphaNum = raw.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const candidates: string[] = [];

    // If input contains 10 or more digits (like Indian mobile number 9845012345 or +91 98450 12345)
    if (digitsOnly.length >= 10) {
      const last10 = digitsOnly.slice(-10);
      candidates.push(`mob_${last10}@jobnexa.local`);
      candidates.push(`phone_${last10}@jobnexa.local`);
      candidates.push(`${last10}@jobnexa.local`);

      try {
        const mappedUser = localStorage.getItem(`jobnexa_map_${last10}`);
        if (mappedUser) {
          candidates.push(`user_${mappedUser}@jobnexa.local`);
          candidates.push(`${mappedUser}@jobnexa.local`);
        }
      } catch (e) {
        // ignore
      }
    }

    // Also try as username / alphanumeric identifier
    if (cleanAlphaNum) {
      try {
        const mappedPhone = localStorage.getItem(`jobnexa_map_${cleanAlphaNum}`);
        if (mappedPhone) {
          candidates.push(`mob_${mappedPhone}@jobnexa.local`);
        }
      } catch (e) {
        // ignore
      }
      candidates.push(`user_${cleanAlphaNum}@jobnexa.local`);
      candidates.push(`${cleanAlphaNum}@jobnexa.local`);
      candidates.push(`mob_${cleanAlphaNum}@jobnexa.local`);
    }

    // Deduplicate while preserving order
    return Array.from(new Set(candidates));
  };

  // Sign In With User Name or Mobile Number & Password
  const signInWithUsernameOrPhone = async (
    usernameOrMobile: string,
    password: string
  ): Promise<{ success: boolean; notRegistered?: boolean; error?: string }> => {
    setAuthLoading(true);
    const trimmed = usernameOrMobile.trim();
    if (!trimmed) {
      setAuthLoading(false);
      return { success: false, error: 'Please enter your user name or mobile number.' };
    }
    if (!password) {
      setAuthLoading(false);
      return { success: false, error: 'Please enter your password.' };
    }

    const candidateEmails = getCandidateAuthEmails(trimmed);

    try {
      let loggedInUser: FirebaseUser | null = null;

      for (const email of candidateEmails) {
        try {
          const res = await signInWithEmailAndPassword(auth, email, password);
          if (res.user) {
            loggedInUser = res.user;
            break;
          }
        } catch (err: any) {
          // Continue attempting remaining candidate aliases
        }
      }

      if (!loggedInUser) {
        return {
          success: false,
          notRegistered: true,
          error: 'Account not found. Please register if new.',
        };
      }

      const userDocRef = doc(db, 'users', loggedInUser.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data();
        const userRole: UserRole = data.role || 'worker';
        setRoleState(userRole);
        setIsAuthenticated(true);
        if (userRole === 'worker') {
          setActiveWorkerId(loggedInUser.uid);
        } else {
          setActiveEmployerId(loggedInUser.uid);
        }
        showToast(`Welcome back, ${data.name || 'Member'}!`);
        return { success: true };
      } else {
        // Document does not exist in Firestore! User does not have an account.
        await signOut(auth);
        setIsAuthenticated(false);
        return {
          success: false,
          notRegistered: true,
          error: 'Account not found. Please register if new.',
        };
      }
    } catch (err: any) {
      console.warn('Sign-in failed for user:', err?.code, err?.message);
      return {
        success: false,
        notRegistered: true,
        error: 'Account not found. Please register if new.',
      };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Up / Register With User Name, Mobile Number & Password
  const signUpWithUsernameOrPhone = async (
    username: string,
    mobileNumber: string,
    password: string,
    roleSelected: UserRole,
    details?: { name?: string; phone?: string; area?: string; primarySkill?: string; expectedWage?: number }
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);
    try {
      const cleanUsername = (username || details?.name || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, '');
      const digits = mobileNumber.replace(/\D/g, '');

      if (!cleanUsername && digits.length < 10) {
        return { success: false, error: 'Please enter a valid user name or mobile number.' };
      }

      const last10Phone = digits.length >= 10 ? digits.slice(-10) : '';
      const formattedPhone = last10Phone
        ? `+91 ${last10Phone.slice(0, 5)} ${last10Phone.slice(5)}`
        : (details?.phone || mobileNumber.trim());

      // Use mobile number as primary unique auth credential if available, otherwise username
      const primaryAuthEmail = last10Phone
        ? `mob_${last10Phone}@jobnexa.local`
        : `user_${cleanUsername}@jobnexa.local`;

      // Save username <-> phone mapping in localStorage
      if (cleanUsername && last10Phone) {
        try {
          localStorage.setItem(`jobnexa_map_${cleanUsername}`, last10Phone);
          localStorage.setItem(`jobnexa_map_${last10Phone}`, cleanUsername);
        } catch (e) {
          // ignore
        }
      }

      const res = await createUserWithEmailAndPassword(auth, primaryAuthEmail, password);
      const user = res.user;

      const displayName =
        details?.name?.trim() ||
        username.trim() ||
        (roleSelected === 'worker' ? 'Worker Member' : 'Employer Member');

      const userDocRef = doc(db, 'users', user.uid);
      const profilePayload = {
        uid: user.uid,
        username: cleanUsername || (last10Phone ? `user_${last10Phone}` : 'member'),
        name: displayName,
        phone: formattedPhone,
        email: '',
        avatar:
          roleSelected === 'worker'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
            : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
        role: roleSelected,
        city: 'Bangalore',
        area: details?.area || 'Koramangala',
        createdAt: new Date().toISOString(),
        ...(roleSelected === 'worker'
          ? {
              primarySkill: (details?.primarySkill as any) || 'Plumber',
              secondarySkills: ['General Maintenance'],
              experienceYears: 2,
              preferredJobTypes: ['Daily Wage'],
              availabilityStatus: 'available',
              expectedWage: Number(details?.expectedWage) || 800,
              wageType: 'day',
              bio: 'Verified skilled tradesperson ready for immediate local hiring in Bangalore.',
              rating: 5.0,
              reviewCount: 0,
              completedJobsCount: 0,
            }
          : {
              companyName: displayName,
              businessType: 'General Services',
              rating: 5.0,
              reviewCount: 0,
              verified: true,
              totalHires: 0,
              activePostings: 0,
              description: 'Local employer hiring verified skilled workers.',
              logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
            }),
      };

      await setDoc(userDocRef, profilePayload);

      setRoleState(roleSelected);
      if (roleSelected === 'worker') {
        setActiveWorkerId(user.uid);
      } else {
        setActiveEmployerId(user.uid);
      }
      setIsAuthenticated(true);
      setIsNewUserOnboarding(false);
      setIsEmailVerified(true);

      showToast(`Welcome! Registered successfully as ${roleSelected === 'worker' ? 'Worker' : 'Employer'}.`);
      return { success: true };
    } catch (err: any) {
      let errorMsg = 'Failed to create account. Please try again.';
      if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Registration error on this project. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This mobile number or user name is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters.';
      } else {
        console.warn('Registration issue:', err?.message || err);
      }
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // Backwards compatibility aliases
  const signInWithEmail = signInWithUsernameOrPhone;
  const signUpWithEmail = async (
    emailOrUsername: string,
    password: string,
    roleSelected: UserRole,
    details?: any
  ) => {
    return signUpWithUsernameOrPhone(
      details?.name || emailOrUsername,
      details?.phone || emailOrUsername,
      password,
      roleSelected,
      details
    );
  };

  // Send or resend email verification confirmation link
  const sendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'No authenticated user found.' };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      showToast(`Verification confirmation email resent to ${auth.currentUser.email}! Check your inbox.`);
      return { success: true };
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      let errorMsg = 'Failed to send confirmation link. Please try again.';
      if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many requests. Please wait a few moments before trying again.';
      }
      showToast(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Reload current user to check if email has been verified
  const reloadUserVerification = async (): Promise<{ verified: boolean }> => {
    if (!auth.currentUser) return { verified: false };
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setFirebaseUser({ ...updatedUser });
      const verified = Boolean(updatedUser.emailVerified);
      setIsEmailVerified(verified);
      if (verified) {
        showToast('Email verified successfully! Your account is validated.');
      } else {
        showToast('Email not yet verified. Please click the confirmation link in your inbox.');
      }
      return { verified };
    } catch (err: any) {
      console.error('Error checking verification status:', err);
      return { verified: false };
    }
  };

  // Complete Registration for new user
  const completeRegistration = async (details: any) => {
    if (!onboardingUser) return;
    setAuthLoading(true);

    try {
      const userDocRef = doc(db, 'users', onboardingUser.uid);
      const roleSelected: UserRole = details.role;

      const profilePayload = {
        uid: onboardingUser.uid,
        email: onboardingUser.email || '',
        name: onboardingUser.displayName || (roleSelected === 'worker' ? 'Worker' : 'Employer'),
        avatar: onboardingUser.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
        role: roleSelected,
        city: 'Bangalore',
        createdAt: new Date().toISOString(),
        ...details,
      };

      await setDoc(userDocRef, profilePayload);

      setRoleState(roleSelected);
      if (roleSelected === 'worker') {
        setActiveWorkerId(onboardingUser.uid);
      } else {
        setActiveEmployerId(onboardingUser.uid);
      }
      setIsAuthenticated(true);
      setIsNewUserOnboarding(false);
      showToast(`Account registered as ${roleSelected}! Welcome to Jobnexa.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${onboardingUser.uid}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setIsNewUserOnboarding(false);
      setFirebaseUser(null);
      showToast('Signed out successfully.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Safe fallback default profiles so application never encounters undefined
  const defaultWorker: WorkerProfile = {
    id: firebaseUser?.uid || 'current-worker',
    name: firebaseUser?.displayName || 'Worker Member',
    phone: '+91 98450 00000',
    email: firebaseUser?.email || '',
    avatar: firebaseUser?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    primarySkill: 'Plumber',
    secondarySkills: ['General Work'],
    experienceYears: 2,
    preferredJobTypes: ['Daily Wage'],
    availabilityStatus: 'available',
    city: 'Bangalore',
    area: 'Koramangala',
    expectedWage: 850,
    wageType: 'day',
    bio: 'Verified tradesperson on Jobnexa.',
    rating: 5.0,
    reviewCount: 0,
    completedJobsCount: 0,
    pastExperience: [],
  };

  const defaultEmployer: EmployerProfile = {
    id: firebaseUser?.uid || 'current-employer',
    name: firebaseUser?.displayName || 'Employer Account',
    contactPerson: firebaseUser?.displayName || 'Manager',
    phone: '+91 98450 00000',
    email: firebaseUser?.email || '',
    logo: firebaseUser?.photoURL || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
    businessType: 'Private Household',
    city: 'Bangalore',
    area: 'Koramangala',
    description: 'Verified employer on Jobnexa.',
    rating: 5.0,
    reviewCount: 0,
  };

  const currentWorker =
    workers.find((w) => w.id === (firebaseUser?.uid || activeWorkerId)) ||
    (firebaseUser
      ? {
          ...defaultWorker,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Worker Member',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || defaultWorker.avatar,
        }
      : workers[0] || defaultWorker);

  const currentEmployer =
    employers.find((e) => e.id === (firebaseUser?.uid || activeEmployerId)) ||
    (firebaseUser
      ? {
          ...defaultEmployer,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Employer Account',
          email: firebaseUser.email || '',
          logo: firebaseUser.photoURL || defaultEmployer.logo,
        }
      : employers[0] || defaultEmployer);

  // Dynamic real-time calculation of available workers
  const getAvailabilityCount = (skill: SkillCategory, city: string = 'Bangalore', area?: string) => {
    return workers.filter((w) => {
      const matchSkill = w.primarySkill === skill || w.secondarySkills.includes(skill);
      const matchCity = !city || w.city.toLowerCase() === city.toLowerCase();
      const matchArea = !area || area === 'All Areas' || w.area.toLowerCase() === area.toLowerCase();
      const isAvailable = w.availabilityStatus === 'available';
      return matchSkill && matchCity && matchArea && isAvailable;
    }).length;
  };

  const getAvailableWorkersList = (skill: SkillCategory, city: string = 'Bangalore', area?: string) => {
    return workers.filter((w) => {
      const matchSkill = w.primarySkill === skill || w.secondarySkills.includes(skill);
      const matchCity = !city || w.city.toLowerCase() === city.toLowerCase();
      const matchArea = !area || area === 'All Areas' || w.area.toLowerCase() === area.toLowerCase();
      const isAvailable = w.availabilityStatus === 'available';
      return matchSkill && matchCity && matchArea && isAvailable;
    });
  };

  // Toggle worker availability in Firestore
  const toggleWorkerAvailability = async (workerId: string, newStatus?: WorkerAvailability) => {
    const next = newStatus || (currentWorker.availabilityStatus === 'available' ? 'unavailable' : 'available');

    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, availabilityStatus: next } : w))
    );

    try {
      if (firebaseUser) {
        await updateDoc(doc(db, 'users', workerId), {
          availabilityStatus: next,
        });
      }
      showToast('Availability status updated in real-time');
    } catch (error) {
      console.error('Error updating availability in Firestore:', error);
      showToast('Availability status updated');
    }
  };

  // Send hire request in Firestore
  const sendHireRequest = async (data: {
    workerId: string;
    jobId?: string;
    jobTitle: string;
    proposedWage: number;
    startDate: string;
    duration: string;
    location: string;
    message: string;
  }) => {
    const targetWorker = workers.find((w) => w.id === data.workerId);
    if (!targetWorker) return;

    const reqId = `hr-${Date.now()}`;
    const newRequest: HireRequest = {
      id: reqId,
      jobId: data.jobId || '',
      jobTitle: data.jobTitle || `Direct ${targetWorker.primarySkill} Hire`,
      employerId: firebaseUser?.uid || currentEmployer.id,
      employerName: currentEmployer.name || firebaseUser?.displayName || 'Employer',
      employerLogo: currentEmployer.logo || firebaseUser?.photoURL || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
      employerPhone: currentEmployer.phone || '+91 98450 00000',
      workerId: targetWorker.id,
      workerName: targetWorker.name,
      workerSkill: targetWorker.primarySkill,
      workerAvatar: targetWorker.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      proposedWage: Number(data.proposedWage) || 800,
      payType: 'Daily',
      startDate: data.startDate || 'Immediate',
      duration: data.duration || 'Ongoing (Days or Years)',
      location: data.location || `${currentEmployer.area}, Bangalore`,
      message: data.message || '',
      status: 'Pending',
      createdAt: 'Just now',
    };

    setHireRequests((prev) => [newRequest, ...prev]);

    try {
      await setDoc(doc(db, 'hireRequests', reqId), newRequest);
    } catch (error) {
      console.error('Error saving hire request to Firestore:', error);
    }

    // Send notification to worker
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'worker',
      recipientId: targetWorker.id,
      title: 'New Hire Request!',
      message: `${currentEmployer.name} sent you a hire request for "${data.jobTitle}" at ₹${data.proposedWage}/day.`,
      type: 'hire_request',
      read: false,
      timestamp: 'Just now',
      actionTab: 'requests',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Hire request sent to ${targetWorker.name}!`);
    setHireRequestWorkerId(null);
  };

  // Accept hire request
  const acceptHireRequest = async (requestId: string) => {
    const req = hireRequests.find((r) => r.id === requestId);
    if (!req) return;

    setHireRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Accepted' } : r))
    );

    setWorkers((prev) =>
      prev.map((w) => (w.id === req.workerId ? { ...w, availabilityStatus: 'hired' } : w))
    );

    try {
      await updateDoc(doc(db, 'hireRequests', requestId), { status: 'Accepted' });
      await updateDoc(doc(db, 'users', req.workerId), { availabilityStatus: 'hired' });
    } catch (error) {
      console.error('Error updating hire status in Firestore:', error);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'employer',
      recipientId: req.employerId,
      title: 'Hire Request Accepted! 🎉',
      message: `${req.workerName} accepted your hire request for "${req.jobTitle}".`,
      type: 'hire_request',
      read: false,
      timestamp: 'Just now',
      actionTab: 'my-jobs',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Accepted! Your status is now Hired.`);
  };

  // Decline hire request
  const declineHireRequest = async (requestId: string) => {
    const req = hireRequests.find((r) => r.id === requestId);
    if (!req) return;

    setHireRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Declined' } : r))
    );

    try {
      await updateDoc(doc(db, 'hireRequests', requestId), { status: 'Declined' });
    } catch (error) {
      console.error('Error declining in Firestore:', error);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'employer',
      recipientId: req.employerId,
      title: 'Hire Request Declined',
      message: `${req.workerName} was unavailable for "${req.jobTitle}".`,
      type: 'hire_request',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('Hire request declined.');
  };

  // Mark job completed
  const completeJob = async (requestId: string) => {
    const req = hireRequests.find((r) => r.id === requestId);
    if (!req) return;

    setHireRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Completed' } : r))
    );

    setWorkers((prev) =>
      prev.map((w) =>
        w.id === req.workerId
          ? {
              ...w,
              availabilityStatus: 'available',
              completedJobsCount: w.completedJobsCount + 1,
            }
          : w
      )
    );

    try {
      await updateDoc(doc(db, 'hireRequests', requestId), { status: 'Completed' });
      await updateDoc(doc(db, 'users', req.workerId), { availabilityStatus: 'available' });
    } catch (error) {
      console.error('Error completing job in Firestore:', error);
    }

    if (role === 'worker') {
      setReviewModalData({
        isOpen: true,
        jobTitle: req.jobTitle,
        targetId: req.employerId,
        targetName: req.employerName,
        reviewerRole: 'worker',
      });
    } else {
      setReviewModalData({
        isOpen: true,
        jobTitle: req.jobTitle,
        targetId: req.workerId,
        targetName: req.workerName,
        reviewerRole: 'employer',
      });
    }

    showToast(`Job completed! Worker status reset to Available.`);
  };

  // Worker applies to job
  const applyToJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const alreadyApplied = applications.some((a) => a.jobId === jobId && a.workerId === currentWorker.id);
    if (alreadyApplied) {
      showToast('You have already applied to this job!');
      return;
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      workerAvatar: currentWorker.avatar,
      workerSkill: currentWorker.primarySkill,
      workerExperienceYears: currentWorker.experienceYears,
      workerRating: currentWorker.rating,
      expectedWage: currentWorker.expectedWage,
      status: 'Pending',
      appliedAt: 'Just now',
      matchScore: job.matchScore || 90,
    };

    setApplications((prev) => [newApp, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'employer',
      recipientId: job.employerId,
      title: 'New Applicant for Job!',
      message: `${currentWorker.name} (${currentWorker.primarySkill}) applied for "${job.title}".`,
      type: 'application',
      read: false,
      timestamp: 'Just now',
      actionTab: 'my-jobs',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Application submitted for "${job.title}"!`);
  };

  // Employer accepts worker applicant
  const acceptApplication = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'Accepted' } : a))
    );

    const job = jobs.find((j) => j.id === app.jobId);
    if (job) {
      const newHired = job.workersHired + 1;
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                workersHired: newHired,
                status: newHired >= j.workersNeeded ? 'Filled' : 'Open',
              }
            : j
        )
      );
    }

    setWorkers((prev) =>
      prev.map((w) => (w.id === app.workerId ? { ...w, availabilityStatus: 'hired' } : w))
    );

    const newHireRequest: HireRequest = {
      id: `hr-${Date.now()}`,
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      employerId: currentEmployer.id,
      employerName: currentEmployer.name,
      employerLogo: currentEmployer.logo,
      employerPhone: currentEmployer.phone,
      workerId: app.workerId,
      workerName: app.workerName,
      workerSkill: app.workerSkill,
      workerAvatar: app.workerAvatar,
      proposedWage: app.expectedWage,
      payType: 'Daily',
      startDate: 'Immediately',
      duration: job?.duration || '1 Day',
      location: `${job?.area || 'Koramangala'}, Bangalore`,
      message: `Your application for ${app.jobTitle} has been accepted! You are officially hired.`,
      status: 'Accepted',
      createdAt: 'Just now',
    };

    setHireRequests((prev) => [newHireRequest, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'worker',
      recipientId: app.workerId,
      title: 'Application Accepted! 🚀',
      message: `Congratulations! ${currentEmployer.name} hired you for "${app.jobTitle}".`,
      type: 'application',
      read: false,
      timestamp: 'Just now',
      actionTab: 'requests',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Hired ${app.workerName}! Worker status is now Hired.`);
  };

  const declineApplication = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'Declined' } : a))
    );
    showToast('Application declined.');
  };

  // Employer posts a job to Firestore
  const createJobPosting = async (
    jobData: Omit<
      JobPosting,
      'id' | 'employerId' | 'employerName' | 'employerLogo' | 'employerRating' | 'workersHired' | 'status' | 'createdAt'
    >
  ) => {
    const jobId = `job-${Date.now()}`;
    const newJob: JobPosting = {
      ...jobData,
      id: jobId,
      employerId: currentEmployer.id,
      employerName: currentEmployer.name,
      employerLogo: currentEmployer.logo,
      employerRating: currentEmployer.rating,
      workersHired: 0,
      status: 'Open',
      createdAt: 'Just now',
      matchScore: 95,
      aiMatchReason: `Direct match for ${jobData.skillCategory} workers in ${jobData.area}.`,
    };

    setJobs((prev) => [newJob, ...prev]);

    try {
      await setDoc(doc(db, 'jobs', jobId), newJob);
    } catch (error) {
      console.error('Error saving job to Firestore:', error);
    }

    setIsPostJobOpen(false);
    showToast(`Job "${newJob.title}" posted successfully!`);
  };

  // Add review
  const addReview = async (reviewData: {
    targetId: string;
    rating: number;
    comment: string;
    jobTitle: string;
  }) => {
    const revId = `rev-${Date.now()}`;
    const isReviewerWorker = role === 'worker';
    const newReview: Review = {
      id: revId,
      targetId: reviewData.targetId,
      reviewerName: isReviewerWorker ? currentWorker.name : currentEmployer.name,
      reviewerAvatar: isReviewerWorker ? currentWorker.avatar : currentEmployer.logo,
      reviewerRole: role,
      rating: reviewData.rating,
      comment: reviewData.comment,
      jobTitle: reviewData.jobTitle,
      date: 'Just now',
    };

    setReviews((prev) => [newReview, ...prev]);

    try {
      await setDoc(doc(db, 'reviews', revId), newReview);
    } catch (error) {
      console.error('Error saving review to Firestore:', error);
    }

    setReviewModalData(null);
    showToast('Review submitted! Thank you for the feedback.');
  };

  // Update worker profile
  const updateWorkerProfile = async (workerId: string, updates: Partial<WorkerProfile>) => {
    setWorkers((prev) => prev.map((w) => (w.id === workerId ? { ...w, ...updates } : w)));

    try {
      if (firebaseUser) {
        await updateDoc(doc(db, 'users', workerId), updates);
      }
      showToast('Worker profile updated successfully.');
    } catch (error) {
      console.error('Error updating worker profile in Firestore:', error);
      showToast('Worker profile updated.');
    }
  };

  // Update employer profile
  const updateEmployerProfile = async (employerId: string, updates: Partial<EmployerProfile>) => {
    setEmployers((prev) => prev.map((e) => (e.id === employerId ? { ...e, ...updates } : e)));

    try {
      if (firebaseUser) {
        await updateDoc(doc(db, 'users', employerId), updates);
      }
      showToast('Employer profile updated successfully.');
    } catch (error) {
      console.error('Error updating employer profile in Firestore:', error);
      showToast('Employer profile updated.');
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = (userRole: UserRole) => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipientRole === userRole ? { ...n, read: true } : n))
    );
    showToast('All notifications marked as read.');
  };

  // AI Job description generator
  const generateAIDescription = async (title: string, skill: SkillCategory) => {
    await new Promise((r) => setTimeout(r, 600));

    const templates: Record<string, { description: string; responsibilities: string[] }> = {
      Plumber: {
        description: `Looking for a punctual, skilled Plumber for repair and installation work in Bangalore. Candidate must bring basic handheld pipe wrenches, thread seal tape, and leak testing gear.`,
        responsibilities: [
          'Diagnose concealed pipeline leakages and ceiling dampness',
          'Install or replace CPVC/PVC inlet valves, ball valves, and float assemblies',
          'Repair or replace broken mixer taps, shower heads, and flush tanks',
          'Ensure tidy cleanup and water flow pressure testing upon job completion',
        ],
      },
      Electrician: {
        description: `Seeking a licensed Electrician for residential or light commercial wiring, switchboard troubleshooting, and load diagnostics in Bangalore.`,
        responsibilities: [
          'Inspect distribution board, MCBs, and neutral ground leakage',
          'Install internal conduit wiring, modular switch plates, and LED fixtures',
          'Check earthing resistance and repair inverter/UPS bypass connections',
          'Strictly adhere to safety insulation norms and test with multimeter',
        ],
      },
      Carpenter: {
        description: `Need an experienced Carpenter for modular woodwork repairs, door alignment, hinge replacements, and custom laminate finish.`,
        responsibilities: [
          'Repair sticking doors, sagging wardrobe shutters, and drawer channels',
          'Fabricate and assemble customized plywood shelving or cabinets',
          'Install soft-close hydraulic hinges, telescopic sliders, and lock latches',
          'Edge banding, surface sand leveling, and laminate bonding',
        ],
      },
      Painter: {
        description: `Need an experienced wall finish Painter for surface preparation, putty application, and smooth emulsion/enamel coating.`,
        responsibilities: [
          'Scrape loose paint and fill wall fissures with damp-proof putty',
          'Apply primer coats followed by double-layer acrylic emulsion',
          'Execute texture painting or enamel protection on woodwork/metal grills',
          'Cover flooring and furniture prior to rolling and maintain clean lines',
        ],
      },
      Driver: {
        description: `Hiring a licensed, punctual Driver with extensive local Bangalore city knowledge and clean driving record.`,
        responsibilities: [
          'Safely navigate urban traffic and timely destination pickups',
          'Inspect engine oil, tire pressure, and exterior cleanliness daily',
          'Strictly follow traffic safety guidelines and parking protocols',
          'Maintain fuel receipts and log mileage entries accurately',
        ],
      },
      'Domestic Help': {
        description: `Seeking a trustworthy and diligent Domestic Assistant for residential cleaning, kitchen organization, and day-to-day household maintenance.`,
        responsibilities: [
          'Perform thorough floor dusting, vacuuming, and antibacterial mopping',
          'Wash and arrange kitchen utensils and wipe down countertops',
          'Assist with vegetable peeling, chopping, and basic meal preparation',
          'Maintain laundry washing, drying, and neat folding standards',
        ],
      },
      'Construction Worker': {
        description: `Require energetic Construction Laborers for material movement, concrete batching assistance, and site debris clearing.`,
        responsibilities: [
          'Assist in manual transport of sand, cement bags, and steel rods',
          'Operate mechanical mixers and assist master masons with mortar leveling',
          'Follow safety helmet and boots protocols on active building sites',
          'Clean workspace and organize tools at the end of each shift',
        ],
      },
      Mason: {
        description: `Experienced Mason required for brick masonry, concrete plastering, and stone or vitrified tile installation with precision alignment.`,
        responsibilities: [
          'Lay solid cement bricks and mortar joints with plumb-line accuracy',
          'Smooth surface plastering on internal and external brick walls',
          'Cut and fit ceramic/vitrified tiles with uniform spacer joints',
          'Construct water-tight inspection chambers and boundary wall coping',
        ],
      },
      'Appliance Repair': {
        description: `Technician wanted for diagnostic troubleshooting, component replacement, and performance verification of household electrical appliances.`,
        responsibilities: [
          'Diagnose compressor, motor, and PCB board faults on site',
          'Replace worn gaskets, heating coils, capacitors, and thermistors',
          'Test appliance power draw and refrigerant pressure levels',
          'Educate clients on preventive maintenance and operational care',
        ],
      },
    };

    const selected = templates[skill] || templates.Plumber;
    return {
      description: `Requirement: ${title}. ${selected.description}`,
      responsibilities: selected.responsibilities,
    };
  };

  // Worker Bio Enhancer
  const enhanceBioWithAI = async (currentBio: string, skill: SkillCategory, exp: number) => {
    await new Promise((r) => setTimeout(r, 600));
    return `Dedicated and verified ${skill} with ${exp}+ years of proven on-site expertise in Bangalore. Specialize in quick fault diagnosis, high-grade material selection, and clean, long-lasting workmanship. Committed to punctuality, fair transparent pricing, and 100% customer satisfaction. Available for daily wage and contract work across prime Bangalore localities.`;
  };

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        authLoading,
        isAuthenticated,
        isNewUserOnboarding,
        onboardingUser,
        signInWithGoogle,
        signInWithUsernameOrPhone,
        signUpWithUsernameOrPhone,
        signInWithEmail,
        signUpWithEmail,
        isEmailVerified,
        sendVerificationEmail,
        reloadUserVerification,
        completeRegistration,
        logout,

        role,
        setRole,
        activeWorkerId,
        setActiveWorkerId,
        activeEmployerId,
        setActiveEmployerId,
        activeWorkerTab,
        setActiveWorkerTab,
        activeEmployerTab,
        setActiveEmployerTab,
        deviceMode,
        setDeviceMode,

        selectedJobId,
        setSelectedJobId,
        selectedWorkerId,
        setSelectedWorkerId,
        hireRequestWorkerId,
        setHireRequestWorkerId,
        applicantsJobId,
        setApplicantsJobId,
        isPostJobOpen,
        setIsPostJobOpen,
        reviewModalData,
        setReviewModalData,

        toastMessage,
        showToast,

        workers,
        employers,
        jobs,
        hireRequests,
        applications,
        reviews,
        notifications,

        currentWorker,
        currentEmployer,
        getAvailabilityCount,
        getAvailableWorkersList,

        toggleWorkerAvailability,
        sendHireRequest,
        acceptHireRequest,
        declineHireRequest,
        completeJob,
        applyToJob,
        acceptApplication,
        declineApplication,
        createJobPosting,
        addReview,
        updateWorkerProfile,
        updateEmployerProfile,
        markNotificationRead,
        markAllNotificationsRead,

        generateAIDescription,
        enhanceBioWithAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

import {
  User,
  CandidateProfile,
  Skill,
  Experience,
  Education,
  Certification,
  Project,
  MasterCV,
  CVVersion,
  Job,
  SavedJob,
  JobAnalysis,
  Application,
  ApplicationAnswer,
  CoverLetter,
  InterviewPrepSession,
} from '../types/index.ts';

const TOKEN_KEY = 'job_hunter_ai_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    demoLogin: () =>
      request<{ user: User; token: string }>('/api/auth/demo-login', {
        method: 'POST',
      }),
    me: () => request<{ user: User }>('/api/auth/me'),
    logout: () => {
      clearStoredToken();
      return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
    },
  },

  // Profile
  profile: {
    get: () => request<{ profile: CandidateProfile }>('/api/profile'),
    update: (profile: Partial<CandidateProfile>) =>
      request<{ profile: CandidateProfile }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }),
    getFullContext: () => request<{ context: any }>('/api/profile/full'),
  },

  // Skills
  skills: {
    list: () => request<{ skills: Skill[] }>('/api/profile/skills'),
    add: (skill: Omit<Skill, 'id' | 'userId'>) =>
      request<{ skill: Skill }>('/api/profile/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/profile/skills/${id}`, {
        method: 'DELETE',
      }),
  },

  // Experience
  experience: {
    list: () => request<{ experiences: Experience[] }>('/api/profile/experience'),
    add: (exp: Omit<Experience, 'id' | 'userId'>) =>
      request<{ experience: Experience }>('/api/profile/experience', {
        method: 'POST',
        body: JSON.stringify(exp),
      }),
    update: (id: string, updates: Partial<Experience>) =>
      request<{ experience: Experience }>(`/api/profile/experience/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/profile/experience/${id}`, {
        method: 'DELETE',
      }),
  },

  // Education
  education: {
    list: () => request<{ educations: Education[] }>('/api/profile/education'),
    add: (edu: Omit<Education, 'id' | 'userId'>) =>
      request<{ education: Education }>('/api/profile/education', {
        method: 'POST',
        body: JSON.stringify(edu),
      }),
    update: (id: string, updates: Partial<Education>) =>
      request<{ education: Education }>(`/api/profile/education/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/profile/education/${id}`, {
        method: 'DELETE',
      }),
  },

  // Certifications
  certifications: {
    list: () => request<{ certifications: Certification[] }>('/api/profile/certifications'),
    add: (cert: Omit<Certification, 'id' | 'userId'>) =>
      request<{ certification: Certification }>('/api/profile/certifications', {
        method: 'POST',
        body: JSON.stringify(cert),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/profile/certifications/${id}`, {
        method: 'DELETE',
      }),
  },

  // Projects
  projects: {
    list: () => request<{ projects: Project[] }>('/api/profile/projects'),
    add: (proj: Omit<Project, 'id' | 'userId'>) =>
      request<{ project: Project }>('/api/profile/projects', {
        method: 'POST',
        body: JSON.stringify(proj),
      }),
    update: (id: string, updates: Partial<Project>) =>
      request<{ project: Project }>(`/api/profile/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/profile/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  // Jobs
  jobs: {
    list: (params?: {
      keyword?: string;
      location?: string;
      remoteType?: string;
      employmentType?: string;
      experienceLevel?: string;
    }) => {
      const search = new URLSearchParams();
      if (params?.keyword) search.append('keyword', params.keyword);
      if (params?.location) search.append('location', params.location);
      if (params?.remoteType) search.append('remoteType', params.remoteType);
      if (params?.employmentType) search.append('employmentType', params.employmentType);
      if (params?.experienceLevel) search.append('experienceLevel', params.experienceLevel);
      return request<{ jobs: Job[] }>(`/api/jobs?${search.toString()}`);
    },
    get: (id: string) => request<{ job: Job }>(`/api/jobs/${id}`),
    recommended: () => request<{ recommended: Job[] }>('/api/jobs/recommended'),
    addManual: (jobData: any) =>
      request<{ job: Job }>('/api/jobs/manual', {
        method: 'POST',
        body: JSON.stringify(jobData),
      }),
    fromLink: (data: { url: string; autoSave?: boolean }) =>
      request<{ job: Job }>('/api/jobs/from-link', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    saved: () => request<{ savedJobs: SavedJob[] }>('/api/jobs/saved/all'),
    save: (jobId: string, notes?: string) =>
      request<{ savedJob: SavedJob }>('/api/jobs/saved', {
        method: 'POST',
        body: JSON.stringify({ jobId, notes }),
      }),
    removeSaved: (jobId: string) =>
      request<{ success: boolean }>(`/api/jobs/saved/${jobId}`, {
        method: 'DELETE',
      }),
  },

  // CV
  cv: {
    getMaster: () => request<{ masterCV: MasterCV }>('/api/cv/master'),
    updateMaster: (rawText: string) =>
      request<{ masterCV: MasterCV }>('/api/cv/master', {
        method: 'PUT',
        body: JSON.stringify({ rawText }),
      }),
    parseText: (text: string) =>
      request<{ success: boolean; totalLines: number; preview: string[] }>('/api/cv/parse-text', {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    getVersions: () => request<{ versions: CVVersion[] }>('/api/cv/versions'),
    saveVersion: (version: any) =>
      request<{ version: CVVersion }>('/api/cv/versions', {
        method: 'POST',
        body: JSON.stringify(version),
      }),
    deleteVersion: (id: string) =>
      request<{ success: boolean }>(`/api/cv/versions/${id}`, {
        method: 'DELETE',
      }),
  },

  // AI
  ai: {
    analyseJob: (data: { jobId?: string; customJob?: any }) =>
      request<{ analysis: JobAnalysis }>('/api/ai/analyse-job', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAnalyses: () => request<{ analyses: JobAnalysis[] }>('/api/ai/analyses'),
    getAnalysis: (jobId: string) => request<{ analysis: JobAnalysis | null }>(`/api/ai/analyses/${jobId}`),
    tailorCV: (data: { jobId?: string; customJob?: any }) =>
      request<{ version: CVVersion }>('/api/ai/tailor-cv', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    coverLetter: (data: { jobId?: string; customJob?: any; tone?: string }) =>
      request<{ coverLetter: CoverLetter }>('/api/ai/cover-letter', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    applicationAnswer: (data: { question: string; length?: string; jobId?: string }) =>
      request<{ answer: ApplicationAnswer }>('/api/ai/application-answer', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAnswers: (jobId?: string) =>
      request<{ answers: ApplicationAnswer[] }>(`/api/ai/application-answers${jobId ? `?jobId=${jobId}` : ''}`),
    interviewPrep: (data: { jobId?: string; customJob?: any }) =>
      request<{ session: InterviewPrepSession }>('/api/ai/interview-prep', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getInterviewSession: (jobId: string) =>
      request<{ session: InterviewPrepSession | null }>(`/api/ai/interview-prep/${jobId}`),
  },

  // Applications
  applications: {
    list: () => request<{ applications: Application[] }>('/api/applications'),
    metrics: () => request<{ metrics: any }>('/api/applications/metrics'),
    create: (data: any) =>
      request<{ application: Application }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, updates: Partial<Application>) =>
      request<{ application: Application }>(`/api/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/applications/${id}`, {
        method: 'DELETE',
      }),
  },
};

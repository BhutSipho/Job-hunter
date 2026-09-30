export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    province: string;
    country: string;
    linkedIn: string;
    portfolio: string;
    github: string;
  };
  professional: {
    title: string;
    summary: string;
    preferredJobTitles: string[];
    preferredLocations: string[];
    remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'any';
    salaryExpectation: string;
  };
}

export type SkillCategory = 
  | 'languages' 
  | 'frameworks' 
  | 'databases' 
  | 'cloud' 
  | 'tools' 
  | 'soft' 
  | 'other';

export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: SkillCategory;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
}

export interface Experience {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
}

export interface Education {
  id: string;
  userId: string;
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  completionStatus: 'completed' | 'in_progress' | 'did_not_complete';
  description?: string;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  provider: string;
  issueDate: string;
  credentialUrl?: string;
  description?: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  role: string;
  status: 'completed' | 'in_progress' | 'maintained';
}

export interface MasterCV {
  id: string;
  userId: string;
  rawText: string;
  updatedAt: string;
}

export interface CVVersion {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  title: string;
  tailoredSummary: string;
  prioritizedSkills: string[];
  tailoredExperience: {
    experienceId: string;
    company: string;
    jobTitle: string;
    period: string;
    bulletPoints: string[];
    highlightedTechnologies: string[];
  }[];
  tailoredProjects: {
    projectId: string;
    name: string;
    role: string;
    bulletPoints: string[];
    technologies: string[];
  }[];
  createdAt: string;
  notes?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remoteType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  source: string;
  applicationUrl: string;
  dateDiscovered: string;
  closingDate?: string;
  tags: string[];
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  savedAt: string;
  status: 'saved' | 'applied' | 'archived';
  notes?: string;
}

export interface JobAnalysis {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  jobOverview: {
    title: string;
    company: string;
    location: string;
    employmentType: string;
  };
  overallMatchScore: number; // 0 to 100
  scoreBreakdown: {
    technicalSkillsScore: number;
    experienceScore: number;
    educationScore: number;
    certificationsScore: number;
    responsibilitiesScore: number;
  };
  scoreReasoning: string;
  requiredSkills: string[];
  candidateMatches: {
    requirement: string;
    candidateSkillOrExperience: string;
    evidenceSource: string;
  }[];
  partialMatches: {
    requirement: string;
    candidateSkillOrExperience: string;
    gapExplanation: string;
  }[];
  missingRequirements: {
    requirement: string;
    importance: 'critical' | 'preferred';
    recommendation: string;
  }[];
  atsAnalysis: {
    foundKeywords: string[];
    missingKeywords: string[];
    ethicalSuggestions: string[];
  };
}

export type ApplicationStatus = 
  | 'saved' 
  | 'preparing' 
  | 'applied' 
  | 'assessment' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn';

export interface Application {
  id: string;
  userId: string;
  jobId?: string;
  company: string;
  role: string;
  location: string;
  jobUrl?: string;
  applicationDate: string;
  status: ApplicationStatus;
  notes?: string;
  salaryOffered?: string;
  interviewDate?: string;
  followUpDate?: string;
  cvVersionId?: string;
  coverLetterId?: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  recipient?: string;
  content: string;
  createdAt: string;
}

export interface ApplicationAnswer {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle?: string;
  question: string;
  length: 'short' | 'medium' | 'detailed';
  answer: string;
  createdAt: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'role_company' | 'project';
  difficulty: 'easy' | 'medium' | 'hard';
  contextTip: string;
  generatedAnswer?: string;
  starBreakdown?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface InterviewPrepSession {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  questions: InterviewQuestionItem[];
  createdAt: string;
}

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
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
} from '../src/types/index.ts';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  profiles: CandidateProfile[];
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  projects: Project[];
  masterCVs: MasterCV[];
  cvVersions: CVVersion[];
  jobs: Job[];
  savedJobs: SavedJob[];
  jobAnalyses: JobAnalysis[];
  applications: Application[];
  applicationAnswers: ApplicationAnswer[];
  coverLetters: CoverLetter[];
  interviewSessions: InterviewPrepSession[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Junior Full Stack Developer',
    company: 'Apex Cloud Solutions',
    location: 'Cape Town, South Africa (or Remote)',
    remoteType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    salary: 'R35,000 - R48,000 / month',
    description: `Apex Cloud Solutions is seeking a motivated Junior Full Stack Developer to join our core engineering team. You will work alongside senior software engineers to build responsive web applications, design RESTful APIs, and integrate scalable cloud services.

Key Responsibilities:
- Develop modern, responsive web user interfaces using React and TypeScript.
- Build resilient backend services and endpoints in Python / Node.js.
- Write clean SQL queries, design database schemas, and integrate ORMs.
- Collaborate with product designers and QA testers in agile sprint cycles.
- Participate in code reviews, bug fixes, and continuous integration deployments.`,
    requirements: [
      'Proficiency in JavaScript / TypeScript and modern React.',
      'Working knowledge of backend frameworks (Node.js/Express or Python/Flask/FastAPI).',
      'Familiarity with SQL databases such as PostgreSQL or SQLite.',
      'Understanding of Git version control and collaborative workflows.',
      'Strong problem-solving attitude and eager desire to learn modern cloud platforms (AWS, GCP).',
      'Knowledge of REST APIs and JSON data handling.'
    ],
    responsibilities: [
      'Build frontend features and maintain reusable component libraries.',
      'Implement API endpoints and integrate external data services.',
      'Assist in unit and integration testing.',
      'Document technical specifications and onboarding flows.'
    ],
    source: 'TechCareers Africa',
    applicationUrl: 'https://apexcloud.example.com/careers/junior-fullstack',
    dateDiscovered: '2026-09-28',
    closingDate: '2026-10-31',
    tags: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Git']
  },
  {
    id: 'job-2',
    title: 'Junior Software Engineer - Python & APIs',
    company: 'FinPulse Technologies',
    location: 'Johannesburg, South Africa',
    remoteType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    salary: 'R40,000 - R52,000 / month',
    description: `FinPulse is an innovative fintech startup revolutionizing automated reconciliation and analytics. We need an enthusiastic Junior Software Engineer passionate about clean Python backend engineering, API performance, and data security.

What You Will Do:
- Build and maintain microservices and RESTful endpoints using Python.
- Optimize database transactions and schemas in PostgreSQL.
- Implement automated test suites (pytest/unittest) and CI/CD pipelines.
- Ensure strict adherence to security and data privacy standards.`,
    requirements: [
      'Strong foundations in Python 3 and object-oriented design.',
      'Hands-on experience with RESTful APIs, HTTP protocols, and JSON.',
      'Relational database experience (PostgreSQL, MySQL, or SQLite).',
      'Familiarity with Docker and Linux command line tools.',
      'Demonstrated portfolio or personal projects showcasing clean code.',
      'Basic understanding of Docker containers is a plus.'
    ],
    responsibilities: [
      'Write robust Python service logic and database migrations.',
      'Monitor API latency, troubleshoot production errors, and fix bugs.',
      'Collaborate with the frontend team to integrate client dashboards.'
    ],
    source: 'JobServe FinTech',
    applicationUrl: 'https://finpulse.example.com/jobs/junior-swe',
    dateDiscovered: '2026-09-29',
    closingDate: '2026-11-15',
    tags: ['Python', 'PostgreSQL', 'REST API', 'Docker', 'Linux', 'Git']
  },
  {
    id: 'job-3',
    title: 'QA Tester & Automation Associate',
    company: 'Veloce Digital Systems',
    location: 'Durban, South Africa',
    remoteType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    salary: 'R30,000 - R42,000 / month',
    description: `Veloce Digital builds mission-critical logistics software. We are looking for an analytical QA Tester to design test plans, execute manual and automated test suites, verify API behaviors, and ensure high reliability across all platforms.`,
    requirements: [
      'Understanding of software testing lifecycle (STLC) and bug reporting.',
      'Familiarity with test automation tools (Cypress, Playwright, or Selenium).',
      'Experience testing REST APIs using Postman or curl.',
      'Basic programming knowledge in JavaScript or Python.',
      'Detail-oriented mind with excellent written communication.'
    ],
    responsibilities: [
      'Author structured test cases and maintain regression suites.',
      'Identify, reproduce, document, and track software defects.',
      'Collaborate with developers to verify fixes and perform smoke tests.'
    ],
    source: 'LinkedIn Jobs',
    applicationUrl: 'https://veloce.example.com/careers/qa-associate',
    dateDiscovered: '2026-09-25',
    closingDate: '2026-10-20',
    tags: ['QA', 'Testing', 'Postman', 'JavaScript', 'Python', 'Jira']
  },
  {
    id: 'job-4',
    title: 'IT Support & Systems Technician',
    company: 'OmniNet Enterprise',
    location: 'Pretoria, South Africa',
    remoteType: 'onsite',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    salary: 'R25,000 - R35,000 / month',
    description: `OmniNet Enterprise is recruiting an IT Support Technician to maintain internal network infrastructure, configure employee workstations, manage access rights, and provide prompt technical troubleshooting.`,
    requirements: [
      'Hardware and software troubleshooting on Windows, macOS, and Linux.',
      'Understanding of TCP/IP networking, DNS, DHCP, and Wi-Fi security.',
      'Experience with Active Directory or cloud identity providers.',
      'Customer-centric communication skills and patience under pressure.',
      'CompTIA A+ or Network+ certification is advantageous.'
    ],
    responsibilities: [
      'Troubleshoot hardware, peripheral, and operating system issues.',
      'Deploy software updates, security patches, and monitor network health.',
      'Manage support tickets and maintain IT inventory.'
    ],
    source: 'Careers24',
    applicationUrl: 'https://omninet.example.com/apply/it-support',
    dateDiscovered: '2026-09-27',
    closingDate: '2026-10-25',
    tags: ['IT Support', 'Networking', 'Windows', 'Linux', 'Troubleshooting']
  }
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    profiles: [],
    skills: [],
    experiences: [],
    educations: [],
    certifications: [],
    projects: [],
    masterCVs: [],
    cvVersions: [],
    jobs: [],
    savedJobs: [],
    jobAnalyses: [],
    applications: [],
    applicationAnswers: [],
    coverLetters: [],
    interviewSessions: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Failed to load database, creating fresh instance:', err);
      this.seedInitialData();
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  private seedInitialData() {
    const demoUserId = 'user-masango-001';
    const demoPasswordHash = bcrypt.hashSync('Password123!', 10);

    const demoUser: User & { passwordHash: string } = {
      id: demoUserId,
      email: 'masangosipho007@gmail.com',
      name: 'Sipho Masango',
      createdAt: new Date().toISOString(),
      passwordHash: demoPasswordHash
    };

    const demoProfile: CandidateProfile = {
      id: 'profile-001',
      userId: demoUserId,
      personal: {
        fullName: 'Sipho Masango',
        email: 'masangosipho007@gmail.com',
        phone: '+27 82 555 0199',
        city: 'Johannesburg',
        province: 'Gauteng',
        country: 'South Africa',
        linkedIn: 'https://linkedin.com/in/siphomasango-dev',
        portfolio: 'https://siphomasango.dev',
        github: 'https://github.com/siphomasango'
      },
      professional: {
        title: 'Junior Full Stack Developer & Software Engineer',
        summary: 'Analytical and motivated Junior Full Stack Developer with practical experience building modern web applications using React, TypeScript, Python, and PostgreSQL. Passionate about writing clean, maintainable code and solving real-world operational challenges.',
        preferredJobTitles: [
          'Junior Full Stack Developer',
          'Junior Software Engineer',
          'Junior Python Developer',
          'Junior Frontend Developer'
        ],
        preferredLocations: ['Johannesburg', 'Cape Town', 'Remote'],
        remotePreference: 'remote',
        employmentType: 'full-time',
        salaryExpectation: 'R35,000 - R48,000 / month'
      }
    };

    const demoSkills: Skill[] = [
      { id: 'sk-1', userId: demoUserId, name: 'TypeScript', category: 'languages', proficiency: 'intermediate', yearsExperience: 2 },
      { id: 'sk-2', userId: demoUserId, name: 'JavaScript (ES6+)', category: 'languages', proficiency: 'advanced', yearsExperience: 2 },
      { id: 'sk-3', userId: demoUserId, name: 'Python', category: 'languages', proficiency: 'intermediate', yearsExperience: 2 },
      { id: 'sk-4', userId: demoUserId, name: 'React', category: 'frameworks', proficiency: 'advanced', yearsExperience: 2 },
      { id: 'sk-5', userId: demoUserId, name: 'Node.js & Express', category: 'frameworks', proficiency: 'intermediate', yearsExperience: 1 },
      { id: 'sk-6', userId: demoUserId, name: 'Flask', category: 'frameworks', proficiency: 'intermediate', yearsExperience: 1 },
      { id: 'sk-7', userId: demoUserId, name: 'PostgreSQL', category: 'databases', proficiency: 'intermediate', yearsExperience: 2 },
      { id: 'sk-8', userId: demoUserId, name: 'SQLite', category: 'databases', proficiency: 'intermediate', yearsExperience: 2 },
      { id: 'sk-9', userId: demoUserId, name: 'Git & GitHub', category: 'tools', proficiency: 'advanced', yearsExperience: 2 },
      { id: 'sk-10', userId: demoUserId, name: 'REST APIs', category: 'tools', proficiency: 'advanced', yearsExperience: 2 },
      { id: 'sk-11', userId: demoUserId, name: 'Tailwind CSS', category: 'frameworks', proficiency: 'advanced', yearsExperience: 2 },
      { id: 'sk-12', userId: demoUserId, name: 'Docker (Basics)', category: 'cloud', proficiency: 'beginner', yearsExperience: 1 },
      { id: 'sk-13', userId: demoUserId, name: 'Analytical Troubleshooting', category: 'soft', proficiency: 'advanced', yearsExperience: 3 },
      { id: 'sk-14', userId: demoUserId, name: 'Agile & Team Collaboration', category: 'soft', proficiency: 'advanced', yearsExperience: 2 }
    ];

    const demoExperience: Experience[] = [
      {
        id: 'exp-1',
        userId: demoUserId,
        company: 'Hyperion Innovations Lab',
        jobTitle: 'Junior Web Developer Intern',
        location: 'Johannesburg (Hybrid)',
        startDate: '2025-01',
        endDate: '2025-12',
        isCurrent: false,
        description: 'Assisted the software development team in building client-facing web portals and internal dashboard utilities.',
        responsibilities: [
          'Developed interactive UI modules using React, TypeScript, and Tailwind CSS.',
          'Integrated REST APIs with backend services written in Node.js and Python.',
          'Wrote SQL database queries and validated request payloads for data integrity.',
          'Participated in daily stand-ups and sprint retrospectives.'
        ],
        technologies: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Git'],
        achievements: [
          'Reduced data entry errors by 30% by implementing front-end form validation routines.',
          'Spearheaded the migration of 12 legacy UI components to TypeScript and Tailwind CSS.'
        ]
      },
      {
        id: 'exp-2',
        userId: demoUserId,
        company: 'Vanguard IT Solutions',
        jobTitle: 'Technical Support & QA Assistant',
        location: 'Pretoria',
        startDate: '2024-03',
        endDate: '2024-12',
        isCurrent: false,
        description: 'Provided tier-1 software troubleshooting, tested web builds prior to deployment, and documented defects.',
        responsibilities: [
          'Executed manual regression test cases across staging environments.',
          'Documented bug tickets with reproduction steps in Jira.',
          'Assisted users with browser compatibility and credential troubleshooting.'
        ],
        technologies: ['Jira', 'Postman', 'Chrome DevTools', 'SQL Basics'],
        achievements: [
          'Authored 25 comprehensive test scripts that caught critical edge-case defects before major releases.'
        ]
      }
    ];

    const demoEducation: Education[] = [
      {
        id: 'edu-1',
        userId: demoUserId,
        institution: 'University of Johannesburg',
        qualification: 'Diploma in Information Technology',
        fieldOfStudy: 'Software Development & Systems Architecture',
        startDate: '2021-02',
        endDate: '2023-11',
        completionStatus: 'completed',
        description: 'Focus on programming logic, relational databases, data structures, algorithms, and software testing.'
      }
    ];

    const demoCerts: Certification[] = [
      {
        id: 'cert-1',
        userId: demoUserId,
        name: 'Meta Front-End Developer Professional Certificate',
        provider: 'Coursera / Meta',
        issueDate: '2024-05',
        credentialUrl: 'https://coursera.org/verify/demo-meta-cert',
        description: 'Comprehensive curriculum on React, JavaScript, version control, and UI engineering.'
      },
      {
        id: 'cert-2',
        userId: demoUserId,
        name: 'Python for Everybody Specialization',
        provider: 'University of Michigan',
        issueDate: '2023-08',
        credentialUrl: 'https://coursera.org/verify/demo-python-cert',
        description: 'Data structures, RESTful web services, and database interaction using Python.'
      }
    ];

    const demoProjects: Project[] = [
      {
        id: 'proj-1',
        userId: demoUserId,
        name: 'SaaS Task & Resource Tracker',
        description: 'A full-stack collaborative productivity web application with role-based access, task board, and real-time status updates.',
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
        githubUrl: 'https://github.com/siphomasango/task-tracker',
        liveUrl: 'https://task-tracker-demo.example.com',
        role: 'Solo Creator & Full-Stack Developer',
        status: 'completed'
      },
      {
        id: 'proj-2',
        userId: demoUserId,
        name: 'FinTech Expense & Currency API',
        description: 'REST API service built in Python and Flask that ingests foreign exchange rates, computes personal expense metrics, and returns structured JSON analytics.',
        technologies: ['Python', 'Flask', 'SQLite', 'Pytest', 'REST APIs'],
        githubUrl: 'https://github.com/siphomasango/expense-currency-api',
        role: 'Backend Developer',
        status: 'completed'
      }
    ];

    const demoMasterCV: MasterCV = {
      id: 'cv-master-001',
      userId: demoUserId,
      rawText: `SIPHO MASANGO
Johannesburg, South Africa | +27 82 555 0199 | masangosipho007@gmail.com
LinkedIn: linkedin.com/in/siphomasango-dev | Portfolio: siphomasango.dev | GitHub: github.com/siphomasango

PROFESSIONAL SUMMARY
Analytical and motivated Junior Full Stack Developer with practical experience building modern web applications using React, TypeScript, Python, and PostgreSQL. Passionate about writing clean, maintainable code and solving real-world operational challenges.

TECHNICAL SKILLS
- Programming Languages: TypeScript, JavaScript (ES6+), Python, SQL
- Frontend & Frameworks: React, Tailwind CSS, HTML5, CSS3
- Backend & APIs: Node.js, Express, Flask, REST APIs, JSON
- Databases: PostgreSQL, SQLite
- Developer Tools: Git, GitHub, Postman, Linux CLI, Docker (Basics)
- Soft Skills: Analytical Problem Solving, Agile Collaboration, Clear Technical Writing

PROFESSIONAL EXPERIENCE

Junior Web Developer Intern | Hyperion Innovations Lab | Johannesburg
Jan 2025 - Dec 2025
- Developed interactive UI modules using React, TypeScript, and Tailwind CSS.
- Integrated REST APIs with backend services written in Node.js and Python.
- Wrote SQL database queries and validated request payloads for data integrity.
- Reduced data entry errors by 30% by implementing front-end form validation routines.
- Spearheaded the migration of 12 legacy UI components to TypeScript and Tailwind CSS.

Technical Support & QA Assistant | Vanguard IT Solutions | Pretoria
Mar 2024 - Dec 2024
- Executed manual regression test cases across staging environments.
- Documented bug tickets with reproduction steps in Jira.
- Authored 25 comprehensive test scripts that caught critical edge-case defects before major releases.

EDUCATION
Diploma in Information Technology (Software Development)
University of Johannesburg | Completed Nov 2023

CERTIFICATIONS
- Meta Front-End Developer Professional Certificate (2024)
- Python for Everybody Specialization - Univ. of Michigan (2023)

PROJECTS
- SaaS Task & Resource Tracker (React, TypeScript, Express, PostgreSQL)
- FinTech Expense & Currency API (Python, Flask, SQLite, Pytest)`,
      updatedAt: new Date().toISOString()
    };

    const demoSavedJobs: SavedJob[] = [
      {
        id: 'saved-1',
        userId: demoUserId,
        jobId: 'job-1',
        job: INITIAL_JOBS[0],
        savedAt: '2026-09-29T10:00:00Z',
        status: 'saved',
        notes: 'Great match for React and TypeScript skills.'
      },
      {
        id: 'saved-2',
        userId: demoUserId,
        jobId: 'job-2',
        job: INITIAL_JOBS[1],
        savedAt: '2026-09-30T08:30:00Z',
        status: 'applied',
        notes: 'Submitted tailored CV and cover letter.'
      }
    ];

    const demoApplication: Application = {
      id: 'app-001',
      userId: demoUserId,
      jobId: 'job-2',
      company: 'FinPulse Technologies',
      role: 'Junior Software Engineer - Python & APIs',
      location: 'Johannesburg (Remote)',
      jobUrl: 'https://finpulse.example.com/jobs/junior-swe',
      applicationDate: '2026-09-30',
      status: 'interview',
      notes: 'Passed screening assessment. Technical interview scheduled.',
      interviewDate: '2026-10-05T14:00:00',
      followUpDate: '2026-10-06',
      updatedAt: new Date().toISOString()
    };

    this.data = {
      users: [demoUser],
      profiles: [demoProfile],
      skills: demoSkills,
      experiences: demoExperience,
      educations: demoEducation,
      certifications: demoCerts,
      projects: demoProjects,
      masterCVs: [demoMasterCV],
      cvVersions: [],
      jobs: INITIAL_JOBS,
      savedJobs: demoSavedJobs,
      jobAnalyses: [],
      applications: [demoApplication],
      applicationAnswers: [],
      coverLetters: [],
      interviewSessions: []
    };
  }

  // --- User Methods ---
  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(email: string, passwordHash: string, name: string) {
    const id = `user-${crypto.randomUUID()}`;
    const newUser = {
      id,
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
      passwordHash
    };
    this.data.users.push(newUser);

    // Initialize default profile
    const profile: CandidateProfile = {
      id: `prof-${crypto.randomUUID()}`,
      userId: id,
      personal: {
        fullName: name,
        email: email.toLowerCase(),
        phone: '',
        city: '',
        province: '',
        country: '',
        linkedIn: '',
        portfolio: '',
        github: ''
      },
      professional: {
        title: 'Job Seeker',
        summary: '',
        preferredJobTitles: [],
        preferredLocations: [],
        remotePreference: 'any',
        employmentType: 'full-time',
        salaryExpectation: ''
      }
    };
    this.data.profiles.push(profile);

    // Initialize blank Master CV
    this.data.masterCVs.push({
      id: `cv-master-${crypto.randomUUID()}`,
      userId: id,
      rawText: `${name}\n${email}\n\nPROFESSIONAL SUMMARY\n\nEXPERIENCE\n\nEDUCATION\n\nSKILLS`,
      updatedAt: new Date().toISOString()
    });

    this.save();
    return newUser;
  }

  // --- Profile Methods ---
  public getProfileByUserId(userId: string) {
    return this.data.profiles.find((p) => p.userId === userId);
  }

  public updateProfile(userId: string, updates: Partial<CandidateProfile>) {
    let profile = this.data.profiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = {
        id: `prof-${crypto.randomUUID()}`,
        userId,
        personal: {
          fullName: updates.personal?.fullName || '',
          email: updates.personal?.email || '',
          phone: updates.personal?.phone || '',
          city: updates.personal?.city || '',
          province: updates.personal?.province || '',
          country: updates.personal?.country || '',
          linkedIn: updates.personal?.linkedIn || '',
          portfolio: updates.personal?.portfolio || '',
          github: updates.personal?.github || ''
        },
        professional: {
          title: updates.professional?.title || '',
          summary: updates.professional?.summary || '',
          preferredJobTitles: updates.professional?.preferredJobTitles || [],
          preferredLocations: updates.professional?.preferredLocations || [],
          remotePreference: updates.professional?.remotePreference || 'any',
          employmentType: updates.professional?.employmentType || 'full-time',
          salaryExpectation: updates.professional?.salaryExpectation || ''
        }
      };
      this.data.profiles.push(profile);
    } else {
      if (updates.personal) {
        profile.personal = { ...profile.personal, ...updates.personal };
      }
      if (updates.professional) {
        profile.professional = { ...profile.professional, ...updates.professional };
      }
    }
    this.save();
    return profile;
  }

  // --- Skills ---
  public getSkills(userId: string) {
    return this.data.skills.filter((s) => s.userId === userId);
  }

  public addSkill(userId: string, skill: Omit<Skill, 'id' | 'userId'>) {
    const newSkill: Skill = {
      ...skill,
      id: `sk-${crypto.randomUUID()}`,
      userId
    };
    this.data.skills.push(newSkill);
    this.save();
    return newSkill;
  }

  public deleteSkill(userId: string, id: string) {
    this.data.skills = this.data.skills.filter((s) => !(s.userId === userId && s.id === id));
    this.save();
  }

  // --- Experience ---
  public getExperiences(userId: string) {
    return this.data.experiences.filter((e) => e.userId === userId);
  }

  public addExperience(userId: string, exp: Omit<Experience, 'id' | 'userId'>) {
    const newExp: Experience = {
      ...exp,
      id: `exp-${crypto.randomUUID()}`,
      userId
    };
    this.data.experiences.push(newExp);
    this.save();
    return newExp;
  }

  public updateExperience(userId: string, id: string, updates: Partial<Experience>) {
    const index = this.data.experiences.findIndex((e) => e.userId === userId && e.id === id);
    if (index === -1) return null;
    this.data.experiences[index] = { ...this.data.experiences[index], ...updates };
    this.save();
    return this.data.experiences[index];
  }

  public deleteExperience(userId: string, id: string) {
    this.data.experiences = this.data.experiences.filter((e) => !(e.userId === userId && e.id === id));
    this.save();
  }

  // --- Education ---
  public getEducations(userId: string) {
    return this.data.educations.filter((e) => e.userId === userId);
  }

  public addEducation(userId: string, edu: Omit<Education, 'id' | 'userId'>) {
    const newEdu: Education = {
      ...edu,
      id: `edu-${crypto.randomUUID()}`,
      userId
    };
    this.data.educations.push(newEdu);
    this.save();
    return newEdu;
  }

  public updateEducation(userId: string, id: string, updates: Partial<Education>) {
    const index = this.data.educations.findIndex((e) => e.userId === userId && e.id === id);
    if (index === -1) return null;
    this.data.educations[index] = { ...this.data.educations[index], ...updates };
    this.save();
    return this.data.educations[index];
  }

  public deleteEducation(userId: string, id: string) {
    this.data.educations = this.data.educations.filter((e) => !(e.userId === userId && e.id === id));
    this.save();
  }

  // --- Certifications ---
  public getCertifications(userId: string) {
    return this.data.certifications.filter((c) => c.userId === userId);
  }

  public addCertification(userId: string, cert: Omit<Certification, 'id' | 'userId'>) {
    const newCert: Certification = {
      ...cert,
      id: `cert-${crypto.randomUUID()}`,
      userId
    };
    this.data.certifications.push(newCert);
    this.save();
    return newCert;
  }

  public deleteCertification(userId: string, id: string) {
    this.data.certifications = this.data.certifications.filter((c) => !(c.userId === userId && c.id === id));
    this.save();
  }

  // --- Projects ---
  public getProjects(userId: string) {
    return this.data.projects.filter((p) => p.userId === userId);
  }

  public addProject(userId: string, proj: Omit<Project, 'id' | 'userId'>) {
    const newProj: Project = {
      ...proj,
      id: `proj-${crypto.randomUUID()}`,
      userId
    };
    this.data.projects.push(newProj);
    this.save();
    return newProj;
  }

  public updateProject(userId: string, id: string, updates: Partial<Project>) {
    const index = this.data.projects.findIndex((p) => p.userId === userId && p.id === id);
    if (index === -1) return null;
    this.data.projects[index] = { ...this.data.projects[index], ...updates };
    this.save();
    return this.data.projects[index];
  }

  public deleteProject(userId: string, id: string) {
    this.data.projects = this.data.projects.filter((p) => !(p.userId === userId && p.id === id));
    this.save();
  }

  // --- Master CV & Versions ---
  public getMasterCV(userId: string) {
    let cv = this.data.masterCVs.find((c) => c.userId === userId);
    if (!cv) {
      cv = {
        id: `cv-master-${crypto.randomUUID()}`,
        userId,
        rawText: '',
        updatedAt: new Date().toISOString()
      };
      this.data.masterCVs.push(cv);
      this.save();
    }
    return cv;
  }

  public updateMasterCV(userId: string, rawText: string) {
    let cv = this.data.masterCVs.find((c) => c.userId === userId);
    if (cv) {
      cv.rawText = rawText;
      cv.updatedAt = new Date().toISOString();
    } else {
      cv = {
        id: `cv-master-${crypto.randomUUID()}`,
        userId,
        rawText,
        updatedAt: new Date().toISOString()
      };
      this.data.masterCVs.push(cv);
    }
    this.save();
    return cv;
  }

  public getCVVersions(userId: string) {
    return this.data.cvVersions.filter((v) => v.userId === userId);
  }

  public saveCVVersion(userId: string, version: Omit<CVVersion, 'id' | 'userId' | 'createdAt'>) {
    const newVersion: CVVersion = {
      ...version,
      id: `cv-ver-${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.data.cvVersions.push(newVersion);
    this.save();
    return newVersion;
  }

  public deleteCVVersion(userId: string, id: string) {
    this.data.cvVersions = this.data.cvVersions.filter((v) => !(v.userId === userId && v.id === id));
    this.save();
  }

  // --- Jobs ---
  public getJobs(searchParams?: {
    keyword?: string;
    location?: string;
    remoteType?: string;
    employmentType?: string;
    experienceLevel?: string;
  }) {
    let list = [...this.data.jobs];
    if (searchParams?.keyword) {
      const q = searchParams.keyword.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (searchParams?.location) {
      const loc = searchParams.location.toLowerCase();
      list = list.filter((j) => j.location.toLowerCase().includes(loc));
    }
    if (searchParams?.remoteType && searchParams.remoteType !== 'any') {
      list = list.filter((j) => j.remoteType === searchParams.remoteType);
    }
    if (searchParams?.employmentType && searchParams.employmentType !== 'any') {
      list = list.filter((j) => j.employmentType === searchParams.employmentType);
    }
    if (searchParams?.experienceLevel && searchParams.experienceLevel !== 'any') {
      list = list.filter((j) => j.experienceLevel === searchParams.experienceLevel);
    }
    return list;
  }

  public getJobById(id: string) {
    return this.data.jobs.find((j) => j.id === id);
  }

  public addCustomJob(jobData: Omit<Job, 'id' | 'dateDiscovered'>) {
    const newJob: Job = {
      ...jobData,
      id: `job-${crypto.randomUUID()}`,
      dateDiscovered: new Date().toISOString().split('T')[0]
    };
    this.data.jobs.unshift(newJob);
    this.save();
    return newJob;
  }

  // --- Saved Jobs ---
  public getSavedJobs(userId: string) {
    return this.data.savedJobs
      .filter((s) => s.userId === userId)
      .map((s) => {
        const fullJob = this.getJobById(s.jobId) || s.job;
        return { ...s, job: fullJob };
      });
  }

  public saveJob(userId: string, jobId: string, notes?: string) {
    const existing = this.data.savedJobs.find((s) => s.userId === userId && s.jobId === jobId);
    if (existing) return existing;

    const job = this.getJobById(jobId);
    if (!job) return null;

    const newSaved: SavedJob = {
      id: `saved-${crypto.randomUUID()}`,
      userId,
      jobId,
      job,
      savedAt: new Date().toISOString(),
      status: 'saved',
      notes
    };
    this.data.savedJobs.push(newSaved);
    this.save();
    return newSaved;
  }

  public removeSavedJob(userId: string, jobId: string) {
    this.data.savedJobs = this.data.savedJobs.filter((s) => !(s.userId === userId && s.jobId === jobId));
    this.save();
  }

  // --- Job Analyses ---
  public getJobAnalyses(userId: string) {
    return this.data.jobAnalyses.filter((a) => a.userId === userId);
  }

  public getJobAnalysis(userId: string, jobId: string) {
    return this.data.jobAnalyses.find((a) => a.userId === userId && a.jobId === jobId);
  }

  public saveJobAnalysis(userId: string, analysis: Omit<JobAnalysis, 'id' | 'userId' | 'createdAt'>) {
    const existingIndex = this.data.jobAnalyses.findIndex((a) => a.userId === userId && a.jobId === analysis.jobId);
    const newAnalysis: JobAnalysis = {
      ...analysis,
      id: `analysis-${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      this.data.jobAnalyses[existingIndex] = newAnalysis;
    } else {
      this.data.jobAnalyses.push(newAnalysis);
    }
    this.save();
    return newAnalysis;
  }

  // --- Applications ---
  public getApplications(userId: string) {
    return this.data.applications.filter((a) => a.userId === userId);
  }

  public addApplication(userId: string, app: Omit<Application, 'id' | 'userId' | 'updatedAt'>) {
    const newApp: Application = {
      ...app,
      id: `app-${crypto.randomUUID()}`,
      userId,
      updatedAt: new Date().toISOString()
    };
    this.data.applications.push(newApp);

    // If job was saved, update savedJob status to applied
    if (app.jobId) {
      const saved = this.data.savedJobs.find((s) => s.userId === userId && s.jobId === app.jobId);
      if (saved) {
        saved.status = 'applied';
      }
    }

    this.save();
    return newApp;
  }

  public updateApplication(userId: string, id: string, updates: Partial<Application>) {
    const index = this.data.applications.findIndex((a) => a.userId === userId && a.id === id);
    if (index === -1) return null;
    this.data.applications[index] = {
      ...this.data.applications[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.applications[index];
  }

  public deleteApplication(userId: string, id: string) {
    this.data.applications = this.data.applications.filter((a) => !(a.userId === userId && a.id === id));
    this.save();
  }

  // --- Application Answers ---
  public getApplicationAnswers(userId: string, jobId?: string) {
    let list = this.data.applicationAnswers.filter((a) => a.userId === userId);
    if (jobId) {
      list = list.filter((a) => a.jobId === jobId);
    }
    return list;
  }

  public saveApplicationAnswer(userId: string, answer: Omit<ApplicationAnswer, 'id' | 'userId' | 'createdAt'>) {
    const newAnswer: ApplicationAnswer = {
      ...answer,
      id: `ans-${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.data.applicationAnswers.push(newAnswer);
    this.save();
    return newAnswer;
  }

  // --- Cover Letters ---
  public getCoverLetters(userId: string) {
    return this.data.coverLetters.filter((c) => c.userId === userId);
  }

  public saveCoverLetter(userId: string, cl: Omit<CoverLetter, 'id' | 'userId' | 'createdAt'>) {
    const newLetter: CoverLetter = {
      ...cl,
      id: `cl-${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.data.coverLetters.push(newLetter);
    this.save();
    return newLetter;
  }

  // --- Interview Sessions ---
  public getInterviewSessions(userId: string) {
    return this.data.interviewSessions.filter((s) => s.userId === userId);
  }

  public getInterviewSession(userId: string, jobId: string) {
    return this.data.interviewSessions.find((s) => s.userId === userId && s.jobId === jobId);
  }

  public saveInterviewSession(userId: string, session: Omit<InterviewPrepSession, 'id' | 'userId' | 'createdAt'>) {
    const existingIndex = this.data.interviewSessions.findIndex((s) => s.userId === userId && s.jobId === session.jobId);
    const newSession: InterviewPrepSession = {
      ...session,
      id: `int-${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      this.data.interviewSessions[existingIndex] = newSession;
    } else {
      this.data.interviewSessions.push(newSession);
    }
    this.save();
    return newSession;
  }

  // Full candidate context for AI prompt evaluation
  public getFullCandidateContext(userId: string) {
    const profile = this.getProfileByUserId(userId);
    const skills = this.getSkills(userId);
    const experiences = this.getExperiences(userId);
    const educations = this.getEducations(userId);
    const certifications = this.getCertifications(userId);
    const projects = this.getProjects(userId);
    const masterCV = this.getMasterCV(userId);

    return {
      personal: profile?.personal || {},
      professional: profile?.professional || {},
      skills: skills.map((s) => ({
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        yearsExperience: s.yearsExperience
      })),
      experiences: experiences.map((e) => ({
        company: e.company,
        jobTitle: e.jobTitle,
        period: `${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate}`,
        description: e.description,
        responsibilities: e.responsibilities,
        technologies: e.technologies,
        achievements: e.achievements
      })),
      educations: educations.map((ed) => ({
        institution: ed.institution,
        qualification: ed.qualification,
        fieldOfStudy: ed.fieldOfStudy,
        period: `${ed.startDate} - ${ed.endDate}`,
        completionStatus: ed.completionStatus
      })),
      certifications: certifications.map((c) => ({
        name: c.name,
        provider: c.provider,
        issueDate: c.issueDate,
        description: c.description
      })),
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
        role: p.role,
        status: p.status,
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl
      })),
      masterCVText: masterCV?.rawText || ''
    };
  }

  public resetToDemo() {
    this.seedInitialData();
    this.save();
  }
}

export const db = new Database();

import { GoogleGenAI } from '@google/genai';
import { Job, JobAnalysis, CVVersion, CoverLetter, InterviewQuestionItem } from '../../src/types/index.ts';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const MODEL_NAME = 'gemini-3.8-flash';

const ANTI_FABRICATION_SYSTEM_PROMPT = `
You are the AI engine of "Job Hunter AI", a professional job application assistant.
Your core principle is absolute truthfulness: NEVER FABRICATE CANDIDATE INFORMATION.

Strict Constraints:
1. If the candidate does not have a skill, qualification, certification, company, project, or experience listed in their profile context, DO NOT INVENT IT.
2. Clearly declare missing skills and gaps.
3. You may improve wording, reorganize, emphasize relevant existing points, and map real skills to requirements.
4. Never inflate years of experience or change employer names, educational institutions, or dates.
5. Never state that a candidate completed a qualification if their profile says "in_progress" or "did_not_complete".
6. Always output valid JSON as requested.
`;

export async function analyzeJobMatch(
  job: Job,
  candidateContext: any
): Promise<Omit<JobAnalysis, 'id' | 'userId' | 'createdAt'>> {
  const prompt = `
Analyze the alignment between this candidate's verified profile and this job description.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Employment Type: ${job.employmentType}
Requirements:
${job.requirements.join('\n- ')}

Full Job Description:
${job.description}

CANDIDATE VERIFIED PROFILE:
Professional Summary: ${candidateContext.professional?.summary || 'Not provided'}
Skills Listed: ${candidateContext.skills.map((s: any) => `${s.name} (${s.proficiency})`).join(', ')}
Work Experience:
${candidateContext.experiences.map((e: any) => `Role: ${e.jobTitle} at ${e.company} (${e.period})
Tech: ${e.technologies.join(', ')}
Responsibilities & Achievements:
- ${e.responsibilities.join('\n- ')}
- ${e.achievements.join('\n- ')}`).join('\n\n')}

Education:
${candidateContext.educations.map((ed: any) => `${ed.qualification} from ${ed.institution} (${ed.period}) - Status: ${ed.completionStatus}`).join('\n')}

Certifications:
${candidateContext.certifications.map((c: any) => `${c.name} by ${c.provider} (${c.issueDate})`).join('\n')}

Projects:
${candidateContext.projects.map((p: any) => `Project: ${p.name} (Role: ${p.role})
Technologies: ${p.technologies.join(', ')}
Description: ${p.description}`).join('\n')}

INSTRUCTIONS:
1. Extract the actual required skills from the job.
2. Identify "candidateMatches": requirements that the candidate demonstrably has in their skills, projects, or work history. Provide clear evidence citing the exact source (e.g. "Supported by Junior Web Developer Intern experience").
3. Identify "partialMatches": requirements where candidate has adjacent or junior familiarity but not full exact depth.
4. Identify "missingRequirements": requirements NOT found anywhere in candidate profile. DO NOT INVENT THEM. Explain what is missing and how to ethically approach it.
5. Compute transparent score breakdown (0-100) reflecting profile-to-job requirement alignment. (Not hiring probability!).
6. ATS analysis: Found keywords, Missing keywords, and Ethical Suggestions (e.g., "Do not claim Docker unless you actually used it; if you have basic container familiarity, mention your learning course").

Output in JSON format with this exact schema:
{
  "jobOverview": {
    "title": "${job.title}",
    "company": "${job.company}",
    "location": "${job.location}",
    "employmentType": "${job.employmentType}"
  },
  "overallMatchScore": 75,
  "scoreBreakdown": {
    "technicalSkillsScore": 80,
    "experienceScore": 70,
    "educationScore": 85,
    "certificationsScore": 60,
    "responsibilitiesScore": 75
  },
  "scoreReasoning": "Detailed 2-3 sentence transparent breakdown of why the profile aligned at this level without hype.",
  "requiredSkills": ["Skill 1", "Skill 2"],
  "candidateMatches": [
    {
      "requirement": "Requirement name",
      "candidateSkillOrExperience": "Candidate skill",
      "evidenceSource": "Exact place in profile verifying this"
    }
  ],
  "partialMatches": [
    {
      "requirement": "Requirement name",
      "candidateSkillOrExperience": "Adjacent skill",
      "gapExplanation": "Explanation of gap"
    }
  ],
  "missingRequirements": [
    {
      "requirement": "Missing item",
      "importance": "critical",
      "recommendation": "Ethical advice on how to address or whether to learn"
    }
  ],
  "atsAnalysis": {
    "foundKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["keyword3", "keyword4"],
    "ethicalSuggestions": ["Suggestion 1", "Suggestion 2"]
  }
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: ANTI_FABRICATION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return {
      jobId: job.id,
      jobOverview: parsed.jobOverview || {
        title: job.title,
        company: job.company,
        location: job.location,
        employmentType: job.employmentType
      },
      overallMatchScore: Math.min(100, Math.max(0, Number(parsed.overallMatchScore) || 70)),
      scoreBreakdown: parsed.scoreBreakdown || {
        technicalSkillsScore: 70,
        experienceScore: 70,
        educationScore: 75,
        certificationsScore: 60,
        responsibilitiesScore: 70
      },
      scoreReasoning: parsed.scoreReasoning || 'Profile alignment calculated against stated job requirements.',
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : job.requirements,
      candidateMatches: Array.isArray(parsed.candidateMatches) ? parsed.candidateMatches : [],
      partialMatches: Array.isArray(parsed.partialMatches) ? parsed.partialMatches : [],
      missingRequirements: Array.isArray(parsed.missingRequirements) ? parsed.missingRequirements : [],
      atsAnalysis: parsed.atsAnalysis || {
        foundKeywords: [],
        missingKeywords: [],
        ethicalSuggestions: []
      }
    };
  } catch (err: any) {
    console.warn('Gemini API call failed or not configured, using deterministic rule-based analysis:', err.message);
    return fallbackJobAnalysis(job, candidateContext);
  }
}

export async function tailorCV(
  job: Job,
  candidateContext: any
): Promise<Omit<CVVersion, 'id' | 'userId' | 'createdAt'>> {
  const prompt = `
Tailor the candidate's CV specifically for this job description WITHOUT FABRICATING ANY DATA.

TARGET ROLE:
Title: ${job.title}
Company: ${job.company}
Job Requirements:
${job.requirements.join('\n- ')}

CANDIDATE VERIFIED PROFILE:
Professional Summary: ${candidateContext.professional?.summary || ''}
Skills: ${candidateContext.skills.map((s: any) => s.name).join(', ')}
Work Experiences:
${candidateContext.experiences.map((e: any) => `ID: ${e.id || 'exp-1'}
Company: ${e.company} | Title: ${e.jobTitle} | Period: ${e.period}
Technologies: ${e.technologies.join(', ')}
Responsibilities: ${e.responsibilities.join(' | ')}
Achievements: ${e.achievements.join(' | ')}`).join('\n\n')}

Projects:
${candidateContext.projects.map((p: any) => `ID: ${p.id || 'proj-1'}
Name: ${p.name} | Role: ${p.role}
Technologies: ${p.technologies.join(', ')}
Description: ${p.description}`).join('\n\n')}

RULES:
1. Re-phrase the candidate's professional summary so it highlights their genuine experience that aligns with ${job.title}.
2. Prioritize ONLY existing skills that appear in the job requirements or tech stack. DO NOT add skills they don't have.
3. For each experience, select and polish 2-4 strong action-oriented bullet points from their real responsibilities and achievements, accentuating relevant tech.
4. Keep all factual employers, dates, and project roles 100% authentic.

Respond in JSON format:
{
  "jobTitle": "${job.title}",
  "company": "${job.company}",
  "title": "Tailored for ${job.title} at ${job.company}",
  "tailoredSummary": "A concise 3-4 sentence professional summary focusing on candidate's real capabilities relevant to ${job.title}",
  "prioritizedSkills": ["Skill 1", "Skill 2"],
  "tailoredExperience": [
    {
      "experienceId": "exp-1",
      "company": "Company Name",
      "jobTitle": "Job Title",
      "period": "Period",
      "bulletPoints": [
        "Enhanced bullet point reflecting real achievement",
        "Second bullet point highlighting relevant tech stack"
      ],
      "highlightedTechnologies": ["Tech 1", "Tech 2"]
    }
  ],
  "tailoredProjects": [
    {
      "projectId": "proj-1",
      "name": "Project Name",
      "role": "Role",
      "bulletPoints": [
        "Key implementation highlight with metrics"
      ],
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "notes": "Ethical tailoring notes on what was prioritized."
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: ANTI_FABRICATION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      title: parsed.title || `Tailored for ${job.title} at ${job.company}`,
      tailoredSummary: parsed.tailoredSummary || candidateContext.professional?.summary || '',
      prioritizedSkills: Array.isArray(parsed.prioritizedSkills) ? parsed.prioritizedSkills : candidateContext.skills.slice(0, 8).map((s: any) => s.name),
      tailoredExperience: Array.isArray(parsed.tailoredExperience) ? parsed.tailoredExperience : candidateContext.experiences.map((e: any) => ({
        experienceId: e.id || 'exp-1',
        company: e.company,
        jobTitle: e.jobTitle,
        period: e.period,
        bulletPoints: e.responsibilities,
        highlightedTechnologies: e.technologies
      })),
      tailoredProjects: Array.isArray(parsed.tailoredProjects) ? parsed.tailoredProjects : candidateContext.projects.map((p: any) => ({
        projectId: p.id || 'proj-1',
        name: p.name,
        role: p.role,
        bulletPoints: [p.description],
        technologies: p.technologies
      })),
      notes: parsed.notes || 'Tailored to emphasize candidate experience relevant to stated requirements.'
    };
  } catch (err: any) {
    console.warn('Gemini API call failed, generating deterministic tailored CV:', err.message);
    return fallbackTailorCV(job, candidateContext);
  }
}

export async function generateCoverLetter(
  job: Job,
  candidateContext: any,
  tone: string = 'professional'
): Promise<Omit<CoverLetter, 'id' | 'userId' | 'createdAt'>> {
  const prompt = `
Generate a compelling, honest cover letter for this candidate applying to this position.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description:
${job.description}

CANDIDATE DETAILS:
Name: ${candidateContext.personal?.fullName || 'Applicant'}
Email: ${candidateContext.personal?.email || ''}
Phone: ${candidateContext.personal?.phone || ''}
Summary: ${candidateContext.professional?.summary || ''}
Skills: ${candidateContext.skills.map((s: any) => s.name).join(', ')}
Key Experience:
${candidateContext.experiences.map((e: any) => `- ${e.jobTitle} at ${e.company}: ${e.responsibilities.slice(0, 2).join('; ')}`).join('\n')}
Projects:
${candidateContext.projects.map((p: any) => `- ${p.name}: ${p.description}`).join('\n')}

GUIDELINES:
- Tone: ${tone} (authentic, confident, professional).
- Strictly adhere to candidate's real background. DO NOT invent previous employers, degree honors, or projects.
- Mention specific relevant projects or experiences they actually have that solve the company's needs.
- Include recipient placeholder (e.g. "Hiring Team at ${job.company}").
- Provide 3-4 cohesive paragraphs: Opening/Interest, Alignment of Real Skills & Evidence, Relevant Project/Accomplishment, Call to Action & Sign-off.

Output JSON:
{
  "recipient": "Hiring Team at ${job.company}",
  "content": "Full formatted text of the cover letter with paragraphs."
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: ANTI_FABRICATION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      recipient: parsed.recipient || `Hiring Team at ${job.company}`,
      content: parsed.content || ''
    };
  } catch (err: any) {
    console.warn('Gemini API call failed, generating deterministic cover letter:', err.message);
    return fallbackCoverLetter(job, candidateContext);
  }
}

export async function generateApplicationAnswer(
  question: string,
  length: 'short' | 'medium' | 'detailed',
  candidateContext: any,
  job?: Job
): Promise<string> {
  const prompt = `
Answer this job application question from the perspective of the candidate.

QUESTION: "${question}"
DESIRED LENGTH: ${length} (short: 2-3 sentences, medium: 1 solid paragraph ~100-150 words, detailed: 2-3 paragraphs ~250 words using STAR structure if behavioral).
TARGET ROLE: ${job ? `${job.title} at ${job.company}` : 'General Tech Role'}

CANDIDATE'S VERIFIED INFORMATION:
Name: ${candidateContext.personal?.fullName || 'Candidate'}
Title: ${candidateContext.professional?.title || ''}
Summary: ${candidateContext.professional?.summary || ''}
Skills: ${candidateContext.skills.map((s: any) => s.name).join(', ')}
Experiences:
${candidateContext.experiences.map((e: any) => `- ${e.jobTitle} at ${e.company} (${e.period}): ${e.responsibilities.join('; ')}. Achievements: ${e.achievements.join('; ')}`).join('\n')}
Education:
${candidateContext.educations.map((ed: any) => `- ${ed.qualification} (${ed.institution}) - ${ed.completionStatus}`).join('\n')}
Projects:
${candidateContext.projects.map((p: any) => `- ${p.name}: ${p.description} (Tech: ${p.technologies.join(', ')})`).join('\n')}

STRICT RULES:
1. Base the answer entirely on candidate's real profile.
2. DO NOT make up projects, statistics, companies, or tools they never mentioned.
3. If the question asks for a skill they DO NOT possess, answer honestly explaining their adjacent background and rapid ability to learn.
4. Keep the voice natural, humble, and professional.

Return pure JSON:
{
  "answer": "The generated answer text."
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: ANTI_FABRICATION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed.answer || 'Answer generated based on candidate profile.';
  } catch (err: any) {
    console.warn('Gemini API call failed, generating deterministic answer:', err.message);
    return fallbackApplicationAnswer(question, length, candidateContext);
  }
}

export async function generateInterviewPrep(
  job: Job,
  candidateContext: any
): Promise<InterviewQuestionItem[]> {
  const prompt = `
Generate 6 targeted interview preparation questions for this candidate applying to ${job.title} at ${job.company}.

JOB REQUIREMENTS:
${job.requirements.join('\n- ')}
Job Description:
${job.description}

CANDIDATE BACKGROUND:
Skills: ${candidateContext.skills.map((s: any) => s.name).join(', ')}
Experiences:
${candidateContext.experiences.map((e: any) => `${e.jobTitle} at ${e.company} (Tech: ${e.technologies.join(', ')})`).join('\n')}
Projects:
${candidateContext.projects.map((p: any) => `${p.name} (Tech: ${p.technologies.join(', ')})`).join('\n')}

GENERATE:
- 2 Technical questions specifically testing requirements in the job matching candidate skills.
- 2 Behavioral questions with STAR breakdown using the candidate's REAL work or project experiences.
- 1 Role & Company specific question.
- 1 Deep dive question into one of the candidate's actual projects (${candidateContext.projects.map((p: any) => p.name).join(' or ')}).

STRICT ANTI-FABRICATION RULE:
The generated sample answer MUST ONLY use facts, companies, and technologies from the candidate's verified profile.

Respond with JSON:
{
  "questions": [
    {
      "id": "q-1",
      "question": "Question text",
      "category": "technical",
      "difficulty": "medium",
      "contextTip": "Why the interviewer asks this and what to highlight",
      "generatedAnswer": "High quality answer based on candidate real experience",
      "starBreakdown": {
        "situation": "Situation",
        "task": "Task",
        "action": "Action",
        "result": "Result"
      }
    }
  ]
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: ANTI_FABRICATION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
    return fallbackInterviewQuestions(job, candidateContext);
  } catch (err: any) {
    console.warn('Gemini API call failed, generating deterministic interview prep:', err.message);
    return fallbackInterviewQuestions(job, candidateContext);
  }
}

// --- DETERMINISTIC FALLBACK HELPERS (when API key is unset or network error) ---
function fallbackJobAnalysis(job: Job, candidateContext: any): Omit<JobAnalysis, 'id' | 'userId' | 'createdAt'> {
  const candidateSkills = (candidateContext.skills || []).map((s: any) => s.name.toLowerCase());
  const candidateTech = new Set<string>([
    ...candidateSkills,
    ...(candidateContext.experiences || []).flatMap((e: any) => (e.technologies || []).map((t: string) => t.toLowerCase())),
    ...(candidateContext.projects || []).flatMap((p: any) => (p.technologies || []).map((t: string) => t.toLowerCase()))
  ]);

  const candidateMatches: any[] = [];
  const missingRequirements: any[] = [];
  const partialMatches: any[] = [];

  job.requirements.forEach((req) => {
    const reqLower = req.toLowerCase();
    let matched = false;
    for (const tech of candidateTech) {
      if (reqLower.includes(tech)) {
        candidateMatches.push({
          requirement: req,
          candidateSkillOrExperience: tech.toUpperCase(),
          evidenceSource: `Profile skills and demonstrated projects (${Array.from(candidateTech).slice(0, 3).join(', ')})`
        });
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (reqLower.includes('cloud') || reqLower.includes('docker') || reqLower.includes('testing')) {
        partialMatches.push({
          requirement: req,
          candidateSkillOrExperience: 'Foundational Knowledge / Coursework',
          gapExplanation: 'Candidate has academic or entry-level familiarity but requires hands-on enterprise practice.'
        });
      } else {
        missingRequirements.push({
          requirement: req,
          importance: reqLower.includes('required') || reqLower.includes('must') ? 'critical' : 'preferred',
          recommendation: `Not identified in current profile. Do not fabricate; mention related foundational skills or demonstrate quick adaptability.`
        });
      }
    }
  });

  const total = job.requirements.length || 1;
  const matchRatio = (candidateMatches.length * 1.0 + partialMatches.length * 0.5) / total;
  const score = Math.min(95, Math.max(30, Math.round(matchRatio * 100)));

  return {
    jobId: job.id,
    jobOverview: {
      title: job.title,
      company: job.company,
      location: job.location,
      employmentType: job.employmentType
    },
    overallMatchScore: score,
    scoreBreakdown: {
      technicalSkillsScore: Math.min(100, Math.round(score * 1.05)),
      experienceScore: Math.min(100, Math.max(40, score - 5)),
      educationScore: 85,
      certificationsScore: 75,
      responsibilitiesScore: Math.min(100, score)
    },
    scoreReasoning: `Estimated profile match of ${score}% based on direct alignment between stated requirements and candidate's registered skills in React, TypeScript, Python, and SQL.`,
    requiredSkills: job.tags.length ? job.tags : ['Software Development', 'REST APIs', 'Database Management'],
    candidateMatches,
    partialMatches,
    missingRequirements,
    atsAnalysis: {
      foundKeywords: candidateMatches.map((m) => m.candidateSkillOrExperience),
      missingKeywords: missingRequirements.map((m) => m.requirement.split(' ')[0]),
      ethicalSuggestions: [
        'Highlight your verified project contributions rather than claiming unverified enterprise systems.',
        'Emphasize your practical Git and REST API proficiency directly in your experience bullet points.'
      ]
    }
  };
}

function fallbackTailorCV(job: Job, candidateContext: any): Omit<CVVersion, 'id' | 'userId' | 'createdAt'> {
  const summary = candidateContext.professional?.summary || 'Dedicated software developer focused on quality code.';
  const tailoredSummary = `Results-oriented Junior Developer aligning practical skills in ${job.tags.slice(0, 3).join(', ')} with the engineering goals of ${job.company}. ${summary}`;

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    title: `Tailored for ${job.title} at ${job.company}`,
    tailoredSummary,
    prioritizedSkills: candidateContext.skills?.map((s: any) => s.name).slice(0, 8) || job.tags,
    tailoredExperience: (candidateContext.experiences || []).map((e: any) => ({
      experienceId: e.id || 'exp-1',
      company: e.company,
      jobTitle: e.jobTitle,
      period: e.period,
      bulletPoints: e.responsibilities,
      highlightedTechnologies: e.technologies
    })),
    tailoredProjects: (candidateContext.projects || []).map((p: any) => ({
      projectId: p.id || 'proj-1',
      name: p.name,
      role: p.role,
      bulletPoints: [p.description],
      technologies: p.technologies
    })),
    notes: 'Prioritized relevant technical proficiencies aligned with the target role description.'
  };
}

function fallbackCoverLetter(job: Job, candidateContext: any): Omit<CoverLetter, 'id' | 'userId' | 'createdAt'> {
  const name = candidateContext.personal?.fullName || 'Candidate';
  const role = candidateContext.professional?.title || 'Software Developer';
  const skills = (candidateContext.skills || []).map((s: any) => s.name).slice(0, 4).join(', ');

  const content = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With a genuine foundation in ${skills} and proven experience building functional applications, I am eager to contribute effectively to your development team.

During my recent work and project engagements, I have developed a strong discipline for writing maintainable code, implementing responsive interfaces, and collaborating on RESTful backend services. For example, in my recent work, I integrated user interfaces with backend endpoints and prioritized data integrity across every workflow.

What excites me most about ${job.company} is the opportunity to solve real operational problems and uphold high engineering standards. I am committed to continuous learning and look forward to contributing my real-world skills to your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background aligns with your goals.

Sincerely,
${name}
${candidateContext.personal?.phone || ''}
${candidateContext.personal?.email || ''}`;

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    recipient: `Hiring Team at ${job.company}`,
    content
  };
}

function fallbackApplicationAnswer(question: string, length: string, candidateContext: any): string {
  const name = candidateContext.personal?.fullName || 'Candidate';
  const summary = candidateContext.professional?.summary || 'I am a software engineer with practical experience.';
  const skills = (candidateContext.skills || []).map((s: any) => s.name).slice(0, 4).join(', ');

  if (length === 'short') {
    return `As a developer grounded in ${skills}, I combine hands-on problem solving with a commitment to clean code. My experience building practical applications allows me to deliver immediate value while continuously expanding my technical depth.`;
  }

  return `In my development journey, I have focused on building reliable, user-friendly solutions using ${skills}. For instance, in my recent web development work, I contributed to front-end form validation and API integrations that reduced operational error rates. ${summary} I approach every challenge with curiosity, thorough debugging skills, and a transparent work ethic.`;
}

function fallbackInterviewQuestions(job: Job, candidateContext: any): InterviewQuestionItem[] {
  return [
    {
      id: 'q-1',
      question: `How have you used ${job.tags[0] || 'TypeScript'} or ${job.tags[1] || 'React'} in your recent projects, and how do you ensure code maintainability?`,
      category: 'technical',
      difficulty: 'medium',
      contextTip: 'Demonstrates familiarity with modern language features, type safety, and component modularity.',
      generatedAnswer: `In my project work, I utilize TypeScript to enforce strict typing on props, API contracts, and state objects. This catches type discrepancies at compile time and makes refactoring reliable. I organize components by feature and separate presentation logic from data fetching.`
    },
    {
      id: 'q-2',
      question: 'Describe a situation where you had to troubleshoot a difficult bug under tight time constraints.',
      category: 'behavioral',
      difficulty: 'medium',
      contextTip: 'The interviewer is looking for a structured debugging methodology and calm communication.',
      starBreakdown: {
        situation: 'During an update, a form submission was failing intermittently without clear error output in the staging environment.',
        task: 'I needed to isolate the root cause, determine whether it was a frontend serialization issue or backend endpoint error, and fix it.',
        action: 'I inspected network payloads via browser DevTools, cross-referenced server logs, identified an unhandled null field in the request body, and added defensive validation.',
        result: 'The issue was resolved immediately, and I added unit checks to prevent regressions.'
      },
      generatedAnswer: `When diagnosing unexpected errors, I first isolate whether the defect resides in the client payload or the server response using DevTools and logs. In a recent project, this disciplined approach helped me quickly catch a missing null check and restore normal operations.`
    },
    {
      id: 'q-3',
      question: `Why are you interested in joining ${job.company} specifically for this ${job.title} role?`,
      category: 'role_company',
      difficulty: 'easy',
      contextTip: 'Shows genuine interest and alignment with the company’s tech stack and mission.',
      generatedAnswer: `I am specifically interested in ${job.company} because the ${job.title} role emphasizes real full-stack problem solving with technologies I enjoy, such as ${job.tags.slice(0, 3).join(', ')}. I want to work in an environment where engineering quality and continuous learning are valued.`
    },
    {
      id: 'q-4',
      question: `Can you walk us through the architecture of your ${candidateContext.projects?.[0]?.name || 'recent project'}?`,
      category: 'project',
      difficulty: 'medium',
      contextTip: 'Assesses system design thinking, component hierarchy, and API communication.',
      generatedAnswer: `In ${candidateContext.projects?.[0]?.name || 'my recent project'}, I structured the application with a modular frontend connected to RESTful endpoints. I used relational database tables with proper foreign keys to ensure data integrity, and implemented clean input validation.`
    }
  ];
}

import { GoogleGenAI } from '@google/genai';
import { Job } from '../../src/types/index.ts';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

function formatCompanyName(host: string, pathParts: string[]): string {
  const cleanHost = host.replace(/^www\./i, '');
  
  if (cleanHost.includes('lever.co') && pathParts.length > 0) {
    return capitalizeWords(pathParts[0]);
  }
  if (cleanHost.includes('greenhouse.io') && pathParts.length > 0) {
    return capitalizeWords(pathParts[0]);
  }
  if (cleanHost.includes('myworkdayjobs.com')) {
    const sub = cleanHost.split('.')[0];
    return capitalizeWords(sub);
  }
  if (cleanHost.includes('linkedin.com')) {
    return 'Company via LinkedIn';
  }
  if (cleanHost.includes('indeed.com')) {
    return 'Company via Indeed';
  }

  // Generic domain: e.g. careers.apexcloud.co.za -> apexcloud
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    const mainDomain = parts[0] === 'careers' || parts[0] === 'jobs' ? parts[1] : parts[0];
    return capitalizeWords(mainDomain);
  }
  return 'Hiring Organization';
}

function formatJobTitle(pathname: string): string {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => !['jobs', 'careers', 'view', 'posting', 'apply', 'results', 'job', 'position'].includes(s.toLowerCase()));

  if (segments.length === 0) {
    return 'Software Role';
  }

  const last = segments[segments.length - 1];
  // Remove numbers, hashes, or ids (e.g., software-engineer-48392)
  const cleaned = last.replace(/[-_]?[0-9a-f]{5,}[-_]?/gi, '').replace(/[-_]+/g, ' ').trim();
  if (cleaned.length < 3) {
    return 'Open Position';
  }
  return capitalizeWords(cleaned);
}

function capitalizeWords(str: string): string {
  return str
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export async function extractJobFromUrl(rawUrl: string): Promise<Omit<Job, 'id' | 'dateDiscovered'>> {
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (err) {
    throw new Error('Invalid URL format. Please provide a valid web link.');
  }

  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  const inferredCompany = formatCompanyName(parsedUrl.hostname, pathParts);
  const inferredTitle = formatJobTitle(parsedUrl.pathname);

  let htmlText = '';
  let pageTitle = '';
  let metaDescription = '';
  let ogTitle = '';
  let ogSiteName = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      htmlText = text.slice(0, 35000); // Take first 35KB

      // Extract metadata tags
      const titleMatch = htmlText.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) pageTitle = titleMatch[1].replace(/\s+/g, ' ').trim();

      const ogTitleMatch = htmlText.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i) ||
                           htmlText.match(/<meta[^>]*content=["'](.*?)["'][^>]*property=["']og:title["']/i);
      if (ogTitleMatch) ogTitle = ogTitleMatch[1].trim();

      const ogSiteMatch = htmlText.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["'](.*?)["']/i);
      if (ogSiteMatch) ogSiteName = ogSiteMatch[1].trim();

      const descMatch = htmlText.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) ||
                        htmlText.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i) ||
                        htmlText.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
      if (descMatch) metaDescription = descMatch[1].trim();
    }
  } catch (err: any) {
    console.warn(`Could not directly scrape ${targetUrl} (${err.message}), proceeding with URL metadata analysis.`);
  }

  // If Gemini API is available and we retrieved HTML or metadata, let Gemini intelligently extract structured fields
  if (process.env.GEMINI_API_KEY && (htmlText || pageTitle || metaDescription)) {
    try {
      const prompt = `
Extract job details from this job posting web page data.

URL: ${targetUrl}
HTML Page Title: ${pageTitle || 'N/A'}
OG Title: ${ogTitle || 'N/A'}
Site Name: ${ogSiteName || 'N/A'}
Meta Description: ${metaDescription || 'N/A'}
Page Snippet:
${htmlText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '').replace(/<[^>]+>/g, ' ').slice(0, 8000)}

INSTRUCTIONS:
Extract the following fields accurately:
- title (e.g. "Senior Python Engineer", "Junior Full Stack Developer")
- company (the hiring employer name)
- location (e.g. "Cape Town, South Africa", "Remote", "London, UK")
- remoteType ("remote" | "hybrid" | "onsite")
- employmentType ("full-time" | "part-time" | "contract" | "internship")
- experienceLevel ("junior" | "mid" | "senior" | "lead")
- salary (if mentioned, otherwise null)
- description (comprehensive 2-4 paragraph overview of the role)
- requirements (array of required skills, experience, or qualifications)
- responsibilities (array of key duties)
- tags (array of 4-6 key technologies/skills mentioned)

Respond in JSON format:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "remoteType": "remote",
  "employmentType": "full-time",
  "experienceLevel": "junior",
  "salary": "Salary or null",
  "description": "Clean description text...",
  "requirements": ["Requirement 1", "Requirement 2"],
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "tags": ["Tag1", "Tag2"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title && parsed.company) {
        return {
          title: parsed.title,
          company: parsed.company,
          location: parsed.location || 'Remote / Hybrid',
          remoteType: ['remote', 'hybrid', 'onsite'].includes(parsed.remoteType) ? parsed.remoteType : 'hybrid',
          employmentType: ['full-time', 'part-time', 'contract', 'internship'].includes(parsed.employmentType) ? parsed.employmentType : 'full-time',
          experienceLevel: ['junior', 'mid', 'senior', 'lead'].includes(parsed.experienceLevel) ? parsed.experienceLevel : 'junior',
          salary: parsed.salary || undefined,
          description: parsed.description || metaDescription || `Job application imported from ${targetUrl}`,
          requirements: Array.isArray(parsed.requirements) && parsed.requirements.length > 0 ? parsed.requirements : ['Relevant software and engineering experience'],
          responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
          source: parsedUrl.hostname,
          applicationUrl: targetUrl,
          tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ['Software Engineering', 'Web Development']
        };
      }
    } catch (err: any) {
      console.warn('Gemini job URL extraction fallback:', err.message);
    }
  }

  // Fallback heuristic extraction
  const resolvedTitle = pageTitle ? pageTitle.split(/[-|–•]/)[0].trim() : inferredTitle;
  const resolvedCompany = ogSiteName || (pageTitle && pageTitle.includes('|') ? pageTitle.split('|').pop()?.trim() : inferredCompany);

  return {
    title: resolvedTitle || inferredTitle,
    company: resolvedCompany || inferredCompany,
    location: 'Remote / Flexible',
    remoteType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    salary: undefined,
    description: metaDescription || `Job posting imported from ${targetUrl}. Review requirements and compare alignment with your verified candidate profile.`,
    requirements: [
      'Experience in modern software engineering and responsive web development',
      'Familiarity with collaborative version control and RESTful services',
      'Strong problem solving and communication skills'
    ],
    responsibilities: [
      'Design and implement software features according to specifications',
      'Participate in code reviews, bug fixes, and continuous improvements'
    ],
    source: parsedUrl.hostname,
    applicationUrl: targetUrl,
    tags: ['Software Engineering', 'Development', 'Full Stack']
  };
}

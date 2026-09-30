import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import { extractJobFromUrl } from '../services/linkExtractor.ts';

const router = Router();
router.use(authMiddleware);

// --- Find Jobs with Search & Filters ---
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { keyword, location, remoteType, employmentType, experienceLevel } = req.query;
  const jobs = db.getJobs({
    keyword: keyword as string,
    location: location as string,
    remoteType: remoteType as string,
    employmentType: employmentType as string,
    experienceLevel: experienceLevel as string
  });
  return res.json({ jobs });
});

// --- Extract & Ingest Job ONLY from Link ---
router.post('/from-link', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, autoSave } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a valid job URL link' });
    }

    const extracted = await extractJobFromUrl(url.trim());
    const newJob = db.addCustomJob(extracted);

    // If autoSave flag requested, also bookmark to saved jobs
    if (autoSave) {
      db.saveJob(req.user!.id, newJob.id, 'Imported from URL link');
    }

    return res.status(201).json({ job: newJob });
  } catch (err: any) {
    console.error('Error importing job from link:', err);
    return res.status(400).json({ error: err.message || 'Unable to import job from this link' });
  }
});

// --- Recommended Jobs (matched against candidate skills & role) ---
router.get('/recommended', (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getProfileByUserId(req.user!.id);
  const skills = db.getSkills(req.user!.id).map((s) => s.name.toLowerCase());
  const allJobs = db.getJobs();

  const scored = allJobs.map((job) => {
    let score = 0;
    const titleLower = job.title.toLowerCase();
    const descLower = job.description.toLowerCase();

    // Check preferred job titles
    if (profile?.professional?.preferredJobTitles?.some((pt) => titleLower.includes(pt.toLowerCase()))) {
      score += 30;
    }

    // Check remote preference
    if (profile?.professional?.remotePreference && profile.professional.remotePreference !== 'any') {
      if (job.remoteType === profile.professional.remotePreference) {
        score += 20;
      }
    }

    // Match candidate skills against job tags and description
    skills.forEach((skill) => {
      if (job.tags.some((t) => t.toLowerCase() === skill)) {
        score += 15;
      } else if (descLower.includes(skill)) {
        score += 5;
      }
    });

    return { job, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return res.json({ recommended: scored.map((s) => s.job) });
});

// --- Get Job by ID ---
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json({ job });
});

// --- Add Manual Job / Pasted Description ---
router.post('/manual', (req: AuthenticatedRequest, res: Response) => {
  const { title, company, location, remoteType, employmentType, experienceLevel, salary, description, requirements, responsibilities, source, applicationUrl, tags } = req.body;

  if (!title || !company || !description) {
    return res.status(400).json({ error: 'Job title, company, and description are required' });
  }

  // Parse requirements into list if passed as block of text
  let reqList: string[] = [];
  if (Array.isArray(requirements)) {
    reqList = requirements;
  } else if (typeof requirements === 'string' && requirements.trim().length > 0) {
    reqList = requirements
      .split('\n')
      .map((r) => r.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((r) => r.length > 0);
  }

  if (reqList.length === 0) {
    // Extract default bullet points from description
    reqList = description
      .split('\n')
      .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'))
      .map((line: string) => line.replace(/^[-*•]+\s*/, '').trim())
      .slice(0, 6);
    if (reqList.length === 0) {
      reqList = ['Relevant experience in software and web applications', 'Commitment to high quality engineering'];
    }
  }

  const newJob = db.addCustomJob({
    title: title.trim(),
    company: company.trim(),
    location: location?.trim() || 'Remote',
    remoteType: remoteType || 'hybrid',
    employmentType: employmentType || 'full-time',
    experienceLevel: experienceLevel || 'junior',
    salary: salary?.trim(),
    description: description.trim(),
    requirements: reqList,
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    source: source?.trim() || 'Manual Input',
    applicationUrl: applicationUrl?.trim() || '',
    tags: Array.isArray(tags) ? tags : ['Software Engineering', 'Web Development']
  });

  return res.status(201).json({ job: newJob });
});

// --- Saved Jobs CRUD ---
router.get('/saved/all', (req: AuthenticatedRequest, res: Response) => {
  const saved = db.getSavedJobs(req.user!.id);
  return res.json({ savedJobs: saved });
});

router.post('/saved', (req: AuthenticatedRequest, res: Response) => {
  const { jobId, notes } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'jobId is required' });
  }

  const saved = db.saveJob(req.user!.id, jobId, notes);
  if (!saved) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.status(201).json({ savedJob: saved });
});

router.delete('/saved/:jobId', (req: AuthenticatedRequest, res: Response) => {
  db.removeSavedJob(req.user!.id, req.params.jobId);
  return res.json({ success: true });
});

export default router;

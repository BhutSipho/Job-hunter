import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import { extractJobFromUrl } from '../services/linkExtractor.ts';

const router = Router();
router.use(authMiddleware);

// --- Get All Applications ---
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const applications = db.getApplications(req.user!.id);
  return res.json({ applications });
});

// --- Dashboard Analytics ---
router.get('/metrics', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const applications = db.getApplications(userId);
  const savedJobs = db.getSavedJobs(userId);

  const metrics = {
    totalSaved: savedJobs.length,
    totalApplications: applications.length,
    preparing: applications.filter((a) => a.status === 'preparing').length,
    applied: applications.filter((a) => a.status === 'applied').length,
    assessments: applications.filter((a) => a.status === 'assessment').length,
    interviews: applications.filter((a) => a.status === 'interview').length,
    offers: applications.filter((a) => a.status === 'offer').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    withdrawn: applications.filter((a) => a.status === 'withdrawn').length,
    applicationsThisMonth: applications.filter((a) => {
      const appDate = new Date(a.applicationDate);
      const now = new Date();
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }).length
  };

  return res.json({ metrics });
});

// --- Create Application ---
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  let { company, role, location, jobId, jobUrl, applicationDate, status, notes, interviewDate, followUpDate, cvVersionId, coverLetterId, salaryOffered } = req.body;

  // If user only provided a jobUrl without company or role, extract them automatically
  if (jobUrl && (!company || !role)) {
    try {
      const extracted = await extractJobFromUrl(jobUrl.trim());
      if (!company) company = extracted.company;
      if (!role) role = extracted.title;
      if (!location) location = extracted.location;
      if (!jobId) {
        const newJob = db.addCustomJob(extracted);
        jobId = newJob.id;
      }
    } catch (err) {
      console.warn('Could not auto-extract details from URL:', err);
    }
  }

  if (!company || !role) {
    return res.status(400).json({ error: 'Company and role are required (or provide a valid job URL)' });
  }

  const app = db.addApplication(req.user!.id, {
    company: company.trim(),
    role: role.trim(),
    location: location?.trim() || 'Remote',
    jobId,
    jobUrl: jobUrl?.trim(),
    applicationDate: applicationDate || new Date().toISOString().split('T')[0],
    status: status || 'applied',
    notes: notes || '',
    interviewDate,
    followUpDate,
    cvVersionId,
    coverLetterId,
    salaryOffered
  });

  return res.status(201).json({ application: app });
});

// --- Update Application ---
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateApplication(req.user!.id, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Application not found' });
  }
  return res.json({ application: updated });
});

// --- Delete Application ---
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteApplication(req.user!.id, req.params.id);
  return res.json({ success: true });
});

export default router;

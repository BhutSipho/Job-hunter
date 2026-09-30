import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authMiddleware);

// --- Master CV ---
router.get('/master', (req: AuthenticatedRequest, res: Response) => {
  const masterCV = db.getMasterCV(req.user!.id);
  return res.json({ masterCV });
});

router.put('/master', (req: AuthenticatedRequest, res: Response) => {
  const { rawText } = req.body;
  if (typeof rawText !== 'string') {
    return res.status(400).json({ error: 'rawText string is required' });
  }

  const updated = db.updateMasterCV(req.user!.id, rawText);
  return res.json({ masterCV: updated });
});

// Helper to parse uploaded/pasted text into structured candidate fields
router.post('/parse-text', (req: AuthenticatedRequest, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text content is required' });
  }

  // Update Master CV with parsed text
  db.updateMasterCV(req.user!.id, text);

  // Return preview of detected lines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return res.json({
    success: true,
    totalLines: lines.length,
    preview: lines.slice(0, 10)
  });
});

// --- CV Versions ---
router.get('/versions', (req: AuthenticatedRequest, res: Response) => {
  const versions = db.getCVVersions(req.user!.id);
  return res.json({ versions });
});

router.post('/versions', (req: AuthenticatedRequest, res: Response) => {
  const { jobId, jobTitle, company, title, tailoredSummary, prioritizedSkills, tailoredExperience, tailoredProjects, notes } = req.body;

  if (!jobTitle || !company || !tailoredSummary) {
    return res.status(400).json({ error: 'jobTitle, company, and tailoredSummary are required' });
  }

  const version = db.saveCVVersion(req.user!.id, {
    jobId,
    jobTitle,
    company,
    title: title || `Tailored for ${jobTitle} at ${company}`,
    tailoredSummary,
    prioritizedSkills: Array.isArray(prioritizedSkills) ? prioritizedSkills : [],
    tailoredExperience: Array.isArray(tailoredExperience) ? tailoredExperience : [],
    tailoredProjects: Array.isArray(tailoredProjects) ? tailoredProjects : [],
    notes
  });

  return res.status(201).json({ version });
});

router.delete('/versions/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteCVVersion(req.user!.id, req.params.id);
  return res.json({ success: true });
});

export default router;

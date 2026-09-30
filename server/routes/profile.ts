import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authMiddleware);

// --- Candidate Profile ---
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getProfileByUserId(req.user!.id);
  return res.json({ profile });
});

router.put('/', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateProfile(req.user!.id, req.body);
  return res.json({ profile: updated });
});

// Full candidate context for AI and preview
router.get('/full', (req: AuthenticatedRequest, res: Response) => {
  const context = db.getFullCandidateContext(req.user!.id);
  return res.json({ context });
});

// --- Skills ---
router.get('/skills', (req: AuthenticatedRequest, res: Response) => {
  const skills = db.getSkills(req.user!.id);
  return res.json({ skills });
});

router.post('/skills', (req: AuthenticatedRequest, res: Response) => {
  const { name, category, proficiency, yearsExperience } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Skill name and category are required' });
  }
  const skill = db.addSkill(req.user!.id, {
    name: name.trim(),
    category,
    proficiency: proficiency || 'intermediate',
    yearsExperience: yearsExperience ? Number(yearsExperience) : undefined
  });
  return res.status(201).json({ skill });
});

router.delete('/skills/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteSkill(req.user!.id, req.params.id);
  return res.json({ success: true });
});

// --- Experience ---
router.get('/experience', (req: AuthenticatedRequest, res: Response) => {
  const experiences = db.getExperiences(req.user!.id);
  return res.json({ experiences });
});

router.post('/experience', (req: AuthenticatedRequest, res: Response) => {
  const { company, jobTitle, startDate, endDate, isCurrent, description, responsibilities, technologies, achievements, location } = req.body;
  if (!company || !jobTitle || !startDate) {
    return res.status(400).json({ error: 'Company, job title, and start date are required' });
  }

  const exp = db.addExperience(req.user!.id, {
    company: company.trim(),
    jobTitle: jobTitle.trim(),
    location: location?.trim(),
    startDate,
    endDate: isCurrent ? 'Present' : (endDate || ''),
    isCurrent: Boolean(isCurrent),
    description: description || '',
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    technologies: Array.isArray(technologies) ? technologies : [],
    achievements: Array.isArray(achievements) ? achievements : []
  });
  return res.status(201).json({ experience: exp });
});

router.put('/experience/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateExperience(req.user!.id, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  return res.json({ experience: updated });
});

router.delete('/experience/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteExperience(req.user!.id, req.params.id);
  return res.json({ success: true });
});

// --- Education ---
router.get('/education', (req: AuthenticatedRequest, res: Response) => {
  const educations = db.getEducations(req.user!.id);
  return res.json({ educations });
});

router.post('/education', (req: AuthenticatedRequest, res: Response) => {
  const { institution, qualification, fieldOfStudy, startDate, endDate, completionStatus, description } = req.body;
  if (!institution || !qualification) {
    return res.status(400).json({ error: 'Institution and qualification are required' });
  }

  const edu = db.addEducation(req.user!.id, {
    institution: institution.trim(),
    qualification: qualification.trim(),
    fieldOfStudy: fieldOfStudy || '',
    startDate: startDate || '',
    endDate: endDate || '',
    completionStatus: completionStatus || 'completed',
    description: description || ''
  });
  return res.status(201).json({ education: edu });
});

router.put('/education/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateEducation(req.user!.id, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Education not found' });
  }
  return res.json({ education: updated });
});

router.delete('/education/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteEducation(req.user!.id, req.params.id);
  return res.json({ success: true });
});

// --- Certifications ---
router.get('/certifications', (req: AuthenticatedRequest, res: Response) => {
  const certifications = db.getCertifications(req.user!.id);
  return res.json({ certifications });
});

router.post('/certifications', (req: AuthenticatedRequest, res: Response) => {
  const { name, provider, issueDate, credentialUrl, description } = req.body;
  if (!name || !provider) {
    return res.status(400).json({ error: 'Certification name and provider are required' });
  }

  const cert = db.addCertification(req.user!.id, {
    name: name.trim(),
    provider: provider.trim(),
    issueDate: issueDate || '',
    credentialUrl: credentialUrl?.trim(),
    description: description || ''
  });
  return res.status(201).json({ certification: cert });
});

router.delete('/certifications/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteCertification(req.user!.id, req.params.id);
  return res.json({ success: true });
});

// --- Projects ---
router.get('/projects', (req: AuthenticatedRequest, res: Response) => {
  const projects = db.getProjects(req.user!.id);
  return res.json({ projects });
});

router.post('/projects', (req: AuthenticatedRequest, res: Response) => {
  const { name, description, technologies, githubUrl, liveUrl, role, status } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Project name and description are required' });
  }

  const proj = db.addProject(req.user!.id, {
    name: name.trim(),
    description: description.trim(),
    technologies: Array.isArray(technologies) ? technologies : [],
    githubUrl: githubUrl?.trim(),
    liveUrl: liveUrl?.trim(),
    role: role || 'Developer',
    status: status || 'completed'
  });
  return res.status(201).json({ project: proj });
});

router.put('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateProject(req.user!.id, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json({ project: updated });
});

router.delete('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  db.deleteProject(req.user!.id, req.params.id);
  return res.json({ success: true });
});

export default router;

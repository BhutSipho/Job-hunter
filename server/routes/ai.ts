import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import {
  analyzeJobMatch,
  tailorCV,
  generateCoverLetter,
  generateApplicationAnswer,
  generateInterviewPrep
} from '../services/aiService.ts';

const router = Router();
router.use(authMiddleware);

// --- Analyze Job Match against Candidate Profile ---
router.post('/analyse-job', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, customJob } = req.body;

    let targetJob = null;
    if (jobId) {
      targetJob = db.getJobById(jobId);
    } else if (customJob) {
      targetJob = customJob;
    }

    if (!targetJob) {
      return res.status(404).json({ error: 'Job not found or job description missing' });
    }

    const candidateContext = db.getFullCandidateContext(req.user!.id);
    const analysis = await analyzeJobMatch(targetJob, candidateContext);

    // Save analysis to persistent database
    const saved = db.saveJobAnalysis(req.user!.id, analysis);
    return res.json({ analysis: saved });
  } catch (err: any) {
    console.error('Error analyzing job:', err);
    return res.status(500).json({ error: 'Unable to analyse this job. Please try again.' });
  }
});

router.get('/analyses', (req: AuthenticatedRequest, res: Response) => {
  const analyses = db.getJobAnalyses(req.user!.id);
  return res.json({ analyses });
});

router.get('/analyses/:jobId', (req: AuthenticatedRequest, res: Response) => {
  const analysis = db.getJobAnalysis(req.user!.id, req.params.jobId);
  return res.json({ analysis });
});

// --- Tailor CV ---
router.post('/tailor-cv', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, customJob } = req.body;

    let targetJob = null;
    if (jobId) {
      targetJob = db.getJobById(jobId);
    } else if (customJob) {
      targetJob = customJob;
    }

    if (!targetJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const candidateContext = db.getFullCandidateContext(req.user!.id);
    const tailored = await tailorCV(targetJob, candidateContext);

    // Automatically create a new version without touching master CV
    const savedVersion = db.saveCVVersion(req.user!.id, tailored);
    return res.json({ version: savedVersion });
  } catch (err: any) {
    console.error('Error tailoring CV:', err);
    return res.status(500).json({ error: 'Unable to tailor CV. Please check your profile and try again.' });
  }
});

// --- Generate Cover Letter ---
router.post('/cover-letter', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, customJob, tone } = req.body;

    let targetJob = null;
    if (jobId) {
      targetJob = db.getJobById(jobId);
    } else if (customJob) {
      targetJob = customJob;
    }

    if (!targetJob) {
      return res.status(404).json({ error: 'Target job required for cover letter' });
    }

    const candidateContext = db.getFullCandidateContext(req.user!.id);
    const letter = await generateCoverLetter(targetJob, candidateContext, tone);
    const saved = db.saveCoverLetter(req.user!.id, letter);

    return res.json({ coverLetter: saved });
  } catch (err: any) {
    console.error('Error generating cover letter:', err);
    return res.status(500).json({ error: 'Failed to generate cover letter.' });
  }
});

// --- Application Answers ---
router.post('/application-answer', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, length, jobId } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const candidateContext = db.getFullCandidateContext(req.user!.id);
    const job = jobId ? db.getJobById(jobId) : undefined;

    const answerText = await generateApplicationAnswer(
      question.trim(),
      length || 'medium',
      candidateContext,
      job
    );

    const saved = db.saveApplicationAnswer(req.user!.id, {
      jobId,
      jobTitle: job?.title,
      question: question.trim(),
      length: length || 'medium',
      answer: answerText
    });

    return res.json({ answer: saved });
  } catch (err: any) {
    console.error('Error generating answer:', err);
    return res.status(500).json({ error: 'Failed to generate application answer.' });
  }
});

router.get('/application-answers', (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.query;
  const list = db.getApplicationAnswers(req.user!.id, jobId as string);
  return res.json({ answers: list });
});

// --- Interview Prep ---
router.post('/interview-prep', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, customJob } = req.body;

    let targetJob = null;
    if (jobId) {
      targetJob = db.getJobById(jobId);
    } else if (customJob) {
      targetJob = customJob;
    }

    if (!targetJob) {
      return res.status(404).json({ error: 'Job required for interview prep' });
    }

    const candidateContext = db.getFullCandidateContext(req.user!.id);
    const questions = await generateInterviewPrep(targetJob, candidateContext);

    const session = db.saveInterviewSession(req.user!.id, {
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      company: targetJob.company,
      questions
    });

    return res.json({ session });
  } catch (err: any) {
    console.error('Error generating interview prep:', err);
    return res.status(500).json({ error: 'Failed to generate interview preparation.' });
  }
});

router.get('/interview-prep/:jobId', (req: AuthenticatedRequest, res: Response) => {
  const session = db.getInterviewSession(req.user!.id, req.params.jobId);
  return res.json({ session });
});

export default router;

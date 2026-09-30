import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, FileEdit, Trash2, ArrowRight, ExternalLink, Briefcase } from 'lucide-react';
import { SavedJob, Job } from '../types/index.ts';
import { api } from '../services/api.ts';
import { JobCard } from '../components/JobCard.tsx';

interface Props {
  onAnalyzeJob: (job: Job) => void;
  onTailorCV: (job: Job) => void;
  onCoverLetter: (job: Job) => void;
  onInterviewPrep: (job: Job) => void;
  onNavigate: (tab: string) => void;
}

export const SavedJobsPage: React.FC<Props> = ({
  onAnalyzeJob,
  onTailorCV,
  onCoverLetter,
  onInterviewPrep,
  onNavigate,
}) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.saved();
      setSavedJobs(res.savedJobs || []);
    } catch (err) {
      console.error('Error loading saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (job: Job) => {
    try {
      await api.jobs.removeSaved(job.id);
      setSavedJobs((prev) => prev.filter((s) => s.jobId !== job.id));
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {savedJobs.length} Bookmarked
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review saved positions, compare requirement alignment, and tailor specific CV versions before applying.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading saved jobs...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <Bookmark className="w-12 h-12 mx-auto text-slate-300" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No saved jobs yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse positions on the Find Jobs page and click the bookmark icon to save them for later analysis.
            </p>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
          >
            Browse Available Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((saved) => (
            <JobCard
              key={saved.id}
              job={saved.job}
              isSaved={true}
              onUnsave={handleUnsave}
              onAnalyze={onAnalyzeJob}
              onTailorCV={onTailorCV}
              onCoverLetter={onCoverLetter}
              onInterviewPrep={onInterviewPrep}
              onTrackApplication={() => onNavigate('applications')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

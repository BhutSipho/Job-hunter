import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Send, 
  HelpCircle, 
  Award, 
  XCircle, 
  TrendingUp, 
  Search, 
  FileEdit, 
  Plus, 
  ArrowRight, 
  Sparkles,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Job, SavedJob, Application, User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { JobCard } from '../components/JobCard.tsx';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

interface Props {
  user: User;
  onNavigate: (tab: string) => void;
  onAnalyzeJob: (job: Job) => void;
  onTailorCV: (job: Job) => void;
  onCoverLetter: (job: Job) => void;
  onInterviewPrep: (job: Job) => void;
  onOpenManualJob: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  user,
  onNavigate,
  onAnalyzeJob,
  onTailorCV,
  onCoverLetter,
  onInterviewPrep,
  onOpenManualJob,
}) => {
  const [metrics, setMetrics] = useState<any>({
    totalSaved: 0,
    totalApplications: 0,
    preparing: 0,
    applied: 0,
    assessments: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
    applicationsThisMonth: 0,
  });
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, recRes, savedRes, appsRes] = await Promise.all([
        api.applications.metrics(),
        api.jobs.recommended(),
        api.jobs.saved(),
        api.applications.list(),
      ]);

      setMetrics(metricsRes.metrics || {});
      setRecommendedJobs(recRes.recommended || []);
      setSavedJobIds(new Set((savedRes.savedJobs || []).map((s) => s.jobId)));
      setRecentApplications((appsRes.applications || []).slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job: Job) => {
    try {
      await api.jobs.save(job.id);
      setSavedJobIds((prev) => new Set([...prev, job.id]));
      setMetrics((prev: any) => ({ ...prev, totalSaved: prev.totalSaved + 1 }));
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleUnsaveJob = async (job: Job) => {
    try {
      await api.jobs.removeSaved(job.id);
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
      setMetrics((prev: any) => ({ ...prev, totalSaved: Math.max(0, prev.totalSaved - 1) }));
    } catch (err) {
      console.error('Error removing job:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Seeker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track your verified skills, explore recommended roles, and craft evidence-backed applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenManualJob}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Paste Job
          </button>
          <button
            onClick={() => onNavigate('jobs')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Search Jobs
          </button>
        </div>
      </div>

      <AntiFabricationBadge />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Saved Jobs
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalSaved}</span>
            <span className="text-[10px] text-slate-400">In wishlist</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Send className="w-3.5 h-3.5 text-blue-500" /> Applications
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalApplications}</span>
            <span className="text-[10px] text-blue-600 font-semibold">{metrics.applicationsThisMonth} this mo.</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Interviews
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">{metrics.interviews}</span>
            <span className="text-[10px] text-slate-400">Scheduled</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Assessments
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.assessments}</span>
            <span className="text-[10px] text-slate-400">Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" /> Offers
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{metrics.offers}</span>
            <span className="text-[10px] text-slate-400">Received</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-slate-400" /> Closed
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-600">{metrics.rejected}</span>
            <span className="text-[10px] text-slate-400">Archived</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Jobs & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Recommended Jobs For You</h2>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Skill Aligned
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Matched against your registered technical skills and role preferences.
              </p>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {recommendedJobs.slice(0, 3).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onSave={handleSaveJob}
                onUnsave={handleUnsaveJob}
                onAnalyze={onAnalyzeJob}
                onTailorCV={onTailorCV}
                onCoverLetter={onCoverLetter}
                onInterviewPrep={onInterviewPrep}
                onTrackApplication={() => onNavigate('applications')}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Quick Shortcuts & Recent Applications */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Application Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('cv')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileEdit className="w-4 h-4 text-indigo-600" />
                  <span>Manage Master CV & Versions</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('answers')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Answer Custom Application Q&A</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all text-left text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Update Verified Skills & Projects</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent Applications Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Open Kanban
              </button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                <p>No applications tracked yet.</p>
                <p className="text-[11px] text-slate-500">Find a job and click "+ Track" to start.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onNavigate('applications')}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                        {app.company}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{app.role}</p>
                    <p className="text-[10px] text-slate-400">Applied: {app.applicationDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

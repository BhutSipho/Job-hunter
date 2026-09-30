import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  Plus, 
  Bookmark, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  SlidersHorizontal, 
  Briefcase,
  Link2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Job, SavedJob } from '../types/index.ts';
import { api } from '../services/api.ts';
import { JobCard } from '../components/JobCard.tsx';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

interface Props {
  onAnalyzeJob: (job: Job) => void;
  onTailorCV: (job: Job) => void;
  onCoverLetter: (job: Job) => void;
  onInterviewPrep: (job: Job) => void;
  onOpenManualJob: () => void;
  onNavigate: (tab: string) => void;
}

export const FindJobsPage: React.FC<Props> = ({
  onAnalyzeJob,
  onTailorCV,
  onCoverLetter,
  onInterviewPrep,
  onOpenManualJob,
  onNavigate,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Quick link input
  const [quickLink, setQuickLink] = useState('');
  const [importingLink, setImportingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [remoteType, setRemoteType] = useState('any');
  const [employmentType, setEmploymentType] = useState('any');
  const [experienceLevel, setExperienceLevel] = useState('any');
  const [showFilters, setShowFilters] = useState(false);

  const sampleKeywords = [
    'Junior Full Stack Developer',
    'Junior Software Engineer',
    'QA Tester',
    'IT Support',
    'Python',
    'React',
  ];

  useEffect(() => {
    fetchJobs();
    loadSavedStatus();
  }, [remoteType, employmentType, experienceLevel]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.list({
        keyword: keyword.trim() || undefined,
        location: location.trim() || undefined,
        remoteType: remoteType !== 'any' ? remoteType : undefined,
        employmentType: employmentType !== 'any' ? employmentType : undefined,
        experienceLevel: experienceLevel !== 'any' ? experienceLevel : undefined,
      });
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedStatus = async () => {
    try {
      const res = await api.jobs.saved();
      setSavedJobIds(new Set((res.savedJobs || []).map((s) => s.jobId)));
    } catch (err) {
      console.error('Error loading saved jobs:', err);
    }
  };

  const handleQuickLinkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLink.trim()) return;

    setImportingLink(true);
    setLinkError(null);
    try {
      const res = await api.jobs.fromLink({ url: quickLink.trim(), autoSave: true });
      setJobs((prev) => [res.job, ...prev]);
      setSavedJobIds((prev) => new Set([...prev, res.job.id]));
      setQuickLink('');
      // Open analysis immediately
      onAnalyzeJob(res.job);
    } catch (err: any) {
      setLinkError(err.message || 'Unable to import job from this link');
    } finally {
      setImportingLink(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSave = async (job: Job) => {
    try {
      await api.jobs.save(job.id);
      setSavedJobIds((prev) => new Set([...prev, job.id]));
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleUnsave = async (job: Job) => {
    try {
      await api.jobs.removeSaved(job.id);
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setRemoteType('any');
    setEmploymentType('any');
    setExperienceLevel('any');
    setTimeout(() => {
      fetchJobs();
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Find & Discover Jobs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search verified opportunities, import directly by job link, or paste custom postings.
          </p>
        </div>

        <button
          onClick={onOpenManualJob}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add / Paste Job
        </button>
      </div>

      <AntiFabricationBadge />

      {/* QUICK IMPORT BY JOB LINK BAR */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl shadow-sm text-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white">Add Job by Link Only</h3>
            <span className="text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
              Instant Auto-Extraction
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Paste any URL (LinkedIn, Indeed, Company careers)</span>
        </div>

        <form onSubmit={handleQuickLinkImport} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="url"
              required
              placeholder="Paste job link (e.g. https://www.linkedin.com/jobs/view/...)"
              value={quickLink}
              onChange={(e) => setQuickLink(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white text-slate-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={importingLink || !quickLink.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${importingLink ? 'animate-spin' : ''}`} />
            <span>{importingLink ? 'Importing Job...' : 'Import & Analyze'}</span>
          </button>
        </form>

        {linkError && (
          <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>{linkError}</span>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Job title, keywords, or skills (e.g. React, Python)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="City, region, or 'Remote'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick query tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Popular:</span>
          {sampleKeywords.map((kw, i) => (
            <button
              key={i}
              onClick={() => {
                setKeyword(kw);
                setTimeout(() => fetchJobs(), 50);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Workplace Preference</label>
              <select
                value={remoteType}
                onChange={(e) => setRemoteType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="any">Any Workplace Type</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="any">Any Employment Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Experience Level</label>
              <div className="flex gap-2">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="any">Any Experience Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
                <button
                  onClick={handleResetFilters}
                  className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Found {jobs.length} relevant positions</span>
          <span>Click "Analyze Match" to test your real profile against any posting</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Searching active opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
            <Briefcase className="w-12 h-12 mx-auto text-slate-300" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No matching jobs found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your search terms or paste a custom job posting directly.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Reset Search
              </button>
              <button
                onClick={onOpenManualJob}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Paste Custom Job
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onSave={handleSave}
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
    </div>
  );
};

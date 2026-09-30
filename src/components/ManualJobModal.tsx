import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Link2, 
  FileText, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Building2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Job } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const ManualJobModal: React.FC<Props> = ({ isOpen, onClose, onJobCreated }) => {
  const [mode, setMode] = useState<'link' | 'manual'>('link');
  
  // Link-only input
  const [jobUrl, setJobUrl] = useState('');
  
  // Manual fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [remoteType, setRemoteType] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [employmentType, setEmploymentType] = useState<'full-time' | 'part-time' | 'contract' | 'internship'>('full-time');
  const [experienceLevel, setExperienceLevel] = useState<'junior' | 'mid' | 'senior' | 'lead'>('junior');
  const [salary, setSalary] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle URL-only import
  const handleLinkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.trim()) {
      setError('Please paste a job link URL.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.jobs.fromLink({
        url: jobUrl.trim(),
        autoSave: true,
      });
      onJobCreated(res.job);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to import job from this link. You can switch to the Manual tab.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Form Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      setError('Please provide Job Title, Company, and Job Description.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.jobs.addManual({
        title,
        company,
        location,
        remoteType,
        employmentType,
        experienceLevel,
        salary,
        applicationUrl: manualUrl,
        description,
        source: manualUrl ? 'Direct URL' : 'Pasted Job Description',
      });
      onJobCreated(res.job);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Target Job</h2>
            <p className="text-xs text-slate-500">
              Add the job you're applying for by link or full description
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => {
              setMode('link');
              setError(null);
            }}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'link'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Add by Link Only (Instant)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('manual');
              setError(null);
            }}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'manual'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Full Description</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Link-only Form */}
        {mode === 'link' && (
          <form onSubmit={handleLinkImport} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Job Posting URL Link *
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  required
                  placeholder="https://www.linkedin.com/jobs/view/... or any company career link"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Paste the URL from LinkedIn, Indeed, Glassdoor, Greenhouse, Lever, Workday, or direct company career pages. We will automatically ingest requirements and title.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Automatic Metadata & Requirement Extraction
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                You don't need to manually type the title or copy the whole page. Our engine extracts the role, company name, and key requirements directly from the link.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !jobUrl.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Importing from Link...' : 'Import & Analyze Job'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Full Description / Manual Form */}
        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Python Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Johannesburg / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace Type</label>
                <select
                  value={remoteType}
                  onChange={(e: any) => setRemoteType(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e: any) => setExperienceLevel(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. R35,000 - R45,000 / month"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://company.com/jobs/..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Job Description / Requirements *
              </label>
              <textarea
                required
                rows={7}
                placeholder="Paste job description, responsibilities, and required qualifications here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving Job...' : 'Save & Analyze Job'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

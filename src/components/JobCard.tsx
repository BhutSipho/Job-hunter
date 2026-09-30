import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Sparkles, 
  FileEdit, 
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Job } from '../types/index.ts';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  isApplied?: boolean;
  onSave?: (job: Job) => void;
  onUnsave?: (job: Job) => void;
  onAnalyze: (job: Job) => void;
  onTailorCV: (job: Job) => void;
  onCoverLetter?: (job: Job) => void;
  onInterviewPrep?: (job: Job) => void;
  onTrackApplication?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  isApplied = false,
  onSave,
  onUnsave,
  onAnalyze,
  onTailorCV,
  onCoverLetter,
  onInterviewPrep,
  onTrackApplication,
}) => {
  const getRemoteBadge = (type: string) => {
    switch (type) {
      case 'remote':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Remote</span>;
      case 'hybrid':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Hybrid</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Onsite</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>
              {job.salary && (
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  {job.salary}
                </span>
              )}
            </div>
          </div>

          {/* Bookmark Button */}
          {onSave && onUnsave && (
            <button
              onClick={() => (isSaved ? onUnsave(job) : onSave(job))}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {getRemoteBadge(job.remoteType)}
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
            {job.employmentType}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
            {job.experienceLevel}
          </span>
          {isApplied && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <CheckCircle2 className="w-3 h-3" />
              Applied
            </span>
          )}
        </div>

        {/* Snippet */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.tags.slice(0, 5).map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
              {tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAnalyze(job)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Analyze Match
          </button>
          <button
            onClick={() => onTailorCV(job)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            Tailor CV
          </button>
        </div>

        <div className="flex items-center gap-1">
          {onCoverLetter && (
            <button
              onClick={() => onCoverLetter(job)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs transition-colors cursor-pointer"
              title="Generate Cover Letter"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {onInterviewPrep && (
            <button
              onClick={() => onInterviewPrep(job)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs transition-colors cursor-pointer"
              title="Interview Prep Questions"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {job.applicationUrl && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Open Official Job URL"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {onTrackApplication && (
            <button
              onClick={() => onTrackApplication(job)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isApplied ? 'View in Tracker' : '+ Track'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

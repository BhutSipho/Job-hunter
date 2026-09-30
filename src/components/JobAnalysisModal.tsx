import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ShieldCheck, 
  TrendingUp, 
  FileEdit, 
  FileText, 
  HelpCircle,
  Award,
  Layers,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { Job, JobAnalysis } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from './AntiFabricationBadge.tsx';

interface Props {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onTailorCV: (job: Job) => void;
  onCoverLetter?: (job: Job) => void;
  onInterviewPrep?: (job: Job) => void;
}

export const JobAnalysisModal: React.FC<Props> = ({
  job,
  isOpen,
  onClose,
  onTailorCV,
  onCoverLetter,
  onInterviewPrep,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'gaps' | 'ats' | 'breakdown'>('matches');

  useEffect(() => {
    if (isOpen && job) {
      loadAnalysis();
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen, job?.id]);

  const loadAnalysis = async () => {
    if (!job) return;
    setLoading(true);
    setError(null);
    try {
      // Check if analysis already exists
      const existingRes = await api.ai.getAnalysis(job.id);
      if (existingRes.analysis) {
        setAnalysis(existingRes.analysis);
        setLoading(false);
        return;
      }

      // Otherwise run analysis
      const res = await api.ai.analyseJob({ jobId: job.id, customJob: job });
      setAnalysis(res.analysis);
    } catch (err: any) {
      console.error('Job analysis error:', err);
      setError(err.message || 'Unable to analyse this job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Job Requirement Alignment Analysis</h2>
                <AntiFabricationBadge compact />
              </div>
              <p className="text-xs text-slate-500">
                {job.title} &bull; <span className="font-semibold text-slate-700">{job.company}</span> ({job.location})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Analysing job requirements against your verified profile...</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Comparing required skills, work experiences, projects, and education with zero fabrication.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Analysis Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
                <button
                  onClick={loadAnalysis}
                  className="mt-2 px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {!loading && analysis && (
            <>
              {/* Score Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Estimated Profile Alignment
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {analysis.overallMatchScore >= 75 ? 'High Skill & Experience Alignment' : analysis.overallMatchScore >= 55 ? 'Moderate Alignment with Growth Opportunities' : 'Entry / Partial Alignment'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.scoreReasoning}
                    </p>
                    <p className="text-[11px] text-indigo-300/80 italic">
                      * Note: This score strictly represents profile-to-requirement alignment, NOT a guarantee or probability of receiving an interview.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs min-w-[140px] text-center">
                    <div className="text-4xl font-extrabold tracking-tight text-white">
                      {analysis.overallMatchScore}%
                    </div>
                    <span className="text-xs font-medium text-indigo-200 mt-1">Profile Alignment</span>
                  </div>
                </div>
              </div>

              {/* Subscore Category Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Technical Skills</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">{analysis.scoreBreakdown.technicalSkillsScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Experience</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">{analysis.scoreBreakdown.experienceScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Education</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">{analysis.scoreBreakdown.educationScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Certifications</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">{analysis.scoreBreakdown.certificationsScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium text-slate-500 block">Responsibilities</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">{analysis.scoreBreakdown.responsibilitiesScore}%</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'matches'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Demonstrated Matches ({analysis.candidateMatches.length})
                </button>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'gaps'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Gaps & Missing ({analysis.missingRequirements.length + analysis.partialMatches.length})
                </button>
                <button
                  onClick={() => setActiveTab('ats')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ats'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  ATS Keywords & Ethics
                </button>
              </div>

              {/* Tab: Matches */}
              {activeTab === 'matches' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Verified requirements with supporting evidence found directly in your candidate profile:
                  </p>
                  {analysis.candidateMatches.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                      No exact requirement matches identified yet. Update your profile skills and experiences to improve detection.
                    </div>
                  ) : (
                    analysis.candidateMatches.map((m, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            {m.requirement}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                            {m.candidateSkillOrExperience}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-900/90 pl-5.5 bg-emerald-100/40 p-2 rounded-lg">
                          <span className="font-semibold text-emerald-950">Verified Evidence: </span>
                          {m.evidenceSource}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Gaps & Missing */}
              {activeTab === 'gaps' && (
                <div className="space-y-4">
                  {analysis.partialMatches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Partial / Adjacent Matches</h4>
                      {analysis.partialMatches.map((p, idx) => (
                        <div key={idx} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{p.requirement}</span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-sm">Partial</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{p.gapExplanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Unrepresented Requirements (Missing in Profile)</h4>
                    <p className="text-[11px] text-slate-500">
                      Our AI will NOT fabricate these requirements on your CV. If you have genuine experience with any of these, add them to your Profile.
                    </p>
                    {analysis.missingRequirements.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No critical missing requirements identified.</p>
                    ) : (
                      analysis.missingRequirements.map((mis, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              {mis.requirement}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                              mis.importance === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {mis.importance}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] pl-5">
                            <span className="font-medium text-slate-700">Ethical Recommendation: </span>
                            {mis.recommendation}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: ATS & Keywords */}
              {activeTab === 'ats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Found Keywords Represented in Profile
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.atsAnalysis.foundKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-md">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Missing Keywords From Stated Requirements
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.atsAnalysis.missingKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 rounded-md">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">Ethical Resume & Keyword Advice</h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                      {analysis.atsAnalysis.ethicalSuggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onCoverLetter && (
              <button
                onClick={() => {
                  onClose();
                  onCoverLetter(job);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Cover Letter
              </button>
            )}

            {onInterviewPrep && (
              <button
                onClick={() => {
                  onClose();
                  onInterviewPrep(job);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Prep Interview
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onTailorCV(job);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              Tailor CV for this Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

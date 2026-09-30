import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  RotateCw, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Job, InterviewPrepSession, InterviewQuestionItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

interface Props {
  initialJob?: Job | null;
  onNavigate: (tab: string) => void;
}

export const InterviewPrepPage: React.FC<Props> = ({ initialJob, onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(initialJob || null);
  const [session, setSession] = useState<InterviewPrepSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadOrGeneratePrep(selectedJob);
    }
  }, [selectedJob?.id]);

  const loadJobs = async () => {
    try {
      const res = await api.jobs.list();
      setJobs(res.jobs || []);
      if (!selectedJob && res.jobs && res.jobs.length > 0) {
        setSelectedJob(res.jobs[0]);
      }
    } catch (err) {
      console.error('Error loading jobs for prep:', err);
    }
  };

  const loadOrGeneratePrep = async (job: Job) => {
    setLoading(true);
    setError(null);
    try {
      // Check existing
      const existing = await api.ai.getInterviewSession(job.id);
      if (existing.session) {
        setSession(existing.session);
        if (existing.session.questions.length > 0) {
          setExpandedQuestionId(existing.session.questions[0].id);
        }
        setLoading(false);
        return;
      }

      // Generate new
      const res = await api.ai.interviewPrep({ jobId: job.id, customJob: job });
      setSession(res.session);
      if (res.session.questions.length > 0) {
        setExpandedQuestionId(res.session.questions[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview preparation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'technical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Technical</span>;
      case 'behavioral':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">Behavioral (STAR)</span>;
      case 'project':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Project Deep Dive</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Role & Company</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Preparation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Targeted interview questions with model answers grounded strictly in your real background.
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Target Role:</label>
          <select
            value={selectedJob?.id || ''}
            onChange={(e) => {
              const j = jobs.find((item) => item.id === e.target.value);
              if (j) setSelectedJob(j);
            }}
            className="text-xs font-medium border border-slate-300 rounded-xl p-2 bg-white focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      <AntiFabricationBadge />

      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Synthesizing interview questions and STAR answer breakdowns...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && session && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Prepared for {session.jobTitle} at {session.company}</span>
            <span>{session.questions.length} Questions Generated</span>
          </div>

          <div className="space-y-3">
            {session.questions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(q.category)}
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                          Difficulty: {q.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {idx + 1}. {q.question}
                      </h3>
                      {q.contextTip && (
                        <p className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600">Interviewer intent: </span>
                          {q.contextTip}
                        </p>
                      )}
                    </div>

                    <button className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/40 space-y-4">
                      {/* STAR Breakdown if behavioral */}
                      {q.starBreakdown && (
                        <div className="space-y-2 mt-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                            STAR Methodology Response Breakdown
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                              <span className="font-bold text-purple-900 block mb-0.5">S - Situation:</span>
                              <span className="text-slate-700">{q.starBreakdown.situation}</span>
                            </div>
                            <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                              <span className="font-bold text-purple-900 block mb-0.5">T - Task:</span>
                              <span className="text-slate-700">{q.starBreakdown.task}</span>
                            </div>
                            <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                              <span className="font-bold text-purple-900 block mb-0.5">A - Action:</span>
                              <span className="text-slate-700">{q.starBreakdown.action}</span>
                            </div>
                            <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                              <span className="font-bold text-purple-900 block mb-0.5">R - Result:</span>
                              <span className="text-slate-700">{q.starBreakdown.result}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Full candidate answer */}
                      {q.generatedAnswer && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                              Full Model Answer (Grounded in Your Real Profile)
                            </span>
                            <button
                              onClick={() => handleCopy(q.id, q.generatedAnswer!)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
                            >
                              {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === q.id ? 'Copied' : 'Copy Answer'}
                            </button>
                          </div>
                          <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                            {q.generatedAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  RotateCw, 
  AlertCircle,
  Building2,
  Send
} from 'lucide-react';
import { Job, CoverLetter } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from './AntiFabricationBadge.tsx';

interface Props {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (coverLetter: CoverLetter) => void;
}

export const CoverLetterModal: React.FC<Props> = ({
  job,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'concise'>('professional');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && job) {
      generateLetter();
    } else {
      setCoverLetter(null);
      setContent('');
      setError(null);
    }
  }, [isOpen, job?.id]);

  const generateLetter = async () => {
    if (!job) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.ai.coverLetter({
        jobId: job.id,
        customJob: job,
        tone
      });
      setCoverLetter(res.coverLetter);
      setContent(res.coverLetter.content);
      setRecipient(res.coverLetter.recipient || `Hiring Team at ${job.company}`);
    } catch (err: any) {
      console.error('Error generating cover letter:', err);
      setError(err.message || 'Failed to generate cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = async () => {
    if (!job) return;
    try {
      const res = await api.ai.coverLetter({
        jobId: job.id,
        customJob: job,
        tone
      });
      // Update with current edited content
      res.coverLetter.content = content;
      res.coverLetter.recipient = recipient;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSaved) {
        onSaved(res.coverLetter);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save cover letter');
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Tailored Cover Letter</h2>
                <AntiFabricationBadge compact />
              </div>
              <p className="text-xs text-slate-500">
                Application for <span className="font-semibold text-slate-700">{job.title}</span> at {job.company}
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Tone Selector & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Tone:</span>
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
                {(['professional', 'enthusiastic', 'concise'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTone(t);
                    }}
                    className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                      tone === t ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateLetter}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Drafting authentic cover letter...</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Grounding your pitch strictly in your verified experiences and project accomplishments.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && content && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Edit text directly below before copying or submitting:</span>
                {savedSuccess && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved to Application
                  </span>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-4 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!content}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>

            <button
              onClick={handleSave}
              disabled={!content}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Attach & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

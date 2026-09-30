import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  AlertCircle, 
  History,
  RotateCw,
  HelpCircle
} from 'lucide-react';
import { ApplicationAnswer } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

export const ApplicationAnswersPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ApplicationAnswer[]>([]);

  const exampleQuestions = [
    'Why should we hire you for this role?',
    'Tell us about yourself and your background in software engineering.',
    'Describe your experience with Python and REST APIs.',
    'Tell us about a time you handled a difficult bug or technical challenge.',
    'Why are you looking for a junior developer position right now?',
  ];

  useEffect(() => {
    loadAnswers();
  }, []);

  const loadAnswers = async () => {
    try {
      const res = await api.ai.getAnswers();
      setHistory(res.answers || []);
    } catch (err) {
      console.error('Error loading answer history:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.ai.applicationAnswer({
        question: question.trim(),
        length,
      });
      setCurrentAnswer(res.answer.answer);
      setHistory((prev) => [res.answer, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Answers Generator</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate honest, candidate-specific responses for tricky application portal screening questions.
        </p>
      </div>

      <AntiFabricationBadge />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Output */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Ask Any Application Question
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question from Application Portal *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Why should we hire you? What is your greatest technical achievement?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick examples:</span>
              <div className="flex flex-wrap gap-1.5">
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuestion(q)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200/80 transition-colors text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Length */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Answer Depth:</span>
                <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
                  {(['short', 'medium', 'detailed'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLength(l)}
                      className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                        length === l ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loading ? 'Synthesizing...' : 'Generate Answer'}
              </button>
            </div>
          </form>

          {/* Current Generated Answer */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {currentAnswer && (
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Generated Candidate Answer</span>
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {length}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(currentAnswer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="text-xs text-slate-800 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 leading-relaxed font-sans whitespace-pre-line">
                {currentAnswer}
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Grounded strictly in your registered skills, projects, and work experience. No fabricated claims.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Q&A History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Saved Q&A Answers ({history.length})
            </h3>
          </div>

          {history.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs text-slate-400">
              No previous application answers recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.question}</h4>
                    <button
                      onClick={() => handleCopy(item.answer)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Copy Answer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.answer}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100">
                    <span className="capitalize font-medium">Depth: {item.length}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

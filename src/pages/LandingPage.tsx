import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  FileEdit, 
  MessageSquare, 
  Kanban, 
  Award,
  Users,
  Lock,
  ChevronRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';
import { api, setStoredToken } from '../services/api.ts';
import { User } from '../types/index.ts';

interface Props {
  onLoginSuccess: (user: User) => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<Props> = ({ onLoginSuccess, onExploreDemo }) => {
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.login({ email, password });
      setStoredToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.register({ email, password, name });
      setStoredToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Next-Gen Job Application Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Find better-matched jobs. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Tailor your application.
              </span> <br />
              Apply with confidence.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Job Hunter AI analyses job descriptions against your <strong>real verified experience</strong>, highlights genuine skill alignment, tailors your CV without hallucinating credentials, and prepares you for real interviews.
            </p>

            {/* Anti-fabrication promise banner */}
            <div className="pt-2 max-w-xl mx-auto">
              <AntiFabricationBadge />
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setAuthMode('register')}
                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDemo}
                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Demo Candidate Profile</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How Job Hunter AI Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              A transparent, ethical 4-step workflow that respects your actual career record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900">Build Your Master Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your genuine skills, employment history, education, and portfolio projects. Your Master CV remains the inviolable source of truth.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900">Analyse Job Requirements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search or paste any job description. Receive an estimated profile alignment score with exact cited evidence and clear gap flags.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900">Tailor CV & Q&A Honestly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate separate targeted CV versions and customized answers to application questions without inventing a single qualification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900">Apply & Track Interviews</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply directly on the official employer website, practice interview questions with STAR method, and track every stage in Kanban.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered For Serious Job Seekers
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every feature is built to give you genuine leverage during hiring cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Job Matching Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filters jobs based on verified programming languages, frameworks, preferred job titles, and location/remote preferences.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Citing Evidence for Matches</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When our AI confirms you match a requirement, it cites the exact experience, project, or credential verifying that claim.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileEdit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Targeted CV Versions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never overwrite your master CV. Create distinct tailored versions with optimized summaries and prioritized bullet points.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Application Answers Generator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste difficult questions like "Why should we hire you?" and receive short, medium, or detailed answers grounded in your real profile.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Interview Preparation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anticipate technical queries, role questions, and behavioral questions with full STAR methodology using your genuine project challenges.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Application Tracker (Kanban)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Keep tabs on every application across 8 distinct stages: Saved, Preparing, Applied, Assessment, Interview, Offer, Rejected, and Withdrawn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to apply with real confidence?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Stop sending generic resumes and start sending tailored, honest applications backed by genuine evidence.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setAuthMode('register')}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Create Free Candidate Account
            </button>
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            >
              Test Drive Demo
            </button>
          </div>
          <p className="text-xs text-slate-500 pt-6">
            &copy; 2026 Job Hunter AI. Built for responsible, honest career advancement.
          </p>
        </div>
      </section>

      {/* Auth Modal (Login / Register) */}
      {authMode !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {authMode === 'login' ? 'Sign in to Job Hunter AI' : 'Create Candidate Account'}
                </h3>
              </div>
              <button
                onClick={() => setAuthMode('none')}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {authError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {authError}
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="mt-4 space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Masango"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? 'Processing...'
                  : authMode === 'login'
                  ? 'Sign In'
                  : 'Register Account'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {authMode === 'login' ? "Don't have an account?" : 'Already registered?'}
              </span>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {authMode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

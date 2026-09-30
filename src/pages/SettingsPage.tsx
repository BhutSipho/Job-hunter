import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Mail, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { User as UserType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

interface Props {
  user: UserType;
  onResetDemo: () => void;
}

export const SettingsPage: React.FC<Props> = ({ user, onResetDemo }) => {
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [profRes, appsRes, cvRes, skillsRes, expRes] = await Promise.all([
        api.profile.getFullContext(),
        api.applications.list(),
        api.cv.getVersions(),
        api.skills.list(),
        api.experience.list(),
      ]);

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: { name: user.name, email: user.email },
        candidateProfile: profRes.context,
        skills: skillsRes.skills,
        experiences: expRes.experiences,
        applications: appsRes.applications,
        cvVersions: cvRes.versions,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `job-hunter-ai-backup-${user.email}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset your profile and sample jobs to the verified demo baseline? This will refresh all demonstration records.')) return;
    setResetting(true);
    try {
      await api.auth.demoLogin();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        onResetDemo();
      }, 1000);
    } catch (err) {
      console.error('Error resetting data:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Data Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account, export full data backups, and configure privacy controls.
        </p>
      </div>

      <AntiFabricationBadge />

      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          Active Account Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Full Name</span>
            <span className="font-bold text-slate-800 text-sm">{user.name}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Email Address</span>
            <span className="font-bold text-slate-800 text-sm">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          Export Candidate Data Backup
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Download a complete portable JSON archive containing your master profile, verified skills, tailored CV versions, and application tracker logs.
        </p>
        <button
          onClick={handleExportData}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? 'Generating JSON Backup...' : 'Download Full JSON Archive'}
        </button>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-600" />
          Reset Demo Data Baseline
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Need to test the initial workflow again? Re-seed the sample verified profile for Sipho Masango with sample job openings and demo applications.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl hover:bg-amber-100 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting Baseline...' : 'Reset to Verified Demo State'}
          </button>
          {resetSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Reset Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

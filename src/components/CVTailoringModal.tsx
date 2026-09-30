import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  Save, 
  FileEdit, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Briefcase,
  Layers,
  Code
} from 'lucide-react';
import { Job, CVVersion } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from './AntiFabricationBadge.tsx';

interface Props {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSavedVersion?: (version: CVVersion) => void;
}

export const CVTailoringModal: React.FC<Props> = ({
  job,
  isOpen,
  onClose,
  onSavedVersion,
}) => {
  const [loading, setLoading] = useState(false);
  const [tailoredVersion, setTailoredVersion] = useState<CVVersion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [editedSummary, setEditedSummary] = useState('');
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (isOpen && job) {
      generateTailored();
    } else {
      setTailoredVersion(null);
      setError(null);
      setSaveSuccess(false);
    }
  }, [isOpen, job?.id]);

  const generateTailored = async () => {
    if (!job) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.ai.tailorCV({ jobId: job.id, customJob: job });
      setTailoredVersion(res.version);
      setEditedSummary(res.version.tailoredSummary);
      setEditedSkills(res.version.prioritizedSkills || []);
      if (onSavedVersion) {
        onSavedVersion(res.version);
      }
    } catch (err: any) {
      console.error('Tailoring error:', err);
      setError(err.message || 'Unable to tailor CV. Please verify your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!tailoredVersion || !job) return;
    setSaving(true);
    try {
      const res = await api.cv.saveVersion({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        title: `Tailored for ${job.title} at ${job.company}`,
        tailoredSummary: editedSummary,
        prioritizedSkills: editedSkills,
        tailoredExperience: tailoredVersion.tailoredExperience,
        tailoredProjects: tailoredVersion.tailoredProjects,
        notes: tailoredVersion.notes,
      });
      setTailoredVersion(res.version);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSavedVersion) {
        onSavedVersion(res.version);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFormattedCV = () => {
    if (!tailoredVersion) return;
    const text = `CV TAILORED FOR: ${tailoredVersion.jobTitle} at ${tailoredVersion.company}

PROFESSIONAL SUMMARY
${editedSummary}

PRIORITIZED RELEVANT SKILLS
${editedSkills.join(' • ')}

RELEVANT EXPERIENCE
${tailoredVersion.tailoredExperience.map((e) => `${e.jobTitle} | ${e.company} (${e.period})
${e.bulletPoints.map((b) => `• ${b}`).join('\n')}
Technologies: ${e.highlightedTechnologies.join(', ')}`).join('\n\n')}

RELEVANT PROJECTS
${tailoredVersion.tailoredProjects.map((p) => `${p.name} (${p.role})
${p.bulletPoints.map((b) => `• ${b}`).join('\n')}
Technologies: ${p.technologies.join(', ')}`).join('\n\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Tailored CV Version</h2>
                <AntiFabricationBadge compact />
              </div>
              <p className="text-xs text-slate-500">
                Target Role: <span className="font-semibold text-slate-700">{job.title}</span> at {job.company}
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
              <p className="text-sm font-semibold text-slate-700">Tailoring CV specifically for {job.company}...</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Reorganizing verified experience, accentuating relevant technologies, and crafting an aligned summary without inventing any information.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Tailoring Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
                <button
                  onClick={generateTailored}
                  className="mt-2 px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors"
                >
                  Retry Tailoring
                </button>
              </div>
            </div>
          )}

          {!loading && tailoredVersion && (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  Your <strong>Master CV remains untouched</strong>. This is a separate saved version tailored for {job.company}.
                </span>
                {saveSuccess && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>

              {/* Printable CV Container */}
              <div id="printable-cv" className="bg-slate-50/60 p-6 rounded-xl border border-slate-200 space-y-5">
                {/* Section 1: Professional Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Tailored Professional Summary (Editable)
                    </label>
                    <span className="text-[11px] text-slate-400">Click to adjust wording</span>
                  </div>
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    rows={3}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Section 2: Prioritized Relevant Skills */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Prioritized Technical Skills for this Job
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200 rounded-lg">
                    {editedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-md"
                      >
                        {skill}
                        <button
                          onClick={() => setEditedSkills(editedSkills.filter((_, i) => i !== idx))}
                          className="hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 3: Tailored Experience */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Targeted Work Experience Bullet Points
                  </label>
                  <div className="space-y-3">
                    {tailoredVersion.tailoredExperience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <span className="font-bold text-sm text-slate-900">
                            {exp.jobTitle} &bull; <span className="text-indigo-600">{exp.company}</span>
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{exp.period}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {exp.bulletPoints.map((bp, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <span className="text-indigo-500 font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{bp}</span>
                            </li>
                          ))}
                        </ul>
                        {exp.highlightedTechnologies?.length > 0 && (
                          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-600">Highlighted Tech:</span>
                            {exp.highlightedTechnologies.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Relevant Projects */}
                {tailoredVersion.tailoredProjects?.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-600" />
                      Highlighted Projects
                    </label>
                    <div className="space-y-3">
                      {tailoredVersion.tailoredProjects.map((proj, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">{proj.name}</span>
                            <span className="text-xs text-slate-500 font-medium">{proj.role}</span>
                          </div>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {proj.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2">
                                <span className="text-indigo-500 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{bp}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-600">Tech: </span>
                            {proj.technologies.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFormattedCV}
              disabled={!tailoredVersion}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
            </button>
            <button
              onClick={handlePrint}
              disabled={!tailoredVersion}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveEdits}
              disabled={!tailoredVersion || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save CV Version'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

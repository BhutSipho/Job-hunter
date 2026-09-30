import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileEdit, 
  Save, 
  Check, 
  Copy, 
  Printer, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Upload,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MasterCV, CVVersion } from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

interface Props {
  onNavigate: (tab: string) => void;
}

export const MyCVPage: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'master' | 'versions'>('master');
  const [masterCV, setMasterCV] = useState<MasterCV | null>(null);
  const [rawText, setRawText] = useState('');
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<CVVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCVData();
  }, []);

  const loadCVData = async () => {
    setLoading(true);
    try {
      const [masterRes, verRes] = await Promise.all([
        api.cv.getMaster(),
        api.cv.getVersions(),
      ]);
      setMasterCV(masterRes.masterCV);
      setRawText(masterRes.masterCV?.rawText || '');
      setVersions(verRes.versions || []);
      if (verRes.versions && verRes.versions.length > 0) {
        setSelectedVersion(verRes.versions[0]);
      }
    } catch (err) {
      console.error('Error loading CV data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaster = async () => {
    setSaving(true);
    try {
      const res = await api.cv.updateMaster(rawText);
      setMasterCV(res.masterCV);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving master CV:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVersion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tailored CV version?')) return;
    try {
      await api.cv.deleteVersion(id);
      const remaining = versions.filter((v) => v.id !== id);
      setVersions(remaining);
      if (selectedVersion?.id === id) {
        setSelectedVersion(remaining[0] || null);
      }
    } catch (err) {
      console.error('Error deleting version:', err);
    }
  };

  const handleCopyVersion = () => {
    if (!selectedVersion) return;
    const formatted = `CV TAILORED FOR: ${selectedVersion.jobTitle} at ${selectedVersion.company}

PROFESSIONAL SUMMARY
${selectedVersion.tailoredSummary}

PRIORITIZED RELEVANT SKILLS
${selectedVersion.prioritizedSkills.join(' • ')}

RELEVANT EXPERIENCE
${selectedVersion.tailoredExperience.map((e) => `${e.jobTitle} | ${e.company} (${e.period})
${e.bulletPoints.map((b) => `• ${b}`).join('\n')}
Technologies: ${e.highlightedTechnologies.join(', ')}`).join('\n\n')}

RELEVANT PROJECTS
${selectedVersion.tailoredProjects.map((p) => `${p.name} (${p.role})
${p.bulletPoints.map((b) => `• ${b}`).join('\n')}
Technologies: ${p.technologies.join(', ')}`).join('\n\n')}
`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading CV records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">CV Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your Master CV as the source of truth, and organize saved tailored versions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'master' && (
            <>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Master CV Saved
                </span>
              )}
              <button
                onClick={handleSaveMaster}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Master CV'}
              </button>
            </>
          )}

          {activeTab === 'versions' && selectedVersion && (
            <>
              <button
                onClick={handleCopyVersion}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Formatted Text'}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
            </>
          )}
        </div>
      </div>

      <AntiFabricationBadge />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('master')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'master'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master CV (Source of Truth)</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'versions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tailored CV Versions ({versions.length})</span>
        </button>
      </div>

      {/* TAB 1: Master CV Editor */}
      {activeTab === 'master' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Permanent Source of Truth: </span>
              Your Master CV is never overwritten when you create tailored resumes for specific job descriptions. You can paste text or edit content directly below.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Master CV Plaintext / Markdown
              </label>
              <span className="text-[11px] text-slate-400">
                Last updated: {masterCV ? new Date(masterCV.updatedAt).toLocaleDateString() : 'Today'}
              </span>
            </div>
            <textarea
              rows={22}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-300 rounded-xl p-4 font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* TAB 2: Tailored Versions */}
      {activeTab === 'versions' && (
        <div>
          {versions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4">
              <FileEdit className="w-12 h-12 mx-auto text-slate-300" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No tailored CV versions saved yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Go to "Find Jobs" or "Saved Jobs", click "Tailor CV", and save your custom version for that specific role.
                </p>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
              >
                Go to Find Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Version Selector Sidebar */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Saved Versions
                </span>
                <div className="space-y-2">
                  {versions.map((ver) => (
                    <div
                      key={ver.id}
                      onClick={() => setSelectedVersion(ver)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedVersion?.id === ver.id
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{ver.jobTitle}</h4>
                          <p className="text-xs font-semibold text-indigo-700">{ver.company}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(ver.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVersion(ver.id);
                          }}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete Version"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version Detail Preview */}
              <div className="lg:col-span-8">
                {selectedVersion && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Tailored Version
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedVersion.title}</h3>
                        <p className="text-xs text-slate-500">
                          Target: {selectedVersion.jobTitle} at {selectedVersion.company}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                        Tailored Professional Summary
                      </span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        {selectedVersion.tailoredSummary}
                      </p>
                    </div>

                    {/* Prioritized Skills */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                        Prioritized Relevant Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVersion.prioritizedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tailored Experience */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                        Tailored Experience Bullet Points
                      </span>
                      <div className="space-y-3">
                        {selectedVersion.tailoredExperience.map((exp, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900">{exp.jobTitle} &bull; {exp.company}</span>
                              <span className="text-slate-500">{exp.period}</span>
                            </div>
                            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                              {exp.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx}>{bp}</li>
                              ))}
                            </ul>
                            {exp.highlightedTechnologies?.length > 0 && (
                              <p className="text-[11px] text-slate-500 pt-1">
                                <span className="font-semibold">Tech:</span> {exp.highlightedTechnologies.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tailored Projects */}
                    {selectedVersion.tailoredProjects?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                          Targeted Projects
                        </span>
                        <div className="space-y-3">
                          {selectedVersion.tailoredProjects.map((p, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-900">{p.name}</span>
                                <span className="text-slate-500 font-semibold">{p.role}</span>
                              </div>
                              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                                {p.bulletPoints.map((bp, bIdx) => (
                                  <li key={bIdx}>{bp}</li>
                                ))}
                              </ul>
                              <p className="text-[11px] text-slate-500 pt-1">
                                <span className="font-semibold">Tech:</span> {p.technologies.join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

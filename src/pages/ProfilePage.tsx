import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  AlertCircle,
  ExternalLink,
  Layers,
  Edit2
} from 'lucide-react';
import { 
  CandidateProfile, 
  Skill, 
  Experience, 
  Education, 
  Certification, 
  Project,
  SkillCategory 
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { AntiFabricationBadge } from '../components/AntiFabricationBadge.tsx';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // States
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Skill Add Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [newSkillYears, setNewSkillYears] = useState('2');

  // Experience Add Modal
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExp, setNewExp] = useState({
    company: '',
    jobTitle: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    responsibilities: '',
    technologies: '',
    achievements: '',
  });

  // Education Add Modal
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({
    institution: '',
    qualification: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    completionStatus: 'completed' as 'completed' | 'in_progress' | 'did_not_complete',
    description: '',
  });

  // Project Add Modal
  const [showAddProj, setShowAddProj] = useState(false);
  const [newProj, setNewProj] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    role: 'Lead Developer',
    status: 'completed' as 'completed' | 'in_progress' | 'maintained',
  });

  // Cert Add Modal
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({
    name: '',
    provider: '',
    issueDate: '',
    credentialUrl: '',
    description: '',
  });

  useEffect(() => {
    loadAllProfileData();
  }, []);

  const loadAllProfileData = async () => {
    setLoading(true);
    try {
      const [profRes, skRes, expRes, eduRes, certRes, projRes] = await Promise.all([
        api.profile.get(),
        api.skills.list(),
        api.experience.list(),
        api.education.list(),
        api.certifications.list(),
        api.projects.list(),
      ]);

      setProfile(profRes.profile);
      setSkills(skRes.skills || []);
      setExperiences(expRes.experiences || []);
      setEducations(eduRes.educations || []);
      setCertifications(certRes.certifications || []);
      setProjects(projRes.projects || []);
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.profile.update(profile);
      setProfile(res.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      const res = await api.skills.add({
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
        yearsExperience: Number(newSkillYears) || undefined,
      });
      setSkills((prev) => [...prev, res.skill]);
      setNewSkillName('');
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.skills.delete(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.experience.add({
        company: newExp.company,
        jobTitle: newExp.jobTitle,
        location: newExp.location,
        startDate: newExp.startDate,
        endDate: newExp.isCurrent ? 'Present' : newExp.endDate,
        isCurrent: newExp.isCurrent,
        description: newExp.description,
        responsibilities: newExp.responsibilities.split('\n').filter(Boolean),
        technologies: newExp.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        achievements: newExp.achievements.split('\n').filter(Boolean),
      });
      setExperiences((prev) => [res.experience, ...prev]);
      setShowAddExp(false);
      setNewExp({
        company: '',
        jobTitle: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        responsibilities: '',
        technologies: '',
        achievements: '',
      });
    } catch (err) {
      console.error('Error adding experience:', err);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await api.experience.delete(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting experience:', err);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.education.add({
        institution: newEdu.institution,
        qualification: newEdu.qualification,
        fieldOfStudy: newEdu.fieldOfStudy,
        startDate: newEdu.startDate,
        endDate: newEdu.endDate,
        completionStatus: newEdu.completionStatus,
        description: newEdu.description,
      });
      setEducations((prev) => [...prev, res.education]);
      setShowAddEdu(false);
      setNewEdu({
        institution: '',
        qualification: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        completionStatus: 'completed',
        description: '',
      });
    } catch (err) {
      console.error('Error adding education:', err);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      await api.education.delete(id);
      setEducations((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting education:', err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.projects.add({
        name: newProj.name,
        description: newProj.description,
        technologies: newProj.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        githubUrl: newProj.githubUrl,
        liveUrl: newProj.liveUrl,
        role: newProj.role,
        status: newProj.status,
      });
      setProjects((prev) => [...prev, res.project]);
      setShowAddProj(false);
      setNewProj({
        name: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        role: 'Lead Developer',
        status: 'completed',
      });
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.certifications.add({
        name: newCert.name,
        provider: newCert.provider,
        issueDate: newCert.issueDate,
        credentialUrl: newCert.credentialUrl,
        description: newCert.description,
      });
      setCertifications((prev) => [...prev, res.certification]);
      setShowAddCert(false);
      setNewCert({
        name: '',
        provider: '',
        issueDate: '',
        credentialUrl: '',
        description: '',
      });
    } catch (err) {
      console.error('Error adding certification:', err);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    try {
      await api.certifications.delete(id);
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting certification:', err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading candidate profile data...</p>
      </div>
    );
  }

  const skillCategories: { id: SkillCategory; label: string }[] = [
    { id: 'languages', label: 'Languages' },
    { id: 'frameworks', label: 'Frameworks' },
    { id: 'databases', label: 'Databases' },
    { id: 'cloud', label: 'Cloud & DevOps' },
    { id: 'tools', label: 'Developer Tools' },
    { id: 'soft', label: 'Soft Skills' },
    { id: 'other', label: 'Other Skills' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Candidate Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            This structured record is the single source of truth for all AI matching and honest CV tailoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes saved
            </span>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <AntiFabricationBadge />

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'personal', label: 'Personal & Role', icon: User },
          { id: 'skills', label: `Skills (${skills.length})`, icon: Layers },
          { id: 'experience', label: `Experience (${experiences.length})`, icon: Briefcase },
          { id: 'education', label: `Education (${educations.length})`, icon: GraduationCap },
          { id: 'certifications', label: `Certifications (${certifications.length})`, icon: Award },
          { id: 'projects', label: `Projects (${projects.length})`, icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Personal & Professional */}
      {activeTab === 'personal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.personal.fullName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, fullName: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.personal.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, email: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={profile.personal.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, phone: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profile.personal.city}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, city: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Province / State</label>
                <input
                  type="text"
                  value={profile.personal.province}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, province: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.personal.country}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, country: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={profile.personal.linkedIn}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, linkedIn: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio Website</label>
                <input
                  type="url"
                  placeholder="https://myportfolio.dev"
                  value={profile.personal.portfolio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, portfolio: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={profile.personal.github}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personal: { ...profile.personal, github: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Professional Profile</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  placeholder="e.g. Junior Full Stack Developer"
                  value={profile.professional.title}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      professional: { ...profile.professional, title: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Expectation</label>
                <input
                  type="text"
                  placeholder="e.g. R35,000 - R45,000 / month"
                  value={profile.professional.salaryExpectation}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      professional: { ...profile.professional, salaryExpectation: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
              <textarea
                rows={4}
                value={profile.professional.summary}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    professional: { ...profile.professional, summary: e.target.value },
                  })
                }
                className="w-full text-xs border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remote Preference</label>
                <select
                  value={profile.professional.remotePreference}
                  onChange={(e: any) =>
                    setProfile({
                      ...profile,
                      professional: { ...profile.professional, remotePreference: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="any">Open to Any (Remote, Hybrid, Onsite)</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={profile.professional.employmentType}
                  onChange={(e: any) =>
                    setProfile({
                      ...profile,
                      professional: { ...profile.professional, employmentType: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="any">Any</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Skills */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Add skill form */}
          <form onSubmit={handleAddSkill} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Verified Skill</h3>
            <p className="text-[11px] text-slate-500">
              Only add skills you possess genuine experience in. Our matching engine tests jobs against these tags.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Skill name (e.g. TypeScript, React, PostgreSQL)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={newSkillCategory}
                  onChange={(e: any) => setNewSkillCategory(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {skillCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={newSkillProficiency}
                  onChange={(e: any) => setNewSkillProficiency(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </form>

          {/* Categorized Skills Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillCategories.map((cat) => {
              const categorySkills = skills.filter((s) => s.category === cat.id);
              return (
                <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{cat.label}</h4>
                    <span className="text-[11px] font-semibold text-slate-400">{categorySkills.length}</span>
                  </div>

                  {categorySkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No skills added in this category yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 group hover:border-indigo-300 transition-colors"
                        >
                          <span>{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({s.proficiency})</span>
                          <button
                            onClick={() => handleDeleteSkill(s.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                            title="Delete Skill"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Your real employment history. The AI only cites experiences recorded here.
            </p>
            <button
              onClick={() => setShowAddExp(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </button>
          </div>

          {experiences.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500">No work experiences added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h4>
                      <p className="text-xs text-indigo-700 font-semibold">{exp.company} &bull; {exp.location || 'Remote'}</p>
                      <p className="text-[11px] text-slate-400">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                  )}

                  {exp.responsibilities?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700">Responsibilities:</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {exp.responsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.technologies.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Experience Modal */}
          {showAddExp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                <h3 className="text-base font-bold text-slate-900 mb-3">Add Work Experience</h3>
                <form onSubmit={handleAddExperience} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Company *</label>
                      <input
                        type="text"
                        required
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Job Title *</label>
                      <input
                        type="text"
                        required
                        value={newExp.jobTitle}
                        onChange={(e) => setNewExp({ ...newExp, jobTitle: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Start Date (YYYY-MM) *</label>
                      <input
                        type="text"
                        required
                        placeholder="2024-01"
                        value={newExp.startDate}
                        onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                      <input
                        type="text"
                        placeholder="2025-01 or leave blank if current"
                        disabled={newExp.isCurrent}
                        value={newExp.endDate}
                        onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                        className="w-full border rounded-lg p-2 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newExp.isCurrent}
                      onChange={(e) => setNewExp({ ...newExp, isCurrent: e.target.checked })}
                    />
                    <span>This is my current role</span>
                  </label>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Key Responsibilities (One per line)</label>
                    <textarea
                      rows={3}
                      placeholder="Developed React UI components..."
                      value={newExp.responsibilities}
                      onChange={(e) => setNewExp({ ...newExp, responsibilities: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Technologies Used (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, Python, PostgreSQL"
                      value={newExp.technologies}
                      onChange={(e) => setNewExp({ ...newExp, technologies: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Save Experience
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Education */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Control your completion status honestly. The AI will never state a degree was completed if marked in-progress.
            </p>
            <button
              onClick={() => setShowAddEdu(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
          </div>

          <div className="space-y-3">
            {educations.map((edu) => (
              <div key={edu.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{edu.qualification}</h4>
                    <p className="text-xs text-indigo-700 font-semibold">{edu.institution} &bull; {edu.fieldOfStudy}</p>
                    <p className="text-[11px] text-slate-400">{edu.startDate} - {edu.endDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      edu.completionStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {edu.completionStatus.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {edu.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{edu.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Add Education Modal */}
          {showAddEdu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                <h3 className="text-base font-bold text-slate-900 mb-3">Add Education Record</h3>
                <form onSubmit={handleAddEducation} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Institution *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. University of Johannesburg"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Qualification *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diploma in Information Technology"
                      value={newEdu.qualification}
                      onChange={(e) => setNewEdu({ ...newEdu, qualification: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Field of Study</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Development"
                      value={newEdu.fieldOfStudy}
                      onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                      <input
                        type="text"
                        placeholder="2021"
                        value={newEdu.startDate}
                        onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                      <input
                        type="text"
                        placeholder="2023"
                        value={newEdu.endDate}
                        onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Completion Status *</label>
                    <select
                      value={newEdu.completionStatus}
                      onChange={(e: any) => setNewEdu({ ...newEdu, completionStatus: e.target.value })}
                      className="w-full border rounded-lg p-2 bg-white"
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="did_not_complete">Did Not Complete</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEdu(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Save Education
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Certifications */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Only verified credentials with accredited providers.
            </p>
            <button
              onClick={() => setShowAddCert(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certifications.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                    <p className="text-xs text-indigo-700 font-semibold">{c.provider} &bull; {c.issueDate}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCertification(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <span>View Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Add Certification Modal */}
          {showAddCert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                <h3 className="text-base font-bold text-slate-900 mb-3">Add Certification</h3>
                <form onSubmit={handleAddCertification} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Certification Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meta Front-End Developer"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Provider *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coursera / Meta"
                      value={newCert.provider}
                      onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Issue Date</label>
                    <input
                      type="text"
                      placeholder="2024-05"
                      value={newCert.issueDate}
                      onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Credential URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newCert.credentialUrl}
                      onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCert(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Save Certification
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              The AI only cites projects that exist in your profile.
            </p>
            <button
              onClick={() => setShowAddProj(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold">{p.role}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.technologies.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 text-[11px] text-blue-600 font-medium">
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <Code className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Project Modal */}
          {showAddProj && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                <h3 className="text-base font-bold text-slate-900 mb-3">Add Portfolio Project</h3>
                <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Project Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SaaS Task & Resource Tracker"
                      value={newProj.name}
                      onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Your Role</label>
                    <input
                      type="text"
                      placeholder="Solo Creator / Full-Stack Developer"
                      value={newProj.role}
                      onChange={(e) => setNewProj({ ...newProj, role: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain the problem solved, architecture, and results..."
                      value={newProj.description}
                      onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Technologies (Comma-separated) *</label>
                    <input
                      type="text"
                      required
                      placeholder="React, TypeScript, Express, PostgreSQL"
                      value={newProj.technologies}
                      onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">GitHub URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={newProj.githubUrl}
                        onChange={(e) => setNewProj({ ...newProj, githubUrl: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Live Demo URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newProj.liveUrl}
                        onChange={(e) => setNewProj({ ...newProj, liveUrl: e.target.value })}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProj(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Save Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

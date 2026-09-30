import React, { useState, useEffect } from 'react';
import { 
  Kanban as KanbanIcon, 
  Table as TableIcon, 
  Plus, 
  Calendar, 
  ExternalLink, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { Application, ApplicationStatus } from '../types/index.ts';
import { api } from '../services/api.ts';

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'saved', label: 'Saved', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'preparing', label: 'Preparing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'applied', label: 'Applied', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'assessment', label: 'Assessment', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'interview', label: 'Interview', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'withdrawn', label: 'Withdrawn', color: 'bg-slate-50 text-slate-500 border-slate-200' },
];

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlNotice, setUrlNotice] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: 'Remote',
    jobUrl: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'applied' as ApplicationStatus,
    notes: '',
    salaryOffered: '',
    interviewDate: '',
    followUpDate: '',
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.applications.list();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingApp(null);
    setUrlNotice(null);
    setFormData({
      company: '',
      role: '',
      location: 'Remote',
      jobUrl: '',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      notes: '',
      salaryOffered: '',
      interviewDate: '',
      followUpDate: '',
    });
    setShowModal(true);
  };

  const handleAutoFillFromLink = async () => {
    if (!formData.jobUrl.trim()) return;
    setFetchingUrl(true);
    setUrlNotice(null);
    try {
      const res = await api.jobs.fromLink({ url: formData.jobUrl.trim(), autoSave: true });
      setFormData((prev) => ({
        ...prev,
        company: res.job.company || prev.company,
        role: res.job.title || prev.role,
        location: res.job.location || prev.location,
        salaryOffered: res.job.salary || prev.salaryOffered,
      }));
      setUrlNotice(`Auto-filled: ${res.job.title} at ${res.job.company}`);
    } catch (err: any) {
      setUrlNotice('Could not auto-detect details. You can enter Company and Role manually.');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleOpenEdit = (app: Application) => {
    setEditingApp(app);
    setUrlNotice(null);
    setFormData({
      company: app.company,
      role: app.role,
      location: app.location || 'Remote',
      jobUrl: app.jobUrl || '',
      applicationDate: app.applicationDate || '',
      status: app.status,
      notes: app.notes || '',
      salaryOffered: app.salaryOffered || '',
      interviewDate: app.interviewDate || '',
      followUpDate: app.followUpDate || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If user only provided a jobUrl without company/role, let backend auto-extract
      if (formData.jobUrl && (!formData.company || !formData.role)) {
        setFetchingUrl(true);
      }
      if (editingApp) {
        const res = await api.applications.update(editingApp.id, formData);
        setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? res.application : a)));
      } else {
        const res = await api.applications.create(formData);
        setApplications((prev) => [res.application, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving application');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await api.applications.update(appId, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === appId ? res.application : a)));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    try {
      await api.applications.delete(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const filtered = applications.filter(
    (a) =>
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track interview timelines, notes, and stages across all your active job searches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {applications.length} applications
        </span>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading tracker...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filtered.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-slate-100/70 border border-slate-200 rounded-2xl p-3 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-xs">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{app.role}</h4>
                          <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {app.company}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(app)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {app.salaryOffered && (
                        <p className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-500" />
                          {app.salaryOffered}
                        </p>
                      )}

                      {app.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg line-clamp-2">
                          {app.notes}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Applied: {app.applicationDate}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Quick Move Dropdown */}
                      <div className="pt-1">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded-md p-1 font-semibold text-slate-700 cursor-pointer"
                        >
                          {STATUS_COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              Move to: {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Interview</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{app.company}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{app.role}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white cursor-pointer"
                      >
                        {STATUS_COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{app.applicationDate}</td>
                    <td className="py-3.5 px-4 text-indigo-600 font-semibold">{app.interviewDate || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs">{app.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(app)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingApp ? 'Edit Application' : 'Track New Application'}
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              You can track an application by <strong>entering only the job link</strong> or filling in details manually.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Job URL Section at the top */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2">
                <label className="font-bold text-indigo-950 block">
                  Job Link (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/jobs/view/... or company career page"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    className="flex-1 border border-indigo-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFillFromLink}
                    disabled={fetchingUrl || !formData.jobUrl.trim()}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {fetchingUrl ? 'Detecting...' : 'Auto-fill from Link'}
                  </button>
                </div>
                {urlNotice && (
                  <p className="text-[11px] text-indigo-700 font-medium">
                    {urlNotice}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="Auto-detected if link provided"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    placeholder="Auto-detected if link provided"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Remote, Cape Town, etc."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    {STATUS_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Application Date</label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Salary Offered (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. R42,000 / month"
                    value={formData.salaryOffered}
                    onChange={(e) => setFormData({ ...formData, salaryOffered: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interview Date (if scheduled)</label>
                <input
                  type="datetime-local"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes & Follow-ups</label>
                <textarea
                  rows={2}
                  placeholder="Notes about interview rounds, assessment details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fetchingUrl}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                >
                  {fetchingUrl ? 'Detecting & Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

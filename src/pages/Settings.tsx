import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User, Moon, RotateCcw, Download,
  Upload, Shield, Bell, Check, Sparkles, CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const { profile, updateProfile, resetData } = useApp();

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    university: profile.university,
    program: profile.program,
    semester: profile.semester,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data to default samples? Any custom items will be restored to default.')) {
      resetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportData = () => {
    const data = {
      subjects: localStorage.getItem('ep_subjects'),
      exams: localStorage.getItem('ep_exams'),
      assignments: localStorage.getItem('ep_assignments'),
      sessions: localStorage.getItem('ep_sessions'),
      resources: localStorage.getItem('ep_resources'),
      profile: localStorage.getItem('ep_profile'),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exampulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
          Settings & Preferences
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          Manage your student profile, visual theme, and local academic data
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-blue-light)] dark:bg-[rgba(101,157,225,0.15)] flex items-center justify-center text-[var(--color-blue-primary)]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              Student Profile
            </h2>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Your academic identity across ExamPulse
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label>University / Institute</label>
              <input
                type="text"
                value={form.university}
                onChange={e => setForm({ ...form, university: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Current Semester</label>
              <select
                value={form.semester}
                onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label>Major / Degree Program</label>
            <input
              type="text"
              value={form.program}
              onChange={e => setForm({ ...form, program: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-[12px] text-[var(--color-green-muted)] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : <span />}

            <button type="submit" className="btn btn-primary btn-sm">
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Theme Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(99,154,226,0.15)] flex items-center justify-center text-[#8CB8F0]">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                Appearance & Theme
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Permanent Dark Command Center active for deep focus and contrast
              </p>
            </div>
          </div>

          <div className="badge badge-blue flex items-center gap-1.5 px-3 py-1 text-[11.5px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dark Mode Active</span>
          </div>
        </div>
      </div>

      {/* Data Management & Reset Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-coral-muted)]/15 flex items-center justify-center text-[var(--color-coral-muted)]">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              Data Management & Backup
            </h2>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Export your schedules or reset to default demo dataset
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                Export Academic Backup
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                Save a local JSON snapshot of your exams, assignments, study sessions, and subjects.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="btn btn-secondary btn-sm mt-3.5 self-start flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                Reset Sample Data
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                Restore the default realistic demo curriculum, exams, and study logs.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3.5">
              <button
                onClick={handleResetData}
                className="btn btn-secondary btn-sm text-red-400 hover:bg-red-950/30 hover:border-red-800/50"
              >
                Reset to Defaults
              </button>
              {resetSuccess && (
                <span className="text-[11px] text-[var(--color-green-muted)] font-medium">
                  Reset complete!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

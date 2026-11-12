import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Search, FileText, ExternalLink, Trash2,
  FolderOpen, BookMarked, Download, Link2, BookOpen
} from 'lucide-react';
import Modal from '../components/common/Modal';
import type { Resource, ResourceCategory, Subject } from '../types';

export default function Resources() {
  const { resources, subjects, getSubjectById, addResource, deleteResource } = useApp();

  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New resource form state
  const [form, setForm] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    category: 'lecture-notes' as ResourceCategory,
    description: '',
    url: '',
  });

  const categories: { key: ResourceCategory | 'all'; label: string; count?: number }[] = [
    { key: 'all', label: 'All Resources' },
    { key: 'lecture-notes', label: 'Lecture Notes' },
    { key: 'pdfs', label: 'PDFs & Cheatsheets' },
    { key: 'pyqs', label: 'Previous Year Papers' },
    { key: 'reference-links', label: 'Reference Links' },
    { key: 'assignments', label: 'Lab & Assignments' },
    { key: 'other', label: 'Other Materials' },
  ];

  const filteredResources = useMemo(() => {
    return resources.filter((r: Resource) => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      if (selectedSubject !== 'all' && r.subjectId !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subj = getSubjectById(r.subjectId);
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q);
        const matchSubj = subj?.name.toLowerCase().includes(q) || subj?.code.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubj) return false;
      }
      return true;
    });
  }, [resources, activeCategory, selectedSubject, searchQuery, getSubjectById]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subjectId) return;

    addResource({
      title: form.title.trim(),
      subjectId: form.subjectId,
      category: form.category,
      description: form.description.trim(),
      url: form.url.trim() || undefined,
    });

    setForm({
      title: '',
      subjectId: subjects[0]?.id || '',
      category: 'lecture-notes',
      description: '',
      url: '',
    });
    setShowAddModal(false);
  };

  const getCategoryBadgeClass = (category: ResourceCategory) => {
    switch (category) {
      case 'lecture-notes': return 'badge-blue';
      case 'pyqs': return 'badge-coral';
      case 'pdfs': return 'badge-yellow';
      case 'reference-links': return 'badge-green';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
            Notes & Resources Library
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            Central repository for lecture slides, pyqs, drive links, and study sheets
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Resource
        </button>
      </div>

      {/* Filter and Category Controls */}
      <div className="card p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] pb-2.5">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                activeCategory === cat.key
                  ? 'bg-[var(--color-blue-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents and notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="!py-1.5 !pl-8 !text-[12px] w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="!py-1.5 !text-[12px] w-full sm:w-auto"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s: Subject) => (
                <option key={s.id} value={s.id}>{s.code} – {s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredResources.map((resource: Resource) => {
            const subject = getSubjectById(resource.subjectId);
            return (
              <div
                key={resource.id}
                className="card p-4 hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`badge ${getCategoryBadgeClass(resource.category)} text-[10px]`}>
                      {resource.category.replace('-', ' ')}
                    </span>
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="text-[var(--color-text-secondary)] hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity p-1"
                      title="Delete resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] leading-snug">
                    {resource.title}
                  </h3>

                  {resource.description && (
                    <p className="text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: subject?.color || '#659DE1' }}
                    />
                    <span className="font-medium truncate max-w-[120px]">{subject?.code}</span>
                  </div>

                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-blue-primary)] hover:underline font-medium"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[var(--color-text-secondary)]">Internal Note</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12 text-[var(--color-text-secondary)]">
          <FolderOpen className="w-9 h-9 mx-auto mb-2 opacity-40 text-[var(--color-blue-primary)]" />
          <p className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
            No resources match your filter
          </p>
          <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
            Add notes, links, or cheatsheets to keep your study material handy
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm mt-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload First Resource
          </button>
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Academic Resource"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3">
          <div>
            <label>Subject</label>
            <select
              value={form.subjectId}
              onChange={e => setForm({ ...form, subjectId: e.target.value })}
              required
            >
              <option value="">Select subject</option>
              {subjects.map((s: Subject) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Unit 3 Slides - Concurrency & Threads"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as ResourceCategory })}
            >
              <option value="lecture-notes">Lecture Notes</option>
              <option value="pdfs">PDFs & Cheatsheets</option>
              <option value="pyqs">Previous Year Questions</option>
              <option value="reference-links">Reference Link</option>
              <option value="assignments">Assignment Material</option>
              <option value="other">Other Material</option>
            </select>
          </div>

          <div>
            <label>URL / Web Reference (Optional)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
            />
          </div>

          <div>
            <label>Notes & Summary</label>
            <textarea
              rows={3}
              placeholder="Key concepts or chapters covered..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Resource
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

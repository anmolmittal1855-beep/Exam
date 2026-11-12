import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Priority } from '../../types';

interface ExamFormProps {
  onClose: () => void;
  initialData?: { id?: string; subjectId: string; title: string; date: string; time: string; duration: number; venue: string; priority: Priority; notes: string };
}

export default function ExamForm({ onClose, initialData }: ExamFormProps) {
  const { subjects, addExam, updateExam } = useApp();
  const [form, setForm] = useState({
    subjectId: initialData?.subjectId || subjects[0]?.id || '',
    title: initialData?.title || '',
    date: initialData?.date || '',
    time: initialData?.time || '10:00',
    duration: initialData?.duration || 120,
    venue: initialData?.venue || '',
    priority: initialData?.priority || 'medium' as Priority,
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.title || !form.date) return;

    if (initialData?.id) {
      updateExam(initialData.id, form);
    } else {
      addExam(form);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label>Subject</label>
        <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
          <option value="">Select subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
        </select>
      </div>
      <div>
        <label>Exam Title</label>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mid-Semester Examination" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div>
          <label>Time</label>
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Duration (minutes)</label>
          <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} min={15} max={300} />
        </div>
        <div>
          <label>Priority</label>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <label>Venue (optional)</label>
        <input type="text" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Hall A, Block 3" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">{initialData?.id ? 'Update' : 'Add'} Exam</button>
      </div>
    </form>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Priority, AssignmentStatus } from '../../types';

interface AssignmentFormProps {
  onClose: () => void;
  initialData?: { id?: string; subjectId: string; title: string; description: string; dueDate: string; dueTime: string; priority: Priority; status: AssignmentStatus };
}

export default function AssignmentForm({ onClose, initialData }: AssignmentFormProps) {
  const { subjects, addAssignment, updateAssignment } = useApp();
  const [form, setForm] = useState({
    subjectId: initialData?.subjectId || subjects[0]?.id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate || '',
    dueTime: initialData?.dueTime || '23:59',
    priority: initialData?.priority || 'medium' as Priority,
    status: initialData?.status || 'not-started' as AssignmentStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.title || !form.dueDate) return;

    if (initialData?.id) {
      updateAssignment(initialData.id, form);
    } else {
      addAssignment(form);
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
        <label>Title</label>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" required />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description..."
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Due Date</label>
          <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
        </div>
        <div>
          <label>Due Time</label>
          <input type="time" value={form.dueTime} onChange={e => setForm({ ...form, dueTime: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Priority</label>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as AssignmentStatus })}>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">{initialData?.id ? 'Update' : 'Add'} Assignment</button>
      </div>
    </form>
  );
}

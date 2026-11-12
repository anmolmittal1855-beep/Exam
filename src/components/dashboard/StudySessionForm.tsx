import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface StudySessionFormProps {
  onClose: () => void;
}

export default function StudySessionForm({ onClose }: StudySessionFormProps) {
  const { subjects, addStudySession } = useApp();
  const [form, setForm] = useState({
    subjectId: subjects[0]?.id || '',
    topic: '',
    date: '',
    startTime: '09:00',
    duration: 60,
    completed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.topic || !form.date) return;
    addStudySession(form);
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
        <label>Topic / Chapter</label>
        <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Dynamic Programming" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div>
          <label>Start Time</label>
          <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
        </div>
      </div>
      <div>
        <label>Duration (minutes)</label>
        <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} min={15} max={240} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Add Session</button>
      </div>
    </form>
  );
}

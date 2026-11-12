import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateId } from '../../utils/helpers';

import type { Topic } from '../../types';

const subjectColors = ['#659DE1', '#78B88A', '#E9A48C', '#C47A9A', '#A09A60', '#7B8EC8', '#D4956B'];

interface SubjectFormProps {
  onClose: () => void;
}

export default function SubjectForm({ onClose }: SubjectFormProps) {
  const { addSubject, subjects } = useApp();
  const [form, setForm] = useState({
    name: '',
    code: '',
    faculty: '',
    semester: 5,
    color: subjectColors[subjects.length % subjectColors.length],
    topics: [] as Topic[],
  });
  const [topicInput, setTopicInput] = useState('');

  const addTopic = () => {
    if (!topicInput.trim()) return;
    setForm({
      ...form,
      topics: [...form.topics, { id: generateId(), name: topicInput.trim(), status: 'not-started' }],
    });
    setTopicInput('');
  };

  const removeTopic = (id: string) => {
    setForm({ ...form, topics: form.topics.filter(t => t.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    addSubject(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label>Subject Name</label>
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures & Algorithms" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Subject Code</label>
          <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS301" required />
        </div>
        <div>
          <label>Semester</label>
          <input type="number" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} min={1} max={10} />
        </div>
      </div>
      <div>
        <label>Faculty Name</label>
        <input type="text" value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} placeholder="e.g. Dr. Arun Mehta" />
      </div>
      <div>
        <label>Colour</label>
        <div className="flex gap-2 mt-1">
          {subjectColors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-[var(--color-blue-primary)]' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label>Topics / Chapters</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            placeholder="Add a topic..."
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
          />
          <button type="button" onClick={addTopic} className="btn btn-secondary btn-sm flex-shrink-0">Add</button>
        </div>
        {form.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.topics.map(t => (
              <span key={t.id} className="badge badge-blue flex items-center gap-1">
                {t.name}
                <button type="button" onClick={() => removeTopic(t.id)} className="ml-0.5 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Add Subject</button>
      </div>
    </form>
  );
}

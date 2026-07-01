import React, { useEffect, useState } from 'react';
import client from '../api/client';

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', dueDate: '', courseId: '', priority: 'medium', notes: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    const [tasksRes, coursesRes] = await Promise.all([
      client.get('/planner'),
      client.get('/courses')
    ]);
    setTasks(tasksRes.data);
    setCourses(coursesRes.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await client.post('/planner', { ...form, courseId: form.courseId || null });
      setForm({ title: '', dueDate: '', courseId: '', priority: 'medium', notes: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add task.');
    }
  };

  const toggleComplete = async (task) => {
    await client.patch(`/planner/${task.id}`, { completed: !task.completed });
    load();
  };

  const handleDelete = async (id) => {
    await client.delete(`/planner/${id}`);
    load();
  };

  const courseName = (id) => courses.find((c) => c.id === id)?.code;

  const sorted = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <div className="page">
      <h1>Academic Planner</h1>
      {message && <div className="alert-error">{message}</div>}

      <div className="resources-layout">
        <div className="resource-list">
          {sorted.map((t) => (
            <div className={`task-item priority-${t.priority} ${t.completed ? 'completed' : ''}`} key={t.id}>
              <label className="task-check">
                <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t)} />
                <div>
                  <strong>{t.title}</strong>
                  {t.courseId && <span className="badge small">{courseName(t.courseId)}</span>}
                  <p className="muted small">Due {new Date(t.dueDate).toLocaleDateString()} • {t.priority} priority</p>
                  {t.notes && <p className="muted small">{t.notes}</p>}
                </div>
              </label>
              <button className="btn-link" onClick={() => handleDelete(t.id)}>Delete</button>
            </div>
          ))}
          {sorted.length === 0 && <p className="muted">No tasks yet — add your first deadline.</p>}
        </div>

        <form className="upload-card" onSubmit={handleAdd}>
          <h3>Add a task</h3>
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label>Due date</label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <label>Course (optional)</label>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">None</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <label>Notes</label>
          <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="btn-primary">Add Task</button>
        </form>
      </div>
    </div>
  );
}

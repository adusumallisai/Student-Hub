import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Resources() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', courseId: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const loadCourses = async () => {
    const res = await client.get('/courses');
    setCourses(res.data);
    if (res.data.length && !form.courseId) {
      setForm((f) => ({ ...f, courseId: res.data[0].id }));
    }
  };

  const loadResources = async (courseId) => {
    const res = await client.get('/resources', { params: courseId ? { courseId } : {} });
    setResources(res.data);
  };

  useEffect(() => { loadCourses(); loadResources(); }, []);
  useEffect(() => { loadResources(courseFilter); }, [courseFilter]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!file) { setMessage('Please choose a file.'); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('courseId', form.courseId);
      fd.append('file', file);
      await client.post('/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Resource uploaded.');
      setForm((f) => ({ ...f, title: '', description: '' }));
      setFile(null);
      loadResources(courseFilter);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/resources/${id}`);
      loadResources(courseFilter);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed.');
    }
  };

  const courseName = (id) => courses.find((c) => c.id === id)?.code || 'Unknown';

  return (
    <div className="page">
      <h1>Shared Resources</h1>
      {message && <div className="alert-info">{message}</div>}

      <div className="resources-layout">
        <div className="resource-list">
          <div className="filter-row">
            <label>Filter by course:</label>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">All courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
            </select>
          </div>
          {resources.map((r) => (
            <div className="resource-item" key={r.id}>
              <div>
                <strong>{r.title}</strong>
                <span className="badge small">{courseName(r.courseId)}</span>
                <p className="muted small">{r.description}</p>
                <p className="muted small">Uploaded by {r.uploadedByName} • {(r.fileSize / 1024).toFixed(0)} KB</p>
              </div>
              <div className="resource-actions">
                <a className="btn-secondary-small" href={`/api/resources/${r.id}/download`}>Download</a>
                {user?.id === r.uploadedBy && (
                  <button className="btn-link" onClick={() => handleDelete(r.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
          {resources.length === 0 && <p className="muted">No resources found for this filter.</p>}
        </div>

        <form className="upload-card" onSubmit={handleUpload}>
          <h3>Share a resource</h3>
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <label>Course</label>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>
          <label>File</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          <button className="btn-primary" disabled={busy}>{busy ? 'Uploading...' : 'Upload'}</button>
        </form>
      </div>
    </div>
  );
}

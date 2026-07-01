import React, { useEffect, useState } from 'react';
import client from '../api/client';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [myCourseIds, setMyCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const [allRes, mineRes] = await Promise.all([
      client.get('/courses'),
      client.get('/courses/mine/list')
    ]);
    setCourses(allRes.data);
    setMyCourseIds(new Set(mineRes.data.map((c) => c.id)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEnroll = async (courseId) => {
    setMessage('');
    try {
      await client.post(`/courses/${courseId}/enroll`);
      setMyCourseIds((prev) => new Set(prev).add(courseId));
      setMessage('Enrolled successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not enroll.');
    }
  };

  if (loading) return <div className="page-loading">Loading courses...</div>;

  return (
    <div className="page">
      <h1>Course Catalog</h1>
      {message && <div className="alert-info">{message}</div>}
      <div className="card-grid">
        {courses.map((course) => (
          <div className="card" key={course.id}>
            <div className="card-header">
              <span className="badge">{course.code}</span>
              <span className="muted small">{course.credits} credits</span>
            </div>
            <h3>{course.title}</h3>
            <p className="muted">{course.instructor}</p>
            <p>{course.description}</p>
            {myCourseIds.has(course.id) ? (
              <span className="badge-enrolled">Enrolled</span>
            ) : (
              <button className="btn-primary-small" onClick={() => handleEnroll(course.id)}>
                Enroll
              </button>
            )}
          </div>
        ))}
        {courses.length === 0 && <p className="muted">No courses available yet.</p>}
      </div>
    </div>
  );
}

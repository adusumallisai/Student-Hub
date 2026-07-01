import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <section className="hero">
        <h1>One place for your academic life</h1>
        <p>
          Student Hub brings course access, shared resources, and academic
          planning together — built for students, by a student.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/courses" className="btn-primary">Go to Courses</Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-secondary">Login</Link>
            </>
          )}
        </div>
      </section>
      <section className="features">
        <div className="feature-card">
          <h3>📚 Course Access</h3>
          <p>Browse the catalog, enroll in courses, and keep track of what you're taking each term.</p>
        </div>
        <div className="feature-card">
          <h3>🔗 Resource Sharing</h3>
          <p>Upload and download notes, slides, and study materials shared by classmates per course.</p>
        </div>
        <div className="feature-card">
          <h3>🗓️ Academic Planner</h3>
          <p>Track assignments and deadlines with priorities, so nothing slips through the cracks.</p>
        </div>
      </section>
    </div>
  );
}

/**
 * routes/courses.js
 * Course catalog + enrollment. Enrollment ties a user to a course so the
 * front end can show "My Courses" vs. the full catalog.
 */
const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses - list all courses (public catalog)
router.get('/', (req, res) => {
  const courses = db.get('courses').value();
  res.json(courses);
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  const course = db.get('courses').find({ id: req.params.id }).value();
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  res.json(course);
});

// POST /api/courses/:id/enroll - enroll the current user in a course
router.post('/:id/enroll', requireAuth, (req, res) => {
  const course = db.get('courses').find({ id: req.params.id }).value();
  if (!course) return res.status(404).json({ message: 'Course not found.' });

  const already = db.get('enrollments')
    .find({ courseId: req.params.id, userId: req.user.id })
    .value();
  if (already) {
    return res.status(409).json({ message: 'Already enrolled in this course.' });
  }

  const enrollment = {
    id: uuid(),
    courseId: req.params.id,
    userId: req.user.id,
    enrolledAt: new Date().toISOString()
  };
  db.get('enrollments').push(enrollment).write();
  res.status(201).json(enrollment);
});

// GET /api/courses/mine/list - courses the current user is enrolled in
router.get('/mine/list', requireAuth, (req, res) => {
  const myEnrollments = db.get('enrollments').filter({ userId: req.user.id }).value();
  const courseIds = myEnrollments.map((e) => e.courseId);
  const myCourses = db.get('courses').filter((c) => courseIds.includes(c.id)).value();
  res.json(myCourses);
});

module.exports = router;

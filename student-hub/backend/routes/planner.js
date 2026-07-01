/**
 * routes/planner.js
 * Student-centric academic planning: lightweight task/deadline tracker
 * scoped per user, optionally linked to a course.
 */
const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/planner - all tasks for the current user
router.get('/', requireAuth, (req, res) => {
  const tasks = db.get('planTasks')
    .filter({ userId: req.user.id })
    .sortBy('dueDate')
    .value();
  res.json(tasks);
});

// POST /api/planner - create a task
router.post('/', requireAuth, (req, res) => {
  const { title, dueDate, courseId, priority, notes } = req.body;
  if (!title || !dueDate) {
    return res.status(400).json({ message: 'Title and dueDate are required.' });
  }

  const task = {
    id: uuid(),
    userId: req.user.id,
    title,
    dueDate,
    courseId: courseId || null,
    priority: priority || 'medium', // low | medium | high
    notes: notes || '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  db.get('planTasks').push(task).write();
  res.status(201).json(task);
});

// PATCH /api/planner/:id - update a task (e.g., mark complete, edit fields)
router.patch('/:id', requireAuth, (req, res) => {
  const task = db.get('planTasks').find({ id: req.params.id, userId: req.user.id }).value();
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const updates = (({ title, dueDate, courseId, priority, notes, completed }) =>
    ({ title, dueDate, courseId, priority, notes, completed }))(req.body);

  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  db.get('planTasks').find({ id: req.params.id }).assign(updates).write();
  const updated = db.get('planTasks').find({ id: req.params.id }).value();
  res.json(updated);
});

// DELETE /api/planner/:id
router.delete('/:id', requireAuth, (req, res) => {
  const task = db.get('planTasks').find({ id: req.params.id, userId: req.user.id }).value();
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  db.get('planTasks').remove({ id: req.params.id }).write();
  res.json({ message: 'Task deleted.' });
});

module.exports = router;

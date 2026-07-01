/**
 * db.js
 * Lightweight file-based JSON database (lowdb).
 *
 * Why lowdb instead of MongoDB?
 * This keeps the project runnable anywhere with zero external services —
 * ideal for demos, grading, and local dev. The data access layer (this file +
 * the route files) is isolated, so swapping in MongoDB/Mongoose later only
 * requires changing this file and the model accessors, not the route logic.
 */
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Default schema
db.defaults({
  users: [],
  courses: [],
  resources: [],
  enrollments: [],
  planTasks: [],
  comments: []
}).write();

module.exports = db;

/**
 * routes/resources.js
 * Resource sharing: students upload notes/files tied to a course. Files are
 * stored on disk (uploads/) and metadata in the JSON DB. Swap multer's disk
 * storage for S3/Cloud storage in production without touching the rest of
 * the route logic.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${uuid()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('File type not allowed.'));
    }
    cb(null, true);
  }
});

// GET /api/resources?courseId=xxx - list resources, optionally filtered by course
router.get('/', (req, res) => {
  const { courseId } = req.query;
  let resources = db.get('resources').value();
  if (courseId) {
    resources = resources.filter((r) => r.courseId === courseId);
  }
  res.json(resources);
});

// POST /api/resources - upload a new resource (auth required)
router.post('/', requireAuth, upload.single('file'), (req, res) => {
  const { title, description, courseId } = req.body;
  if (!title || !courseId) {
    return res.status(400).json({ message: 'Title and courseId are required.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'A file is required.' });
  }

  const resource = {
    id: uuid(),
    title,
    description: description || '',
    courseId,
    fileName: req.file.originalname,
    storedFileName: req.file.filename,
    fileSize: req.file.size,
    uploadedBy: req.user.id,
    uploadedByName: req.user.name,
    createdAt: new Date().toISOString()
  };

  db.get('resources').push(resource).write();
  res.status(201).json(resource);
});

// GET /api/resources/:id/download
router.get('/:id/download', (req, res) => {
  const resource = db.get('resources').find({ id: req.params.id }).value();
  if (!resource) return res.status(404).json({ message: 'Resource not found.' });

  const filePath = path.join(uploadDir, resource.storedFileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File missing from storage.' });
  }
  res.download(filePath, resource.fileName);
});

// DELETE /api/resources/:id - only the uploader can delete
router.delete('/:id', requireAuth, (req, res) => {
  const resource = db.get('resources').find({ id: req.params.id }).value();
  if (!resource) return res.status(404).json({ message: 'Resource not found.' });
  if (resource.uploadedBy !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own uploads.' });
  }

  const filePath = path.join(uploadDir, resource.storedFileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.get('resources').remove({ id: req.params.id }).write();
  res.json({ message: 'Resource deleted.' });
});

module.exports = router;

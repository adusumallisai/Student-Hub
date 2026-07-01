/**
 * seed.js
 * Populates the database with sample courses and a demo user so the app
 * has content immediately after setup. Run with: npm run seed
 */
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('./db');

async function seed() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  db.set('users', [
    {
      id: uuid(),
      name: 'Demo Student',
      email: 'demo@studenthub.com',
      password: passwordHash,
      role: 'student',
      createdAt: new Date().toISOString()
    }
  ]).write();

  const courses = [
    {
      id: uuid(),
      title: 'Data Structures & Algorithms',
      code: 'CS201',
      instructor: 'Dr. A. Rao',
      description: 'Core data structures, algorithmic complexity, and problem solving.',
      credits: 4
    },
    {
      id: uuid(),
      title: 'Database Systems',
      code: 'CS305',
      instructor: 'Dr. M. Iyer',
      description: 'Relational design, SQL, transactions, and NoSQL fundamentals.',
      credits: 3
    },
    {
      id: uuid(),
      title: 'Web Application Development',
      code: 'CS410',
      instructor: 'Prof. S. Nair',
      description: 'Full-stack development with React, Node.js, and REST APIs.',
      credits: 3
    }
  ];

  db.set('courses', courses).write();
  db.set('resources', []).write();
  db.set('enrollments', []).write();
  db.set('planTasks', []).write();
  db.set('comments', []).write();

  console.log('Database seeded successfully.');
  console.log('Demo login -> email: demo@studenthub.com | password: Password123!');
}

seed();

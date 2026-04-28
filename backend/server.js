require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// ✅ Projects
app.get('/api/projects', (req, res) => {
  db.query('SELECT * FROM projects', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching projects');
      return;
    }
    console.log('Projects fetched:', results);
    res.json(results);
  });
});

// ✅ Users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching users');
      return;
    }
    console.log('Users fetched:', results);
    res.json(results);
  });
});

// ✅ Documents
app.get('/api/documents', (req, res) => {
  db.query('SELECT * FROM documents', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching documents');
      return;
    }
    console.log('Documents fetched:', results);
    res.json(results);
  });
});

app.post('/api/documents', (req, res) => {
  const { name, type, size, date, project, content } = req.body;
  const sql = 'INSERT INTO documents (name, type, size, date, project, content) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, type, size, date, project, content], (err, result) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error saving document');
      return;
    }
    res.json({ id: result.insertId, name, type, size, date, project, content });
  });
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM documents WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error deleting document');
      return;
    }
    res.json({ message: 'Document deleted', id });
  });
});

// ✅ Messages
app.get('/api/messages', (req, res) => {
  db.query('SELECT * FROM messages', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching messages');
      return;
    }
    console.log('Messages fetched:', results);
    res.json(results);
  });
});

// ✅ Milestones
app.get('/api/milestones', (req, res) => {
  db.query('SELECT * FROM milestones', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching milestones');
      return;
    }
    console.log('Milestones fetched:', results);
    res.json(results);
  });
});

// ✅ Project Members
app.get('/api/project_members', (req, res) => {
  db.query('SELECT * FROM project_members', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching project members');
      return;
    }
    console.log('Project members fetched:', results);
    res.json(results);
  });
});

// ✅ Courses
app.get('/api/courses', (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching courses');
      return;
    }
    console.log('Courses fetched:', results);
    res.json(results);
  });
});

// ✅ Enrollments
app.get('/api/enrollments', (req, res) => {
  db.query('SELECT * FROM enrollments', (err, results) => {
    if (err) {
      console.error('SQL Error object:', err);
      res.status(500).send('Error fetching enrollments');
      return;
    }
    console.log('Enrollments fetched:', results);
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));


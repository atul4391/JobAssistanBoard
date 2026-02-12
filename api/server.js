import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JSON DB setup - use /tmp for serverless environment
const dbPath = path.join('/tmp', 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ jobs: [], nextId: 1 }, null, 2));
}

// Helper to read/write DB
const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { jobs: [], nextId: 1 };
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write DB:', error);
  }
};

// GET all jobs
app.get('/api/jobs', (req, res) => {
  const db = readDb();
  const jobs = db.jobs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(jobs);
});

// GET single job
app.get('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const job = db.jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// POST new job
app.post('/api/jobs', (req, res) => {
  const { company, position, source, resumeUsed, notes, status, url, salary, location, contactPerson } = req.body;
  if (!company || !position) {
    return res.status(400).json({ error: 'Company and position are required' });
  }

  const db = readDb();
  const newJob = {
    id: db.nextId++,
    company,
    position,
    source: source || '',
    resumeUsed: resumeUsed || '',
    notes: notes || '',
    status: status || 'applied',
    url: url || '',
    salary: salary || '',
    location: location || '',
    contactPerson: contactPerson || '',
    appliedDate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.jobs.push(newJob);
  writeDb(db);
  res.status(201).json(newJob);
});

// PUT update job
app.put('/api/jobs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDb();
  const index = db.jobs.findIndex(j => j.id === id);

  if (index === -1) return res.status(404).json({ error: 'Job not found' });

  const { company, position, source, resumeUsed, notes, status, url, salary, location, contactPerson } = req.body;

  const updatedJob = {
    ...db.jobs[index],
    company, position, source, resumeUsed, notes, status, url, salary, location, contactPerson,
    updatedAt: new Date().toISOString()
  };

  db.jobs[index] = updatedJob;
  writeDb(db);
  res.json(updatedJob);
});

// PATCH update job status
app.patch('/api/jobs/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const validStatuses = ['applied', 'inProgress', 'interview', 'offer', 'done', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = readDb();
  const index = db.jobs.findIndex(j => j.id === id);
  if (index === -1) return res.status(404).json({ error: 'Job not found' });

  db.jobs[index].status = status;
  db.jobs[index].updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(db.jobs[index]);
});

// DELETE job
app.delete('/api/jobs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDb();
  const initialLength = db.jobs.length;
  db.jobs = db.jobs.filter(j => j.id !== id);

  if (db.jobs.length === initialLength) return res.status(404).json({ error: 'Job not found' });

  writeDb(db);
  res.json({ message: 'Job deleted successfully' });
});

// GET stats
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const total = db.jobs.length;
  const byStatus = {};

  db.jobs.forEach(job => {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1;
  });

  res.json({ total, byStatus });
});

// Vercel serverless handler
export default app;

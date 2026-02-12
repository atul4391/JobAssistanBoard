import express from 'express';
import cors from 'cors';
import { kv } from '@vercel/kv';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// KV Keys
const JOBS_KEY = 'jobs';
const NEXT_ID_KEY = 'nextId';

// Helper to initialize DB if empty
const initDb = async () => {
  const jobs = await kv.get(JOBS_KEY);
  const nextId = await kv.get(NEXT_ID_KEY);
  
  if (!jobs) {
    await kv.set(JOBS_KEY, []);
  }
  if (!nextId) {
    await kv.set(NEXT_ID_KEY, 1);
  }
};

// Helper to read jobs
const getJobs = async () => {
  await initDb();
  return await kv.get(JOBS_KEY) || [];
};

// Helper to get nextId
const getNextId = async () => {
  return await kv.get(NEXT_ID_KEY) || 1;
};

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await getJobs();
    const sortedJobs = jobs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(sortedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobs = await getJobs();
    const job = jobs.find(j => j.id === parseInt(req.params.id));
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST new job
app.post('/api/jobs', async (req, res) => {
  try {
    const { company, position, source, resumeUsed, notes, status, url, salary, location, contactPerson } = req.body;
    
    if (!company || !position) {
      return res.status(400).json({ error: 'Company and position are required' });
    }

    const jobs = await getJobs();
    const nextId = await getNextId();
    
    const newJob = {
      id: nextId,
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

    jobs.push(newJob);
    
    await kv.set(JOBS_KEY, jobs);
    await kv.set(NEXT_ID_KEY, nextId + 1);
    
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT update job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const jobs = await getJobs();
    const index = jobs.findIndex(j => j.id === id);

    if (index === -1) return res.status(404).json({ error: 'Job not found' });

    const { company, position, source, resumeUsed, notes, status, url, salary, location, contactPerson } = req.body;

    const updatedJob = {
      ...jobs[index],
      company, position, source, resumeUsed, notes, status, url, salary, location, contactPerson,
      updatedAt: new Date().toISOString()
    };

    jobs[index] = updatedJob;
    await kv.set(JOBS_KEY, jobs);
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// PATCH update job status
app.patch('/api/jobs/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ['applied', 'inProgress', 'interview', 'offer', 'done', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const jobs = await getJobs();
    const index = jobs.findIndex(j => j.id === id);
    
    if (index === -1) return res.status(404).json({ error: 'Job not found' });

    jobs[index].status = status;
    jobs[index].updatedAt = new Date().toISOString();
    
    await kv.set(JOBS_KEY, jobs);
    
    res.json(jobs[index]);
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const jobs = await getJobs();
    const initialLength = jobs.length;
    
    const filteredJobs = jobs.filter(j => j.id !== id);

    if (filteredJobs.length === initialLength) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await kv.set(JOBS_KEY, filteredJobs);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// GET stats
app.get('/api/stats', async (req, res) => {
  try {
    const jobs = await getJobs();
    const total = jobs.length;
    const byStatus = {};

    jobs.forEach(job => {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    });

    res.json({ total, byStatus });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Vercel serverless handler
export default app;

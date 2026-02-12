// Vercel Serverless Function - Job Board API
import { kv } from '@vercel/kv';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// KV Keys
const JOBS_KEY = 'jobs';
const NEXT_ID_KEY = 'nextId';

// Helper to initialize DB
async function initDb() {
  const jobs = await kv.get(JOBS_KEY);
  const nextId = await kv.get(NEXT_ID_KEY);
  
  if (!jobs) await kv.set(JOBS_KEY, []);
  if (!nextId) await kv.set(NEXT_ID_KEY, 1);
}

// Helper to get jobs
async function getJobs() {
  await initDb();
  return await kv.get(JOBS_KEY) || [];
}

// Helper to get nextId
async function getNextId() {
  return await kv.get(NEXT_ID_KEY) || 1;
}

// Main handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const path = url.replace('/api', '');

  try {
    // GET /api/jobs
    if (path === '/jobs' && method === 'GET') {
      const jobs = await getJobs();
      const sortedJobs = jobs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return res.status(200).json(sortedJobs);
    }

    // POST /api/jobs
    if (path === '/jobs' && method === 'POST') {
      const { company, position, source, resumeUsed, notes, status, url: jobUrl, salary, location, contactPerson } = req.body;
      
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
        url: jobUrl || '',
        salary: salary || '',
        location: location || '',
        contactPerson: contactPerson || '',
        appliedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      jobs.push(newJob);
      await kv.set(JOBS_KEY, jobs);
      await kv.set(NEXT_ID_KEY, nextId + 1);
      
      return res.status(201).json(newJob);
    }

    // GET /api/stats
    if (path === '/stats' && method === 'GET') {
      const jobs = await getJobs();
      const total = jobs.length;
      const byStatus = {};
      jobs.forEach(job => {
        byStatus[job.status] = (byStatus[job.status] || 0) + 1;
      });
      return res.status(200).json({ total, byStatus });
    }

    // Single job operations
    const jobIdMatch = path.match(/^\/jobs\/(\d+)$/);
    if (jobIdMatch) {
      const id = parseInt(jobIdMatch[1]);

      // GET /api/jobs/:id
      if (method === 'GET') {
        const jobs = await getJobs();
        const job = jobs.find(j => j.id === id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        return res.status(200).json(job);
      }

      // PUT /api/jobs/:id
      if (method === 'PUT') {
        const jobs = await getJobs();
        const index = jobs.findIndex(j => j.id === id);
        if (index === -1) return res.status(404).json({ error: 'Job not found' });

        const { company, position, source, resumeUsed, notes, status, url: jobUrl, salary, location, contactPerson } = req.body;

        jobs[index] = {
          ...jobs[index],
          company, position, source, resumeUsed, notes, status,
          url: jobUrl, salary, location, contactPerson,
          updatedAt: new Date().toISOString()
        };
        
        await kv.set(JOBS_KEY, jobs);
        return res.status(200).json(jobs[index]);
      }

      // PATCH /api/jobs/:id/status
      if (method === 'PATCH') {
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
        
        return res.status(200).json(jobs[index]);
      }

      // DELETE /api/jobs/:id
      if (method === 'DELETE') {
        const jobs = await getJobs();
        const filteredJobs = jobs.filter(j => j.id !== id);
        
        if (filteredJobs.length === jobs.length) {
          return res.status(404).json({ error: 'Job not found' });
        }

        await kv.set(JOBS_KEY, filteredJobs);
        return res.status(200).json({ message: 'Job deleted successfully' });
      }
    }

    // PATCH /api/jobs/:id/status (alternative route)
    const statusMatch = path.match(/^\/jobs\/(\d+)\/status$/);
    if (statusMatch && method === 'PATCH') {
      const id = parseInt(statusMatch[1]);
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
      
      return res.status(200).json(jobs[index]);
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

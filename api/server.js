// Vercel Serverless Function - Job Board API
// Works with or without KV database

let kv;
try {
  const kvModule = await import('@vercel/kv');
  kv = kvModule.kv;
} catch (e) {
  console.log('KV not available, using in-memory storage');
}

// In-memory fallback storage
const memoryStore = {
  jobs: [],
  nextId: 1
};

// Helper to check if KV is working
async function isKvAvailable() {
  if (!kv) return false;
  try {
    await kv.get('test');
    return true;
  } catch (e) {
    return false;
  }
}

// Helper to get jobs
async function getJobs() {
  if (await isKvAvailable()) {
    const jobs = await kv.get('jobs');
    return jobs || [];
  }
  return memoryStore.jobs;
}

// Helper to save jobs
async function saveJobs(jobs) {
  if (await isKvAvailable()) {
    await kv.set('jobs', jobs);
  } else {
    memoryStore.jobs = jobs;
  }
}

// Helper to get nextId
async function getNextId() {
  if (await isKvAvailable()) {
    const nextId = await kv.get('nextId');
    return nextId || 1;
  }
  return memoryStore.nextId;
}

// Helper to save nextId
async function saveNextId(nextId) {
  if (await isKvAvailable()) {
    await kv.set('nextId', nextId);
  } else {
    memoryStore.nextId = nextId;
  }
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
      await saveJobs(jobs);
      await saveNextId(nextId + 1);
      
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
        
        await saveJobs(jobs);
        return res.status(200).json(jobs[index]);
      }

      // PATCH /api/jobs/:id
      if (method === 'PATCH') {
        const { status } = req.body;
        const validStatuses = ['applied', 'inProgress', 'interview', 'offer', 'done', 'rejected'];
        
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }

        const jobs = await getJobs();
        const index = jobs.findIndex(j => j.id === id);
        if (index === -1) return res.status(404).json({ error: 'Job not found' });

        if (status) {
          jobs[index].status = status;
          jobs[index].updatedAt = new Date().toISOString();
        }
        
        // Handle full update too
        const { company, position, source, resumeUsed, notes, url: jobUrl, salary, location, contactPerson } = req.body;
        if (company) jobs[index].company = company;
        if (position) jobs[index].position = position;
        if (source !== undefined) jobs[index].source = source;
        if (resumeUsed !== undefined) jobs[index].resumeUsed = resumeUsed;
        if (notes !== undefined) jobs[index].notes = notes;
        if (jobUrl !== undefined) jobs[index].url = jobUrl;
        if (salary !== undefined) jobs[index].salary = salary;
        if (location !== undefined) jobs[index].location = location;
        if (contactPerson !== undefined) jobs[index].contactPerson = contactPerson;
        
        await saveJobs(jobs);
        return res.status(200).json(jobs[index]);
      }

      // DELETE /api/jobs/:id
      if (method === 'DELETE') {
        const jobs = await getJobs();
        const filteredJobs = jobs.filter(j => j.id !== id);
        
        if (filteredJobs.length === jobs.length) {
          return res.status(404).json({ error: 'Job not found' });
        }

        await saveJobs(filteredJobs);
        return res.status(200).json({ message: 'Job deleted successfully' });
      }
    }

    // PATCH /api/jobs/:id/status (dedicated route)
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
      await saveJobs(jobs);
      
      return res.status(200).json(jobs[index]);
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'Not found', path, method });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

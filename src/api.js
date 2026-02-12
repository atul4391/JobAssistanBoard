const API_BASE = '/api';

export async function fetchJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
}

export async function fetchStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export async function createJob(jobData) {
    const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
}

export async function updateJob(id, jobData) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to update job');
    return res.json();
}

export async function updateJobStatus(id, status) {
    const res = await fetch(`${API_BASE}/jobs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update job status');
    return res.json();
}

export async function deleteJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
}

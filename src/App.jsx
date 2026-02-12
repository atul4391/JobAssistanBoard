import { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './components/KanbanBoard';
import DashboardStats from './components/DashboardStats';
import AddJobModal from './components/AddJobModal';
import JobDetailModal from './components/JobDetailModal';
import { fetchJobs, createJob, updateJob, updateJobStatus, deleteJob } from './api';

const COLUMNS = [
  { id: 'applied', title: 'Applied', icon: '📝', color: '#6366f1' },
  { id: 'inProgress', title: 'In Progress', icon: '⏳', color: '#f59e0b' },
  { id: 'interview', title: 'Interview', icon: '🎤', color: '#8b5cf6' },
  { id: 'offer', title: 'Offer', icon: '🎉', color: '#10b981' },
  { id: 'done', title: 'Done', icon: '✅', color: '#06b6d4' },
  { id: 'rejected', title: 'Rejected', icon: '❌', color: '#ef4444' },
];

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleAddJob = async (jobData) => {
    try {
      const newJob = await createJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      alert('Failed to add job. Please try again.');
    }
  };

  const handleUpdateJob = async (id, jobData) => {
    try {
      const updated = await updateJob(id, jobData);
      setJobs(prev => prev.map(j => j.id === id ? updated : j));
      setSelectedJob(null);
    } catch (err) {
      alert('Failed to update job. Please try again.');
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      setSelectedJob(null);
    } catch (err) {
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateJobStatus(id, newStatus);
      setJobs(prev => prev.map(j => j.id === id ? updated : j));
    } catch (err) {
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.company.toLowerCase().includes(q) ||
      job.position.toLowerCase().includes(q) ||
      job.source.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <h1>JobTracker</h1>
          </div>
          <p className="header-subtitle">Your Job Search Command Center</p>
        </div>
        <div className="header-right">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            <span>+</span> Add Job
          </button>
        </div>
      </header>

      {/* Dashboard Stats */}
      <DashboardStats jobs={jobs} columns={COLUMNS} />

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      ) : (
        <KanbanBoard
          jobs={filteredJobs}
          columns={COLUMNS}
          onStatusChange={handleStatusChange}
          onCardClick={setSelectedJob}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddJob}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={handleUpdateJob}
          onDelete={handleDeleteJob}
        />
      )}
    </div>
  );
}

export default App;

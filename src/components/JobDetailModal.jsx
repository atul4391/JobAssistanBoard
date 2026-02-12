import { useState, useEffect } from 'react';

function JobDetailModal({ job, onClose, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...job });

    useEffect(() => {
        setFormData({ ...job });
    }, [job]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdate(job.id, formData);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this job application?')) {
            onDelete(job.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Job' : 'Job Details'}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                {isEditing ? (
                    <div className="edit-form">
                        <div className="form-group">
                            <label>Company</label>
                            <input type="text" name="company" value={formData.company} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Position</label>
                            <input type="text" name="position" value={formData.position} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="applied">Applied</option>
                                    <option value="inProgress">In Progress</option>
                                    <option value="interview">Interview</option>
                                    <option value="offer">Offer</option>
                                    <option value="done">Done</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Source</label>
                                <input type="text" name="source" value={formData.source} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Salary</label>
                                <input type="text" name="salary" value={formData.salary} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>URL</label>
                            <input type="text" name="url" value={formData.url} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Resume Used</label>
                            <input type="text" name="resumeUsed" value={formData.resumeUsed} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="btn-submit" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <div className="job-details">
                        <div className="detail-header">
                            <h3>{job.company}</h3>
                            <p className="detail-position">{job.position}</p>
                        </div>
                        <div className="detail-meta">
                            <div className="meta-item">
                                <span className="label">Status:</span>
                                <span className={`status-badge status-${job.status}`}>{job.status}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Date Applied:</span>
                                <span>{new Date(job.appliedDate).toLocaleDateString()}</span>
                            </div>
                            {job.location && (
                                <div className="meta-item">
                                    <span className="label">Location:</span>
                                    <span>{job.location}</span>
                                </div>
                            )}
                            {job.salary && (
                                <div className="meta-item">
                                    <span className="label">Salary:</span>
                                    <span>{job.salary}</span>
                                </div>
                            )}
                        </div>
                        {job.url && (
                            <div className="detail-section">
                                <h4>Link</h4>
                                <a href={job.url} target="_blank" rel="noopener noreferrer">{job.url}</a>
                            </div>
                        )}
                        <div className="detail-section">
                            <h4>Resume</h4>
                            <p>{job.resumeUsed || 'Not specified'}</p>
                        </div>
                        <div className="detail-section">
                            <h4>Notes</h4>
                            <p className="notes-text">{job.notes || 'No notes added.'}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-delete" onClick={handleDelete}>Delete</button>
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobDetailModal;

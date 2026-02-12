import { useState } from 'react';

function AddJobModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        company: '',
        position: '',
        source: '',
        resumeUsed: '',
        notes: '',
        status: 'applied',
        url: '',
        location: '',
        salary: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Job</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Company *</label>
                        <input
                            type="text"
                            name="company"
                            required
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="e.g. Google"
                        />
                    </div>
                    <div className="form-group">
                        <label>Position *</label>
                        <input
                            type="text"
                            name="position"
                            required
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="e.g. Frontend Engineer"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Source</label>
                            <select name="source" value={formData.source} onChange={handleChange}>
                                <option value="">Select source...</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Indeed">Indeed</option>
                                <option value="Glassdoor">Glassdoor</option>
                                <option value="Company Site">Company Site</option>
                                <option value="Referral">Referral</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Resume Used</label>
                            <input
                                type="text"
                                name="resumeUsed"
                                value={formData.resumeUsed}
                                onChange={handleChange}
                                placeholder="e.g. Resume_V2_Frontend.pdf"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Remote / New York"
                            />
                        </div>
                        <div className="form-group">
                            <label>Salary Range</label>
                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="e.g. $120k - $150k"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Job Link</label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any specific details, interview notes, etc."
                            rows="3"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Add Job</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddJobModal;

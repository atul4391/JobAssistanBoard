function JobCard({ job, color, onClick }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', job.id.toString());
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const daysAgo = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return '1 day ago';
        return `${diff}d ago`;
    };

    return (
        <div
            className="job-card"
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onClick}
            style={{ '--card-accent': color }}
        >
            <div className="card-header">
                <h3 className="card-company">{job.company}</h3>
                <span className="card-date" title={formatDate(job.appliedDate)}>
                    {daysAgo(job.appliedDate)}
                </span>
            </div>
            <p className="card-position">{job.position}</p>
            <div className="card-tags">
                {job.source && (
                    <span className="card-tag tag-source">{job.source}</span>
                )}
                {job.location && (
                    <span className="card-tag tag-location">📍 {job.location}</span>
                )}
            </div>
            {job.resumeUsed && (
                <div className="card-resume">
                    <span className="resume-icon">📄</span>
                    <span className="resume-name">{job.resumeUsed}</span>
                </div>
            )}
        </div>
    );
}

export default JobCard;

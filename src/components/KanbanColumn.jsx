import { useState } from 'react';
import JobCard from './JobCard';

function KanbanColumn({ column, jobs, onStatusChange, onCardClick }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        // Only set false if we're actually leaving the column
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const jobId = parseInt(e.dataTransfer.getData('text/plain'));
        if (jobId) {
            onStatusChange(jobId, column.id);
        }
    };

    return (
        <div
            className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="column-header" style={{ '--col-color': column.color }}>
                <div className="column-header-left">
                    <span className="column-icon">{column.icon}</span>
                    <h2 className="column-title">{column.title}</h2>
                </div>
                <span className="column-count">{jobs.length}</span>
            </div>
            <div className="column-body">
                {jobs.length === 0 ? (
                    <div className="column-empty">
                        <p>No jobs here yet</p>
                        <p className="column-empty-hint">Drag a card here</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            color={column.color}
                            onClick={() => onCardClick(job)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default KanbanColumn;

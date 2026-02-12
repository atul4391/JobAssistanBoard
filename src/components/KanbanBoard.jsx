import KanbanColumn from './KanbanColumn';

function KanbanBoard({ jobs, columns, onStatusChange, onCardClick }) {
    return (
        <div className="kanban-board">
            {columns.map(column => {
                const columnJobs = jobs.filter(job => job.status === column.id);
                return (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        jobs={columnJobs}
                        onStatusChange={onStatusChange}
                        onCardClick={onCardClick}
                    />
                );
            })}
        </div>
    );
}

export default KanbanBoard;

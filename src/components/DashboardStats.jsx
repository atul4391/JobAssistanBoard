function DashboardStats({ jobs, columns }) {
    const total = jobs.length;
    const active = jobs.filter(j => ['applied', 'inProgress', 'interview'].includes(j.status)).length;
    const offers = jobs.filter(j => j.status === 'offer').length;

    // Calculate success rate (Offers / Total Finished (Done + Rejected + Offer))
    const finished = jobs.filter(j => ['done', 'rejected', 'offer'].includes(j.status)).length;
    const successRate = finished > 0 ? Math.round((offers / finished) * 100) : 0;

    return (
        <div className="stats-container">
            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>📊</div>
                <div className="stat-info">
                    <h3>Total Applied</h3>
                    <p className="stat-value">{total}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>🔥</div>
                <div className="stat-info">
                    <h3>Active</h3>
                    <p className="stat-value">{active}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>🎉</div>
                <div className="stat-info">
                    <h3>Offers</h3>
                    <p className="stat-value">{offers}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>📈</div>
                <div className="stat-info">
                    <h3>Success Rate</h3>
                    <p className="stat-value">{successRate}%</p>
                </div>
            </div>
        </div>
    );
}

export default DashboardStats;


export default function KanbanSkeletonCard() {
  return (
    <div className="kanban-item skeleton-card">
      <div className="item-meta">
        <div className="company-logo skeleton-logo"></div>
        <div className="item-details">
          <div className="skeleton-line skeleton-role"></div>
          <div className="skeleton-line skeleton-company"></div>
        </div>
      </div>
      <div className="item-footer">
        <div className="skeleton-line skeleton-tag"></div>
        <div className="skeleton-arrow"></div>
      </div>
    </div>
  );
}

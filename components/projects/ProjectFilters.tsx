'use client';

export function ProjectFilters() {
  return (
    <div className="projects-filters">
      <div className="filter-group">
        <label>Trạng thái:</label>
        <select className="filter-select" aria-label="Lọc theo trạng thái">
          <option value="">Tất cả</option>
          <option value="planning">Lập kế hoạch</option>
          <option value="active">Đang thực hiện</option>
          <option value="on-hold">Tạm dừng</option>
          <option value="completed">Hoàn thành</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Tìm kiếm:</label>
        <input type="text" className="filter-input" placeholder="Tìm kiếm dự án..." />
      </div>
    </div>
  );
}

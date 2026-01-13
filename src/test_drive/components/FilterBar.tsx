import './FilterBar.css';

export interface GlobalFilters {
  startDate: string | null;
  endDate: string | null;
  model: string | null;
  showroom: string | null;
  channel: string | null;
}

interface FilterBarProps {
  filters: GlobalFilters;
  onFilterChange: (filters: GlobalFilters) => void;
  models: string[];
  showrooms: string[];
  channels: string[];
}

export function FilterBar({
  filters,
  onFilterChange,
  models,
  showrooms,
  channels
}: FilterBarProps) {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFilterChange({
      ...filters,
      [field]: value || null
    });
  };

  const handleSelectChange = (field: 'model' | 'showroom' | 'channel', value: string) => {
    onFilterChange({
      ...filters,
      [field]: value || null
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      startDate: null,
      endDate: null,
      model: null,
      showroom: null,
      channel: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  return (
    <div className="filter-bar">
      <div className="filter-groups">
        {/* Date Range */}
        <div className="filter-group date-range-group">
          <label className="filter-label">Date Range</label>
          <div className="date-inputs">
            <input
              type="date"
              className="filter-date-input"
              value={filters.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              placeholder="Start date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              className="filter-date-input"
              value={filters.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              placeholder="End date"
            />
          </div>
        </div>

        {/* Car Model */}
        <div className="filter-group">
          <label className="filter-label">Car Model</label>
          <select
            className="filter-select"
            value={filters.model || ''}
            onChange={(e) => handleSelectChange('model', e.target.value)}
          >
            <option value="">All Models</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Showroom */}
        <div className="filter-group">
          <label className="filter-label">Showroom</label>
          <select
            className="filter-select"
            value={filters.showroom || ''}
            onChange={(e) => handleSelectChange('showroom', e.target.value)}
          >
            <option value="">All Showrooms</option>
            {showrooms.map(showroom => (
              <option key={showroom} value={showroom}>{showroom}</option>
            ))}
          </select>
        </div>

        {/* Lead Source / Channel */}
        <div className="filter-group">
          <label className="filter-label">Lead Source</label>
          <select
            className="filter-select"
            value={filters.channel || ''}
            onChange={(e) => handleSelectChange('channel', e.target.value)}
          >
            <option value="">All Sources</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={handleClearAll}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 5.293l2.646-2.647a.5.5 0 0 1 .708.708L6.707 6l2.647 2.646a.5.5 0 0 1-.708.708L6 6.707 3.354 9.354a.5.5 0 0 1-.708-.708L5.293 6 2.646 3.354a.5.5 0 1 1 .708-.708L6 5.293z"/>
          </svg>
          Clear All
        </button>
      )}
    </div>
  );
}

export default FilterBar;

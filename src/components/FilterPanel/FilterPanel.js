import React, { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { FiX, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';
import TagBadge from '../TagBadge/TagBadge';
import './FilterPanel.css';

function FilterPanel() {
  const { 
    tags, 
    projects, 
    documentTypes, 
    selectedFilters, 
    setFilters, 
    clearFilters 
  } = useDocuments();
  
  const [expandedSections, setExpandedSections] = useState({
    tags: true,
    projects: true,
    documentTypes: true,
    dateRange: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTagFilter = (tagId) => {
    const currentTags = selectedFilters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    setFilters({ tags: newTags });
  };

  const handleProjectFilter = (projectId) => {
    const currentProjects = selectedFilters.projects || [];
    const newProjects = currentProjects.includes(projectId)
      ? currentProjects.filter(id => id !== projectId)
      : [...currentProjects, projectId];
    
    setFilters({ projects: newProjects });
  };

  const handleDocumentTypeFilter = (docType) => {
    const currentTypes = selectedFilters.documentTypes || [];
    const newTypes = currentTypes.includes(docType)
      ? currentTypes.filter(type => type !== docType)
      : [...currentTypes, docType];
    
    setFilters({ documentTypes: newTypes });
  };

  const handleDateRangeFilter = (range) => {
    setFilters({ dateRange: range });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== null
  );

  const getDocumentTypeIcon = (type) => {
    const icons = {
      'PDF': '📄',
      'Word': '📝',
      'Excel': '📊',
      'PowerPoint': '📽️',
      'Image': '🖼️',
      'Text': '📃',
      'Other': '📁'
    };
    return icons[type] || '📁';
  };

  const dateRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'This Year', value: 'year' }
  ];

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3 className="filter-title">Filters</h3>
        {hasActiveFilters && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            title="Clear all filters"
          >
            <FiX />
            Clear All
          </button>
        )}
      </div>

      <div className="filter-sections">
        {/* Tags Filter */}
        <div className="filter-section">
          <button
            className="filter-section-header"
            onClick={() => toggleSection('tags')}
          >
            <span className="section-title">Tags</span>
            <span className="section-toggle">
              {expandedSections.tags ? <FiChevronUp /> : <FiChevronDown />}
            </span>
            {selectedFilters.tags?.length > 0 && (
              <span className="active-count">{selectedFilters.tags.length}</span>
            )}
          </button>
          
          {expandedSections.tags && (
            <div className="filter-section-content">
              {tags.length === 0 ? (
                <p className="filter-empty">No tags available</p>
              ) : (
                <div className="filter-options">
                  {tags.map(tag => (
                    <label key={tag.id} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedFilters.tags?.includes(tag.id) || false}
                        onChange={() => handleTagFilter(tag.id)}
                      />
                      <TagBadge tag={tag} size="sm" />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Projects Filter */}
        <div className="filter-section">
          <button
            className="filter-section-header"
            onClick={() => toggleSection('projects')}
          >
            <span className="section-title">Projects</span>
            <span className="section-toggle">
              {expandedSections.projects ? <FiChevronUp /> : <FiChevronDown />}
            </span>
            {selectedFilters.projects?.length > 0 && (
              <span className="active-count">{selectedFilters.projects.length}</span>
            )}
          </button>
          
          {expandedSections.projects && (
            <div className="filter-section-content">
              {projects.length === 0 ? (
                <p className="filter-empty">No projects available</p>
              ) : (
                <div className="filter-options">
                  {projects.map(project => (
                    <label key={project.id} className="filter-option project-option">
                      <input
                        type="checkbox"
                        checked={selectedFilters.projects?.includes(project.id) || false}
                        onChange={() => handleProjectFilter(project.id)}
                      />
                      <div className="project-info">
                        <span className="project-name">{project.name}</span>
                        {project.description && (
                          <span className="project-description">{project.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Types Filter */}
        <div className="filter-section">
          <button
            className="filter-section-header"
            onClick={() => toggleSection('documentTypes')}
          >
            <span className="section-title">Document Types</span>
            <span className="section-toggle">
              {expandedSections.documentTypes ? <FiChevronUp /> : <FiChevronDown />}
            </span>
            {selectedFilters.documentTypes?.length > 0 && (
              <span className="active-count">{selectedFilters.documentTypes.length}</span>
            )}
          </button>
          
          {expandedSections.documentTypes && (
            <div className="filter-section-content">
              <div className="filter-options">
                {documentTypes.map(type => (
                  <label key={type} className="filter-option doc-type-option">
                    <input
                      type="checkbox"
                      checked={selectedFilters.documentTypes?.includes(type) || false}
                      onChange={() => handleDocumentTypeFilter(type)}
                    />
                    <div className="doc-type-info">
                      <span className="doc-type-icon">{getDocumentTypeIcon(type)}</span>
                      <span className="doc-type-name">{type}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="filter-section">
          <button
            className="filter-section-header"
            onClick={() => toggleSection('dateRange')}
          >
            <span className="section-title">
              <FiCalendar />
              Date Range
            </span>
            <span className="section-toggle">
              {expandedSections.dateRange ? <FiChevronUp /> : <FiChevronDown />}
            </span>
            {selectedFilters.dateRange && (
              <span className="active-indicator">•</span>
            )}
          </button>
          
          {expandedSections.dateRange && (
            <div className="filter-section-content">
              <div className="filter-options">
                {dateRangeOptions.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="radio"
                      name="dateRange"
                      value={option.value}
                      checked={selectedFilters.dateRange === option.value}
                      onChange={() => handleDateRangeFilter(option.value)}
                    />
                    <span className="date-range-label">{option.label}</span>
                  </label>
                ))}
                {selectedFilters.dateRange && (
                  <button
                    className="clear-date-range-btn"
                    onClick={() => handleDateRangeFilter(null)}
                  >
                    Clear Date Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="active-filters-summary">
          <h4 className="summary-title">Active Filters</h4>
          <div className="active-filters-list">
            {selectedFilters.tags?.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <TagBadge 
                  key={tagId} 
                  tag={tag} 
                  size="xs" 
                  removable 
                  onRemove={() => handleTagFilter(tagId)}
                />
              ) : null;
            })}
            
            {selectedFilters.projects?.map(projectId => {
              const project = projects.find(p => p.id === projectId);
              return project ? (
                <span key={projectId} className="active-filter-item">
                  {project.name}
                  <button 
                    onClick={() => handleProjectFilter(projectId)}
                    className="remove-filter-btn"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ) : null;
            })}
            
            {selectedFilters.documentTypes?.map(type => (
              <span key={type} className="active-filter-item">
                {getDocumentTypeIcon(type)} {type}
                <button 
                  onClick={() => handleDocumentTypeFilter(type)}
                  className="remove-filter-btn"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
            
            {selectedFilters.dateRange && (
              <span className="active-filter-item">
                <FiCalendar size={12} />
                {dateRangeOptions.find(opt => opt.value === selectedFilters.dateRange)?.label}
                <button 
                  onClick={() => handleDateRangeFilter(null)}
                  className="remove-filter-btn"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;

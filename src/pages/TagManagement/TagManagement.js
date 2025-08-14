import React, { useState, useEffect } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FiTag, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiTrendingUp,
  FiHash,
  FiCalendar,
  FiUsers
} from 'react-icons/fi';
import TagBadge from '../../components/TagBadge/TagBadge';
import toast from 'react-hot-toast';
import './TagManagement.css';

// Tag color options
const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280'  // gray
];

// Tag type options
const TAG_TYPES = [
  { value: 'category', label: 'Category', description: 'General categorization tags' },
  { value: 'project', label: 'Project', description: 'Project-specific tags' },
  { value: 'status', label: 'Status', description: 'Document status indicators' },
  { value: 'priority', label: 'Priority', description: 'Priority level tags' },
  { value: 'department', label: 'Department', description: 'Departmental tags' },
  { value: 'manual', label: 'Manual', description: 'Manually created tags' },
  { value: 'ai', label: 'AI Generated', description: 'AI-suggested tags' }
];

function TagManagement() {
  const { 
    tags, 
    addTag, 
    updateTag, 
    deleteTag, 
    documents,
    getTagStats 
  } = useDocuments();
  const { canManageTags } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [editingTag, setEditingTag] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'category',
    color: TAG_COLORS[0],
    description: ''
  });

  const [filteredTags, setFilteredTags] = useState([]);
  const [tagStats, setTagStats] = useState({});

  useEffect(() => {
    // Calculate tag statistics
    const stats = {};
    tags.forEach(tag => {
      const usage = documents.filter(doc => 
        doc.tags && doc.tags.find(t => t.id === tag.id)
      ).length;
      stats[tag.id] = usage;
    });
    setTagStats(stats);
  }, [tags, documents]);

  useEffect(() => {
    let filtered = tags.filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || tag.type === filterType;
      return matchesSearch && matchesType;
    });

    // Sort tags
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'usage':
          return (tagStats[b.id] || 0) - (tagStats[a.id] || 0);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredTags(filtered);
  }, [tags, searchTerm, filterType, sortBy, tagStats]);

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    // Check for duplicate names
    const existingTag = tags.find(t => 
      t.name.toLowerCase() === createForm.name.toLowerCase()
    );
    if (existingTag) {
      toast.error('A tag with this name already exists');
      return;
    }

    try {
      addTag({
        ...createForm,
        name: createForm.name.trim()
      });
      
      setCreateForm({
        name: '',
        type: 'category',
        color: TAG_COLORS[0],
        description: ''
      });
      setShowCreateForm(false);
      toast.success('Tag created successfully');
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleUpdateTag = (tagId, updates) => {
    try {
      updateTag(tagId, updates);
      setEditingTag(null);
      toast.success('Tag updated successfully');
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId) => {
    const usage = tagStats[tagId] || 0;
    const tagName = tags.find(t => t.id === tagId)?.name;
    
    let message = `Are you sure you want to delete the tag "${tagName}"?`;
    if (usage > 0) {
      message += ` This tag is currently used by ${usage} document${usage === 1 ? '' : 's'} and will be removed from them.`;
    }
    message += ' This action cannot be undone.';

    const confirmed = window.confirm(message);
    if (confirmed) {
      try {
        deleteTag(tagId);
        toast.success('Tag deleted successfully');
      } catch (error) {
        toast.error('Failed to delete tag');
      }
    }
  };

  const getTypeLabel = (type) => {
    return TAG_TYPES.find(t => t.value === type)?.label || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (!canManageTags()) {
    return (
      <div className="tag-management">
        <div className="unauthorized-message">
          <FiAlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You do not have permission to manage tags.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tag-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FiTag />
            Tag Management
          </h1>
          <p>Create, edit, and organize tags for your document management system</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <FiPlus />
            Create New Tag
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <FiTag />
          </div>
          <div className="stat-content">
            <div className="stat-number">{tags.length}</div>
            <div className="stat-label">Total Tags</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {Object.values(tagStats).reduce((a, b) => a + b, 0)}
            </div>
            <div className="stat-label">Total Usage</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiHash />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {new Set(tags.map(t => t.type)).size}
            </div>
            <div className="stat-label">Tag Types</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-control">
          <FiSearch />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>
              <FiFilter />
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input filter-select"
            >
              <option value="all">All Types</option>
              {TAG_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input filter-select"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="usage">Usage</option>
              <option value="created">Created Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="tags-grid">
        {filteredTags.map(tag => (
          <TagCard
            key={tag.id}
            tag={tag}
            usage={tagStats[tag.id] || 0}
            isEditing={editingTag === tag.id}
            onEdit={() => setEditingTag(tag.id)}
            onSave={(updates) => handleUpdateTag(tag.id, updates)}
            onCancel={() => setEditingTag(null)}
            onDelete={() => handleDeleteTag(tag.id)}
            getTypeLabel={getTypeLabel}
            formatDate={formatDate}
          />
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="no-tags">
          <FiTag size={48} />
          <h3>No tags found</h3>
          <p>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first tag to get started'
            }
          </p>
        </div>
      )}

      {/* Create Tag Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Tag</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleCreateTag} className="create-tag-form">
              <div className="form-group">
                <label htmlFor="tag-name">Name *</label>
                <input
                  id="tag-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter tag name..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tag-type">Type</label>
                <select
                  id="tag-type"
                  value={createForm.type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input"
                >
                  {TAG_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="field-description">
                  {TAG_TYPES.find(t => t.value === createForm.type)?.description}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tag-color">Color</label>
                <div className="color-picker">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${createForm.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCreateForm(prev => ({ ...prev, color }))}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tag-description">Description</label>
                <textarea
                  id="tag-description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  placeholder="Optional description..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiPlus />
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Tag Card Component
function TagCard({ 
  tag, 
  usage, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  getTypeLabel, 
  formatDate 
}) {
  const [editForm, setEditForm] = useState({
    name: tag.name,
    type: tag.type,
    color: tag.color,
    description: tag.description || ''
  });

  useEffect(() => {
    if (isEditing) {
      setEditForm({
        name: tag.name,
        type: tag.type,
        color: tag.color,
        description: tag.description || ''
      });
    }
  }, [isEditing, tag]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Tag name is required');
      return;
    }
    onSave(editForm);
  };

  return (
    <div className="tag-card">
      {isEditing ? (
        <form onSubmit={handleSave} className="edit-tag-form">
          <div className="form-group">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="input tag-name-input"
              placeholder="Tag name..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                value={editForm.type}
                onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                className="input"
              >
                {TAG_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="color-picker-inline">
              {TAG_COLORS.slice(0, 5).map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${editForm.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditForm(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="input description-input"
              placeholder="Description..."
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success btn-sm">
              <FiSave />
              Save
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              <FiX />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="tag-card-header">
            <TagBadge tag={tag} />
            <div className="tag-actions">
              <button className="btn btn-secondary btn-sm" onClick={onEdit}>
                <FiEdit3 />
              </button>
              <button className="btn btn-danger btn-sm" onClick={onDelete}>
                <FiTrash2 />
              </button>
            </div>
          </div>

          <div className="tag-card-content">
            <div className="tag-info">
              <div className="tag-meta">
                <span className="tag-type">{getTypeLabel(tag.type)}</span>
                <span className="tag-usage">
                  <FiUsers size={14} />
                  {usage} {usage === 1 ? 'document' : 'documents'}
                </span>
              </div>
              
              {tag.description && (
                <p className="tag-description">{tag.description}</p>
              )}
              
              <div className="tag-dates">
                <span>
                  <FiCalendar size={12} />
                  Created {formatDate(tag.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TagManagement;

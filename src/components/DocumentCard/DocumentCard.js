import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { 
  FiFile, 
  FiMoreVertical, 
  FiEdit, 
  FiTrash2, 
  FiDownload, 
  FiEye,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiTag
} from 'react-icons/fi';
import TagBadge from '../TagBadge/TagBadge';
import './DocumentCard.css';

function DocumentCard({ 
  document, 
  viewMode = 'grid', 
  isSelected = false, 
  onSelect,
  showSelection = false 
}) {
  const { canDelete, canEditTags } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(document.id, !isSelected);
  };

  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'view':
        setShowPreview(true);
        break;
      case 'edit':
        console.log('Edit document:', document.id);
        break;
      case 'download':
        console.log('Download document:', document.id);
        break;
      case 'reanalyze':
        console.log('Re-analyze document:', document.id);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this document?')) {
          console.log('Delete document:', document.id);
        }
        break;
      default:
        break;
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      'PDF': '📄',
      'Word': '📝',
      'Excel': '📊',
      'PowerPoint': '📽️',
      'Image': '🖼️',
      'Text': '📃'
    };
    return icons[document.documentType] || icons[type] || '📁';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending_review': 'warning',
      'approved': 'success',
      'rejected': 'danger'
    };
    return colors[status] || 'gray';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (viewMode === 'list') {
    return (
      <div className={`document-card list-view ${isSelected ? 'selected' : ''}`}>
        {showSelection && (
          <div className="document-checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        <div className="document-icon">
          {getFileIcon()}
        </div>
        
        <div className="document-details">
          <div className="document-name">
            {document.name}
          </div>
          <div className="document-meta">
            <span className="meta-item">
              <FiClock size={14} />
              {format(new Date(document.uploadDate), 'MMM dd, yyyy')}
            </span>
            <span className="meta-item">
              <FiUser size={14} />
              {document.uploader || 'Unknown'}
            </span>
            <span className="meta-item">
              {formatFileSize(document.size)}
            </span>
          </div>
        </div>
        
        <div className="document-tags">
          {document.tags?.slice(0, 3).map(tag => (
            <TagBadge key={tag.id} tag={tag} size="sm" />
          ))}
          {document.tags?.length > 3 && (
            <span className="tag-count">+{document.tags.length - 3}</span>
          )}
        </div>
        
        <div className="document-status">
          <span className={`status-badge status-${getStatusColor(document.status)}`}>
            {document.status?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="document-actions">
          <div className="actions-menu-wrapper">
            <button
              className="btn btn-ghost btn-icon-only"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <FiMoreVertical />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="menu-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="actions-menu">
                  <button 
                    className="menu-item"
                    onClick={(e) => handleMenuAction('view', e)}
                  >
                    <FiEye />
                    View
                  </button>
                  {canEditTags() && (
                    <button 
                      className="menu-item"
                      onClick={(e) => handleMenuAction('edit', e)}
                    >
                      <FiEdit />
                      Edit Tags
                    </button>
                  )}
                  <button 
                    className="menu-item"
                    onClick={(e) => handleMenuAction('download', e)}
                  >
                    <FiDownload />
                    Download
                  </button>
                  <button 
                    className="menu-item"
                    onClick={(e) => handleMenuAction('reanalyze', e)}
                  >
                    <FiRefreshCw />
                    Re-analyze
                  </button>
                  {canDelete() && (
                    <>
                      <div className="menu-divider" />
                      <button 
                        className="menu-item danger"
                        onClick={(e) => handleMenuAction('delete', e)}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`document-card grid-view ${isSelected ? 'selected' : ''}`}>
      {showSelection && (
        <div className="document-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      {/* AI Suggestions Indicator */}
      {document.status === 'pending_review' && (
        <div className="ai-suggestions-indicator">
          <span className="ai-badge">AI</span>
        </div>
      )}
      
      <div className="document-header">
        <div className="document-icon-large">
          {getFileIcon()}
        </div>
        
        <div className="document-actions">
          <div className="actions-menu-wrapper">
            <button
              className="btn btn-ghost btn-icon-only"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <FiMoreVertical />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="menu-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="actions-menu">
                  <button 
                    className="menu-item"
                    onClick={(e) => handleMenuAction('view', e)}
                  >
                    <FiEye />
                    View
                  </button>
                  {canEditTags() && (
                    <button 
                      className="menu-item"
                      onClick={(e) => handleMenuAction('edit', e)}
                    >
                      <FiEdit />
                      Edit Tags
                    </button>
                  )}
                  <button 
                    className="menu-item"
                    onClick={(e) => handleMenuAction('download', e)}
                  >
                    <FiDownload />
                    Download
                  </button>
                  <button 
                    className="menu-item"
                    onClick={(e) => handleMenuAction('reanalyze', e)}
                  >
                    <FiRefreshCw />
                    Re-analyze
                  </button>
                  {canDelete() && (
                    <>
                      <div className="menu-divider" />
                      <button 
                        className="menu-item danger"
                        onClick={(e) => handleMenuAction('delete', e)}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="document-body">
        <h3 className="document-title" title={document.name}>
          {document.name}
        </h3>
        
        <div className="document-info">
          <div className="info-item">
            <FiClock size={14} />
            <span>{format(new Date(document.uploadDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="info-item">
            <FiFile size={14} />
            <span>{formatFileSize(document.size)}</span>
          </div>
        </div>
        
        {/* Tags */}
        <div className="document-tags-grid">
          {document.tags?.slice(0, 4).map(tag => (
            <TagBadge key={tag.id} tag={tag} size="sm" />
          ))}
          {document.tags?.length > 4 && (
            <span className="tag-count">+{document.tags.length - 4}</span>
          )}
        </div>
        
        {/* AI Suggestions Preview */}
        {document.suggestedTags?.length > 0 && (
          <div className="ai-suggestions-preview">
            <div className="suggestions-header">
              <FiTag size={12} />
              <span>AI Suggestions</span>
            </div>
            <div className="suggested-tags">
              {document.suggestedTags.slice(0, 2).map(tag => (
                <TagBadge 
                  key={tag.id} 
                  tag={tag} 
                  size="xs" 
                  variant="suggested" 
                />
              ))}
              {document.suggestedTags.length > 2 && (
                <span className="suggestion-count">+{document.suggestedTags.length - 2}</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="document-footer">
        <span className={`status-badge status-${getStatusColor(document.status)}`}>
          {document.status?.replace('_', ' ')}
        </span>
        
        {document.project && (
          <span className="project-badge" title={document.project.description}>
            {document.project.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default DocumentCard;

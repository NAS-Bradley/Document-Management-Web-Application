import React from 'react';
import { FiX } from 'react-icons/fi';
import './TagBadge.css';

function TagBadge({ 
  tag, 
  size = 'md', 
  variant = 'default', 
  removable = false, 
  onRemove,
  onClick,
  confidence = null 
}) {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.(tag.id);
  };

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick(tag);
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'suggested':
        return 'tag-suggested';
      case 'approved':
        return 'tag-approved';
      case 'rejected':
        return 'tag-rejected';
      default:
        return 'tag-default';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'tag-xs';
      case 'sm':
        return 'tag-sm';
      case 'lg':
        return 'tag-lg';
      default:
        return 'tag-md';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      priority: '⚡',
      status: '📋',
      category: '📂',
      security: '🔒',
      document_type: '📄',
      context: '💡'
    };
    return icons[type];
  };

  return (
    <span
      className={`tag-badge ${getSizeClass()} ${getVariantClass()} ${onClick ? 'clickable' : ''} ${removable ? 'removable' : ''}`}
      style={{ 
        '--tag-color': tag.color || '#6b7280',
        '--tag-bg': tag.color ? `${tag.color}20` : '#f3f4f6'
      }}
      onClick={handleClick}
      title={tag.reason || `${tag.type} tag${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
    >
      {tag.type && getTypeIcon(tag.type) && (
        <span className="tag-type-icon">
          {getTypeIcon(tag.type)}
        </span>
      )}
      
      <span className="tag-name">
        {tag.name}
      </span>
      
      {confidence && confidence < 1 && (
        <span className="tag-confidence">
          {Math.round(confidence * 100)}%
        </span>
      )}
      
      {variant === 'suggested' && (
        <span className="tag-ai-indicator">
          AI
        </span>
      )}
      
      {removable && (
        <button
          className="tag-remove-btn"
          onClick={handleRemove}
          title="Remove tag"
        >
          <FiX size={12} />
        </button>
      )}
    </span>
  );
}

export default TagBadge;

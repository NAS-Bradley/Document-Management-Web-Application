import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiEdit3, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiTag,
  FiFolder,
  FiFile,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiShare2
} from 'react-icons/fi';
import TagBadge from '../../components/TagBadge/TagBadge';
import { aiTaggingService } from '../../services/aiTaggingService';
import toast from 'react-hot-toast';
import './DocumentView.css';

function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    documents, 
    tags, 
    projects, 
    updateDocumentTags, 
    updateDocumentMetadata,
    deleteDocument,
    downloadDocument,
    addTag
  } = useDocuments();
  const { user, canEdit, canDelete } = useAuth();
  
  const [document, setDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newTagName, setNewTagName] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setDocument(doc);
      setEditForm({
        name: doc.name,
        description: doc.description || '',
        project: doc.project?.id || '',
        documentType: doc.documentType || '',
        tags: doc.tags || []
      });
    }
    setLoading(false);
  }, [documents, id]);

  const handleSave = async () => {
    try {
      // Update document metadata
      await updateDocumentMetadata(id, {
        name: editForm.name,
        description: editForm.description,
        project: projects.find(p => p.id === editForm.project) || null,
        documentType: editForm.documentType
      });

      // Update tags
      await updateDocumentTags(id, editForm.tags);

      setIsEditing(false);
      toast.success('Document updated successfully');
    } catch (error) {
      toast.error('Failed to update document');
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: document.name,
      description: document.description || '',
      project: document.project?.id || '',
      documentType: document.documentType || '',
      tags: document.tags || []
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!canDelete()) {
      toast.error('You do not have permission to delete this document');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this document? This action cannot be undone.');
    if (confirmed) {
      try {
        await deleteDocument(id);
        toast.success('Document deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleDownload = async () => {
    try {
      await downloadDocument(id);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleTagRemove = (tagId) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }));
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    // Check if tag already exists
    const existingTag = tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase());
    let tag;

    if (existingTag) {
      tag = existingTag;
    } else {
      // Create new tag
      tag = addTag({
        name: newTagName,
        type: 'manual',
        color: '#6b7280'
      });
    }

    // Check if tag is already added
    if (!editForm.tags.find(t => t.id === tag.id)) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }

    setNewTagName('');
  };

  const handleRegenerateTags = async () => {
    setIsRegenerating(true);
    try {
      const suggestions = await aiTaggingService.analyzeTags(document);
      
      // Add new suggested tags that don't already exist
      const newTags = suggestions.filter(suggested => 
        !editForm.tags.find(existing => existing.name.toLowerCase() === suggested.name.toLowerCase())
      );

      if (newTags.length > 0) {
        setEditForm(prev => ({
          ...prev,
          tags: [...prev.tags, ...newTags]
        }));
        toast.success(`Added ${newTags.length} new suggested tags`);
      } else {
        toast.info('No new tag suggestions found');
      }
    } catch (error) {
      toast.error('Failed to regenerate tags');
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="document-view">
        <div className="loading-container">
          <FiFile size={48} />
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="document-view">
        <div className="error-container">
          <FiAlertCircle size={48} />
          <h2>Document Not Found</h2>
          <p>The document you're looking for doesn't exist or has been deleted.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-view">
      {/* Header */}
      <div className="document-header">
        <div className="header-left">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
            Back
          </button>
          
          {isEditing ? (
            <div className="editing-title">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="input title-input"
                placeholder="Document name..."
              />
            </div>
          ) : (
            <div className="document-title">
              <h1>{document.name}</h1>
              <div className="document-subtitle">
                <FiFile />
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span>{document.documentType || 'Unknown Type'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="header-actions">
          {isEditing ? (
            <>
              <button 
                className="btn btn-success"
                onClick={handleSave}
              >
                <FiSave />
                Save Changes
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                <FiX />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-secondary"
                onClick={handleDownload}
              >
                <FiDownload />
                Download
              </button>
              
              {canEdit() && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit3 />
                  Edit
                </button>
              )}
              
              {canDelete() && (
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  <FiTrash2 />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="document-content">
        {/* Main Content */}
        <div className="content-main">
          {/* Document Preview */}
          <div className="document-preview">
            <div className="preview-header">
              <h3>
                <FiEye />
                Document Preview
              </h3>
              <button className="btn btn-secondary btn-sm">
                <FiShare2 />
                Share
              </button>
            </div>
            <div className="preview-content">
              <div className="preview-placeholder">
                <FiFile size={64} />
                <p>Document preview not available</p>
                <p className="preview-note">
                  Preview functionality would be implemented with a document viewer library
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="document-section">
            <h3>
              <FiFile />
              Description
            </h3>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="input description-input"
                placeholder="Add a description for this document..."
                rows="4"
              />
            ) : (
              <div className="description-content">
                {document.description ? (
                  <p>{document.description}</p>
                ) : (
                  <p className="no-description">No description provided.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="content-sidebar">
          {/* Document Info */}
          <div className="info-section">
            <h3>Document Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <FiCalendar />
                <div>
                  <label>Created</label>
                  <span>{formatDate(document.createdAt)}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FiCalendar />
                <div>
                  <label>Modified</label>
                  <span>{formatDate(document.modifiedAt)}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FiUser />
                <div>
                  <label>Uploaded by</label>
                  <span>{document.uploadedBy || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FiFile />
                <div>
                  <label>File size</label>
                  <span>{formatFileSize(document.size)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="metadata-section">
            <h3>
              <FiFolder />
              Project
            </h3>
            {isEditing ? (
              <select
                value={editForm.project}
                onChange={(e) => setEditForm(prev => ({ ...prev, project: e.target.value }))}
                className="input"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="metadata-content">
                {document.project ? (
                  <div className="project-badge">
                    <FiFolder />
                    {document.project.name}
                  </div>
                ) : (
                  <span className="no-value">Not assigned to any project</span>
                )}
              </div>
            )}
          </div>

          {/* Document Type */}
          <div className="metadata-section">
            <h3>
              <FiFile />
              Document Type
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={editForm.documentType}
                onChange={(e) => setEditForm(prev => ({ ...prev, documentType: e.target.value }))}
                className="input"
                placeholder="e.g., Contract, Invoice, Report..."
              />
            ) : (
              <div className="metadata-content">
                <span className={document.documentType ? '' : 'no-value'}>
                  {document.documentType || 'Not specified'}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="tags-section">
            <div className="tags-header">
              <h3>
                <FiTag />
                Tags ({editForm.tags.length})
              </h3>
              {isEditing && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleRegenerateTags}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? <FiRefreshCw className="spinning" /> : <FiRefreshCw />}
                  Regenerate
                </button>
              )}
            </div>
            
            <div className="tags-content">
              {editForm.tags.length > 0 ? (
                <div className="tags-list">
                  {editForm.tags.map(tag => (
                    <div key={tag.id} className="tag-item">
                      <TagBadge 
                        tag={tag} 
                        variant={isEditing ? 'removable' : 'default'}
                        onRemove={isEditing ? () => handleTagRemove(tag.id) : undefined}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-tags">No tags assigned</p>
              )}
              
              {isEditing && (
                <form onSubmit={handleTagAdd} className="tag-add-form">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="input"
                    placeholder="Add new tag..."
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <FiTag />
                    Add
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentView;

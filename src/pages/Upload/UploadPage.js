import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FiUpload, 
  FiFile, 
  FiX, 
  FiCheck, 
  FiAlertCircle,
  FiLoader,
  FiRefreshCw,
  FiTag,
  FiFolder,
  FiEdit3
} from 'react-icons/fi';
import TagBadge from '../../components/TagBadge/TagBadge';
import toast from 'react-hot-toast';
import './UploadPage.css';

function UploadPage() {
  const { uploadDocument, tags, projects, addTag, addProject, updateDocumentTags } = useDocuments();
  const { canUpload } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentlyReviewing, setCurrentlyReviewing] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!canUpload()) {
      toast.error('You do not have permission to upload files');
      return;
    }

    setIsUploading(true);
    const newUploads = [];

    for (const file of acceptedFiles) {
      try {
        const document = await uploadDocument(file);
        newUploads.push(document);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadedFiles(prev => [...prev, ...newUploads]);
    setIsUploading(false);

    // Auto-select first document for review
    if (newUploads.length > 0) {
      setCurrentlyReviewing(newUploads[0].id);
    }
  }, [uploadDocument, canUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg']
    },
    multiple: true,
    disabled: !canUpload()
  });

  const handleApproveTag = (documentId, tag) => {
    setUploadedFiles(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const updatedTags = doc.tags ? [...doc.tags, tag] : [tag];
        const updatedSuggestedTags = doc.suggestedTags?.filter(t => t.id !== tag.id) || [];
        
        return {
          ...doc,
          tags: updatedTags,
          suggestedTags: updatedSuggestedTags
        };
      }
      return doc;
    }));
    
    toast.success(`Added tag: ${tag.name}`);
  };

  const handleRejectTag = (documentId, tagId) => {
    setUploadedFiles(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const updatedSuggestedTags = doc.suggestedTags?.filter(t => t.id !== tagId) || [];
        return {
          ...doc,
          suggestedTags: updatedSuggestedTags
        };
      }
      return doc;
    }));
  };

  const handleApproveProject = (documentId, project) => {
    setUploadedFiles(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          project: project,
          suggestedProject: null
        };
      }
      return doc;
    }));
    
    if (project) {
      toast.success(`Assigned to project: ${project.name}`);
    } else {
      toast.success('Project suggestion rejected');
    }
  };

  const handleApproveDocumentType = (documentId, documentType) => {
    setUploadedFiles(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          documentType: documentType,
          suggestedDocumentType: null
        };
      }
      return doc;
    }));
    
    if (documentType) {
      toast.success(`Document type set to: ${documentType}`);
    } else {
      toast.success('Document type suggestion rejected');
    }
  };

  const handleManualTagAdd = (documentId, tagName) => {
    if (!tagName.trim()) return;
    
    // Check if tag already exists
    const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    let tag;
    
    if (existingTag) {
      tag = existingTag;
    } else {
      // Create new tag
      tag = addTag({
        name: tagName,
        type: 'manual',
        color: '#6b7280'
      });
    }
    
    handleApproveTag(documentId, tag);
  };

  const handleManualProjectAdd = (documentId, projectName) => {
    if (!projectName.trim()) return;
    
    // Check if project already exists
    const existingProject = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
    let project;
    
    if (existingProject) {
      project = existingProject;
    } else {
      // Create new project
      project = addProject({
        name: projectName.trim(),
        description: `Custom project created during upload`,
        color: '#3b82f6'
      });
    }
    
    handleApproveProject(documentId, project);
  };

  const handleManualDocumentTypeAdd = (documentId, documentTypeName) => {
    if (!documentTypeName.trim()) return;
    
    // Directly set the document type (no need to check existing as it's just a string)
    handleApproveDocumentType(documentId, documentTypeName.trim());
  };

  const handleFinishReview = (documentId) => {
    const document = uploadedFiles.find(doc => doc.id === documentId);
    if (!document) return;

    // Update document with all approved tags and metadata
    updateDocumentTags(documentId, document.tags || [], {
      project: document.project,
      documentType: document.documentType
    });

    // Remove from uploaded files list
    setUploadedFiles(prev => prev.filter(doc => doc.id !== documentId));
    
    // Move to next document for review
    const currentIndex = uploadedFiles.findIndex(doc => doc.id === documentId);
    const nextDocument = uploadedFiles[currentIndex + 1];
    if (nextDocument) {
      setCurrentlyReviewing(nextDocument.id);
    } else {
      setCurrentlyReviewing(null);
      toast.success('All documents have been reviewed!');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (name) => {
    const extension = name.split('.').pop()?.toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      txt: '📃',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      gif: '🖼️'
    };
    return icons[extension] || '📁';
  };

  if (!canUpload()) {
    return (
      <div className="upload-page">
        <div className="upload-unauthorized">
          <FiAlertCircle size={48} />
          <h2>Upload Not Permitted</h2>
          <p>You do not have permission to upload documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>Upload Documents</h1>
        <p>Upload your documents and review AI-powered tagging suggestions</p>
      </div>

      {/* Upload Zone */}
      <div className="upload-zone-container">
        <div
          {...getRootProps()}
          className={`upload-dropzone ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="upload-status">
              <FiLoader className="spinning" size={48} />
              <h3>Processing Documents...</h3>
              <p>Analyzing content and generating AI suggestions</p>
            </div>
          ) : (
            <div className="upload-content">
              <FiUpload size={48} />
              <h3>
                {isDragActive 
                  ? 'Drop the files here...' 
                  : 'Drag & drop files here, or click to select'
                }
              </h3>
              <p>Supports PDF, Word, Excel, PowerPoint, images, and text files</p>
              <button className="btn btn-primary">
                <FiFile />
                Select Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      {uploadedFiles.length > 0 && (
        <div className="review-section">
          <div className="review-header">
            <h2>Review AI Suggestions</h2>
            <p>Review and approve or modify the AI-generated tags and metadata for your documents</p>
          </div>

          <div className="review-content">
            {/* Document List Sidebar */}
            <div className="documents-sidebar">
              <h3>Uploaded Documents</h3>
              <div className="documents-list">
                {uploadedFiles.map(doc => (
                  <div
                    key={doc.id}
                    className={`document-item ${currentlyReviewing === doc.id ? 'active' : ''}`}
                    onClick={() => setCurrentlyReviewing(doc.id)}
                  >
                    <div className="document-icon">
                      {getFileIcon(doc.name)}
                    </div>
                    <div className="document-info">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-size">{formatFileSize(doc.size)}</div>
                    </div>
                    <div className="document-status">
                      {doc.suggestedTags?.length > 0 || doc.suggestedProject || doc.suggestedDocumentType ? (
                        <FiAlertCircle className="pending-icon" />
                      ) : (
                        <FiCheck className="complete-icon" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Panel */}
            {currentlyReviewing && (
              <ReviewPanel
                document={uploadedFiles.find(doc => doc.id === currentlyReviewing)}
                onApproveTag={handleApproveTag}
                onRejectTag={handleRejectTag}
                onApproveProject={handleApproveProject}
                onApproveDocumentType={handleApproveDocumentType}
                onManualTagAdd={handleManualTagAdd}
                onManualProjectAdd={handleManualProjectAdd}
                onManualDocumentTypeAdd={handleManualDocumentTypeAdd}
                onFinishReview={handleFinishReview}
                tags={tags}
                projects={projects}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Review Panel Component
function ReviewPanel({ 
  document, 
  onApproveTag, 
  onRejectTag, 
  onApproveProject, 
  onApproveDocumentType,
  onManualTagAdd,
  onManualProjectAdd,
  onManualDocumentTypeAdd,
  onFinishReview,
  tags,
  projects 
}) {
  const [manualTagInput, setManualTagInput] = useState('');
  const [manualProjectInput, setManualProjectInput] = useState('');
  const [manualDocumentTypeInput, setManualDocumentTypeInput] = useState('');

  const handleManualTagSubmit = (e) => {
    e.preventDefault();
    if (manualTagInput.trim()) {
      onManualTagAdd(document.id, manualTagInput.trim());
      setManualTagInput('');
    }
  };

  const handleManualProjectSubmit = (e) => {
    e.preventDefault();
    if (manualProjectInput.trim()) {
      onManualProjectAdd(document.id, manualProjectInput.trim());
      setManualProjectInput('');
    }
  };

  const handleManualDocumentTypeSubmit = (e) => {
    e.preventDefault();
    if (manualDocumentTypeInput.trim()) {
      onManualDocumentTypeAdd(document.id, manualDocumentTypeInput.trim());
      setManualDocumentTypeInput('');
    }
  };

  const hasPendingReviews = (
    document.suggestedTags?.length > 0 || 
    document.suggestedProject || 
    document.suggestedDocumentType
  );

  return (
    <div className="review-panel">
      <div className="review-panel-header">
        <h3>{document.name}</h3>
        <button
          className="btn btn-success"
          onClick={() => onFinishReview(document.id)}
          disabled={hasPendingReviews}
        >
          <FiCheck />
          {hasPendingReviews ? 'Finish Reviewing Suggestions' : 'Complete Review'}
        </button>
      </div>

      {/* Current Tags */}
      {document.tags?.length > 0 && (
        <div className="review-section-block">
          <h4>Applied Tags</h4>
          <div className="applied-tags">
            {document.tags.map(tag => (
              <TagBadge key={tag.id} tag={tag} variant="approved" />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Tags */}
      {document.suggestedTags?.length > 0 && (
        <div className="review-section-block">
          <h4>
            <FiTag />
            Suggested Tags
            <span className="suggestion-count">{document.suggestedTags.length}</span>
          </h4>
          <div className="suggestions-list">
            {document.suggestedTags.map(tag => (
              <div key={tag.id} className="suggestion-item">
                <TagBadge tag={tag} variant="suggested" confidence={tag.confidence} />
                <div className="suggestion-actions">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => onApproveTag(document.id, tag)}
                  >
                    <FiCheck />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onRejectTag(document.id, tag.id)}
                  >
                    <FiX />
                  </button>
                </div>
                {tag.reason && (
                  <div className="suggestion-reason">{tag.reason}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Project */}
      {document.suggestedProject && (
        <div className="review-section-block">
          <h4>
            <FiFolder />
            Suggested Project
          </h4>
          <div className="suggestion-item">
            <div className="project-suggestion">
              <strong>{document.suggestedProject.name}</strong>
              <span className="confidence-badge">
                {Math.round(document.suggestedProject.confidence * 100)}% confidence
              </span>
            </div>
            <div className="suggestion-actions">
              <button
                className="btn btn-sm btn-success"
                onClick={() => onApproveProject(document.id, document.suggestedProject)}
              >
                <FiCheck /> Assign
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onApproveProject(document.id, null)}
              >
                <FiX /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Document Type */}
      {document.suggestedDocumentType && (
        <div className="review-section-block">
          <h4>
            <FiFile />
            Suggested Document Type
          </h4>
          <div className="suggestion-item">
            <div className="doc-type-suggestion">
              <strong>{document.suggestedDocumentType}</strong>
            </div>
            <div className="suggestion-actions">
              <button
                className="btn btn-sm btn-success"
                onClick={() => onApproveDocumentType(document.id, document.suggestedDocumentType)}
              >
                <FiCheck /> Apply
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onApproveDocumentType(document.id, document.documentType)}
              >
                <FiX /> Keep Current
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Tag Addition */}
      <div className="review-section-block">
        <h4>
          <FiEdit3 />
          Add Custom Tag
        </h4>
        <p className="section-description">Create a new tag or add an existing one to this document.</p>
        <form onSubmit={handleManualTagSubmit} className="manual-tag-form">
          <input
            type="text"
            value={manualTagInput}
            onChange={(e) => setManualTagInput(e.target.value)}
            placeholder="Enter tag name..."
            className="input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <FiCheck />
            Add Tag
          </button>
        </form>
      </div>

      {/* Manual Project Addition */}
      <div className="review-section-block">
        <h4>
          <FiFolder />
          Add Custom Project
        </h4>
        <p className="section-description">Assign this document to a new or existing project.</p>
        <form onSubmit={handleManualProjectSubmit} className="manual-tag-form">
          <input
            type="text"
            value={manualProjectInput}
            onChange={(e) => setManualProjectInput(e.target.value)}
            placeholder="Enter project name..."
            className="input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <FiCheck />
            Add Project
          </button>
        </form>
      </div>

      {/* Manual Document Type Addition */}
      <div className="review-section-block">
        <h4>
          <FiFile />
          Set Custom Document Type
        </h4>
        <p className="section-description">Specify a custom document type for better organization.</p>
        <form onSubmit={handleManualDocumentTypeSubmit} className="manual-tag-form">
          <input
            type="text"
            value={manualDocumentTypeInput}
            onChange={(e) => setManualDocumentTypeInput(e.target.value)}
            placeholder="e.g., Contract, Invoice, Report..."
            className="input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <FiCheck />
            Set Type
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadPage;

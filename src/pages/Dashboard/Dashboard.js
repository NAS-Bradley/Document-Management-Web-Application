import React, { useState, useMemo } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FiFile, 
  FiClock, 
  FiStar, 
  FiUpload, 
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiPlus
} from 'react-icons/fi';
import DocumentCard from '../../components/DocumentCard/DocumentCard';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import StatsCard from '../../components/StatsCard/StatsCard';
import './Dashboard.css';

function Dashboard() {
  const { 
    documents, 
    loading, 
    getFilteredDocuments, 
    bulkReAnalyze,
    searchQuery 
  } = useDocuments();
  const { canUpload, canBulkOperations } = useAuth();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [sortBy, setSortBy] = useState('uploadDate'); // 'uploadDate' | 'name' | 'size'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Get filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    let docs = getFilteredDocuments();
    
    // Apply sorting
    docs.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'uploadDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return docs;
  }, [getFilteredDocuments, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const pendingReview = documents.filter(doc => doc.status === 'pending_review').length;
    const recentDocuments = documents.filter(doc => {
      const uploadDate = new Date(doc.uploadDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate >= weekAgo;
    }).length;
    
    return {
      total,
      pendingReview,
      recentDocuments,
      approved: documents.filter(doc => doc.status === 'approved').length
    };
  }, [documents]);

  const handleBulkReAnalyze = async () => {
    if (selectedDocuments.length > 0) {
      await bulkReAnalyze(selectedDocuments);
      setSelectedDocuments([]);
    } else {
      await bulkReAnalyze();
    }
  };

  const handleDocumentSelect = (documentId, isSelected) => {
    setSelectedDocuments(prev => 
      isSelected 
        ? [...prev, documentId]
        : prev.filter(id => id !== documentId)
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-lg" />
        <p>Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Manage your documents with AI-powered tagging</p>
        </div>
        
        <div className="dashboard-actions">
          {canUpload() && (
            <button className="btn btn-primary">
              <FiPlus />
              Upload Document
            </button>
          )}
          
          {canBulkOperations() && (
            <button 
              className="btn btn-secondary"
              onClick={handleBulkReAnalyze}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              {selectedDocuments.length > 0 
                ? `Re-analyze ${selectedDocuments.length} selected` 
                : 'Re-analyze All'
              }
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <StatsCard
          title="Total Documents"
          value={stats.total}
          icon={FiFile}
          color="blue"
          trend={stats.recentDocuments > 0 ? `+${stats.recentDocuments} this week` : null}
        />
        
        <StatsCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={FiStar}
          color="yellow"
          highlight={stats.pendingReview > 0}
          action={stats.pendingReview > 0 ? () => console.log('Filter pending') : null}
        />
        
        <StatsCard
          title="Recent Uploads"
          value={stats.recentDocuments}
          icon={FiClock}
          color="green"
        />
        
        <StatsCard
          title="Upload Rate"
          value={`${Math.round(stats.recentDocuments / 7 * 10) / 10}/day`}
          icon={FiUpload}
          color="purple"
        />
      </div>

      {/* Controls Bar */}
      <div className="dashboard-controls">
        <div className="controls-left">
          <button
            className={`btn btn-ghost ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
          </button>
          
          {selectedDocuments.length > 0 && (
            <div className="selection-info">
              <span>{selectedDocuments.length} selected</span>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setSelectedDocuments([])}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="controls-right">
          {/* Sort Controls */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="uploadDate-desc">Latest First</option>
            <option value="uploadDate-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Size (Large First)</option>
            <option value="size-asc">Size (Small First)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`btn btn-ghost btn-icon-only ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <FiGrid />
            </button>
            <button
              className={`btn btn-ghost btn-icon-only ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Filter Panel */}
        {showFilters && (
          <div className="dashboard-filters">
            <FilterPanel />
          </div>
        )}

        {/* Documents Section */}
        <div className="documents-section">
          {searchQuery && (
            <div className="search-results-header">
              <h2>Search Results for "{searchQuery}"</h2>
              <span className="results-count">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}

          {filteredDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No documents found</h3>
              <p>
                {searchQuery || Object.values(getFilteredDocuments()).some(f => f.length > 0)
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'
                }
              </p>
              {canUpload() && (
                <button className="btn btn-primary">
                  <FiPlus />
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              {filteredDocuments.length > 1 && (
                <div className="bulk-actions-bar">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === filteredDocuments.length}
                      onChange={handleSelectAll}
                    />
                    Select all {filteredDocuments.length} documents
                  </label>
                </div>
              )}

              {/* Documents Grid/List */}
              <div className={`documents-container ${viewMode}`}>
                {filteredDocuments.map(document => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    viewMode={viewMode}
                    isSelected={selectedDocuments.includes(document.id)}
                    onSelect={handleDocumentSelect}
                    showSelection={canBulkOperations()}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

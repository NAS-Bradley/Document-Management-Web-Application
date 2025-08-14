import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { 
  FiHome, 
  FiUpload, 
  FiFile, 
  FiTag, 
  FiUsers, 
  FiPieChart,
  FiFolder,
  FiStar,
  FiClock,
  FiArchive 
} from 'react-icons/fi';
import './Sidebar.css';

function Sidebar() {
  const { canUpload, canManageUsers } = useAuth();
  const { documents, projects } = useDocuments();

  // Get document counts for dashboard stats
  const recentDocuments = documents.filter(doc => {
    const uploadDate = new Date(doc.uploadDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate >= weekAgo;
  }).length;

  const pendingReview = documents.filter(doc => doc.status === 'pending_review').length;
  const totalDocuments = documents.length;

  const navigationItems = [
    {
      to: '/dashboard',
      icon: FiHome,
      label: 'Dashboard',
      badge: null
    },
    {
      to: '/upload',
      icon: FiUpload,
      label: 'Upload',
      badge: null,
      requiresPermission: 'upload'
    },
    {
      to: '/documents',
      icon: FiFile,
      label: 'All Documents',
      badge: totalDocuments > 0 ? totalDocuments : null
    },
    {
      to: '/tags',
      icon: FiTag,
      label: 'Tag Management',
      badge: null
    }
  ];

  if (canManageUsers()) {
    navigationItems.push({
      to: '/users',
      icon: FiUsers,
      label: 'User Management',
      badge: null
    });
  }

  const quickAccessItems = [
    {
      label: 'Recent Documents',
      icon: FiClock,
      count: recentDocuments,
      filter: 'recent'
    },
    {
      label: 'Pending Review',
      icon: FiStar,
      count: pendingReview,
      filter: 'pending_review',
      highlight: pendingReview > 0
    },
    {
      label: 'All Projects',
      icon: FiFolder,
      count: projects.length,
      filter: 'projects'
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-title">Main</div>
            <ul className="nav-list">
              {navigationItems.map((item) => {
                if (item.requiresPermission && !canUpload()) {
                  return null;
                }
                
                return (
                  <li key={item.to} className="nav-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => 
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <item.icon className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Access */}
          <div className="nav-section">
            <div className="nav-title">Quick Access</div>
            <ul className="nav-list">
              {quickAccessItems.map((item, index) => (
                <li key={index} className="nav-item">
                  <button 
                    className={`nav-link quick-access-link ${item.highlight ? 'highlight' : ''}`}
                    onClick={() => {
                      // Handle quick filter navigation
                      console.log('Quick access filter:', item.filter);
                    }}
                  >
                    <item.icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.count > 0 && (
                      <span className={`nav-badge ${item.highlight ? 'badge-warning' : ''}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects List */}
          {projects.length > 0 && (
            <div className="nav-section">
              <div className="nav-title">Projects</div>
              <ul className="nav-list">
                {projects.slice(0, 5).map((project) => (
                  <li key={project.id} className="nav-item">
                    <button 
                      className="nav-link project-link"
                      onClick={() => {
                        // Handle project filter
                        console.log('Filter by project:', project.id);
                      }}
                      title={project.description}
                    >
                      <FiFolder className="nav-icon" />
                      <span className="nav-label project-name">{project.name}</span>
                      <span className="project-doc-count">
                        {documents.filter(doc => doc.project?.id === project.id).length}
                      </span>
                    </button>
                  </li>
                ))}
                {projects.length > 5 && (
                  <li className="nav-item">
                    <NavLink to="/tags" className="nav-link more-link">
                      <span className="nav-label">View all projects...</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Documents</span>
              <span className="stat-value">{totalDocuments}</span>
            </div>
            {pendingReview > 0 && (
              <div className="stat-item highlight">
                <span className="stat-label">Pending Review</span>
                <span className="stat-value">{pendingReview}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

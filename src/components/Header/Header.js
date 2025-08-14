import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { FiSearch, FiUser, FiLogOut, FiSettings, FiFilter, FiX } from 'react-icons/fi';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery, selectedFilters, clearFilters } = useDocuments();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== null
  );

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo and Title */}
        <div className="header-brand">
          <div className="logo">
            <div className="logo-icon">📁</div>
            <h1 className="logo-text">DocMgmt</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search documents, tags, content..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                title="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
          
          {hasActiveFilters && (
            <div className="active-filters-indicator">
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
                title="Clear all filters"
              >
                <FiFilter />
                <span className="filter-count">
                  {Object.values(selectedFilters).reduce((count, filter) => 
                    count + (Array.isArray(filter) ? filter.length : filter ? 1 : 0), 0
                  )}
                </span>
                <FiX size={12} />
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="header-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          
          <div className="user-menu-wrapper">
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  <FiUser />
                </div>
              )}
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="user-menu-overlay"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className="user-menu-info">
                      <div className="user-menu-name">{user?.name}</div>
                      <div className="user-menu-email">{user?.email}</div>
                    </div>
                  </div>
                  
                  <div className="user-menu-divider" />
                  
                  <button className="user-menu-item">
                    <FiSettings />
                    Settings
                  </button>
                  
                  <div className="user-menu-divider" />
                  
                  <button 
                    className="user-menu-item logout-item"
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

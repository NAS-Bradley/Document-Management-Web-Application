import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FiUsers, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiSearch,
  FiFilter,
  FiShield,
  FiMail,
  FiCalendar,
  FiAlertCircle,
  FiUserPlus,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './UserManagement.css';

const ROLES = [
  { 
    value: 'admin', 
    label: 'Administrator', 
    description: 'Full system access including user management',
    color: '#dc2626'
  },
  { 
    value: 'manager', 
    label: 'Manager', 
    description: 'Can manage documents and tags',
    color: '#ea580c'
  },
  { 
    value: 'user', 
    label: 'User', 
    description: 'Can upload and manage own documents',
    color: '#2563eb'
  },
  { 
    value: 'viewer', 
    label: 'Viewer', 
    description: 'Read-only access to documents',
    color: '#6b7280'
  }
];

function UserManagement() {
  const { canManageUsers } = useAuth();
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      documentsCount: 45
    },
    {
      id: '2',
      name: 'Jane Manager',
      email: 'manager@company.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      documentsCount: 32
    },
    {
      id: '3',
      name: 'Bob User',
      email: 'user@company.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-13T09:20:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      documentsCount: 18
    },
    {
      id: '4',
      name: 'Alice Viewer',
      email: 'viewer@company.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '2024-01-10T14:15:00Z',
      createdAt: '2024-01-04T00:00:00Z',
      documentsCount: 0
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    // Check for duplicate email
    const existingUser = users.find(u => u.email.toLowerCase() === createForm.email.toLowerCase());
    if (existingUser) {
      toast.error('A user with this email already exists');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      ...createForm,
      name: createForm.name.trim(),
      email: createForm.email.trim().toLowerCase(),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      documentsCount: 0
    };

    setUsers(prev => [...prev, newUser]);
    setCreateForm({ name: '', email: '', role: 'user' });
    setShowCreateForm(false);
    toast.success('User created successfully');
  };

  const handleUpdateUser = (userId, updates) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    setEditingUser(null);
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let message = `Are you sure you want to delete user "${user.name}"?`;
    if (user.documentsCount > 0) {
      message += ` This user has ${user.documentsCount} document${user.documentsCount === 1 ? '' : 's'}.`;
    }
    message += ' This action cannot be undone.';

    const confirmed = window.confirm(message);
    if (confirmed) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const handleToggleStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    handleUpdateUser(userId, { status: newStatus });
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const getRoleInfo = (roleValue) => {
    return ROLES.find(r => r.value === roleValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canManageUsers()) {
    return (
      <div className="user-management">
        <div className="unauthorized-message">
          <FiAlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You do not have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FiUsers />
            User Management
          </h1>
          <p>Manage user accounts, roles, and permissions</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <FiUserPlus />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FiUserX />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {users.filter(u => u.status === 'inactive').length}
            </div>
            <div className="stat-label">Inactive Users</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-control">
          <FiSearch />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>
              <FiFilter />
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input filter-select"
            >
              <option value="all">All Roles</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <UserRow
                key={user.id}
                user={user}
                isEditing={editingUser === user.id}
                onEdit={() => setEditingUser(user.id)}
                onSave={(updates) => handleUpdateUser(user.id, updates)}
                onCancel={() => setEditingUser(null)}
                onDelete={() => handleDeleteUser(user.id)}
                onToggleStatus={() => handleToggleStatus(user.id)}
                getRoleInfo={getRoleInfo}
                formatDate={formatDate}
              />
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <FiUsers size={48} />
            <h3>No users found</h3>
            <p>
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first user to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="create-user-form">
              <div className="form-group">
                <label htmlFor="user-name">Full Name *</label>
                <input
                  id="user-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter full name..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-email">Email Address *</label>
                <input
                  id="user-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-role">Role</label>
                <select
                  id="user-role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  className="input"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="field-description">
                  {getRoleInfo(createForm.role)?.description}
                </div>
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
                  <FiUserPlus />
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// User Row Component
function UserRow({ 
  user, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onToggleStatus,
  getRoleInfo, 
  formatDate 
}) {
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    onSave(editForm);
  };

  const roleInfo = getRoleInfo(user.role);

  if (isEditing) {
    return (
      <tr className="user-row editing">
        <td>
          <div className="user-info-edit">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Full name..."
            />
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              className="input"
              placeholder="Email address..."
            />
          </div>
        </td>
        <td>
          <select
            value={editForm.role}
            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
            className="input"
          >
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </td>
        <td>
          <span className={`status-badge status-${user.status}`}>
            {user.status}
          </span>
        </td>
        <td>{user.documentsCount}</td>
        <td>{formatDate(user.lastLogin)}</td>
        <td>
          <div className="row-actions">
            <button 
              className="btn btn-success btn-sm"
              onClick={handleSave}
            >
              <FiSave />
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onCancel}
            >
              <FiX />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="user-row">
      <td>
        <div className="user-info">
          <div className="user-avatar">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      </td>
      <td>
        <div 
          className="role-badge"
          style={{ backgroundColor: roleInfo?.color || '#6b7280' }}
        >
          <FiShield />
          {roleInfo?.label || user.role}
        </div>
      </td>
      <td>
        <button
          className={`status-badge status-${user.status} clickable`}
          onClick={onToggleStatus}
          title={`Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}
        >
          {user.status === 'active' ? <FiUserCheck /> : <FiUserX />}
          {user.status}
        </button>
      </td>
      <td>
        <span className="documents-count">{user.documentsCount}</span>
      </td>
      <td>
        <span className="last-login">
          <FiCalendar />
          {formatDate(user.lastLogin)}
        </span>
      </td>
      <td>
        <div className="row-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onEdit}
          >
            <FiEdit3 />
          </button>
          <button 
            className="btn btn-danger btn-sm"
            onClick={onDelete}
          >
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default UserManagement;

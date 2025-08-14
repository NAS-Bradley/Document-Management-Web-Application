import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    default:
      return state;
  }
}

// Sample user roles and permissions
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer'
};

const PERMISSIONS = {
  UPLOAD: 'upload',
  DELETE: 'delete',
  EDIT_TAGS: 'edit_tags',
  MANAGE_USERS: 'manage_users',
  BULK_OPERATIONS: 'bulk_operations',
  VIEW_AUDIT: 'view_audit'
};

const rolePermissions = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.MANAGER]: [PERMISSIONS.UPLOAD, PERMISSIONS.DELETE, PERMISSIONS.EDIT_TAGS, PERMISSIONS.BULK_OPERATIONS, PERMISSIONS.VIEW_AUDIT],
  [USER_ROLES.USER]: [PERMISSIONS.UPLOAD, PERMISSIONS.EDIT_TAGS],
  [USER_ROLES.VIEWER]: []
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Simulate authentication check
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(storedUser) });
      } else {
        // For demo purposes, auto-login as admin
        const demoUser = {
          id: '1',
          name: 'Bradley Worthen',
          email: 'bradley.worthen@nortek.com',
          role: USER_ROLES.ADMIN,
          avatar: null,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        dispatch({ type: 'SET_USER', payload: demoUser });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: '1',
        name: credentials.name || 'Demo User',
        email: credentials.email,
        role: credentials.role || USER_ROLES.USER,
        avatar: null,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      
      return user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const isAdmin = () => hasRole(USER_ROLES.ADMIN);
  const isManager = () => hasRole(USER_ROLES.MANAGER) || isAdmin();
  
  const canUpload = () => hasPermission(PERMISSIONS.UPLOAD);
  const canDelete = () => hasPermission(PERMISSIONS.DELETE);
  const canEditTags = () => hasPermission(PERMISSIONS.EDIT_TAGS);
  const canManageUsers = () => hasPermission(PERMISSIONS.MANAGE_USERS);
  const canBulkOperations = () => hasPermission(PERMISSIONS.BULK_OPERATIONS);
  const canViewAudit = () => hasPermission(PERMISSIONS.VIEW_AUDIT);

  const value = {
    ...state,
    login,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    isManager,
    canUpload,
    canDelete,
    canEditTags,
    canManageUsers,
    canBulkOperations,
    canViewAudit,
    USER_ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

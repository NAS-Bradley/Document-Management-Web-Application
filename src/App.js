import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import DocumentView from './pages/DocumentView/DocumentView';
import TagManagement from './pages/TagManagement/TagManagement';
import UserManagement from './pages/UserManagement/UserManagement';
import Login from './pages/Login/Login';
import UploadPage from './pages/Upload/UploadPage';
import './styles/App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/document/:id" element={<DocumentView />} />
            <Route path="/tags" element={<TagManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;

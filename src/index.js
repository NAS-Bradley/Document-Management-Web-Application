import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DocumentProvider } from './context/DocumentContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DocumentProvider>
          <App />
          <Toaster position="top-right" />
        </DocumentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

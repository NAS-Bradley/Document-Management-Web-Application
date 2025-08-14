import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { aiTaggingService } from '../services/aiTaggingService';
import toast from 'react-hot-toast';

const DocumentContext = createContext();

const initialState = {
  documents: [],
  tags: [],
  projects: [],
  documentTypes: ['PDF', 'Word', 'Excel', 'PowerPoint', 'Image', 'Text', 'Other'],
  loading: false,
  error: null,
  searchQuery: '',
  selectedFilters: {
    tags: [],
    projects: [],
    documentTypes: [],
    dateRange: null
  }
};

function documentReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
        loading: false
      };
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
        )
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload)
      };
    
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload, loading: false };
    
    case 'ADD_TAG':
      return {
        ...state,
        tags: [...state.tags, action.payload]
      };
    
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? { ...tag, ...action.payload } : tag
        )
      };
    
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload)
      };
    
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, selectedFilters: { ...state.selectedFilters, ...action.payload } };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        selectedFilters: {
          tags: [],
          projects: [],
          documentTypes: [],
          dateRange: null
        }
      };
    
    default:
      return state;
  }
}

export function DocumentProvider({ children }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Initialize sample data
  useEffect(() => {
    const sampleTags = [
      { id: '1', name: 'Important', color: '#ff6b6b', type: 'priority' },
      { id: '2', name: 'Review Required', color: '#ffd93d', type: 'status' },
      { id: '3', name: 'Archived', color: '#6bcf7f', type: 'status' },
      { id: '4', name: 'Client Documents', color: '#4d94ff', type: 'category' }
    ];

    const sampleProjects = [
      { id: '1', name: 'Project Alpha', description: 'Main development project' },
      { id: '2', name: 'Project Beta', description: 'Research and development' },
      { id: '3', name: 'Administrative', description: 'General administrative tasks' }
    ];

    dispatch({ type: 'SET_TAGS', payload: sampleTags });
    dispatch({ type: 'SET_PROJECTS', payload: sampleProjects });
  }, []);

  const uploadDocument = async (file, metadata = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate file upload and AI analysis
      const documentId = uuidv4();
      
      // Extract basic metadata
      const basicMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };

      // Get AI suggestions
      const aiSuggestions = await aiTaggingService.analyzeDocument(file, basicMetadata);
      
      const newDocument = {
        id: documentId,
        ...basicMetadata,
        ...metadata,
        uploadDate: new Date().toISOString(),
        tags: [],
        suggestedTags: aiSuggestions.suggestedTags,
        suggestedProject: aiSuggestions.suggestedProject,
        suggestedDocumentType: aiSuggestions.suggestedDocumentType,
        content: aiSuggestions.extractedContent,
        status: 'pending_review', // pending_review, approved, rejected
        url: URL.createObjectURL(file) // In production, this would be a server URL
      };

      dispatch({ type: 'ADD_DOCUMENT', payload: newDocument });
      toast.success('Document uploaded successfully! Please review AI suggestions.');
      
      return newDocument;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to upload document');
      throw error;
    }
  };

  const updateDocumentTags = (documentId, tags, approvedSuggestions = {}) => {
    const updatedDocument = {
      tags,
      ...approvedSuggestions,
      status: 'approved',
      reviewedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: documentId, ...updatedDocument } });
    toast.success('Document tags updated successfully');
  };

  const reAnalyzeDocument = async (documentId) => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (!document) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Re-analyze with current content and context
      const newSuggestions = await aiTaggingService.reAnalyzeDocument(document);
      
      dispatch({
        type: 'UPDATE_DOCUMENT',
        payload: {
          id: documentId,
          suggestedTags: newSuggestions.suggestedTags,
          suggestedProject: newSuggestions.suggestedProject,
          suggestedDocumentType: newSuggestions.suggestedDocumentType,
          reAnalyzedAt: new Date().toISOString()
        }
      });
      
      toast.success('Document re-analyzed successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to re-analyze document');
    }
  };

  const bulkReAnalyze = async (documentIds = null) => {
    const documentsToAnalyze = documentIds 
      ? state.documents.filter(doc => documentIds.includes(doc.id))
      : state.documents;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      for (const document of documentsToAnalyze) {
        await reAnalyzeDocument(document.id);
      }
      toast.success(`Re-analyzed ${documentsToAnalyze.length} documents`);
    } catch (error) {
      toast.error('Failed to complete bulk re-analysis');
    }
  };

  const deleteDocument = (documentId) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: documentId });
    toast.success('Document deleted successfully');
  };

  const addTag = (tagData) => {
    const newTag = {
      id: uuidv4(),
      ...tagData,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TAG', payload: newTag });
    return newTag;
  };

  const updateTag = (tagId, tagData) => {
    dispatch({ type: 'UPDATE_TAG', payload: { id: tagId, ...tagData } });
  };

  const deleteTag = (tagId) => {
    // Also remove this tag from all documents
    state.documents.forEach(doc => {
      if (doc.tags.some(tag => tag.id === tagId)) {
        const updatedTags = doc.tags.filter(tag => tag.id !== tagId);
        dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: doc.id, tags: updatedTags } });
      }
    });
    dispatch({ type: 'DELETE_TAG', payload: tagId });
  };

  const addProject = (projectData) => {
    const newProject = {
      id: uuidv4(),
      ...projectData,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    return newProject;
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const getFilteredDocuments = () => {
    let filtered = [...state.documents];

    // Search query filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.content?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (state.selectedFilters.tags.length > 0) {
      filtered = filtered.filter(doc =>
        doc.tags.some(tag => state.selectedFilters.tags.includes(tag.id))
      );
    }

    // Project filter
    if (state.selectedFilters.projects.length > 0) {
      filtered = filtered.filter(doc =>
        state.selectedFilters.projects.includes(doc.project?.id)
      );
    }

    // Document type filter
    if (state.selectedFilters.documentTypes.length > 0) {
      filtered = filtered.filter(doc =>
        state.selectedFilters.documentTypes.includes(doc.documentType)
      );
    }

    return filtered;
  };

  const value = {
    ...state,
    uploadDocument,
    updateDocumentTags,
    reAnalyzeDocument,
    bulkReAnalyze,
    deleteDocument,
    addTag,
    updateTag,
    deleteTag,
    addProject,
    setSearchQuery,
    setFilters,
    clearFilters,
    getFilteredDocuments
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}

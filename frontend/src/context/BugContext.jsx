// ============================================================
// context/BugContext.jsx - Global Bug & Project State
// Unit 2: Context API state management
// Unit 3: REST API integration (Axios)
// CO2, CO3: Full-stack data flow
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { bugsAPI, projectsAPI } from '../utils/api';

const BugContext = createContext(null);

export const useBugs = () => {
  const ctx = useContext(BugContext);
  if (!ctx) throw new Error('useBugs must be used inside BugProvider');
  return ctx;
};

export const BugProvider = ({ children }) => {
  const [bugs,     setBugs]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // ── Bug CRUD ──────────────────────────────────────────────
  const fetchBugs = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await bugsAPI.getAll(filters);
      setBugs(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bugs');
    } finally { setLoading(false); }
  }, []);

  const createBug = async (bugData) => {
    const { data } = await bugsAPI.create(bugData);
    setBugs(prev => [data.data, ...prev]);
    return data.data;
  };

  const updateBug = async (id, updates) => {
    const { data } = await bugsAPI.update(id, updates);
    setBugs(prev => prev.map(b => b._id === id ? data.data : b));
    return data.data;
  };

  const deleteBug = async (id) => {
    await bugsAPI.delete(id);
    setBugs(prev => prev.filter(b => b._id !== id));
  };

  const addComment = async (bugId, text) => {
    const { data } = await bugsAPI.addComment(bugId, { text });
    setBugs(prev => prev.map(b => b._id === bugId ? { ...b, comments: data.data } : b));
  };

  // ── Project CRUD ──────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await projectsAPI.getAll();
      setProjects(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    }
  }, []);

  const createProject = async (projectData) => {
    const { data } = await projectsAPI.create(projectData);
    setProjects(prev => [data.data, ...prev]);
    return data.data;
  };

  const deleteProject = async (id) => {
    await projectsAPI.delete(id);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <BugContext.Provider value={{
      bugs, projects, loading, error,
      fetchBugs, createBug, updateBug, deleteBug, addComment,
      fetchProjects, createProject, deleteProject,
    }}>
      {children}
    </BugContext.Provider>
  );
};

export default BugContext;

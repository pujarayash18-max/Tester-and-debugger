// ============================================================
// controllers/projectController.js
// Unit 3: REST API CRUD for Projects
// Fix: always populate members so frontend gets full user objects
// ============================================================

const Project = require('../models/Project');
const Bug     = require('../models/Bug');

// @desc    Get all projects (members populated)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email role')
      .populate('members',   'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members',   'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
  try {
    const { name, description, members, status } = req.body;
    const project = await Project.create({
      name, description,
      status:    status  || 'Active',
      createdBy: req.user._id,
      members:   members || [],
    });

    await project.populate('members',   'name email role');
    await project.populate('createdBy', 'name email role');

    res.status(201).json({ success: true, message: 'Project created', data: project });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Project name already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project (name, description, status, members)
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
      .populate('members',   'name email role')
      .populate('createdBy', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, message: 'Project updated', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project + its bugs
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await Bug.deleteMany({ project: req.params.id });
    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project and associated bugs deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
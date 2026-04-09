// ============================================================
// controllers/bugController.js
// Unit 3: REST API + CRUD Operations + Error Handling
// CO2, CO3: Backend Development & Database Connectivity
// ============================================================

const Bug = require('../models/Bug');
const Project = require('../models/Project');

// @desc    Get all bugs (with filters)
// @route   GET /api/bugs
// @access  Private
const getBugs = async (req, res) => {
  try {
    const { project, severity, status, assignedTo, search } = req.query;
    const query = {};

    if (project)    query.project    = project;
    if (severity)   query.severity   = severity;
    if (status)     query.status     = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search)     query.title      = { $regex: search, $options: 'i' };

    // Developers only see assigned bugs
    if (req.user.role === 'Developer') {
      query.assignedTo = req.user._id;
    }

    const bugs = await Bug.find(query)
      .populate('project', 'name')
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bugs.length, data: bugs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Private
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('project', 'name description')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.postedBy', 'name email')
      .populate('activityLog.performedBy', 'name');

    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }
    res.status(200).json({ success: true, data: bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create bug
// @route   POST /api/bugs
// @access  Private (Tester, Admin)
const createBug = async (req, res) => {
  try {
    const { title, description, project, severity, assignedTo, tags } = req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const bug = await Bug.create({
      title, description, project, severity,
      assignedTo: assignedTo || null,
      tags: tags || [],
      reportedBy: req.user._id,
      activityLog: [{ action: 'Bug reported', performedBy: req.user._id }],
    });

    await bug.populate('project', 'name');
    await bug.populate('reportedBy', 'name email');

    res.status(201).json({ success: true, message: 'Bug reported successfully', data: bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update bug (status, assign, etc.)
// @route   PUT /api/bugs/:id
// @access  Private
const updateBug = async (req, res) => {
  try {
    let bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ success: false, message: 'Bug not found' });

    const allowed = ['title', 'description', 'severity', 'status', 'assignedTo', 'tags'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    // Log activity
    const logEntry = { action: `Updated: ${Object.keys(updates).join(', ')}`, performedBy: req.user._id };
    if (updates.status) logEntry.action = `Status changed to ${updates.status}`;
    if (updates.assignedTo) logEntry.action = `Bug assigned`;

    bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { ...updates, $push: { activityLog: logEntry } },
      { new: true, runValidators: true }
    )
      .populate('project', 'name')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({ success: true, message: 'Bug updated', data: bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Private (Admin only)
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ success: false, message: 'Bug not found' });

    await bug.deleteOne();
    res.status(200).json({ success: true, message: 'Bug deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to bug
// @route   POST /api/bugs/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text required' });

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: { text, postedBy: req.user._id },
          activityLog: { action: 'Comment added', performedBy: req.user._id },
        },
      },
      { new: true }
    ).populate('comments.postedBy', 'name email');

    if (!bug) return res.status(404).json({ success: false, message: 'Bug not found' });

    res.status(201).json({ success: true, data: bug.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBugs, getBugById, createBug, updateBug, deleteBug, addComment };

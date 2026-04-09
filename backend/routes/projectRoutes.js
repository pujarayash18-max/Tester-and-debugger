const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProject);

router.route('/:id')
  .put(authorize('Admin'), updateProject)
  .delete(authorize('Admin'), deleteProject);

module.exports = router;

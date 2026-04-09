// ============================================================
// routes/bugRoutes.js - Bug CRUD Routes
// Unit 3: RESTful API design
// ============================================================

const express = require('express');
const router = express.Router();
const { getBugs, getBugById, createBug, updateBug, deleteBug, addComment } = require('../controllers/bugController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All bug routes require auth

router.route('/')
  .get(getBugs)
  .post(authorize('Tester', 'Admin'), createBug);

router.route('/:id')
  .get(getBugById)
  .put(updateBug)
  .delete(authorize('Admin'), deleteBug);

router.post('/:id/comments', addComment);

module.exports = router;

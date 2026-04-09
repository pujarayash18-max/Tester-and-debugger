const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.route('/').get(getUsers);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;

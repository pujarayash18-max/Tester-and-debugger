// ============================================================
// controllers/userController.js
// Unit 3 + 4: User CRUD & Role Management (Admin only)
// ============================================================

const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'Admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete Admin user' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser };

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle lock/unlock user account (Admin)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản thành công`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Cập nhật vai trò thành công', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system dashboard stats (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments({ status: 'open' });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalAssignments = await Assignment.countDocuments();

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      totalAssignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate({ path: 'student', select: 'name email studentId' })
      .populate({ path: 'course', select: 'title code category materials teacher', populate: { path: 'teacher', select: 'name email' } })
      .sort({ enrolledAt: -1 });
    res.json(enrollments.filter((item) => item.student && item.course));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getSystemStats,
  getAllEnrollments,
};

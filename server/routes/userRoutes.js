const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getSystemStats,
  getAllEnrollments,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/stats', getSystemStats);
router.get('/enrollments', getAllEnrollments);
router.put('/:id/toggle-status', toggleUserStatus);
router.put('/:id/role', updateUserRole);

module.exports = router;

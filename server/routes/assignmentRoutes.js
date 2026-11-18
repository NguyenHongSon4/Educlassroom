const express = require('express');
const router = express.Router();
const {
  getAssignmentsByCourse,
  getAssignmentById,
  createAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const {
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Assignments in a course
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.post(
  '/course/:courseId',
  protect,
  authorize('teacher', 'admin'),
  upload.single('file'),
  createAssignment
);

// Single assignment
router.get('/:id', protect, getAssignmentById);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

// Submissions
router.post(
  '/:id/submit',
  protect,
  authorize('student'),
  upload.single('file'),
  submitAssignment
);
router.get('/:id/my-submission', protect, authorize('student'), getMySubmission);
router.get(
  '/:id/submissions',
  protect,
  authorize('teacher', 'admin'),
  getAssignmentSubmissions
);

module.exports = router;

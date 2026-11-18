const express = require('express');
const router = express.Router();
const {
  gradeSubmission,
  getMyGrades,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);
router.get('/my-grades', protect, authorize('student'), getMyGrades);

module.exports = router;

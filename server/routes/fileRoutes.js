const express = require('express');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:filename', protect, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const fileUrl = `/uploads/${filename}`;
    const user = req.user;
    let allowed = user.role === 'admin';

    const avatarOwner = await User.findOne({ avatar: fileUrl }).select('_id');
    if (avatarOwner) allowed ||= avatarOwner._id.toString() === user._id.toString();

    const course = await Course.findOne({ 'materials.fileUrl': fileUrl }).select('teacher');
    if (course) {
      allowed ||= user.role === 'teacher' && course.teacher.toString() === user._id.toString();
      if (user.role === 'student') allowed ||= !!(await Enrollment.exists({ course: course._id, student: user._id }));
    }

    const assignment = await Assignment.findOne({ attachmentUrl: fileUrl }).select('course teacher');
    if (assignment) {
      allowed ||= user.role === 'teacher' && assignment.teacher.toString() === user._id.toString();
      if (user.role === 'student') allowed ||= !!(await Enrollment.exists({ course: assignment.course, student: user._id }));
    }

    const submission = await Submission.findOne({ fileUrl }).select('student assignment');
    if (submission) {
      allowed ||= submission.student.toString() === user._id.toString();
      if (user.role === 'teacher') {
        const submittedAssignment = await Assignment.findById(submission.assignment).select('teacher');
        allowed ||= !!submittedAssignment && submittedAssignment.teacher.toString() === user._id.toString();
      }
    }

    if (!allowed) return res.status(403).json({ message: 'Bạn không có quyền tải tệp này' });
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Không tìm thấy tệp' });
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

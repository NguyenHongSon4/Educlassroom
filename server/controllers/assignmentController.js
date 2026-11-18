const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');

const canAccessCourse = async (courseId, user) => {
  const course = await Course.findById(courseId).select('teacher');
  if (!course) return { course: null, allowed: false };
  if (user.role === 'admin' || (user.role === 'teacher' && course.teacher.toString() === user._id.toString())) {
    return { course, allowed: true };
  }
  if (user.role !== 'student') return { course, allowed: false };
  const enrollment = await Enrollment.exists({ course: courseId, student: user._id });
  return { course, allowed: !!enrollment };
};

// @desc    Get assignments for a course
// @route   GET /api/courses/:courseId/assignments
// @access  Private (Enrolled students, Teacher, Admin)
const getAssignmentsByCourse = async (req, res) => {
  try {
    const { allowed } = await canAccessCourse(req.params.courseId, req.user);
    if (!allowed) return res.status(403).json({ message: 'Bạn cần ghi danh khóa học để xem bài tập' });
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('teacher', 'name email')
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title teacher')
      .populate('teacher', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const { allowed } = await canAccessCourse(assignment.course._id || assignment.course, req.user);
    if (!allowed) return res.status(403).json({ message: 'Bạn cần ghi danh khóa học để xem bài tập' });

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create assignment for a course (Teacher / Admin)
// @route   POST /api/courses/:courseId/assignments
// @access  Private (Course Teacher or Admin)
const createAssignment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền tạo bài tập cho khóa học này' });
    }

    const { title, description, dueDate, maxScore } = req.body;
    let attachmentUrl = '';

    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const assignment = await Assignment.create({
      course: course._id,
      teacher: req.user._id,
      title,
      description,
      dueDate,
      maxScore: maxScore || 10,
      attachmentUrl,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assignment (Teacher / Admin)
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher, Admin)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    if (
      assignment.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền xóa bài tập này' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignment: req.params.id });

    res.json({ message: 'Đã xóa bài tập thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignmentsByCourse,
  getAssignmentById,
  createAssignment,
  deleteAssignment,
};

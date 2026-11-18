const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');

// @desc    Submit or update assignment solution (Student)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const enrolled = await Enrollment.exists({ course: assignment.course, student: req.user._id });
    if (!enrolled) return res.status(403).json({ message: 'Bạn cần ghi danh khóa học để nộp bài' });

    const { submissionText } = req.body;
    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    // Check if student has already submitted
    let submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });

    if (submission) {
      // If already graded, prevent overwrite unless teacher allows, or update
      submission.submissionText = submissionText || submission.submissionText;
      if (fileUrl) {
        submission.fileUrl = fileUrl;
        submission.fileName = fileName;
      }
      submission.submittedAt = Date.now();
      await submission.save();

      return res.json({
        message: 'Cập nhật bài nộp thành công',
        submission,
      });
    }

    submission = await Submission.create({
      assignment: assignment._id,
      course: assignment.course,
      student: req.user._id,
      submissionText: submissionText || '',
      fileUrl,
      fileName,
    });

    res.status(201).json({
      message: 'Nộp bài tập thành công',
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current student's submission for an assignment
// @route   GET /api/assignments/:id/my-submission
// @access  Private (Student)
const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    }).populate('student', 'name email');

    res.json(submission || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions for an assignment (Teacher / Admin)
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher, Admin)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    if (
      assignment.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền truy cập danh sách nộp bài' });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade a student's submission (Teacher / Admin)
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher, Admin)
const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;

    const submission = await Submission.findById(req.params.id).populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Không tìm thấy bài nộp' });
    }

    if (
      submission.assignment.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền chấm điểm bài tập này' });
    }

    if (score < 0 || score > submission.assignment.maxScore) {
      return res.status(400).json({
        message: `Điểm số phải từ 0 đến ${submission.assignment.maxScore}`,
      });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';

    await submission.save();

    res.json({ message: 'Đã chấm điểm thành công', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student all grades across all courses
// @route   GET /api/submissions/my-grades
// @access  Private (Student)
const getMyGrades = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title maxScore dueDate')
      .populate('course', 'title code')
      .sort({ updatedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  getMyGrades,
};

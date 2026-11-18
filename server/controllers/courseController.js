const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Category = require('../models/Category');

// @desc    Get all courses (Public / Students)
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escapedSearch) {
        query.$or = [
          { title: { $regex: escapedSearch, $options: 'i' } },
          { code: { $regex: escapedSearch, $options: 'i' } },
          { category: { $regex: escapedSearch, $options: 'i' } },
        ];
      }
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 });

    let enrolledCourseIds = new Set();
    if (req.user?.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
      enrolledCourseIds = new Set(enrollments.map((item) => item.course.toString()));
    }

    res.json(courses.map((course) => ({
      ...course.toObject(),
      isEnrolled: enrolledCourseIds.has(course._id.toString()),
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher's courses
// @route   GET /api/courses/my-teaching
// @access  Private (Teacher, Admin)
const getTeacherCourses = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { teacher: req.user._id };
    const courses = await Course.find(query)
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public / Private
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'teacher',
      'name email avatar'
    );

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    // Only enrolled students and course staff can access course materials.
    let isEnrolled = false;
    let completedMaterialIds = [];
    if (req.user?.role === 'student') {
      const enrollment = await Enrollment.findOne({
        course: course._id,
        student: req.user._id,
      });
      isEnrolled = !!enrollment;
      if (enrollment) completedMaterialIds = enrollment.completedMaterials.map(String);
    }

    const isStaff = req.user && (req.user.role === 'admin' ||
      (req.user.role === 'teacher' && course.teacher._id.toString() === req.user._id.toString()));
    const courseData = course.toObject();
    if (!isEnrolled && !isStaff) courseData.materials = [];
    res.json({ ...courseData, isEnrolled, completedMaterialIds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Teacher, Admin)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, code, status } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: 'Vui lòng nhập tên và mô tả khóa học' });
    }

    const course = await Course.create({
      title,
      description,
      category: category || 'Chung',
      code,
      status: status || 'open',
      teacher: req.user._id,
      materials: [],
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Course Teacher or Admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    // Check ownership or admin
    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa khóa học này' });
    }

    const { title, description, category, status } = req.body;

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.status = status || course.status;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Course Teacher or Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa khóa học này' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({ message: 'Đã xóa khóa học thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add material to course (Teacher / Admin)
// @route   POST /api/courses/:id/materials
// @access  Private (Course Teacher or Admin)
const addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm tài liệu' });
    }

    const { title, type, content } = req.body;
    let fileUrl = '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const newMaterial = {
      title,
      type: type || 'reading',
      content: content || '',
      fileUrl,
    };

    course.materials.push(newMaterial);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete material from course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private (Course Teacher or Admin)
const updateMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa tài liệu này' });
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

    const { title, type, content } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Tiêu đề tài liệu là bắt buộc' });
    if (!['pdf', 'video', 'reading'].includes(type)) {
      return res.status(400).json({ message: 'Loại tài liệu không hợp lệ' });
    }

    material.title = title.trim();
    material.type = type;
    material.content = content || '';
    if (req.file) material.fileUrl = `/uploads/${req.file.filename}`;

    await course.save();
    res.json({ message: 'Cập nhật tài liệu thành công', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tài liệu' });
    }

    const removedMaterial = course.materials.find((m) => m._id.toString() === req.params.materialId);
    course.materials = course.materials.filter(
      (m) => m._id.toString() !== req.params.materialId
    );
    await course.save();
    if (removedMaterial) {
      await Enrollment.updateMany(
        { course: course._id },
        { $pull: { completedMaterials: removedMaterial._id } }
      );
    }

    res.json({ message: 'Đã xóa tài liệu', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in a course (Student)
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (course.status !== 'open') {
      return res.status(400).json({ message: 'Khóa học hiện đang đóng đăng ký' });
    }

    const existingEnrollment = await Enrollment.findOne({
      course: course._id,
      student: req.user._id,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
    }

    const enrollment = await Enrollment.create({
      course: course._id,
      student: req.user._id,
    });

    res.status(201).json({ message: 'Ghi danh khóa học thành công', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrolled courses for current student
// @route   GET /api/courses/my-enrolled
// @access  Private (Student)
const getMyEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    const courses = enrollments
      .filter((e) => e.course != null)
      .map((e) => ({
        ...e.course.toObject(),
        enrolledAt: e.enrolledAt,
        completedMaterialIds: e.completedMaterials.map(String),
        progress: e.course.materials.length
          ? Math.round((e.completedMaterials.length / e.course.materials.length) * 100)
          : 0,
      }));

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle completion state for one course material
const toggleMaterialProgress = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select('materials');
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    if (!course.materials.some((item) => item._id.toString() === req.params.materialId)) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }

    const enrollment = await Enrollment.findOne({ course: course._id, student: req.user._id });
    if (!enrollment) return res.status(403).json({ message: 'Bạn cần ghi danh để cập nhật tiến độ' });

    const materialId = req.params.materialId;
    const isCompleted = enrollment.completedMaterials.some((id) => id.toString() === materialId);
    if (isCompleted) enrollment.completedMaterials = enrollment.completedMaterials.filter((id) => id.toString() !== materialId);
    else enrollment.completedMaterials.push(materialId);
    await enrollment.save();

    res.json({ completedMaterialIds: enrollment.completedMaterials.map(String), isCompleted: !isCompleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students enrolled in a course (Teacher / Admin)
// @route   GET /api/courses/:id/students
// @access  Private (Course Teacher or Admin)
const getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const enrollments = await Enrollment.find({ course: course._id })
      .populate('student', 'name email createdAt')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Category management (Admin) ---
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    }
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    const previousName = existing.name;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), description: description || '' },
      { new: true, runValidators: true }
    );
    await Course.updateMany({ category: previousName }, { $set: { category: category.name } });
    res.json(category);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? 'Tên danh mục đã tồn tại' : error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCourses,
  getTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  enrollCourse,
  getMyEnrolledCourses,
  toggleMaterialProgress,
  getEnrolledStudents,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

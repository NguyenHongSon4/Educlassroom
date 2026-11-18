const express = require('express');
const router = express.Router();
const {
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
  getEnrolledStudents,
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  toggleMaterialProgress,
} = require('../controllers/courseController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Categories
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Public / general
router.get('/', optionalProtect, getAllCourses);

// Student personal enrolled
router.get('/my-enrolled', protect, authorize('student'), getMyEnrolledCourses);

// Teacher courses
router.get('/my-teaching', protect, authorize('teacher', 'admin'), getTeacherCourses);

// Single course
router.get('/:id', optionalProtect, getCourseById);

// Teacher CRUD
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

// Materials
router.post(
  '/:id/materials',
  protect,
  authorize('teacher', 'admin'),
  upload.single('file'),
  addMaterial
);
router.put(
  '/:id/materials/:materialId',
  protect,
  authorize('teacher', 'admin'),
  upload.single('file'),
  updateMaterial
);
router.delete(
  '/:id/materials/:materialId',
  protect,
  authorize('teacher', 'admin'),
  deleteMaterial
);

// Enrollment
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.put('/:id/materials/:materialId/progress', protect, authorize('student'), toggleMaterialProgress);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getEnrolledStudents);

module.exports = router;

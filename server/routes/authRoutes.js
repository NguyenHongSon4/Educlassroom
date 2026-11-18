const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const avatarUpload = require('../middleware/avatarUploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
const parseAvatar = (req, res, next) => avatarUpload.single('avatar')(req, res, (error) => {
  if (error) return res.status(400).json({ message: error.message });
  next();
});
router.put('/me', protect, parseAvatar, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

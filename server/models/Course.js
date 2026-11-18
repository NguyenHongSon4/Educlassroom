const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề tài liệu là bắt buộc'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'reading'],
      required: true,
      default: 'reading',
    },
    content: {
      type: String, // Nội dung bài đọc hoặc URL video
      default: '',
    },
    fileUrl: {
      type: String, // Đường dẫn file upload (PDF hoặc tài liệu đính kèm)
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên khóa học là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả khóa học là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Chung',
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    materials: [materialSchema],
  },
  {
    timestamps: true,
  }
);

// Auto-generate course code if not provided
courseSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = 'CRS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);

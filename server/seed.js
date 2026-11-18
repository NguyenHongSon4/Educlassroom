const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const Enrollment = require('./models/Enrollment');
const Submission = require('./models/Submission');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_classroom'
    );
    console.log('MongoDB Connected for Seeding...');

    // Clear old data
    await User.deleteMany();
    await Category.deleteMany();
    await Course.deleteMany();
    await Assignment.deleteMany();
    await Enrollment.deleteMany();
    await Submission.deleteMany();
    console.log('Cleared existing collections...');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Quản trị viên Hệ thống',
      email: 'admin@classroom.edu.vn',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    const teacherUser = await User.create({
      name: 'ThS. Nguyễn Văn Giảng',
      email: 'teacher@classroom.edu.vn',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });

    const studentUser = await User.create({
      name: 'Nguyễn Ngọc Mai',
      email: 'student@classroom.edu.vn',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    const studentUser2 = await User.create({
      name: 'Trần Minh Tuấn',
      email: 'tuan@classroom.edu.vn',
      password: 'student123',
      role: 'student',
      isActive: false, // Locked for admin test
    });

    console.log('Sample users created:');
    console.log('- Admin: admin@classroom.edu.vn / admin123');
    console.log('- Teacher: teacher@classroom.edu.vn / teacher123');
    console.log('- Student: student@classroom.edu.vn / student123');
    console.log('- Locked Student: tuan@classroom.edu.vn / student123');

    // 2. Create Categories
    const categories = await Category.insertMany([
      { name: 'Công nghệ thông tin', description: 'Lập trình web, cơ sở dữ liệu, di động' },
      { name: 'Kinh tế & Quản trị', description: 'Marketing, tài chính, quản trị kinh doanh' },
      { name: 'Ngoại ngữ', description: 'Tiếng Anh giao tiếp, TOEIC, IELTS' },
      { name: 'Kỹ năng mềm', description: 'Giao tiếp, thuyết trình, làm việc nhóm' },
    ]);

    // 3. Create Sample Courses
    const course1 = await Course.create({
      title: 'Lập trình Web nâng cao với MERN Stack',
      code: 'MERN101',
      description: 'Học cách xây dựng ứng dụng Fullstack từ cơ bản đến nâng cao sử dụng MongoDB, Express.js, React.js và Node.js.',
      category: 'Công nghệ thông tin',
      teacher: teacherUser._id,
      status: 'open',
      materials: [
        {
          title: 'Bài 1: Giới thiệu kiến trúc RESTful API với Express.js',
          type: 'reading',
          content: 'Kiến trúc RESTful API là chuẩn giao tiếp phổ biến giữa máy khách (Client) và máy chủ (Server). Chúng ta sử dụng HTTP methods như GET, POST, PUT, DELETE.',
        },
        {
          title: 'Bài 2: Hướng dẫn kết nối MongoDB qua Mongoose ODM',
          type: 'video',
          content: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
        },
        {
          title: 'Bài 3: Tài liệu tổng quan React Functional Components & Hooks',
          type: 'reading',
          content: 'Nắm vững useState, useEffect và useContext để xây dựng giao diện người dùng tương tác cao và quản lý trạng thái tập trung.',
        },
      ],
    });

    const course2 = await Course.create({
      title: 'Thiết kế Cơ sở Dữ liệu Quan hệ & NoSQL',
      code: 'DB202',
      description: 'Khóa học cung cấp kiến thức nền tảng về thiết kế lược đồ quan hệ và phi quan hệ trong các hệ thống hiện đại.',
      category: 'Công nghệ thông tin',
      teacher: teacherUser._id,
      status: 'open',
      materials: [
        {
          title: 'Bài 1: So sánh SQL và NoSQL trong thực tế',
          type: 'reading',
          content: 'SQL mạnh về tính toàn vẹn dữ liệu (ACID), trong khi NoSQL (như MongoDB) linh hoạt trong việc lưu trữ tài liệu phân cấp JSON/BSON.',
        },
      ],
    });

    // 4. Enroll Student in Course 1
    await Enrollment.create({
      course: course1._id,
      student: studentUser._id,
    });

    // 5. Create Assignment in Course 1
    const assignment1 = await Assignment.create({
      course: course1._id,
      teacher: teacherUser._id,
      title: 'Bài tập 1: Xây dựng RESTful API Xác thực JWT',
      description: 'Viết API đăng ký, đăng nhập và bảo vệ route profile bằng Bearer Token. Sinh viên nộp mã nguồn và link GitHub.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      maxScore: 10,
    });

    // 6. Student Submits Assignment 1
    await Submission.create({
      assignment: assignment1._id,
      course: course1._id,
      student: studentUser._id,
      submissionText: 'Em xin nộp bài tập số 1. Em đã hoàn thiện các API Auth, phân quyền 3 roles và test thành công trên Postman.',
      score: 9.5,
      feedback: 'Làm rất tốt, cấu trúc code rõ ràng, tuân thủ mô hình MVC!',
      status: 'graded',
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

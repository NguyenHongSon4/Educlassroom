# 🎓 HỆ THỐNG LỚP HỌC TRỰC TUYẾN (ONLINE CLASSROOM) - MERN STACK

<div align="center">

![MERN Stack](https://img.shields.io/badge/Stack-MERN-10b981?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)
![React.js](https://img.shields.io/badge/React.js-Vite%20SPA-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT Auth](https://img.shields.io/badge/Auth-JWT%20%26%20RBAC-red?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

> **ĐỀ TIỂU LUẬN CUỐI KỲ - MÔN HỌC LẬP TRÌNH WEB**  
> 👤 **Sinh viên thực hiện:** Nguyễn Ngọc Mai  
> 🆔 **Mã số sinh viên (MSSV):** 1822040747  
> 🏫 **Khoa / Ngành:** Công nghệ Thông tin - Trường Đại học Công nghệ Đồng Nai  
> 📄 **Tài liệu đề bài:** Xem chi tiết tại [DE_TIEU_LUAN_CUOI_KY.md](file:///c:/Users/MTBH/Desktop/online-classroom/DE_TIEU_LUAN_CUOI_KY.md)  
> 📑 **Báo cáo toàn văn (PDF/Markdown):** Xem tại [docs/BAO_CAO_TIEU_LUAN_ONLINE_CLASSROOM.md](file:///c:/Users/MTBH/Desktop/online-classroom/docs/BAO_CAO_TIEU_LUAN_ONLINE_CLASSROOM.md)

---

</div>

## 1. Giới thiệu dự án
Hệ thống **Online Classroom** là một ứng dụng web Fullstack hiện đại xây dựng trên kiến trúc **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Hệ thống cung cấp nền tảng số toàn diện hỗ trợ quá trình giảng dạy và học tập trực tuyến:
- **Quản trị viên (Admin):** Quản lý người dùng toàn hệ thống (Khóa / Mở khóa tài khoản), quản lý danh mục môn học, thống kê hệ thống.
- **Giảng viên (Teacher):** CRUD khóa học/lớp học, đăng tải tài liệu học tập (PDF, Video, Bài đọc), tạo bài tập, theo dõi danh sách sinh viên ghi danh và chấm điểm bài tập kèm nhận xét.
- **Sinh viên (Student):** Khám phá và ghi danh khóa học, xem bài giảng và tải tài liệu học tập, nộp bài tập (văn bản & đính kèm tệp) và theo dõi bảng điểm cá nhân.

---

## 2. Công nghệ sử dụng
- **Database:** MongoDB & Mongoose ODM
- **Backend:** Node.js, Express.js, JWT (JSON Web Token), Bcrypt.js, Multer (xử lý upload file)
- **Frontend:** React.js 19, Vite, React Router DOM, Axios, Lucide React Icons
- **Kiến trúc:** RESTful API, mô hình MVC (Model - View - Controller), Error Handling tập trung.

---

## 3. Cấu trúc thư mục dự án

```text
online-classroom/
├── server/                    # Backend API (Node.js & Express.js)
│   ├── config/                # Cấu hình kết nối CSDL (MongoDB)
│   │   └── db.js
│   ├── controllers/           # Tầng điều khiển nghiệp vụ (Business Logic)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── courseController.js
│   │   ├── assignmentController.js
│   │   └── submissionController.js
│   ├── middleware/            # Xác thực JWT & Phân quyền, Upload file
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/                # Lược đồ dữ liệu Mongoose Schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Enrollment.js
│   │   └── Category.js
│   ├── routes/                # Định tuyến RESTful API endpoints
│   ├── uploads/               # Thư mục lưu trữ file tài liệu & bài nộp
│   ├── .env.example           # File mẫu biến môi trường
│   ├── package.json
│   ├── seed.js                # Dữ liệu mẫu khởi tạo tự động
│   └── server.js              # Điểm khởi chạy Backend
├── client/                    # Frontend UI (React.js + Vite)
│   ├── src/
│   │   ├── components/        # Navbar, ProtectedRoute, v.v.
│   │   ├── context/           # AuthContext (quản lý state đăng nhập)
│   │   ├── pages/             # Giao diện các trang chức năng
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── AssignmentDetail.jsx
│   │   │   ├── TeacherCourses.jsx
│   │   │   ├── EnrolledCourses.jsx
│   │   │   ├── StudentGrades.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── AdminCategories.jsx
│   │   ├── services/          # Cấu hình Axios API Client
│   │   ├── App.jsx
│   │   └── index.css          # Giao diện responsive
│   ├── index.html
│   └── package.json
├── docs/                      # Tài liệu báo cáo & API doc
│   └── BAO_CAO_TIEU_LUAN_ONLINE_CLASSROOM.md
├── .gitignore                 # Loại trừ node_modules và .env
└── README.md
```

---

## 4. Hướng dẫn cài đặt và khởi chạy cục bộ (Local Setup)

### Yêu cầu tiên quyết:
- Đã cài đặt **Node.js** (khuyến nghị phiên bản >= 18.x hoặc 20.x).
- Đã cài đặt hoặc đang chạy dịch vụ **MongoDB** (Local `mongodb://127.0.0.1:27017` hoặc MongoDB Atlas).

### Bước 1: Khởi động Backend (Server)
```bash
# Di chuyển vào thư mục server
cd online-classroom/server

# Cài đặt các thư viện phụ thuộc
npm install

# Khởi tạo dữ liệu mẫu (Users, Courses, Assignments demo)
npm run seed

# Khởi chạy server ở chế độ phát triển
npm run dev
# Máy chủ backend sẽ chạy tại: http://localhost:5000
```

### Bước 2: Khởi động Frontend (Client)
Mở một cửa sổ Terminal mới:
```bash
# Di chuyển vào thư mục client
cd online-classroom/client

# Cài đặt các thư viện giao diện
npm install

# Khởi chạy giao diện React với Vite
npm run dev
# Giao diện người dùng sẽ chạy tại: http://localhost:5173
```

---

## 5. Tài khoản thử nghiệm có sẵn (Demo Accounts)

Hệ thống đã tích hợp sẵn tính năng **1-Click Quick Fill** tại trang Đăng nhập hoặc bạn có thể nhập thủ công:

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@classroom.edu.vn` | `admin123` | Xem thống kê toàn hệ thống, Khóa/Mở khóa User, Quản trị Danh mục môn học |
| **Giảng viên (Teacher)** | `teacher@classroom.edu.vn` | `teacher123` | Tạo khóa học, đăng tài liệu (PDF/Video/Đọc), tạo bài tập, xem sinh viên ghi danh, chấm điểm |
| **Sinh viên (Student)** | `student@classroom.edu.vn` | `student123` | Ghi danh khóa học, xem bài giảng, tải file tài liệu, nộp bài làm, xem bảng điểm |
| **Tài khoản bị khóa** | `tuan@classroom.edu.vn` | `student123` | Kiểm tra tính năng chặn truy cập khi bị Admin khóa |

---

## 6. Danh sách API Endpoints chính

### 1. Xác thực (Authentication)
- `POST /api/auth/register` : Đăng ký tài khoản mới (Student / Teacher)
- `POST /api/auth/login` : Đăng nhập nhận JWT Token
- `GET /api/auth/me` : Lấy thông tin tài khoản hiện tại (Bearer Token)

### 2. Quản lý người dùng (Admin)
- `GET /api/users` : Lấy danh sách toàn bộ người dùng
- `GET /api/users/stats` : Lấy số liệu thống kê tổng quan
- `PUT /api/users/:id/toggle-status` : Khóa / Mở khóa tài khoản người dùng
- `PUT /api/users/:id/role` : Thay đổi vai trò người dùng

### 3. Khóa học (Courses)
- `GET /api/courses` : Danh sách khóa học đang mở (hỗ trợ lọc theo danh mục & tìm kiếm)
- `GET /api/courses/:id` : Chi tiết khóa học và nội dung tài liệu
- `POST /api/courses` : Tạo khóa học mới (Teacher/Admin)
- `PUT /api/courses/:id` : Sửa khóa học (Teacher/Admin)
- `DELETE /api/courses/:id` : Xóa khóa học (Teacher/Admin)
- `POST /api/courses/:id/enroll` : Sinh viên ghi danh vào khóa học
- `GET /api/courses/my-enrolled` : Danh sách lớp học sinh viên đã ghi danh
- `GET /api/courses/my-teaching` : Danh sách lớp do giảng viên phụ trách
- `POST /api/courses/:id/materials` : Đăng tài liệu mới (PDF/Video/Đọc)
- `DELETE /api/courses/:id/materials/:matId` : Xóa tài liệu

### 4. Bài tập & Chấm điểm (Assignments & Submissions)
- `GET /api/assignments/course/:courseId` : Danh sách bài tập của môn học
- `POST /api/assignments/course/:courseId` : Giảng viên tạo bài tập mới
- `GET /api/assignments/:id` : Chi tiết bài tập
- `POST /api/assignments/:id/submit` : Sinh viên nộp bài tập (kèm file)
- `GET /api/assignments/:id/my-submission` : Sinh viên xem bài làm & điểm của mình
- `GET /api/assignments/:id/submissions` : Giảng viên xem danh sách bài nộp của lớp
- `PUT /api/submissions/:id/grade` : Giảng viên chấm điểm & nhập nhận xét
- `GET /api/submissions/my-grades` : Bảng điểm tổng hợp của sinh viên

---

## 7. Lưu ý khi đẩy mã nguồn lên GitHub
- File `.gitignore` đã được cấu hình chặt chẽ để **loại trừ** thư mục `node_modules` và file chứa bí mật `.env`.
- Người khác khi clone dự án chỉ cần sao chép file `.env.example` thành `.env` và chạy `npm install`.

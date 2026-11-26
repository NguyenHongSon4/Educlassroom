# Online Classroom

Ứng dụng quản lý lớp học trực tuyến xây dựng theo kiến trúc MERN: MongoDB, Express, React và Node.js. Hệ thống có ba vai trò **quản trị viên**, **giảng viên** và **sinh viên**, với giao diện tiếng Việt.

## Chức năng

- **Tài khoản:** đăng ký, đăng nhập bằng JWT, phân quyền theo vai trò; cập nhật hồ sơ, ảnh đại diện và đổi mật khẩu.
- **Khóa học:** duyệt, tìm kiếm và lọc theo danh mục; giảng viên/quản trị viên tạo, sửa, xóa khóa học và quản lý tài liệu dạng PDF, video hoặc bài đọc.
- **Ghi danh và học tập:** sinh viên ghi danh, xem tài liệu, đánh dấu hoàn thành để theo dõi tiến độ và xem các khóa đã tham gia.
- **Bài tập:** giảng viên tạo bài tập, đính kèm tệp và xem bài nộp; sinh viên nộp nội dung và tệp; giảng viên chấm điểm, nhận xét; sinh viên xem bảng điểm.
- **Quản trị:** quản lý tài khoản và trạng thái hoạt động, phân quyền, xem thống kê, quản lý danh mục và theo dõi ghi danh.
- **Tệp riêng tư:** tệp tải lên được phân phối qua API có xác thực và kiểm tra quyền truy cập theo chủ sở hữu, khóa học hoặc bài tập.

## Công nghệ

- **Giao diện:** React 19, Vite, React Router, Axios, Lucide React.
- **Máy chủ:** Node.js, Express 4, Mongoose, JWT, bcryptjs, Multer.
- **Cơ sở dữ liệu:** MongoDB.

## Yêu cầu

- Node.js và npm (dùng bản Node.js tương thích với Vite hiện tại).
- MongoDB chạy cục bộ hoặc MongoDB Atlas.

## Cài đặt và chạy

1. Clone dự án và cài thư viện cho cả máy chủ lẫn giao diện:

   ```bash
   git clone <URL_REPOSITORY>
   cd Educlassroom
   npm run install:all
   ```

   Hoặc cài riêng bằng `npm install` trong thư mục `server` và `client`.

2. Tạo `server/.env` từ `server/.env.example`, sau đó cập nhật cấu hình MongoDB và khóa JWT:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/online_classroom
   JWT_SECRET=thay_bang_chuoi_bi_mat_ngau_nhien
   CLIENT_URL=http://localhost:5173
   ```

   `CLIENT_URL` được giữ trong cấu hình mẫu; máy chủ hiện bật CORS mặc định. Không dùng khóa JWT mẫu trong môi trường triển khai.

3. Khởi tạo dữ liệu mẫu nếu cần:

   ```bash
   npm run seed
   ```

   **Lưu ý:** lệnh seed xóa dữ liệu hiện có trong các collection người dùng, danh mục, khóa học, bài tập, ghi danh và bài nộp trước khi tạo dữ liệu mẫu. Chỉ chạy trên cơ sở dữ liệu dùng để phát triển/thử nghiệm.

4. Chạy máy chủ và giao diện trong hai cửa sổ terminal riêng:

   ```bash
   npm run server
   ```

   ```bash
   npm run client
   ```

   Mặc định API chạy tại `http://localhost:5000`, giao diện Vite tại `http://localhost:5173`. Có thể chạy trực tiếp bằng `npm run dev` trong `server` hoặc `client`.

## Tài khoản mẫu

Các tài khoản sau được tạo bởi `npm run seed`:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin@classroom.edu.vn` | `admin123` |
| Giảng viên | `teacher@classroom.edu.vn` | `teacher123` |
| Sinh viên | `student@classroom.edu.vn` | `student123` |
| Sinh viên bị khóa (dùng thử quản trị) | `tuan@classroom.edu.vn` | `student123` |

Đăng ký công khai không cấp vai trò quản trị viên; tài khoản mới mặc định là sinh viên (hoặc vai trò sinh viên/giảng viên được chọn trong biểu mẫu).

## Scripts

Ở thư mục gốc:

| Lệnh | Tác dụng |
| --- | --- |
| `npm run install:all` | Cài dependencies trong `server` và `client` |
| `npm run server` | Chạy API ở chế độ phát triển bằng nodemon |
| `npm run client` | Chạy Vite dev server |
| `npm run seed` | Xóa và tạo lại dữ liệu mẫu |

Trong `client`: `npm run build` để tạo bản dựng, `npm run preview` để xem bản dựng, `npm run lint` để chạy oxlint. Trong `server`, `npm start` chạy máy chủ không dùng nodemon.

## API

API có tiền tố `/api`. Các endpoint cần đăng nhập nhận header `Authorization: Bearer <token>`; quyền truy cập phụ thuộc vai trò và quyền sở hữu khóa học/bài tập.

| Nhóm | Endpoint chính |
| --- | --- |
| Kiểm tra máy chủ | `GET /api/health` |
| Xác thực và hồ sơ | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me`, `PUT /api/auth/change-password` |
| Người dùng/quản trị | `GET /api/users`, `GET /api/users/stats`, `GET /api/users/enrollments`, `PUT /api/users/:id/toggle-status`, `PUT /api/users/:id/role` |
| Khóa học/danh mục | `GET /api/courses`, `GET /api/courses/:id`, `POST/PUT/DELETE /api/courses/:id`, `GET /api/courses/categories`, `POST/PUT/DELETE /api/courses/categories/:id` |
| Ghi danh/tài liệu | `POST /api/courses/:id/enroll`, `GET /api/courses/my-enrolled`, `GET /api/courses/my-teaching`, `GET /api/courses/:id/students`, các endpoint `/api/courses/:id/materials` và `/api/courses/:id/materials/:materialId/progress` |
| Bài tập/bài nộp | `GET /api/assignments/course/:courseId`, `POST /api/assignments/course/:courseId`, `GET/DELETE /api/assignments/:id`, `POST /api/assignments/:id/submit`, `GET /api/assignments/:id/my-submission`, `GET /api/assignments/:id/submissions` |
| Chấm điểm/tệp | `PUT /api/submissions/:id/grade`, `GET /api/submissions/my-grades`, `GET /api/files/:filename` |

Endpoint tạo/cập nhật tài liệu, bài tập, bài nộp và ảnh đại diện sử dụng `multipart/form-data` khi có tải tệp. Tệp được lưu trong `server/uploads`.

## Cấu trúc dự án

```text
.
├── client/                 # Ứng dụng React/Vite
│   └── src/
│       ├── components/     # Navbar, Footer, ProtectedRoute
│       ├── context/        # Trạng thái xác thực
│       ├── pages/          # Các trang học viên, giảng viên, quản trị
│       └── services/       # Cấu hình Axios/API
├── server/                 # REST API Express
│   ├── config/             # Kết nối MongoDB
│   ├── controllers/        # Nghiệp vụ
│   ├── middleware/         # Xác thực, phân quyền, tải tệp
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── uploads/            # Tệp tải lên
│   ├── .env.example
│   └── seed.js             # Dữ liệu thử nghiệm
└── docs/                   # Đề bài và báo cáo dự án
```

Tài liệu dự án: [Đề tiểu luận](docs/DE_TIEU_LUAN_CUOI_KY_MON_LAP_TRINH_WEB.md) · [Báo cáo](docs/BAO_CAO_TIEU_LUAN_ONLINE_CLASSROOM.md).

## Triển khai

Không đưa `server/.env`, thông tin xác thực hoặc dữ liệu thử nghiệm lên kho mã nguồn. Trước khi triển khai, đặt `MONGODB_URI`, `JWT_SECRET`, `PORT` theo môi trường máy chủ, xây dựng giao diện bằng `npm run build` trong `client` và cấu hình máy chủ web để phục vụ thư mục `client/dist` cùng API phù hợp với kiến trúc triển khai.

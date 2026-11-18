import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

const Footer = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo">
              <GraduationCap size={27} />
              <span>EduClassroom</span>
            </Link>
            <p>Không gian học tập trực tuyến để giảng viên chia sẻ kiến thức và sinh viên tiến bộ mỗi ngày.</p>
            <span className="site-footer-brand-note"><BookOpen size={15} /> Học tập linh hoạt, kết nối dễ dàng</span>
          </div>

          <div className="site-footer-column">
            <h2>{isAdmin ? 'Quản trị' : isTeacher ? 'Giảng dạy' : 'Khám phá'}</h2>
            <Link to="/courses">Tất cả khóa học <ArrowRight size={14} /></Link>
            {isStudent && <Link to="/my-enrolled">Lớp đã tham gia <ArrowRight size={14} /></Link>}
            {isStudent && <Link to="/my-grades">Bảng điểm <ArrowRight size={14} /></Link>}
            {isTeacher && !isAdmin && <Link to="/teacher/courses">Quản lý lớp dạy <ArrowRight size={14} /></Link>}
            {isAdmin && <Link to="/teacher/courses">Quản lý khóa học <ArrowRight size={14} /></Link>}
            {isAdmin && <Link to="/admin/users">Quản lý người dùng <ArrowRight size={14} /></Link>}
            {isAdmin && <Link to="/admin/enrollments">Lượt ghi danh <ArrowRight size={14} /></Link>}
            {isAdmin && <Link to="/admin/categories">Danh mục khóa học <ArrowRight size={14} /></Link>}
          </div>

          <div className="site-footer-column">
            <h2>{user ? 'Tài khoản' : 'Bắt đầu'}</h2>
            {user ? (
              <>
                <Link to="/dashboard">Tổng quan <ArrowRight size={14} /></Link>
                <Link to="/profile">Hồ sơ cá nhân <ArrowRight size={14} /></Link>
              </>
            ) : (
              <>
                <Link to="/login">Đăng nhập <ArrowRight size={14} /></Link>
                <Link to="/register">Tạo tài khoản <ArrowRight size={14} /></Link>
              </>
            )}
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {year} EduClassroom</span>
          <span>Nền tảng học tập trực tuyến</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

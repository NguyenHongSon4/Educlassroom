import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  FolderKanban,
  Users,
  LogOut,
  Award,
  Layers,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <GraduationCap size={28} />
          <span>EduClassroom</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Tổng quan</span>
              </NavLink>

              <NavLink
                to="/courses"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <BookOpen size={18} />
                <span>Khóa học</span>
              </NavLink>

              {/* Student specific links */}
              {isStudent && (
                <>
                  <NavLink
                    to="/my-enrolled"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <FolderKanban size={18} />
                    <span>Lớp đã tham gia</span>
                  </NavLink>
                  <NavLink
                    to="/my-grades"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Award size={18} />
                    <span>Điểm số</span>
                  </NavLink>
                </>
              )}

              {/* Teacher links */}
              {user.role === 'teacher' && (
                <NavLink
                  to="/teacher/courses"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <FolderKanban size={18} />
                  <span>Quản lý lớp dạy</span>
                </NavLink>
              )}

              {/* Admin links */}
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Users size={18} />
                    <span>Quản lý User</span>
                  </NavLink>
                  <NavLink
                    to="/admin/categories"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Layers size={18} />
                    <span>Danh mục</span>
                  </NavLink>
                </>
              )}

              <div className="user-badge">
                <div style={{ textAlign: 'right' }}>
                  <Link to="/profile" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'inherit' }} title="Hồ sơ cá nhân">{user.name}</Link>
                  <span className={`badge badge-${user.role}`}>
                    {user.role === 'admin'
                      ? 'Admin'
                      : user.role === 'teacher'
                      ? 'Giảng viên'
                      : 'Sinh viên'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-outline">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

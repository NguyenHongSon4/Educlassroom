import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, GraduationCap } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Đăng ký không thành công, vui lòng thử lại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tạo tài khoản mới</h2>
          <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
            Tham gia nền tảng học tập trực tuyến
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span className="flex items-center gap-2">
                <User size={16} /> Họ và tên
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: Nguyễn Ngọc Mai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="flex items-center gap-2">
                <Mail size={16} /> Địa chỉ Email
              </span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="example@classroom.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="flex items-center gap-2">
                <Lock size={16} /> Mật khẩu
              </span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="flex items-center gap-2">
                <GraduationCap size={16} /> Vai trò tham gia
              </span>
            </label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Sinh viên (Học viên)</option>
              <option value="teacher">Giảng viên (Giáo viên)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Đang tạo tài khoản...' : (
              <>
                <UserPlus size={18} /> Đăng ký tài khoản
              </>
            )}
          </button>
        </form>

        <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: '20px' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

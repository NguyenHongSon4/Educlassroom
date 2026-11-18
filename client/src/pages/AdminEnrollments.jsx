import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import API from '../services/api';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/users/enrollments')
      .then(({ data }) => setEnrollments(data))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải danh sách ghi danh'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Quản lý lượt ghi danh</h1>
        <p className="text-muted text-sm">Danh sách sinh viên và khóa học đã ghi danh trên toàn hệ thống.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="card text-muted">Đang tải lượt ghi danh...</div>
      ) : enrollments.length === 0 ? (
        <div className="card text-muted" style={{ textAlign: 'center', padding: 40 }}>
          <ClipboardList size={38} style={{ margin: '0 auto 12px' }} />
          <h3>Chưa có lượt ghi danh nào</h3>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', fontWeight: 600 }}>Tổng lượt ghi danh: {enrollments.length}</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Khóa học</th><th>Mã lớp</th><th>Sinh viên</th><th>Email</th><th>Giảng viên</th><th>Ngày ghi danh</th></tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id}>
                    <td><Link to={`/courses/${enrollment.course._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{enrollment.course.title}</Link></td>
                    <td>{enrollment.course.code || '—'}</td>
                    <td>{enrollment.student.name}{enrollment.student.studentId ? ` (${enrollment.student.studentId})` : ''}</td>
                    <td>{enrollment.student.email}</td>
                    <td>{enrollment.course.teacher?.name || '—'}</td>
                    <td>{new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;

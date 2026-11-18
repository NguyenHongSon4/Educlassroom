import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Award, BookOpen, ExternalLink } from 'lucide-react';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/submissions/my-grades');
        setGrades(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Bảng điểm của tôi</h1>
        <p className="text-muted text-sm">
          Tổng hợp điểm số và nhận xét từ giảng viên cho các bài tập đã nộp
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <div className="text-muted">Đang tải bảng điểm...</div>
        </div>
      ) : grades.length === 0 ? (
        <div className="card text-muted" style={{ textAlign: 'center', padding: '40px' }}>
          <Award size={40} style={{ margin: '0 auto 12px' }} />
          <h3>Chưa có bài tập nào được chấm điểm</h3>
          <p className="text-sm" style={{ marginTop: '6px' }}>
            Sau khi bạn nộp bài và giảng viên hoàn tất chấm điểm, kết quả sẽ hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Môn học</th>
                <th>Tên bài tập</th>
                <th>Ngày nộp</th>
                <th>Điểm số</th>
                <th>Nhận xét của giảng viên</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.course?.title}</div>
                    <div className="text-muted text-sm">{item.course?.code}</div>
                  </td>
                  <td>{item.assignment?.title}</td>
                  <td className="text-sm text-muted">
                    {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    {item.score !== null ? (
                      <span className="badge badge-active" style={{ fontSize: '0.85rem' }}>
                        {item.score} / {item.assignment?.maxScore || 10}
                      </span>
                    ) : (
                      <span className="badge badge-teacher">Đang chờ chấm</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-main)' }}>
                    {item.feedback || <span className="text-muted italic">Chưa có nhận xét</span>}
                  </td>
                  <td>
                    <Link
                      to={`/assignments/${item.assignment?._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink size={14} /> Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;

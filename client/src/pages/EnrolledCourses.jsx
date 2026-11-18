import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { BookOpen, User, Calendar, ArrowRight } from 'lucide-react';

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/courses/my-enrolled');
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolled();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Các lớp học đã tham gia</h1>
        <p className="text-muted text-sm">
          Theo dõi tiến độ học tập, bài học và làm bài tập được giao
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <div className="text-muted">Đang tải danh sách lớp...</div>
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-muted" style={{ textAlign: 'center', padding: '40px' }}>
          <BookOpen size={40} style={{ margin: '0 auto 12px' }} />
          <h3>Bạn chưa ghi danh vào lớp học nào</h3>
          <p className="text-sm" style={{ marginTop: '6px' }}>
            Hãy vào mục "Khóa học" để tìm kiếm và ghi danh lớp học mới.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/courses" className="btn btn-primary">
              Khám phá khóa học
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="card flex" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {course.category}
                  </span>
                  <span className="text-sm text-muted font-bold">{course.code}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '6px 0' }}>
                  {course.title}
                </h3>
                <p className="text-muted text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Tiến độ học</span>
                    <strong>{course.progress || 0}%</strong>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 8 }}>
                    <div style={{ height: '100%', width: `${course.progress || 0}%`, background: 'var(--hero-gradient)', borderRadius: 8 }} />
                  </div>
                  <span className="text-muted text-sm">{course.completedMaterialIds?.length || 0}/{course.materials?.length || 0} bài học hoàn thành</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <User size={14} /> GV: {course.teacher?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>

                <Link to={`/courses/${course._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  Vào học ngay <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;

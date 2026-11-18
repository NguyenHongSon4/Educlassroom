import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Search, CheckCircle, ArrowRight } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  const { user, isStudent } = useAuth();

  const fetchCourses = async () => {
    const requestId = ++latestRequest.current;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      if (search) {
        queryParams.append('search', search);
      }

      const { data } = await API.get(`/courses?${queryParams.toString()}`);
      if (requestId === latestRequest.current) setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/courses/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    setMessage('');
    setError('');
    try {
      await API.post(`/courses/${courseId}/enroll`);
      setMessage('Ghi danh khóa học thành công! Bạn có thể vào học ngay.');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể ghi danh vào khóa học');
    }
  };

  const visibleCourses = courses.filter((course) => {
    if (!isStudent || enrollmentFilter === 'all') return true;
    return enrollmentFilter === 'enrolled' ? course.isEnrolled : !course.isEnrolled;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Danh sách khóa học</h1>
          <p className="text-muted text-sm">
            Khám phá và đăng ký các môn học trực tuyến đang mở
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2" style={{ maxWidth: '400px', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên khóa học, mã lớp hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={18} />
          </button>
        </form>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Category Filter Pills */}
      <div className="flex gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: '6px' }}>
        <button
          className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tất cả danh mục
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`btn btn-sm ${selectedCategory === cat.name ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isStudent && (
        <div className="flex gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: 6 }}>
          {[
            { id: 'all', label: 'Tất cả khóa học' },
            { id: 'enrolled', label: 'Đã ghi danh' },
            { id: 'not-enrolled', label: 'Chưa ghi danh' },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`btn btn-sm ${enrollmentFilter === filter.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setEnrollmentFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <div className="text-muted">Đang tải danh sách khóa học...</div>
        </div>
      ) : visibleCourses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <BookOpen size={40} className="text-muted" style={{ margin: '0 auto 12px' }} />
          <h3>{courses.length === 0 ? 'Không tìm thấy khóa học nào' : 'Không có khóa học nào trong mục này'}</h3>
          <p className="text-muted text-sm" style={{ marginTop: '6px' }}>
            Vui lòng thử tìm kiếm với từ khóa khác hoặc danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {visibleCourses.map((course) => (
            <div key={course._id} className="card flex" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {course.category || 'Chung'}
                    </span>
                    {isStudent && (
                      <span className="badge" style={{ backgroundColor: course.isEnrolled ? 'var(--success-bg)' : 'var(--info-bg)', color: course.isEnrolled ? 'var(--success)' : 'var(--info)' }}>
                        {course.isEnrolled ? 'Đã ghi danh' : 'Chưa ghi danh'}
                      </span>
                    )}
                  </div>
                  <span className="text-muted text-sm font-bold" style={{ letterSpacing: '0.5px' }}>
                    {course.code}
                  </span>
                </div>

                {course.status === 'closed' && (
                  <span className="badge" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: 4 }}>Đã đóng đăng ký</span>
                )}

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', lineHeight: 1.3 }}>
                  <Link to={`/courses/${course._id}`} style={{ color: 'inherit' }}>
                    {course.title}
                  </Link>
                </h3>

                <p className="text-muted text-sm" style={{ marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4 text-sm text-muted">
                  <User size={16} />
                  <span>GV: {course.teacher?.name || 'Chưa cập nhật'}</span>
                </div>

                <div className="flex items-center justify-between" style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <Link to={`/courses/${course._id}`} className="btn btn-outline btn-sm">
                    Chi tiết <ArrowRight size={14} />
                  </Link>

                  {isStudent && course.isEnrolled && (
                    <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm">
                      <CheckCircle size={14} /> Vào khóa học
                    </Link>
                  )}
                  {isStudent && !course.isEnrolled && course.status === 'open' && (
                    <button onClick={() => handleEnroll(course._id)} className="btn btn-primary btn-sm">
                      <CheckCircle size={14} /> Ghi danh (Enroll)
                    </button>
                  )}
                  {isStudent && !course.isEnrolled && course.status !== 'open' && (
                    <button type="button" className="btn btn-outline btn-sm" disabled>Đã đóng đăng ký</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;

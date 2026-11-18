import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, BookOpen, ArrowRight, FolderKanban } from 'lucide-react';

const TeacherCourses = () => {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('open');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTeachingCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/courses/my-teaching');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/courses/categories');
      setCategories(res.data);
      if (res.data.length > 0) {
        setCategory(res.data[0].name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachingCourses();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setCode('');
    setDescription('');
    setStatus('open');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setIsEditing(true);
    setCurrentId(c._id);
    setTitle(c.title);
    setCode(c.code);
    setDescription(c.description);
    setCategory(c.category);
    setStatus(c.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (isEditing) {
        await API.put(`/courses/${currentId}`, {
          title,
          description,
          category,
          status,
        });
        setMessage('Cập nhật khóa học thành công!');
      } else {
        await API.post('/courses', {
          title,
          code,
          description,
          category,
          status,
        });
        setMessage('Tạo khóa học mới thành công!');
      }

      setShowModal(false);
      fetchTeachingCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này cùng toàn bộ tài liệu & bài tập liên quan?')) {
      return;
    }

    try {
      await API.delete(`/courses/${courseId}`);
      setMessage('Xóa khóa học thành công!');
      fetchTeachingCourses();
    } catch (err) {
      setError('Lỗi khi xóa khóa học');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{isAdmin ? 'Quản lý toàn bộ khóa học' : 'Quản lý lớp học phụ trách'}</h1>
          <p className="text-muted text-sm">
            Tạo, cập nhật khóa học, quản lý tài liệu và bài tập
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Tạo khóa học mới
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <div className="text-muted">Đang tải danh sách lớp học...</div>
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-muted" style={{ textAlign: 'center', padding: '40px' }}>
          <FolderKanban size={40} style={{ margin: '0 auto 12px' }} />
          <h3>Bạn chưa tạo khóa học nào</h3>
          <p className="text-sm" style={{ marginTop: '6px' }}>
            Nhấn vào nút "Tạo khóa học mới" để bắt đầu giảng dạy.
          </p>
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
                  <span className={`badge ${course.status === 'open' ? 'badge-active' : 'badge-locked'}`}>
                    {course.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '6px 0' }}>
                  {course.title}
                </h3>
                <div className="text-sm text-muted mb-2 font-bold">Mã lớp: {course.code}</div>
                <p className="text-muted text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm">
                    Vào quản lý nội dung <ArrowRight size={14} />
                  </Link>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="btn btn-outline btn-sm"
                      title="Sửa thông tin"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="btn btn-danger btn-sm"
                      title="Xóa khóa học"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit Course */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              {isEditing ? 'Cập nhật khóa học' : 'Tạo khóa học mới'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên khóa học</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Lập trình Web với React & Node.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {!isEditing && (
                <div className="form-group">
                  <label className="form-label">Mã khóa học (Tùy chọn, tự sinh nếu để trống)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: WEB301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Danh mục đào tạo</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="Chung">Chung</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái khóa học</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">Đang mở (Cho phép ghi danh)</option>
                  <option value="closed">Đóng ghi danh</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả khóa học</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Giới thiệu mục tiêu, kiến thức sẽ đạt được trong môn học..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between gap-2" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Lưu thay đổi' : 'Tạo lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;

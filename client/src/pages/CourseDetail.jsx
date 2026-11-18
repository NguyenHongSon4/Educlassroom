import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { downloadFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileText,
  Video,
  FileCheck,
  Download,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Users,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, isTeacher, isStudent } = useAuth();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'assignments' | 'students'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('reading');
  const [materialContent, setMaterialContent] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignMaxScore, setAssignMaxScore] = useState(10);
  const [assignFile, setAssignFile] = useState(null);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const resCourse = await API.get(`/courses/${id}`);
      setCourse(resCourse.data);

      // Fetch assignments
      try {
        const resAssign = await API.get(`/assignments/course/${id}`);
        setAssignments(resAssign.data);
      } catch (e) {
        // May not be authorized if not enrolled, ignore
      }

      // If teacher/admin, fetch students
      if (
        user &&
        (user.role === 'admin' ||
          (user.role === 'teacher' && resCourse.data.teacher?._id === user._id))
      ) {
        try {
          const resStudents = await API.get(`/courses/${id}/students`);
          setEnrolledStudents(resStudents.data);
        } catch (e) {
          console.error('Error fetching students:', e);
        }
      }
    } catch (err) {
      setError('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const handleEnroll = async () => {
    setSuccess('');
    setError('');
    try {
      await API.post(`/courses/${id}/enroll`);
      setSuccess('Ghi danh thành công!');
      fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || 'Ghi danh thất bại');
    }
  };

  const handleToggleProgress = async (materialId) => {
    try {
      const { data } = await API.put(`/courses/${id}/materials/${materialId}/progress`);
      setCourse((current) => ({ ...current, completedMaterialIds: data.completedMaterialIds }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật tiến độ');
    }
  };

  // Add Material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', materialTitle);
      formData.append('type', materialType);
      formData.append('content', materialContent);
      if (materialFile) {
        formData.append('file', materialFile);
      }

      if (editingMaterial) {
        await API.put(`/courses/${id}/materials/${editingMaterial._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post(`/courses/${id}/materials`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(editingMaterial ? 'Cập nhật tài liệu thành công!' : 'Thêm tài liệu thành công!');
      setShowMaterialModal(false);
      setEditingMaterial(null);
      setMaterialTitle('');
      setMaterialType('reading');
      setMaterialContent('');
      setMaterialFile(null);
      fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || (editingMaterial ? 'Lỗi khi cập nhật tài liệu' : 'Lỗi khi thêm tài liệu'));
    }
  };

  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialTitle('');
    setMaterialType('reading');
    setMaterialContent('');
    setMaterialFile(null);
    setShowMaterialModal(true);
  };

  const openEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialTitle(material.title || '');
    setMaterialType(material.type || 'reading');
    setMaterialContent(material.content || '');
    setMaterialFile(null);
    setShowMaterialModal(true);
  };

  // Delete Material
  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await API.delete(`/courses/${id}/materials/${materialId}`);
      setSuccess('Đã xóa tài liệu');
      fetchCourseData();
    } catch (err) {
      setError('Không thể xóa tài liệu');
    }
  };

  // Add Assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', assignTitle);
      formData.append('description', assignDesc);
      formData.append('dueDate', assignDueDate);
      formData.append('maxScore', assignMaxScore);
      if (assignFile) {
        formData.append('file', assignFile);
      }

      await API.post(`/assignments/course/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Tạo bài tập thành công!');
      setShowAssignmentModal(false);
      setAssignTitle('');
      setAssignDesc('');
      setAssignDueDate('');
      setAssignFile(null);
      fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo bài tập');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center" style={{ padding: '60px 0' }}>
        <div className="text-muted">Đang tải chi tiết môn học...</div>
      </div>
    );
  }

  if (!course) {
    return <div className="alert alert-danger">Không tìm thấy thông tin khóa học</div>;
  }

  const isOwner =
    user && (user.role === 'admin' || (user.role === 'teacher' && course.teacher?._id === user._id));

  return (
    <div>
      {/* Course Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              {course.category}
            </span>
            <span className="text-muted text-sm font-bold">Mã lớp: {course.code}</span>
          </div>

          <div>
            {isStudent && !course.isEnrolled && (
              <button onClick={handleEnroll} className="btn btn-primary">
                <CheckCircle size={16} /> Ghi danh khóa học
              </button>
            )}
            {course.isEnrolled && (
              <span className="badge badge-active">Đã ghi danh tham gia</span>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>{course.title}</h1>
        <p className="text-muted" style={{ marginBottom: '16px' }}>{course.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div><strong>Giảng viên:</strong> {course.teacher?.name} ({course.teacher?.email})</div>
          <div><strong>Trạng thái:</strong> {course.status === 'open' ? 'Đang mở' : 'Đã đóng'}</div>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button
          className={`btn btn-sm ${activeTab === 'materials' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('materials')}
        >
          <BookOpen size={16} /> Tài liệu bài học ({course.materials?.length || 0})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'assignments' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileCheck size={16} /> Bài tập ({assignments.length})
        </button>
        {isOwner && (
          <button
            className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} /> Sinh viên ghi danh ({enrolledStudents.length})
          </button>
        )}
      </div>

      {/* Tab 1: Materials */}
      {activeTab === 'materials' && (
        <div>
          {isStudent && course.isEnrolled && course.materials?.length > 0 && (
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-2">
                <strong>Tiến độ khóa học</strong>
                <span>{course.completedMaterialIds?.length || 0}/{course.materials.length} bài học</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 8 }}>
                <div style={{ height: '100%', width: `${Math.round(((course.completedMaterialIds?.length || 0) / course.materials.length) * 100)}%`, background: 'var(--hero-gradient)', borderRadius: 8 }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nội dung & Tài liệu học tập</h3>
            {isOwner && (
              <button onClick={openAddMaterial} className="btn btn-primary btn-sm">
                <Plus size={16} /> Đăng tải tài liệu mới
              </button>
            )}
          </div>

          {isStudent && !course.isEnrolled ? (
            <div className="card text-muted" style={{ textAlign: 'center', padding: '32px' }}>
              Ghi danh khóa học để xem tài liệu và theo dõi tiến độ học tập.
            </div>
          ) : course.materials?.length === 0 ? (
            <div className="card text-muted" style={{ textAlign: 'center', padding: '32px' }}>
              Chưa có tài liệu nào được đăng tải cho khóa học này.
            </div>
          ) : (
            <div className="grid grid-cols-1">
              {course.materials.map((mat, index) => (
                <div key={mat._id || index} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {mat.type === 'video' ? (
                        <span style={{ color: '#ef4444' }}><Video size={20} /></span>
                      ) : mat.type === 'pdf' ? (
                        <span style={{ color: '#ea580c' }}><FileText size={20} /></span>
                      ) : (
                        <span style={{ color: 'var(--primary)' }}><BookOpen size={20} /></span>
                      )}
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{mat.title}</h4>
                      <span className="badge" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                        {mat.type === 'video' ? 'Video' : mat.type === 'pdf' ? 'Tài liệu PDF' : 'Bài đọc'}
                      </span>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openEditMaterial(mat)} className="btn btn-outline btn-sm" title="Chỉnh sửa tài liệu">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => handleDeleteMaterial(mat._id)} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} title="Xóa tài liệu">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {mat.content && (
                    <div style={{ marginTop: '8px', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                      {mat.type === 'video' ? (
                        <a
                          href={mat.content}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ marginTop: '6px' }}
                        >
                          <ExternalLink size={14} /> Mở liên kết Video bài giảng
                        </a>
                      ) : (
                        <p>{mat.content}</p>
                      )}
                    </div>
                  )}

                  {mat.fileUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => downloadFile(mat.fileUrl).catch((err) => setError(err.response?.data?.message || 'Không thể tải tài liệu'))}
                        className="btn btn-outline btn-sm"
                      >
                        <Download size={14} /> Tải tài liệu đính kèm (PDF/Tệp)
                      </button>
                    </div>
                  )}
                  {isStudent && course.isEnrolled && (
                    <button
                      type="button"
                      className={`btn btn-sm ${(course.completedMaterialIds || []).includes(String(mat._id)) ? 'btn-primary' : 'btn-outline'}`}
                      style={{ marginTop: 12 }}
                      onClick={() => handleToggleProgress(mat._id)}
                    >
                      <CheckCircle size={15} />
                      {(course.completedMaterialIds || []).includes(String(mat._id)) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assignments */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Danh sách bài tập</h3>
            {isOwner && (
              <button onClick={() => setShowAssignmentModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Tạo bài tập mới
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="card text-muted" style={{ textAlign: 'center', padding: '32px' }}>
              Chưa có bài tập nào cho khóa học này.
            </div>
          ) : (
            <div className="grid grid-cols-1">
              {assignments.map((assign) => (
                <div key={assign._id} className="card flex items-center justify-between">
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                      <Link to={`/assignments/${assign._id}`} style={{ color: 'inherit' }}>
                        {assign.title}
                      </Link>
                    </h4>
                    <p className="text-muted text-sm mb-2">{assign.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                      <span>Thang điểm: {assign.maxScore}</span>
                    </div>
                  </div>

                  <div>
                    <Link to={`/assignments/${assign._id}`} className="btn btn-outline btn-sm">
                      {isOwner ? 'Chấm điểm & Chi tiết' : 'Nộp bài / Xem điểm'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Enrolled Students (Teacher/Admin only) */}
      {activeTab === 'students' && isOwner && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
            Sinh viên đã ghi danh vào lớp
          </h3>

          {enrolledStudents.length === 0 ? (
            <div className="card text-muted" style={{ textAlign: 'center', padding: '32px' }}>
              Chưa có sinh viên nào ghi danh.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Ngày ghi danh</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{item.student?.name}</td>
                      <td>{item.student?.email}</td>
                      <td>{new Date(item.enrolledAt || item.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Add Material */}
      {showMaterialModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              {editingMaterial ? 'Chỉnh sửa tài liệu học tập' : 'Đăng tải tài liệu học tập'}
            </h3>
            <form onSubmit={handleAddMaterial}>
              <div className="form-group">
                <label className="form-label">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Bài 1 - Tổng quan MERN Stack"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Loại tài liệu</label>
                <select
                  className="form-select"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                >
                  <option value="reading">Bài đọc / Văn bản</option>
                  <option value="video">Liên kết Video (YouTube, Vimeo...)</option>
                  <option value="pdf">Tệp tài liệu (PDF, Word, Slide...)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {materialType === 'video' ? 'Đường link Video' : 'Nội dung tóm tắt / Hướng dẫn'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder={materialType === 'video' ? 'https://youtube.com/watch?v=...' : 'Nội dung bài học...'}
                  value={materialContent}
                  onChange={(e) => setMaterialContent(e.target.value)}
                />
              </div>

              {editingMaterial?.fileUrl && (
                <p className="text-muted text-sm mb-4">Đã có tệp đính kèm. Chọn tệp mới bên dưới nếu muốn thay thế.</p>
              )}

              <div className="form-group">
                <label className="form-label">Tải tệp đính kèm (PDF, DOCX...)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setMaterialFile(e.target.files[0])}
                />
              </div>

              <div className="flex justify-between gap-2" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowMaterialModal(false); setEditingMaterial(null); setMaterialFile(null); }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMaterial ? 'Lưu thay đổi' : 'Lưu tài liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Assignment */}
      {showAssignmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              Tạo bài tập mới
            </h3>
            <form onSubmit={handleAddAssignment}>
              <div className="form-group">
                <label className="form-label">Tiêu đề bài tập</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Bài tập số 1 - Thiết kế Database"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yêu cầu & Đề bài</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Mô tả chi tiết yêu cầu bài nộp..."
                  value={assignDesc}
                  onChange={(e) => setAssignDesc(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Hạn nộp</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thang điểm tối đa</label>
                  <input
                    type="number"
                    className="form-input"
                    value={assignMaxScore}
                    onChange={(e) => setAssignMaxScore(e.target.value)}
                    min={1}
                    max={100}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tệp đính kèm đề bài (tùy chọn)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setAssignFile(e.target.files[0])}
                />
              </div>

              <div className="flex justify-between gap-2" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAssignmentModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { downloadFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Award,
  Upload,
  Download,
  CheckCircle,
  FileText,
  ArrowLeft,
} from 'lucide-react';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user, isTeacher, isStudent } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student submit state
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Teacher grade state
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/assignments/${id}`);
      setAssignment(res.data);

      if (user?.role === 'student') {
        const subRes = await API.get(`/assignments/${id}/my-submission`);
        setMySubmission(subRes.data);
        if (subRes.data) {
          setSubmissionText(subRes.data.submissionText || '');
        }
      }

      if (
        user?.role === 'admin' ||
        (user?.role === 'teacher' && res.data.teacher?._id === user?._id)
      ) {
        const subsRes = await API.get(`/assignments/${id}/submissions`);
        setAllSubmissions(subsRes.data);
      }
    } catch (err) {
      setError('Lỗi khi tải thông tin bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id, user]);

  // Handle student submission
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append('submissionText', submissionText);
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      const res = await API.post(`/assignments/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Nộp bài thành công!');
      fetchAssignmentData();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi khi nộp bài');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle teacher grading
  const handleGradeSubmit = async (submissionId) => {
    setMessage('');
    setError('');

    try {
      await API.put(`/submissions/${submissionId}/grade`, {
        score: Number(gradeScore),
        feedback: gradeFeedback,
      });

      setMessage('Đã lưu điểm và nhận xét thành công!');
      setGradingSubmissionId(null);
      setGradeScore('');
      setGradeFeedback('');
      fetchAssignmentData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi chấm điểm');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center" style={{ padding: '60px 0' }}>
        <div className="text-muted">Đang tải thông tin bài tập...</div>
      </div>
    );
  }

  if (!assignment) {
    return <div className="alert alert-danger">Không tìm thấy bài tập</div>;
  }

  const isOwner =
    user && (user.role === 'admin' || (user.role === 'teacher' && assignment.teacher?._id === user._id));

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/courses/${assignment.course?._id || assignment.course}`}
          className="btn btn-outline btn-sm"
        >
          <ArrowLeft size={16} /> Quay lại môn học
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Assignment Header Card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-sm font-bold">
            Môn học: {assignment.course?.title}
          </span>
          <span className="badge" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            Thang điểm: {assignment.maxScore}
          </span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '8px 0' }}>
          {assignment.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={15} /> Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
          </span>
          <span>GV phụ trách: {assignment.teacher?.name}</span>
        </div>

        <div style={{ backgroundColor: '#f0f7f6', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontWeight: 600, marginBottom: '6px' }}>Yêu cầu đề bài:</h4>
          <p style={{ whiteSpace: 'pre-line', color: 'var(--text-main)' }}>{assignment.description}</p>
        </div>

        {assignment.attachmentUrl && (
          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => downloadFile(assignment.attachmentUrl).catch((err) => setError(err.response?.data?.message || 'Không thể tải tệp'))}
              className="btn btn-outline btn-sm"
            >
              <Download size={14} /> Tải tệp đề bài đính kèm
            </button>
          </div>
        )}
      </div>

      {/* STUDENT SUBMISSION SECTION */}
      {isStudent && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
            Khu vực nộp bài của sinh viên
          </h3>

          {mySubmission && (
            <div
              style={{
                backgroundColor: mySubmission.status === 'graded' ? 'var(--success-bg)' : '#f0f7f6',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '20px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Trạng thái bài nộp:</span>
                <span className={`badge ${mySubmission.status === 'graded' ? 'badge-active' : 'badge-student'}`}>
                  {mySubmission.status === 'graded' ? 'Đã chấm điểm' : 'Đã nộp bài'}
                </span>
              </div>

              {mySubmission.status === 'graded' && (
                <div style={{ margin: '12px 0', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #b6e9c1' }}>
                  <div className="flex items-center gap-2" style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>
                    <Award size={20} /> Điểm số đạt được: {mySubmission.score} / {assignment.maxScore}
                  </div>
                  {mySubmission.feedback && (
                    <div style={{ marginTop: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      <strong>Nhận xét của GV:</strong> {mySubmission.feedback}
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-muted">
                <div>Thời gian nộp: {new Date(mySubmission.submittedAt).toLocaleString('vi-VN')}</div>
                {mySubmission.fileName && (
                  <div style={{ marginTop: '4px' }}>
                    Tệp đính kèm đã nộp:{' '}
                    <button
                      type="button"
                      onClick={() => downloadFile(mySubmission.fileUrl, mySubmission.fileName).catch((err) => setError(err.response?.data?.message || 'Không thể tải tệp'))}
                      style={{ color: 'var(--primary)', fontWeight: 600 }}
                    >
                      {mySubmission.fileName}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitWork}>
            <div className="form-group">
              <label className="form-label">Nội dung bài làm / Giải trình</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Nhập nội dung câu trả lời hoặc link bài làm GitHub/Google Drive..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tải lên tệp bài nộp (Tùy chọn: PDF, Word, ZIP, Ảnh...)</label>
              <input
                type="file"
                className="form-input"
                onChange={(e) => setSubmissionFile(e.target.files[0])}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading}
              style={{ marginTop: '10px' }}
            >
              <Upload size={16} />
              {submitLoading ? 'Đang gửi...' : mySubmission ? 'Cập nhật lại bài nộp' : 'Nộp bài tập'}
            </button>
          </form>
        </div>
      )}

      {/* TEACHER / ADMIN GRADING SECTION */}
      {isOwner && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Danh sách bài nộp của sinh viên ({allSubmissions.length})
            </h3>
          </div>

          {allSubmissions.length === 0 ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
              Chưa có sinh viên nào nộp bài tập này.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Nội dung / File</th>
                    <th>Thời gian nộp</th>
                    <th>Điểm số</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.student?.name}</div>
                        <div className="text-muted text-sm">{sub.student?.email}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.submissionText || 'Không có văn bản'}
                        </div>
                        {sub.fileUrl && (
                          <button
                            type="button"
                            onClick={() => downloadFile(sub.fileUrl, sub.fileName).catch((err) => setError(err.response?.data?.message || 'Không thể tải tệp'))}
                            className="btn btn-outline btn-sm"
                            style={{ marginTop: '4px' }}
                          >
                            <Download size={12} /> Tải file: {sub.fileName || 'Tệp nộp'}
                          </button>
                        )}
                      </td>
                      <td className="text-sm text-muted">
                        {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        {sub.status === 'graded' ? (
                          <div>
                            <span className="badge badge-active font-bold">
                              {sub.score} / {assignment.maxScore}
                            </span>
                            {sub.feedback && (
                              <div className="text-sm text-muted" style={{ marginTop: '2px' }}>
                                {sub.feedback}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="badge" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                            Chưa chấm
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setGradingSubmissionId(sub._id);
                            setGradeScore(sub.score !== null ? sub.score : '');
                            setGradeFeedback(sub.feedback || '');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Chấm điểm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Grade Modal for Teacher */}
      {gradingSubmissionId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              Chấm điểm bài nộp
            </h3>
            <div className="form-group">
              <label className="form-label">
                Điểm số (Thang điểm 0 - {assignment.maxScore})
              </label>
              <input
                type="number"
                step="0.25"
                min={0}
                max={assignment.maxScore}
                className="form-input"
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nhận xét của giảng viên</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Nhập phản hồi, góp ý cho sinh viên..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
              />
            </div>

            <div className="flex justify-between gap-2" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setGradingSubmissionId(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleGradeSubmit(gradingSubmissionId)}
              >
                Lưu kết quả chấm điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;

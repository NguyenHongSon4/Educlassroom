import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle,
  PlusCircle,
  FolderKanban,
  GraduationCap,
  Layers,
  ArrowRight,
  CalendarClock,
  Clock3,
  Sparkles,
  Target,
} from 'lucide-react';

const StatCard = ({ label, value, detail, icon: Icon, tone, to }) => {
  const content = (
    <>
      <div className="dashboard-stat-icon" data-tone={tone}><Icon size={22} /></div>
      <div className="dashboard-stat-copy">
        <span className="text-muted text-sm">{label}</span>
        <strong>{value}</strong>
        {detail && <span className="text-muted text-sm">{detail}</span>}
      </div>
    </>
  );

  return to ? (
    <Link to={to} className="card dashboard-stat-card dashboard-stat-card-new">{content}</Link>
  ) : (
    <div className="card dashboard-stat-card-new">{content}</div>
  );
};

const ProgressBar = ({ value = 0 }) => (
  <div className="dashboard-progress-track" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
    <div className="dashboard-progress-value" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [stats, setStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [gradedCount, setGradedCount] = useState(0);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const results = await Promise.allSettled([
            API.get('/users/stats'),
            API.get('/users'),
            API.get('/users/enrollments'),
          ]);
          if (!active) return;
          if (results[0].status === 'fulfilled') setStats(results[0].value.data);
          if (results[1].status === 'fulfilled') setAdminUsers(results[1].value.data.slice(0, 5));
          if (results[2].status === 'fulfilled') setRecentEnrollments(results[2].value.data.slice(0, 5));
        } else if (isTeacher) {
          const { data } = await API.get('/courses/my-teaching');
          if (active) setTeacherCourses(data);
        } else if (isStudent) {
          const results = await Promise.allSettled([
            API.get('/courses/my-enrolled'),
            API.get('/submissions/my-grades'),
            API.get('/courses'),
          ]);
          if (!active) return;

          const courses = results[0].status === 'fulfilled' ? results[0].value.data : [];
          const grades = results[1].status === 'fulfilled' ? results[1].value.data : [];
          const catalog = results[2].status === 'fulfilled' ? results[2].value.data : [];
          setEnrolledCourses(courses);
          const gradedSubmissions = grades.filter((item) => item.status === 'graded');
          setRecentGrades(gradedSubmissions.slice(0, 4));
          setGradedCount(gradedSubmissions.length);
          setRecommendedCourses(catalog.filter((course) => !course.isEnrolled && course.status === 'open').slice(0, 3));

          const assignmentResults = await Promise.allSettled(
            courses.map((course) => API.get(`/assignments/course/${course._id}`))
          );
          if (!active) return;
          const assignments = assignmentResults.flatMap((result, index) =>
            result.status === 'fulfilled'
              ? result.value.data.map((assignment) => ({ ...assignment, courseTitle: courses[index].title }))
              : []
          );
          const submittedIds = new Set(grades.map((item) => item.assignment?._id).filter(Boolean));
          const pending = assignments
            .filter((assignment) => !submittedIds.has(assignment._id))
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setUpcomingAssignments(pending.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, [isAdmin, isTeacher, isStudent]);

  const totalMaterials = enrolledCourses.reduce((sum, course) => sum + (course.materials?.length || 0), 0);
  const completedMaterials = enrolledCourses.reduce((sum, course) => sum + (course.completedMaterialIds?.length || 0), 0);
  const overallProgress = totalMaterials ? Math.round((completedMaterials / totalMaterials) * 100) : 0;
  const continueCourse = enrolledCourses.find((course) => (course.progress || 0) < 100) || enrolledCourses[0];

  const roleLabel = isAdmin ? 'Quản trị viên' : isTeacher ? 'Giảng viên' : 'Sinh viên';

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-hero-tag"><Sparkles size={14} /> {roleLabel}</span>
          <h1>Xin chào, {user?.name}! <span aria-hidden="true">👋</span></h1>
          <p>{isStudent
            ? 'Một chút tiến bộ mỗi ngày sẽ đưa bạn đến gần mục tiêu hơn.'
            : isTeacher
              ? 'Theo dõi lớp học và tiếp tục hỗ trợ học viên của bạn.'
              : 'Tổng quan hoạt động và quản lý nền tảng học tập.'}</p>
        </div>
        <div className="dashboard-hero-actions">
          {isStudent && <Link to={continueCourse ? `/courses/${continueCourse._id}` : '/courses'} className="btn dashboard-hero-button"><BookOpen size={17} /> {continueCourse ? 'Tiếp tục học' : 'Khám phá khóa học'}</Link>}
          {isTeacher && <Link to="/teacher/courses" className="btn dashboard-hero-button"><PlusCircle size={17} /> Quản lý lớp học</Link>}
          {isAdmin && <Link to="/admin/users" className="btn dashboard-hero-button"><Users size={17} /> Quản lý hệ thống</Link>}
        </div>
        <div className="dashboard-hero-decoration" aria-hidden="true"><BookOpen size={126} /></div>
      </section>

      {isStudent && (
        <>
          <section className="dashboard-stat-grid" aria-label="Tổng quan học tập">
            <StatCard label="Khóa học đã ghi danh" value={loading ? '—' : enrolledCourses.length} icon={BookOpen} tone="teal" to="/my-enrolled" />
            <StatCard label="Tiến độ tổng thể" value={loading ? '—' : `${overallProgress}%`} detail={`${completedMaterials} / ${totalMaterials} bài học`} icon={Target} tone="green" />
            <StatCard label="Bài tập cần nộp" value={loading ? '—' : upcomingAssignments.length} detail="Chưa có bài nộp" icon={CalendarClock} tone="amber" to="/my-enrolled" />
            <StatCard label="Bài tập đã chấm" value={loading ? '—' : gradedCount} icon={Award} tone="rose" to="/my-grades" />
          </section>

          <section className="dashboard-content-grid">
            <div className="card dashboard-section-card">
              <div className="dashboard-section-heading">
                <div><span className="dashboard-eyebrow">HỌC TIẾP</span><h2>Tiếp tục hành trình</h2></div>
                <Link to="/my-enrolled" className="dashboard-text-link">Tất cả lớp <ArrowRight size={15} /></Link>
              </div>
              {loading ? <p className="text-muted">Đang tải khóa học...</p> : continueCourse ? (
                <div className="dashboard-course-feature">
                  <div className="dashboard-course-art"><BookOpen size={34} /><span>{continueCourse.code}</span></div>
                  <div className="dashboard-course-info">
                    <span className="badge dashboard-category-badge">{continueCourse.category || 'Khóa học'}</span>
                    <h3>{continueCourse.title}</h3>
                    <p className="text-muted text-sm">Giảng viên: {continueCourse.teacher?.name || 'Chưa cập nhật'}</p>
                    <div className="dashboard-progress-label"><span>Tiến độ khóa học</span><strong>{continueCourse.progress || 0}%</strong></div>
                    <ProgressBar value={continueCourse.progress || 0} />
                    <Link to={`/courses/${continueCourse._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Tiếp tục học <ArrowRight size={15} /></Link>
                  </div>
                </div>
              ) : (
                <div className="dashboard-empty-state"><BookOpen size={28} /><p>Bạn chưa ghi danh khóa học nào.</p><Link to="/courses" className="btn btn-primary btn-sm">Tìm khóa học</Link></div>
              )}
            </div>

            <div className="card dashboard-section-card">
              <div className="dashboard-section-heading">
                <div><span className="dashboard-eyebrow">NHẮC NHỞ</span><h2>Bài tập cần nộp</h2></div>
                <Clock3 size={20} className="text-muted" />
              </div>
              {loading ? <p className="text-muted">Đang tải bài tập...</p> : upcomingAssignments.length ? (
                <div className="dashboard-deadline-list">
                  {upcomingAssignments.map((assignment) => {
                    const due = new Date(assignment.dueDate);
                    const overdue = due < new Date();
                    return (
                      <Link to={`/assignments/${assignment._id}`} key={assignment._id} className="dashboard-deadline-item">
                        <span className={`dashboard-deadline-icon ${overdue ? 'is-overdue' : ''}`}><CalendarClock size={17} /></span>
                        <span className="dashboard-deadline-copy"><strong>{assignment.title}</strong><small>{assignment.courseTitle}</small><small className={overdue ? 'text-danger' : 'text-muted'}>{overdue ? 'Quá hạn' : 'Hạn nộp'} · {due.toLocaleDateString('vi-VN')}</small></span>
                        <ArrowRight size={15} className="text-muted" />
                      </Link>
                    );
                  })}
                </div>
              ) : <div className="dashboard-empty-state compact"><CheckCircle size={26} /><p>Bạn đã hoàn thành các bài tập đang có.</p></div>}
            </div>
          </section>

          <section className="dashboard-content-grid dashboard-secondary-grid">
            <div className="card dashboard-section-card">
              <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">KẾT QUẢ</span><h2>Điểm số gần đây</h2></div><Link to="/my-grades" className="dashboard-text-link">Xem bảng điểm <ArrowRight size={15} /></Link></div>
              {recentGrades.length ? (
                <div className="dashboard-grade-list">
                  {recentGrades.map((item) => (
                    <Link to={`/assignments/${item.assignment?._id}`} key={item._id} className="dashboard-grade-item">
                      <span className="dashboard-grade-icon"><Award size={18} /></span>
                      <span className="dashboard-grade-copy"><strong>{item.assignment?.title || 'Bài tập'}</strong><small>{item.course?.title || 'Khóa học'}</small></span>
                      <strong className="dashboard-grade-score">{item.score} / {item.assignment?.maxScore || 10}</strong>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-muted">Chưa có bài tập nào được chấm điểm.</p>}
            </div>
            <div className="card dashboard-section-card dashboard-discovery-card">
              <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">GỢI Ý CHO BẠN</span><h2>Khám phá khóa học</h2></div><Sparkles size={19} /></div>
              {recommendedCourses.length ? recommendedCourses.map((course) => (
                <Link to={`/courses/${course._id}`} key={course._id} className="dashboard-recommend-item"><span><strong>{course.title}</strong><small>{course.category} · {course.code}</small></span><ArrowRight size={16} /></Link>
              )) : <p className="text-muted">Hiện chưa có khóa học mới để gợi ý.</p>}
              <Link to="/courses" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>Xem toàn bộ khóa học</Link>
            </div>
          </section>
        </>
      )}

      {isTeacher && !isAdmin && (
        <>
          <section className="dashboard-stat-grid teacher-stat-grid">
            <StatCard label="Lớp học đang quản lý" value={loading ? '—' : teacherCourses.length} icon={FolderKanban} tone="teal" to="/teacher/courses" />
            <StatCard label="Lớp đang mở" value={loading ? '—' : teacherCourses.filter((course) => course.status === 'open').length} icon={BookOpen} tone="green" to="/teacher/courses" />
            <StatCard label="Lớp đã đóng" value={loading ? '—' : teacherCourses.filter((course) => course.status === 'closed').length} icon={Layers} tone="amber" to="/teacher/courses" />
            <StatCard label="Tạo lớp mới" value={<PlusCircle size={25} />} detail="Bắt đầu khóa học mới" icon={GraduationCap} tone="rose" to="/teacher/courses" />
          </section>
          <section className="card dashboard-section-card">
            <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">KHÔNG GIAN GIẢNG DẠY</span><h2>Lớp học của bạn</h2></div><Link to="/teacher/courses" className="btn btn-primary btn-sm"><PlusCircle size={15} /> Quản lý lớp</Link></div>
            {loading ? <p className="text-muted">Đang tải lớp học...</p> : teacherCourses.length ? (
              <div className="dashboard-teacher-course-grid">
                {teacherCourses.slice(0, 4).map((course) => (
                  <Link to={`/courses/${course._id}`} key={course._id} className="dashboard-teacher-course">
                    <div className="flex items-center justify-between"><span className="badge dashboard-category-badge">{course.category}</span><span className={`dashboard-status-dot ${course.status === 'open' ? 'open' : ''}`} /></div>
                    <h3>{course.title}</h3><p className="text-muted text-sm">{course.code}</p>
                    <span className="dashboard-text-link">Mở khóa học <ArrowRight size={14} /></span>
                  </Link>
                ))}
              </div>
            ) : <div className="dashboard-empty-state"><FolderKanban size={28} /><p>Bạn chưa tạo lớp học nào.</p><Link to="/teacher/courses" className="btn btn-primary btn-sm">Tạo lớp đầu tiên</Link></div>}
          </section>
        </>
      )}

      {isAdmin && (
        <>
          <section className="dashboard-stat-grid admin-stat-grid">
            <StatCard label="Tổng người dùng" value={stats?.totalUsers ?? '—'} icon={Users} tone="teal" to="/admin/users" />
            <StatCard label="Sinh viên / Giảng viên" value={stats ? `${stats.totalStudents} / ${stats.totalTeachers}` : '—'} icon={GraduationCap} tone="green" to="/admin/users" />
            <StatCard label="Khóa học đang mở" value={stats?.totalCourses ?? '—'} icon={BookOpen} tone="amber" to="/teacher/courses" />
            <StatCard label="Lượt ghi danh" value={stats?.totalEnrollments ?? '—'} icon={CheckCircle} tone="rose" to="/admin/enrollments" />
          </section>
          <section className="dashboard-content-grid">
            <div className="card dashboard-section-card">
              <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">MỚI THAM GIA</span><h2>Người dùng gần đây</h2></div><Link to="/admin/users" className="dashboard-text-link">Quản lý người dùng <ArrowRight size={15} /></Link></div>
              {loading ? <p className="text-muted">Đang tải...</p> : adminUsers.length ? <div className="dashboard-user-list">{adminUsers.map((item) => <div className="dashboard-user-item" key={item._id}><span className="dashboard-user-avatar">{item.name?.charAt(0)?.toUpperCase() || 'U'}</span><span><strong>{item.name}</strong><small>{item.email}</small></span><span className={`badge badge-${item.role}`}>{item.role}</span></div>)}</div> : <p className="text-muted">Chưa có người dùng.</p>}
            </div>
            <div className="card dashboard-section-card">
              <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">HOẠT ĐỘNG</span><h2>Ghi danh gần đây</h2></div><Link to="/admin/enrollments" className="dashboard-text-link">Tất cả ghi danh <ArrowRight size={15} /></Link></div>
              {loading ? <p className="text-muted">Đang tải...</p> : recentEnrollments.length ? <div className="dashboard-enrollment-list">{recentEnrollments.map((item) => <div className="dashboard-enrollment-item" key={item._id}><span className="dashboard-enrollment-icon"><BookOpen size={17} /></span><span><strong>{item.student?.name}</strong><small>ghi danh {item.course?.title}</small></span><small className="text-muted">{new Date(item.enrolledAt).toLocaleDateString('vi-VN')}</small></div>)}</div> : <p className="text-muted">Chưa có lượt ghi danh.</p>}
            </div>
          </section>
          <div className="dashboard-admin-shortcuts"><Link to="/teacher/courses" className="btn btn-outline"><BookOpen size={16} /> Quản lý khóa học</Link><Link to="/admin/categories" className="btn btn-outline"><Layers size={16} /> Danh mục khóa học</Link></div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

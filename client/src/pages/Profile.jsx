import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, LockKeyhole, Save, UserRound } from 'lucide-react';

const emptyProfile = {
  name: '', email: '', phone: '', bio: '', avatar: '',
  studentId: '', major: '', studyYear: '',
  title: '', specialization: '', organization: '',
  role: 'student', isActive: true, createdAt: '',
};

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    API.get('/auth/me')
      .then(({ data }) => { if (active) setProfile({ ...emptyProfile, ...data }); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải hồ sơ'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let objectUrl;
    let active = true;
    if (avatarFile) {
      objectUrl = URL.createObjectURL(avatarFile);
      setAvatarPreview(objectUrl);
    } else if (profile.avatar) {
      const filename = profile.avatar.split('/').pop();
      API.get(`/files/${encodeURIComponent(filename)}`, { responseType: 'blob' })
        .then(({ data }) => {
          if (active) {
            objectUrl = URL.createObjectURL(data);
            setAvatarPreview(objectUrl);
          }
        })
        .catch(() => { if (active) setAvatarPreview(''); });
    } else {
      setAvatarPreview('');
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile, profile.avatar]);

  const setField = (field) => (event) => setProfile((current) => ({ ...current, [field]: event.target.value }));

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh đại diện không được vượt quá 5 MB');
      event.target.value = '';
      return;
    }
    setError('');
    setAvatarFile(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const formData = new FormData();
    ['name', 'email', 'phone', 'bio', 'studentId', 'major', 'studyYear', 'title', 'specialization', 'organization']
      .forEach((field) => formData.append(field, profile[field] || ''));
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const { data } = await API.put('/auth/me', formData);
      setProfile((current) => ({ ...current, ...data }));
      setAvatarFile(null);
      updateUser(data);
      setMessage('Đã lưu hồ sơ cá nhân');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu chưa khớp');
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await API.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMessage(data.message || 'Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="card text-muted">Đang tải hồ sơ...</div>;

  const roleLabel = profile.role === 'teacher' ? 'Giảng viên' : profile.role === 'admin' ? 'Quản trị viên' : 'Sinh viên';

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hồ sơ cá nhân</h1>
        <p className="text-muted text-sm">Cập nhật thông tin liên hệ và thông tin học tập/công tác của bạn.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleProfileSave}>
        <section className="card mb-6">
          <div className="flex items-center gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', background: 'var(--primary-light)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
              {avatarPreview ? <img src={avatarPreview} alt="Ảnh đại diện" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserRound size={38} />}
            </div>
            <div>
              <label className="btn btn-outline btn-sm" htmlFor="profile-avatar"><Camera size={15} /> Chọn ảnh đại diện</label>
              <input id="profile-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <p className="text-muted text-sm" style={{ marginTop: 6 }}>JPG, PNG hoặc WEBP; tối đa 5 MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" value={profile.name} onChange={setField('name')} required maxLength={100} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={profile.email} onChange={setField('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" type="tel" value={profile.phone} onChange={setField('phone')} maxLength={30} />
            </div>
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <input className="form-input" value={roleLabel} readOnly />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Giới thiệu bản thân</label>
            <textarea className="form-textarea" rows={4} maxLength={500} value={profile.bio} onChange={setField('bio')} placeholder="Chia sẻ ngắn về bản thân..." />
            <span className="text-muted text-sm">{profile.bio.length}/500 ký tự</span>
          </div>

          {profile.role === 'student' && (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 16px' }}>Thông tin sinh viên</h2>
              <div className="grid grid-cols-2">
                <div className="form-group"><label className="form-label">Mã sinh viên</label><input className="form-input" value={profile.studentId} onChange={setField('studentId')} maxLength={50} /></div>
                <div className="form-group"><label className="form-label">Ngành học</label><input className="form-input" value={profile.major} onChange={setField('major')} maxLength={100} /></div>
                <div className="form-group"><label className="form-label">Khóa / năm học</label><input className="form-input" value={profile.studyYear} onChange={setField('studyYear')} maxLength={50} placeholder="Ví dụ: K22 hoặc Năm 3" /></div>
              </div>
            </>
          )}

          {profile.role === 'teacher' && (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 16px' }}>Thông tin giảng viên</h2>
              <div className="grid grid-cols-2">
                <div className="form-group"><label className="form-label">Chức danh</label><input className="form-input" value={profile.title} onChange={setField('title')} maxLength={100} placeholder="Ví dụ: Thạc sĩ, Tiến sĩ" /></div>
                <div className="form-group"><label className="form-label">Chuyên môn</label><input className="form-input" value={profile.specialization} onChange={setField('specialization')} maxLength={150} /></div>
                <div className="form-group"><label className="form-label">Đơn vị công tác</label><input className="form-input" value={profile.organization} onChange={setField('organization')} maxLength={150} /></div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2" style={{ marginTop: 8 }}>
            <div className="form-group"><label className="form-label">Ngày tham gia</label><input className="form-input" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : ''} readOnly /></div>
            <div className="form-group"><label className="form-label">Trạng thái tài khoản</label><input className="form-input" value={profile.isActive ? 'Đang hoạt động' : 'Đã khóa'} readOnly /></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
        </section>
      </form>

      <section className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}><LockKeyhole size={18} style={{ verticalAlign: 'text-bottom', marginRight: 8 }} />Đổi mật khẩu</h2>
        <p className="text-muted text-sm mb-4">Nhập mật khẩu hiện tại để xác nhận thay đổi.</p>
        {passwordMessage && <div className="alert alert-success">{passwordMessage}</div>}
        {passwordError && <div className="alert alert-danger">{passwordError}</div>}
        <form onSubmit={handlePasswordChange}>
          <div className="grid grid-cols-2">
            <div className="form-group"><label className="form-label">Mật khẩu hiện tại</label><input className="form-input" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
            <div />
            <div className="form-group"><label className="form-label">Mật khẩu mới</label><input className="form-input" type="password" autoComplete="new-password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Xác nhận mật khẩu mới</label><input className="form-input" type="password" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          </div>
          <button type="submit" className="btn btn-outline" disabled={changingPassword}><LockKeyhole size={16} /> {changingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button>
        </form>
      </section>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, Lock, Unlock, Shield, Search } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    setMessage('');
    setError('');
    try {
      const res = await API.put(`/users/${userId}/toggle-status`);
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setMessage('');
    setError('');
    try {
      const res = await API.put(`/users/${userId}/role`, { role: newRole });
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Quản lý người dùng hệ thống</h1>
          <p className="text-muted text-sm">
            Xem toàn bộ tài khoản, thay đổi quyền hạn và Khóa/Mở khóa tài khoản
          </p>
        </div>

        <div className="flex gap-2" style={{ maxWidth: '320px', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <div className="text-muted">Đang tải danh sách người dùng...</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò (Role)</th>
                <th>Trạng thái tài khoản</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="student">Sinh viên</option>
                      <option value="teacher">Giảng viên</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-active">Hoạt động</span>
                    ) : (
                      <span className="badge badge-locked">Đã bị khóa</span>
                    )}
                  </td>
                  <td className="text-sm text-muted">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                    >
                      {u.isActive ? (
                        <>
                          <Lock size={14} /> Khóa tài khoản
                        </>
                      ) : (
                        <>
                          <Unlock size={14} /> Mở khóa
                        </>
                      )}
                    </button>
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

export default AdminUsers;

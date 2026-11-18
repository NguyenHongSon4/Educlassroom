import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Layers, Plus, Trash2, Pencil, X } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/courses/categories');
      setCategories(res.data);
    } catch (err) {
      setError('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await API.put(`/courses/categories/${editingId}`, { name, description });
        setMessage('Cập nhật danh mục thành công!');
      } else {
        await API.post('/courses/categories', { name, description });
        setMessage('Tạo danh mục mới thành công!');
      }
      setName('');
      setDescription('');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo danh mục');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description || '');
    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await API.delete(`/courses/categories/${id}`);
      setMessage('Đã xóa danh mục');
      fetchCategories();
    } catch (err) {
      setError('Lỗi khi xóa danh mục');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Quản lý danh mục khóa học</h1>
        <p className="text-muted text-sm">
          Phân loại các môn học trên toàn hệ thống theo chuyên ngành đào tạo
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="grid grid-cols-3">
        {/* Form create category */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
            {editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Tên danh mục</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Khoa học dữ liệu & AI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả ngắn</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Mô tả ngành học hoặc định hướng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </button>
            {editingId && <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={cancelEdit}><X size={16} /> Hủy sửa</button>}
          </form>
        </div>

        {/* Categories list */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Danh sách danh mục hiện có ({categories.length})
            </h3>

            {loading ? (
              <div className="text-muted">Đang tải...</div>
            ) : categories.length === 0 ? (
              <div className="text-muted">Chưa có danh mục nào.</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên danh mục</th>
                      <th>Mô tả</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td className="text-muted text-sm">{c.description || '-'}</td>
                        <td>
                          <button
                            onClick={() => handleEdit(c)}
                            className="btn btn-outline btn-sm"
                            title="Sửa danh mục"
                            style={{ marginRight: 8 }}
                          ><Pencil size={14} /></button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="btn btn-danger btn-sm"
                            title="Xóa danh mục"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

import { useEffect, useMemo, useState } from 'react';
import { PencilLine, Plus, Shield, Trash2, UserCog, Users, X } from 'lucide-react';
import api from '../utils/api';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import './AdminUsers.css';

const ROLE_OPTIONS = ['USER', 'ADMIN'];
const PROVIDER_FILTER_OPTIONS = ['ALL', 'LOCAL', 'GOOGLE'];

const emptyForm = {
  email: '',
  name: '',
  password: '',
  role: 'USER',
};

const getProviderLabel = (provider) => {
  if (!provider) {
    return 'UNKNOWN';
  }
  return provider === 'GOOGLE' ? 'GOOGLE' : 'LOCAL';
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState(null);
  const [pageError, setPageError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [brokenAvatarIds, setBrokenAvatarIds] = useState([]);
  const [providerFilter, setProviderFilter] = useState('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setPageError('');
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setPageError(getApiErrorMessage(error, 'Failed to load registered users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === 'ADMIN').length,
    google: users.filter((user) => user.authProvider === 'GOOGLE').length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    if (providerFilter === 'ALL') {
      return users;
    }

    return users.filter((user) => getProviderLabel(user.authProvider) === providerFilter);
  }, [providerFilter, users]);

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      name: user.name || '',
      password: '',
      role: user.role || 'USER',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) {
      return;
    }
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError('');
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      setActiveUserId(userId);
      setPageError('');
      const { data } = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? data : user))
      );
    } catch (error) {
      console.error('Failed to update user role', error);
      alert(getApiErrorMessage(error, 'Failed to update user role'));
    } finally {
      setActiveUserId(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.email}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setActiveUserId(user.id);
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prevUsers) => prevUsers.filter((existingUser) => existingUser.id !== user.id));
      if (editingUser?.id === user.id) {
        closeForm();
      }
    } catch (error) {
      console.error('Failed to delete user', error);
      alert(getApiErrorMessage(error, 'Failed to delete user'));
    } finally {
      setActiveUserId(null);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarError = (userId) => {
    setBrokenAvatarIds((prevIds) => (
      prevIds.includes(userId) ? prevIds : [...prevIds, userId]
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const payload = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      password: formData.password,
      role: formData.role,
    };

    if (!payload.email) {
      setFormError('Email is required.');
      return;
    }

    if (!editingUser && payload.password.trim().length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (editingUser?.authProvider === 'GOOGLE') {
      payload.password = '';
    }

    try {
      setSubmitting(true);

      if (editingUser) {
        const { data } = await api.put(`/admin/users/${editingUser.id}`, payload);
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === editingUser.id ? data : user))
        );
      } else {
        const { data } = await api.post('/admin/users', payload);
        setUsers((prevUsers) => [data, ...prevUsers]);
      }

      closeForm();
    } catch (error) {
      console.error('Failed to save user', error);
      setFormError(getApiErrorMessage(error, 'Failed to save user'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-shell">
          <div className="admin-users-card admin-users-loading">Loading registered users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-shell">
        <section className="admin-users-hero admin-users-card">
          <span className="admin-users-eyebrow">Identity Control</span>
          <h1>Manage registered users and admin access.</h1>
          <p>
            Review every account in the system, identify local and Google sign-ins,
            create local accounts, and manage role-based access from one place.
          </p>
        </section>

        <section className="admin-users-stats">
          <article className="admin-users-stat admin-users-card">
            <div className="admin-users-stat-icon users">
              <Users size={20} />
            </div>
            <strong>{stats.total}</strong>
            <span>Total users</span>
          </article>

          <article className="admin-users-stat admin-users-card">
            <div className="admin-users-stat-icon admins">
              <Shield size={20} />
            </div>
            <strong>{stats.admins}</strong>
            <span>Admin accounts</span>
          </article>

          <article className="admin-users-stat admin-users-card">
            <div className="admin-users-stat-icon google">
              <UserCog size={20} />
            </div>
            <strong>{stats.google}</strong>
            <span>Google sign-ins</span>
          </article>
        </section>

        <section className="admin-users-card admin-users-table-card">
          <div className="admin-users-table-header">
            <div>
              <h2>Registered users</h2>
              <p>All local and Google-authenticated accounts currently stored in the platform.</p>
            </div>

            <div className="admin-users-toolbar">
              <label className="admin-users-filter">
                <span>Provider</span>
                <select
                  value={providerFilter}
                  onChange={(event) => setProviderFilter(event.target.value)}
                >
                  {PROVIDER_FILTER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'ALL' ? 'All Accounts' : option === 'LOCAL' ? 'Local Only' : 'Google Only'}
                    </option>
                  ))}
                </select>
              </label>

              <button type="button" className="admin-users-primary-btn" onClick={openCreateForm}>
                <Plus size={16} />
                Create Account
              </button>
            </div>
          </div>

          {pageError && <div className="admin-users-error">{pageError}</div>}

          {filteredUsers.length === 0 ? (
            <div className="admin-users-empty">
              {users.length === 0 ? 'No registered users found.' : 'No users match the selected provider filter.'}
            </div>
          ) : (
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Provider</th>
                    <th>Role</th>
                    <th>Access Control</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const providerLabel = getProviderLabel(user.authProvider);
                    const shouldShowAvatarImage = Boolean(user.avatarUrl) && !brokenAvatarIds.includes(user.id);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-users-user">
                            <div className="admin-users-avatar">
                              {shouldShowAvatarImage ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name || user.email}
                                  onError={() => handleAvatarError(user.id)}
                                />
                              ) : (
                                <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="admin-users-user-copy">
                              <strong>{user.name?.trim() || 'Unnamed user'}</strong>
                              <span>User ID: {user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="admin-users-email">{user.email}</td>
                        <td>
                          <span className={`admin-users-provider ${providerLabel.toLowerCase()}`}>
                            {providerLabel}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-users-role ${user.role?.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <select
                            className="admin-users-select"
                            value={user.role}
                            disabled={activeUserId === user.id}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="admin-users-actions">
                            <button
                              type="button"
                              className="admin-users-icon-btn"
                              onClick={() => openEditForm(user)}
                              title="Edit user"
                            >
                              <PencilLine size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-users-icon-btn danger"
                              onClick={() => handleDelete(user)}
                              disabled={activeUserId === user.id}
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isFormOpen && (
          <section className="admin-users-card admin-users-form-card animate-fade-in">
            <div className="admin-users-form-header">
              <div>
                <h2>{editingUser ? 'Edit user account' : 'Create new local account'}</h2>
                <p>
                  {editingUser
                    ? 'Update user details, access level, and optional password for local accounts.'
                    : 'Create a new locally managed account that can sign in with email and password.'}
                </p>
              </div>
              <button type="button" className="admin-users-close-btn" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-users-form-grid" onSubmit={handleSubmit}>
              <label className="admin-users-field">
                <span>Name</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Full name"
                />
              </label>

              <label className="admin-users-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="name@university.edu"
                  required
                />
              </label>

              <label className="admin-users-field">
                <span>Role</span>
                <select name="role" value={formData.role} onChange={handleFormChange}>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-users-field">
                <span>
                  {editingUser
                    ? editingUser.authProvider === 'GOOGLE'
                      ? 'Password not managed here for Google accounts'
                      : 'New password (optional)'
                    : 'Password'}
                </span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder={
                    editingUser
                      ? editingUser.authProvider === 'GOOGLE'
                        ? 'Google account password is managed by Google'
                        : 'Leave blank to keep the current password'
                      : 'Minimum 8 characters'
                  }
                  disabled={editingUser?.authProvider === 'GOOGLE'}
                  required={!editingUser}
                />
              </label>

              {formError && <div className="admin-users-error admin-users-form-error">{formError}</div>}

              <div className="admin-users-form-actions">
                <button type="submit" className="admin-users-primary-btn" disabled={submitting}>
                  {submitting
                    ? editingUser
                      ? 'Saving...'
                      : 'Creating...'
                    : editingUser
                      ? 'Save Changes'
                      : 'Create Account'}
                </button>
                <button type="button" className="admin-users-secondary-btn" onClick={closeForm} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;

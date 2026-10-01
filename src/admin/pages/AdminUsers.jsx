import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Shield,
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Key,
  Mail,
  Phone,
  UserCheck,
  AlertCircle,
  Eye,
  Settings,
  Lock
} from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard Overview' },
  { id: 'events', label: 'Events & Packages' },
  { id: 'client_requests', label: 'Client Inquiries' },
  { id: 'media', label: 'Media & Hero Assets' },
  { id: 'categories', label: 'Portfolio Categories' },
  { id: 'settings', label: 'Studio & Bucket Settings' },
  { id: 'notifications', label: 'Notification Center' },
  { id: 'users', label: 'User & Access Control' },
  { id: 'logs', label: 'System Audit Logs' },
];

export const AdminUsers = () => {
  const { adminUser, isMasterAdmin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'SUB_ADMIN',
    modules: ALL_MODULES.map((m) => ({
      module: m.id,
      permissions: { view: true, edit: false, delete: false },
    })),
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('[AdminUsers] Load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'SUB_ADMIN',
      modules: ALL_MODULES.map((m) => ({
        module: m.id,
        permissions: { view: true, edit: false, delete: false },
      })),
    });
    setEditingUser(null);
    setActionError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave blank unless updating
      phone: user.phone || '',
      role: user.role || 'SUB_ADMIN',
      status: user.status || 'ACTIVE',
      modules: ALL_MODULES.map((m) => {
        const existing = user.modules?.find((mod) => mod.module === m.id);
        return {
          module: m.id,
          permissions: {
            view: existing?.permissions?.view ?? (user.role === 'ADMIN'),
            edit: existing?.permissions?.edit ?? (user.role === 'ADMIN'),
            delete: existing?.permissions?.delete ?? (user.role === 'ADMIN'),
          },
        };
      }),
    });
    setActionError(null);
    setIsCreateModalOpen(true);
  };

  const handleTogglePermission = (moduleId, action) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.module === moduleId
          ? {
              ...m,
              permissions: {
                ...m.permissions,
                [action]: !m.permissions[action],
              },
            }
          : m
      ),
    }));
  };

  const handleApplyPreset = (mode) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => ({
        ...m,
        permissions: {
          view: mode !== 'none',
          edit: mode === 'full' || mode === 'editor',
          delete: mode === 'full',
        },
      })),
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    try {
      if (editingUser) {
        // Update user
        const payload = {
          name: formData.name,
          phone: formData.phone,
          status: formData.status,
          modules: formData.modules,
        };
        if (formData.password) {
          payload.password = formData.password;
        }

        await usersAPI.update(editingUser._id, payload);
        setActionSuccess(`Sub-Admin ${formData.name} updated successfully.`);
      } else {
        // Create user
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Name, email, and password are required.');
        }

        await usersAPI.create(formData);
        setActionSuccess(`Sub-Admin ${formData.name} created successfully.`);
      }

      setIsCreateModalOpen(false);
      loadUsers();
    } catch (err) {
      setActionError(err.message || 'Operation failed');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete access for ${name}?`)) return;
    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#141824] via-[#11141D] to-[#0E1118] border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#C9A96E]/20 text-[#E5D2A8] border border-[#C9A96E]/40">
              Access Control & RBAC
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Sub-Admin & User Permissions
          </h2>
          <p className="text-xs text-slate-400">
            Define granular module permissions (View, Edit, Delete) for sub-admins and creative operators.
          </p>
        </div>

        {isMasterAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs flex items-center gap-2 shadow-gold-glow hover:opacity-95 transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Create Sub-Admin</span>
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Table */}
      <div className="rounded-3xl bg-[#11141D] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E] transition-all"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredUsers.length} Users Enrolled
          </span>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Allowed Modules</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    Loading users and permission profiles...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const allowedCount =
                    u.role === 'ADMIN'
                      ? ALL_MODULES.length
                      : u.modules?.filter((m) => m.permissions?.view).length || 0;

                  return (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A96E]/20 to-[#A37E3E]/10 border border-[#C9A96E]/30 flex items-center justify-center font-bold text-[#E5D2A8] text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            u.role === 'ADMIN'
                              ? 'bg-[#C9A96E]/20 text-[#E5D2A8] border-[#C9A96E]/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {u.role === 'ADMIN' ? 'MASTER ADMIN' : 'SUB-ADMIN'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] ${
                            u.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300">
                          {u.role === 'ADMIN'
                            ? 'All Modules (Unrestricted Full Access)'
                            : `${allowedCount} of ${ALL_MODULES.length} Modules Permitted`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isMasterAdmin && (
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit Permissions"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isMasterAdmin && u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              title="Revoke User Access"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#11141D] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-auto transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable inner body */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 text-[#C9A96E]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    {editingUser ? `Edit Permissions: ${editingUser.name}` : 'Provision New Sub-Admin'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingUser
                      ? 'Modify credentials and granular module access control'
                      : 'Create a restricted operator account with customizable role permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Anand Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="operator@praznaphotography.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E] disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {editingUser ? 'New Password (leave blank to keep unchanged)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              {/* Module Permissions Matrix */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A96E]">
                      Allowed Modules & Permissions
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Configure modules accessible by this Sub-Admin operator
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('full')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C9A96E]/20 text-[#E5D2A8] text-[10px] font-medium transition-colors border border-white/10"
                    >
                      All Full Access
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('editor')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-500/20 text-blue-300 text-[10px] font-medium transition-colors border border-white/10"
                    >
                      View & Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('view')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-medium transition-colors border border-white/10"
                    >
                      View Only
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('none')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-medium transition-colors border border-rose-500/20"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                  <div className="grid grid-cols-12 py-2 px-4 bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    <span className="col-span-6">Module Name</span>
                    <span className="col-span-2 text-center">View</span>
                    <span className="col-span-2 text-center">Edit</span>
                    <span className="col-span-2 text-center">Delete</span>
                  </div>

                  {formData.modules.map((m) => {
                    const info = ALL_MODULES.find((mod) => mod.id === m.module);
                    return (
                      <div
                        key={m.module}
                        className="grid grid-cols-12 items-center py-2.5 px-4 hover:bg-white/[0.02] text-xs text-slate-300"
                      >
                        <span className="col-span-6 font-medium text-white">
                          {info?.label || m.module}
                        </span>

                        <div className="col-span-2 flex justify-center">
                          <input
                            type="checkbox"
                            checked={Boolean(m.permissions.view)}
                            onChange={() => handleTogglePermission(m.module, 'view')}
                            className="w-4 h-4 rounded text-[#C9A96E] bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                          />
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <input
                            type="checkbox"
                            checked={Boolean(m.permissions.edit)}
                            onChange={() => handleTogglePermission(m.module, 'edit')}
                            className="w-4 h-4 rounded text-[#C9A96E] bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                          />
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <input
                            type="checkbox"
                            checked={Boolean(m.permissions.delete)}
                            onChange={() => handleTogglePermission(m.module, 'delete')}
                            className="w-4 h-4 rounded text-rose-500 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95 transition-all"
                >
                  {editingUser ? 'Save Permissions' : 'Create Sub-Admin'}
                </button>
              </div>
            </form>
            </div> {/* end scrollable inner body */}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

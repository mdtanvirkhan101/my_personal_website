"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  ShieldCheck,
  Shield,
  Mail,
  User,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Lock,
  KeyRound,
  CheckCircle2,
  Layers,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleUserActive,
  saveCustomRole,
  deleteCustomRole,
  configureUser2FA,
  User2FASetting,
} from "@/actions/user-management";
import {
  CustomRoleDefinition,
  RolePrivileges,
  ALL_PRIVILEGES_KEYS,
  PRIVILEGE_LABELS,
  DEFAULT_ADMIN_PRIVILEGES,
  DEFAULT_EDITOR_PRIVILEGES,
} from "@/lib/role-privileges";

interface AdminUserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
}

interface UsersManagerProps {
  users: AdminUserData[];
  roles: CustomRoleDefinition[];
  twoFaRegistry?: Record<string, User2FASetting>;
  currentUserId: string;
}

type ModalMode = "create" | "edit" | "delete" | null;

export function UsersManager({
  users: initialUsers,
  roles: initialRoles,
  twoFaRegistry: initial2FaRegistry = {},
  currentUserId,
}: UsersManagerProps) {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  // User accounts state
  const [users, setUsers] = useState<AdminUserData[]>(initialUsers);
  const [twoFaRegistry, setTwoFaRegistry] = useState<Record<string, User2FASetting>>(initial2FaRegistry);
  const [twoFaModalUser, setTwoFaModalUser] = useState<AdminUserData | null>(null);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaPin, setTwoFaPin] = useState("");
  const [twoFaSaving, setTwoFaSaving] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Custom Roles state
  const [roles, setRoles] = useState<CustomRoleDefinition[]>(initialRoles);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRoleDefinition | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePrivileges, setRolePrivileges] = useState<RolePrivileges>(DEFAULT_EDITOR_PRIVILEGES);
  const [roleLoading, setRoleLoading] = useState(false);

  const openCreate = () => {
    setSelectedUser(null);
    setError(null);
    setModalMode("create");
  };

  const openEdit = (user: AdminUserData) => {
    setSelectedUser(user);
    setError(null);
    setModalMode("edit");
  };

  const openDelete = (user: AdminUserData) => {
    setSelectedUser(user);
    setError(null);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setError(null);
  };

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createAdminUser(new FormData(e.currentTarget));
      showSuccessMsg("User account created successfully!");
      closeModal();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateAdminUser(new FormData(e.currentTarget));
      showSuccessMsg("User updated successfully!");
      closeModal();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAdminUser(selectedUser.id);
      showSuccessMsg("User deleted successfully!");
      closeModal();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: AdminUserData) => {
    try {
      await toggleUserActive(user.id, !user.active);
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
      );
      showSuccessMsg(`User ${user.active ? "deactivated" : "activated"} successfully!`);
    } catch (err: any) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  // Role Management Handlers
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setRolePrivileges({ ...DEFAULT_EDITOR_PRIVILEGES });
    setIsRoleModalOpen(true);
  };

  const openEditRole = (role: CustomRoleDefinition) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setRolePrivileges({ ...role.privileges });
    setIsRoleModalOpen(true);
  };

  const handleTogglePrivilege = (key: keyof RolePrivileges) => {
    setRolePrivileges((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllPrivileges = (state: boolean) => {
    const updated: any = {};
    ALL_PRIVILEGES_KEYS.forEach((k) => {
      updated[k] = state;
    });
    setRolePrivileges(updated);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setRoleLoading(true);
    try {
      await saveCustomRole({
        id: editingRole?.id,
        name: roleName.trim(),
        description: roleDescription.trim(),
        privileges: rolePrivileges,
      });

      showSuccessMsg(
        editingRole
          ? `Role "${roleName}" updated successfully!`
          : `Custom role "${roleName}" created successfully!`
      );
      setIsRoleModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to save role.");
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteRole = async (role: CustomRoleDefinition) => {
    if (role.isSystem) {
      alert("Core system roles cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete custom role "${role.name}"?`)) return;

    try {
      await deleteCustomRole(role.id);
      showSuccessMsg(`Role "${role.name}" deleted successfully!`);
      setRoles(roles.filter((r) => r.id !== role.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete role.");
    }
  };

  const panelStyle = {
    background: "rgba(14, 14, 52, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
  };

  const inputStyle = {
    background: "rgba(14, 14, 52, 0.8)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    color: "#f1f5f9",
    padding: "0.625rem 1rem",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    width: "100%",
    outline: "none",
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Top Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-500/20"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <span>User &amp; Role Privilege Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage admin credentials, staff accounts, and custom granular access privileges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {success && (
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold animate-in fade-in"
              style={{
                background: "rgba(52, 211, 153, 0.1)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                color: "#34d399",
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === "users" ? (
            <button
              onClick={openCreate}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-lg hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add User Account</span>
            </button>
          ) : (
            <button
              onClick={openCreateRole}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-lg hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-purple-500/20 pb-3">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "users"
              ? "bg-[#8b5cf6] text-white shadow-lg font-bold"
              : "bg-[#141444]/60 text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "roles"
              ? "bg-cyan-500 text-black shadow-lg font-bold"
              : "bg-[#141444]/60 text-slate-400 hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Roles &amp; Privileges ({roles.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: USERS LIST                                        */}
      {/* ======================================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={panelStyle}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
                      background: "rgba(139, 92, 246, 0.05)",
                    }}
                  >
                    {["User Account", "Email", "Assigned Role", "2FA Security", "Status", "Joined", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom: "1px solid rgba(139, 92, 246, 0.08)" }}
                      className="transition-colors hover:bg-purple-500/5"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
                          >
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{user.name || "—"}</div>
                            {user.id === currentUserId && (
                              <div className="text-[10px] text-purple-400 font-bold">YOU</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300 font-mono">{user.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase inline-flex items-center space-x-1"
                          style={
                            user.role === "ADMIN"
                              ? {
                                  background: "rgba(139, 92, 246, 0.15)",
                                  color: "#c4b5fd",
                                  border: "1px solid rgba(139, 92, 246, 0.3)",
                                }
                              : {
                                  background: "rgba(34, 211, 238, 0.1)",
                                  color: "#22d3ee",
                                  border: "1px solid rgba(34, 211, 238, 0.25)",
                                }
                          }
                        >
                          {user.role === "ADMIN" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          <span>{user.role}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            setTwoFaModalUser(user);
                            const setting = twoFaRegistry[user.id];
                            setTwoFaEnabled(!!setting?.enabled);
                            setTwoFaPin(setting?.pinCode || "");
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer"
                          style={
                            twoFaRegistry[user.id]?.enabled
                              ? {
                                  background: "rgba(16, 185, 129, 0.15)",
                                  color: "#34d399",
                                  border: "1px solid rgba(16, 185, 129, 0.3)",
                                }
                              : {
                                  background: "rgba(148, 163, 184, 0.1)",
                                  color: "#94a3b8",
                                  border: "1px solid rgba(148, 163, 184, 0.2)",
                                }
                          }
                          title="Configure 2FA Security"
                        >
                          <Lock className="w-3 h-3" />
                          <span>{twoFaRegistry[user.id]?.enabled ? "2FA Active" : "Disabled"}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={user.id === currentUserId}
                          className="flex items-center space-x-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {user.active ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                              <span className="text-emerald-400">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                              <span className="text-slate-500">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-slate-500 font-mono">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-purple-300"
                            title="Edit user"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDelete(user)}
                            disabled={user.id === currentUserId}
                            className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Privileges Info Card */}
          <div
            className="p-4 rounded-2xl text-xs"
            style={{
              background: "rgba(139, 92, 246, 0.06)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-slate-400">
                <p>
                  <span className="text-white font-semibold">ADMIN</span> — Full unrestricted control over website settings, user accounts, API Hub, backups, and portfolio sections.
                </p>
                <p>
                  <span className="text-white font-semibold">EDITOR / CUSTOM ROLES</span> — Configured to manage specific CMS modules based on assigned privileges without exposing core security or user controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ROLES & PRIVILEGES                                 */}
      {/* ======================================================== */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => {
              const activeCount = ALL_PRIVILEGES_KEYS.filter(
                (k) => role.privileges?.[k] === true
              ).length;

              return (
                <div
                  key={role.id}
                  className="rounded-3xl p-6 border flex flex-col justify-between transition-all hover:border-cyan-400/50"
                  style={panelStyle}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1"
                        style={
                          role.isSystem
                            ? {
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "#c4b5fd",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                              }
                            : {
                                background: "rgba(34, 211, 238, 0.1)",
                                color: "#22d3ee",
                                border: "1px solid rgba(34, 211, 238, 0.25)",
                              }
                        }
                      >
                        <Shield className="w-3 h-3" />
                        <span>{role.isSystem ? "SYSTEM ROLE" : "CUSTOM ROLE"}</span>
                      </span>

                      <div className="flex items-center space-x-1">
                        {!role.isSystem && (
                          <>
                            <button
                              onClick={() => openEditRole(role)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors"
                              title="Edit role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete role"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {role.isSystem && (
                          <button
                            onClick={() => openEditRole(role)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 transition-colors"
                            title="Inspect privileges"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {role.description || "Custom defined role for CMS access delegation."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-purple-500/10">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Granted Privileges:</span>
                        <span className="text-cyan-400 font-bold">
                          {activeCount} / {ALL_PRIVILEGES_KEYS.length}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                          style={{
                            width: `${(activeCount / ALL_PRIVILEGES_KEYS.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>ID: {role.id.substring(0, 12)}</span>
                    <button
                      onClick={() => openEditRole(role)}
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>{role.isSystem ? "View Privileges" : "Configure"}</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* USER MODALS (Create, Edit, Delete)                       */}
      {/* ======================================================== */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95"
            style={panelStyle}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>{modalMode === "create" ? "Create Admin / Staff User" : "Edit User Account"}</span>
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div
                className="p-3 rounded-xl text-xs text-red-300 flex items-center space-x-2"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={modalMode === "create" ? handleCreate : handleEdit}
              className="space-y-4"
            >
              {modalMode === "edit" && (
                <input type="hidden" name="id" value={selectedUser?.id} />
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedUser?.name || ""}
                    placeholder="e.g. John Doe"
                    style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={selectedUser?.email || ""}
                    placeholder="admin@example.com"
                    style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign Role / Privilege Level <span className="text-red-400">*</span>
                </label>
                <select
                  name="role"
                  defaultValue={selectedUser?.role || "ADMIN"}
                  style={inputStyle}
                  className="bg-[#0e0e34]"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id === "ADMIN" ? "ADMIN" : "EDITOR"} className="bg-[#0e0e34]">
                      {r.name} {r.isSystem ? "(System)" : "(Custom Privilege)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {modalMode === "create" ? (
                    <>
                      Password <span className="text-red-400">*</span>
                    </>
                  ) : (
                    "New Password (leave empty to keep current)"
                  )}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name={modalMode === "create" ? "password" : "newPassword"}
                    required={modalMode === "create"}
                    minLength={8}
                    placeholder="Min. 8 characters"
                    style={{
                      ...inputStyle,
                      paddingLeft: "2.25rem",
                      paddingRight: "2.5rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {modalMode === "edit" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Status
                  </label>
                  <select
                    name="active"
                    defaultValue={selectedUser?.active ? "true" : "false"}
                    style={inputStyle}
                    className="bg-[#0e0e34]"
                  >
                    <option value="true" className="bg-[#0e0e34]">
                      Active — Allowed to log in
                    </option>
                    <option value="false" className="bg-[#0e0e34]">
                      Inactive — Login blocked
                    </option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === "create" ? "Create Account" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {modalMode === "delete" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-3xl p-6 space-y-5 text-center shadow-2xl animate-in fade-in zoom-in-95"
            style={panelStyle}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete User Account</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-white">{selectedUser.name || selectedUser.email}</strong>?
                This action cannot be undone.
              </p>
            </div>

            {error && (
              <div
                className="p-3 rounded-xl text-xs text-red-300"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOM ROLE & PRIVILEGE MODAL                            */}
      {/* ======================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            style={panelStyle}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingRole?.isSystem
                      ? `Inspect System Role: ${editingRole.name}`
                      : editingRole
                      ? `Edit Custom Role: ${editingRole.name}`
                      : "Create New Custom Role"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Define granular privileges and assign module access control.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Role Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingRole?.isSystem}
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Technical Content Manager"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Role Description
                  </label>
                  <input
                    type="text"
                    disabled={editingRole?.isSystem}
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="e.g. Can manage projects, blogs, and case studies"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Privileges Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Granular Access Privileges Matrix
                  </h3>

                  {!editingRole?.isSystem && (
                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSelectAllPrivileges(true)}
                        className="text-cyan-400 hover:underline font-mono"
                      >
                        Grant All
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllPrivileges(false)}
                        className="text-slate-400 hover:underline font-mono"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Content & Portfolio Group */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-purple-300 uppercase block">
                    Portfolio &amp; Content Modules
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ALL_PRIVILEGES_KEYS.filter(
                      (k) => PRIVILEGE_LABELS[k].category === "Content & Portfolio"
                    ).map((key) => {
                      const enabled = rolePrivileges[key];
                      return (
                        <div
                          key={key}
                          onClick={() => !editingRole?.isSystem && handleTogglePrivilege(key)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            editingRole?.isSystem ? "cursor-default" : "cursor-pointer"
                          } ${
                            enabled
                              ? "bg-purple-500/10 border-purple-500/40 text-white"
                              : "bg-[#141444]/40 border-slate-800 text-slate-400"
                          }`}
                        >
                          <span className="text-xs font-medium">{PRIVILEGE_LABELS[key].title}</span>
                          {enabled ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System & Operations Group */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase block">
                    System, Security &amp; Operations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ALL_PRIVILEGES_KEYS.filter(
                      (k) => PRIVILEGE_LABELS[k].category === "System & Operations"
                    ).map((key) => {
                      const enabled = rolePrivileges[key];
                      return (
                        <div
                          key={key}
                          onClick={() => !editingRole?.isSystem && handleTogglePrivilege(key)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            editingRole?.isSystem ? "cursor-default" : "cursor-pointer"
                          } ${
                            enabled
                              ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                              : "bg-[#141444]/40 border-slate-800 text-slate-400"
                          }`}
                        >
                          <span className="text-xs font-medium">{PRIVILEGE_LABELS[key].title}</span>
                          {enabled ? (
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {editingRole?.isSystem ? "Close" : "Cancel"}
                </button>
                {!editingRole?.isSystem && (
                  <button
                    type="submit"
                    disabled={roleLoading}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-50"
                  >
                    {roleLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
                    <span>{editingRole ? "Save Role Changes" : "Create Role"}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication (2FA) Security Modal */}
      {twoFaModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl"
            style={panelStyle}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-base">
                    2FA Security Management
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    User: {twoFaModalUser.name || twoFaModalUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTwoFaModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Two-Factor Authentication Layer</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  When enabled, this account will strictly require a secret numeric PIN upon login, safeguarding against credential leaks or brute-force attacks.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0e0e34] border border-purple-500/20">
                <div>
                  <span className="font-bold text-white block">Enable 2FA Protection</span>
                  <span className="text-[11px] text-slate-400">Mandatory PIN prompt on login</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                  className="cursor-pointer"
                >
                  {twoFaEnabled ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-500" />
                  )}
                </button>
              </div>

              {twoFaEnabled && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="block text-slate-300 font-semibold font-mono text-xs">
                    6-Digit Security PIN Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={twoFaPin}
                    onChange={(e) => setTwoFaPin(e.target.value)}
                    placeholder="e.g. 749201"
                    style={inputStyle}
                    className="font-mono tracking-widest text-base text-cyan-300"
                  />
                  <p className="text-[11px] text-slate-400 font-mono">
                    Must be 4 to 8 digits. Keep this PIN safe and confidential.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTwoFaModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={twoFaSaving || (twoFaEnabled && twoFaPin.trim().length < 4)}
                  onClick={async () => {
                    setTwoFaSaving(true);
                    try {
                      await configureUser2FA(twoFaModalUser.id, twoFaEnabled, twoFaPin);
                      setTwoFaRegistry({
                        ...twoFaRegistry,
                        [twoFaModalUser.id]: {
                          userId: twoFaModalUser.id,
                          enabled: twoFaEnabled,
                          pinCode: twoFaEnabled ? twoFaPin.trim() : "",
                          updatedAt: new Date().toISOString(),
                        },
                      });
                      showSuccessMsg(`2FA settings updated for ${twoFaModalUser.name || twoFaModalUser.email}!`);
                      setTwoFaModalUser(null);
                    } catch (err: any) {
                      alert(err.message || "Failed to update 2FA configuration.");
                    } finally {
                      setTwoFaSaving(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {twoFaSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving 2FA...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Save 2FA Security</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

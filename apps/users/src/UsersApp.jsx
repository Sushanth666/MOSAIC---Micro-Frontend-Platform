import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Filter,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  Eye,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';
import { Button, Card, Input, Badge, Modal, TableSkeleton, Avatar } from '@mfe/shared-ui';
import { mockApi, eventBus, MFE_EVENTS, authStore, PERMISSIONS, meshStore } from '@mfe/shared-bus';

export default function UsersApp({ standalone = false }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Editor');
  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [currentUser, setCurrentUser] = useState(authStore.getCurrentUser());
  const canCreate = authStore.hasPermission(PERMISSIONS.USERS_CREATE, currentUser);
  const canEdit = authStore.hasPermission(PERMISSIONS.USERS_EDIT, currentUser);
  const canDelete = authStore.hasPermission(PERMISSIONS.USERS_DELETE, currentUser);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mockApi.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 5,
        forceError: simulateError
      });
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err.message || 'Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page, simulateError]);

  // Listen to cross-module events (e.g. if a user was created from Dashboard quick action)
  useEffect(() => {
    const unsubCreated = eventBus.on(MFE_EVENTS.USER_CREATED, () => {
      fetchUsers();
    });
    const unsubDeleted = eventBus.on(MFE_EVENTS.USER_DELETED, () => {
      fetchUsers();
    });
    const unsubLogin = eventBus.on(MFE_EVENTS.AUTH_LOGIN, ({ user }) => {
      setCurrentUser(user);
    });
    const unsubUserUpdated = eventBus.on(MFE_EVENTS.AUTH_USER_UPDATED, ({ user }) => {
      setCurrentUser(user);
    });
    const unsubMesh = eventBus.on(MFE_EVENTS.MESH_STATUS_CHANGED, () => {
      fetchUsers();
    });
    return () => {
      unsubCreated();
      unsubDeleted();
      unsubLogin();
      unsubUserUpdated();
      unsubMesh();
    };
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('Editor');
    setFormTitle('');
    setFormStatus('Active');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formTitle.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }
    setFormSubmitting(true);
    try {
      await mockApi.createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        title: formTitle.trim(),
        status: formStatus
      });
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormTitle(user.title);
    setFormStatus(user.status);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setFormSubmitting(true);
    try {
      await mockApi.updateUser(selectedUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        title: formTitle.trim(),
        status: formStatus
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to update user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setFormSubmitting(true);
    try {
      await mockApi.deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (st) => {
    switch (st?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getRoleBadgeVariant = (r) => {
    switch (r?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'editor':
        return 'primary';
      case 'viewer':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="mfe-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              User Management
            </h1>
            <Badge variant="primary" dot size="sm">
              MFE Remote: Users Directory (:5003)
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', marginTop: '4px' }}>
            Manage platform permissions, identities, security policies, and workspace roles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* RBAC Matrix Modal Trigger */}
          <Button
            size="sm"
            variant="outline"
            icon={Shield}
            onClick={() => setIsMatrixModalOpen(true)}
          >
            RBAC Matrix
          </Button>

          {/* Test Error Boundary / API Failure Button */}
          <Button
            size="sm"
            variant={simulateError ? 'danger' : 'outline'}
            onClick={() => setSimulateError(!simulateError)}
            icon={AlertTriangle}
          >
            {simulateError ? 'Disable Error Sim' : 'Simulate API 500'}
          </Button>

          <Button
            size="md"
            variant="primary"
            icon={canCreate ? UserPlus : Lock}
            onClick={canCreate ? openAddModal : undefined}
            disabled={!canCreate}
            title={canCreate ? 'Add new member' : 'Action restricted: Viewer role has read-only access'}
            style={!canCreate ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {canCreate ? 'Add New Member' : 'Add Member (Locked)'}
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card hoverable={false} style={{ padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* Search */}
          <div style={{ flex: '1 1 260px', maxWidth: '400px' }}>
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={Search}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--mfe-text-muted)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--mfe-font-sans)',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--mfe-font-sans)',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Users Table / Error / Empty States */}
      <Card hoverable={false} style={{ padding: 0, overflow: 'hidden' }}>
        {error ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--mfe-danger-bg)',
                color: 'var(--mfe-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
              API Request Failed
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', maxWidth: '420px' }}>
              {error}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setSimulateError(false);
                fetchUsers();
              }}
            >
              Retry Request
            </Button>
          </div>
        ) : loading ? (
          <div style={{ padding: '24px' }}>
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: meshStore.areAllApisOff() ? 'rgba(239, 68, 68, 0.12)' : 'var(--mfe-bg-active)',
                color: meshStore.areAllApisOff() ? '#ef4444' : 'var(--mfe-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {meshStore.areAllApisOff() ? <AlertTriangle size={28} /> : <Users size={28} />}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
              {meshStore.areAllApisOff() ? 'Mesh Gateway Offline' : 'No matching members found'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
              {meshStore.areAllApisOff()
                ? 'The Mesh Gateway connection has been disconnected. All remote user data is temporarily unreachable. Turn the gateway LIVE in the top bar to reconnect.'
                : `No users matched your current query "${search}". Try resetting the search query or filters.`}
            </p>
            {meshStore.areAllApisOff() ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  meshStore.setAllApisOff(false);
                  eventBus.emit(MFE_EVENTS.MESH_STATUS_CHANGED, { allApisOff: false });
                }}
              >
                Reconnect Mesh Gateway
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--mfe-bg-surface)', borderBottom: '1px solid var(--mfe-border)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Member</th>
                  <th style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--mfe-border)',
                      animationDelay: `${i * 0.04}s`
                    }}
                    className="mfe-table-row mfe-animate-in"
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar
                          src="initials"
                          name={u.name}
                          size={36}
                          status={u.status === 'Active' ? 'online' : u.status === 'Pending' ? 'busy' : 'offline'}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                        {u.role}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 20px', color: 'var(--mfe-text-secondary)' }}>
                      {u.title}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={getStatusBadgeVariant(u.status)} dot size="sm">
                        {u.status}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 20px', color: 'var(--mfe-text-muted)', fontSize: '0.8125rem' }}>
                      {u.joined}
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {canEdit ? (
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit member"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--mfe-text-secondary)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: 'var(--mfe-radius-sm)',
                              transition: 'var(--mfe-transition)'
                            }}
                            className="table-action-btn"
                          >
                            <Edit2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => openEditModal(u)}
                            title="View member (Read-only)"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--mfe-text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: 'var(--mfe-radius-sm)',
                              transition: 'var(--mfe-transition)'
                            }}
                            className="table-action-btn"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        {canDelete ? (
                          <button
                            onClick={() => openDeleteModal(u)}
                            title="Delete member"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--mfe-danger)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: 'var(--mfe-radius-sm)',
                              transition: 'var(--mfe-transition)'
                            }}
                            className="table-action-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Deletion restricted: Requires Admin role"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--mfe-text-muted)',
                              cursor: 'not-allowed',
                              padding: '6px',
                              borderRadius: 'var(--mfe-radius-sm)',
                              opacity: 0.35
                            }}
                            className="table-action-btn"
                          >
                            <Lock size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderTop: '1px solid var(--mfe-border)',
                background: 'var(--mfe-bg-surface)'
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)' }}>
                Showing <strong>{users.length}</strong> of <strong>{total}</strong> users
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  size="sm"
                  variant="outline"
                  icon={ChevronLeft}
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-primary)' }}>
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Workspace Member"
        subtitle="Invite a new collaborator to this micro-frontend environment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={formSubmitting}
              onClick={handleCreateUser}
            >
              Create Member
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formError && (
            <div style={{ padding: '8px 12px', background: 'var(--mfe-danger-bg)', color: 'var(--mfe-danger)', borderRadius: 'var(--mfe-radius-sm)', fontSize: '0.8125rem' }}>
              {formError}
            </div>
          )}
          <Input
            label="Full Name"
            placeholder="e.g. Liam Vance"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="liam@hyperion.io"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <Input
            label="Job Title"
            placeholder="e.g. Senior Security Architect"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Member Information"
        subtitle={`Updating account profile for ${selectedUser?.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={formSubmitting}
              onClick={handleUpdateUser}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formError && (
            <div style={{ padding: '8px 12px', background: 'var(--mfe-danger-bg)', color: 'var(--mfe-danger)', borderRadius: 'var(--mfe-radius-sm)', fontSize: '0.8125rem' }}>
              {formError}
            </div>
          )}
          <Input
            label="Full Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <Input
            label="Job Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Revoke Member Access"
        subtitle="This action will permanently delete this collaborator account"
        maxWidth="440px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              isLoading={formSubmitting}
              onClick={handleDeleteUser}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--mfe-text-primary)' }}>{selectedUser?.name}</strong> ({selectedUser?.email})? All associated access tokens and permissions will be invalidated across all micro-frontends.
        </p>
      </Modal>

      {/* Role-Based Access Control (RBAC) Matrix Modal */}
      <Modal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        title="Role-Based Access Control (RBAC) Permissions Matrix"
        subtitle="Security policy enforcement across all micro-frontends"
        maxWidth="680px"
        footer={
          <Button variant="primary" onClick={() => setIsMatrixModalOpen(false)}>
            Dismiss Matrix
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--mfe-bg-card)', borderRadius: 'var(--mfe-radius-md)', border: '1px solid var(--mfe-border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)' }}>
              Currently Signed-In Persona: <strong style={{ color: 'var(--mfe-text-primary)' }}>{currentUser?.name || 'User'}</strong>
            </span>
            <Badge variant="primary" size="sm">
              Role: {currentUser?.role || 'Admin'}
            </Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--mfe-border)', background: 'var(--mfe-bg-surface)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--mfe-text-secondary)' }}>Operation / Action</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--mfe-primary)', textAlign: 'center' }}>Admin</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#818cf8', textAlign: 'center' }}>Editor</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--mfe-text-muted)', textAlign: 'center' }}>Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'View Users & Telemetry Directory', admin: true, editor: true, viewer: true },
                  { name: 'Create New Workspace Members', admin: true, editor: true, viewer: false },
                  { name: 'Edit Existing User Profiles', admin: true, editor: true, viewer: false },
                  { name: 'Delete User Accounts (Protected)', admin: true, editor: false, viewer: false },
                  { name: 'Trigger Live Alert Broadcasts', admin: true, editor: true, viewer: false },
                  { name: 'Purge & Clear Notifications Feed', admin: true, editor: false, viewer: false },
                  { name: 'Export Analytics Reports (CSV/JSON)', admin: true, editor: true, viewer: false },
                  { name: 'Chaos Outage Injections (Mesh)', admin: true, editor: false, viewer: false }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--mfe-border-subtle)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--mfe-text-primary)', fontWeight: 600 }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {row.admin ? <Check size={16} color="var(--mfe-success)" style={{ display: 'inline' }} /> : <X size={16} color="var(--mfe-danger)" style={{ display: 'inline' }} />}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {row.editor ? <Check size={16} color="var(--mfe-success)" style={{ display: 'inline' }} /> : <X size={16} color="var(--mfe-danger)" style={{ display: 'inline' }} />}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {row.viewer ? <Check size={16} color="var(--mfe-success)" style={{ display: 'inline' }} /> : <X size={16} color="var(--mfe-danger)" style={{ display: 'inline' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <style>{`
        .mfe-table-row {
          transition: background-color 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease !important;
        }
        .mfe-table-row:hover {
          background-color: var(--mfe-bg-card-hover) !important;
          transform: translateX(4px);
        }
        .table-action-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .table-action-btn:hover {
          background-color: var(--mfe-bg-active);
          transform: scale(1.18);
        }
      `}</style>
    </div>
  );
}

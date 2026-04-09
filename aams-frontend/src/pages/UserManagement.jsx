import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, MoreVertical, Download } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Input,
  Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Pagination,
  Tabs
} from '../../components';

const UserRow = ({ user, onEdit, onDelete }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="border-t border-neutral-200 dark:border-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors"
  >
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.name}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <Badge variant={user.role === 'admin' ? 'error' : user.role === 'faculty' ? 'warning' : 'primary'} size="sm">
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </Badge>
    </td>
    <td className="px-6 py-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.department}</p>
    </td>
    <td className="px-6 py-4">
      <Badge variant={user.active ? 'success' : 'error'} size="sm">
        {user.active ? 'Active' : 'Inactive'}
      </Badge>
    </td>
    <td className="px-6 py-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.joinDate}</p>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(user)}
          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
        >
          <Edit2 size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(user.id)}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600 dark:text-red-400 transition-colors"
        >
          <Trash2 size={18} />
        </motion.button>
      </div>
    </td>
  </motion.tr>
);

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data
  const users = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@aams.demo', role: 'admin', department: 'Admin', active: true, joinDate: 'Jan 1, 2024' },
    { id: 2, name: 'Dr. Priya Singh', email: 'priya@aams.demo', role: 'faculty', department: 'Computer Science', active: true, joinDate: 'Feb 15, 2024' },
    { id: 3, name: 'Amit Sharma', email: 'amit@aams.demo', role: 'student', department: 'Computer Science', active: true, joinDate: 'Aug 1, 2024' },
    { id: 4, name: 'Bhavna Patel', email: 'bhavna@aams.demo', role: 'student', department: 'Computer Science', active: true, joinDate: 'Aug 1, 2024' },
    { id: 5, name: 'Dr. Vikram Gupta', email: 'vikram@aams.demo', role: 'faculty', department: 'Information Technology', active: true, joinDate: 'Mar 10, 2024' },
  ];

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
     user.email.toLowerCase().includes(search.toLowerCase())) &&
    (filterRole === 'all' || user.role === filterRole)
  );

  const handleCreateUser = () => {
    console.log('Create new user');
    setCreateModalOpen(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    console.log('Update user:', selectedUser);
    setEditModalOpen(false);
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId);
    }
  };

  const tabs = [
    {
      label: 'All Users',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by name or email..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-neutral-900 dark:text-neutral-50"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" icon={Download}>
                Export
              </Button>
              <Button variant="primary" icon={Plus} onClick={() => setCreateModalOpen(true)}>
                Add User
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-dark-700 bg-neutral-50 dark:bg-dark-800">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50">Join Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map(user => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center">
            <Pagination
              current={page}
              total={3}
              onPageChange={setPage}
            />
          </div>
        </motion.div>
      ),
    },
    {
      label: 'Statistics',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Users', value: '156', color: 'from-blue-500 to-blue-600' },
            { label: 'Active Users', value: '148', color: 'from-green-500 to-green-600' },
            { label: 'Inactive Users', value: '8', color: 'from-yellow-500 to-yellow-600' },
            { label: 'This Month', value: '+12', color: 'from-purple-500 to-purple-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardBody className="space-y-3">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg w-fit`}>
                  <div className="w-6 h-6 bg-white/30 rounded" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stat.value}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </motion.div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          User Management
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Manage system users and their permissions
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} />

      {/* Create User Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <ModalHeader title="Add New User" />
        <ModalBody className="space-y-4">
          <Input label="Full Name" placeholder="Enter full name" />
          <Input label="Email" placeholder="user@example.com" type="email" />
          <div>
            <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-2">Role</label>
            <select className="w-full px-3 py-2 border border-neutral-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900">
              <option>Student</option>
              <option>Faculty</option>
              <option>Admin</option>
              <option>Parent</option>
            </select>
          </div>
          <Input label="Password" placeholder="Set password" type="password" />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            Create User
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalHeader title="Edit User" />
        <ModalBody className="space-y-4">
          {selectedUser && (
            <>
              <Input label="Full Name" defaultValue={selectedUser.name} />
              <Input label="Email" defaultValue={selectedUser.email} type="email" />
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-2">Role</label>
                <select defaultValue={selectedUser.role} className="w-full px-3 py-2 border border-neutral-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-2">Status</label>
                <select defaultValue={selectedUser.active ? 'active' : 'inactive'} className="w-full px-3 py-2 border border-neutral-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Update User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

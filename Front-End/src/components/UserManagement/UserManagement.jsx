import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Custom hook para sa theme management
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme || (systemPrefersDark ? 'dark' : 'light');
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update HTML class
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  // Initialize on mount
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, []);

  return { theme, toggleTheme };
};

const UserManagement = () => {
  // Initial user data
  const initialData = [
    { 
      id: 1, 
      name: "Juan Dela Cruz", 
      email: "juan.delacruz@email.com", 
      role: "Administrator",
      department: "IT Department",
      status: "Active",
      lastLogin: "2024-01-15 14:30:22",
      joinDate: "2023-05-10"
    },
    { 
      id: 2, 
      name: "Maria Santos", 
      email: "maria.santos@email.com", 
      role: "Manager",
      department: "Human Resources",
      status: "Active",
      lastLogin: "2024-01-14 09:15:45",
      joinDate: "2023-08-22"
    },
    { 
      id: 3, 
      name: "Pedro Reyes", 
      email: "pedro.reyes@email.com", 
      role: "Staff",
      department: "Finance",
      status: "Inactive",
      lastLogin: "2024-01-10 11:20:33",
      joinDate: "2023-11-05"
    },
    { 
      id: 4, 
      name: "Ana Lim", 
      email: "ana.lim@email.com", 
      role: "Supervisor",
      department: "Operations",
      status: "Active",
      lastLogin: "2024-01-15 16:45:12",
      joinDate: "2023-07-18"
    },
    { 
      id: 5, 
      name: "Luis Garcia", 
      email: "luis.garcia@email.com", 
      role: "Staff",
      department: "Marketing",
      status: "Active",
      lastLogin: "2024-01-13 13:10:28",
      joinDate: "2023-09-30"
    },
    { 
      id: 6, 
      name: "Sofia Tan", 
      email: "sofia.tan@email.com", 
      role: "Administrator",
      department: "IT Department",
      status: "Active",
      lastLogin: "2024-01-15 10:05:19",
      joinDate: "2023-06-12"
    },
    { 
      id: 7, 
      name: "Miguel Torres", 
      email: "miguel.torres@email.com", 
      role: "Staff",
      department: "Customer Service",
      status: "Inactive",
      lastLogin: "2024-01-08 08:45:37",
      joinDate: "2023-10-25"
    },
    { 
      id: 8, 
      name: "Elena Gomez", 
      email: "elena.gomez@email.com", 
      role: "Manager",
      department: "Sales",
      status: "Active",
      lastLogin: "2024-01-14 15:20:44",
      joinDate: "2023-04-15"
    },
    { 
      id: 9, 
      name: "Carlos Rivera", 
      email: "carlos.rivera@email.com", 
      role: "Staff",
      department: "Logistics",
      status: "Active",
      lastLogin: "2024-01-12 12:30:15",
      joinDate: "2023-12-01"
    },
    { 
      id: 10, 
      name: "Isabel Cruz", 
      email: "isabel.cruz@email.com", 
      role: "Supervisor",
      department: "Quality Control",
      status: "Inactive",
      lastLogin: "2024-01-09 17:15:08",
      joinDate: "2023-03-20"
    },
  ];

  // State management
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    email: '', 
    role: 'Staff',
    department: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Theme management
  const { theme, toggleTheme } = useTheme();

  // Available roles and departments
  const roles = ["Administrator", "Manager", "Supervisor", "Staff"];
  const departments = [
    "IT Department",
    "Human Resources",
    "Finance",
    "Operations",
    "Marketing",
    "Sales",
    "Customer Service",
    "Logistics",
    "Quality Control"
  ];
  const statusOptions = ["Active", "Inactive"];

  // Filter data based on search term
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.email || !newItem.department) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!validateEmail(newItem.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
    const itemToAdd = {
      ...newItem,
      id: newId,
      lastLogin: new Date().toLocaleString('en-PH', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
    };
    setData([...data, itemToAdd]);
    setNewItem({ 
      name: '', 
      email: '', 
      role: 'Staff',
      department: '',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      email: item.email,
      role: item.role,
      department: item.department,
      status: item.status,
      joinDate: item.joinDate
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!newItem.name || !newItem.email || !newItem.department) {
      alert('Please fill in all required fields');
      return;
    }

    if (!validateEmail(newItem.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setData(data.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item,
            name: newItem.name,
            email: newItem.email,
            role: newItem.role,
            department: newItem.department,
            status: newItem.status,
            joinDate: newItem.joinDate
          }
        : item
    ));
    setEditingItem(null);
    setNewItem({ 
      name: '', 
      email: '', 
      role: 'Staff',
      department: '',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setData(data.filter(item => item.id !== itemToDelete));
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.id,
        `"${item.name}"`,
        `"${item.email}"`,
        `"${item.role}"`,
        `"${item.department}"`,
        item.status,
        `"${item.lastLogin}"`,
        `"${item.joinDate}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleUserStatus = (id) => {
    setData(data.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Supervisor':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage system users, roles, and permissions
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={exportToCSV} 
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-600"
              >
                <Download size={18} /> Export Users
              </button>
              <button 
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({ 
                    name: '', 
                    email: '', 
                    role: 'Staff',
                    department: '',
                    status: 'Active',
                    joinDate: new Date().toISOString().split('T')[0]
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Plus size={18} /> Add User
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Department</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Last Login</th>
                  <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr 
                    key={item.id} 
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                          <User className="text-orange-600 dark:text-orange-400" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Mail size={14} /> {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(item.role)}`}>
                        <Shield size={12} className="inline mr-1" /> {item.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-800 dark:text-gray-300">{item.department}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                        {item.status === 'Active' ? 
                          <CheckCircle size={12} className="inline mr-1" /> : 
                          <XCircle size={12} className="inline mr-1" />
                        }
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{item.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => toggleUserStatus(item.id)} 
                          className={`p-2 rounded-lg transition-colors ${item.status === 'Active' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border hover:border-red-200 dark:hover:border-red-800' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border hover:border-green-200 dark:hover:border-green-800'}`}
                          title={item.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        >
                          {item.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => handleEditClick(item)} 
                          className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors hover:border hover:border-orange-200 dark:hover:border-orange-800"
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors hover:border hover:border-red-200 dark:hover:border-red-800"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} users
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hover:border-orange-300 dark:hover:border-orange-600"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hover:border-orange-300 dark:hover:border-orange-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md transition-colors duration-300">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit User' : 'Add New User'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    value={newItem.email}
                    onChange={(e) => setNewItem({...newItem, email: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Role *
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                      value={newItem.role}
                      onChange={(e) => setNewItem({...newItem, role: e.target.value})}
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Status *
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                      value={newItem.status}
                      onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Department *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    value={newItem.department}
                    onChange={(e) => setNewItem({...newItem, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Join Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    value={newItem.joinDate}
                    onChange={(e) => setNewItem({...newItem, joinDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={editingItem ? handleSaveEdit : handleAddItem}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
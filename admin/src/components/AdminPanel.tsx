import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { toast } from 'react-hot-toast';
import { Loader2, User, Mail, Phone, Calendar, CreditCard, AlertCircle, X, Check, MoreVertical, Edit, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  plan: {
    name: string;
    price: number;
    duration: number;
  };
  startDate: string;
  endDate: string;
  paymentStatus: 'pending' | 'confirmed' | 'expired';
  paymentMethod: 'cash' | 'card';
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'expired'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin');

    if (!token || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return user.paymentStatus === 'pending';
    if (selectedTab === 'expired') return user.paymentStatus === 'expired';
    return true;
  });

  const handleStatusChange = async (userId: string, status: 'pending' | 'confirmed' | 'expired') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchUsers();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred while updating status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred while deleting user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-md ${
                selectedTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-4 py-2 rounded-md ${
                selectedTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedTab('expired')}
              className={`px-4 py-2 rounded-md ${
                selectedTab === 'expired'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Expired
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={user.photo || 'https://via.placeholder.com/150'}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Plan: {user.plan.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        End Date: {format(new Date(user.endDate), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(user._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        {user.paymentStatus === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(user._id, 'expired')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel; 
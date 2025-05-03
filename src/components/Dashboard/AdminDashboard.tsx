'use client';

import React, { useState, useEffect, useContext } from 'react';
import PageContainer from '@/components/Layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import AdminDashboardStats from '@/components/Dashboard/AdminDashboardStats';
import { AlertCircle, Edit, Eye, Loader2, Search, Trash2, UserCheck, UserPlus, Users, UserX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import  Button  from '../ui/button';
import { Input } from '../ui/input';
import { API_URL, User, AuthProvider, AuthContext } from './AppContext';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';

// User type extension with additional admin-specific fields
interface AdminUser extends Omit<User, 'role'> {
  role: 'USER' | 'ADMIN';
  email_verified: boolean;
}

// Guest interface
interface Guest {
  id: string;
  created_at: string;
  updated_at: string;
  first_visit_timestamp?: string;
  session_id?: string;
  
  // Contact information
  name?: string;
  contact_info?: string;
  company?: string;
  
  // Project details
  industry?: string;
  project_type?: string[];
  budget?: string;
  timeline?: string;
  pain_points?: string[];
  current_tech?: string[];
  
  // Interaction data
  page_views?: string[];
  interaction_events?: string[];
  interaction_history?: {
    event: string;
    timestamp: string;
  }[];
  
  // Other details
  status?: string;
  additional_notes?: string;
}

{/* 
interface User {
  address: string | null;
  card_number: string | null;
  ccv: string | null;
  city: string | null;
  created_at: string;
  email: string;
  email_verified: boolean;
  failed_login_attempts: number;
  first_name: string | null;
  hashed_password: string;
  id: string;
  is_locked: boolean;
  last_name: string | null;
  nickname: string | null;
  phone_number: string | null;
  role: "ADMIN" | "USER";
  security_code: string | null;
  state: string | null;
  subscription_plan: "PREMIUM" | "BASIC" | "FREE";
  updated_at: string;
  verification_token: string | null;
  zip_code: string | null
} */}

// Edit form data interface
interface EditFormData {
  nickname: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN';
}

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, user, logout, accessToken } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isGuestsLoading, setIsGuestsLoading] = useState(true);
  const [isGuestDetailsDialogOpen, setIsGuestDetailsDialogOpen] = useState(false);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<AdminUser | null>(null);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nickname: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'USER'
  });
  const [originalFormData, setOriginalFormData] = useState<EditFormData>({
    nickname: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'USER'
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    nickname: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'USER'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await axios.get(`${API_URL}/auth/users`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (response.status === 200) {
          console.log('Users fetched successfully:', response.data);
          setUsers(response.data);
          setSuccessMessage('Users fetched successfully.');
        } else {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
      } catch (err: unknown) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && accessToken) {
      fetchUsers();
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000); // 4 seconds, adjust as needed
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load active tab from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('adminActiveTab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminActiveTab', activeTab);
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle user edit
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    const formData = {
      nickname: user.nickname,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    };
    setEditFormData(formData);
    setOriginalFormData(formData);
    setIsEditDialogOpen(true);
  };

  // Handle user delete confirmation
  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value as string
    });
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddFormData({
      ...addFormData,
      [name]: value
    });
  };

  const handleAddUser = async () => {
    setIsAddingUser(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, addFormData, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 201 || response.status === 200) {
        setSuccessMessage('User added successfully.');
        setIsAddDialogOpen(false);
        setAddFormData({
          nickname: '',
          email: '',
          first_name: '',
          last_name: '',
          password: '',
          role: 'USER'
        });
        // Optionally, refresh users list
        setUsers(prev => [...prev, response.data]);
      } else {
        throw new Error('Failed to add user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  

  // Save edited user using the admin endpoint
  const saveUserChanges = async () => {
    if (!selectedUser || !accessToken) return;
    
    setIsUpdatingUser(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Create a payload with only the changed fields
      const changedFields: Partial<EditFormData> = {};
      
      // Compare each field with original value and only include if changed
      if (editFormData.nickname !== originalFormData.nickname) {
        changedFields.nickname = editFormData.nickname;
      }
      
      if (editFormData.email !== originalFormData.email) {
        changedFields.email = editFormData.email;
      }
      
      if (editFormData.first_name !== originalFormData.first_name) {
        changedFields.first_name = editFormData.first_name;
      }
      
      if (editFormData.last_name !== originalFormData.last_name) {
        changedFields.last_name = editFormData.last_name;
      }
      
      if (editFormData.role !== originalFormData.role) {
        changedFields.role = editFormData.role;
      }
      
      // If no fields were changed, just close the dialog
      if (Object.keys(changedFields).length === 0) {
        setIsEditDialogOpen(false);
        setIsUpdatingUser(false);
        return;
      }
      
      console.log('Updating user with changed fields only:', changedFields);
      
      // Check if token is available and log its first few characters for debugging
      if (!accessToken) {
        throw new Error('No authentication token available');
      }
      
      console.log('Using token (first 10 chars):', accessToken.substring(0, 10) + '...');
      console.log('API endpoint:', `${API_URL}/auth/admin/users/${selectedUser.id}`);
      
      // Call the admin API endpoint to update user
      const response = await axios.put(
        `${API_URL}/auth/admin/users/${selectedUser.id}`, 
        changedFields,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        // Update local state with the updated user
        const updatedUsers = users.map(u => 
          u.id === selectedUser.id ? { 
            ...u, 
            ...changedFields, // Only update the changed fields
            email_verified: u.email_verified // Preserve verification status
          } : u
        );
        setUsers(updatedUsers);
        
        // Show success message
        console.log('User updated successfully:', response.data);
        setSuccessMessage(`User ${selectedUser.nickname} has been successfully updated.`);
        
        // Close the dialog after a short delay
        setTimeout(() => {
          setIsEditDialogOpen(false);
          setSuccessMessage(null);
        }, 1500);
      } else {
        throw new Error(`Failed to update user: ${response.status}`);
      }
    } catch (err: unknown) {
      console.error('Error updating user:', err);
      // Log detailed error information
      if (axios.isAxiosError(err)) {
        console.error('Error response:', {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        });
        
        if (err.response?.status === 401) {
          setError('Authentication failed. Your admin token may be invalid or expired. Please log out and log back in.');
        } else {
          setError(`Failed to update user: ${err.response?.status} ${err.response?.statusText}`);
        }
      } else {
        setError(`Failed to update user: ${(err as Error).message}`);
      }
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Filter guests based on search term (by ID)
  const filteredGuests = guests.filter(guest => 
    guest.id.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.name?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.company?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.contact_info?.toLowerCase().includes(guestSearchTerm.toLowerCase())
  );

  // Fetch guests from API
  useEffect(() => {
    const fetchGuests = async () => {
      if (!isAuthenticated || !accessToken) {
        return;
      }

      setIsGuestsLoading(true);
      setGuestError(null);
      setSuccessMessage(null);

      try {
        console.log('Attempting to fetch guests from:', `${API_URL}/guests`);
        const response = await axios.get(`${API_URL}/guests`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.status === 200) {
          console.log('Guests fetched successfully:', response.data);
          setGuests(response.data);
          setSuccessMessage('Guests fetched successfully.');
        } else {
          throw new Error(`Failed to fetch guests: ${response.status}`);
        }
      } catch (err: unknown) {
        console.error('Error fetching guests:', err);
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: err.config
          });
        }
        setGuestError('Failed to load guests. Please try again later.');
      } finally {
        setIsGuestsLoading(false);
      }
    };

    if (isAuthenticated && accessToken) {
      fetchGuests();
    }
  }, [isAuthenticated, accessToken]);

  return (
    <PageContainer 
      title="Admin Dashboard" 
      subtitle="Manage your TheoForge platform"
    >
      <div className="max-w-7xl mx-auto mt-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">
              <Users className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="guests">
              <UserX className="h-4 w-4 mr-2" />
              Guest Management
            </TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboardStats />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            {/* Users table here */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                className="ml-4"
                leftIcon={<UserPlus className="mr-2 h-4 w-4" />}
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add New User
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{user.nickname}</div>
                              <div className="text-xs text-gray-500">{user.first_name} {user.last_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.email_verified ? (
                              <UserCheck className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedViewUser(user);
                                  setIsUserDetailsDialogOpen(true);
                                }}
                                aria-label="View"
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No users found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="guests" className="space-y-6">
            {/* Guests table here */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search guests by name, email, or company..."
                  className="pl-10"
                  value={guestSearchTerm}
                  onChange={(e) => setGuestSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="ml-4 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                <span className="text-sm font-medium">Total Guests: </span>
                <span className="text-sm font-bold">{guests.length}</span>
              </div>
            </div>
            
            {guestError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{guestError}</p>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {isGuestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading guest data...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">
                            {guest.name ? (
                              <div>
                                <div>{guest.name}</div>
                                <div className="text-xs text-gray-500">ID: {guest.id.substring(0, 8)}...</div>
                              </div>
                            ) : (
                              <div className="font-mono text-xs">{guest.id.substring(0, 12)}...</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {guest.contact_info || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {guest.company ? (
                              <div>
                                <div>{guest.company}</div>
                                {guest.industry && (
                                  <div className="text-xs text-gray-500">{guest.industry}</div>
                                )}
                              </div>
                            ) : (
                              'Unknown'
                            )}
                          </TableCell>
                          <TableCell>
                            {guest.project_type ? (
                              <div>
                                <div>{guest.project_type.join(', ')}</div>
                                {guest.budget && (
                                  <div className="text-xs text-gray-500">Budget: {guest.budget}</div>
                                )}
                              </div>
                            ) : (
                              'Unknown'
                            )}
                          </TableCell>
                          <TableCell>
                            {guest.status ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                guest.status === 'NEW' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                  : guest.status === 'QUALIFIED' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {guest.status}
                              </span>
                            ) : (
                              'Unknown'
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(guest.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGuest(guest);
                                setIsGuestDetailsDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No guests found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {/* Guest Stats Summary */}
            {guests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium mb-2">Recent Leads</h3>
                  <p className="text-3xl font-bold">
                    {guests.filter(g => {
                      const date = new Date(g.created_at);
                      const now = new Date();
                      return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // Last week
                    }).length}
                  </p>
                  <p className="text-sm text-gray-500">in the last 7 days</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium mb-2">Popular Projects</h3>
                  <div className="mt-2">
                    {(() => {
                      // Calculate most common project types
                      const projectCounts: Record<string, number> = {};
                      guests.forEach(guest => {
                        if (guest.project_type && guest.project_type.length > 0) {
                          guest.project_type.forEach(type => {
                            projectCounts[type] = (projectCounts[type] || 0) + 1;
                          });
                        }
                      });
                      
                      // Sort by count and get top 3
                      return Object.entries(projectCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([range, count], index) => (
                          <div key={index} className="flex justify-between items-center mb-1">
                            <span>{range}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium mb-2">Budget Range</h3>
                  <div className="mt-2">
                    {(() => {
                      // Calculate budget distribution
                      const budgetRanges: Record<string, number> = {
                        'Under $10K': 0,
                        '$10K - $50K': 0,
                        '$50K - $100K': 0,
                        '$100K+': 0,
                        'Unknown': 0
                      };
                      
                      guests.forEach(guest => {
                        if (!guest.budget) {
                          budgetRanges['Unknown']++;
                        } else if (guest.budget.includes('10,000')) {
                          budgetRanges['$10K - $50K']++;
                        } else if (guest.budget.includes('50,000')) {
                          budgetRanges['$50K - $100K']++;
                        } else if (guest.budget.includes('100,000')) {
                          budgetRanges['$100K+']++;
                        } else {
                          budgetRanges['Under $10K']++;
                        }
                      });
                      
                      return Object.entries(budgetRanges)
                        .filter(([, count]) => count > 0)
                        .map(([range, count], index) => (
                          <div key={index} className="flex justify-between items-center mb-1">
                            <span>{range}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user information below.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              <div className="flex">
                <UserCheck className="h-5 w-5 mr-2" />
                <p>{successMessage}</p>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={editFormData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                Nickname
              </Label>
              <Input
                id="nickname"
                name="nickname"
                value={editFormData.nickname}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                First Name
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={editFormData.first_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={editFormData.last_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={editFormData.role}
                onChange={handleInputChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveUserChanges}
              disabled={isUpdatingUser}
            >
              {isUpdatingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new user.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <Input
              name="nickname"
              placeholder="Nickname"
              value={addFormData.nickname}
              onChange={handleAddInputChange}
            />
            <Input
              name="email"
              placeholder="Email"
              type="email"
              value={addFormData.email}
              onChange={handleAddInputChange}
            />
            <Input
              name="first_name"
              placeholder="First Name"
              value={addFormData.first_name}
              onChange={handleAddInputChange}
            />
            <Input
              name="last_name"
              placeholder="Last Name"
              value={addFormData.last_name}
              onChange={handleAddInputChange}
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              value={addFormData.password}
              onChange={handleAddInputChange}
            />
            <select
              name="role"
              className="border rounded px-3 py-2"
              value={addFormData.role}
              onChange={handleAddInputChange}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <Button
            onClick={handleAddUser}
            disabled={isAddingUser}
            className="w-full"
          >
            {isAddingUser ? 'Adding...' : 'Add User'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Guest Details Dialog */}
      <Dialog open={isGuestDetailsDialogOpen} onOpenChange={setIsGuestDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Guest Details</DialogTitle>
            <DialogDescription>
              Detailed information about this guest.
            </DialogDescription>
          </DialogHeader>
          {selectedGuest ? (
            <div className="grid gap-4 py-2 overflow-y-auto max-h-[55vh] pr-2">
              <div>
                <span className="font-semibold">ID:</span>
                <span className="ml-2 font-mono text-xs">{selectedGuest.id}</span>
              </div>
              <div>
                <span className="font-semibold">Name:</span>
                <span className="ml-2">{selectedGuest.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Contact Info:</span>
                <span className="ml-2">{selectedGuest.contact_info || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Company:</span>
                <span className="ml-2">{selectedGuest.company || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Industry:</span>
                <span className="ml-2">{selectedGuest.industry || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Project Type:</span>
                <span className="ml-2">{selectedGuest.project_type?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Budget:</span>
                <span className="ml-2">{selectedGuest.budget || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Timeline:</span>
                <span className="ml-2">{selectedGuest.timeline || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Pain Points:</span>
                <span className="ml-2">{selectedGuest.pain_points?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Current Tech:</span>
                <span className="ml-2">{selectedGuest.current_tech?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <span className="ml-2">{selectedGuest.status || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Created At:</span>
                <span className="ml-2">{formatDate(selectedGuest.created_at)}</span>
              </div>
              <div>
                <span className="font-semibold">Updated At:</span>
                <span className="ml-2">{formatDate(selectedGuest.updated_at)}</span>
              </div>
              <div>
                <span className="font-semibold">Additional Notes:</span>
                <span className="ml-2">{selectedGuest.additional_notes || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No guest selected.</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGuestDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsDialogOpen} onOpenChange={setIsUserDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          {selectedViewUser ? (
            <div className="grid gap-4 py-2 overflow-y-auto max-h-[55vh] pr-2">
              <div>
                <span className="font-semibold">ID:</span>
                <span className="ml-2 font-mono text-xs">{selectedViewUser.id}</span>
              </div>
              <div>
                <span className="font-semibold">Email:</span>
                <span className="ml-2">{selectedViewUser.email}</span>
              </div>
              <div>
                <span className="font-semibold">Nickname:</span>
                <span className="ml-2">{selectedViewUser.nickname || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">First Name:</span>
                <span className="ml-2">{selectedViewUser.first_name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Last Name:</span>
                <span className="ml-2">{selectedViewUser.last_name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Role:</span>
                <span className="ml-2">{selectedViewUser.role}</span>
              </div>
              <div>
                <span className="font-semibold">Email Verified:</span>
                <span className="ml-2">{selectedViewUser.email_verified ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="font-semibold">Created At:</span>
                <span className="ml-2">{formatDate(selectedViewUser.created_at)}</span>
              </div>
              <div>
                <span className="font-semibold">Updated At:</span>
                <span className="ml-2">{formatDate(selectedViewUser.updated_at)}</span>
              </div>
              <div>
                <span className="font-semibold">Subscription Plan:</span>
                <span className="ml-2">{selectedViewUser.subscription_plan}</span>
              </div>
              <div>
                <span className="font-semibold">Phone Number:</span>
                <span className="ml-2">{selectedViewUser.phone_number || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Address:</span>
                <span className="ml-2">{selectedViewUser.address || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">City:</span>
                <span className="ml-2">{selectedViewUser.city || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">State:</span>
                <span className="ml-2">{selectedViewUser.state || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Zip Code:</span>
                <span className="ml-2">{selectedViewUser.zip_code || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No user selected.</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          
          <TabsContent value="settings">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Site Settings</h2>
              <p className="text-gray-500">Site settings management coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
              <p className="text-gray-500">Analytics dashboard coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

export default AdminDashboard
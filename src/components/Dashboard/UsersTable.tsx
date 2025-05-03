/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, Eye, Loader2, Search, UserCheck, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState } from 'react';
import { API_URL, AuthContext } from './AppContext';
import axios from 'axios';

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
}

const UsersTable: React.FC = () => {
  const { accessToken, register } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    nickname: '',
    email: '',
    first_name: '',
    last_name: '',
    password: ''
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  
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
  
  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000); // 4 seconds, adjust as needed
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter users based on search term
  const filteredUsers: User[] = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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
      const response = await register(
        addFormData.email,
        addFormData.password,
        addFormData.first_name,
        addFormData.last_name,
        addFormData.nickname
      );
      if (response === "OK") {
        setSuccessMessage('User added successfully.');
        setIsAddDialogOpen(false);
        setAddFormData({
          nickname: '',
          email: '',
          first_name: '',
          last_name: '',
          password: ''
        });
        // Optionally, refresh users list
        fetchUsers();
      } else {
        setError(response);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };
  
  return (
    <div>
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
      
      {/* View User Dialog */}
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
    </div>
  )
}

export default UsersTable;
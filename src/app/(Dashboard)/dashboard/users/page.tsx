'use client'

import React, { useState, useEffect, useContext } from 'react';
import { ArrowPathIcon, EyeIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  IconButton,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { API_URL } from '@/utils/axiosConfig'
import { AuthContext } from '@/components/Dashboard/AppContext';

interface User {
  email: string;
  nickname?: string;
  first_name?: string;
  last_name?: string;
  role: "ADMIN" | "USER";
  id: number;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface UserForm {
  token?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  nickname?: string;
  password?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string; 
  card_number?: string;
  ccv?: string;
  security_code?: string;
  subscription_plan?: "PREMIUM" | "BASIC" | "FREE";
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UserForm>({});
  const [createFormData, setCreateFormData] = useState<UserForm>({});
  const [showError, setShowError] = useState(false);
  const { register } = useContext(AuthContext);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/auth/users`); // URL as per backend configuration
      if(!(Array.isArray(response.data) && response.data.every(user => typeof user === 'object'))) {
        setShowError(true);
        throw Error //Ensure an array of users is returned
      } else setShowError(false);
      setUsers(response.data); // Assuming the API returns a list of users
    } catch {
      setShowError(true);
    }
    setLoading(false);
  };
  
  const handleEdit = async(user: User) => {
    setSelectedUser(user);
    setEditFormData(user);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const viewField = (field: string | boolean, value: string | undefined) => {
      return (
        <div className="inline-flex flex-row gap-2 w-full">
          <Typography variant="small" color="blue-gray" className="font-normal w-24">
            {field}
          </Typography>
          <Card className={value ? value.length > 0 ? "overscroll-x-contain overflow-auto border-black border-2 h-min w-full" :
          "overscroll-x-contain overflow-auto border-black border-2 w-full" :
          "overscroll-x-contain overflow-auto w-full"}>
            <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto p-2">
              {value ? value : ''}
            </Typography>
          </Card>
        </div>
      )
    }

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }

  const Authorize = async(): Promise<boolean> => {
    let result = true;
    await axios.get(`${API_URL}/auth/auth`, {
      headers: { 'Authorization' : `Bearer ${editFormData.token}` },
    }).catch((err) => {
      console.log(err);
      if (err.response && err.response.data && err.response.data.detail) {
        window.alert('Invalid token');
      }
      result = false;
    });
    return result;
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editFormData) return;
    try{
      let alert = '';
      if(!await Authorize()) return;
      // Validate fields
      if(!editFormData.email || !editFormData.password) {
        window.alert('Please fill out all required fields');
        return;
      }
      if(!/^[\w-.]{1,64}@([\w-]{1,63}\.)+[\w-]{2,63}$/.test(editFormData.email)) alert = 'Invalid email';
      else if(editFormData.nickname && !/^[a-zA-Z0-9]*$/.test(editFormData.nickname)) alert = 'Nickname may not include special characters';
      else if(editFormData.password.length < 8) alert = 'Password must be at least 8 characters';
      else if(!/[A-Z]/.test(editFormData.password)) alert = 'Password must contain at least 1 uppercase character';
      else if(!/[a-z]/.test(editFormData.password)) alert = 'Password must contain at least 1 lowercase character';
      else if(!/[0-9]/.test(editFormData.password)) alert = 'Password must contain at least 1 number';
      else if(!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(editFormData.password)) alert = 'Password must contain at least 1 special character';
      else if (editFormData.first_name && editFormData.first_name.length > 100) alert = 'First name must not be more than 100 characters';
      else if (editFormData.last_name && editFormData.last_name.length > 100) alert = 'Last name must not be more than 100 characters';
      else if (editFormData.nickname && editFormData.nickname.length > 50) alert = 'Nickname must not be more than 50 characters';
      // Prevent sql injection by invalidating " and \
      else if (/["\\]/.test(editFormData.email.concat(
        editFormData.first_name ? editFormData.first_name : '',
        editFormData.last_name ? editFormData.last_name : '',
        editFormData.nickname ? editFormData.nickname : '',
        editFormData.password
      ))) alert = 'Invalid character " or \\ used';
      if (alert !== '') {
        window.alert(alert);
        return;
      }
      // Call backend API
      await axios.put(`${API_URL}/auth/update`, 
        {
          "first_name": editFormData.first_name,
          "last_name": editFormData.last_name,
          "email": editFormData.email,
          "nickname": editFormData.nickname,
          "password": editFormData.password
        },
        {
          headers: { 'Authorization' : `Bearer ${editFormData.token}` }
        }
      );
      
      // Make sure user credentials updated and get new access token
      const params = new URLSearchParams();
      params.append('username', editFormData.email);
      params.append('password', editFormData.password);
      const res = await axios.post(`${API_URL}/auth/login`, params);
      if(!res.data || !res.data.access_token) {
        window.alert('Failed to update profile');
        return;
      }
      
      await axios.put(`${API_URL}/auth/update-profile`, 
        {
          "phone_number": editFormData.phone_number,
          "address": editFormData.address,
          "city": editFormData.city,
          "state": editFormData.state,
          "zip_code": editFormData.zip_code,
          "card_number": editFormData.card_number,
          "ccv": editFormData.ccv,
          "security_code": editFormData.security_code,
          "subscription_plan": editFormData.subscription_plan
        },
        {
          headers: { 'Authorization' : `Bearer ${res.data.access_token}` }
        }
      );
      // Update users
      fetchUsers();
      
      setIsEditModalOpen(false);
      setEditFormData({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if(error.response && error.response.data && error.response.data.detail) {
        window.alert(error.response.data.detail);
      }
      console.error('Error updating user:', error);
      // Handle error (show error message to user)
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      if(!await Authorize()) return;
      await axios.delete(`${API_URL}/auth/delete`, {
        headers: {'Authorization' : `Bearer ${editFormData.token}`},
      });
      
      // Update guests
      fetchUsers();
      
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Handle error (show error message to user)
    }
  };

  const handleCreateSubmit = async () => {
    if (!createFormData) return;

    try {
      if(!createFormData.email || !createFormData.password) {
        window.alert('Please fill out all required fields');
        return;
      }
      const res = await register(createFormData.email, createFormData.password,
        createFormData.first_name ? createFormData.first_name : undefined,
        createFormData.last_name ? createFormData.last_name : undefined,
        createFormData.nickname ? createFormData.nickname : undefined);
      if (res !== 'OK') window.alert(res);

      // Update users
      fetchUsers()
      
      setIsCreateModalOpen(false);
      setCreateFormData({});
    } catch (error) {
      console.error('Error creating user:', error);
      // Handle error (show error message to user)
    }
  };

  const filteredUsers = users.filter(user =>
    searchTerm.toLowerCase() === '' ? true :
    (user.nickname ? user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (user.first_name ? user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (user.last_name ? user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (user.role ? user.role.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  //This I think should be changed to the api call key's such as email, nickname, etc..
  const TABLE_HEAD = ["Nick Name", "Email", "First Name", "Last Name", "Role", "Actions"];
  
  if(showError) return (
  <Alert
    color="red"
    variant="outlined"
    className="mb-6 border border-red-200"
    icon={
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    }
  >
    Failed to retrieve users
  </Alert>
  )
  return (
    <Card className="border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div>
          <Typography variant="h5" color="blue-gray">
            User Management
          </Typography>
          <Typography variant="small" color="gray">
            View and manage user accounts in your system
          </Typography>
        </div>
        <Button 
          color="teal" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleCreate()}
        >
          <PencilIcon className="h-4 w-4" /> Add User
        </Button>
      </div> 
    

    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-8 mb-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Users list
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See information about all users
            </Typography>
          </div>
          <div className="flex shrink-0 gap-2 sm:flex-row">
            <div>
              <IconButton
                onClick={fetchUsers}
                variant="text"
                color="teal"
                className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                size="sm"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  <Typography variant="small" color="blue-gray" className="animate-pulse">
                    Loading...
                  </Typography>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => {
                const isLast = index === paginatedUsers.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={user.id}>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {user.nickname ? user.nickname : ''}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {user.email}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {user.first_name ? user.first_name : ''}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {user.last_name ? user.last_name : ''}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {user.role}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <div className="flex gap-2">
                        <IconButton
                          variant="text"
                          color="teal"
                          onClick={() => handleEdit( user )}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        
                        <IconButton
                          variant="text"
                          color="teal"
                          onClick={() => handleView(user)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>

                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => handleDelete(user)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardBody>
      <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Page {currentPage} of {totalPages}
        </Typography>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>


      {/* View Modal */}
            <Dialog
              size="lg"
              open={isViewModalOpen}
              handler={() => setIsViewModalOpen(false)}
            >
              <DialogHeader className="pb-0">View User</DialogHeader>
              <DialogBody>
                <div>{/*Fix jest detecting no children in DialogBody error*/}</div>
                {selectedUser && (
                  <div className="grid grid-cols-3 grid-flow-row gap-2 overscroll-y-contain overflow-auto h-96 w-full">
                    {viewField('Id:', String(selectedUser.id))}
                    {viewField('Nickname:', selectedUser.nickname)}
                    {viewField('First Name:', selectedUser.first_name)}
                    {viewField('Last Name:', selectedUser.last_name)}
                    {viewField('Email:', selectedUser.email)}
                    {viewField('Email Verified:', selectedUser.email_verified ? "true" : "false")}
                    {viewField('Created At:', selectedUser.created_at)}
                    {viewField('Updated At:', selectedUser.updated_at)}
                    {viewField('Role:', selectedUser.role)}
                  </div>
                )}
              </DialogBody>
              <DialogFooter className="space-x-2">
                <Button variant="outlined" color="blue-gray" onClick={() => setIsViewModalOpen(false)}>
                  Exit
                </Button>
              </DialogFooter>
            </Dialog>

      {/* Edit Modal */}
      <Dialog
        size="md"
        open={isEditModalOpen}
        handler={() => setIsEditModalOpen(false)}
      >
        <DialogHeader>Edit User</DialogHeader>
        <DialogBody>
          <div className="grid gap-6 overscroll-y-contain overflow-auto h-96">
            <Input
              label="Access Token"
              value={editFormData.token ? editFormData.token : ''}
              onChange={(e) => setEditFormData({ ...editFormData, token: e.target.value })}
              crossOrigin={undefined}
              required
            />
            <Input
              label="Nick Name"
              value={editFormData.nickname ? editFormData.nickname : ''}
              onChange={(e) => setEditFormData({ ...editFormData, nickname: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="First Name"
              value={editFormData.first_name ? editFormData.first_name : ''}
              onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Last Name"
              value={editFormData.last_name ? editFormData.last_name : ''}
              onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Email"
              value={editFormData.email ? editFormData.email : ''}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              crossOrigin={undefined}
              required
            />
            <Input
              label="Password"
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              crossOrigin={undefined}
              required
            />
            <Input
              label="Phone Number"
              onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Address"
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="City"
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="State"
              onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Zip Code"
              onChange={(e) => setEditFormData({ ...editFormData, zip_code: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Card Number"
              onChange={(e) => setEditFormData({ ...editFormData, card_number: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="CCV"
              onChange={(e) => setEditFormData({ ...editFormData, ccv: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Security Code"
              onChange={(e) => setEditFormData({ ...editFormData, security_code: e.target.value })}
              crossOrigin={undefined}
            />
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Subscription Plan
              </Typography>
              <select
                value={editFormData.subscription_plan}
                onChange={(e) => setEditFormData({ ...editFormData, subscription_plan: e.target.value as 'PREMIUM' | 'BASIC' | 'FREE' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="PREMIUM">Premium</option>
                <option value="BASIC">Basic</option>
                <option value="FREE">Free</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="red" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleEditSubmit}>
            Save Changes
          </Button>
          
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        size="xs"
        open={isDeleteModalOpen}
        handler={() => setIsDeleteModalOpen(false)}
      >
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete {selectedUser?.nickname}? This action cannot be undone.
          {editFormData.token ? (
            <Input
              label="Access Token"
              value={editFormData.token}
              onChange={(e) => setEditFormData({ ...editFormData, token: e.target.value })}
              crossOrigin={undefined}
              required
            />
          ) : (
            <Input
              label="Access Token"
              value=""
              onChange={(e) => setEditFormData({ ...editFormData, token: e.target.value })}
              crossOrigin={undefined}
              required
            />
          )}
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="blue-gray" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Create Modal */}
      <Dialog
        size="md"
        open={isCreateModalOpen}
        handler={() => setIsCreateModalOpen(false)}
      >
        <DialogHeader>Create User</DialogHeader>

        <DialogBody>
          <div className="grid gap-6 overscroll-y-contain overflow-auto h-96">
            <Input
              label="Nick Name"
              value={createFormData.nickname ? createFormData.nickname : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, nickname: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Email"
              value={createFormData.email ? createFormData.email : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              crossOrigin={undefined}
              required
            />
            <Input
              label="Password"
              value={createFormData.password ? createFormData.password : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              crossOrigin={undefined}
              required
            />
            <Input
              label="First Name"
              value={createFormData.first_name ? createFormData.first_name : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, first_name: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Last Name"
              value={createFormData.last_name ? createFormData.last_name : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, last_name: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
        </DialogBody>

        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="red" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleCreateSubmit}>
            Create
          </Button>
        </DialogFooter>
      </Dialog> 
      </Card>
     </Card>
  );
}

export default UsersTable;
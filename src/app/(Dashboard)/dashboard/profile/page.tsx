'use client'

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  UserCircleIcon,
  UserIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert
} from "@material-tailwind/react";
import { API_URL } from '@/utils/axiosConfig';
import axios from 'axios';
import { AuthContext } from '@/components/Dashboard/AppContext';

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
interface AccountInfo {
  nickname: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string; 
}
interface ProfileInfo {
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string; 
  card_number: string;
  ccv: string;
  security_code: string;
  subscription_plan: "PREMIUM" | "BASIC" | "FREE";
}

interface AdditionalInfo {
  email_verified: boolean;
  failed_login_attempts: number;
  hashed_password: string;
  id: string;
  is_locked: boolean;
  role: "USER" | "ADMIN";
  updated_at: string;
  created_at: string;
  verification_token: string;
}

const ProfileSettings: React.FC = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    email: 'Email',
    nickname: 'Name',
    first_name: 'First Name',
    last_name: 'Last Name',
    password: ''
  });
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '', 
    card_number: '',
    ccv: '',
    security_code: '',
    subscription_plan: "FREE"
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({
    email_verified: false,
    failed_login_attempts: 0,
    hashed_password: '',
    id: '',
    is_locked: false,
    role: "USER",
    updated_at: '',
    created_at: '',
    verification_token: ''
  });
  
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [avatarOwner, setAvatarOwner] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, role, login } = useContext(AuthContext);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/auth/auth`, {
        headers: { 'Authorization' : `Bearer ${accessToken}` },
      });
      const user: User = response.data.username;
      if(user) {
        const localAvatarUrl = localStorage.getItem('Avatar:'+user.email);
        if(localAvatarUrl) setAvatar(localAvatarUrl);
        setAvatarOwner(user.email);
        setShowAlert({ show: false, message: "", type: "success" });
        setAccountInfo({
          email: user.email,
          nickname: user.nickname ? user.nickname : '',
          first_name: user.first_name ? user.first_name : '',
          last_name: user.last_name ? user.last_name : '',
          password: ''
        });
        setProfileInfo({
          phone_number: user.phone_number ? user.phone_number : '',
          address: user.address ? user.address : '',
          city: user.city ? user.city : '',
          state: user.state ? user.state : '',
          zip_code: user.zip_code ? user.zip_code : '', 
          card_number: user.card_number ? user.card_number : '',
          ccv: user.ccv ? user.ccv : '',
          security_code: user.security_code ? user.security_code : '',
          subscription_plan: user.subscription_plan
        })
        setAdditionalInfo({
          email_verified: user.email_verified,
          failed_login_attempts: user.failed_login_attempts,
          hashed_password: user.hashed_password,
          id: user.id ? user.id : '',
          is_locked: user.is_locked,
          role: user.role,
          updated_at: user.updated_at,
          created_at: user.created_at,
          verification_token: user.verification_token ? user.verification_token : ''
        })
      } else setShowAlert({ show: true, message: "User not found", type: "error" });
    } catch {
      setShowAlert({ show: true, message: "User not found", type: "error" });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadUser();
  }, []);

  // Handle account edit mode toggle
  const toggleAccountEditMode = () => {
    if (isEditingAccount) {
      // Save changes
      saveAccountChanges();
    }
    setIsEditingAccount(!isEditingAccount);
  };
  
  // Handle profile edit mode toggle
  const toggleProfileEditMode = () => {
    if (isEditingProfile) {
      // Save changes
      saveProfileChanges();
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const saveAccountChanges = async () => {
    setIsLoading(true);
    // Send the update to the API
    try {
      let alert = ''
      // Validate field
      if(!accountInfo.email || !accountInfo.password) {
        showErrorAlert('Please fill out all fields');
        return;
      }
      if(!/^[\w-.]{1,64}@([\w-]{1,63}\.)+[\w-]{2,63}$/.test(accountInfo.email)) alert = 'Invalid email';
      else if(accountInfo.nickname && !/^[a-zA-Z0-9]*$/.test(accountInfo.nickname)) alert = 'Nickname may not include special characters';
      else if(accountInfo.password.length < 8) alert = 'Password must be at least 8 characters';
      else if(!/[A-Z]/.test(accountInfo.password)) alert = 'Password must contain at least 1 uppercase character';
      else if(!/[a-z]/.test(accountInfo.password)) alert = 'Password must contain at least 1 lowercase character';
      else if(!/[0-9]/.test(accountInfo.password)) alert = 'Password must contain at least 1 number';
      else if(!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(accountInfo.password)) alert = 'Password must contain at least 1 special character';
      else if (accountInfo.first_name && accountInfo.first_name.length > 100) alert = 'First name must not be more than 100 characters';
      else if (accountInfo.last_name && accountInfo.last_name.length > 100) alert = 'Last name must not be more than 100 characters';
      else if (accountInfo.nickname && accountInfo.nickname.length > 50) alert = 'Nickname must not be more than 50 characters';
      // Prevent sql injection by invalidating " and \
      else if (/["\\]/.test(accountInfo.email.concat(
        accountInfo.first_name ? accountInfo.first_name : '',
        accountInfo.last_name ? accountInfo.last_name : '',
        accountInfo.nickname ? accountInfo.nickname : '',
        accountInfo.password
      ))) alert = 'Invalid character " or \\ used';
      if (alert !== '') {
        showErrorAlert(alert);
        return;
      }
      // Call backend API
      await axios.put(`${API_URL}/auth/update`, 
        {
          "first_name": accountInfo.first_name,
          "last_name": accountInfo.last_name,
          "email": accountInfo.email,
          "nickname": accountInfo.nickname,
          "password": accountInfo.password
        },
        {
          headers: { 'Authorization' : `Bearer ${accessToken}` }
        }
      );
      
      // Login to update access token
      const response = await login(accountInfo.email, accountInfo.password);
      if (response !== 'OK') {
        showErrorAlert(response);
        return;
      }
      
      // Update local storage avatar owner
      const prevAvatar = localStorage.getItem('Avatar:'+avatarOwner);
      if (prevAvatar) {
        localStorage.setItem('Avatar:'+accountInfo.email, prevAvatar);
        localStorage.removeItem('Avatar:'+avatarOwner);
        setAvatarOwner(accountInfo.email);
      }
      showSuccessAlert("Account information updated successfully!");
      // Tell dashboard to update profile
      dispatchEvent(new CustomEvent('profileChange', {detail: accountInfo}));
    } catch (error: any) {
      if(error.response && error.response.data && error.response.data.detail) {
        if(error.response.data.detail === 'Invalid token'){
          showErrorAlert('Authentication expired. Please log back in');
        } else showErrorAlert(error.response.data.detail);
      }
      console.error('Error updating account settings:', error);
      // Handle error (show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfileChanges = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/auth/update-profile`, 
        {
          "phone_number": profileInfo.phone_number,
          "address": profileInfo.address,
          "city": profileInfo.city,
          "state": profileInfo.state,
          "zip_code": profileInfo.zip_code,
          "card_number": profileInfo.card_number,
          "ccv": profileInfo.ccv,
          "security_code": profileInfo.security_code,
          "subscription_plan": profileInfo.subscription_plan
        },
        {
          headers: { 'Authorization' : `Bearer ${accessToken}` }
        }
      );
      showSuccessAlert("Profile information updated successfully!");
    } catch (error: any) {
      if(error.response && error.response.data && error.response.data.detail) {
        if(error.response.data.detail === 'Invalid token'){
          showErrorAlert('Authentication expired. Please log back in');
        } else showErrorAlert(error.response.data.detail);
      }
      console.error('Error updating profile settings:', error);
      // Handle error (show error message to user)
    } finally {
      setIsLoading(false);
    }
  }
  
  // Cancel account edit mode
  const cancelAccountEdit = () => {
    // Reset fields
    loadUser();
    setIsEditingAccount(false);
  };
  
  // Cancel profile mode
  const cancelProfileEdit = () => {
    // Reset fields
    loadUser();
    setIsEditingProfile(false);
  };

  // Show success alert
  const showSuccessAlert = (message: string) => {
    setShowAlert({
      show: true,
      message,
      type: "success"
    });
    
    setTimeout(() => {
      setShowAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Show error alert
  const showErrorAlert = (message: string) => {
    setShowAlert({
      show: true,
      message,
      type: "error"
    });
    
    setTimeout(() => {
      setShowAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Handle avatar upload via input
  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          setEditAvatar(typeof reader.result === 'string' ?
          reader.result : Buffer.from(reader.result).toString());
        } else setEditAvatar(null);
      });
      if(image) {
        reader.readAsDataURL(image)
      }
      setIsAvatarModalOpen(true);
    }
  };

  // Handle avatar drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const image = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          setEditAvatar(typeof reader.result === 'string' ?
          reader.result : Buffer.from(reader.result).toString());
        } else setEditAvatar(null);
      });
      if(image) {
        reader.readAsDataURL(image)
      }
      setIsAvatarModalOpen(true);
    }
  };

  // Apply new avatar
  const applyNewAvatar = async () => {
    if (editAvatar) {
      setIsLoading(true);
      try {
        // Update the user avatar in localStorage
        localStorage.setItem('Avatar:'+accountInfo.email, editAvatar);
        setAvatar(editAvatar);
        
        // Close the modal and show success message
        setIsAvatarModalOpen(false);
        showSuccessAlert("Profile picture updated successfully!");
      } catch (error) {
        console.error('Error updating avatar:', error);
        showErrorAlert("Failed to update profile picture. Please try again.");
      } finally {
        setIsLoading(false);
        dispatchEvent(new CustomEvent('profileChange', {detail: accountInfo}));
      }
    }
  };

  // Cancel avatar update
  const cancelAvatarUpdate = () => {
    setEditAvatar(null);
    setIsAvatarModalOpen(false);
  };

  return (
    <div>
      <Card className="border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              Account Settings
            </Typography>
            <Typography variant="small" color="gray">
              Manage your credentials
            </Typography>
          </div>
        </div>
        <div className="p-4">
          <div className="w-full">
            {/* Success/Error Alert */}
            {showAlert.show && (
              <Alert
                open={showAlert.show}
                onClose={() => setShowAlert(prev => ({ ...prev, show: false }))}
                animate={{
                  mount: { y: 0 },
                  unmount: { y: -100 },
                }}
                className="fixed top-4 right-4 z-50 max-w-md"
                color={showAlert.type === "success" ? "green" : "red"}
                icon={showAlert.type === "success" ? <CheckIcon className="h-6 w-6" /> : <XMarkIcon className="h-6 w-6" />}
              >
                {showAlert.message}
              </Alert>
            )}

            <Card className="w-full shadow-sm border border-gray-100 mb-6">
              <CardHeader
                floated={false}
                shadow={false}
                className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Avatar
                      src={avatar ? avatar : undefined}
                      alt="Avatar"
                      withBorder={true}
                      className="p-0.5 w-24 h-24"
                      color="teal"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => setIsAvatarModalOpen(true)}
                    >
                      <CameraIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <Typography variant="h4" color="blue-gray">
                      {accountInfo.nickname}
                    </Typography>
                    <Typography color="teal" className="font-medium">
                      {role}
                    </Typography>
                    <Typography color="gray" className="font-normal text-sm">
                      {accountInfo.email}
                    </Typography>
                  </div>
                </div>
                <div>
                  <Button
                    color={isEditingAccount ? "teal" : "blue-gray"}
                    className="flex items-center gap-2"
                    size="sm"
                    onClick={toggleAccountEditMode}
                    disabled={isLoading}
                  >
                    {isEditingAccount ? (
                      <>
                        <CheckIcon className="h-4 w-4" /> Save Changes
                      </>
                    ) : (
                      <>
                        <UserCircleIcon className="h-4 w-4" /> Edit Account
                      </>
                    )}
                  </Button>
                  {isEditingAccount && (
                    <Button
                      color="red"
                      variant="text"
                      className="flex items-center gap-2 mt-2"
                      size="sm"
                      onClick={cancelAccountEdit}
                      disabled={isLoading}
                    >
                      <XMarkIcon className="h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Nickname
                      </Typography>
                      {isEditingAccount ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={accountInfo.nickname}
                            onChange={(e) => setAccountInfo({...accountInfo, nickname: e.target.value})}
                            label="Name"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{accountInfo.nickname}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Email
                      </Typography>
                      {isEditingAccount ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={accountInfo.email}
                            onChange={(e) => setAccountInfo({...accountInfo, email: e.target.value})}
                            label="Email"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{accountInfo.email}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        First Name
                      </Typography>
                      {isEditingAccount ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={accountInfo.first_name}
                            onChange={(e) => setAccountInfo({...accountInfo, first_name: e.target.value})}
                            label="First Name"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{accountInfo.first_name}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Last Name
                      </Typography>
                      {isEditingAccount ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={accountInfo.last_name}
                            onChange={(e) => setAccountInfo({...accountInfo, last_name: e.target.value})}
                            label="Last Name"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{accountInfo.last_name}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Password
                      </Typography>
                      {isEditingAccount ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={accountInfo.password}
                            onChange={(e) => setAccountInfo({...accountInfo, password: e.target.value})}
                            label="Password"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{accountInfo.password}</Typography>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Avatar Upload Modal */}
            <Dialog
              open={isAvatarModalOpen}
              handler={() => setIsAvatarModalOpen(false)}
              size="xs"
            >
              <DialogHeader>Update Profile Picture</DialogHeader>
              <DialogBody divider>
                <div className="flex flex-col items-center">
                  {editAvatar ? (
                    <div className="mb-4">
                      <Avatar
                        src={editAvatar}
                        alt="New profile picture"
                        size="xxl"
                        className="h-40 w-40"
                      />
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer text-center w-full mb-4 ${
                        dragActive ? "border-teal-500 bg-teal-50" : "border-blue-gray-200"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PhotoIcon className="h-12 w-12 text-blue-gray-300 mx-auto mb-4" />
                      <Typography color="blue-gray" className="font-medium mb-1">
                        Drag and drop an image here
                      </Typography>
                      <Typography color="gray" className="text-sm">
                        or <span className="text-teal-500 font-medium">browse</span> to upload
                      </Typography>
                      <Typography color="gray" className="text-xs mt-4">
                        Supported formats: JPEG, PNG, GIF
                      </Typography>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleAvatarInputChange}
                        accept="image/*"
                      />
                    </div>
                  )}
                </div>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="text"
                  color="red"
                  onClick={cancelAvatarUpdate}
                  className="mr-2"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                {editAvatar && (
                  <Button
                    color="teal"
                    onClick={applyNewAvatar}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-teal-500 animate-spin"></span>
                        Processing...
                      </span>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </DialogFooter>
            </Dialog>
          </div>
        </div>
      </Card>
      
      <Card className="border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              Profile Settings
            </Typography>
            <Typography variant="small" color="gray">
              Manage your profile information
            </Typography>
          </div>
        </div>
        <div className="p-4">
          <div className="w-full">
            {/* Success/Error Alert */}
            {showAlert.show && (
              <Alert
                open={showAlert.show}
                onClose={() => setShowAlert(prev => ({ ...prev, show: false }))}
                animate={{
                  mount: { y: 0 },
                  unmount: { y: -100 },
                }}
                className="fixed top-4 right-4 z-50 max-w-md"
                color={showAlert.type === "success" ? "green" : "red"}
                icon={showAlert.type === "success" ? <CheckIcon className="h-6 w-6" /> : <XMarkIcon className="h-6 w-6" />}
              >
                {showAlert.message}
              </Alert>
            )}

            <Card className="w-full shadow-sm border border-gray-100 mb-6">
              <CardHeader
                floated={false}
                shadow={false}
                className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white"
              >
                <div>
                  <Button
                    color={isEditingProfile ? "teal" : "blue-gray"}
                    className="flex items-center gap-2"
                    size="sm"
                    onClick={toggleProfileEditMode}
                    disabled={isLoading}
                  >
                    {isEditingProfile ? (
                      <>
                        <CheckIcon className="h-4 w-4" /> Save Changes
                      </>
                    ) : (
                      <>
                        <UserCircleIcon className="h-4 w-4" /> Edit Profile
                      </>
                    )}
                  </Button>
                  {isEditingProfile && (
                    <Button
                      color="red"
                      variant="text"
                      className="flex items-center gap-2 mt-2"
                      size="sm"
                      onClick={cancelProfileEdit}
                      disabled={isLoading}
                    >
                      <XMarkIcon className="h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Phone Number
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.phone_number}
                            onChange={(e) => setProfileInfo({...profileInfo, phone_number: e.target.value})}
                            label="Phone Number"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.phone_number}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Address
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.address}
                            onChange={(e) => setProfileInfo({...profileInfo, address: e.target.value})}
                            label="Address"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.address}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        City
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.city}
                            onChange={(e) => setProfileInfo({...profileInfo, city: e.target.value})}
                            label="City"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.city}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        State
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.state}
                            onChange={(e) => setProfileInfo({...profileInfo, state: e.target.value})}
                            label="State"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.state}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Zip Code
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.zip_code}
                            onChange={(e) => setProfileInfo({...profileInfo, zip_code: e.target.value})}
                            label="Zip Code"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.zip_code}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Card Number
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.card_number}
                            onChange={(e) => setProfileInfo({...profileInfo, card_number: e.target.value})}
                            label="Card Number"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.card_number}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        CCV
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.ccv}
                            onChange={(e) => setProfileInfo({...profileInfo, ccv: e.target.value})}
                            label="CCV"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.ccv}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Security Code
                      </Typography>
                      {isEditingProfile ? (
                        <Input
                            icon={<UserIcon className="h-5 w-5 text-blue-gray-300" />}
                            value={profileInfo.security_code}
                            onChange={(e) => setProfileInfo({...profileInfo, security_code: e.target.value})}
                            label="Security Code"
                            crossOrigin={undefined}
                        />
                      ) : (
                        <Typography>{profileInfo.security_code}</Typography>
                      )}
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                        Subscription Plan
                      </Typography>
                      {isEditingProfile ? (
                        <select
                        value={profileInfo.subscription_plan}
                        onChange={(e) => setProfileInfo({ ...profileInfo, subscription_plan: e.target.value as 'PREMIUM' | 'BASIC' | 'FREE' })}
                        className="w-full p-2 border rounded-lg"
                      >
                          <option value="PREMIUM">Premium</option>
                          <option value="BASIC">Basic</option>
                          <option value="FREE">Free</option>
                        </select>
                      ) : (
                        <Typography>{profileInfo.phone_number}</Typography>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfileSettings;
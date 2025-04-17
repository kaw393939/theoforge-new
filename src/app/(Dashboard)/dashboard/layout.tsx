'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext, PrivateRoute } from '@/components/Dashboard/AppContext';
import {
  UsersIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon as MenuIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  XMarkIcon,
  CpuChipIcon,
  FolderIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  ListItem,
  ListItemPrefix,
  Drawer,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Navbar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Avatar,
  Switch,
  Badge,
  Textarea,
  Alert,
} from "@material-tailwind/react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/utils/axiosConfig';
import { cn } from '@/lib/utils';
import { colors } from '@material-tailwind/react/types/generic';
import './dashboard.css'

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
  nickname: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

// User navigation - restricted options (no Analytics)
const userNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: ChartBarIcon,
    description: 'Overview of your activity'
  },
  { 
    name: 'Projects', 
    href: '/dashboard/projects', 
    icon: DocumentTextIcon,
    description: 'Manage your projects'
  },
  { 
    name: 'Resources', 
    href: '/dashboard/resources', 
    icon: FolderIcon,
    description: 'Manage files and documents'
  },
  { 
    name: 'Marketplace', 
    href: '/dashboard/marketplace', 
    icon: ShoppingBagIcon,
    description: 'Browse available services'
  },
  { 
    name: 'Knowledge Graph', 
    href: '/dashboard/knowledge', 
    icon: BookOpenIcon,
    description: 'Explore data relationships'
  },
  { 
    name: 'Real-Time Analytics', 
    href: '/dashboard/realtime', 
    icon: CpuChipIcon,
    description: 'Live system metrics'
  }
];

// Admin navigation- full options (includes Analytics)
const adminNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: ChartBarIcon,
    description: 'Overview of your activity'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: ChartBarIcon,
    description: 'View performance metrics'
  },
  { 
    name: 'Projects', 
    href: '/dashboard/projects', 
    icon: DocumentTextIcon,
    description: 'Manage your projects'
  },
  { 
    name: 'Users', 
    href: '/dashboard/users', 
    icon: UsersIcon,
    description: 'Manage system users'
  },
  { 
    name: 'Guests', 
    href: '/dashboard/guests', 
    icon: HomeIcon,
    description: 'View guest accounts'
  },
  { 
    name: 'Resources', 
    href: '/dashboard/resources', 
    icon: FolderIcon,
    description: 'Manage files and documents'
  },
  { 
    name: 'Marketplace', 
    href: '/dashboard/marketplace', 
    icon: ShoppingBagIcon,
    description: 'Browse available services'
  },
  { 
    name: 'Knowledge Graph', 
    href: '/dashboard/knowledge', 
    icon: BookOpenIcon,
    description: 'Explore data relationships'
  },
  { 
    name: 'Real-Time Analytics', 
    href: '/dashboard/realtime', 
    icon: CpuChipIcon,
    description: 'Live system metrics'
  }
];

// Notification structure
interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { role, logout, accessToken } = useContext(AuthContext);
  const navigate = useRouter();
  //const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('/dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  //const [isVisible, setIsVisible] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(role === "ADMIN"); // Default to admin view
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    email: '',
    nickname: null,
    first_name: null,
    last_name: null,
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const loadAccount = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/auth`, {
        headers: { 'Authorization' : `Bearer ${accessToken}` },
      });
      const user: User = response.data.username;
      if(user) {
        const localAvatarUrl = localStorage.getItem('Avatar:'+user.email);
        if(localAvatarUrl) setAvatarUrl(localAvatarUrl);
        setAccountInfo({
          email: user.email,
          nickname: user.nickname,
          first_name: user.first_name,
          last_name: user.last_name
        });
      } else console.error("User not found");
    } catch {
      console.error("User not found");
    }
  }

  useEffect(() => {
    loadAccount();
    addEventListener('profileChange', function(event: any) {
      setAccountInfo({...accountInfo,
        email: event.detail.email,
        first_name: event.detail.first_name,
        last_name: event.detail.last_name,
        nickname: event.detail.nickname
      })
      const localAvatarUrl = localStorage.getItem('Avatar:'+event.detail.email);
      if(localAvatarUrl) setAvatarUrl(localAvatarUrl);
    });
  }, []);
  
  // Sample notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New User Registration",
      message: "A new user has registered on the platform.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: "System Update",
      message: "The system will undergo maintenance tonight at 2 AM EST.",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: false,
      type: 'alert'
    },
    {
      id: 3,
      title: "Project Completed",
      message: "Sales Forecasting project has been completed successfully.",
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      read: true,
      type: 'success'
    }
  ]);

  // Get count of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get current navigation based on view mode
  const navigation = isAdminView ? adminNavigation : userNavigation;

  // States for support and report modals
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    color: "green"
  });
  
  // Function to show toast notifications
  const showNotification = (message: string, color = "green") => {
    setShowToast({
      show: true,
      message,
      color
    });
    
    setTimeout(() => {
      setShowToast({...showToast, show: false});
    }, 3000);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate.push('/login');
  };

  const handleNavigation = (path: string) => {
    // Check if the path is available in current view mode
    const isPathAvailable = navigation.some(item => item.href === path);
    if (!isPathAvailable) {
      // If trying to access a restricted page in user view, stay on dashboard
      if (!isAdminView) {
        path = '/dashboard';
      }
    }
    
    //const page = path.split('/').pop() || 'dashboard';
    //setCurrentPage(page);
    setCurrentPage(path);
    navigate.push(path);
    setIsDrawerOpen(false); // Close drawer on navigation
  };

  const handleToggleView = () => {
    dispatchEvent(new CustomEvent("switch", {detail: isAdminView ? 'USESR' : 'ADMIN'}));
    setIsAdminView(!isAdminView);
    // If switching to user view while on an admin-only page, redirect to dashboard
    if (isAdminView) {
      const currentPath = location.pathname;
      const isPathAvailable = userNavigation.some(item => item.href === currentPath);
      if (!isPathAvailable) {
        navigate.push('/dashboard');
        setCurrentPage('dashboard');
      }
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const formatNotificationTime = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <BellIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };
/*
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((path, index, array) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: '/' + array.slice(0, index + 1).join('/'),
      current: index === array.length - 1,
    }));
    */
  // Updated Sidebar with visible toggle button when collapsed
  const Sidebar = () => (
    <div>
      <div className={cn(isSidebarCollapsed ? "w-28" : "w-[20rem]")}>
        {/* Phantom element to take up space of fixed sidebar */}
      </div>
      <Card className={cn(
        "shadow-xl shadow-blue-gray-900/5 overflow-auto transition-all duration-300",
        isSidebarCollapsed ? "w-28" : "w-full max-w-[20rem]",
        isDrawerOpen ? "relative p-4 pr-16" : "fixed top-24 bottom-0 p-4 pr-16"
      )}>
        {/* Toggle button fixed position to always remain visible */}
        <div className={isSidebarCollapsed ? "fixed top-64 left-16" : 'fixed top-64 left-64'}>
          <IconButton
            variant="text"
            color="teal"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="mb-4"
          >
            {isSidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </IconButton>
        </div>
        <div className="relative z-10">
          {/* Role identifier */}
          {!isSidebarCollapsed && (
            <div className="mb-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3 border border-teal-100">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  isAdminView ? "bg-red-500" : "bg-green-500"
                )}></div>
                <Typography variant="small" className="font-medium text-blue-gray-700">
                  {isAdminView ? "Admin View" : "User View"}
                </Typography>
              </div>
            </div>
          )}
          
          <div>
            {navigation.map((item) => {
              const isActive = /*location.pathname*/currentPage === item.href /*|| 
                (item.href === '/dashboard' && location.pathname === '/dashboard') || 
                (location.pathname.includes(item.href) && item.href !== '/dashboard');*/
              return (
                <ListItem
                  key={item.name}
                  className={cn(
                    "mb-2 hover:bg-teal-50/80 transition-all duration-200",
                    isActive ? "bg-teal-50/80 text-teal-500 font-medium" : "",
                    isSidebarCollapsed ? "w-12" : ""
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <ListItemPrefix>
                    <item.icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-teal-500" : "text-blue-gray-500"
                    )} />
                  </ListItemPrefix>
                  {!isSidebarCollapsed && (
                    <div>
                      <Typography variant="small" className={isActive ? "font-medium" : ""}>
                        {item.name}
                      </Typography>
                      {!isActive && (
                        <Typography variant="small" className="text-xs text-gray-500">
                          {item.description}
                        </Typography>
                      )}
                    </div>
                  )}
                </ListItem>
              );
            })}
          </div>
          
          {!isSidebarCollapsed && (
            <div className="mt-auto pt-8">
              <Card className="mt-6 bg-gradient-to-br from-teal-500 to-teal-700 text-white p-4 rounded-xl">
                <Typography variant="h6" className="mb-2">Need Help?</Typography>
                <Typography variant="small" className="mb-4 opacity-80">
                  Contact our support team for assistance with any issues.
                </Typography>
                <Button 
                  size="sm" 
                  className="bg-white text-teal-800 flex items-center gap-2 shadow-md hover:shadow-lg"
                  fullWidth
                  onClick={() => setIsSupportModalOpen(true)}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Contact Support
                </Button>
              </Card>
              
              <Button 
                size="sm"
                color="red"
                variant="text"
                className="flex items-center gap-2 mt-4 w-full justify-center"
                onClick={handleLogout} 
              >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50/50">
        {/* Add blur overlay when logout modal is open */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"></div>
        )}
    
        <Navbar className="sticky top-0 z-10 max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-blue-gray-900">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Theoforge Logo" className="h-12 w-12" />
              <Typography variant="h5" color="blue-gray">
                Theoforge
              </Typography>
              <IconButton
                variant="text"
                color="teal"
                className="lg:hidden"
                hidden={isDrawerOpen}
                onClick={() => setIsDrawerOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
              </IconButton>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Admin/User View Toggle */}
              <div className="flex items-center gap-2">
                <Typography variant="small" color={isAdminView ? "teal" : "gray"} className="font-medium">
                  Admin
                </Typography>
                <Switch 
                  color="teal"
                  checked={!isAdminView}
                  onChange={handleToggleView}
                  label=""
                  className="h-full"
                  crossOrigin={undefined}
                />
                <Typography variant="small" color={!isAdminView ? "teal" : "gray"} className="font-medium">
                  User
                </Typography>
              </div>
              
              {/* Notifications dropdown */}
              <Menu
                placement="bottom-end"
                open={isNotificationsOpen}
                handler={setIsNotificationsOpen}
              >
                <MenuHandler>
                  <div className="relative">
                    <IconButton variant="text" color="blue-gray" className="">
                      <BellIcon className="h-5 w-5" />
                    </IconButton>
                    {unreadCount > 0 && (
                      <Badge
                        content={unreadCount}
                        color="teal"
                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                      >{' '}</Badge>
                    )}
                  </div>
                </MenuHandler>
                <MenuList className="p-2 max-h-[400px] min-w-[300px] overflow-y-auto">
                  <div className="flex items-center justify-between p-2 border-b border-gray-100">
                    <Typography variant="small" className="font-bold">
                      Notifications
                    </Typography>
                    {unreadCount > 0 ? (
                      <Button variant="text" size="sm" onClick={markAllNotificationsAsRead} className="text-xs py-1">
                        Mark all as read
                      </Button>
                    ) : (
                      <Typography variant="small" className="text-gray-500 text-xs">
                        No new notifications
                      </Typography>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <MenuItem key={notification.id} className={cn(
                        "flex flex-col items-start gap-1 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                        !notification.read ? "bg-teal-50/50" : ""
                      )}>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex gap-2">
                            <div className="p-1.5 rounded-full bg-gray-100">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Typography variant="small" className="font-medium">
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                                )}
                              </div>
                              <Typography variant="small" className="text-gray-600">
                                {notification.message}
                              </Typography>
                              <Typography variant="small" className="text-gray-500 text-xs">
                                {formatNotificationTime(notification.timestamp)}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            {!notification.read && (
                              <IconButton 
                                variant="text" 
                                size="sm" 
                                color="teal" 
                                className="h-6 w-6 min-w-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(notification.id);
                                }}
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </IconButton>
                            )}
                            <IconButton 
                              variant="text" 
                              size="sm" 
                              color="red" 
                              className="h-6 w-6 min-w-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </div>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem className="text-center text-gray-500 py-6">
                      No notifications
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
              
              <Menu>
                <MenuHandler>
                  <Button 
                    variant="text" 
                    color="blue-gray" 
                    className="flex items-center gap-2 normal-case shadow-none px-2"
                  >
                    <Avatar 
                      src={avatarUrl}
                      alt="User" 
                      size="sm" 
                      className="border border-gray-200" 
                    />
                    <div className="hidden sm:block text-left">
                      <Typography variant="small" className="font-medium">
                        {accountInfo.nickname ? accountInfo.nickname :
                        (accountInfo.first_name && accountInfo.last_name) ? (accountInfo.first_name + ' ' + accountInfo.last_name) :
                        accountInfo.email ? accountInfo.email : ''}
                      </Typography>
                      <Typography variant="small" className="text-xs text-gray-500">
                        {role}
                      </Typography>
                    </div>
                  </Button>
                </MenuHandler>
                <MenuList className="p-1">
                  <MenuItem 
                    className="flex items-center gap-2 rounded hover:bg-teal-50/80"
                    onClick={() => navigate.push('/dashboard/profile')}
                  >
                    <UserCircleIcon className="h-4 w-4 text-teal-500" />
                    <Typography variant="small" className="font-normal">
                      Profile Settings
                    </Typography>
                  </MenuItem>
                  <Link href="/learn-more">
                    <MenuItem 
                      className="flex items-center gap-2 rounded hover:bg-teal-50/80"
                    >
                      <InformationCircleIcon className="h-4 w-4 text-teal-500" />
                      <Typography variant="small" className="font-normal">
                        Learn More
                      </Typography>
                    </MenuItem>
                  </Link>
                  <MenuItem 
                    className="flex items-center gap-2 rounded hover:bg-red-50 text-red-500"
                    onClick={handleLogout}
                  >
                    <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                    <Typography variant="small" className="font-normal">
                      Sign Out
                    </Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </Navbar>

        <div className="flex">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <Drawer
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            className="lg:hidden w-auto"
          >
            <Navbar className="sticky top-0 z-10 max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between text-blue-gray-900">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Theoforge Logo" className="h-12 w-12" />
                  {!isSidebarCollapsed ? (<Typography variant="h5" color="blue-gray">
                    Theoforge
                  </Typography>) : <></>}
                </div>
                <div className="flex items-center">
                  <IconButton
                    variant="text"
                    color="teal"
                    className="lg:hidden"
                    hidden={isSidebarCollapsed}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <MenuIcon className="h-6 w-6" />
                  </IconButton>
                </div>
              </div>
            </Navbar>
            <Sidebar />
          </Drawer>
          <div className="flex-1 p-4 lg:p-6 max-w-full overflow-auto">
            {children}
          </div>
        </div>
        {/* Logout Modal */}
        <Dialog
          open={isLogoutModalOpen}
          handler={handleCloseLogoutModal}
          size="xs"
          className="bg-white shadow-none z-[70]"
        >
          <DialogHeader>Confirm Logout</DialogHeader>
          <DialogBody>
            Are you sure you want to log out of your account?
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="gray"
              onClick={handleCloseLogoutModal}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button variant="gradient" color="red" onClick={handleConfirmLogout}>
              <span>Logout</span>
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Toast notification */}
        {showToast.show && (
          <Alert
            open={showToast.show}
            color={showToast.color as colors}
            className="fixed top-20 right-4 z-50 max-w-md"
            icon={<CheckCircleIcon className="h-6 w-6" />}
            onClose={() => setShowToast({...showToast, show: false})}
          >
            {showToast.message}
          </Alert>
        )}

        {/* Support Modal */}
        <Dialog
          open={isSupportModalOpen}
          handler={() => setIsSupportModalOpen(false)}
          size="md"
        >
          <DialogHeader>Contact Support</DialogHeader>
          <DialogBody divider>
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Support Category
                </Typography>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500">
                  <option value="">Select category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Priority
                </Typography>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Description
                </Typography>
                <Textarea label="Describe your issue" rows={4} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={() => setIsSupportModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              color="purple"
              onClick={() => {
                setIsSupportModalOpen(false);
                showNotification("Support ticket submitted successfully!");
              }}
            >
              Submit Ticket
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </PrivateRoute>
  );
}
'use client'

import React, { useContext, useState } from 'react';
import { AuthContext } from '@/components/Dashboard/AppContext';
import {
  UsersIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Button,
  DialogBody,
  DialogFooter,
  Dialog,
  Alert,
  DialogHeader,
  Input,
} from "@material-tailwind/react";
import { useRouter } from 'next/navigation';
import { colors } from '@material-tailwind/react/types/generic';

interface AccountInfo {
  nickname: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

// Admin Dashboard Content Component
const AdminDashboard: React.FC = () => {
  const navigate = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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
  return (
    // Admin Dashboard Content
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="p-6 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-teal-500 mb-4">
                <SparklesIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Welcome back!
              </Typography>
              <Typography color="gray">
                Here&apos;s what&apos;s happening with your projects today.
              </Typography>
            </div>
            <Button 
              color="teal" 
              className="flex items-center gap-2"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
            >
              <SparklesIcon className="h-4 w-4" /> 
              Generate Report
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </Card>

      {/* Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Total Users
              </Typography>
              <Typography variant="h4">
                1,204
              </Typography>
              <div className="flex items-center mt-1">
                <Typography variant="small" color="teal" className="font-medium">
                  +12%
                </Typography>
                <Typography variant="small" color="gray" className="ml-1">
                  vs. last month
                </Typography>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Active Guests
              </Typography>
              <Typography variant="h4">
                423
              </Typography>
              <div className="flex items-center mt-1">
                <Typography variant="small" color="teal" className="font-medium">
                  +5%
                </Typography>
                <Typography variant="small" color="gray" className="ml-1">
                  vs. last month
                </Typography>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-500">
              <HomeIcon className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <Typography variant="small" color="gray" className="mb-2">
                New Sign-ups
              </Typography>
              <Typography variant="h4">
                48
              </Typography>
              <div className="flex items-center mt-1">
                <Typography variant="small" color="teal" className="font-medium">
                  +18%
                </Typography>
                <Typography variant="small" color="gray" className="ml-1">
                  vs. last month
                </Typography>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-500">
              <UserCircleIcon className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <Typography variant="small" color="gray" className="mb-2">
                Marketplace Items
              </Typography>
              <Typography variant="h4">
                152
              </Typography>
              <div className="flex items-center mt-1">
                <Typography variant="small" color="teal" className="font-medium">
                  +7%
                </Typography>
                <Typography variant="small" color="gray" className="ml-1">
                  vs. last month
                </Typography>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate.push('/dashboard/users')}>
          <div className="p-3 bg-blue-50 rounded-full mb-3">
            <UsersIcon className="h-6 w-6 text-blue-500" />
          </div>
          <Typography variant="h6">User Management</Typography>
          <Typography variant="small" color="gray" className="mt-1">
            Manage user access and permissions
          </Typography>
        </Card>
        <Card className="p-4 border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate.push('/dashboard/projects')}>
          <div className="p-3 bg-teal-50 rounded-full mb-3">
            <DocumentTextIcon className="h-6 w-6 text-teal-500" />
          </div>
          <Typography variant="h6">Projects</Typography>
          <Typography variant="small" color="gray" className="mt-1">
            Track ongoing projects and tasks
          </Typography>
        </Card>
        <Card className="p-4 border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate.push('/dashboard/analytics')}>
          <div className="p-3 bg-purple-50 rounded-full mb-3">
            <ChartBarIcon className="h-6 w-6 text-purple-500" />
          </div>
          <Typography variant="h6">Analytics</Typography>
          <Typography variant="small" color="gray" className="mt-1">
            View detailed performance metrics
          </Typography>
        </Card>
        <Card className="p-4 border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate.push('/dashboard/marketplace')}>
          <div className="p-3 bg-amber-50 rounded-full mb-3">
            <ShoppingBagIcon className="h-6 w-6 text-amber-500" />
          </div>
          <Typography variant="h6">Marketplace</Typography>
          <Typography variant="small" color="gray" className="mt-1">
            Browse available services and add-ons
          </Typography>
        </Card>
      </div>
      {/* Report Generation Modal */}
      <Dialog
        open={isReportModalOpen}
        handler={() => setIsReportModalOpen(false)}
        size="md"
      >
        <DialogHeader>Generate Report</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Report Type
              </Typography>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500">
                <option value="">Select report type</option>
                <option value="performance">Performance Analysis</option>
                <option value="financial">Financial Summary</option>
                <option value="user">User Activity</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Date Range
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Start Date" crossOrigin={undefined} />
                <Input type="date" label="End Date" crossOrigin={undefined} />
              </div>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Format
              </Typography>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="pdf" defaultChecked className="h-4 w-4" />
                  <span>PDF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="excel" className="h-4 w-4" />
                  <span>Excel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="csv" className="h-4 w-4" />
                  <span>CSV</span>
                </label>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsReportModalOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="teal"
            onClick={() => {
              setIsReportModalOpen(false);
              showNotification("Report generation started! You'll be notified when it's ready.");
            }}
          >
            Generate Report
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
    </div>
  );
}

export default AdminDashboard;
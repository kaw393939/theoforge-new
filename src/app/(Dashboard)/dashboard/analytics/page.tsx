'use client'

import React, { useState } from 'react';
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Alert,
} from "@material-tailwind/react";

// Analytics Dashboard component for data visualization
const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  
  // Sample data for analytics
  const dailyData = [
    { date: 'Mon', users: 120, revenue: 1250, tasks: 45 },
    { date: 'Tue', users: 132, revenue: 1480, tasks: 52 },
    { date: 'Wed', users: 101, revenue: 1120, tasks: 38 },
    { date: 'Thu', users: 134, revenue: 1460, tasks: 57 },
    { date: 'Fri', users: 150, revenue: 1700, tasks: 62 },
    { date: 'Sat', users: 120, revenue: 1380, tasks: 48 },
    { date: 'Sun', users: 95, revenue: 990, tasks: 36 }
  ];
  
  const weeklyData = [
    { date: 'Week 1', users: 820, revenue: 8450, tasks: 312 },
    { date: 'Week 2', users: 932, revenue: 9280, tasks: 352 },
    { date: 'Week 3', users: 901, revenue: 9020, tasks: 338 },
    { date: 'Week 4', users: 934, revenue: 9660, tasks: 357 }
  ];
  
  const monthlyData = [
    { date: 'Jan', users: 3220, revenue: 34250, tasks: 1245 },
    { date: 'Feb', users: 3932, revenue: 42280, tasks: 1352 },
    { date: 'Mar', users: 3901, revenue: 41020, tasks: 1338 },
    { date: 'Apr', users: 4134, revenue: 43660, tasks: 1457 },
    { date: 'May', users: 4432, revenue: 46280, tasks: 1542 },
    { date: 'Jun', users: 4401, revenue: 45020, tasks: 1498 }
  ];
  
  const showSuccessAlert = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };
  
  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };
  
  return (
    <div className="space-y-6">
      {showAlert && (
        <Alert
          open={showAlert}
          color="green"
          className="fixed top-20 right-4 z-50 max-w-md"
          icon={<CheckCircleIcon className="h-6 w-6" />}
          onClose={() => setShowAlert(false)}
        >
          Report generated successfully! Check your email inbox.
        </Alert>
      )}
      
      {/* Header Card */}
      <Card className="p-6 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-500 mb-4">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Analytics Dashboard</span>
              </div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Performance Metrics
              </Typography>
              <Typography color="gray">
                Track your business performance with real-time analytics
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button 
                color="blue" 
                className="flex items-center gap-2"
                size="sm"
                onClick={() => openModal('export')}
              >
                <DocumentDuplicateIcon className="h-4 w-4" /> 
                Export Data
              </Button>
              <Button 
                color="purple" 
                className="flex items-center gap-2"
                size="sm"
                onClick={() => {
                  showSuccessAlert();
                }}
              >
                <DocumentTextIcon className="h-4 w-4" /> 
                Generate Report
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </Card>
      
      {/* Analytics Time Period Tabs */}
      <Card className="p-4 border border-gray-100">
        <Tabs value={activeTab} className="w-full">
          <TabsHeader>
            <Tab value="daily" onClick={() => setActiveTab("daily")}>
              Daily
            </Tab>
            <Tab value="weekly" onClick={() => setActiveTab("weekly")}>
              Weekly
            </Tab>
            <Tab value="monthly" onClick={() => setActiveTab("monthly")}>
              Monthly
            </Tab>
          </TabsHeader>
          <TabsBody>
            <TabPanel value="daily">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-blue-50">
                      <UsersIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Daily Users</Typography>
                      <Typography variant="h4">{dailyData.reduce((sum, item) => sum + item.users, 0) / dailyData.length}</Typography>
                      <Typography variant="small" color="green">+5.2% vs last week</Typography>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-green-50">
                      <CreditCardIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Daily Revenue</Typography>
                      <Typography variant="h4">${dailyData.reduce((sum, item) => sum + item.revenue, 0) / dailyData.length}</Typography>
                      <Typography variant="small" color="green">+8.4% vs last week</Typography>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-amber-50">
                      <ClipboardDocumentCheckIcon className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Tasks Completed</Typography>
                      <Typography variant="h4">{dailyData.reduce((sum, item) => sum + item.tasks, 0) / dailyData.length}</Typography>
                      <Typography variant="small" color="green">+3.8% vs last week</Typography>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Chart Placeholder */}
              <Card className="border border-gray-100 p-4 h-80 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <Typography variant="h6" color="gray">Daily Performance Chart</Typography>
                  <Typography variant="small" color="gray">
                    Shows user activity, revenue, and task completion for the past 7 days
                  </Typography>
                  <Button 
                    variant="text" 
                    color="blue" 
                    className="mt-3"
                    onClick={() => openModal('chart')}
                  >
                    View Detailed Chart
                  </Button>
                </div>
              </Card>
            </TabPanel>
            
            <TabPanel value="weekly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-blue-50">
                      <UsersIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Weekly Users</Typography>
                      <Typography variant="h4">{weeklyData.reduce((sum, item) => sum + item.users, 0) / weeklyData.length}</Typography>
                      <Typography variant="small" color="green">+12.1% vs last month</Typography>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-green-50">
                      <CreditCardIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Weekly Revenue</Typography>
                      <Typography variant="h4">${weeklyData.reduce((sum, item) => sum + item.revenue, 0) / weeklyData.length}</Typography>
                      <Typography variant="small" color="green">+15.4% vs last month</Typography>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-amber-50">
                      <ClipboardDocumentCheckIcon className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Tasks Completed</Typography>
                      <Typography variant="h4">{weeklyData.reduce((sum, item) => sum + item.tasks, 0) / weeklyData.length}</Typography>
                      <Typography variant="small" color="green">+9.7% vs last month</Typography>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Chart Placeholder */}
              <Card className="border border-gray-100 p-4 h-80 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <Typography variant="h6" color="gray">Weekly Performance Chart</Typography>
                  <Typography variant="small" color="gray">
                    Shows user activity, revenue, and task completion for the past 4 weeks
                  </Typography>
                  <Button 
                    variant="text" 
                    color="blue" 
                    className="mt-3"
                    onClick={() => openModal('chart')}
                  >
                    View Detailed Chart
                  </Button>
                </div>
              </Card>
            </TabPanel>
            <TabPanel value="monthly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-blue-50">
                      <UsersIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Monthly Users</Typography>
                      <Typography variant="h4">{monthlyData.reduce((sum, item) => sum + item.users, 0) / monthlyData.length}</Typography>
                      <Typography variant="small" color="green">+18.3% vs last quarter</Typography>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-green-50">
                      <CreditCardIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Monthly Revenue</Typography>
                      <Typography variant="h4">${monthlyData.reduce((sum, item) => sum + item.revenue, 0) / monthlyData.length}</Typography>
                      <Typography variant="small" color="green">+21.7% vs last quarter</Typography>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-3 bg-amber-50">
                      <ClipboardDocumentCheckIcon className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <Typography variant="small" color="gray">Tasks Completed</Typography>
                      <Typography variant="h4">{monthlyData.reduce((sum, item) => sum + item.tasks, 0) / monthlyData.length}</Typography>
                      <Typography variant="small" color="green">+14.2% vs last quarter</Typography>
                    </div>
                  </div>
                </Card>
              </div>
{/* Chart Placeholder */}
<Card className="border border-gray-100 p-4 h-80 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <Typography variant="h6" color="gray">Monthly Performance Chart</Typography>
                  <Typography variant="small" color="gray">
                    Shows user activity, revenue, and task completion for the past 6 months
                  </Typography>
                  <Button 
                    variant="text" 
                    color="blue" 
                    className="mt-3"
                    onClick={() => openModal('chart')}
                  >
                    View Detailed Chart
                  </Button>
                </div>
              </Card>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </Card>
      
      {/* Recent Activity */}
      <Card className="p-6 border border-gray-100">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          Recent Activity
        </Typography>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg">
            <div className="rounded-full p-2 bg-purple-50">
              <UsersIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <Typography variant="small" className="font-medium">New user registration</Typography>
              <Typography variant="small" color="gray">User "john.smith@example.com" has registered</Typography>
              <Typography variant="small" color="gray">2 hours ago</Typography>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg">
            <div className="rounded-full p-2 bg-green-50">
              <CreditCardIcon className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <Typography variant="small" className="font-medium">New subscription</Typography>
              <Typography variant="small" color="gray">User "acme-corp" purchased Enterprise plan</Typography>
              <Typography variant="small" color="gray">4 hours ago</Typography>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg">
            <div className="rounded-full p-2 bg-blue-50">
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <Typography variant="small" className="font-medium">Analytics report generated</Typography>
              <Typography variant="small" color="gray">Monthly report for February 2025 is ready</Typography>
              <Typography variant="small" color="gray">8 hours ago</Typography>
            </div>
          </div>
        </div>
        
        <Button 
          variant="text" 
          color="blue" 
          className="mt-4 flex items-center gap-1"
          onClick={() => openModal('activity')}
        >
          View All Activity <ArrowRightIcon className="h-3 w-3" />
        </Button>
      </Card>
      
      {/* Modals */}
      <Dialog
        open={showModal}
        handler={() => setShowModal(false)}
        size="md"
      >
        <DialogHeader>
          {modalType === 'export' && 'Export Data'}
          {modalType === 'chart' && 'Detailed Analytics Chart'}
          {modalType === 'activity' && 'All Activity Log'}
        </DialogHeader>
        <DialogBody divider>
          {modalType === 'export' && (
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Select Data Range
                </Typography>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                  <option value="daily">Daily (Last 7 Days)</option>
                  <option value="weekly">Weekly (Last 4 Weeks)</option>
                  <option value="monthly">Monthly (Last 6 Months)</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Data Format
                </Typography>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" value="csv" defaultChecked className="h-4 w-4" />
                    <span>CSV</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" value="excel" className="h-4 w-4" />
                    <span>Excel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" value="pdf" className="h-4 w-4" />
                    <span>PDF</span>
                  </label>
                </div>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Include Metrics
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span>User Statistics</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span>Revenue Data</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span>Task Completion</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <span>Activity Log</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {modalType === 'chart' && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                  <Typography variant="h6" color="gray">Interactive Chart Visualization</Typography>
                  <Typography variant="small" color="gray" className="max-w-sm mx-auto">
                    In a production environment, this would display an interactive chart showing detailed analytics data based on the selected time period
                  </Typography>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <Typography variant="small" color="gray">Total Users</Typography>
                  <Typography variant="h6" className="font-bold">24,892</Typography>
                  <Typography variant="small" color="green">+12.3%</Typography>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <Typography variant="small" color="gray">Revenue</Typography>
                  <Typography variant="h6" className="font-bold">$198,453</Typography>
                  <Typography variant="small" color="green">+15.7%</Typography>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <Typography variant="small" color="gray">Avg. Conversion</Typography>
                  <Typography variant="h6" className="font-bold">3.8%</Typography>
                  <Typography variant="small" color="green">+0.5%</Typography>
                </div>
              </div>
            </div>
          )}
          
          {modalType === 'activity' && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg">
                  <div className="rounded-full p-2 bg-blue-50">
                    {index % 3 === 0 && <UsersIcon className="h-5 w-5 text-blue-500" />}
                    {index % 3 === 1 && <CreditCardIcon className="h-5 w-5 text-green-500" />}
                    {index % 3 === 2 && <ChartBarIcon className="h-5 w-5 text-purple-500" />}
                  </div>
                  <div>
                    <Typography variant="small" className="font-medium">
                      {index % 3 === 0 && 'User Activity'}
                      {index % 3 === 1 && 'Billing Event'}
                      {index % 3 === 2 && 'System Event'}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {index % 3 === 0 && `User "${['john', 'mary', 'alex', 'sarah', 'mike'][index % 5]}@example.com" performed an action`}
                      {index % 3 === 1 && 'Subscription plan change or payment processed'}
                      {index % 3 === 2 && 'System maintenance or report generation'}
                    </Typography>
                    <Typography variant="small" color="gray">{index + 1} hour{index !== 0 ? 's' : ''} ago</Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            color={modalType === 'export' ? 'blue' : 'gray'}
            onClick={() => {
              setShowModal(false);
              if (modalType === 'export') {
                showSuccessAlert();
              }
            }}
          >
            {modalType === 'export' ? 'Export Data' : 'Close'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Analytics;
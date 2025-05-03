'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/Layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import AdminDashboardStats from '@/components/Dashboard/AdminDashboardStats';
import { Users, UserX } from 'lucide-react';
import GuestsTable from './GuestsTable';
import UsersTable from './UsersTable';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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
            <UsersTable/>
          </TabsContent>
          
          <TabsContent value="guests" className="space-y-6">
            {/* Guests table here */}
            <GuestsTable />
          </TabsContent>
          
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

export default AdminDashboard;
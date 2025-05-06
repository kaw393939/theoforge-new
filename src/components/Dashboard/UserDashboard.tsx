'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/Layout/PageContainer';
import Button from '@/components/Common/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { Loader2, UserCheck, RefreshCw } from 'lucide-react';
import { AuthContext } from './AppContext';

// User Profile interface - what we store locally
interface UserProfile {
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  card_number?: string;
  subscription_plan?: string;
}

// Mock data for projects
const PROJECTS = [
  { id: 1, name: 'Marketing Strategy', status: 'In Progress', progress: 65, date: '2025-03-15' },
  { id: 2, name: 'Website Redesign', status: 'Planning', progress: 25, date: '2025-03-20' },
  { id: 3, name: 'Content Calendar', status: 'Completed', progress: 100, date: '2025-02-28' },
];

// Mock data for activity
const ACTIVITIES = [
  { id: 1, action: 'Updated profile', timestamp: '2025-04-10T14:30:00Z' },
  { id: 2, action: 'Created new project', timestamp: '2025-04-05T09:15:00Z' },
  { id: 3, action: 'Completed onboarding', timestamp: '2025-03-28T16:45:00Z' },
];

const UserDashboard: React.FC = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      console.error("Missing user data");
      return;
    }
    
    setIsLoading(false);
    
    setProfile({
      phone_number: user.phone_number || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zip_code: user.zip_code || '',
      card_number: user.card_number || '',
      subscription_plan: user.subscription_plan || 'FREE'
    });
    
    setLastRefreshed(new Date());
  }, [isAuthenticated, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TheoForge Dashboard</h1>
            <p className="text-gray-500">Welcome, {user?.first_name || user?.nickname || 'User'}</p>
          </div>
          <Button onClick={() => router.push('/dashboard/profile')} className="ml-auto">
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-xl font-medium mb-3 flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Your Profile
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profile.phone_number || 'Not uploaded'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{profile.address || 'Not uploaded'}</p>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-xl font-medium mb-3">Your Subscription</h2>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded mb-4">
                <p className="font-medium">
                  {profile.subscription_plan === 'FREE' || !profile.subscription_plan ? 'Free Plan' :
                  profile.subscription_plan === 'BASIC' ? 'Basic Plan' :
                  profile.subscription_plan === 'PREMIUM' ? 'Premium Plan' : 'Free Plan'}
                </p>
                {profile.subscription_plan === 'FREE' && (
                  <ul className="mt-2 text-sm space-y-1 list-disc pl-5">
                    <li>Basic features</li>
                    <li>Community support</li>
                    <li>Limited projects</li>
                  </ul>
                )}
                {profile.subscription_plan === 'BASIC' && (
                  <ul className="mt-2 text-sm space-y-1 list-disc pl-5">
                    <li>All Free features</li>
                    <li>Email support</li>
                    <li>Up to 10 projects</li>
                    <li>Advanced analytics</li>
                  </ul>
                )}
                {profile.subscription_plan === 'PREMIUM' && (
                  <ul className="mt-2 text-sm space-y-1 list-disc pl-5">
                    <li>All Basic features</li>
                    <li>Priority support</li>
                    <li>Unlimited projects</li>
                    <li>Custom integrations</li>
                    <li>API access</li>
                  </ul>
                )}
              </div>
              <Button className="w-full" onClick={() => setActiveTab('account')}>
                Manage Subscription
              </Button>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-xl font-medium mb-3">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="text-2xl font-bold">{PROJECTS.length}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">
                    {PROJECTS.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold">
                    {PROJECTS.filter(p => p.status === 'In Progress').length}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500">Planning</p>
                  <p className="text-2xl font-bold">
                    {PROJECTS.filter(p => p.status === 'Planning').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Recent Projects</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('projects')}
              >
                View All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJECTS.slice(0, 3).map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{project.progress}%</span>
                    </TableCell>
                    <TableCell>{project.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-medium">Your Projects</h2>
            <Button size="sm">Create New Project</Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJECTS.map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{project.progress}%</span>
                    </TableCell>
                    <TableCell>{project.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-2xl font-medium">Recent Activity</h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="space-y-4">
              {ACTIVITIES.map(activity => (
                <div key={activity.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <p>{activity.action}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-4">
          <h2 className="text-2xl font-medium">Account Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Details */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Profile Details</h3>
                <button 
                  onClick={() => router.push('/dashboard/profile')}
                  className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Edit Profile
                </button>
              </div>
              
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-6 w-6" />
                    <span className="ml-2">Loading profile data...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{profile.phone_number || 'Not uploaded'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Subscription</p>
                        <p className="font-medium">
                          {profile.subscription_plan === 'FREE' || !profile.subscription_plan ? 'Free Plan' :
                          profile.subscription_plan === 'BASIC' ? 'Basic Plan' :
                          profile.subscription_plan === 'PREMIUM' ? 'Premium Plan' : 'Free Plan'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">
                        {profile.address ? (
                          <>
                            {profile.address}
                            {(profile.city || profile.state || profile.zip_code) && (
                              <br />
                            )}
                            {profile.city} {profile.state} {profile.zip_code}
                          </>
                        ) : (
                          'Not uploaded'
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">
                        {profile.card_number ? (
                          <>Card ending in {profile.card_number.slice(-4)}</>
                        ) : (
                          'Not uploaded'
                        )}
                      </p>
                    </div>
                    
                    {lastRefreshed && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {lastRefreshed.toLocaleString()}
                      </p>
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={() => router.push('/dashboard/profile')}
                  className="w-full"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Account Management</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.email} 
                    disabled 
                    className="bg-gray-50 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for login and notifications
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="nickname">Username/Nickname</Label>
                  <Input 
                    id="nickname" 
                    value={user?.nickname || ''} 
                    disabled 
                    className="bg-gray-50 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Account Type</Label>
                  <Input 
                    id="role" 
                    value={user?.role || 'USER'} 
                    disabled 
                    className="bg-gray-50 mt-1"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full mb-2"
                    onClick={() => router.push('/dashboard/security')}
                  >
                    Security Settings
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

export default UserDashboard;
'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Tabs,
  TabsHeader,
  Tab,
  Progress,
  Tooltip as MTTooltip
} from "@material-tailwind/react";

interface TimeSeriesData {
  time: string,
  cpu: number,
  memory: number,
  requests: number,
  errors: number
}

const RealTimeDashboard: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("system-metrics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [metrics, setMetrics] = useState({
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 51,
    networkIn: 24.5,
    networkOut: 18.2,
    activeUsers: 127,
    activeJobs: 8,
    responseTime: 120, // in ms
    uptime: 99.98,
    errorRate: 0.05,
    requestRate: 125 //requests per minute
  });
  
  // Sample time series data
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [modelPerformance, setModelPerformance] = useState([
    { name: 'ETL Pipeline', accuracy: 99.2, latency: 45, throughput: 850 },
    { name: 'NLP Model', accuracy: 94.7, latency: 120, throughput: 320 },
    { name: 'Vision Model', accuracy: 96.8, latency: 220, throughput: 150 },
    { name: 'Recommendation', accuracy: 92.5, latency: 85, throughput: 540 },
    { name: 'Classification', accuracy: 97.3, latency: 65, throughput: 620 }
  ]);
  
  // Generate initial time series data
  useEffect(() => {
    const initialData = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      initialData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: 30 + Math.random() * 25,
        memory: 55 + Math.random() * 25,
        requests: 80 + Math.random() * 90,
        errors: Math.random() * 2
      });
    }
    
    setTimeSeriesData(initialData);
    
    // Setup interval for real-time updates
    const interval = setInterval(() => {
      updateMetrics();
      updateTimeSeriesData();
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Refresh data manually
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate data fetching delay
    setTimeout(() => {
      updateMetrics();
      updateTimeSeriesData();
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Update metrics with slight random variations
  const updateMetrics = () => {
    setMetrics(prev => ({
      cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() * 10 - 5))),
      memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() * 8 - 4))),
      diskUsage: Math.max(0, Math.min(100, prev.diskUsage + (Math.random() * 2 - 1))),
      networkIn: Math.max(0, prev.networkIn + (Math.random() * 5 - 2.5)),
      networkOut: Math.max(0, prev.networkOut + (Math.random() * 4 - 2)),
      activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 11 - 5)),
      activeJobs: Math.max(0, prev.activeJobs + Math.floor(Math.random() * 3 - 1)),
      responseTime: Math.max(50, prev.responseTime + (Math.random() * 30 - 15)),
      uptime: Math.min(100, prev.uptime + 0.001),
      errorRate: Math.max(0, prev.errorRate + (Math.random() * 0.02 - 0.01)),
      requestRate: Math.max(0, prev.requestRate + (Math.random() * 20 - 10))
    }));
    
    // Update model performance occasionally
    if (Math.random() > 0.7) {
      setModelPerformance(prev => 
        prev.map(model => ({
          ...model,
          accuracy: Math.max(90, Math.min(99.9, model.accuracy + (Math.random() * 0.6 - 0.3))),
          latency: Math.max(10, model.latency + (Math.random() * 10 - 5)),
          throughput: Math.max(50, model.throughput + (Math.random() * 30 - 15))
        }))
      );
    }
  };
  
  // Add new data point to time series
  const updateTimeSeriesData = () => {
    const now = new Date();
    const newDataPoint = {
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: metrics.cpuUsage,
      memory: metrics.memoryUsage,
      requests: metrics.requestRate,
      errors: metrics.errorRate * 100
    };
    
    setTimeSeriesData(prev => {
      const newData = [...prev, newDataPoint];
      // Keep only the last 30 data points
      if (newData.length > 30) {
        return newData.slice(-30);
      }
      return newData;
    });
  };
  
  // Format for percentages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  
  // Format for data transfer
  const formatDataTransfer = (value: number) => `${value.toFixed(1)} MB/s`;
  
  // Get status color based on value thresholds
  const getStatusColor = (value: number, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return "red";
    if (value >= thresholds.warning) return "amber";
    return "green";
  };
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Calculate trend indicators
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || current === previous) return { direction: 'neutral', value: 0 };
    
    const diff = current - previous;
    const percentChange = (diff / previous) * 100;
    
    return {
      direction: diff > 0 ? 'up' : 'down',
      value: Math.abs(percentChange).toFixed(1)
    };
  };
  
  // Get CPU trend from time series data
  const cpuTrend = timeSeriesData.length > 1 
    ? calculateTrend(
        timeSeriesData[timeSeriesData.length - 1].cpu,
        timeSeriesData[timeSeriesData.length - 2].cpu
      )
    : { direction: 'neutral', value: 0 };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Real-Time Analytics Dashboard
              </Typography>
              <Typography color="gray">
                Monitor system performance and user activity in real-time
              </Typography>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </Card>
      <div className="space-y-6">
        {/* Status bar with refresh control */}
        <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <Typography variant="small" className="font-medium text-gray-700">
              Live System Metrics
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <Typography variant="small" color="gray" className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" /> 
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
            <Button 
              variant="text" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <Tabs value={activeTab}>
          <TabsHeader>
            <Tab value="system-metrics" onClick={() => setActiveTab("system-metrics")}>
              <div className="flex items-center gap-2">
                <ServerIcon className="h-4 w-4" />
                System Metrics
              </div>
            </Tab>
            <Tab value="user-activity" onClick={() => setActiveTab("user-activity")}>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" />
                User Activity
              </div>
            </Tab>
            <Tab value="ai-performance" onClick={() => setActiveTab("ai-performance")}>
              <div className="flex items-center gap-2">
                <CpuChipIcon className="h-4 w-4" />
                AI Performance
              </div>
            </Tab>
          </TabsHeader>
        </Tabs>
        
        {/* System Metrics Tab */}
        {activeTab === "system-metrics" && (
          <div className="space-y-6">
            {/* Key System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Usage Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                        CPU Usage
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Typography variant="h4" className="font-bold">
                          {metrics.cpuUsage.toFixed(1)}%
                        </Typography>
                        {cpuTrend.direction !== 'neutral' && (
                          <div className={`flex items-center text-xs ${cpuTrend.direction === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                            {cpuTrend.direction === 'up' ? (
                              <ArrowUpIcon className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownIcon className="h-3 w-3 mr-1" />
                            )}
                            {cpuTrend.value}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`p-2 rounded-full bg-${getStatusColor(metrics.cpuUsage)}-50`}>
                      <CpuChipIcon className={`h-5 w-5 text-${getStatusColor(metrics.cpuUsage)}-500`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress 
                      value={metrics.cpuUsage} 
                      color={getStatusColor(metrics.cpuUsage)} 
                      size="lg"
                    />
                  </div>
                </CardBody>
              </Card>
              
              {/* Memory Usage Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                        Memory Usage
                      </Typography>
                      <Typography variant="h4" className="font-bold">
                        {metrics.memoryUsage.toFixed(1)}%
                      </Typography>
                    </div>
                    <div className={`p-2 rounded-full bg-${getStatusColor(metrics.memoryUsage)}-50`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className={`h-5 w-5 text-${getStatusColor(metrics.memoryUsage)}-500`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress 
                      value={metrics.memoryUsage} 
                      color={getStatusColor(metrics.memoryUsage)} 
                      size="lg"
                    />
                  </div>
                </CardBody>
              </Card>
              
              {/* Disk Usage Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                        Storage Usage
                      </Typography>
                      <Typography variant="h4" className="font-bold">
                        {metrics.diskUsage.toFixed(1)}%
                      </Typography>
                    </div>
                    <div className="p-2 rounded-full bg-blue-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className="h-5 w-5 text-blue-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress 
                      value={metrics.diskUsage} 
                      color={getStatusColor(metrics.diskUsage, { warning: 80, critical: 95 })} 
                      size="lg"
                    />
                  </div>
                </CardBody>
              </Card>
              
              {/* Network Usage Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                        Network Traffic
                      </Typography>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <ArrowUpIcon className="h-3 w-3 text-blue-500" />
                          <Typography variant="small">
                            Out: {formatDataTransfer(metrics.networkOut)}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowDownIcon className="h-3 w-3 text-green-500" />
                          <Typography variant="small">
                            In: {formatDataTransfer(metrics.networkIn)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-purple-50">
                      <CloudIcon className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(metrics.networkOut / 50) * 100}%` }}></div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(metrics.networkIn / 50) * 100}%` }}></div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            {/* System Performance Chart */}
            <Card>
              <CardHeader className="p-4">
                <Typography variant="h6">System Performance Trends</Typography>
              </CardHeader>
              <CardBody className="p-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeSeriesData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" name="CPU (%)" />
                      <Area type="monotone" dataKey="memory" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Memory (%)" />
                      <Area type="monotone" dataKey="requests" stackId="3" stroke="#ffc658" fill="#ffc658" name="Requests/min" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
            
            {/* Additional System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Response Time Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Avg. Response Time
                    </Typography>
                    <div className="p-2 rounded-full bg-amber-50">
                      <BoltIcon className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                  <Typography variant="h4" className="font-bold mb-1">
                    {metrics.responseTime.toFixed(0)} ms
                  </Typography>
                  <Typography variant="small" color="gray">
                    Target: &lt;100ms
                  </Typography>
                  <div className="mt-2">
                    <Progress 
                      value={(metrics.responseTime / 2)} 
                      color={metrics.responseTime > 200 ? "red" : metrics.responseTime > 100 ? "amber" : "green"} 
                      size="sm"
                    />
                  </div>
                </CardBody>
              </Card>
              
              {/* Uptime Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      System Uptime
                    </Typography>
                    <div className="p-2 rounded-full bg-green-50">
                      <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <Typography variant="h4" className="font-bold mb-1">
                    {metrics.uptime.toFixed(2)}%
                  </Typography>
                  <Typography variant="small" color="gray">
                    Last 30 days
                  </Typography>
                  <div className="mt-2">
                    <Progress 
                      value={metrics.uptime} 
                      color="green" 
                      size="sm"
                    />
                  </div>
                </CardBody>
              </Card>
              
              {/* Error Rate Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Error Rate
                    </Typography>
                    <div className="p-2 rounded-full bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className="h-4 w-4 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                  </div>
                  <Typography variant="h4" className="font-bold mb-1">
                    {(metrics.errorRate * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="small" color="gray">
                    Target: &lt;0.1%
                  </Typography>
                  <div className="mt-2">
                    <Progress 
                      value={(metrics.errorRate * 1000)} 
                      color={metrics.errorRate > 0.1 ? "red" : metrics.errorRate > 0.05 ? "amber" : "green"} 
                      size="sm"
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
        
        {/* User Activity Tab */}
        {activeTab === "user-activity" && (
          <div className="space-y-6">
            {/* Active User Stats */}
            <Card>
              <CardHeader className="p-4">
                <Typography variant="h6">Active User Metrics</Typography>
              </CardHeader>
              <CardBody className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <Typography variant="small" color="gray">Current Active Users</Typography>
                        <Typography variant="h4" className="font-bold">
                          {metrics.activeUsers}
                        </Typography>
                      </div>
                      <div className="p-2 rounded-full bg-blue-50">
                        <UserGroupIcon className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <Typography variant="small" color="gray">Request Rate</Typography>
                        <Typography variant="h4" className="font-bold">
                          {metrics.requestRate.toFixed(0)}/min
                        </Typography>
                      </div>
                      <div className="p-2 rounded-full bg-teal-50">
                        <BoltIcon className="h-5 w-5 text-teal-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <Typography variant="small" color="gray">Active Jobs</Typography>
                        <Typography variant="h4" className="font-bold">
                          {metrics.activeJobs}
                        </Typography>
                      </div>
                      <div className="p-2 rounded-full bg-purple-50">
                        <DocumentChartBarIcon className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#8884d8" name="Requests/min" />
                      <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ff7d7d" name="Error Rate (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
            
            {/* User Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="p-4">
                  <Typography variant="h6">User Distribution</Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Admin', value: 5 },
                            { name: 'Data Scientists', value: 18 },
                            { name: 'Analysts', value: 42 },
                            { name: 'Viewers', value: 62 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <Typography variant="h6">Feature Usage</Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Knowledge Graph', value: 42 },
                          { name: 'AI Analytics', value: 68 },
                          { name: 'ETL Pipeline', value: 53 },
                          { name: 'NLP Services', value: 35 },
                          { name: 'Data Visualization', value: 71 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" name="Usage Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            {/* Active Sessions Table */}
            <Card>
              <CardHeader className="p-4 border-b border-gray-100">
                <Typography variant="h6">Active Sessions</Typography>
              </CardHeader>
              <CardBody className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { id: 1, name: "John Smith", role: "Data Scientist", status: "Active", location: "New York", duration: "1h 24m" },
                        { id: 2, name: "Alice Chen", role: "Admin", status: "Active", location: "San Francisco", duration: "45m" },
                        { id: 3, name: "Robert Kim", role: "Analyst", status: "Idle", location: "Chicago", duration: "2h 10m" },
                        { id: 4, name: "Emily Davis", role: "Data Scientist", status: "Active", location: "Miami", duration: "33m" },
                        { id: 5, name: "Michael Johnson", role: "Viewer", status: "Active", location: "Seattle", duration: "1h 05m" },
                      ].map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.role}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        
        {/* AI Performance Tab */}
        {activeTab === "ai-performance" && (
          <div className="space-y-6">
            {/* Model Performance Metrics */}
            <Card>
              <CardHeader className="p-4">
                <Typography variant="h6">AI Model Performance</Typography>
              </CardHeader>
              <CardBody className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Accuracy
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Latency (ms)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Throughput (req/min)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modelPerformance.map((model, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{model.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                model.accuracy > 95 ? 'text-green-600' : 
                                model.accuracy > 90 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {model.accuracy.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm ${
                                model.latency < 100 ? 'text-green-600' : 
                                model.latency < 200 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {model.latency.toFixed(0)} ms
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{model.throughput.toFixed(0)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Healthy
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
            
            {/* AI Performance Visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="p-4">
                  <Typography variant="h6">Model Accuracy Comparison</Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={modelPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[85, 100]} />
                        <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="accuracy" name="Accuracy (%)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <Typography variant="h6">Model Latency vs Throughput</Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={modelPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="latency" name="Latency (ms)" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="throughput" name="Throughput (req/min)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            {/* AI System Health */}
            <Card>
              <CardHeader className="p-4">
                <Typography variant="h6">AI System Health</Typography>
              </CardHeader>
              <CardBody className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Typography color="blue-gray" className="font-medium">GPU Utilization</Typography>
                      <MTTooltip content="Current GPU resource usage across all AI models">
                        <div className="h-5 w-5 text-gray-400 cursor-help">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                      </MTTooltip>
                    </div>
                    <div className="flex justify-between items-end">
                      <Typography variant="h4" className="font-bold">78%</Typography>
                      <div className="text-xs text-green-500 flex items-center">
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                        5.2%
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={78} color="blue" size="sm" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Typography color="blue-gray" className="font-medium">Inference Queue</Typography>
                      <MTTooltip content="Number of requests waiting for AI model processing">
                        <div className="h-5 w-5 text-gray-400 cursor-help">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                      </MTTooltip>
                    </div>
                    <div className="flex justify-between items-end">
                      <Typography variant="h4" className="font-bold">12</Typography>
                      <div className="text-xs text-red-500 flex items-center">
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                        2.1%
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={24} color="amber" size="sm" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Typography color="blue-gray" className="font-medium">Cache Hit Rate</Typography>
                      <MTTooltip content="Percentage of AI requests served from cache">
                        <div className="h-5 w-5 text-gray-400 cursor-help">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                      </MTTooltip>
                    </div>
                    <div className="flex justify-between items-end">
                      <Typography variant="h4" className="font-bold">68.4%</Typography>
                      <div className="text-xs text-green-500 flex items-center">
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                        3.2%
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={68.4} color="green" size="sm" />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default RealTimeDashboard;
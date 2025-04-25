'use client'

import React, { useState } from 'react';
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Progress,
  Switch,
  Textarea,
  Tooltip,
  Alert,
} from "@material-tailwind/react";
import { useRouter } from 'next/navigation';
import { colors } from '@material-tailwind/react/types/generic';
import { ChatBox } from '../ChatBox/ChatBox';

// User Dashboard Content Component
const UserDashboard: React.FC = () => {
  const navigate = useRouter();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    color: "green"
  });

  const handleExploreServices = () => {
    navigate.push('/dashboard/marketplace');
  };

  const handleNavigateToProjects = () => {
    navigate.push('/dashboard/projects');
  };

  const handleNavigateToAnalytics = () => {
    navigate.push('/dashboard/analytics');
  };

  const handleServiceClick = (service: string) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const showSuccessAlert = (message: string) => {
    setShowAlert({
      show: true,
      message: message,
      color: "green"
    });
    
    setTimeout(() => {
      setShowAlert({...showAlert, show: false});
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {showAlert.show && (
        <Alert
          open={showAlert.show}
          color={showAlert.color as colors}
          className="fixed top-20 right-4 z-50 max-w-md"
          icon={<CheckCircleIcon className="h-6 w-6" />}
          onClose={() => setShowAlert({...showAlert, show: false})}
        >
          {showAlert.message}
        </Alert>
      )}

      {/* Welcome Card */}
      <Card className="p-6 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-teal-500 mb-4">
                <SparklesIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">User Dashboard</span>
              </div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Welcome to Theoforge
              </Typography>
              <Typography color="gray">
                Access your AI services and explore new capabilities for your business
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button 
                color="teal" 
                className="flex items-center gap-2"
                size="sm"
                onClick={handleExploreServices}
              >
                <SparklesIcon className="h-4 w-4" /> 
                Explore Services
              </Button>
              <Button 
                color="blue" 
                className="flex items-center gap-2"
                size="sm"
                onClick={() => setIsChatOpen(true)}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" /> 
                Chat with AI
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </Card>
      
      {/* User Services */}
      <Card className="p-6 border border-gray-100">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          Your Services
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-teal-50">
                  <SparklesIcon className="h-5 w-5 text-teal-500" />
                </div>
                <Typography variant="h6">AI Assistants</Typography>
              </div>
              <Typography variant="small" color="gray">
                Leverage our AI assistants to automate tasks and enhance productivity.
              </Typography>
              <Button 
                variant="text" 
                color="teal" 
                className="mt-4 flex items-center gap-1"
                onClick={() => handleServiceClick("AI Assistants")}
              >
                Explore <ArrowRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </Card>
          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <ChartBarIcon className="h-5 w-5 text-blue-500" />
                </div>
                <Typography variant="h6">Data Analytics</Typography>
              </div>
              <Typography variant="small" color="gray">
                Access powerful analytics tools to derive insights from your data.
              </Typography>
              <Button 
                variant="text" 
                color="blue" 
                className="mt-4 flex items-center gap-1"
                onClick={() => handleServiceClick("Data Analytics")}
              >
                Explore <ArrowRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </Card>
          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-purple-50">
                  <CpuChipIcon className="h-5 w-5 text-purple-500" />
                </div>
                <Typography variant="h6">Machine Learning</Typography>
              </div>
              <Typography variant="small" color="gray">
                Implement custom ML models tailored to your business needs.
              </Typography>
              <Button 
                variant="text" 
                color="purple" 
                className="mt-4 flex items-center gap-1"
                onClick={() => handleServiceClick("Machine Learning")}
              >
                Explore <ArrowRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        </div>
      </Card>

      {/* Recent Projects */}
      <Card className="p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            Recent Projects
          </Typography>
          <Button 
            variant="text" 
            color="blue" 
            className="flex items-center gap-1"
            onClick={handleNavigateToProjects}
          >
            View All <ArrowRightIcon className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-4">
          <Card className="border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-teal-50">
                  <SparklesIcon className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <Typography variant="h6">Sales Forecasting</Typography>
                  <Typography variant="small" color="gray">Last updated: 2 days ago</Typography>
                </div>
              </div>
              <Tooltip content="Active project">
                <Button 
                  size="sm" 
                  color="teal" 
                  className="rounded-full cursor-pointer"
                  onClick={() => showSuccessAlert("Opened Sales Forecasting project")}
                >Active</Button>
              </Tooltip>
            </div>
            <Typography variant="small" className="mt-3 text-gray-600">
              AI-powered sales forecasting model for quarterly projections.
            </Typography>
            <Progress value={75} color="teal" className="h-1 mt-3" />
          </Card>
          
          <Card className="border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-50">
                  <ChartBarIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <Typography variant="h6">Customer Segmentation</Typography>
                  <Typography variant="small" color="gray">Last updated: 1 week ago</Typography>
                </div>
              </div>
              <Tooltip content="In progress">
                <Button 
                  size="sm"
                  color="blue" 
                  className="rounded-full cursor-pointer"
                  onClick={() => showSuccessAlert("Opened Customer Segmentation project")}
                >In Progress</Button>
              </Tooltip>
            </div>
            <Typography variant="small" className="mt-3 text-gray-600">
              Analyzing customer data to identify key market segments.
            </Typography>
            <Progress value={45} color="blue" className="h-1 mt-3" />
          </Card>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <Card className="p-6 border border-gray-100">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          Quick Actions
        </Typography>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button 
            color="teal" 
            variant="outlined" 
            className="flex flex-col items-center justify-center h-24 normal-case"
            onClick={() => setShowProjectModal(true)}
          >
            <SparklesIcon className="h-6 w-6 mb-2" />
            <span>New Project</span>
          </Button>
          <Button 
            color="blue" 
            variant="outlined" 
            className="flex flex-col items-center justify-center h-24 normal-case"
            onClick={() => setShowAnalysisModal(true)}
          >
            <ChartBarIcon className="h-6 w-6 mb-2" />
            <span>Run Analysis</span>
          </Button>
          <Button 
            color="purple" 
            variant="outlined" 
            className="flex flex-col items-center justify-center h-24 normal-case"
            onClick={() => setShowSupportModal(true)}
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 mb-2" />
            <span>Contact Support</span>
          </Button>
          <Button 
            color="amber" 
            variant="outlined" 
            className="flex flex-col items-center justify-center h-24 normal-case"
            onClick={() => setShowSettingsModal(true)}
          >
            <CpuChipIcon className="h-6 w-6 mb-2" />
            <span>AI Settings</span>
          </Button>
        </div>
      </Card>

      {/* Metrics at a Glance */}
      <Card className="p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            Metrics at a Glance
          </Typography>
          <Button 
            variant="text" 
            color="blue" 
            className="flex items-center gap-1"
            onClick={handleNavigateToAnalytics}
          >
            View Analytics <ArrowRightIcon className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-blue-50">
                <UsersIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">Active Users</Typography>
                <Typography variant="h4">1,234</Typography>
                <Typography variant="small" color="green">+12.3% vs last week</Typography>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-green-50">
                <CreditCardIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">Revenue</Typography>
                <Typography variant="h4">$12,345</Typography>
                <Typography variant="small" color="green">+8.7% vs last week</Typography>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-purple-50">
                <ChartBarIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <Typography variant="small" color="gray">Conversion Rate</Typography>
                <Typography variant="h4">3.45%</Typography>
                <Typography variant="small" color="green">+0.8% vs last week</Typography>
              </div>
            </div>
          </Card>
        </div>
      </Card>
{/* Service Modal */}
<Dialog
        open={showServiceModal}
        handler={() => setShowServiceModal(false)}
        size="lg"
      >
        <DialogHeader className="flex items-center gap-2">
          {selectedService === "AI Assistants" && (
            <SparklesIcon className="h-6 w-6 text-teal-500" />
          )}
          {selectedService === "Data Analytics" && (
            <ChartBarIcon className="h-6 w-6 text-blue-500" />
          )}
          {selectedService === "Machine Learning" && (
            <CpuChipIcon className="h-6 w-6 text-purple-500" />
          )}
          {selectedService}
        </DialogHeader>
        <DialogBody divider>
          {selectedService === "AI Assistants" && (
            <div className="space-y-4">
              <Typography>
                Our AI Assistant service provides cutting-edge conversational AI solutions to automate customer interactions, support internal processes, and enhance productivity.
              </Typography>
              <Typography variant="h6">Key Features:</Typography>
              <ul className="list-disc pl-6 space-y-2">
                <li>Natural language processing for human-like conversations</li>
                <li>Customizable workflows and knowledge base</li>
                <li>Multi-platform integration (website, mobile, messaging apps)</li>
                <li>Analytics dashboard for performance tracking</li>
                <li>24/7 automated support capability</li>
              </ul>
            </div>
          )}
          {selectedService === "Data Analytics" && (
            <div className="space-y-4">
              <Typography>
                Our Data Analytics platform empowers your team to transform raw data into actionable insights with powerful visualization and analysis tools.
              </Typography>
              <Typography variant="h6">Key Features:</Typography>
              <ul className="list-disc pl-6 space-y-2">
                <li>Real-time data processing and visualization</li>
                <li>Interactive dashboards with customizable widgets</li>
                <li>Advanced statistical modeling and trend analysis</li>
                <li>Automated reporting and export capabilities</li>
                <li>Integration with major data sources and warehouses</li>
              </ul>
            </div>
          )}
          {selectedService === "Machine Learning" && (
            <div className="space-y-4">
              <Typography>
                Our Machine Learning solutions allow you to harness the power of AI for predictive modeling, pattern recognition, and automation of complex tasks.
              </Typography>
              <Typography variant="h6">Key Features:</Typography>
              <ul className="list-disc pl-6 space-y-2">
                <li>Custom model development for your specific business needs</li>
                <li>Automated model training and optimization</li>
                <li>Deployment options for cloud, edge, or on-premises</li>
                <li>Model monitoring and performance tuning</li>
                <li>Integration with existing systems and workflows</li>
              </ul>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowServiceModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="teal"
            onClick={() => {
              setShowServiceModal(false);
              showSuccessAlert(`${selectedService} service activated successfully!`);
            }}
          >
            Activate Service
          </Button>
        </DialogFooter>
      </Dialog>

      {/* New Project Modal */}
      <Dialog
        open={showProjectModal}
        handler={() => setShowProjectModal(false)}
        size="md"
      >
        <DialogHeader>Create New Project</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Project Name
              </Typography>
              <Input label="Enter project name" crossOrigin={undefined} />
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Project Type
              </Typography>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500">
                <option value="">Select project type</option>
                <option value="ai_assistant">AI Assistant</option>
                <option value="data_analytics">Data Analytics</option>
                <option value="machine_learning">Machine Learning</option>
                <option value="custom">Custom Project</option>
              </select>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Description
              </Typography>
              <Textarea label="Project description" />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowProjectModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="teal"
            onClick={() => {
              setShowProjectModal(false);
              navigate.push('/dashboard/projects');
              showSuccessAlert("New project created successfully!");
            }}
          >
            Create Project
          </Button>
        </DialogFooter>
      </Dialog>
      
      {/* Run Analysis Modal */}
      <Dialog
        open={showAnalysisModal}
        handler={() => setShowAnalysisModal(false)}
        size="md"
      >
        <DialogHeader>Run Analysis</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Analysis Type
              </Typography>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500">
                <option value="">Select analysis type</option>
                <option value="predictive">Predictive Analysis</option>
                <option value="descriptive">Descriptive Statistics</option>
                <option value="sentiment">Sentiment Analysis</option>
                <option value="anomaly">Anomaly Detection</option>
              </select>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Data Source
              </Typography>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500">
                <option value="">Select data source</option>
                <option value="sales_data">Sales Data</option>
                <option value="customer_data">Customer Data</option>
                <option value="marketing_data">Marketing Data</option>
                <option value="custom">Custom Data Source</option>
              </select>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Parameters
              </Typography>
              <Textarea label="Analysis parameters" />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowAnalysisModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="blue"
            onClick={() => {
              setShowAnalysisModal(false);
              navigate.push('/dashboard/analytics');
              showSuccessAlert("Analysis started successfully!");
            }}
          >
            Run Analysis
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Contact Support Modal */}
      <Dialog
        open={showSupportModal}
        handler={() => setShowSupportModal(false)}
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
            onClick={() => setShowSupportModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="purple"
            onClick={() => {
              setShowSupportModal(false);
              showSuccessAlert("Support ticket submitted successfully!");
            }}
          >
            Submit Ticket
          </Button>
        </DialogFooter>
      </Dialog>

      {/* AI Settings Modal */}
      <Dialog
        open={showSettingsModal}
        handler={() => setShowSettingsModal(false)}
        size="md"
      >
        <DialogHeader>AI Settings</DialogHeader>
        <DialogBody divider>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6">Enable AI Suggestions</Typography>
                <Typography variant="small" color="gray">
                  Receive AI-powered recommendations based on your activity
                </Typography>
              </div>
              <Switch color="amber" defaultChecked crossOrigin={undefined} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6">Automated Reporting</Typography>
                <Typography variant="small" color="gray">
                  Generate and send reports automatically on schedule
                </Typography>
              </div>
              <Switch color="amber" crossOrigin={undefined} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6">Data Collection</Typography>
                <Typography variant="small" color="gray">
                  Allow anonymous usage data to improve our services
                </Typography>
              </div>
              <Switch color="amber" defaultChecked crossOrigin={undefined} />
            </div>
            
            <div>
              <Typography variant="h6" className="mb-2">Model Preference</Typography>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500">
                <option value="balanced">Balanced (Default)</option>
                <option value="speed">Optimize for Speed</option>
                <option value="accuracy">Optimize for Accuracy</option>
                <option value="efficiency">Optimize for Efficiency</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowSettingsModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="amber"
            onClick={() => {
              setShowSettingsModal(false);
              showSuccessAlert("AI settings updated successfully!");
            }}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ChatBox */}
      {isChatOpen && (
        <ChatBox 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </div>
  );
};

export default UserDashboard;
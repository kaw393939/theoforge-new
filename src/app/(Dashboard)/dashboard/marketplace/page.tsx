'use client'

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  CpuChipIcon,
  ChartBarIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  Typography,
  Card,
  Button,
  Chip,
  Alert,
} from "@material-tailwind/react";
import { colors } from '@material-tailwind/react/types/generic';

const Marketplace: React.FC = () => {
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
    <div className="space-y-6">
      <Card className="p-6 border border-gray-100 bg-gradient-to-r from-teal-600 to-blue-500 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Typography variant="h3" className="mb-2">
              AI Solution Marketplace
            </Typography>
            <Typography className="opacity-90 max-w-2xl">
              Browse and purchase AI solutions to enhance your business capabilities. Integrate seamlessly with your existing systems.
            </Typography>
          </div>
          <Button 
            color="white" 
            className="flex items-center gap-2 text-teal-800"
            size="lg"
          >
            <ShoppingBagIcon className="h-4 w-4" /> 
            Browse Solutions
          </Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-teal-50 text-teal-500">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5">AI Chatbot Builder</Typography>
            </div>
            <div className="mb-4">
              <Chip color="teal" value="Best Seller" className="mb-3" />
              <Typography color="blue-gray" className="mb-3">
                Build custom AI chatbots trained on your business data. Enhance customer support and automate common inquiries.
              </Typography>
              <Typography variant="h6" color="blue-gray" className="font-medium">
                $249/month
              </Typography>
            </div>
            <Button color="teal" fullWidth onClick={() => showNotification("AI Chatbot Builder added to your account!")}>
              Add to Account
            </Button>
          </div>
        </Card>
        
        <Card className="border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5">Predictive Analytics</Typography>
            </div>
            <div className="mb-4">
              <Chip color="blue" value="Popular" className="mb-3" />
              <Typography color="blue-gray" className="mb-3">
                Leverage machine learning to predict business trends and customer behavior based on historical data.
              </Typography>
              <Typography variant="h6" color="blue-gray" className="font-medium">
                $349/month
              </Typography>
            </div>
            <Button color="blue" fullWidth onClick={() => showNotification("Predictive Analytics added to your account!")}>
              Add to Account
            </Button>
          </div>
        </Card>
        
        <Card className="border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-purple-50 text-purple-500">
                <CpuChipIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5">Document Intelligence</Typography>
            </div>
            <div className="mb-4">
              <Chip color="purple" value="New" className="mb-3" />
              <Typography color="blue-gray" className="mb-3">
                Automatically extract, classify, and process information from documents, forms, and receipts.
              </Typography>
              <Typography variant="h6" color="blue-gray" className="font-medium">
                $199/month
              </Typography>
            </div>
            <Button color="purple" fullWidth onClick={() => showNotification("Document Intelligence added to your account!")}>
              Add to Account
            </Button>
          </div>
        </Card>
      </div>
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

export default Marketplace;
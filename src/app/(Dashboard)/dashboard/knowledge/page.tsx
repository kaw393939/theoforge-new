'use client'

import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowDownOnSquareIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
  Typography,
  Card,
  CardBody,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  Tab,
  Select,
  Option,
  Textarea
} from "@material-tailwind/react";
import KnowledgeGraph from '@/components/Dashboard/KnowledgeGraph';

export function KnowledgeGraphPage() {
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [isAddRelationModalOpen, setIsAddRelationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("visualization");
  
  const handleExport = (format: string) => {
    console.log(`Exporting in ${format} format`);
    // Implementationwould go here
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="p-6 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Knowledge Graph
              </Typography>
              <Typography color="gray">
                Visual representation of concepts, entities, and their relationships
              </Typography>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                color="teal" 
                className="flex items-center gap-2"
                size="sm"
                onClick={() => setIsAddNodeModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4" /> 
                Add Node
              </Button>
              
              <Button 
                color="blue" 
                className="flex items-center gap-2"
                size="sm"
                onClick={() => setIsAddRelationModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4" /> 
                Add Relation
              </Button>
              
              <Menu>
                <MenuHandler>
                  <Button 
                    color="blue-gray" 
                    variant="outlined"
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <ArrowDownOnSquareIcon className="h-4 w-4" /> 
                    Export
                    <ChevronDownIcon className="h-3 w-3" />
                  </Button>
                </MenuHandler>
                <MenuList>
                  <MenuItem onClick={() => handleExport('json')}>JSON</MenuItem>
                  <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
                  <MenuItem onClick={() => handleExport('pdf')}>PDF</MenuItem>
                  <MenuItem onClick={() => handleExport('png')}>PNG Image</MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} className="overflow-visible">
        <TabsHeader className="bg-white border border-gray-200">
          <Tab value="visualization" onClick={() => setActiveTab("visualization")}>
            Visualization
          </Tab>
          <Tab value="list" onClick={() => setActiveTab("list")}>
            List View
          </Tab>
          <Tab value="analytics" onClick={() => setActiveTab("analytics")}>
            Analytics
          </Tab>
        </TabsHeader>
      </Tabs>

      {/* Main Content */}
      <div className="h-[600px]">
        {activeTab === "visualization" && (
          <KnowledgeGraph />
        )}
        
        {activeTab === "list" && (
          <Card className="border border-gray-100 h-full">
            <CardBody>
              <div className="mb-4 flex gap-2">
                <div className="flex-grow">
                  <Input 
                    icon={<MagnifyingGlassIcon className="h-4 w-4" />} 
                    label="Search nodes and relationships" 
                    crossOrigin={undefined}
                  />
                </div>
              </div>
              
              <div className="text-center py-16">
                <Typography variant="h6" color="blue-gray">
                  List View Coming Soon
                </Typography>
                <Typography color="gray" className="mt-2">
                  This feature is currently under development
                </Typography>
              </div>
            </CardBody>
          </Card>
        )}
        
        {activeTab === "analytics" && (
          <Card className="border border-gray-100 h-full">
            <CardBody>
              <div className="text-center py-16">
                <Typography variant="h6" color="blue-gray">
                  Analytics View Coming Soon
                </Typography>
                <Typography color="gray" className="mt-2">
                  This feature is currently under development
                </Typography>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Add Node Modal */}
      <Dialog
        open={isAddNodeModalOpen}
        handler={() => setIsAddNodeModalOpen(false)}
        size="md"
      >
        <DialogHeader>Add New Node</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Node Label
              </Typography>
              <Input label="Enter node label" crossOrigin={undefined} />
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Node Type
              </Typography>
              <Select label="Select node type">
                <Option value="CONCEPT">Concept</Option>
                <Option value="ENTITY">Entity</Option>
                <Option value="PERSON">Person</Option>
                <Option value="DOCUMENT">Document</Option>
                <Option value="PROCESS">Process</Option>
              </Select>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Description
              </Typography>
              <Textarea label="Node description" />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsAddNodeModalOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="teal"
            onClick={() => {
              setIsAddNodeModalOpen(false);
            }}
          >
            Add Node
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Relation Modal */}
      <Dialog
        open={isAddRelationModalOpen}
        handler={() => setIsAddRelationModalOpen(false)}
        size="md"
      >
        <DialogHeader>Add New Relation</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Source Node
              </Typography>
              <Select label="Select source node">
                <Option value="1">Machine Learning</Option>
                <Option value="2">Neural Networks</Option>
                <Option value="7">Andrew Ng</Option>
              </Select>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Relation Type
              </Typography>
              <Input label="Enter relation type (e.g. 'includes', 'created by')" crossOrigin={undefined} />
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Target Node
              </Typography>
              <Select label="Select target node">
                <Option value="3">Data Analysis</Option>
                <Option value="4">Python</Option>
                <Option value="10">ML Research Paper</Option>
              </Select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsAddRelationModalOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="blue"
            onClick={() => {
              setIsAddRelationModalOpen(false);
            }}
          >
            Add Relation
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default KnowledgeGraphPage;
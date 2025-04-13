'use client'

import React, { useState } from 'react';
import {
  CheckCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Progress,
  Chip,
  Textarea,
  Alert,
} from "@material-tailwind/react";

interface Project {
  id: number,
  name: string,
  description: string,
  progress?: number,
  deadline: string,
  status: string,
  team: string[],
  priority: string
}

// Project Management Component
const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
    id: 1,
    name: 'AI Customer Service Bot',
    description: 'Implementing conversational AI for customer support',
    progress: 75,
    deadline: '2025-04-15',
    status: 'active',
    team: ['John D.', 'Sarah M.', 'Mike R.'],
    priority: 'high'
    },
    {
    id: 2,
    name: 'Data Warehouse Migration',
    description: 'Moving from legacy system to cloud data warehouse',
    progress: 45,
    deadline: '2025-05-20',
    status: 'active',
    team: ['Lisa K.', 'Tom B.'],
    priority: 'medium'
    },
    {
    id: 3,
    name: 'Mobile App Redesign',
    description: 'UX/UI overhaul of the mobile application',
    progress: 90,
    deadline: '2025-03-30',
    status: 'active',
    team: ['Alex J.', 'Maria S.', 'David L.', 'Emma W.'],
    priority: 'high'
    },
    {
    id: 4,
    name: 'CRM Integration',
    description: 'Connect sales platform with customer database',
    progress: 15,
    deadline: '2025-06-10',
    status: 'planned',
    team: ['Robert C.', 'Nina P.'],
    priority: 'medium'
    },
    {
    id: 5,
    name: 'Security Audit',
    description: 'Annual security review and compliance check',
    progress: 60,
    deadline: '2025-04-30',
    status: 'active',
    team: ['Daniel F.', 'Olivia M.'],
    priority: 'high'
    }
  ]);
    
  const [showModal, setShowModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [modalType, setModalType] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', color: 'green' });
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    deadline: '',
    status: 'planned',
    priority: 'medium',
    team: ''
  });
    
  const openModal = (type: string, project: Project | null = null) => {
    setModalType(type);
    setCurrentProject(project);
    
    if (type === 'new') {
    setProjectForm({
      name: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
      status: 'planned',
      priority: 'medium',
      team: ''
    });
    } else if (type === 'edit' && project) {
    setProjectForm({
      name: project.name,
      description: project.description,
      deadline: project.deadline,
      status: project.status,
      priority: project.priority,
      team: project.team.join(', ')
    });
    }
    
    setShowModal(true);
  };
    
  const handleStatusChange = (projectId: number, newStatus: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, status: newStatus } : project
    );
    setProjects(updatedProjects);
    
    showStatusAlert('Project status updated successfully!');
  };
    
  const handleFormChange = (field: string, value: string) => {
    setProjectForm({
    ...projectForm,
    [field]: value
    });
  };
    
  const handleSubmitProject = () => {
    if (modalType === 'new') {
    // Create new project
    const newProject = {
      id: projects.length + 1,
      name: projectForm.name,
      description: projectForm.description,
      progress: 0,
      deadline: projectForm.deadline,
      status: projectForm.status,
      team: typeof projectForm.team === 'string' ? projectForm.team.split(',').map(t => t.trim()) : projectForm.team,
      priority: projectForm.priority
    };
    
    setProjects([...projects, newProject]);
    showStatusAlert('New project created successfully!');
    } else if (modalType === 'edit' && currentProject) {
    // Update existing project
    const updatedProjects = projects.map(project => 
      project.id === currentProject.id 
      ? { 
        ...project,
        name: projectForm.name,
        description: projectForm.description,
        deadline: projectForm.deadline,
        status: projectForm.status,
        team: typeof projectForm.team === 'string' ? projectForm.team.split(',').map(t => t.trim()) : projectForm.team,
        priority: projectForm.priority
        } 
      : project
    );
    
    setProjects(updatedProjects);
    showStatusAlert('Project updated successfully!');
    }
    
    setShowModal(false);
  };
    
  const deleteProject = () => {
    if (currentProject) {
    const updatedProjects = projects.filter(project => project.id !== currentProject.id);
    setProjects(updatedProjects);
    setShowModal(false);
    showStatusAlert('Project deleted successfully!', 'red');
    }
  };
    
  const showStatusAlert = (message: string, color = 'green') => {
    setShowAlert({ show: true, message, color });
    setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
  };
    
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
    case 'active':
      return 'green';
    case 'planned':
      return 'blue';
    case 'completed':
      return 'purple';
    case 'paused':
      return 'amber';
    default:
      return 'gray';
    }
  };
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'amber';
    case 'low':
      return 'blue';
    default:
      return 'gray';
    }
  };

  // Format deadline date
  const formatDeadline = (deadline: string | number | Date) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Is deadline close or overdue
  const isDeadlineClose = (deadline: string | number | Date) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    
    return diffDays <= 7;
  };

  const isDeadlinePassed = (deadline: string | number | Date) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Alert */}
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
      
      {/* Header Card */}
      <Card className="p-6 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-500 mb-4">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Project Management</span>
              </div>
              <Typography variant="h3" color="blue-gray" className="mb-2">
                Your Projects
              </Typography>
              <Typography color="gray">
                Track and manage your active and upcoming projects
              </Typography>
            </div>
            <Button 
              color="blue" 
              className="flex items-center gap-2"
              size="sm"
              onClick={() => openModal('new')}
            >
              <DocumentTextIcon className="h-4 w-4" /> 
              New Project
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </Card>
      
      {/* Projects Container */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
        <Card key={project.id} className="border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-full bg-${getStatusColor(project.status)}-50`}>
                    <DocumentTextIcon className={`h-5 w-5 text-${getStatusColor(project.status)}-500`} />
                  </div>
                  <div>
                    <Typography variant="h6">{project.name}</Typography>
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={project.status}
                        color={getStatusColor(project.status)}
                        className="capitalize"
                      />
                      <Chip
                        size="sm"
                        variant="outlined"
                        value={project.priority}
                        color={getPriorityColor(project.priority)}
                        className="capitalize"
                      />
                        <Typography variant="small" color={isDeadlinePassed(project.deadline) ? "red" : isDeadlineClose(project.deadline) ? "amber" : "gray"} className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDeadline(project.deadline)}
                        </Typography>
                    </div>
                  </div>
                </div>
                <Typography variant="small" color="gray" className="mb-3">
                  {project.description}
                </Typography>
                <Progress value={project.progress} color={getStatusColor(project.status)} className="h-1" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.team.map((member, index) => (
                    <Chip
                      key={index}
                      value={member}
                      variant="outlined"
                      size="sm"
                      className="bg-gray-50"
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-start md:justify-end">
                <Menu placement="bottom-end">
                  <MenuHandler>
                    <Button color="gray" variant="outlined" size="sm">
                      Change Status
                    </Button>
                  </MenuHandler>
                  <MenuList>
                    <MenuItem onClick={() => handleStatusChange(project.id, 'planned')}>Planned</MenuItem>
                    <MenuItem onClick={() => handleStatusChange(project.id, 'active')}>Active</MenuItem>
                    <MenuItem onClick={() => handleStatusChange(project.id, 'paused')}>Paused</MenuItem>
                    <MenuItem onClick={() => handleStatusChange(project.id, 'completed')}>Completed</MenuItem>
                  </MenuList>
                </Menu>
                  <Button color="blue" variant="outlined" size="sm" onClick={() => openModal('view', project)}>
                    View
                  </Button>
              </div>
            </div>
          </div>
        </Card>
        ))}
      </div>
      
      {/* Modals */}
      <Dialog
        open={showModal}
        handler={() => setShowModal(false)}
        size="md"
      >
        <DialogHeader>
          {modalType === 'new' && 'Create New Project'}
          {modalType === 'edit' && 'Edit Project'}
          {modalType === 'view' && 'Project Details'}
          {modalType === 'delete' && 'Confirm Delete'}
        </DialogHeader>
        <DialogBody divider>
          {(modalType === 'new' || modalType === 'edit') && (
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Project Name
                </Typography>
                <Input
                  value={projectForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  label="Enter project name" crossOrigin={undefined}
                />
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Description
                </Typography>
                <Textarea
                  value={projectForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  label="Project description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Deadline
                  </Typography>
                  <Input
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => handleFormChange('deadline', e.target.value)} crossOrigin={undefined}                  />
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Status
                  </Typography>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    value={projectForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Priority
                  </Typography>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    value={projectForm.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Team Members
                </Typography>
                <Input
                  value={projectForm.team}
                  onChange={(e) => handleFormChange('team', e.target.value)}
                  label="Comma-separated list of members" crossOrigin={undefined}
                />
                </div>
              </div>
            </div>
          )}
          
          {modalType === 'view' && currentProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Chip
                  value={currentProject.status}
                  color={getStatusColor(currentProject.status)}
                  className="capitalize"
                />
                <Chip
                  variant="outlined"
                  value={currentProject.priority}
                  color={getPriorityColor(currentProject.priority)}
                  className="capitalize"
                />
                <Typography variant="small" color={isDeadlinePassed(currentProject.deadline) ? "red" : isDeadlineClose(currentProject.deadline) ? "amber" : "gray"} className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDeadline(currentProject.deadline)}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Description
                </Typography>
                <Typography className="mt-1">
                  {currentProject.description}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Progress
                </Typography>
                <div className="mt-1">
                  <Progress value={currentProject.progress} color={getStatusColor(currentProject.status)} className="h-2" />
                  <Typography variant="small" className="mt-1 text-right">
                    {currentProject.progress}%
                  </Typography>
                </div>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Team
                </Typography>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProject.team.map((member, index) => (
                    <Chip
                      key={index}
                      value={member}
                      className="bg-gray-50"
                    />
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Project Tasks
                </Typography>
                <div className="mt-2 space-y-2">
                  <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <Typography variant="small">Initial requirements gathering</Typography>
                    </div>
                    <Chip value="Completed" color="green" size="sm" />
                  </div>
                  
                  <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      <Typography variant="small">Design system architecture</Typography>
                    </div>
                    <Chip value="In Progress" color="blue" size="sm" />
                  </div>
                  
                  <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                      <Typography variant="small">Develop core functionality</Typography>
                    </div>
                    <Chip value="Pending" color="gray" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {modalType === 'delete' && currentProject && (
            <div>
              <Typography color="red" className="font-medium mb-2">
                Are you sure you want to delete this project?
              </Typography>
              <Typography variant="small" color="gray">
                This action cannot be undone. This will permanently delete the project "{currentProject.name}" and all associated data.
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {modalType === 'view' && (
                <Button
                  variant="text"
                  color="red"
                  onClick={() => {
                      openModal('delete', currentProject);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="text"
                color="gray"
                onClick={() => setShowModal(false)}
              >
                {modalType === 'view' ? 'Close' : 'Cancel'}
              </Button>
              
              {modalType === 'view' && (
                <Button
                  color="blue"
                  onClick={() => {
                      setShowModal(false);
                      openModal('edit', currentProject);
                  }}
                >
                  Edit Project
                </Button>
              )}
              
              {(modalType === 'new' || modalType === 'edit') && (
                <Button
                  color="blue"
                  onClick={handleSubmitProject}
                >
                  {modalType === 'new' ? 'Create Project' : 'Save Changes'}
                </Button>
              )}
              
              {modalType === 'delete' && (
                <Button
                  color="red"
                  onClick={deleteProject}
                >
                  Delete Project
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
  
export default ProjectManagement;
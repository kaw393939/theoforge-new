'use client'

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useContext } from 'react';
import {
  DocumentTextIcon,
  DocumentIcon,
  CheckIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  TrashIcon,
  FolderIcon,
  PhotoIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  IconButton,
  Input,
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  Spinner,
  Alert
} from "@material-tailwind/react";
import { API_URL } from '@/utils/axiosConfig';
import axios from 'axios';
import { AuthContext } from '@/components/Dashboard/AppContext';
import { cn } from '@/lib/utils'

// Define resources with the same fields as the backend
interface Resource {
  name: string;
  description?: string;
  category?: string;
  resource_type: string;
  tags?: string;
  profile_picture?: string;
  source_url?: string;
  file_path?: string;
  user_id: string;
  is_public: string;
  id: string;
  related_resources?: string[];
}

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [uploadFile, setUploadFile] = useState<any>(null)
  const [fileDescription, setFileDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "success" });
  const { accessToken } = useContext(AuthContext);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show success alert
  const showSuccessAlert = (message: string) => {
    setShowAlert({
      show: true,
      message,
      type: "success"
    });
    
    setTimeout(() => {
      setShowAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Show error alert
  const showErrorAlert = (message: string) => {
    setShowAlert({
      show: true,
      message,
      type: "error"
    });
    
    setTimeout(() => {
      setShowAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  const loadResources = async () => {
    // Ideally we have a router to get only user's files instead of all files
    try {
      await axios.get(`${API_URL}/resources/`);
    } catch {
      showErrorAlert('Failed to load resources');
    }
    setResources(resources);
    
    try {
      const res = await axios.get(`${API_URL}/resources/`);
      if(!(Array.isArray(res.data) && res.data.every(resource => typeof resource === 'object'))) {
        showErrorAlert("Failed to load resources");
        return;
      }
      setResources(res.data);
    } catch {
      showErrorAlert("Failed to load resources");
    }
  };
  
  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  // Filter resources based on active tab and search query
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "documents") return resource.resource_type === "PDF" && matchesSearch;
    if (activeTab === "images") return resource.resource_type === "IMAGE" && matchesSearch;
    if (activeTab === "other") return resource.resource_type === "OTHER" && matchesSearch;
    
    return matchesSearch;
  });

  // Upload resource
  const handleFileUpload = async () => {
    setIsUploading(true);
    try {
      const formdata = new FormData();
      formdata.append("title", uploadFile.name);
      if (fileDescription.length > 0) formdata.append("description", fileDescription);
      formdata.append("file", uploadFile);
      await axios.post(`${API_URL}/resources/`, formdata,
        {
          headers: { 'Authorization' : `Bearer ${accessToken}` }
        }
      );
      
      // Fetch updated resources
      loadResources();
      
      showSuccessAlert("File uploaded successfully!");
    } catch (error: any) {
      if(error.response && error.response.data && error.response.data.detail) {
        if(error.response.data.detail === 'Invalid token'){
          showErrorAlert('Authentication expired. Please log back in');
          return;
        }
      }
      showErrorAlert("Failed to upload file")
    } finally {
      // Reset states
      setFileDescription('');
      setUploadFile(null);
      setIsUploading(false);
      setIsUploadModalOpen(false);
    }
  };

  // Edit resource
  const editResource = async () => {
    setIsUploading(true);
    if (selectedResource) {
      try {
        const formdata = new FormData();
        if (uploadFile && uploadFile.name) formdata.append("title", uploadFile.name);
        else formdata.append("title", '');
        if (fileDescription.length > 0) formdata.append("description", fileDescription);
        if (uploadFile) formdata.append("file", uploadFile);
        console.log([...formdata.entries()]);
        await axios.put(`${API_URL}/resources/${selectedResource.id}`, formdata,
          {
            headers: { 'Authorization' : `Bearer ${accessToken}` }
          }
        );
        
        // Fetch updated resources
        loadResources();
        
        showSuccessAlert("File edited successfully!")
      } catch (error: any) {
        if(error.response && error.response.data && error.response.data.detail) {
          if(error.response.data.detail === 'Invalid token'){
            showErrorAlert('Authentication expired. Please log back in');
            return;
          }
        } showErrorAlert("Failed to edit file");
      } finally {
        // Reset states
        setFileDescription('');
        setUploadFile(null);
        setIsUploading(false);
        setIsEditModalOpen(false);
        setSelectedResource(null);
      }
    }
  }
  
  // Delete resource
  const deleteResource = async () => {
    if (selectedResource) {
      try {
        await axios.delete(`${API_URL}/resources/${selectedResource.id}`,
          {
            headers: { 'Authorization' : `Bearer ${accessToken}` }
          }
        );
        
        // Fetch updated resources
        loadResources();
        
        showSuccessAlert("File deleted successfully!");
      } catch (error: any) {
        if(error.response && error.response.data && error.response.data.detail) {
          if(error.response.data.detail === 'Invalid token'){
            showErrorAlert('Authentication expired. Please log back in');
            return;
          }
        }
        showErrorAlert("Failed to delete file")
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedResource(null);
      }
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  // Cancel resource upload
  const cancelFileUpload = () => {
    setUploadFile(null);
    setFileDescription('');
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
  };
  
  // Handle drag events
  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Get icon based on file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
      case 'IMAGE':
        return <PhotoIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get icon based on file name
  const getFileNameIcon = (name: string) => {
    const extention = name.split(".").pop()?.toLowerCase();
    if (extention === 'pdf') return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
    if (extention && ["jpg", "jpeg", "png", "gif"].includes(extention)) return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    return <DocumentIcon className="h-6 w-6 text-gray-500" />;
  }
  
  // Get color based on file type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'red';
      case 'IMAGE':
        return 'blue';
      default:
        return 'blue-gray';
    }
  };

  return (
    <div className="w-full">
      {/* Success/Error Alert */}
      {showAlert.show && (
        <Alert
          open={showAlert.show}
          onClose={() => setShowAlert(prev => ({ ...prev, show: false }))}
          animate={{
            mount: { y: 0 },
            unmount: { y: -100 },
          }}
          className="fixed top-4 right-4 z-50 max-w-md"
          color={showAlert.type === "success" ? "green" : "red"}
          icon={
            showAlert.type === "success" ? (
              <CheckIcon className="h-6 w-6" />
            ) : (
              <ExclamationCircleIcon className="h-6 w-6" />
            )
          }
        >
          {showAlert.message}
        </Alert>
      )}

      {/* Resources Header */}
      <Card className="w-full shadow-sm border border-gray-100 mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Typography variant="h4" color="blue-gray" className="mb-1">
                Resources
              </Typography>
              <Typography color="gray" className="font-normal">
                Manage your files and documents
              </Typography>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <IconButton
                  onClick={loadResources}
                  variant="text"
                  color="teal"
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                  size="sm"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </IconButton>
              </div>
              <div className="w-full md:w-auto">
                <Input
                  label="Search files"
                  icon={<DocumentIcon className="h-5 w-5 text-blue-gray-300" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-w-[250px]" crossOrigin={undefined}                />
              </div>
              <Button
                className="flex items-center gap-2"
                color="teal"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <CloudArrowUpIcon className="h-4 w-4" /> Upload File
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resources Content */}
      <Card className="w-full shadow-sm border border-gray-100">
        <CardHeader floated={false} shadow={false} className="rounded-none pt-4 pb-0">
          <Tabs value={activeTab}>
            <TabsHeader className="bg-gray-100 rounded-lg p-1">
              <Tab 
                value="all" 
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "font-medium" : ""}
              >
                All Files
              </Tab>
              <Tab 
                value="documents" 
                onClick={() => setActiveTab("documents")}
                className={activeTab === "documents" ? "font-medium" : ""}
              >
                Documents
              </Tab>
              <Tab 
                value="images" 
                onClick={() => setActiveTab("images")}
                className={activeTab === "images" ? "font-medium" : ""}
              >
                Images
              </Tab>
              <Tab 
                value="other" 
                onClick={() => setActiveTab("other")}
                className={activeTab === "other" ? "font-medium" : ""}
              >
                Other
              </Tab>
            </TabsHeader>
            <TabsBody animate={{ initial: { y: 250 }, mount: { y: 0 }, unmount: { y: 250 } }}>
              {["all", "documents", "images", "other"].map((value) => (
                <TabPanel key={value} value={value} className="p-0">
                  {filteredResources.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max table-auto text-left">
                        <thead>
                          <tr>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                Name
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                Type
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                Description
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                Actions
                              </Typography>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResources.map((resource, index) => {
                            const isLast = index === filteredResources.length - 1;
                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                            return (
                              <tr key={resource.id} className="hover:bg-blue-gray-50/30">
                                <td className={classes}>
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(resource.resource_type)}
                                    <div>
                                      <Typography variant="small" color="blue-gray" className="font-medium w-32 overscroll-x-contain overflow-auto">
                                        {resource.name}
                                      </Typography>
                                    </div>
                                  </div>
                                </td>
                                <td className={classes}>
                                  <Chip
                                    size="sm"
                                    variant="ghost"
                                    value={resource.resource_type.toUpperCase()}
                                    color={getTypeColor(resource.resource_type)}
                                  />
                                </td>
                                <td className={classes}>
                                  <Typography variant="small" color="blue-gray" className="font-medium w-32 overscroll-x-contain overflow-auto">
                                    {resource.description ? resource.description : ''}
                                  </Typography>
                                </td>
                                <td className={classes}>
                                  <div className="flex items-center gap-2">
                                    {/* Edit button */}
                                    <IconButton
                                      variant="text"
                                      color="blue-gray"
                                      onClick={() => {
                                        setSelectedResource(resource);
                                        setIsEditModalOpen(true);
                                      }}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </IconButton>
                                    
                                    {/* Delete button */}
                                    <IconButton
                                      variant="text"
                                      color="red"
                                      onClick={() => {
                                        setSelectedResource(resource);
                                        setIsDeleteModalOpen(true);
                                      }}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </IconButton>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FolderIcon className="h-16 w-16 text-blue-gray-200 mb-4" />
                      <Typography color="blue-gray" className="mb-2 font-medium">
                        No files found
                      </Typography>
                      <Typography color="gray" className="text-center max-w-xs">
                        {searchQuery
                          ? `No files matching "${searchQuery}" were found. Try a different search term.`
                          : activeTab === "all"
                          ? "You haven't uploaded any files yet. Click the 'Upload File' button to get started."
                          : activeTab === "documents"
                          ? "You haven't uploaded any documents yet. Click the 'Upload File' button to get started."
                          : activeTab === "images"
                          ? "You haven't uploaded any images yet. Click the 'Upload File' button to get started."
                          : ""}
                      </Typography>
                      <Button
                        variant="text"
                        color="teal"
                        className="mt-4 flex items-center gap-2"
                        onClick={() => setIsUploadModalOpen(true)}
                      >
                        <CloudArrowUpIcon className="h-4 w-4" /> Upload File
                      </Button>
                    </div>
                  )}
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Upload Modal */}
      <Dialog
        open={isUploadModalOpen}
        handler={() => !isUploading && cancelFileUpload()}
        size="md"
      >
        <DialogHeader>Upload Files</DialogHeader>
        <DialogBody divider>
          <div
            className={cn(
              uploadFile ? "border-black" : "border-dashed",
              "border-2 rounded-lg p-8 transition-colors cursor-pointer text-center",
              isDragging
                ? "border-teal-500 bg-teal-50"
                : "border-blue-gray-200 hover:border-teal-500 hover:bg-teal-50/30"
            )}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Spinner className="h-12 w-12 text-teal-500" />
                <Typography color="teal" className="font-medium">
                  Uploading...
                </Typography>
              </div>
            ) : uploadFile ? (
              <div className="flex items-center gap-3">
                  <div>{getFileNameIcon(uploadFile.name)}</div>
                  <Typography variant="small" color="blue-gray" className="font-medium overscroll-x-contain overflow-auto">
                    {uploadFile.name}
                  </Typography>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className="h-12 w-12 text-blue-gray-300 mx-auto mb-4" />
                <Typography color="blue-gray" className="font-medium mb-1">
                  Drag and drop a file here
                </Typography>
                <Typography color="gray" className="text-sm">
                  or <span className="text-teal-500 font-medium">browse</span> to upload
                </Typography>
                <Typography color="gray" className="text-xs mt-4">
                  Supported formats: PDF, JPG, JPEG, PNG, GIF
                </Typography>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              disabled={isUploading}
            />
          </div>
          <div className='mt-4'>
            <Input
              label="Description"
              value={fileDescription}
              onChange={(e) => {setFileDescription(e.target.value);}}
              crossOrigin={undefined}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => !isUploading && cancelFileUpload()}
            disabled={isUploading}
          >
            Cancel
          </Button>
          {uploadFile && (
            <Button
              color="teal"
              onClick={handleFileUpload}
            >Upload</Button>
          )}
        </DialogFooter>
      </Dialog>
      
      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        handler={() => !isUploading && cancelFileUpload()}
        size="md"
      >
        <DialogHeader>Edit Files</DialogHeader>
        <DialogBody divider>
          <div
            className={cn(
              "border-2 border-black rounded-lg p-8 transition-colors cursor-pointer text-center",
              isDragging
                ? "border-teal-500 bg-teal-50"
                : "border-blue-gray-200 hover:border-teal-500 hover:bg-teal-50/30"
            )}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Spinner className="h-12 w-12 text-teal-500" />
                <Typography color="teal" className="font-medium">
                  Uploading...
                </Typography>
              </div>
            ) : uploadFile ? (
              <div className="flex items-center gap-3">
                  <div>{getFileNameIcon(uploadFile.name)}</div>
                  <Typography variant="small" color="blue-gray" className="font-medium overscroll-x-contain overflow-auto">
                    {uploadFile.name}
                  </Typography>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                  <div>{getFileIcon(selectedResource ? selectedResource.resource_type : '')}</div>
                  <Typography variant="small" color="blue-gray" className="font-medium overscroll-x-contain overflow-auto">
                    {selectedResource ? selectedResource.name : ''}
                  </Typography>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              disabled={isUploading}
            />
          </div>
          <div className='mt-4'>
            <Input
              label="Description"
              value={fileDescription}
              onChange={(e) => {setFileDescription(e.target.value);}}
              crossOrigin={undefined}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => !isUploading && cancelFileUpload()}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            color="teal"
            onClick={editResource}
          >
            Edit
          </Button>
        </DialogFooter>
      </Dialog>

      {/* DeleteConfirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        handler={() => setIsDeleteModalOpen(false)}
        size="xs"
      >
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody divider>
          Are you sure you want to delete{" "}
          <span className="font-medium">{selectedResource?.name}</span>? This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={deleteResource}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Resources;
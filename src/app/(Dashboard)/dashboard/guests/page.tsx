'use client'

import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, EyeIcon, HomeIcon, MagnifyingGlassIcon, MinusIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { API_URL } from '@/utils/axiosConfig'
import { v4 as uuidv4 } from 'uuid';

interface Interaction {
  event: string,
  timestamp: string,
}

interface Guest {
  additional_notes?: string;
  budget?: string;
  company?: string;
  contact_info?: string;
  created_at?: string;
  current_tech?: string[];
  first_visit_timestamp?: string;
  id?: string;
  industry?: string;
  interaction_events?: string[];
  interaction_history?: Interaction[];
  name?: string;
  page_views?: string[];
  pain_points?: string[];
  project_type?: string[];
  session_id?: string;
  status?: 'NEW' | 'CONTACTED' | 'CONVERTED';
  timeline?: string;
  updated_at?: string;
}

const GuestsTable: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<Guest>({});
  const [numProjectTypeFields, setNumProjectTypeFields] = useState(1);
  const [numPainPointFields, setNumPainPointFields] = useState(1);
  const [numCurrentTechFields, setNumCurrentTechFields] = useState(1);
  const [editFormData, setEditFormData] = useState<Guest>({});
  const [showError, setShowError] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/guests/`);
      if(!(Array.isArray(res.data) && res.data.every(guest => typeof guest === 'object'))) {
        setShowError(true);
        throw Error //Ensure an array of guests is returned
      } else setShowError(false);
      setGuests(res.data);
    } catch {
      setShowError(true);
    }
    setLoading(false);
  };

  const handleView = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsViewModalOpen(true);
  }

  const handleCreate = () => {
    setNumProjectTypeFields(1);
    setNumPainPointFields(1);
    setNumCurrentTechFields(1);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest);
    setNumProjectTypeFields(guest.project_type ? guest.project_type.length : 0);
    setNumPainPointFields(guest.pain_points ? guest.pain_points.length : 0);
    setNumCurrentTechFields(guest.current_tech ? guest.current_tech.length: 0);
    setEditFormData(guest);
    setIsEditModalOpen(true);
  };

  const handleDelete = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!createFormData) return;

    try {
      createFormData.session_id = uuidv4();
      await axios.post(`${API_URL}/guests/`, createFormData);

      // Update guests
      fetchGuests();
      
      setIsCreateModalOpen(false);
      setCreateFormData({});
    } catch (error) {
      console.error('Error creating guest:', error);
      // Handle error (show error message to user)
    }
  };

  const handleEditSubmit = async () => {
    if (!editFormData) return;

    try {
      await axios.put(`${API_URL}/guests/${editFormData.id}`, editFormData);

      // Update guests
      fetchGuests();
      
      setIsEditModalOpen(false);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating guest:', error);
      // Handle error (show error message to user)
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGuest) return;

    try {
      await axios.delete(`${API_URL}/guests/${selectedGuest.id}`);
      
      // Update guests
      fetchGuests();
      
      setIsDeleteModalOpen(false);
      setSelectedGuest(null);
    } catch (error) {
      console.error('Error deleting guest:', error);
      // Handle error (show error message to user)
    }
  };

  const getStatusColor = (status: Guest['status']) => {
    switch (status) {
      case 'NEW':
        return 'blue';
      case 'CONTACTED':
        return 'amber';
      case 'CONVERTED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const filteredGuests = guests.filter(guest =>
    searchTerm.toLowerCase() === '' ? true :
    (guest.name ? guest.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guest.company ? guest.company.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guest.industry ? guest.industry.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guest.budget ? guest.budget.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guest.contact_info ? guest.contact_info.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guest.status ? guest.status.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);

  const TABLE_HEAD = ["Name", "Company", "Industry", "Budget", "Contact", "Status", "Last Interaction", "Actions"];

  const viewField = (field: string, value: string | undefined) => {
    return (
      <div className="inline-flex flex-row gap-2 w-full">
        <Typography variant="small" color="blue-gray" className="font-normal w-24">
          {field}
        </Typography>
        <Card className={value ? value.length > 0 ? "overscroll-x-contain overflow-auto border-black border-2 h-min w-full" :
        "overscroll-x-contain overflow-auto border-black border-2 w-full" :
        "overscroll-x-contain overflow-auto w-full"}>
          <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto p-2">
            {value ? value : ''}
          </Typography>
        </Card>
      </div>
    )
  }
  if(showError) return (
  <Alert
    color="red"
    variant="outlined"
    className="mb-6 border border-red-200"
    icon={
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    }
  >
    Failed to retrieve guests
  </Alert>
  )
  return (
    <Card className="border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div>
          <Typography variant="h5" color="blue-gray">
            Guest Management
          </Typography>
          <Typography variant="small" color="gray">
            View and manage guest accounts in your system
          </Typography>
        </div>
        <Button 
          color="teal" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleCreate()}
        >
          <HomeIcon className="h-4 w-4" /> Add Guest
        </Button>
      </div>
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-8 mb-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Guests list
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See information about all guests
            </Typography>
          </div>
          <div className="flex shrink-0 gap-2 sm:flex-row">
            <div>
              <IconButton
                onClick={fetchGuests}
                variant="text"
                color="teal"
                className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                size="sm"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  <Typography variant="small" color="blue-gray" className="animate-pulse">
                    Loading...
                  </Typography>
                </td>
              </tr>
            ) : (
              paginatedGuests.map((guest, index) => {
                const isLast = index === paginatedGuests.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                return (
                  <tr key={guest.id}>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto w-32">
                        {guest.name ? guest.name : ''}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto w-32">
                        {guest.company ? guest.company : ''}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto w-32">
                        {guest.industry ? guest.industry : ''}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto w-32">
                        {guest.budget ? guest.budget : ''}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal overscroll-x-contain overflow-auto w-32">
                        {guest.contact_info ? guest.contact_info : ''}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={guest.status}
                          color={getStatusColor(guest.status)}
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {guest.interaction_history && guest.interaction_history.length > 0 ? guest.interaction_history[guest.interaction_history.length-1].timestamp  : 'None'}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="flex gap-2">
                        <IconButton
                          variant="text"
                          color="teal"
                          onClick={() => handleView(guest)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="teal"
                          onClick={() => handleEdit(guest)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => handleDelete(guest)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardBody>
      <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Page {currentPage} of {totalPages}
        </Typography>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog
        size="md"
        open={isCreateModalOpen}
        handler={() => setIsCreateModalOpen(false)}
      >
        <DialogHeader>Create Guest</DialogHeader>
        <DialogBody>
          <div className="grid gap-6 overscroll-y-contain overflow-auto h-96">
            <Input
              label="Name"
              value={createFormData.name ? createFormData.name : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Company"
              value={createFormData.company ? createFormData.company : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, company: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Industry"
              value={createFormData.industry ? createFormData.industry : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, industry: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Budget"
              value={createFormData.budget ? createFormData.budget : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, budget: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Timeline"
              value={createFormData.timeline ? createFormData.timeline : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, timeline: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Contact Info"
              value={createFormData.contact_info ? createFormData.contact_info : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, contact_info: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Additional Notes"
              value={createFormData.additional_notes ? createFormData.additional_notes : ''}
              onChange={(e) => setCreateFormData({ ...createFormData, additional_notes: e.target.value })}
              crossOrigin={undefined}
            />
            {
              // Create project type fields based on numProjectTypeFields
              Array.from({length: numProjectTypeFields}, (_, num) => num+1 && 
              <Input
                key={"Project Type "+(num+1)}
                label={"Project Type "+(num+1)}
                value={createFormData.project_type ? createFormData.project_type[num] : ''}
                onChange={(e) => setCreateFormData({ ...createFormData, project_type: createFormData.project_type ? createFormData.project_type.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                crossOrigin={undefined}
              />)
            }
            <div className="inline-flex flex-row gap-6">
              <Button
                color="green"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                onClick={() => {
                  setNumProjectTypeFields((x)=> x+1);
                  // Add empty project type to form data
                  setCreateFormData({ ...createFormData, project_type: createFormData.project_type ? createFormData.project_type.concat(['']) : ['']})
                }}>
                Add Project Type<PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="red"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                disabled={numProjectTypeFields === 0 ? true : false}
                onClick={() => {
                  // Remove last project type from form data
                  setCreateFormData({ ...createFormData, project_type: createFormData.project_type ? (numProjectTypeFields === 1 ? undefined : createFormData.project_type.slice(0, -1)) : undefined})
                  // There can be 0 fields, meaning project type is null
                  setNumProjectTypeFields((x)=> Math.max(x-1, 0));
                }}>
                Remove Project Type<MinusIcon className="h-4 w-4" />
              </Button>
            </div>
            {
              // Create pain point fields based on numPainPointFields
              Array.from({length: numPainPointFields}, (_, num) => num+1 && 
              <Input
                key={"Pain Point "+(num+1)}
                label={"Pain Point "+(num+1)}
                value={createFormData.pain_points ? createFormData.pain_points[num] : ''}
                onChange={(e) => setCreateFormData({ ...createFormData, pain_points: createFormData.pain_points ? createFormData.pain_points.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                crossOrigin={undefined}
              />)
            }
            <div className="inline-flex flex-row gap-6">
              <Button
                color="green"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                onClick={() => {
                  setNumPainPointFields((x)=> x+1);
                  // Add empty pain point to form data
                  setCreateFormData({ ...createFormData, pain_points: createFormData.pain_points? createFormData.pain_points.concat(['']) : ['']})
                }}>
                Add Pain Point<PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="red"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                disabled={numPainPointFields === 0 ? true : false}
                onClick={() => {
                  // Remove last pain point from form data
                  setCreateFormData({ ...createFormData, pain_points: createFormData.pain_points ? (numPainPointFields === 1 ? undefined : createFormData.pain_points.slice(0, -1)) : undefined})
                  // There can be 0 fields, meaning pain point is null
                  setNumPainPointFields((x)=> Math.max(x-1, 0));
                }}>
                Remove Pain Point<MinusIcon className="h-4 w-4" />
              </Button>
            </div>
            {
              // Create current tech fields based on numCurrentTechFields
              Array.from({length: numCurrentTechFields}, (_, num) => num+1 && 
              <Input
                key={"Current Tech "+(num+1)}
                label={"Current Tech "+(num+1)}
                value={createFormData.current_tech ? createFormData.current_tech[num] : ''}
                onChange={(e) => setCreateFormData({ ...createFormData, current_tech: createFormData.current_tech ? createFormData.current_tech.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                crossOrigin={undefined}
              />)
            }
            <div className="inline-flex flex-row gap-6">
              <Button
                color="green"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                onClick={() => {
                  setNumCurrentTechFields((x)=> x+1);
                  // Add empty current tech to form data
                  setCreateFormData({ ...createFormData, current_tech: createFormData.current_tech ? createFormData.current_tech.concat(['']) : ['']})
                }}>
                Add Current Tech<PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="red"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                disabled={numCurrentTechFields === 0 ? true : false}
                onClick={() => {
                  // Remove last current tech from form data
                  setCreateFormData({ ...createFormData, current_tech: createFormData.current_tech ? (numCurrentTechFields === 1 ? undefined : createFormData.current_tech.slice(0, -1)) : undefined})
                  // There can be 0 fields, meaning current tech is null
                  setNumCurrentTechFields((x)=> Math.max(x-1, 0));
                }}>
                Remove Current Tech<MinusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Status
              </Typography>
              <select
                value={createFormData.status}
                onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value as 'NEW' | 'CONTACTED' | 'CONVERTED' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="red" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleCreateSubmit}>
            Create
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Modal */}
      <Dialog
        size="lg"
        open={isViewModalOpen}
        handler={() => setIsViewModalOpen(false)}
      >
        <DialogHeader className="pb-0">View Guest</DialogHeader>
        <DialogBody>
          <div>{/*Fix jest detecting no children in DialogBody error*/}</div>
          {selectedGuest && (
            <div className="grid grid-cols-3 grid-flow-row gap-2 overscroll-y-contain overflow-auto h-96 w-full">
              {viewField('Name:', selectedGuest.name)}
              {viewField('Id:', String(selectedGuest.id))}
              {viewField('Session Id:', selectedGuest.session_id)}
              {viewField('Company:', selectedGuest.company)}
              {viewField('Industry:', selectedGuest.industry)}
              {viewField('Budget:', selectedGuest.budget)}
              {viewField('Contact:', selectedGuest.contact_info)}
              {viewField('Timeline:', selectedGuest.timeline)}
              {viewField('Additional Notes:', selectedGuest.additional_notes)}
              {viewField('Status:', selectedGuest.status)}
              {viewField('Created At:', selectedGuest.created_at)}
              {viewField('Updated At:', selectedGuest.updated_at)}
              {viewField('First Visit Time:', selectedGuest.first_visit_timestamp)}
              {viewField('Interaction History:', selectedGuest.interaction_history ? selectedGuest.interaction_history.map(obj => `${obj.event} at ${obj.timestamp}`).join(', ') : undefined)}
              {viewField('Interaction Events:', selectedGuest.interaction_events ? selectedGuest.interaction_events.join(', ') : undefined)}
              {viewField('Project Types:', selectedGuest.project_type ? selectedGuest.project_type.join(', ') : undefined)}
              {viewField('Pain Points:', selectedGuest.pain_points? selectedGuest.pain_points.join(', ') : undefined)}
              {viewField('Current Tech:', selectedGuest.current_tech ? selectedGuest.current_tech.join(', ') : undefined)}
              {viewField('Page Views:', selectedGuest.page_views ? selectedGuest.page_views.join(', ') : undefined)}
            </div>
          )}
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="blue-gray" onClick={() => setIsViewModalOpen(false)}>
            Exit
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        size="md"
        open={isEditModalOpen}
        handler={() => setIsEditModalOpen(false)}
      >
        <DialogHeader>Edit Guest</DialogHeader>
        <DialogBody>
          <div className="grid gap-6 overscroll-y-contain overflow-auto h-96">
            <Input
              label="Name"
              value={editFormData.name ? editFormData.name : ''}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Company"
              value={editFormData.company ? editFormData.company : ''}
              onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Industry"
              value={editFormData.industry ? editFormData.industry : ''}
              onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Budget"
              value={editFormData.budget ? editFormData.budget : ''}
              onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Timeline"
              value={editFormData.timeline ? editFormData.timeline : ''}
              onChange={(e) => setEditFormData({ ...editFormData, timeline: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Contact Info"
              value={editFormData.contact_info ? editFormData.contact_info : ''}
              onChange={(e) => setEditFormData({ ...editFormData, contact_info: e.target.value })}
              crossOrigin={undefined}
            />
            <Input
              label="Additional Notes"
              value={editFormData.additional_notes ? editFormData.additional_notes : ''}
              onChange={(e) => setEditFormData({ ...editFormData, additional_notes: e.target.value })}
              crossOrigin={undefined}
            />
            {
              // Create project type fields based on numProjectTypeFields
              Array.from({length: numProjectTypeFields}, (_, num) => num+1 && 
              <Input
                key={"Project Type "+(num+1)}
                label={"Project Type "+(num+1)}
                value={editFormData.project_type ? editFormData.project_type[num] : ''}
                onChange={(e) => setEditFormData({ ...editFormData, project_type: editFormData.project_type ? editFormData.project_type.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                crossOrigin={undefined}
              />)
            }
            <div className="inline-flex flex-row gap-6">
              <Button
                color="green"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                onClick={() => {
                  setNumProjectTypeFields((x)=> x+1);
                  // Add empty project type to form data
                  setEditFormData({ ...editFormData, project_type: editFormData.project_type ? editFormData.project_type.concat(['']) : ['']})
                }}>
                Add Project Type<PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="red"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                disabled={numProjectTypeFields === 0 ? true : false}
                onClick={() => {
                  // Remove last project type from form data
                  setEditFormData({ ...editFormData, project_type: editFormData.project_type ? (numProjectTypeFields === 1 ? undefined : editFormData.project_type.slice(0, -1)) : undefined})
                  // There can be 0 fields, meaning project type is null
                  setNumProjectTypeFields((x)=> Math.max(x-1, 0));
                }}>
                Remove Project Type<MinusIcon className="h-4 w-4" />
              </Button>
            </div>
            {
              // Create pain point fields based on numPainPointFields
              Array.from({length: numPainPointFields}, (_, num) => num+1 && 
              <Input
                key={"Pain Point "+(num+1)}
                label={"Pain Point "+(num+1)}
                value={editFormData.pain_points ? editFormData.pain_points[num] : ''}
                onChange={(e) => setEditFormData({ ...editFormData, pain_points: editFormData.pain_points ? editFormData.pain_points.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                crossOrigin={undefined}
              />)
            }
            <div className="inline-flex flex-row gap-6">
              <Button
                color="green"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                onClick={() => {
                  setNumPainPointFields((x)=> x+1);
                  // Add empty pain point to form data
                  setEditFormData({ ...editFormData, pain_points: editFormData.pain_points? editFormData.pain_points.concat(['']) : ['']})
                }}>
                Add Pain Point<PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="red"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                disabled={numPainPointFields === 0 ? true : false}
                onClick={() => {
                  // Remove last pain point from form data
                  setEditFormData({ ...editFormData, pain_points: editFormData.pain_points ? (numPainPointFields === 1 ? undefined : editFormData.pain_points.slice(0, -1)) : undefined})
                  // There can be 0 fields, meaning pain point is null
                  setNumPainPointFields((x)=> Math.max(x-1, 0));
                }}>
                Remove Pain Point<MinusIcon className="h-4 w-4" />
              </Button>
            </div>
            {
              // Create current tech fields based on numCurrentTechFields
              Array.from({length: numCurrentTechFields}, (_, num) => num+1 && 
              <Input
                key={"Current Tech "+(num+1)}
                label={"Current Tech "+(num+1)}
                value={editFormData.current_tech? editFormData.current_tech[num] : ''}
                onChange={(e) => setEditFormData({ ...editFormData, current_tech: editFormData.current_tech ? editFormData.current_tech.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                crossOrigin={undefined}
              />)
            }
            <div className="inline-flex flex-row gap-6">
              <Button
                color="green"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                onClick={() => {
                  setNumCurrentTechFields((x)=> x+1);
                  // Add empty current tech to form data
                  setEditFormData({ ...editFormData, current_tech: editFormData.current_tech ? editFormData.current_tech.concat(['']) : ['']})
                }}>
                Add Current Tech<PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                color="red"
                size="sm"
                className="w-max h-max flex items-center gap-1"
                disabled={numCurrentTechFields === 0 ? true : false}
                onClick={() => {
                  // Remove last current tech from form data
                  setEditFormData({ ...editFormData, current_tech: editFormData.current_tech ? (numCurrentTechFields === 1 ? undefined : editFormData.current_tech.slice(0, -1)) : undefined})
                  // There can be 0 fields, meaning current tech is null
                  setNumCurrentTechFields((x)=> Math.max(x-1, 0));
                }}>
                Remove Current Tech<MinusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Status
              </Typography>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'NEW' | 'CONTACTED' | 'CONVERTED' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="red" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* DeleteConfirmation Modal */}
      <Dialog
        size="xs"
        open={isDeleteModalOpen}
        handler={() => setIsDeleteModalOpen(false)}
      >
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete {selectedGuest?.name}? This action cannot be undone.
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="blue-gray" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
    </Card>
  );
}

export default GuestsTable;
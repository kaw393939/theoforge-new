/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Search, UserCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import  Button  from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL, AuthContext } from './AppContext';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Interaction {
  event: string,
  timestamp: string,
}

interface Guest {
  additional_notes?: string;
  budget?: string;
  company?: string;
  contact_info?: string;
  created_at: string;
  current_tech?: string[];
  first_visit_timestamp?: string;
  id: string;
  industry?: string;
  interaction_events?: string[];
  interaction_history?: Interaction[];
  name?: string;
  page_views?: string[];
  pain_points?: string[];
  project_type?: string[];
  session_id?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  timeline?: string;
  updated_at: string;
}

const GuestsTable: React.FC = () => {
  const { isAuthenticated, accessToken } = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isGuestsLoading, setIsGuestsLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGuestDetailsDialogOpen, setIsGuestDetailsDialogOpen] = useState(false);

  const [guests, setGuests] = useState<Guest[]>([]);
  // Filter guests based on search term (by ID)
  const filteredGuests = guests.filter(guest => 
    guest.id.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.name?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.company?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.contact_info?.toLowerCase().includes(guestSearchTerm.toLowerCase())
  );

  // Fetch guests from API
  useEffect(() => {
    const fetchGuests = async () => {
      setIsGuestsLoading(true);
      setGuestError(null);
      setSuccessMessage(null);

      try {
        console.log('Attempting to fetch guests from:', `${API_URL}/guests/`);
        const response = await axios.get(`${API_URL}/guests/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.status === 200) {
          console.log('Guests fetched successfully:', response.data);
          setGuests(response.data);
          setSuccessMessage('Guests fetched successfully.');
        } else {
          throw new Error(`Failed to fetch guests: ${response.status}`);
        }
      } catch (err: any) {
        console.error('Error fetching guests:', err);
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: err.config
          });
        }
        setGuestError('Failed to load guests. Please try again later.');
      } finally {
        setIsGuestsLoading(false);
      }
    };

    if (isAuthenticated && accessToken) {
      fetchGuests();
    }
  }, [isAuthenticated, accessToken]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search guests by name, email, or company..."
            className="pl-10"
            value={guestSearchTerm}
            onChange={(e) => setGuestSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="ml-4 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
          <span className="text-sm font-medium">Total Guests: </span>
          <span className="text-sm font-bold">{guests.length}</span>
        </div>
      </div>
      
      {guestError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{guestError}</p>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <UserCheck className="h-5 w-5 mr-2" />
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {isGuestsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading guest data...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">
                      {guest.name ? (
                        <div>
                          <div>{guest.name}</div>
                          <div className="text-xs text-gray-500">ID: {guest.id.substring(0, 8)}...</div>
                        </div>
                      ) : (
                        <div className="font-mono text-xs">{guest.id.substring(0, 12)}...</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {guest.contact_info || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {guest.company ? (
                        <div>
                          <div>{guest.company}</div>
                          {guest.industry && (
                            <div className="text-xs text-gray-500">{guest.industry}</div>
                          )}
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      {guest.project_type ? (
                        <div>
                          <div>{guest.project_type.join(', ')}</div>
                          {guest.budget && (
                            <div className="text-xs text-gray-500">Budget: {guest.budget}</div>
                          )}
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guest.status === 'NEW' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                        : guest.status === 'CONTACTED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:yellow-gray-300'
                      }`}>
                        {guest.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(guest.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGuest(guest);
                          setIsGuestDetailsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No guests found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Guest Stats Summary */}
      {guests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium mb-2">Recent Leads</h3>
            <p className="text-3xl font-bold">
              {guests.filter(g => {
                const date = new Date(g.created_at);
                const now = new Date();
                return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // Last week
              }).length}
            </p>
            <p className="text-sm text-gray-500">in the last 7 days</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium mb-2">Popular Projects</h3>
            <div className="mt-2">
              {(() => {
                // Calculate most common project types
                const projectCounts: Record<string, number> = {};
                guests.forEach(guest => {
                  if (guest.project_type && guest.project_type.length > 0) {
                    guest.project_type.forEach(type => {
                      projectCounts[type] = (projectCounts[type] || 0) + 1;
                    });
                  }
                });
                
                // Sort by count and get top 3
                return Object.entries(projectCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([range, count], index) => (
                    <div key={index} className="flex justify-between items-center mb-1">
                      <span>{range}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ));
              })()}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium mb-2">Budget Range</h3>
            <div className="mt-2">
              {(() => {
                // Calculate budget distribution
                const budgetRanges: Record<string, number> = {
                  'Under $10K': 0,
                  '$10K - $50K': 0,
                  '$50K - $100K': 0,
                  '$100K+': 0,
                  'Unknown': 0
                };
                
                guests.forEach(guest => {
                  if (!guest.budget) {
                    budgetRanges['Unknown']++;
                  } else if (guest.budget.includes('10,000')) {
                    budgetRanges['$10K - $50K']++;
                  } else if (guest.budget.includes('50,000')) {
                    budgetRanges['$50K - $100K']++;
                  } else if (guest.budget.includes('100,000')) {
                    budgetRanges['$100K+']++;
                  } else {
                    budgetRanges['Under $10K']++;
                  }
                });
                
                return Object.entries(budgetRanges)
                  .filter(([, count]) => count > 0)
                  .map(([range, count], index) => (
                    <div key={index} className="flex justify-between items-center mb-1">
                      <span>{range}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Guest Details Dialog */}
      <Dialog open={isGuestDetailsDialogOpen} onOpenChange={setIsGuestDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Guest Details</DialogTitle>
            <DialogDescription>
              Detailed information about this guest.
            </DialogDescription>
          </DialogHeader>
          {selectedGuest ? (
            <div className="grid gap-4 py-2 overflow-y-auto max-h-[55vh] pr-2">
              <div>
                <span className="font-semibold">ID:</span>
                <span className="ml-2 font-mono text-xs">{selectedGuest.id}</span>
              </div>
              <div>
                <span className="font-semibold">Name:</span>
                <span className="ml-2">{selectedGuest.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Contact Info:</span>
                <span className="ml-2">{selectedGuest.contact_info || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Company:</span>
                <span className="ml-2">{selectedGuest.company || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Industry:</span>
                <span className="ml-2">{selectedGuest.industry || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Project Type:</span>
                <span className="ml-2">{selectedGuest.project_type?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Budget:</span>
                <span className="ml-2">{selectedGuest.budget || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Timeline:</span>
                <span className="ml-2">{selectedGuest.timeline || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Pain Points:</span>
                <span className="ml-2">{selectedGuest.pain_points?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Current Tech:</span>
                <span className="ml-2">{selectedGuest.current_tech?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <span className="ml-2">{selectedGuest.status || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold">Created At:</span>
                <span className="ml-2">{formatDate(selectedGuest.created_at)}</span>
              </div>
              <div>
                <span className="font-semibold">Updated At:</span>
                <span className="ml-2">{formatDate(selectedGuest.updated_at)}</span>
              </div>
              <div>
                <span className="font-semibold">Additional Notes:</span>
                <span className="ml-2">{selectedGuest.additional_notes || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No guest selected.</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGuestDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GuestsTable;
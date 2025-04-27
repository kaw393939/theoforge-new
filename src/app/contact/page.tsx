/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { GuestChat } from '@/components/Chat/GuestChat';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Paragraph from '@/components/Common/Paragraph';
import { CheckIcon, ExclamationCircleIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { API_URL } from '@/components/Dashboard/AppContext';

interface Question {
  id: string;
  question: string;
}

interface GuestInfo {
  id: string | null;
  name?: string;
  company?: string;
  industry?: string;
  project_type?: string[];
  budget?: string;
  timeline?: string;
  contact_info?: string;
  pain_points?: string[];
  current_tech?: string[];
  additional_notes?: string;
  status?: 'NEW' | 'CONTACTED' | 'CONVERTED';
  // Additional info not in database
  sessionCount: number;
  questionsAnswered: Question[];
}

type Theme = "light" | "dark";

// Rebuilt Contact Page Component
const ContactPage: React.FC = () => {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({id: '', sessionCount: 0, questionsAnswered: []});
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "success" });
  const [theme, setTheme] = useState<Theme>("light");

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

  const submitForm = async () => {
    try {
      if (!guestInfo.contact_info) {
        showErrorAlert("Please provide your contact info");
        return;
      }
      const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
      if (DISCORD_WEBHOOK_URL) {
        let message = "New guest:"
        Object.entries(guestInfo).forEach(([key, value]) => {
          // Display string fields
          if(value && typeof value === 'string') message += `\n${key}: ${value}`;
          // Display array fields
          else if (value && value.length > 0 && Array.isArray(value)) message += `\n${key}: ${value.toString()}`;
        });
        await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message
          }),
        }).then(() => {
          showSuccessAlert("Contact information sent");
          setShowContactForm(false);
          axios.put(`${API_URL}/guests/${guestInfo.id}`, {status: 'CONTACTED'}).then(() => {
           setGuestInfo({...guestInfo, status: 'CONTACTED'});
          }).catch((err) => {
            console.error(err);
          });
        }).catch(() => {
          showErrorAlert("Failed to send contact information");
        });
      }
      else {
        console.log("No API key provided");
      }
    } catch (err: any) {
      console.log(err.message)
    }
  }
  
  useEffect(() => {
    addEventListener('infoUpdate', function(event: any) {
      setGuestInfo(event.detail);
    });
    addEventListener('themeChange', function(event: any) {
      setTheme(event.detail);
    });
    addEventListener('contactTheoforge', function() {
      setShowContactForm(true);
    });
  }, []);

  return (
    <div className={`${theme === "dark" && "dark"} h-[calc(100vh-64px)] w-full overflow-hidden bg-white dark:bg-gray-900`}>
      <div className = "flex h-full">
        <GuestChat />
      </div>
      {showContactForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md max-h-128 shadow-2xl rounded-2xl border border-neutral-300 bg-white dark:bg-gray-900 relative">
            {/* Header */}
            <CardHeader className="px-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-neutral-900 dark:text-white mb-0">
                    Contact Us
                  </h5>
                  <Paragraph variant="body1" className="text-sm text-neutral-600 dark:text-neutral-300">
                    Please confirm your information
                  </Paragraph>
                </div>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  aria-label="Close form"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
    
            {/* Content */}
            <CardContent className="px-6 space-y-4">
              <div className="grid gap-6 overscroll-y-contain overflow-auto h-96 p-2">
                <Input
                  placeholder="Name"
                  value={guestInfo.name ? guestInfo.name : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                />
                <Input
                  placeholder="Company"
                  value={guestInfo.company ? guestInfo.company : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, company: e.target.value })}
                />
                <Input
                  placeholder="Industry"
                  value={guestInfo.industry ? guestInfo.industry : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, industry: e.target.value })}
                />
                <Input
                  placeholder="Budget"
                  value={guestInfo.budget ? guestInfo.budget : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, budget: e.target.value })}
                />
                <Input
                  placeholder="Timeline"
                  value={guestInfo.timeline ? guestInfo.timeline : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, timeline: e.target.value })}
                />
                <Input
                  placeholder="Contact Info"
                  value={guestInfo.contact_info ? guestInfo.contact_info : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, contact_info: e.target.value })}
                />
                <Input
                  placeholder="Additional Notes"
                  value={guestInfo.additional_notes ? guestInfo.additional_notes : ''}
                  onChange={(e) => setGuestInfo({ ...guestInfo, additional_notes: e.target.value })}
                />
                {
                  // Project type fields
                  Array.from({length: guestInfo.project_type ? guestInfo.project_type.length : 0}, (_, num) => num+1 && 
                  <Input
                    key={"Project Type "+(num+1)}
                    placeholder={"Project Type "+(num+1)}
                    value={guestInfo.project_type ? guestInfo.project_type[num] : ''}
                    onChange={(e) => setGuestInfo({ ...guestInfo, project_type: guestInfo.project_type ? guestInfo.project_type.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                  />)
                }
                <div className="inline-flex flex-row gap-6">
                  <Button
                    color="green"
                    size="sm"
                    className="w-max h-max flex items-center gap-1"
                    onClick={() => {
                      setGuestInfo({ ...guestInfo, project_type: guestInfo.project_type ? guestInfo.project_type.concat(['']) : ['']})
                    }}>
                    Add Project Type<PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-max h-max flex items-center gap-1"
                    disabled={guestInfo.project_type ? (guestInfo.project_type.length === 0 ? true : false) : true}
                    onClick={() => {
                      setGuestInfo({ ...guestInfo, project_type: guestInfo.project_type ? (guestInfo.project_type.length === 1 ? undefined : guestInfo.project_type.slice(0, -1)) : undefined})
                    }}>
                    Remove Project Type<MinusIcon className="h-4 w-4" />
                  </Button>
                </div>
                {
                  // Pain point fields
                  Array.from({length: guestInfo.pain_points ? guestInfo.pain_points.length : 0}, (_, num) => num+1 && 
                  <Input
                    key={"Pain Point "+(num+1)}
                    placeholder={"Pain Point "+(num+1)}
                    value={guestInfo.pain_points ? guestInfo.pain_points[num] : ''}
                    onChange={(e) => setGuestInfo({ ...guestInfo, pain_points: guestInfo.pain_points ? guestInfo.pain_points.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                  />)
                }
                <div className="inline-flex flex-row gap-6">
                  <Button
                    color="green"
                    size="sm"
                    className="w-max h-max flex items-center gap-1"
                    onClick={() => {
                      setGuestInfo({ ...guestInfo, pain_points: guestInfo.pain_points ? guestInfo.pain_points.concat(['']) : ['']})
                    }}>
                    Add Pain Point<PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-max h-max flex items-center gap-1"
                    disabled={guestInfo.pain_points ? (guestInfo.pain_points.length === 0 ? true : false) : true}
                    onClick={() => {
                      setGuestInfo({ ...guestInfo, pain_points: guestInfo.pain_points ? (guestInfo.pain_points.length === 1 ? undefined : guestInfo.pain_points.slice(0, -1)) : undefined})
                    }}>
                    Remove Pain Point<MinusIcon className="h-4 w-4" />
                  </Button>
                </div>
                {
                  // Current tech fields
                  Array.from({length: guestInfo.current_tech ? guestInfo.current_tech.length : 0}, (_, num) => num+1 && 
                  <Input
                    key={"Current Tech "+(num+1)}
                    placeholder={"Current Tech "+(num+1)}
                    value={guestInfo.current_tech ? guestInfo.current_tech[num] : ''}
                    onChange={(e) => setGuestInfo({ ...guestInfo, current_tech: guestInfo.current_tech ? guestInfo.current_tech.map((value, i) => (i === num ? e.target.value : value)) : [e.target.value] })}
                  />)
                }
                <div className="inline-flex flex-row gap-6">
                  <Button
                    color="green"
                    size="sm"
                    className="w-max h-max flex items-center gap-1"
                    onClick={() => {
                      setGuestInfo({ ...guestInfo, current_tech: guestInfo.current_tech ? guestInfo.current_tech.concat(['']) : ['']})
                    }}>
                    Add Current Tech<PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-max h-max flex items-center gap-1"
                    disabled={guestInfo.current_tech ? (guestInfo.current_tech.length === 0 ? true : false) : true}
                    onClick={() => {
                      setGuestInfo({ ...guestInfo, current_tech: guestInfo.current_tech ? (guestInfo.current_tech.length === 1 ? undefined : guestInfo.current_tech.slice(0, -1)) : undefined})
                    }}>
                    Remove Current Tech<MinusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
    
            {/* Footer */}
            <CardFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
                onClick={submitForm}
              >
                Submit
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      {showAlert.show && (
        <div className={`absolute top-24 right-8 z-50 mb-5 p-4 rounded-lg flex items-start ${showAlert.type === "success" ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
          <div className="flex-shrink-0 mr-3">
            {showAlert.type === "success" ? 
              <CheckIcon className="h-6 w-6 text-green-500" /> : 
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
          </div>
          <div>{showAlert.message}</div>
        </div>
      )}
    </div>
  );
 };

export default ContactPage;

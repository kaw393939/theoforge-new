'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/Layout/PageContainer';
import Button from '@/components/Common/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { AuthContext } from '@/components/Dashboard/AppContext';

// User Profile interface
interface UserProfile {
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  card_number: string;
  ccv: string;
  security_code: string;
  subscription_plan: string;
}

// Subscription plan options
const SUBSCRIPTION_PLANS = [
  { value: 'FREE', label: 'Free Plan' },
  { value: 'BASIC', label: 'Basic Plan' },
  { value: 'PREMIUM', label: 'Premium Plan' }
];

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { accessToken, user, updateUserProfile } = useContext(AuthContext);
  
  // State for profile data
  const [profile, setProfile] = useState<UserProfile>({
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    card_number: '',
    ccv: '',
    security_code: '',
    subscription_plan: 'FREE'
  });
  
  // Track original profile data to detect changes
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    card_number: '',
    security_code: '',
    ccv: '',
    subscription_plan: 'FREE'
  });
  
  // Track which fields have been changed
  const [changedFields, setChangedFields] = useState<Set<keyof UserProfile>>(new Set());
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken || !user) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Load user data
      if (user) {   
        // Always set empty string rather than null/undefined
        setProfile({
          phone_number: user.phone_number || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zip_code: user.zip_code || '',
          card_number: user.card_number || '',
          security_code: '',
          ccv: '',
          subscription_plan: user.subscription_plan || 'FREE'
        });
        
        // Save the original profile for change tracking
        setOriginalProfile({
          phone_number: user.phone_number || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zip_code: user.zip_code || '',
          card_number: user.card_number || '',
          security_code: '',
          ccv: '',
          subscription_plan: user.subscription_plan || 'FREE'
        });
        
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
    };

    if (accessToken && user) {
      fetchProfile();
    }
  }, [accessToken, user]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the profile state
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Track which fields have changed from their original values
    const originalValue = originalProfile[name as keyof UserProfile];
    const newChangedFields = new Set(changedFields);
    
    if (value !== originalValue) {
      newChangedFields.add(name as keyof UserProfile);
    } else {
      newChangedFields.delete(name as keyof UserProfile);
    }
    
    setChangedFields(newChangedFields);
  };

  // Helper function to check if a field has been changed
  const hasFieldChanged = (fieldName: keyof UserProfile): boolean => {
    return changedFields.has(fieldName);
  };
  
  // Helper to generate field class based on whether it's been changed
  const getFieldClass = (fieldName: keyof UserProfile): string => {
    return hasFieldChanged(fieldName) 
      ? "border-blue-400 dark:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400" 
      : "";
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!accessToken) {
      setError('You must be logged in to update your profile.');
      return;
    }
  
    // Only proceed if there are changes
    if (changedFields.size === 0) {
      setError('No changes detected. Please modify at least one field.');
      return;
    }
  
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
  
    const updatedProfile: UserProfile = { ...originalProfile };
  
    for (const field of changedFields) {
      updatedProfile[field] = profile[field];
    }
  
    try {
      const response = await updateUserProfile(
        updatedProfile.phone_number,
        updatedProfile.address,
        updatedProfile.city,
        updatedProfile.state,
        updatedProfile.zip_code,
        updatedProfile.card_number,
        updatedProfile.ccv,
        updatedProfile.security_code,
        updatedProfile.subscription_plan,
      );
  
      if (response === "OK") {
        setSuccessMessage('Profile updated successfully.');
        setOriginalProfile(updatedProfile);
        setChangedFields(new Set());
  
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(response);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer 
      title="Your Profile" 
      subtitle="Manage your profile information"
    >
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-3 rounded-md text-red-800 dark:text-red-200 text-sm mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md text-green-800 dark:text-green-200 text-sm mb-4 flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading profile data...</span>
            </div>
          ) : (
            <>
              {/* Profile Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="address">Address Information</TabsTrigger>
                  <TabsTrigger value="payment">Payment Information</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                </TabsList>
                
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Personal Information</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Update your personal contact details.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium">
                          Phone Number
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type="text"
                            name="phone_number"
                            value={profile.phone_number || ''}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            placeholder="123-456-7890"
                            maxLength={20}
                          />
                          {profile.phone_number && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfile({ ...profile, phone_number: '' });
                                changedFields.add('phone_number');
                                setChangedFields(new Set(changedFields));
                              }}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                            >
                              <span className="text-xs">Clear</span>
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Optional. May be used for account verification.
                          <br />
                          <strong>Note:</strong> Phone numbers must be unique across accounts. If you&apos;re having issues, try leaving this blank.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Address Information Tab */}
                <TabsContent value="address" className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Address</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Update your address information.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={profile.address}
                          onChange={handleInputChange}
                          placeholder="e.g., 123 Main St"
                          className={`mt-1 ${getFieldClass('address')}`}
                          maxLength={100}
                        />
                        {hasFieldChanged('address') && (
                          <p className="text-xs text-blue-500 mt-1">Changed from original value</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={profile.city}
                            onChange={handleInputChange}
                            placeholder="e.g., New York"
                            className={`mt-1 ${getFieldClass('city')}`}
                            maxLength={50}
                          />
                          {hasFieldChanged('city') && (
                            <p className="text-xs text-blue-500 mt-1">Changed</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            name="state"
                            value={profile.state}
                            onChange={handleInputChange}
                            placeholder="e.g., NY"
                            className={`mt-1 ${getFieldClass('state')}`}
                            maxLength={20}
                          />
                          {hasFieldChanged('state') && (
                            <p className="text-xs text-blue-500 mt-1">Changed</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                        <Input
                          id="zip_code"
                          name="zip_code"
                          value={profile.zip_code}
                          onChange={handleInputChange}
                          placeholder="e.g., 10001"
                          className={`mt-1 ${getFieldClass('zip_code')}`}
                          maxLength={10}
                        />
                        {hasFieldChanged('zip_code') && (
                          <p className="text-xs text-blue-500 mt-1">Changed from original value</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Payment Information Tab */}
                <TabsContent value="payment" className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Update your payment details. TheoForge uses secure encryption to protect your payment information.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="card_number">Card Number</Label>
                        <Input
                          id="card_number"
                          name="card_number"
                          value={profile.card_number}
                          onChange={handleInputChange}
                          placeholder="XXXX XXXX XXXX XXXX"
                          className={`mt-1 ${getFieldClass('card_number')}`}
                          maxLength={16}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter numbers only - spaces will be removed</p>
                        {hasFieldChanged('card_number') && (
                          <p className="text-xs text-blue-500 mt-1">Changed from original value</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ccv">CCV</Label>
                          <Input
                            id="ccv"
                            name="ccv"
                            value={profile.ccv}
                            onChange={handleInputChange}
                            placeholder="XXX"
                            className={`mt-1 ${getFieldClass('ccv')}`}
                            maxLength={4}
                          />
                          {hasFieldChanged('ccv') && (
                            <p className="text-xs text-blue-500 mt-1">Changed</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="security_code">Security Code</Label>
                          <Input
                            id="security_code"
                            name="security_code"
                            value={profile.security_code}
                            onChange={handleInputChange}
                            placeholder="XXXX"
                            className={`mt-1 ${getFieldClass('security_code')}`}
                            maxLength={4}
                          />
                          {hasFieldChanged('security_code') && (
                            <p className="text-xs text-blue-500 mt-1">Changed</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/dashboard')}
                      >
                        Return to Dashboard
                      </Button>
                      
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving || changedFields.size === 0}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Subscription Tab */}
                <TabsContent value="subscription" className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Subscription Plan</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Choose the subscription plan that best fits your needs.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="subscription_plan">Current Plan</Label>
                        <select
                          id="subscription_plan"
                          name="subscription_plan"
                          value={profile.subscription_plan}
                          onChange={handleInputChange}
                          className={`w-full h-10 px-3 mt-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 ${getFieldClass('subscription_plan')}`}
                        >
                          {SUBSCRIPTION_PLANS.map(plan => (
                            <option key={plan.value} value={plan.value}>
                              {plan.label}
                            </option>
                          ))}
                        </select>
                        {hasFieldChanged('subscription_plan') && (
                          <p className="text-xs text-blue-500 mt-1">Changed from original plan</p>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Plan Features</h4>
                        {profile.subscription_plan === 'FREE' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Basic access to TheoForge tools</li>
                            <li>Limited projects</li>
                            <li>Community support</li>
                          </ul>
                        )}
                        {profile.subscription_plan === 'BASIC' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Unlimited projects</li>
                            <li>Basic AI features</li>
                            <li>Email support</li>
                            <li>Monthly usage reports</li>
                          </ul>
                        )}
                        {profile.subscription_plan === 'PREMIUM' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>All Basic features</li>
                            <li>Advanced AI capabilities</li>
                            <li>Priority support</li>
                            <li>Team collaboration</li>
                            <li>API access</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default ProfilePage;
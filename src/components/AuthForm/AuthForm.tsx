// src/components/AuthForm/AuthForm.tsx
"use client";

import React, { useState, useContext, useEffect } from 'react';
import { ArrowLeftIcon, EnvelopeIcon, LockClosedIcon, SparklesIcon, UserIcon, IdentificationIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../Dashboard/AppContext';
import { Typography, Alert, Button } from "@material-tailwind/react";
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "success" });
  const navigate = useRouter();
  const { login, isAuthenticated, register, accessTokenLogin } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) navigate.push('/dashboard');
  }, [isAuthenticated, navigate]);

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
  
  useEffect(() => {
    // If the user's cookie contains a valid access token, redirect to dashboard
    const authenticate = async (accessToken: string) => {
      if(await accessTokenLogin(accessToken)) navigate.push('/dashboard');
    }
    // Get the access token from the cookie
    const field = "accessToken=";
    let token = "";
    const pairs = decodeURIComponent(document.cookie).split(';');
    for(let i = 0; i <pairs.length; i++) {
      let c = pairs[i];
      // Remove leading whitespace
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(field) == 0) {
        token = c.substring(field.length, c.length);
      }
    }
    if (token.length > 0) authenticate(token);
  }, [accessTokenLogin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email || !password) {
      showErrorAlert('Please fill out all fields');
      return;
    }
    if (type === 'login') {
      const response = await login(email, password);
      if (response === 'OK') navigate.push('/dashboard');
      else showErrorAlert(response);
    } else {//type === 'register'
      const response = await register(email, password,
        firstName.length > 0 ? firstName : undefined,
        lastName.length > 0 ? lastName : undefined,
        nickname.length > 0 ? nickname : undefined);
      if (response === 'OK') {
        // Add email verification here
        showSuccessAlert('Account created');
        navigate.push('/login');
      } else showErrorAlert(response);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button 
            onClick={() => navigate.push('/')} 
            className="flex items-center text-gray-700 hover:text-teal-600 transition-colors duration-300 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to home
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
          <div className="h-2 bg-gradient-to-r from-teal-400 to-teal-600"></div>
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center">
                {type === 'login' ? (
                  <LockClosedIcon className="h-8 w-8 text-teal-500" />
                ) : (
                  <UserIcon className="h-8 w-8 text-teal-500" />
                )}
              </div>
            </div>
            
            <Typography variant="h3" className="text-center text-gray-800 font-bold text-2xl mb-2">
              {type === 'login' ? 'Welcome Back' : 'Create Account'}
            </Typography>
            
            <Typography className="text-center text-gray-500 mb-8">
              {type === 'login' 
                ? 'Sign in to access your account' 
                : 'Join us and start your journey'}
            </Typography>
            
            {showAlert.show && (
              <Alert
                open={showAlert.show}
                onClose={() => setShowAlert(prev => ({ ...prev, show: false }))}
                animate={{
                  mount: { y: 0 },
                  unmount: { y: -100 },
                }}
                className={showAlert.type === "success" ? "mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4" : "mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4"}
                icon={showAlert.type === "success" ? <CheckIcon className="h-6 w-6" /> : <ExclamationCircleIcon className="h-6 w-6" />}
              >
                {showAlert.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {type === 'register' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nickname"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                color="teal" 
                className="mt-6 py-3 font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300"
                fullWidth
              >
                {type === 'login' ? 'Login' : 'Register'}
              </Button>
            </form>

            {type === 'login' && (
              <>
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-gray-500 text-sm">Or continue with</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                
                <Button
                  variant="outlined"
                  color="teal"
                  onClick={async () => {
                    const success = await login('test@test.com', 'test123');
                    if (success) navigate.push('/dashboard');
                  }}
                  fullWidth
                  className="flex items-center justify-center py-3 border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors duration-300"
                >
                  <SparklesIcon className="h-5 w-5 mr-2" /> Test Account
                </Button>
              </>
            )}

            <div className="text-center mt-8 text-gray-600">
              {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                className="text-teal-600 font-medium hover:underline transition-all duration-300"
                onClick={() => navigate.push(type === 'login' ? '/register' : '/login')}
              >
                {type === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
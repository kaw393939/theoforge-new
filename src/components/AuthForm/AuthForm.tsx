// src/components/AuthForm/AuthForm.tsx
"use client";

import React, { useState, useContext, useEffect } from 'react';
import { ArrowLeftIcon, EnvelopeIcon, LockClosedIcon, SparklesIcon, UserIcon, IdentificationIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../Dashboard/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/hero_star_bg.png')] bg-cover bg-center bg-no-repeat relative overflow-hidden">
      {/* Dark overlay to match the hero section */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* Network grid overlay - subtle visual connection to AI/tech theme */}
      <div className="absolute inset-0 opacity-10 z-0 mix-blend-screen">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Nodes/stars that represent AI nodes - matching TheoForge's tech aesthetic */}
          <circle cx="20" cy="20" r="1" fill="rgba(255, 255, 255, 0.8)" className="animate-pulse" style={{ animationDuration: '4s' }} />
          <circle cx="40" cy="70" r="1.2" fill="rgba(0, 169, 157, 0.8)" className="animate-pulse" style={{ animationDuration: '6s' }} />
          <circle cx="65" cy="30" r="0.8" fill="rgba(255, 255, 255, 0.8)" className="animate-pulse" style={{ animationDuration: '5s' }} />
          <circle cx="80" cy="80" r="1" fill="rgba(184, 134, 11, 0.8)" className="animate-pulse" style={{ animationDuration: '7s' }} />
          <circle cx="15" cy="60" r="0.7" fill="rgba(0, 169, 157, 0.8)" className="animate-pulse" style={{ animationDuration: '5.5s' }} />
          <circle cx="90" cy="10" r="0.9" fill="rgba(255, 255, 255, 0.8)" className="animate-pulse" style={{ animationDuration: '4.5s' }} />
        </svg>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-white hover:text-[hsl(var(--primary))] transition-colors duration-300 font-medium relative z-10">
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to home
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300 border border-[hsla(var(--primary),0.3)]">
          <div className="h-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"></div>
          <div className="p-8 relative">
            {/* Decorative corner elements that match TheoForge's design language */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsla(var(--primary),0.1)] to-transparent rounded-bl-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[hsla(var(--secondary),0.1)] to-transparent rounded-tr-full -z-10"></div>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center shadow-lg p-3">
                  <Image 
                    src="/logo.png" 
                    alt="TheoForge Logo" 
                    width={60} 
                    height={60} 
                    className="transform transition-all duration-500 hover:scale-110"
                    priority
                  />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center shadow-md">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="mb-2 font-bold font-heading text-black text-3xl">
                {type === 'login' ? 'Welcome Back' : 'Join TheoForge'}
              </h3>
              <p className="text-black max-w-md mx-auto">
                {type === 'login' 
                  ? 'Sign in to access your strategic AI transformation platform' 
                  : 'Create your account to empower enterprise engineering with TheoForge'}
              </p>
            </div>
            
            {showAlert.show && (
              <div className={`mb-5 p-4 rounded-lg flex items-start ${showAlert.type === "success" ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
                <div className="flex-shrink-0 mr-3">
                  {showAlert.type === "success" ? 
                    <CheckIcon className="h-6 w-6 text-green-500" /> : 
                    <ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
                </div>
                <div>{showAlert.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-black/60 group-focus-within:text-[hsl(var(--primary))]" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 pl-10 border border-[hsl(var(--input))] bg-white/80 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-all duration-300 font-sans shadow-sm text-black placeholder:text-black/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))]" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 pl-10 border border-[hsl(var(--input))] bg-white/80 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-all duration-300 font-sans shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {type === 'register' && (
                <>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nickname"
                      className="w-full p-3 pl-10 border border-[hsl(var(--input))] bg-white/80 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-all duration-300 font-sans shadow-sm"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))]" />
                      </div>
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-3 pl-10 border border-[hsl(var(--input))] bg-white/80 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-all duration-300 font-sans shadow-sm"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))]" />
                      </div>
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-3 pl-10 border border-[hsl(var(--input))] bg-white/80 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] transition-all duration-300 font-sans shadow-sm"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="mt-6 py-4 px-6 w-full font-bold text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-500 bg-black hover:bg-black/80 text-white rounded-lg relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {type === 'login' ? (
                    <>
                      <span className="font-semibold">Sign In</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Create Account</span>
                      <SparklesIcon className="w-5 h-5 ml-2" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {type === 'login' && (
              <>
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-black/20"></div>
                  <span className="px-3 text-black text-sm font-sans">Or continue with</span>
                  <div className="flex-1 border-t border-black/20"></div>
                </div>
                
                <button
                  type="button"
                  onClick={async () => {
                    const success = await login('test@test.com', 'test123');
                    if (success) navigate.push('/dashboard');
                  }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-white border-2 border-black text-black font-medium hover:bg-black/5 transition-all duration-300 font-sans rounded-lg shadow-sm hover:shadow-md"
                >
                  <SparklesIcon className="h-5 w-5 mr-2 text-black" /> Test Account
                </button>
              </>
            )}

            <div className="text-center mt-8 text-black font-sans">
              {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <Link
                href={type === 'login' ? '/register' : '/login'}
                className="text-black font-semibold hover:text-[hsl(var(--secondary))] transition-all duration-300 underline"
              >
                {type === 'login' ? (
                  <span className="inline-flex items-center">
                    Sign Up <span className="inline-block ml-1 font-bold text-black" aria-hidden="true">→</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    Sign In <span className="inline-block ml-1 font-bold text-black" aria-hidden="true">→</span>
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
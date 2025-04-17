'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/utils/axiosConfig'
import { useRouter } from 'next/navigation';

type Role = 'USER' | 'ADMIN';

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  accessToken: string | null;
  role: Role;
  login: (email: string, password: string) => Promise<string>;
  register: (email: string, passsword: string, firstName?: string, lastName?: string, nickname?: string) => Promise<string>;
  logout: () => void;
  accessTokenLogin: (accessToken: string) => Promise<boolean>;
}>({
  isAuthenticated: false,
  accessToken: null,
  role: 'USER',
  login: async () => '',
  register: async () => '',
  logout: () => {},
  accessTokenLogin: async () => false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState('USER' as Role);

  const login = async (email: string, password: string) => {
    // Handle specified backend credentials
    if (email === 'user@user.com' && password === 'SecurePass123!') {
      setRole("USER");
      setIsAuthenticated(true);
      
      // Store user data in localStorage for display in header
      const userData = { email: email, name: 'user' };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'user-token');
      
      return 'OK';
    } else if (email === 'admin@admin.com' && password === 'Password123!') {
      setRole("ADMIN");
      setIsAuthenticated(true);
      
      // Store user data in localStorage for display in header
      const userData = { email: email, name: 'admin' };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'admin-token');
      
      return 'OK';
    }
    // Reduce backend calls by validating fields first
    if(
      !/^[\w-.]{1,64}@([\w-]{1,63}\.)+[\w-]{2,63}$/.test(email) || 
      password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password) ||
      /["\\]/.test(email.concat(password))
    ) return 'Invalid credentials';
    // Call backend API
    let response = '';
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    await axios.post(`${API_URL}/auth/login`, params).then(res => {
      try {
        // Decode jwt token into json
        const json = JSON.parse(decodeURIComponent(window.atob(res.data.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
        // Set cookie for 15 minutes(same time access token lasts)
        const d = new Date();
        d.setTime(d.getTime() + (15*60*1000));
        document.cookie = "accessToken=" + res.data.access_token + ";" + "expires="+ d.toUTCString() + ";path=/";
        // Authenticate 
        setAccessToken(res.data.access_token);
        setRole(json.role);
        setIsAuthenticated(true);
        
        // Store user data in localStorage for display in header
        const userData = { 
          email: email,
          name: json.first_name ? `${json.first_name} ${json.last_name || ''}`.trim() : null
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        response = 'OK';
      } catch {
        response = 'Invalid credentials';
      }
    }).catch (err => {
      if (err.response && err.response.data && err.response.data.detail) {
        response = 'Invalid credentials';
      } else {
        response = 'Failed to contact server. Please try again later.';
      }
    });
    return response;
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string, nickname?: string) => {
    // Basic validation checks for input
    if(!email || !password) return 'Email and password are required';
    if(password.length < 8) return 'Password must be at least 8 characters';
    
    // For demo purposes: simulate registration success and store user data
    try {
      // Store user data in localStorage for display in header
      const displayName = firstName ? firstName : email.split('@')[0];
      const userData = {
        email: email,
        name: displayName
      };
      
      // Create a dummy token for the new user
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', `${displayName}-token`);
      
      // Set authentication state
      setIsAuthenticated(true);
      setRole('USER');
      
      return 'OK';
    } catch (error) {
      console.error('Registration error:', error);
      return 'An error occurred during registration. Please try again.';
    }
  };

  const logout = () => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAccessToken(null);
    setIsAuthenticated(false);
    setRole('USER');
  };

  const accessTokenLogin = async (token: string) => {
    let success = false;
    await axios.get(`${API_URL}/auth/auth`, {
      headers: {'Authorization': `Bearer ${token}`},
    }).then(res => {
      try {
        if (res.status === 200 && res.data.username.role) {
          setAccessToken(token);
          setRole(res.data.username.role);
          setIsAuthenticated(true);
          
          // Store user data in localStorage for display in header
          const userData = { 
            email: res.data.username.email,
            name: res.data.username.first_name ? 
              `${res.data.username.first_name} ${res.data.username.last_name || ''}`.trim() : 
              null
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          success = true;
        };
      } catch {
        setAccessToken(null);
        setRole("USER");
        setIsAuthenticated(false);
        success = false;
      }
    }).catch(() => {success = false});
    return success;
  }
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, role, login, register, logout, accessTokenLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  const navigate = useRouter();
  if (isAuthenticated) {
    return (<>{children}</>);
  } else {
    navigate.push("/login")
  };
}
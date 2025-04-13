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
    // Remove once backend API is released
    if (email === 'test@test.com' && password === 'test123') {
      setRole("ADMIN");
      setIsAuthenticated(true);
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
    // Reduce backend calls by validating fields first
    if(!/^[\w-.]{1,64}@([\w-]{1,63}\.)+[\w-]{2,63}$/.test(email)) return 'Invalid email';
    else if(nickname && !/^[a-zA-Z0-9]*$/.test(nickname)) return 'Nickname may not include special characters';
    else if(password.length < 8) return 'Password must be at least 8 characters';
    else if(!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase character';
    else if(!/[a-z]/.test(password)) return 'Password must contain at least 1 lowercase character';
    else if(!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
    else if(!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) return 'Password must contain at least 1 special character';
    else if (firstName && firstName.length > 100) return 'First name must not be more than 100 characters';
    else if (lastName && lastName.length > 100) return 'Last name must not be more than 100 characters';
    else if (nickname && nickname.length > 50) return 'Nickname must not be more than 50 characters';
    // Prevent sql injection by invalidating " and \
    else if (/["\\]/.test(email.concat(
      firstName ? firstName : '',
      lastName ? lastName : '',
      nickname ? nickname : '',
      password
    ))) return 'Invalid character " or \\ used';
    // Call backend API
    let response = '';
    const params: {email: string, password: string, first_name?: string, last_name?: string, nickname?: string} = {
      "email": email,
      "password": password
    }
    if (firstName) params["first_name"] = firstName;
    if (lastName) params["last_name"] = lastName;
    if (nickname) params["nickname"] = nickname
    await axios.post(`${API_URL}/auth/register`, params).then(() => {
      response = 'OK';
    }).catch(err => {
      if (err.response && err.response.data && err.response.data.detail) {
        if (/User with email [\w-.]{1,64}@([\w-]{1,63}\.)+[\w-]{2,63} already exists/.test(err.response.data.detail)) {
          response = 'Email already taken';
        } else if (err.response.data.detail === 'Not Found') {
          response = 'The server has encountered an error. Please try again later.';
        } else if (/Key \(nickname\)=\([a-zA-Z0-9]+\) already exists/.test(err.response.data.detail)) {
          response = 'Nickname already taken';
        } else {
          response = 'An unknown error encountered. Please try again later.';
        }
      } else {
        response = 'Failed to contact server. Please try again later.';
      }
    });
    return response;
  };

  const logout = () => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
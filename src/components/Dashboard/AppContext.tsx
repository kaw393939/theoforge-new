'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { redirect } from 'next/navigation';
const useLocalHost = process.env.NEXT_PUBLIC_USE_LOCALHOST || "false";
export const API_URL = useLocalHost === "true" ? "http://localhost:8000" : "https://theoforge.com"

export interface User {
  address: string | null;
  card_number: string | null;
  ccv: string | null;
  city: string | null;
  created_at: string;
  email: string;
  email_verified: boolean;
  failed_login_attempts: number;
  first_name: string | null;
  hashed_password: string;
  id: string;
  is_locked: boolean;
  last_name: string | null;
  nickname: string | null;
  phone_number: string | null;
  role: "ADMIN" | "USER";
  security_code: string | null;
  state: string | null;
  subscription_plan: "PREMIUM" | "BASIC" | "FREE";
  updated_at: string;
  verification_token: string | null;
  zip_code: string | null
}

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<string>;
  register: (email: string, passsword: string, firstName?: string, lastName?: string, nickname?: string) => Promise<string>;
  logout: () => void;
  accessTokenLogin: (accessToken: string) => Promise<boolean>;
  updateUserAccount: (email?: string, password?: string, nickname?: string, first_name?: string, last_name?: string) => Promise<string>;
  updateUserProfile: (phone_number?: string, address?: string, city?: string, state?: string, zip_code?: string, card_number?: string, ccv?: string, security_code?: string, subscription_plan?: string) => Promise<string>;
}>({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  login: async () => "",
  register: async () => "",
  logout: () => {},
  accessTokenLogin: async () => false,
  updateUserAccount: async () => "",
  updateUserProfile: async () => ""
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
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
    await axios.post(`${API_URL}/auth/login`, params).then(async res => {
      // Set cookie for 15 minutes(same time access token lasts)
      const d = new Date();
      d.setTime(d.getTime() + (15*60*1000));
      if (res.data && res.data.access_token) {
        document.cookie = "accessToken=" + res.data.access_token + ";" + "expires="+ d.toUTCString() + ";path=/";
        // Authenticate
        if(await accessTokenLogin(res.data.access_token)) response = 'OK';
        else response = "Invalid credentials"
      } else response = "Failed to contact server. Please try again later."
    }).catch (err => {
      if (err.response && err.response.data && err.response.data.detail) {
        response = "Invalid credentials";
      } else {
        response = "Failed to contact server. Please try again later.";
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
    setUser(null);
  };

  const accessTokenLogin = async (token: string) => {
    try {
      const res = await axios.get(`${API_URL}/auth/auth`, {
        headers: {'Authorization': `Bearer ${token}`},
      });
      if (res.status === 200 && res.data.username) {
        setAccessToken(token);
        setUser(res.data.username);
        setIsAuthenticated(true);
        return true;
      } else throw Error;
    } catch {
      // Invalid response
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }
  
  const updateUserAccount = async (email?: string, password?: string, nickname?: string, first_name?: string, last_name?: string) => {
    try {
      let response = "";
      // Validate field
      if(!email || !password) {
        return "Please fill out all fields";
      }
      if(!/^[\w-.]{1,64}@([\w-]{1,63}\.)+[\w-]{2,63}$/.test(email)) response = "Invalid email";
      else if(nickname && !/^[a-zA-Z0-9]*$/.test(nickname)) response = "Nickname may not include special characters";
      else if(password.length < 8) response = "Password must be at least 8 characters";
      else if(!/[A-Z]/.test(password)) response = "Password must contain at least 1 uppercase character";
      else if(!/[a-z]/.test(password)) response = "Password must contain at least 1 lowercase character";
      else if(!/[0-9]/.test(password)) response = "Password must contain at least 1 number";
      else if(!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) response = "Password must contain at least 1 special character";
      else if (first_name && first_name.length > 100) response = "First name must not be more than 100 characters";
      else if (last_name && last_name.length > 100) response = "Last name must not be more than 100 characters";
      else if (nickname && nickname.length > 50) response = "Nickname must not be more than 50 characters";
      // Prevent sql injection by invalidating " and \
      else if (/["\\]/.test(email.concat(
        first_name ? first_name : "",
        last_name ? last_name : "",
        nickname ? nickname : "",
        password
      ))) response = 'Invalid character " or \\ used';
      if (response !== "") {
        return response;
      }
      // Call backend API
      await axios.put(`${API_URL}/auth/update`, 
        {
          "first_name": first_name,
          "last_name": last_name,
          "email": email,
          "nickname": nickname,
          "password": password
        },
        {
          headers: { 'Authorization' : `Bearer ${accessToken}` }
        }
      );
      
      // Login to update access token
      const loginResponse = await login(email, password);
      if (loginResponse !== "OK") {
        return loginResponse;
      }
      
      return "Account information updated successfully!";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if(error.response && error.response.data && error.response.data.detail) {
        if(error.response.data.detail === "Invalid token"){
          return "Authentication expired. Please log in again";
        } else return error.response.data.detail;
      }
      console.error("Error updating account settings:", error);
      return "Error updating account settings";
    }
  }
  
  const updateUserProfile = async (phone_number?: string, address?: string, city?: string, state?: string, zip_code?: string, card_number?: string, ccv?: string, security_code?: string, subscription_plan?: string) => {
    let response = "";
    // Validate fields
    if (phone_number && !/^\+?[0-9()\-\s]{7,20}$/.test(phone_number)) response = "Invalid phone number format.";
    else if (zip_code && !/^\d{5}(-\d{4})?$/.test(zip_code)) response = "Invalid ZIP code format.";
    else if (card_number && !/^\d{13,16}$/.test(card_number.replace(/\s/g, ''))) response = "Card number must be 13 to 16 digits.";
    else if (ccv && !/^\d{3,4}$/.test(ccv)) response = "CCV must be 3 or 4 digits"
    else if (security_code && !/^\d{3,4}$/.test(security_code)) response = "Security code must be 3 or 4 digits"
    else if (subscription_plan && !['FREE', 'BASIC', 'PREMIUM'].includes(subscription_plan.toUpperCase())) response = "Invalid subscription plan."
    if (response !== "") {
      return response;
    }
    if (!user) return "Failed to access your profile";
    // Only update given fields
    const params = {
      phone_number: phone_number ?? user.phone_number,
      address: address ?? user.address,
      city: city ?? user.city,
      state: state ?? user.state,
      zip_code: zip_code ?? user.zip_code,
      card_number: card_number ?? user.card_number,
      ccv: ccv ?? user.ccv,
      security_code: security_code ?? user.security_code,
      subscription_plan: subscription_plan ? (["FREE", "BASIC", "PREMIUM"].includes(subscription_plan) ? subscription_plan : "FREE") as "FREE" | "BASIC" | "PREMIUM" : "FREE"
    }
    // Call backend API
    await axios.put(`${API_URL}/auth/update-profile`, params,
      {
        headers: { 'Authorization' : `Bearer ${accessToken}` }
      }
    ).then(() => {
      setUser(prev => ({...prev!, ...params}));
      response = "OK"
    }).catch(error => {
      if(error.response && error.response.data && error.response.data.detail) {
        if(error.response.data.detail === "Invalid token"){
          response = "Authentication expired. Please log in again";
        } else response = error.response.data.detail;
      } else response = "Profile update failed. Please try again later";
      console.error("Error updating profile settings:", error);
    });
    return response;
  }
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, user, login, register, logout, accessTokenLogin, updateUserAccount, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  if (isAuthenticated) {
    return (<>{children}</>);
  } else {
    redirect("/login")
  };
}
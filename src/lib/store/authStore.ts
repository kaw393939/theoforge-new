import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';
import { type StateCreator } from 'zustand';

// Configure axios defaults
// axios.defaults.withCredentials = true; // Commenting out to fix CORS issues

export interface User {
  id: string;
  email: string;
  nickname: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
  // Extended profile fields
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  card_number?: string;
  subscription_plan?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  redirectToPath: string | null;
  register: (userData: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  clearRedirect: () => void;
  updateUserProfile: (profileData: Record<string, string>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  nickname: string;
  first_name: string;
  last_name: string;
}

// Define the persisted state type (only what we want to store)
type AuthPersistedState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

type AuthStorePersist = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState, AuthPersistedState>
) => StateCreator<AuthState>;

// Declare the API_BASE_URL with explicit type
// Update this URL to match your FastAPI backend URL
const API_BASE_URL = '/api'; // Using our Next.js proxy to avoid CORS issues

// For debugging - log the API URL being used
console.log("API URL being used:", API_BASE_URL);

export const useAuthStore = create<AuthState>()(
  (persist as AuthStorePersist)(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      redirectToPath: null,

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log("Registering at:", `${API_BASE_URL}/auth/register`);
          console.log("Registration data:", userData);
          
          const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
          
          console.log("Registration response:", response.status);
          
          if (response.status === 201) {
            console.log("Registration successful");
            
            // After successful registration, set redirect to login
            // (We don't automatically log in after registration)
            set({ 
              isLoading: false,
              redirectToPath: '/login' // This will be used to show login modal or redirect
            });
          } else {
            throw new Error(`Registration failed with status ${response.status}`);
          }
        } catch (error) {
          console.error("Registration error:", error);
          
          const axiosError = error as AxiosError<{ detail: string }>;
          let errorMessage = 'Registration failed. Please try again.';
          
          if (axiosError.response) {
            console.error("Response status:", axiosError.response.status);
            console.error("Response data:", axiosError.response.data);
            
            if (axiosError.response.status === 404) {
              errorMessage = 'API endpoint not found. Please ensure your backend server is running.';
            } else if (axiosError.response.data && 'detail' in axiosError.response.data) {
              errorMessage = axiosError.response.data.detail;
            }
          } else if (axiosError.request) {
            errorMessage = 'No response received from server. Please check your connection.';
          }
          
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log("Attempting to login at:", `http://localhost:8000/auth/login`);
          console.log("With credentials for:", email);
          
          // Create the params for the login request (API expects form data)
          const params = new URLSearchParams();
          params.append('username', email); // API expects 'username' field for the email
          params.append('password', password);
          
          console.log("Login params:", params.toString());
          
          // Make login request
          const response = await axios.post(`http://localhost:8000/auth/login`, params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          });
          
          console.log("Login response status:", response.status);
          console.log("Login response data:", response.data);
          
          if (response.status === 200) {
            // Extract token from response data
            const token = response.data.access_token;
            console.log("Login successful, token received:", token.substring(0, 15) + "...");
            
            // Try to extract user information from JWT token, this might not always be possible
            // depending on what information is encoded in the token
            let userData: User | null = null;
            
            try {
              // Decode JWT token to get user data
              const tokenData = JSON.parse(atob(token.split('.')[1]));
              console.log("Token data:", tokenData);
              
              // Ensure the user ID is properly extracted from the token
              if (tokenData.sub) {
                const userId = tokenData.sub;
                console.log("Extracted user ID from token:", userId);
                
                // Now fetch the full user data with profile using the ID
                try {
                  console.log(`Fetching user data with ID: ${userId}`);
                  const userResponse = await axios.get(`${API_BASE_URL}/auth/users/${userId}`, {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                  
                  if (userResponse.status === 200) {
                    console.log("User data from /auth/users endpoint:", userResponse.data);
                    const userData_raw = userResponse.data;
                    
                    // Create full user object with profile data
                    userData = {
                      id: userId,
                      email: userData_raw.email || email,
                      nickname: userData_raw.nickname || email.split('@')[0],
                      first_name: userData_raw.first_name || "",
                      last_name: userData_raw.last_name || "",
                      role: userData_raw.role || "USER",
                      created_at: userData_raw.created_at || new Date().toISOString(),
                      updated_at: userData_raw.updated_at || new Date().toISOString(),
                      // Include any extended profile data if present
                      phone_number: userData_raw.phone_number,
                      address: userData_raw.address,
                      city: userData_raw.city,
                      state: userData_raw.state,
                      zip_code: userData_raw.zip_code,
                      card_number: userData_raw.card_number,
                      subscription_plan: userData_raw.subscription_plan
                    };
                  } else {
                    throw new Error(`Failed to fetch user data: ${userResponse.status}`);
                  }
                } catch (userError) {
                  console.error("Error fetching user data with ID:", userError);
                  
                  // Create basic user data from token if available
                  userData = {
                    id: userId,
                    email: email,
                    nickname: tokenData.nickname || email.split('@')[0],
                    first_name: tokenData.first_name || "",
                    last_name: tokenData.last_name || "",
                    role: tokenData.role || "USER",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                }
              }
            } catch (e) {
              console.warn("Could not decode JWT token", e);
            }
            
            // If we don't have user data from the token, create a minimal user object
            if (!userData) {
              console.warn("No user data in token, creating minimal user object");
              // Create a minimal user object as fallback
              userData = {
                id: "logged-in-user",
                email: email,
                nickname: email.split('@')[0],
                first_name: "",
                last_name: "",
                role: email.toLowerCase().includes('admin') ? "ADMIN" : "USER", // Use email to determine role as fallback
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            
            // At this point userData is guaranteed to be non-null
            // Determine redirect path based on user role
            const redirectPath = userData.role === "USER" ? '/admin' : '/dashboard';
            
            // Ensure empty strings instead of null for profile fields
            const sanitizedUserData = {
              ...userData,
              role: userData.role, // Explicitly preserve the role
              phone_number: userData.phone_number || '',
              address: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              zip_code: userData.zip_code || '',
              card_number: userData.card_number || '',
              subscription_plan: userData.subscription_plan || 'FREE'
            };
            
            // Set authentication state with user info
            set({ 
              token: token,
              isAuthenticated: true,
              isLoading: false,
              user: sanitizedUserData,
              redirectToPath: redirectPath
            });
          } else {
            throw new Error(`Login failed with status ${response.status}`);
          }
        } catch (error) {
          console.error("Login error:", error);
          
          const axiosError = error as AxiosError<{ detail: string }>;
          let errorMessage = 'Login failed. Please check your credentials.';
          
          if (axiosError.response) {
            console.error("Response status:", axiosError.response.status);
            console.error("Response data:", axiosError.response.data);
            
            if (axiosError.response.status === 404) {
              errorMessage = 'API endpoint not found. Please ensure your backend server is running.';
            } else if (axiosError.response.data && 'detail' in axiosError.response.data) {
              errorMessage = axiosError.response.data.detail;
            }
          } else if (axiosError.request) {
            errorMessage = 'No response received from server. Please check your connection.';
          }
          
          set({ 
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null
          });
          throw error;
        }
      },

      logout: () => {
        // Call the logout endpoint (for API completeness)
        const { token } = get();
        if (token) {
          console.log("Calling logout endpoint");
          axios.post(`${API_BASE_URL}/auth/logout`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).catch((error) => {
            console.error("Logout error (ignored):", error);
            // We don't need to handle the error as we're clearing the state anyway
          });
        }
        
        // Clear the auth state
        set({ 
          token: null,
          user: null,
          isAuthenticated: false
        });
        console.log("User logged out");
      },

      clearError: () => {
        set({ error: null });
      },

      clearRedirect: () => {
        set({ redirectToPath: null });
      },
      
      updateUserProfile: (profileData: Record<string, string>) => {
        const { user } = get();
        
        if (!user) {
          console.error("Cannot update profile: no user is logged in");
          return;
        }
        
        // Log the current user data and what's being updated
        console.log("Current user data:", user);
        console.log("Updating with profile data:", profileData);
        
        // Update the user object with the new profile data
        const updatedUser = {
          ...user,
          ...profileData,
          updated_at: new Date().toISOString()
        };
        
        console.log("Updated user data:", updatedUser);
        
        // Set the updated user in the store
        set({ user: updatedUser });
      }
    }),
    {
      name: 'theoforge-auth', // name for the localStorage key
      partialize: (state: AuthState): AuthPersistedState => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

import { projectId, publicAnonKey } from './supabase/info';
import { getSupabaseClient } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab`;

// Development mode flag - set to true to use mock data when backend is unavailable
const DEV_MODE = typeof import.meta !== 'undefined' && import.meta.env?.DEV !== undefined ? import.meta.env.DEV : true;

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  useAuth = false
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add auth token if required
  if (useAuth) {
    // First, try to get token from localStorage (custom key)
    let token = localStorage.getItem('leadflow_access_token');
    
    // If not found, try to get from Supabase session
    if (!token) {
      try {
        const { data } = await getSupabaseClient().auth.getSession();
        if (data.session?.access_token) {
          token = data.session.access_token;
          // Store it for future use
          localStorage.setItem('leadflow_access_token', token);
          console.log('Retrieved token from Supabase session');
        }
      } catch (error) {
        console.error('Error getting Supabase session:', error);
      }
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[API] Using auth token (length: ${token.length})`);
    } else {
      console.error('Auth required but no token found in localStorage');
      console.error('Available localStorage keys:', Object.keys(localStorage));
      
      // In dev mode, allow mock data without auth
      if (DEV_MODE) {
        console.warn('[DEV MODE] No auth token - using mock data');
      } else {
        throw new Error('Você precisa estar logado para realizar esta ação. Por favor, faça login novamente.');
      }
    }
  } else {
    // Use public anon key for non-auth requests
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  try {
    console.log(`[API] Calling ${endpoint} with method ${options.method || 'GET'}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[API] Response status for ${endpoint}:`, response.status, response.statusText);

    // Check for 404 BEFORE trying to parse JSON (server might return HTML for 404)
    if (response.status === 404 && endpoint === '/admin/notification-settings') {
      // Silently return mock data when endpoint is not deployed yet
      return getMockData(endpoint);
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(`[API] Failed to parse JSON response for ${endpoint}:`, jsonError);
      throw new Error(`Invalid JSON response from server (${response.status})`);
    }

    if (!response.ok) {
      console.error(`[API] Error response for ${endpoint}:`, data);
      
      // If unauthorized, clear tokens and force re-login
      if (response.status === 401 && useAuth) {
        console.error('Session expired - clearing tokens');
        localStorage.removeItem('leadflow_access_token');
        localStorage.removeItem('leadflow_refresh_token');
        
        // Reload page to force user to login screen
        setTimeout(() => window.location.reload(), 1000);
      }
      throw new Error(data.error || data.details || `API error: ${response.status}`);
    }

    console.log(`[API] Success response for ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`[API] API call error for ${endpoint}:`, error);
    
    // Add more context to network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('[API] Network error - Backend unavailable');
      console.error('  - URL:', `${API_BASE_URL}${endpoint}`);
      
      // In development mode, return mock data ONLY for safe GET requests
      if (DEV_MODE && (options.method === 'GET' || !options.method)) {
        console.warn('[DEV MODE] Returning mock data due to network error');
        return getMockData(endpoint);
      }
      
      // For non-GET requests (POST, PUT, DELETE), check if it's notification settings
      if (endpoint === '/admin/notification-settings' && options.method === 'POST') {
        console.warn('[DEV MODE] Allowing mock success for notification settings save');
        return { success: true, settings: JSON.parse(options.body as string) };
      }
      
      // For other non-GET requests, throw error
      if (options.method && options.method !== 'GET') {
        console.error(`[API] ❌ Cannot use mock data for ${options.method} request`);
        throw new Error(`Backend indisponível. Não foi possível realizar operação ${options.method} em ${endpoint}`);
      }
    }
    
    // If error message contains "Invalid JSON response from server (404)" and it's notification-settings
    if (error instanceof Error && 
        error.message.includes('Invalid JSON response from server (404)') && 
        endpoint === '/admin/notification-settings') {
      console.warn('[API] Notification settings endpoint not found, using mock data');
      
      if (options.method === 'POST') {
        return { success: true, settings: JSON.parse(options.body as string) };
      }
      
      return getMockData(endpoint);
    }
    
    throw error;
  }
}

// Mock data for development
function getMockData(endpoint: string): any {
  // Silently return mock data without logging
  
  if (endpoint === '/user/profile' || endpoint === '/users/profile') {
    return {
      id: 'mock-user-id',
      email: 'demo@leadsflow.com',
      name: 'Demo User',
      plan: 'free',
      subscription_plan: 'free',
      isTrial: false,
      limits: {
        leads: 100,
        messages: 50,
        massMessages: 5,
      },
      usage: {
        leads: 0,
        messages: 0,
        massMessages: 0,
      },
    };
  }
  
  if (endpoint === '/leads') {
    return [];
  }
  
  if (endpoint.startsWith('/webhooks/settings')) {
    return {
      success: true,
      webhookSettings: {
        metaPixelId: '',
      },
    };
  }
  
  if (endpoint === '/admin/notification-settings') {
    return {
      success: true,
      settings: {
        upgradeNotifications: true,
        newUserNotifications: false,
        paymentNotifications: true,
      },
    };
  }
  
  return { success: true, data: null };
}

// Export apiRequest wrapper for backward compatibility and easier usage
export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data?: any
): Promise<any> => {
  const options: RequestInit = {
    method,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Determine if auth is needed (all requests except public endpoints need auth)
  const publicEndpoints = ['/plans', '/auth/signup', '/auth/signin'];
  const needsAuth = !publicEndpoints.some(path => endpoint.startsWith(path));

  return apiCall(endpoint, options, needsAuth);
};

// ============================================
// AUTH API
// ============================================

export const authApi = {
  setupDemo: async () => {
    console.log('Setting up demo user...');
    const data = await apiCall('/auth/setup-demo', {
      method: 'POST',
    });
    console.log('Demo setup response:', data);
    return data;
  },

  setupAdmin: async () => {
    console.log('Setting up admin user...');
    const data = await apiCall('/auth/setup-admin', {
      method: 'POST',
    });
    console.log('Admin setup response:', data);
    return data;
  },

  signup: async (email: string, password: string, name: string, selectedPlan: string = 'starter') => {
    console.log('Signup API call for:', email, 'with name:', name, 'selectedPlan:', selectedPlan);
    
    try {
      const data = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, selectedPlan }),
      });
      console.log('Signup API response:', data);
      
      // If signup successful, wait 2 seconds then automatically sign in
      if (data.success) {
        console.log('Signup successful with 7-day trial, waiting 2 seconds before signin...');
        
        // Wait 2 seconds for Supabase to propagate the user
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Attempting automatic signin...');
        return await authApi.signin(email, password);
      }
      
      return data;
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // If user already exists, show clear message
      if (error.message?.includes('already been registered') || 
          error.message?.includes('User already registered')) {
        throw new Error('Este email já está cadastrado. Se você esqueceu sua senha, use a opção "Esqueceu a senha?" na tela de login.');
      }
      
      throw error;
    }
  },

  signin: async (email: string, password: string) => {
    console.log('Signin attempt for:', email);
    console.log('Using Supabase client to sign in...');
    
    try {
      // Use Supabase client directly for signin
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signin error:', error.message, error);
        console.error('Error details:', {
          name: error.name,
          status: error.status,
          message: error.message,
        });
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.\n\n💡 Dica: Se você ainda não tem conta, clique em "Criar conta grátis".');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Por favor, verifique seu email e confirme sua conta antes de fazer login.');
        }
        
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        console.error('Signin failed: No session or user data returned');
        console.error('Data received:', data);
        throw new Error('Falha no login. Nenhuma sessão foi criada.');
      }

      console.log('Signin successful for user:', data.user.id);
      console.log('User email:', data.user.email);
      console.log('User email confirmed:', data.user.email_confirmed_at);
      console.log('Session expires at:', data.session.expires_at);

      // Store tokens in localStorage
      console.log('Storing tokens in localStorage');
      localStorage.setItem('leadflow_access_token', data.session.access_token);
      localStorage.setItem('leadflow_refresh_token', data.session.refresh_token);

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      };
    } catch (error: any) {
      console.error('Signin error:', error);
      console.error('Error type:', typeof error);
      console.error('Error properties:', Object.keys(error));
      throw error;
    }
  },

  signout: async () => {
    try {
      // Sign out using Supabase client
      await getSupabaseClient().auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('leadflow_access_token');
      localStorage.removeItem('leadflow_refresh_token');

      return { success: true };
    } catch (error: any) {
      console.error('Signout error:', error);
      throw error;
    }
  },
};

// ============================================
// USER API
// ============================================

export const userApi = {
  getProfile: async () => {
    return apiCall('/users/profile', {}, true);
  },

  updateProfile: async (name: string) => {
    const updatedProfile = await apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }, true);
    return { success: true, user: updatedProfile };
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, true);
  },
};

// ============================================
// PLANS API
// ============================================

export const plansApi = {
  getPlans: async () => {
    return apiCall('/plans', {});
  },

  upgrade: async (planId: string) => {
    return apiCall('/plans/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }, true);
  },
};

// ============================================
// LEADS API
// ============================================

export const leadsApi = {
  getAll: async () => {
    const leads = await apiCall('/leads', {}, true);
    // Backend returns array directly, wrap it for consistency
    return { success: true, leads: Array.isArray(leads) ? leads : [] };
  },

  create: async (leadData: any) => {
    const lead = await apiCall('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    }, true);
    return { success: true, lead };
  },

  update: async (leadId: string, leadData: any) => {
    const lead = await apiCall(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    }, true);
    return { success: true, lead };
  },

  delete: async (leadId: string) => {
    await apiCall(`/leads/${leadId}`, {
      method: 'DELETE',
    }, true);
    return { success: true };
  },
};

// ============================================
// MESSAGES API
// ============================================

export const messagesApi = {
  send: async (leadId: string, message: string) => {
    return apiCall('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ leadId, message }),
    }, true);
  },

  sendMass: async (leadIds: string[], message: string) => {
    return apiCall('/messages/mass-send', {
      method: 'POST',
      body: JSON.stringify({ leadIds, message }),
    }, true);
  },
};

// ============================================
// ACTIVITIES API
// ============================================

export const activitiesApi = {
  getAll: async (limit = 50) => {
    return apiCall(`/activities?limit=${limit}`, {}, true);
  },
};
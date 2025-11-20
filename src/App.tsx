import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import Analytics from './components/Analytics';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import SettingsPage from './components/settings/SettingsPage';
import AdminPage from './components/settings/AdminPage';
import UpgradeModal from './components/modals/UpgradeModal';
import { MetaPixel } from './components/MetaPixel';
import { authApi, apiRequest } from './utils/api';
import { getSupabaseClient } from './utils/supabase/client';
import { Toaster } from './components/ui/sonner';

// LeadsFlow SAAS - Main App Component
type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'settings' | 'admin' | 'reset-password';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metaPixelId, setMetaPixelId] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[App] 🚀 INITIALIZING APP...');
    console.log('[App] 📍 Current URL:', window.location.href);
    console.log('[App] 🔗 Current hash:', hash);
    console.log('[App] 📝 Hash length:', hash.length);
    console.log('[App] 🔍 Contains "type=recovery"?', hash.includes('type=recovery'));
    console.log('[App] 🔍 Contains "access_token"?', hash.includes('access_token'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check for password reset first (highest priority)
    if (hash && hash.includes('type=recovery')) {
      console.log('[App] 🔐 PASSWORD RESET DETECTED - Processing...');
      setLoading(true);
      setTimeout(() => {
        checkPasswordResetCallback();
      }, 500);
      return; // Exit early, don't run other checks
    }
    
    // Check for Google OAuth callback
    if (hash && hash.includes('access_token') && !hash.includes('type=recovery')) {
      console.log('[App] 🔑 GOOGLE OAUTH DETECTED - Processing...');
      setLoading(true);
      setTimeout(() => {
        checkGoogleOAuthCallback();
      }, 1000);
      return; // Exit early
    }
    
    // Normal auth check
    console.log('[App] 📋 Running normal auth check...');
    checkAuth();
  }, []);

  useEffect(() => {
    // Load Meta Pixel settings when user is logged in
    if (user) {
      loadWebhookSettings();
    }
  }, [user]);

  const loadWebhookSettings = async () => {
    try {
      const token = localStorage.getItem('leadflow_access_token');
      if (!token) {
        console.log('No token available for loading webhook settings');
        return;
      }
      
      const response = await apiRequest('/webhooks/settings', 'GET');
      if (response.success && response.webhookSettings?.metaPixelId) {
        setMetaPixelId(response.webhookSettings.metaPixelId);
      }
    } catch (error) {
      console.warn('[WARN] Failed to load webhook settings - continuing without Meta Pixel:', error);
      // Silently fail - webhook settings are not critical for app functionality
    }
  };

  const checkAuth = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Store tokens
        console.log('[Auth] Storing tokens from session');
        localStorage.setItem('leadflow_access_token', data.session.access_token);
        localStorage.setItem('leadflow_refresh_token', data.session.refresh_token);
        
        // Verify token was saved
        const savedToken = localStorage.getItem('leadflow_access_token');
        console.log('[Auth] Token saved:', !!savedToken);
        
        // Wait a bit to ensure token is fully saved
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get user profile from API
        try {
          const profile = await apiRequest('/user/profile', 'GET');
          console.log('[Auth] Profile fetched:', profile);
          console.log('[Auth] Avatar in profile:', profile.avatar ? 'exists' : 'missing');
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || profile.name || '',
            avatar: profile.avatar, // Ensure avatar is included
            ...profile,
          });
          setCurrentPage('dashboard');
        } catch (profileError) {
          console.warn('[WARN] Error fetching user profile - using fallback data:', profileError);
          // Use mock data if backend is unavailable
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || 'User',
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
          });
          setCurrentPage('dashboard');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('leadflow_access_token');
      localStorage.removeItem('leadflow_refresh_token');
    }
    setLoading(false);
  };

  const checkGoogleOAuthCallback = async () => {
    const supabase = getSupabaseClient();

    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Auth] Session error:', sessionError);
      return;
    }
    
    if (data.session) {
      console.log('[Auth] ✅ Google OAuth session detected');
      console.log('[Auth] User ID:', data.session.user.id);
      console.log('[Auth] Email:', data.session.user.email);
      console.log('[Auth] Token length:', data.session.access_token.length);
      
      localStorage.setItem('leadflow_access_token', data.session.access_token);
      localStorage.setItem('leadflow_refresh_token', data.session.refresh_token);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('leadflow_access_token');
      console.log('[Auth] ✅ Token saved to localStorage');
      
      // Clear hash from URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // Wait a bit to ensure token is fully saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        console.log('[Auth] 📡 Fetching user profile from API...');
        const profile = await apiRequest('/user/profile', 'GET');
        console.log('[Auth] ✅ Profile fetched:', profile);
        
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.name || profile.name || '',
          ...profile,
        });
        console.log('[Auth] ✅ Redirecting to dashboard...');
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('[Auth] ❌ Error fetching profile:', error);
        // Still set basic user info and go to dashboard
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.name || '',
          plan: 'free',
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
        });
        console.log('[Auth] ⚠️ Using fallback user data, redirecting to dashboard...');
        setCurrentPage('dashboard');
      }
    } else {
      console.log('[Auth] ❌ No session found');
    }
  };

  const checkPasswordResetCallback = async () => {
    console.log('[Reset] Starting password reset check...');
    const hash = window.location.hash;
    console.log('[Reset] Current hash:', hash);
    
    // Check if it's a password recovery link
    if (!hash.includes('type=recovery')) {
      console.log('[Reset] ❌ Not a recovery link - exiting');
      setLoading(false);
      setCurrentPage('landing');
      return;
    }
    
    console.log('[Reset] ✅ Recovery type detected');
    const supabase = getSupabaseClient();

    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Reset] ❌ Session error:', sessionError);
      setLoading(false);
      setCurrentPage('landing');
      return;
    }
    
    console.log('[Reset] Session data:', data);
    
    if (data.session) {
      console.log('[Reset] ✅ Password reset session detected');
      console.log('[Reset] User ID:', data.session.user.id);
      console.log('[Reset] Email:', data.session.user.email);
      console.log('[Reset] Token length:', data.session.access_token.length);
      
      localStorage.setItem('leadflow_access_token', data.session.access_token);
      localStorage.setItem('leadflow_refresh_token', data.session.refresh_token);
      
      // Clear hash from URL
      if (window.location.hash) {
        console.log('[Reset] Clearing hash from URL...');
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // Redirect to reset password page
      console.log('[Reset] ✅ Redirecting to reset password page...');
      setCurrentPage('reset-password');
      setLoading(false);
    } else {
      console.log('[Reset] ❌ No session found in recovery link');
      setLoading(false);
      setCurrentPage('landing');
    }
  };

  const handleLoginSuccess = async () => {
    try {
      // Wait a bit for token to be saved in localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify token is saved
      const token = localStorage.getItem('leadflow_access_token');
      console.log('Login success - Token present:', !!token);
      
      if (!token) {
        console.error('No token found after login!');
        return;
      }
      
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        try {
          const profile = await apiRequest('/user/profile', 'GET');
          console.log('[Login Success] Profile fetched:', profile);
          console.log('[Login Success] Avatar in profile:', profile.avatar ? 'exists' : 'missing');
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || profile.name || '',
            avatar: profile.avatar, // Ensure avatar is included
            ...profile,
          });
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError);
          // Still set basic user info
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || '',
          });
        }
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Login success handler error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('leadflow_access_token');
    localStorage.removeItem('leadflow_refresh_token');
    setUser(null);
    setCurrentPage('landing');
  };

  const handleProfileUpdate = (updatedUser: any) => {
    console.log('[Profile Update] Updating user with avatar:', updatedUser.avatar ? 'exists' : 'missing');
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          <p className="text-xs text-gray-400 mt-2">Versão 31 - LeadFlow CRM</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaPixel pixelId={metaPixelId} />
      <Toaster />
      {/* Landing Page */}
      {currentPage === 'landing' && (
        <div className="min-h-screen bg-gray-50">
          <Header
            onLogin={() => setCurrentPage('login')}
            onSignup={() => setCurrentPage('signup')}
          />
          <main>
            <HeroSection onGetStarted={() => setCurrentPage('signup')} />
            <Features />
            <Analytics />
            <Pricing onSelectPlan={() => setCurrentPage('signup')} />
            <Testimonials />
            <FAQ />
            <CTASection onGetStarted={() => setCurrentPage('signup')} />
          </main>
          <Footer />
        </div>
      )}

      {/* Login Page */}
      {currentPage === 'login' && (
        <LoginPage
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentPage('signup')}
        />
      )}

      {/* Signup Page */}
      {currentPage === 'signup' && (
        <SignupPage
          onSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}

      {/* Reset Password Page */}
      {currentPage === 'reset-password' && (
        <ResetPasswordPage
          onSuccess={() => setCurrentPage('login')}
          onCancel={() => setCurrentPage('login')}
        />
      )}

      {/* Settings Page */}
      {currentPage === 'settings' && (
        <SettingsPage
          user={user}
          onBack={() => setCurrentPage('dashboard')}
          onLogout={handleLogout}
          onProfileUpdate={handleProfileUpdate}
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Admin Page */}
      {currentPage === 'admin' && (
        <AdminPage />
      )}

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onSettings={() => setCurrentPage('settings')}
          onAdmin={() => setCurrentPage('admin')}
          onUserUpdate={setUser}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={user?.plan || 'free'}
          onUpgradeSuccess={(updatedUser) => {
            setUser(updatedUser);
            setShowUpgradeModal(false);
          }}
        />
      )}
    </>
  );
}
// LeadsFlow API Server - Updated with getByPrefix fix
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import Stripe from 'npm:stripe';
import * as kv from './kv_store.tsx';
import { activateSubscription, handleWebhook } from './paypal.tsx';

const app = new Hono();

// CORS middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Health Check
app.get('/make-server-4be966ab/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test KV Store
app.get('/make-server-4be966ab/test-kv', async (c) => {
  try {
    await kv.set('test-key', { message: 'Hello KV Store!' });
    const value = await kv.get('test-key');
    return c.json({ success: true, value });
  } catch (error) {
    console.error('KV test error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Setup Demo Account (for development/testing)
app.post('/make-server-4be966ab/auth/setup-demo', async (c) => {
  try {
    const demoEmail = 'demo@leadflow.com';
    const demoPassword = 'demo123456';
    const demoName = 'Demo User';

    const supabase = getSupabaseClient();

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === demoEmail);

    let userId: string;

    if (existingUser) {
      console.log('Demo user already exists, updating password...');
      userId = existingUser.id;

      // Update user password and confirm email
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: demoPassword,
          email_confirm: true,
          user_metadata: { name: demoName },
        }
      );

      if (updateError) {
        console.error('Error updating demo user:', updateError);
        return c.json({ error: updateError.message }, 400);
      }

      console.log('Demo user updated successfully');
      
      // Longer delay to ensure update is committed
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      console.log('Demo user does not exist, creating...');

      // Create new demo user
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { name: demoName },
      });

      if (createError) {
        console.log('Error creating demo user:', createError);
        return c.json({ error: createError.message }, 400);
      }

      userId = data.user.id;
      console.log('Demo user created successfully:', userId);
      
      // Wait longer after creation to allow Supabase to propagate
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    // Check if user profile exists
    const existingProfile = await kv.get(`user:${userId}`);

    if (!existingProfile) {
      console.log('Creating demo user profile...');

      const createdAt = new Date();
      const trialEndDate = new Date(createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      const userProfile = {
        id: userId,
        email: demoEmail,
        name: demoName,
        plan: 'free',
        createdAt: createdAt.toISOString(),
        trialEndsAt: null,
        isTrial: false,
        limits: {
          leads: 100,
          messages: 50,
          massMessages: 5,
          campaigns: 3,
        },
        usage: {
          leads: 0,
          messages: 0,
          massMessages: 0,
          campaigns: 0,
        },
      };

      await kv.set(`user:${userId}`, userProfile);
      console.log('Demo user profile created');
    } else {
      console.log('Demo user profile already exists, ensuring correct plan...');
      // Update to ensure correct free plan settings
      existingProfile.plan = 'free';
      existingProfile.isTrial = false;
      existingProfile.trialEndsAt = null;
      existingProfile.limits = {
        leads: 100,
        messages: 50,
        massMessages: 5,
        campaigns: 3,
      };
      await kv.set(`user:${userId}`, existingProfile);
    }

    // Additional wait before attempting verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Try to verify by signing in
    console.log('Verifying demo user credentials...');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInError) {
      console.error('Demo user verification failed:', signInError);
      return c.json({
        success: true,
        message: 'Demo user created/updated. Please wait 10 seconds before trying to login.',
        credentials: {
          email: demoEmail,
          password: demoPassword,
        },
        needsWait: true,
      });
    }

    console.log('Demo user verified successfully!');

    return c.json({
      success: true,
      message: 'Demo user setup complete and verified',
      credentials: {
        email: demoEmail,
        password: demoPassword,
      },
    });
  } catch (error) {
    console.error('Setup demo error:', error);
    return c.json({ error: 'Internal server error during demo setup' }, 500);
  }
});

// Setup Admin Account (for development/testing)
app.post('/make-server-4be966ab/auth/setup-admin', async (c) => {
  try {
    const adminEmail = 'admin@leadflow.com';
    const adminPassword = 'admin123456';
    const adminName = 'Administrador';

    console.log('[ADMIN SETUP] ========== STARTING ==========');
    
    const supabase = getSupabaseClient();
    console.log('[ADMIN SETUP] Supabase client ready');

    // Check if user exists
    console.log('[ADMIN SETUP] Checking for existing admin...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('[ADMIN SETUP] List error:', listError);
      throw new Error('List users failed: ' + listError.message);
    }
    
    const existingAdmin = existingUsers?.users?.find((u) => u.email === adminEmail);
    
    let userId: string;

    if (existingAdmin) {
      console.log('[ADMIN SETUP] Admin exists, updating password...');
      userId = existingAdmin.id;

      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: adminName, role: 'admin', isAdmin: true },
      });

      if (updateError) {
        console.error('[ADMIN SETUP] Update error:', updateError);
        throw new Error('Update failed: ' + updateError.message);
      }
      
      console.log('[ADMIN SETUP] ✅ Password updated');
      
    } else {
      console.log('[ADMIN SETUP] Creating new admin...');
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: adminName, role: 'admin', isAdmin: true },
      });

      if (createError) {
        console.error('[ADMIN SETUP] Create error:', createError);
        throw new Error('Create failed: ' + createError.message);
      }

      userId = createData.user.id;
      console.log('[ADMIN SETUP] ✅ Admin created, ID:', userId);
    }

    // Save profile
    console.log('[ADMIN SETUP] Saving profile...');
    const userProfile = {
      id: userId,
      email: adminEmail,
      name: adminName,
      role: 'admin',
      isAdmin: true,
      plan: 'enterprise',
      createdAt: new Date().toISOString(),
      trialEndsAt: null,
      isTrial: false,
      planExpiresAt: null,
      limits: { leads: -1, messages: -1, massMessages: -1, bulkMessages: -1, campaigns: -1 },
      usage: { leads: 0, messages: 0, massMessages: 0, campaigns: 0 },
    };

    await kv.set(`user:${userId}`, userProfile);
    console.log('[ADMIN SETUP] ✅ Profile saved');

    // Wait for auth propagation
    console.log('[ADMIN SETUP] Waiting 3s for propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('[ADMIN SETUP] ========== COMPLETE ==========');

    return c.json({
      success: true,
      message: 'Admin ready',
      userId: userId,
      credentials: { email: adminEmail, password: adminPassword },
    });
  } catch (error: any) {
    console.error('[ADMIN SETUP] ========== ERROR ==========');
    console.error('[ADMIN SETUP]', error);
    return c.json({ 
      success: false,
      error: error?.message || String(error)
    }, 500);
  }
});

// Sign up - NOW WITH 7-DAY TRIAL FOR ALL USERS
app.post('/make-server-4be966ab/auth/signup', async (c) => {
  try {
    const { email, password, name, selectedPlan } = await c.req.json();

    console.log('Signup attempt for email:', email, 'name:', name, 'selectedPlan:', selectedPlan);

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { name: name || '' },
    });

    if (error) {
      console.log('Signup error:', error.message, error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user.id);

    // Create user profile - ALL NEW USERS START ON FREE PLAN (NO TRIAL)
    const userId = data.user.id;
    const createdAt = new Date();
    
    // FREE plan limits (applied immediately, no trial)
    const freePlanLimits = {
      leads: 100,
      messages: 50,
      massMessages: 5,
      campaigns: 3,
    };
    
    const userProfile = {
      id: userId,
      email,
      name: name || '',
      plan: 'free', // FREE plan by default
      createdAt: createdAt.toISOString(),
      trialEndsAt: null, // No trial
      isTrial: false, // Not in trial
      limits: freePlanLimits, // FREE plan limits applied immediately
      usage: {
        leads: 0,
        messages: 0,
        massMessages: 0,
        campaigns: 0,
      },
    };

    await kv.set(`user:${userId}`, userProfile);

    console.log('User profile created with FREE plan for user:', userId);

    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        name: name || '',
        plan: 'free',
        isTrial: false,
        trialEndsAt: null,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Sign in
app.post('/make-server-4be966ab/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    console.log('Sign in attempt for email:', email);

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Sign in error:', error.message);
      
      // Check if user exists in our KV store
      const users = await kv.getByPrefix('user:');
      const userExists = users.some(u => u.email === email);
      
      if (!userExists) {
        console.log('User not found in KV store for email:', email);
        return c.json({ 
          error: 'Email não encontrado. Por favor, crie uma conta primeiro.',
          suggestion: 'signup'
        }, 401);
      }
      
      return c.json({ 
        error: error.message,
        suggestion: error.message.includes('credentials') ? 'check_password' : null
      }, 401);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${data.user.id}`);

    console.log('Sign in successful for user:', data.user.id);

    return c.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
      },
      profile: userProfile || null,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Internal server error during sign in' }, 500);
  }
});

// Sign out
app.post('/make-server-4be966ab/auth/signout', async (c) => {
  try {
    console.log('Sign out request received');
    return c.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    return c.json({ error: 'Internal server error during sign out' }, 500);
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Authentication middleware
const authMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('[Auth Middleware] Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[Auth Middleware] Missing Authorization header');
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[Auth Middleware] Token extracted, length:', token.length);
    
    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[Auth Middleware] Auth error:', JSON.stringify(error, null, 2));
      console.error('[Auth Middleware] User data:', JSON.stringify(user, null, 2));
      return c.json({ 
        error: 'Invalid or expired token',
        details: error?.message || 'User not found'
      }, 401);
    }

    console.log('[Auth Middleware] User authenticated:', user.id);
    c.set('user', user);
    await next();
  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    console.error('[Auth Middleware] Error details:', JSON.stringify(error, null, 2));
    return c.json({ 
      error: 'Authentication failed',
      details: error?.message || 'Unknown error'
    }, 401);
  }
};

// Get current user profile
app.get('/make-server-4be966ab/user/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    let userProfile = await kv.get(`user:${user.id}`);

    // Auto-create profile for social login users (Google, etc.)
    if (!userProfile) {
      console.log('Profile not found for user:', user.id, '- creating new profile (likely from social login)');
      
      const now = new Date();
      
      userProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        plan: 'free',
        isTrial: false,
        trialEndsAt: null,
        createdAt: now.toISOString(),
        limits: {
          leads: 100,
          messages: 50,
          massMessages: 5,
          campaigns: 3,
        },
        usage: {
          leads: 0,
          messages: 0,
          massMessages: 0,
          campaigns: 0,
        },
      };
      
      await kv.set(`user:${user.id}`, userProfile);
      console.log('Created profile for social login user with FREE plan');
    }

    return c.json(userProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Alias for /users/profile (for API helper consistency)
app.get('/make-server-4be966ab/users/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    let userProfile = await kv.get(`user:${user.id}`);

    // Auto-create profile for social login users (Google, etc.)
    if (!userProfile) {
      console.log('Profile not found for user:', user.id, '- creating new profile (likely from social login)');
      
      const now = new Date();
      
      userProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        plan: 'free',
        isTrial: false,
        trialEndsAt: null,
        createdAt: now.toISOString(),
        limits: {
          leads: 100,
          messages: 50,
          massMessages: 5,
          campaigns: 3,
        },
        usage: {
          leads: 0,
          messages: 0,
          massMessages: 0,
          campaigns: 0,
        },
      };
      
      await kv.set(`user:${user.id}`, userProfile);
      console.log('Created profile for social login user with FREE plan');
    }

    return c.json(userProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update user profile
app.put('/make-server-4be966ab/user/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const updates = await c.req.json();

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Only allow certain fields to be updated
    const allowedFields = ['name', 'phone', 'company', 'avatar'];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const updatedProfile = { ...userProfile, ...filteredUpdates };
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Alias for /users/profile PUT (for API helper consistency)
app.put('/make-server-4be966ab/users/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const updates = await c.req.json();

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Only allow certain fields to be updated
    const allowedFields = ['name', 'phone', 'company', 'avatar'];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const updatedProfile = { ...userProfile, ...filteredUpdates };
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Change user password
app.post('/make-server-4be966ab/user/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Senha atual e nova senha são obrigatórias' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, 400);
    }

    const supabase = getSupabaseClient();

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return c.json({ error: 'Senha atual incorreta' }, 400);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return c.json({ error: 'Erro ao alterar senha: ' + updateError.message }, 500);
    }

    console.log('Password changed successfully for user:', user.id);

    return c.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ error: 'Erro interno ao alterar senha' }, 500);
  }
});

// Upload avatar
app.post('/make-server-4be966ab/users/avatar', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    console.log('[Avatar Upload] Starting upload for user:', user.id);

    // Parse form data
    const formData = await c.req.formData();
    const file = formData.get('avatar');

    if (!file || !(file instanceof File)) {
      console.error('[Avatar Upload] No file provided or invalid file');
      return c.json({ error: 'No avatar file provided' }, 400);
    }

    console.log('[Avatar Upload] File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('[Avatar Upload] Invalid file type:', file.type);
      return c.json({ error: 'Tipo de arquivo inválido. Use JPG, PNG, GIF ou WEBP.' }, 400);
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      console.error('[Avatar Upload] File too large:', file.size);
      return c.json({ error: 'Arquivo muito grande. Máximo 2MB.' }, 400);
    }

    // Convert file to base64 for storage in KV
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...buffer));
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('[Avatar Upload] File converted to base64, size:', base64.length);

    // Update user profile with avatar URL
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      console.error('[Avatar Upload] User profile not found:', user.id);
      return c.json({ error: 'Perfil de usuário não encontrado' }, 404);
    }

    // Update avatar in profile
    const updatedProfile = { 
      ...userProfile, 
      avatar: dataUrl,
      avatarUpdatedAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${user.id}`, updatedProfile);

    console.log('[Avatar Upload] Avatar updated successfully for user:', user.id);

    return c.json({ 
      success: true, 
      avatarUrl: dataUrl,
      message: 'Avatar atualizado com sucesso'
    });
  } catch (error) {
    console.error('[Avatar Upload] Error:', error);
    return c.json({ 
      error: 'Erro ao fazer upload do avatar',
      details: error.message 
    }, 500);
  }
});

// ============================================
// PLANS AND PRICING ROUTES
// ============================================

// Get all available plans
app.get('/make-server-4be966ab/plans', async (c) => {
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      currency: 'BRL',
      interval: 'month',
      stripePriceId: null,
      limits: {
        leads: 100,
        messages: 50,
        massMessages: 5,
        campaigns: 3,
      },
      features: [
        'Até 100 leads',
        'Até 50 mensagens WhatsApp/mês',
        'Até 5 envios em massa/mês',
        'Até 3 campanhas/mês',
        '1 usuário',
        'Painel básico',
        'Suporte por email',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      price: 20,
      currency: 'USD',
      interval: 'month',
      annualPrice: 100,
      stripePriceId: Deno.env.get('STRIPE_PROFESSIONAL_PRICE_ID') || 'price_business',
      limits: {
        leads: 1000,
        messages: 500,
        massMessages: 100,
        campaigns: 50,
      },
      features: [
        'Até 1.000 leads',
        'Até 500 mensagens WhatsApp/mês',
        'Até 100 envios em massa/mês',
        'Até 50 campanhas/mês',
        'Até 5 usuários',
        'Painel completo',
        'Relatórios em tempo real',
        'Todas as integrações',
        'API + HTTP endpoint',
        'Suporte prioritário',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 59,
      currency: 'USD',
      interval: 'month',
      annualPrice: 200,
      stripePriceId: Deno.env.get('STRIPE_UNLIMITED_PRICE_ID') || 'price_enterprise',
      limits: {
        leads: -1, // Unlimited
        messages: -1,
        massMessages: -1,
        campaigns: -1,
      },
      features: [
        'Leads ilimitados',
        'Mensagens WhatsApp ilimitadas',
        'Envios em massa ilimitados',
        'Campanhas ilimitadas',
        'Usuários ilimitados',
        'Tudo do Business',
        'Gerente dedicado',
        'SLA 99.9%',
        'Suporte 24/7',
        'Onboarding personalizado',
        'Customizações sob medida',
        'Segurança avançada',
      ],
    },
  ];

  return c.json({ success: true, plans });
});

// Upgrade/Downgrade Plan (called from UpgradeModal when user selects free plan)
app.post('/make-server-4be966ab/plans/upgrade', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { planId } = await c.req.json();

    console.log(`[Plan Upgrade] User ${user.id} requesting upgrade/downgrade to ${planId}`);

    if (!planId || !['free', 'business', 'enterprise'].includes(planId)) {
      return c.json({ error: 'Invalid plan ID' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Update plan limits based on the new FREE plan structure
    const planLimits = {
      free: { 
        leads: 100, 
        messages: 50, 
        massMessages: 5,
        campaigns: 3,
      },
      business: { 
        leads: 1000, 
        messages: 500, 
        massMessages: 100,
        campaigns: 50,
      },
      enterprise: { 
        leads: -1, // unlimited
        messages: -1, 
        massMessages: -1,
        campaigns: -1,
      },
    };

    // Update user profile
    userProfile.plan = planId;
    userProfile.subscription_plan = planId;
    userProfile.limits = planLimits[planId];
    
    // Reset trial status when changing plans
    if (planId === 'free') {
      userProfile.isTrial = false;
      userProfile.trialEndsAt = null;
      userProfile.planExpiresAt = null;
    }

    await kv.set(`user:${user.id}`, userProfile);

    console.log(`[Plan Upgrade] Successfully updated user ${user.id} to ${planId} plan`);

    return c.json({ 
      success: true, 
      user: userProfile,
      message: `Plano atualizado para ${planId}` 
    });
  } catch (error) {
    console.error('[Plan Upgrade] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create Stripe Checkout Session for Plan Upgrade
app.post('/make-server-4be966ab/checkout/create-session', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { planId } = await c.req.json();

    // IMPORTANT: Replace these with your actual Stripe Price IDs
    // To create them:
    // 1. Go to https://dashboard.stripe.com/products
    // 2. Create a product for each plan (Business and Enterprise)
    // 3. Add a recurring price to each product
    // 4. Copy the price ID (starts with price_) and paste it here
    const plansConfig = {
      business: Deno.env.get('STRIPE_PROFESSIONAL_PRICE_ID') || 'price_REPLACE_WITH_YOUR_BUSINESS_PRICE_ID',
      enterprise: Deno.env.get('STRIPE_UNLIMITED_PRICE_ID') || 'price_REPLACE_WITH_YOUR_ENTERPRISE_PRICE_ID',
    };

    // Check if Stripe is properly configured
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return c.json({ 
        error: 'Stripe not configured',
        message: 'Please configure STRIPE_SECRET_KEY in environment variables'
      }, 500);
    }

    const priceId = plansConfig[planId];
    if (!priceId || priceId.includes('REPLACE')) {
      return c.json({ 
        error: 'Plan not configured',
        message: `Please configure Stripe Price ID for ${planId} plan`
      }, 400);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${c.req.header('origin') || 'http://localhost:5173'}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${c.req.header('origin') || 'http://localhost:5173'}/dashboard?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    });

    return c.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return c.json({ error: 'Failed to create checkout session: ' + error.message }, 500);
  }
});

// Alias for backward compatibility
app.post('/make-server-4be966ab/stripe/checkout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { planId } = await c.req.json();

    const plansConfig = {
      business: Deno.env.get('STRIPE_PROFESSIONAL_PRICE_ID') || 'price_REPLACE_WITH_YOUR_BUSINESS_PRICE_ID',
      enterprise: Deno.env.get('STRIPE_UNLIMITED_PRICE_ID') || 'price_REPLACE_WITH_YOUR_ENTERPRISE_PRICE_ID',
    };

    // Check if Stripe is properly configured
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return c.json({ 
        error: 'Stripe not configured',
        message: 'Please configure STRIPE_SECRET_KEY in environment variables'
      }, 500);
    }

    const priceId = plansConfig[planId];
    if (!priceId || priceId.includes('REPLACE')) {
      return c.json({ 
        error: 'Plan not configured',
        message: `Please configure Stripe Price ID for ${planId} plan`
      }, 400);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${c.req.header('origin') || 'http://localhost:5173'}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${c.req.header('origin') || 'http://localhost:5173'}/dashboard?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    });

    return c.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return c.json({ error: 'Failed to create checkout session: ' + error.message }, 500);
  }
});

// Stripe Webhook Handler
app.post('/make-server-4be966ab/webhook/stripe', async (c) => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecretKey || !webhookSecret) {
    console.error('Stripe not configured');
    return c.json({ error: 'Stripe not configured' }, 500);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });

  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }

  console.log('Stripe webhook event received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (!userId || !planId) {
        console.error('Missing userId or planId in session metadata');
        break;
      }

      console.log(`Upgrading user ${userId} to ${planId} plan`);

      // Get user profile
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile) {
        console.error('User profile not found:', userId);
        break;
      }

      // Update user plan
      const planLimits = {
        business: { leads: 500, messages: 200, massMessages: 50 },
        enterprise: { leads: -1, messages: -1, massMessages: -1 },
      };

      userProfile.plan = planId;
      userProfile.limits = planLimits[planId];
      userProfile.isTrial = false;
      userProfile.trialEndsAt = null;

      await kv.set(`user:${userId}`, userProfile);

      console.log('User plan updated successfully:', userId, planId);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log('Subscription canceled:', subscription.id);
      // Handle subscription cancellation
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return c.json({ received: true });
});

// Manual plan change (for testing or admin use)
app.post('/make-server-4be966ab/user/change-plan', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { planId } = await c.req.json();

    if (!planId || !['free', 'business', 'enterprise'].includes(planId)) {
      return c.json({ error: 'Invalid plan ID' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Update plan limits
    const planLimits = {
      free: { leads: 100, messages: 10, massMessages: 5 },
      business: { leads: 500, messages: 200, massMessages: 50 },
      enterprise: { leads: -1, messages: -1, massMessages: -1 },
    };

    userProfile.plan = planId;
    userProfile.limits = planLimits[planId];

    await kv.set(`user:${user.id}`, userProfile);

    return c.json({ success: true, profile: userProfile });
  } catch (error) {
    console.error('Change plan error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// LEADS MANAGEMENT ROUTES
// ============================================

// Get all leads for current user
app.get('/make-server-4be966ab/leads', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    console.log('[Leads] Fetching leads for user:', user.id);
    console.log('[Leads] Using prefix:', `lead:${user.id}:`);
    
    const userLeads = await kv.getByPrefix(`lead:${user.id}:`);
    
    console.log('[Leads] Found leads:', userLeads?.length || 0);
    
    // Normalize leads to ensure Portuguese fields are always in the root
    const normalizedLeads = (userLeads || []).map(lead => {
      // Extract from customFields if needed
      const customFields = lead.customFields || {};
      
      return {
        ...lead,
        // Ensure Portuguese fields are at root level
        nome: lead.nome || customFields.nome || lead.name || '',
        telefone: lead.telefone || customFields.telefone || lead.phone || '',
        email: lead.email || customFields.email || '',
        interesse: lead.interesse || customFields.interesse || lead.interest || '',
        origem: lead.origem || customFields.origem || lead.source || 'manual',
        status: lead.status || customFields.status || 'novo',
        data: lead.data || customFields.data || lead.createdAt?.split('T')[0] || '',
        agente_atual: lead.agente_atual || customFields.agente_atual || lead.agent || '',
        observacoes: lead.observacoes || lead.observacao || customFields.observacoes || lead.notes || '',
        marcado_email: lead.marcado_email || customFields.marcado_email || false,
      };
    });
    
    if (normalizedLeads.length > 0) {
      console.log('[Leads] 📊 First normalized lead:', JSON.stringify(normalizedLeads[0], null, 2));
      console.log('[Leads] 📊 Fields: nome=', normalizedLeads[0]?.nome, 'telefone=', normalizedLeads[0]?.telefone);
    }

    return c.json(normalizedLeads);
  } catch (error) {
    console.error('[Leads] Get leads error:', error);
    console.error('[Leads] Error stack:', error.stack);
    return c.json({ error: 'Internal server error while fetching leads' }, 500);
  }
});

// Get single lead by ID
app.get('/make-server-4be966ab/leads/:leadId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const leadId = c.req.param('leadId');
    
    const lead = await kv.get(`lead:${user.id}:${leadId}`);
    
    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    return c.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create new lead
app.post('/make-server-4be966ab/leads', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const leadData = await c.req.json();
    
    console.log('[Create Lead] Received lead data:', JSON.stringify(leadData));

    // Get user profile to check limits
    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check lead limits
    const currentCount = userProfile.usage?.leads || 0;
    
    // -1 or 999999 means unlimited
    if (userProfile.limits.leads !== -1 && userProfile.limits.leads !== 999999) {
      if (currentCount >= userProfile.limits.leads) {
        return c.json({ 
          error: 'Lead limit reached', 
          message: `You have reached your plan limit of ${userProfile.limits.leads} leads per month. Please upgrade your plan.`,
          currentPlan: userProfile.plan,
          currentUsage: currentCount,
          limit: userProfile.limits.leads
        }, 403);
      }
    }

    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Support both Portuguese and English field names
    const lead = {
      id: leadId,
      userId: user.id,
      // Portuguese fields (from frontend)
      nome: leadData.nome || leadData.name || '',
      email: leadData.email || '',
      telefone: leadData.telefone || leadData.phone || '',
      interesse: leadData.interesse || leadData.interest || '',
      origem: leadData.origem || leadData.source || 'manual',
      status: leadData.status || 'novo',
      agente_atual: leadData.agente_atual || leadData.agent || '',
      observacoes: leadData.observacoes || leadData.observacao || leadData.notes || '',
      // English fields for compatibility
      name: leadData.nome || leadData.name || '',
      phone: leadData.telefone || leadData.phone || '',
      company: leadData.company || '',
      source: leadData.origem || leadData.source || 'manual',
      notes: leadData.observacoes || leadData.observacao || leadData.notes || '',
      tags: leadData.tags || [],
      customFields: leadData.customFields || {},
      // Other fields
      marcado_email: leadData.marcado_email || false,
      data: leadData.data || now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`lead:${user.id}:${leadId}`, lead);

    // Update usage counter
    userProfile.usage = userProfile.usage || { leads: 0, messages: 0, massMessages: 0 };
    userProfile.usage.leads = (userProfile.usage.leads || 0) + 1;
    await kv.set(`user:${user.id}`, userProfile);

    console.log('[Create Lead] Lead created successfully:', leadId, 'for user:', user.id);

    return c.json(lead, 201);
  } catch (error) {
    console.error('[Create Lead] Error creating lead:', error);
    return c.json({ error: 'Internal server error while creating lead: ' + error.message }, 500);
  }
});

// Update lead
app.put('/make-server-4be966ab/leads/:leadId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const leadId = c.req.param('leadId');
    const updates = await c.req.json();
    
    console.log('[Update Lead] Updating lead:', leadId, 'with data:', JSON.stringify(updates));

    const existingLead = await kv.get(`lead:${user.id}:${leadId}`);

    if (!existingLead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    // Preserve the field mapping - keep both Portuguese and English names
    const updatedLead = {
      ...existingLead,
      ...updates,
      id: leadId, // Preserve ID
      userId: user.id, // Preserve user ID
      updatedAt: new Date().toISOString(),
    };
    
    // Ensure synchronization between Portuguese and English fields
    if (updates.nome) updatedLead.name = updates.nome;
    if (updates.name) updatedLead.nome = updates.name;
    if (updates.telefone) updatedLead.phone = updates.telefone;
    if (updates.phone) updatedLead.telefone = updates.phone;
    if (updates.origem) updatedLead.source = updates.origem;
    if (updates.source) updatedLead.origem = updates.source;
    if (updates.observacoes) updatedLead.notes = updates.observacoes;
    if (updates.observacao) updatedLead.observacoes = updates.observacao;
    if (updates.notes) updatedLead.observacoes = updates.notes;

    await kv.set(`lead:${user.id}:${leadId}`, updatedLead);

    console.log('[Update Lead] Lead updated successfully:', leadId);

    return c.json(updatedLead);
  } catch (error) {
    console.error('[Update Lead] Error updating lead:', error);
    return c.json({ error: 'Internal server error while updating lead' }, 500);
  }
});

// Delete lead
app.delete('/make-server-4be966ab/leads/:leadId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const leadId = c.req.param('leadId');
    
    console.log('[Delete Lead] 🗑️ Attempting to delete lead:', leadId);
    console.log('[Delete Lead] 🗑️ User ID:', user.id);
    console.log('[Delete Lead] 🗑️ Looking for key:', `lead:${user.id}:${leadId}`);

    const existingLead = await kv.get(`lead:${user.id}:${leadId}`);
    
    console.log('[Delete Lead] 🗑️ Found lead:', existingLead ? 'YES' : 'NO');
    if (existingLead) {
      console.log('[Delete Lead] 🗑️ Lead data:', JSON.stringify(existingLead));
    }

    if (!existingLead) {
      console.error('[Delete Lead] ❌ Lead not found for key:', `lead:${user.id}:${leadId}`);
      return c.json({ error: 'Lead not found' }, 404);
    }

    await kv.del(`lead:${user.id}:${leadId}`);

    // Update usage counter
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile && userProfile.usage) {
      userProfile.usage.leads = Math.max(0, (userProfile.usage.leads || 0) - 1);
      await kv.set(`user:${user.id}`, userProfile);
    }

    console.log('[Delete Lead] ✅ Lead deleted successfully:', leadId);

    return c.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('[Delete Lead] ❌ Delete lead error:', error);
    return c.json({ error: 'Internal server error while deleting lead' }, 500);
  }
});

// ============================================
// EXTERNAL LEAD CAPTURE (N8N, Facebook, Google, etc.)
// ============================================

// HTTP Endpoint to receive leads from external sources (N8N, Facebook, Google Analytics, etc.)
// Available only for Professional and Business plans
app.post('/make-server-4be966ab/leads/external/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const leadData = await c.req.json();

    console.log('External lead received for user:', userId, leadData);

    // Get user profile
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if user has access to HTTP endpoint (Business+ plans)
    const allowedPlans = ['business', 'enterprise'];
    if (!allowedPlans.includes(userProfile.plan)) {
      return c.json({ 
        error: 'HTTP endpoint not available for your plan',
        message: 'Upgrade to Business or Enterprise plan to use this feature',
        currentPlan: userProfile.plan
      }, 403);
    }

    // Check lead limits
    const currentCount = userProfile.usage?.leads || 0;
    
    if (userProfile.limits.leads !== -1 && userProfile.limits.leads !== 999999) {
      if (currentCount >= userProfile.limits.leads) {
        return c.json({ 
          error: 'Lead limit reached', 
          message: `User has reached plan limit of ${userProfile.limits.leads} leads per month`,
          currentUsage: currentCount,
          limit: userProfile.limits.leads
        }, 403);
      }
    }

    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();

    const lead = {
      id: leadId,
      userId: userId,
      name: leadData.name || leadData.nome || '',
      email: leadData.email || '',
      phone: leadData.phone || leadData.telefone || leadData.whatsapp || '',
      company: leadData.company || leadData.empresa || '',
      status: 'new',
      source: leadData.source || 'external',
      notes: leadData.notes || leadData.observacoes || '',
      tags: leadData.tags || [],
      customFields: leadData.customFields || leadData,
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`lead:${userId}:${leadId}`, lead);

    // Update usage counter
    userProfile.usage = userProfile.usage || { leads: 0, messages: 0, massMessages: 0 };
    userProfile.usage.leads = (userProfile.usage.leads || 0) + 1;
    await kv.set(`user:${userId}`, userProfile);

    console.log('External lead created:', leadId, 'for user:', userId);

    return c.json({ 
      success: true, 
      leadId: leadId,
      message: 'Lead captured successfully'
    }, 201);
  } catch (error) {
    console.error('External lead capture error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// ============================================
// WHATSAPP INTEGRATION (Evolution API)
// ============================================

// Helper function to clean API URL
function cleanApiUrl(url: string): string {
  return url.replace(/\/+$/, ''); // Remove trailing slashes
}

// Connect WhatsApp Instance
app.post('/make-server-4be966ab/whatsapp/connect', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const evolutionApiUrl = cleanApiUrl(Deno.env.get('EVOLUTION_API_URL') || '');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      return c.json({ 
        error: 'Evolution API not configured',
        message: 'Please configure EVOLUTION_API_URL and EVOLUTION_API_KEY'
      }, 500);
    }

    console.log(`[WhatsApp Connect] User: ${user.id}, Evolution API URL: ${evolutionApiUrl}`);

    const instanceName = `leadflow_${user.id}`;

    // First, check if instance already exists
    console.log(`[WhatsApp Connect] Checking if instance exists: ${instanceName}`);
    const checkResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
      headers: {
        'apikey': evolutionApiKey,
      },
    });

    let qrCodeData = null;
    let instanceExists = checkResponse.ok;

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      console.log(`[WhatsApp Connect] Instance exists with state: ${checkData.state}`);
      
      // If already connected, return success
      if (checkData.state === 'open') {
        console.log(`[WhatsApp Connect] Instance already connected`);
        return c.json({
          success: true,
          connected: true,
          status: 'connected',
          instanceName: instanceName,
        });
      }
    }

    if (!instanceExists) {
      // Instance doesn't exist, create it
      console.log('[WhatsApp Connect] Creating new WhatsApp instance:', instanceName);
      const createResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      const createData = await createResponse.json();
      console.log('[WhatsApp Connect] Create response:', JSON.stringify(createData, null, 2));

      if (!createResponse.ok) {
        // Check if error is "already exists" - if so, continue to get QR code
        if (createData.response?.message?.[0]?.includes('already in use')) {
          console.log('[WhatsApp Connect] Instance already exists (race condition), will fetch QR code');
          instanceExists = true;
        } else {
          console.error('[WhatsApp Connect] Evolution API error:', createData);
          return c.json({ error: 'Failed to create WhatsApp instance', details: createData }, 500);
        }
      } else {
        console.log('[WhatsApp Connect] Instance created successfully');
        qrCodeData = createData.qrcode?.base64 || createData.qrcode;
        console.log('[WhatsApp Connect] QR code from create response:', qrCodeData ? 'Found' : 'Not found');
      }
    }

    // If instance exists or was just created, get QR code
    if (instanceExists && !qrCodeData) {
      console.log('[WhatsApp Connect] Fetching QR code for existing instance:', instanceName);
      const qrResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
        headers: {
          'apikey': evolutionApiKey,
        },
      });

      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('[WhatsApp Connect] QR response:', JSON.stringify(qrData, null, 2));
        qrCodeData = qrData.base64 || qrData.qrcode?.base64 || qrData.qrcode;
        console.log('[WhatsApp Connect] QR code fetched successfully, has data:', !!qrCodeData);
      } else {
        const errorData = await qrResponse.json();
        console.error('[WhatsApp Connect] Failed to fetch QR code:', errorData);
        return c.json({ error: 'Failed to get QR code', details: errorData }, 500);
      }
    }

    // Store instance info
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile) {
      userProfile.whatsappInstance = {
        instanceName: instanceName,
        connectedAt: new Date().toISOString(),
        status: 'pending',
      };
      await kv.set(`user:${user.id}`, userProfile);
      console.log('[WhatsApp Connect] User profile updated with instance info');
    }

    console.log('[WhatsApp Connect] Final response - has QR code:', !!qrCodeData);
    
    return c.json({
      success: true,
      qrCode: qrCodeData,
      instanceName: instanceName,
      status: 'pending',
    });
  } catch (error) {
    console.error('[WhatsApp Connect] Error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Check WhatsApp Connection Status
app.get('/make-server-4be966ab/whatsapp/status', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const evolutionApiUrl = cleanApiUrl(Deno.env.get('EVOLUTION_API_URL') || '');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    console.log(`[WhatsApp Status] Checking status for user: ${user.id}`);

    if (!evolutionApiUrl || !evolutionApiKey) {
      console.log('[WhatsApp Status] Evolution API not configured');
      return c.json({ success: false, connected: false, status: 'disconnected', error: 'Evolution API not configured' });
    }

    const instanceName = `leadflow_${user.id}`;
    console.log(`[WhatsApp Status] Checking instance: ${instanceName}`);

    const response = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
      headers: {
        'apikey': evolutionApiKey,
      },
    });

    console.log(`[WhatsApp Status] Evolution API response status: ${response.status}`);

    if (!response.ok) {
      const statusCode = response.status;
      console.log(`[WhatsApp Status] Evolution API returned status ${statusCode} for instance ${instanceName}`);
      
      // If instance doesn't exist (404) or other errors, return disconnected
      // This is normal when user hasn't connected WhatsApp yet
      return c.json({ success: false, connected: false, status: 'disconnected' });
    }

    const data = await response.json();
    console.log('[WhatsApp Status] Evolution API connection state:', JSON.stringify(data, null, 2));

    // Evolution API returns different states:
    // - "open" = connected and ready
    // - "connecting" = in process of connecting
    // - "close" = disconnected
    // Check various possible state fields from Evolution API response
    const state = data.state || data.instance?.state || data.connectionState;
    const isConnected = state === 'open' || state === 'connected';
    const statusString = isConnected ? 'connected' : (state === 'connecting' ? 'connecting' : 'disconnected');

    console.log(`[WhatsApp Status] Final status - isConnected: ${isConnected}, statusString: ${statusString}, state: ${state}, raw data.state: ${data.state}`);

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile && userProfile.whatsappInstance) {
      userProfile.whatsappInstance.status = statusString;
      userProfile.whatsappInstance.connected = isConnected;
      await kv.set(`user:${user.id}`, userProfile);
      console.log('[WhatsApp Status] User profile updated');
    }

    return c.json({
      success: true,
      connected: isConnected,
      status: statusString,
      instanceState: data.state, // Keep original state for debugging
      instanceName: instanceName,
      apikey: evolutionApiKey, // Retornar apikey para usar no envio
    });
  } catch (error) {
    console.error('[WhatsApp Status] Error:', error);
    return c.json({ success: false, connected: false, status: 'disconnected', error: error.message });
  }
});

// Get WhatsApp QR Code
app.get('/make-server-4be966ab/whatsapp/qrcode', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const evolutionApiUrl = cleanApiUrl(Deno.env.get('EVOLUTION_API_URL') || '');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      return c.json({ error: 'Evolution API not configured' }, 500);
    }

    const instanceName = `leadflow_${user.id}`;

    // Fetch QR code from Evolution API
    const response = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      headers: {
        'apikey': evolutionApiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to get QR code from Evolution API:', data);
      return c.json({ error: 'Failed to get QR code', details: data }, 500);
    }

    // Return QR code
    return c.json({
      success: true,
      base64: data.base64 || data.qrcode?.base64 || data.qrcode,
      qrcode: data.base64 || data.qrcode?.base64 || data.qrcode,
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Disconnect WhatsApp
app.post('/make-server-4be966ab/whatsapp/disconnect', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const evolutionApiUrl = cleanApiUrl(Deno.env.get('EVOLUTION_API_URL') || '');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    console.log(`[WhatsApp Disconnect] Disconnecting for user: ${user.id}`);

    if (!evolutionApiUrl || !evolutionApiKey) {
      return c.json({ error: 'Evolution API not configured' }, 500);
    }

    const instanceName = `leadflow_${user.id}`;

    // Logout from the instance (doesn't delete it, just disconnects)
    const response = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': evolutionApiKey,
      },
    });

    console.log(`[WhatsApp Disconnect] Evolution API response status: ${response.status}`);

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      console.error('[WhatsApp Disconnect] Evolution API error:', errorData);
      throw new Error(errorData.message || 'Failed to disconnect');
    }

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile && userProfile.whatsappInstance) {
      userProfile.whatsappInstance.status = 'disconnected';
      userProfile.whatsappInstance.connected = false;
      await kv.set(`user:${user.id}`, userProfile);
      console.log('[WhatsApp Disconnect] User profile updated');
    }

    return c.json({ success: true, message: 'WhatsApp disconnected successfully' });
  } catch (error) {
    console.error('[WhatsApp Disconnect] Error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Send WhatsApp Message
app.post('/make-server-4be966ab/whatsapp/send', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { phone, message, leadId } = await c.req.json();

    // Get user profile to check limits
    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check message limits
    const currentCount = userProfile.usage?.messages || 0;
    
    if (userProfile.limits.messages !== -1 && userProfile.limits.messages !== 999999) {
      if (currentCount >= userProfile.limits.messages) {
        return c.json({ 
          error: 'Message limit reached', 
          message: `You have reached your plan limit of ${userProfile.limits.messages} messages per month`,
          currentPlan: userProfile.plan
        }, 403);
      }
    }

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      return c.json({ 
        error: 'Evolution API not configured' 
      }, 500);
    }

    const instanceName = `leadflow_${user.id}`;

    // Format phone number (remove special characters, add country code if needed)
    const formattedPhone = phone.replace(/[^\d]/g, '');
    
    // Remove trailing slash from Evolution API URL if present
    const apiUrl = evolutionApiUrl.replace(/\/$/, '');

    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', data);
      
      // Check for specific error messages from Evolution API
      const errorMsg = data.message || data.error || 'Failed to send message';
      
      if (errorMsg.includes('not connected') || errorMsg.includes('não conectado') || response.status === 404) {
        return c.json({ 
          success: false,
          error: 'WhatsApp não conectado. Configure sua conta WhatsApp nas Integrações.',
          details: data 
        }, 400);
      }
      
      if (errorMsg.includes('not registered') || errorMsg.includes('não está registrado')) {
        return c.json({ 
          success: false,
          error: 'Este número não está registrado no WhatsApp. Verifique o telefone do lead.',
          details: data 
        }, 400);
      }
      
      return c.json({ success: false, error: errorMsg, details: data }, 500);
    }

    // Update usage counter
    userProfile.usage = userProfile.usage || { leads: 0, messages: 0, massMessages: 0 };
    userProfile.usage.messages = (userProfile.usage.messages || 0) + 1;
    await kv.set(`user:${user.id}`, userProfile);

    // Update lead if leadId provided
    if (leadId) {
      const lead = await kv.get(`lead:${user.id}:${leadId}`);
      if (lead) {
        lead.lastContactedAt = new Date().toISOString();
        const noteText = `\n[${new Date().toLocaleString()}] WhatsApp: ${message}`;
        // Update both Portuguese and English fields
        lead.notes = (lead.notes || lead.observacao || '') + noteText;
        lead.observacao = (lead.observacao || lead.notes || '') + noteText;
        await kv.set(`lead:${user.id}:${leadId}`, lead);
      }
    }

    return c.json({
      success: true,
      messageId: data.key?.id,
    });
  } catch (error) {
    console.error('Send WhatsApp error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Send Mass WhatsApp Messages
app.post('/make-server-4be966ab/whatsapp/send-mass', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { leadIds, message } = await c.req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return c.json({ error: 'leadIds array is required' }, 400);
    }

    // Get user profile to check limits
    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check mass message limits
    const currentCount = userProfile.usage?.massMessages || 0;
    
    if (userProfile.limits.massMessages !== -1 && userProfile.limits.massMessages !== 999999) {
      if (currentCount >= userProfile.limits.massMessages) {
        return c.json({ 
          error: 'Mass message limit reached', 
          message: `You have reached your plan limit of ${userProfile.limits.massMessages} mass messages per month`,
          currentPlan: userProfile.plan
        }, 403);
      }
    }

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      return c.json({ 
        error: 'Evolution API not configured' 
      }, 500);
    }

    const instanceName = `leadflow_${user.id}`;
    const results = [];
    
    // Remove trailing slash from Evolution API URL if present
    const apiUrl = evolutionApiUrl.replace(/\/$/, '');

    for (const leadId of leadIds) {
      try {
        const lead = await kv.get(`lead:${user.id}:${leadId}`);
        
        // Check for both Portuguese and English field names
        const phone = lead?.telefone || lead?.phone;
        
        if (!lead || !phone) {
          results.push({ leadId, success: false, error: 'Lead not found or no phone' });
          continue;
        }

        // Personalize message with lead data (support both Portuguese and English)
        let personalizedMessage = message
          .replace(/\{nome\}/gi, lead.nome || lead.name || '')
          .replace(/\{name\}/gi, lead.nome || lead.name || '')
          .replace(/\{email\}/gi, lead.email || '')
          .replace(/\{empresa\}/gi, lead.company || '')
          .replace(/\{company\}/gi, lead.company || '');

        const formattedPhone = phone.replace(/[^\d]/g, '');

        const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: personalizedMessage,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Update lead (support both Portuguese and English fields)
          lead.lastContactedAt = new Date().toISOString();
          const noteText = `\n[${new Date().toLocaleString()}] Mass WhatsApp: ${personalizedMessage}`;
          lead.notes = (lead.notes || lead.observacao || '') + noteText;
          lead.observacao = (lead.observacao || lead.notes || '') + noteText;
          await kv.set(`lead:${user.id}:${leadId}`, lead);

          results.push({ leadId, success: true, messageId: data.key?.id });
        } else {
          results.push({ leadId, success: false, error: data.message || 'Failed to send' });
        }

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ leadId, success: false, error: error.message });
      }
    }

    // Update usage counter
    userProfile.usage = userProfile.usage || { leads: 0, messages: 0, massMessages: 0 };
    userProfile.usage.massMessages = (userProfile.usage.massMessages || 0) + 1;
    userProfile.usage.messages = (userProfile.usage.messages || 0) + results.filter(r => r.success).length;
    await kv.set(`user:${user.id}`, userProfile);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return c.json({
      success: true,
      results,
      summary: {
        total: leadIds.length,
        successful: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error('Send mass WhatsApp error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// ============================================
// CSV IMPORT/EXPORT
// ============================================

// Import leads from CSV
app.post('/make-server-4be966ab/leads/import', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { leads } = await c.req.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return c.json({ error: 'Leads array is required' }, 400);
    }

    // Get user profile to check limits
    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check lead limits
    const currentCount = userProfile.usage?.leads || 0;
    console.log('Import leads - Current count:', currentCount);
    console.log('Import leads - Plan limit:', userProfile.limits.leads);

    // Check if import would exceed limit (skip check if limit is -1 or 999999 = unlimited)
    let availableSlots = leads.length; // Default to all leads
    
    if (userProfile.limits.leads !== -1 && userProfile.limits.leads !== 999999) {
      availableSlots = Math.max(0, userProfile.limits.leads - currentCount);
      
      if (availableSlots === 0) {
        return c.json({ 
          error: 'Lead limit reached', 
          message: `You have reached your plan limit of ${userProfile.limits.leads} leads per month`,
          currentPlan: userProfile.plan,
          currentUsage: currentCount,
          limit: userProfile.limits.leads
        }, 403);
      }
      
      // If trying to import more than available slots, only import what fits
      if (leads.length > availableSlots) {
        console.log(`Limiting import to ${availableSlots} leads (user tried to import ${leads.length})`);
      }
    }

    const now = new Date().toISOString();
    const importedLeads = [];
    const leadsToImport = leads.slice(0, availableSlots); // Only take what fits in the limit

    for (const leadData of leadsToImport) {
      const leadId = crypto.randomUUID();

      const lead = {
        id: leadId,
        userId: user.id,
        name: leadData.name || leadData.nome || '',
        email: leadData.email || '',
        phone: leadData.phone || leadData.telefone || leadData.whatsapp || '',
        company: leadData.company || leadData.empresa || '',
        status: leadData.status || 'new',
        source: 'import',
        notes: leadData.notes || leadData.observacoes || '',
        tags: leadData.tags || [],
        customFields: leadData,
        createdAt: now,
        updatedAt: now,
      };

      await kv.set(`lead:${user.id}:${leadId}`, lead);
      importedLeads.push(lead);
    }

    // Update usage counter
    userProfile.usage = userProfile.usage || { leads: 0, messages: 0, massMessages: 0 };
    userProfile.usage.leads = currentCount + importedLeads.length;
    await kv.set(`user:${user.id}`, userProfile);

    console.log(`Imported ${importedLeads.length} leads for user:`, user.id);

    return c.json({
      success: true,
      imported: importedLeads.length,
      total: leads.length,
      skipped: leads.length - importedLeads.length,
      message: importedLeads.length < leads.length 
        ? `Imported ${importedLeads.length} of ${leads.length} leads. ${leads.length - importedLeads.length} leads skipped due to plan limits.`
        : `Successfully imported ${importedLeads.length} leads`,
      leads: importedLeads,
    });
  } catch (error) {
    console.error('Import leads error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Export leads to CSV
app.get('/make-server-4be966ab/leads/export', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userLeads = await kv.getByPrefix(`lead:${user.id}:`);
    
    if (!userLeads || userLeads.length === 0) {
      return c.json({ error: 'No leads to export' }, 404);
    }

    // Convert to CSV format
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Empresa', 'Status', 'Origem', 'Criado em'];
    const rows = userLeads.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.status,
      lead.source,
      lead.createdAt,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export leads error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// N8N WEBHOOK PROXY
// ============================================

// Sync leads from N8N webhook (proxy to avoid CORS issues)
app.post('/make-server-4be966ab/n8n/sync', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { webhookUrl } = await c.req.json();

    console.log('[N8N Sync] ====== STARTING N8N SYNC ======');
    console.log('[N8N Sync] User ID:', user.id);
    console.log('[N8N Sync] Webhook URL received:', webhookUrl);

    if (!webhookUrl) {
      console.error('[N8N Sync] ERROR: webhookUrl not provided');
      return c.json({ error: 'webhookUrl is required' }, 400);
    }

    // Validate URL
    let url;
    try {
      url = new URL(webhookUrl);
      console.log('[N8N Sync] URL validation passed:', url.toString());
    } catch (e) {
      console.error('[N8N Sync] ERROR: Invalid URL format:', e.message);
      return c.json({ error: 'Invalid webhook URL' }, 400);
    }

    console.log('[N8N Sync] Sending request to webhook...');

    // Fetch data from N8N webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    let response;
    try {
      // Tentar GET primeiro
      console.log('[N8N Sync] Trying GET request...');
      response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      // Se retornar 404 ou 405, o webhook pode ser POST-only
      if (response.status === 404 || response.status === 405) {
        console.log('[N8N Sync] GET not supported (status ' + response.status + '), trying POST...');
        clearTimeout(timeoutId);
        
        // Tentar com POST
        const postController = new AbortController();
        const postTimeoutId = setTimeout(() => postController.abort(), 30000);
        
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ action: 'list_all', source: 'LeadsFlow API' }),
          signal: postController.signal,
        });
        
        clearTimeout(postTimeoutId);
        console.log('[N8N Sync] POST request completed with status:', response.status);
      } else {
        clearTimeout(timeoutId);
      }
      
      console.log('[N8N Sync] ✅ Webhook responded with status:', response.status);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('[N8N Sync] ❌ Fetch error:', fetchError.name, fetchError.message);
      console.error('[N8N Sync] Full error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return c.json({ error: 'Timeout: Webhook did not respond in 30 seconds' }, 408);
      }
      
      return c.json({ 
        error: 'Failed to connect to webhook',
        details: fetchError.message 
      }, 502);
    }

    if (!response.ok) {
      console.error('[N8N Sync] ❌ HTTP error:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error('[N8N Sync] Error response body:', errorText);
      return c.json({ 
        error: `Webhook returned error: ${response.status} ${response.statusText}`,
        details: errorText
      }, response.status);
    }

    // Verificar Content-Type
    const contentType = response.headers.get('content-type');
    console.log('[N8N Sync] Response Content-Type:', contentType);

    // Parse JSON response
    let data;
    try {
      const responseText = await response.text();
      console.log('[N8N Sync] Raw response length:', responseText.length);
      console.log('[N8N Sync] Raw response preview:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      
      // Verificar se a resposta está vazia
      if (!responseText || responseText.trim() === '') {
        console.error('[N8N Sync] ❌ Empty response from webhook');
        console.error('[N8N Sync] This usually means:');
        console.error('[N8N Sync]   1. The N8N workflow has no Respond to Webhook node');
        console.error('[N8N Sync]   2. The workflow is not returning any data');
        console.error('[N8N Sync]   3. There is an error in the N8N workflow');
        return c.json({ 
          error: 'Empty response from webhook',
          details: 'The webhook returned an empty response. Possible causes:\n\n' +
                   '• Missing "Respond to Webhook" node in N8N workflow\n' +
                   '• Workflow not returning any data\n' +
                   '• Error in the N8N workflow execution\n\n' +
                   'Check your N8N workflow logs for more details.'
        }, 502);
      }
      
      // Tentar parsear JSON
      data = JSON.parse(responseText);
      console.log('[N8N Sync] ✅ JSON parsed successfully');
      console.log('[N8N Sync] Data type:', typeof data);
      console.log('[N8N Sync] Is array:', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('[N8N Sync] Array length:', data.length);
      }
    } catch (parseError: any) {
      console.error('[N8N Sync] ❌ JSON parse error:', parseError.message);
      console.error('[N8N Sync] Parse error stack:', parseError.stack);
      console.error('[N8N Sync] Response was not valid JSON');
      console.error('[N8N Sync] First 1000 chars of response:', responseText.substring(0, 1000));
      
      return c.json({ 
        error: 'Invalid JSON response from webhook',
        details: `Could not parse webhook response as JSON.\n\n` +
                 `Error: ${parseError.message}\n\n` +
                 `Response preview: ${responseText.substring(0, 200)}\n\n` +
                 `Make sure your N8N workflow:\n` +
                 `• Has a "Respond to Webhook" node\n` +
                 `• Returns valid JSON format\n` +
                 `• Is properly configured and active`
      }, 502);
    }

    // Extract leads from response - aceitar múltiplos formatos
    let leadsRecebidos;
    
    // Caso 1: Array direto
    if (Array.isArray(data)) {
      leadsRecebidos = data;
    }
    // Caso 2: Objeto com propriedade "leads", "rows", "data", ou "items"
    else if (data.leads) {
      leadsRecebidos = Array.isArray(data.leads) ? data.leads : [data.leads];
    } else if (data.rows) {
      leadsRecebidos = Array.isArray(data.rows) ? data.rows : [data.rows];
    } else if (data.data) {
      leadsRecebidos = Array.isArray(data.data) ? data.data : [data.data];
    } else if (data.items) {
      leadsRecebidos = Array.isArray(data.items) ? data.items : [data.items];
    }
    // Caso 3: POST response do N8N (success message)
    else if (data.success !== undefined || data.message !== undefined) {
      console.log('[N8N Sync] ℹ️ Webhook returned success/message response (not a list)');
      // Webhook POST pode não retornar lista, apenas confirmar sucesso
      leadsRecebidos = [];
    }
    // Caso 4: Objeto único que representa um lead
    else if (typeof data === 'object' && data !== null) {
      console.log('[N8N Sync] ℹ️ Single object response, treating as single lead');
      leadsRecebidos = [data];
    } else {
      leadsRecebidos = [];
    }

    console.log('[N8N Sync] Extracted leads count:', Array.isArray(leadsRecebidos) ? leadsRecebidos.length : 'NOT AN ARRAY');
    console.log('[N8N Sync] Response structure:', {
      isArray: Array.isArray(data),
      hasLeadsKey: !!data.leads,
      hasRowsKey: !!data.rows,
      hasDataKey: !!data.data,
      hasItemsKey: !!data.items,
      dataType: typeof data
    });

    if (!Array.isArray(leadsRecebidos)) {
      console.error('[N8N Sync] ❌ Unexpected response format. Expected array, got:', typeof leadsRecebidos);
      return c.json({ 
        error: 'Unexpected response format from webhook',
        receivedType: typeof leadsRecebidos,
        sampleData: JSON.stringify(data).substring(0, 500)
      }, 502);
    }

    if (leadsRecebidos.length === 0) {
      console.log('[N8N Sync] ℹ️ No leads found in webhook response');
      return c.json({ 
        success: true,
        message: 'No leads found in webhook response',
        added: 0,
        errors: 0
      });
    }

    console.log(`[N8N Sync] Processing ${leadsRecebidos.length} leads...`);
    console.log('[N8N Sync] Sample lead data:', JSON.stringify(leadsRecebidos[0]));

    // Get user profile for limit checking
    const userProfile = await kv.get(`user:${user.id}`);
    const currentLeads = await kv.getByPrefix(`lead:${user.id}:`);
    const currentCount = currentLeads?.length || 0;
    
    console.log('[N8N Sync] Current lead count:', currentCount);
    console.log('[N8N Sync] User plan limits:', userProfile?.limits);
    
    // Check plan limits
    const limits = userProfile?.limits || { leads: 100 };
    const availableSlots = limits.leads === -1 ? Infinity : Math.max(0, limits.leads - currentCount);
    
    console.log('[N8N Sync] Available slots:', availableSlots === Infinity ? 'Unlimited' : availableSlots);

    let leadsAdicionados = 0;
    let erros = 0;
    const now = new Date().toISOString();

    // Process each lead
    for (const leadData of leadsRecebidos) {
      // Check if we've reached the limit
      if (leadsAdicionados >= availableSlots) {
        console.log('[N8N Sync] ⚠️ Limit reached, stopping import');
        erros += (leadsRecebidos.length - leadsAdicionados - erros);
        break;
      }

      try {
        // Normalize lead data
        const leadNormalizado = {
          nome: leadData.nome || leadData.name || leadData.Nome || '',
          email: leadData.email || leadData.Email || '',
          telefone: leadData.telefone || leadData.phone || leadData.Telefone || '',
          empresa: leadData.empresa || leadData.company || leadData.Empresa || '',
          cargo: leadData.cargo || leadData.position || leadData.Cargo || '',
          origem: leadData.origem || leadData.source || leadData.Origem || 'Google Sheets',
          status: leadData.status || leadData.Status || 'novo',
          observacoes: leadData.observacoes || leadData.notes || leadData.Observacoes || '',
        };

        // Validate required fields
        if (!leadNormalizado.nome || leadNormalizado.nome.trim() === '') {
          console.warn('[N8N Sync] ⚠️ Lead without name, skipping');
          erros++;
          continue;
        }

        // Create lead
        const leadId = crypto.randomUUID();
        const lead = {
          id: leadId,
          userId: user.id,
          nome: leadNormalizado.nome,
          email: leadNormalizado.email,
          telefone: leadNormalizado.telefone,
          empresa: leadNormalizado.empresa,
          cargo: leadNormalizado.cargo,
          origem: leadNormalizado.origem,
          status: leadNormalizado.status,
          observacoes: leadNormalizado.observacoes,
          data: now.split('T')[0],
          createdAt: now,
          updatedAt: now,
          marcado_email: false,
        };

        await kv.set(`lead:${user.id}:${leadId}`, lead);
        leadsAdicionados++;
        console.log(`[N8N Sync] ✅ Lead ${leadsAdicionados} created: ${leadNormalizado.nome}`);

      } catch (error: any) {
        console.error('[N8N Sync] Error processing lead:', error);
        erros++;
      }
    }

    // Update user usage
    if (userProfile && leadsAdicionados > 0) {
      userProfile.usage = userProfile.usage || { leads: 0, messages: 0, massMessages: 0 };
      userProfile.usage.leads = currentCount + leadsAdicionados;
      await kv.set(`user:${user.id}`, userProfile);
    }

    return c.json({
      success: true,
      message: `Successfully processed ${leadsRecebidos.length} leads`,
      added: leadsAdicionados,
      errors: erros,
      total: leadsRecebidos.length,
      limitReached: leadsAdicionados < (leadsRecebidos.length - erros)
    });

  } catch (error: any) {
    console.error('[N8N Sync] Error:', error);
    return c.json({ 
      error: 'Internal server error',
      details: error.message 
    }, 500);
  }
});

// ============================================
// EMAIL MARKETING
// ============================================

// Send Email to Single Lead
app.post('/make-server-4be966ab/email/send', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { leadId, subject, message } = await c.req.json();

    if (!leadId || !subject || !message) {
      return c.json({ error: 'leadId, subject, and message are required' }, 400);
    }

    const lead = await kv.get(`lead:${user.id}:${leadId}`);

    if (!lead || !lead.email) {
      return c.json({ error: 'Lead not found or no email address' }, 404);
    }

    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // For now, just log and mark as sent
    console.log(`Sending email to ${lead.email}: ${subject}`);

    // Update lead
    lead.lastEmailedAt = new Date().toISOString();
    lead.notes = (lead.notes || '') + `\n[${new Date().toLocaleString()}] Email sent: ${subject}`;
    await kv.set(`lead:${user.id}:${leadId}`, lead);

    return c.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Send email error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Send Mass Email
app.post('/make-server-4be966ab/email/send-mass', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { leadIds, subject, message } = await c.req.json();

    if (!leadIds || !Array.isArray(leadIds) || !subject || !message) {
      return c.json({ error: 'leadIds array, subject, and message are required' }, 400);
    }

    const results = [];

    for (const leadId of leadIds) {
      try {
        const lead = await kv.get(`lead:${user.id}:${leadId}`);
        
        if (!lead || !lead.email) {
          results.push({ leadId, success: false, error: 'Lead not found or no email' });
          continue;
        }

        // Personalize message
        let personalizedMessage = message
          .replace(/\{nome\}/gi, lead.name || '')
          .replace(/\{email\}/gi, lead.email || '')
          .replace(/\{empresa\}/gi, lead.company || '');

        let personalizedSubject = subject
          .replace(/\{nome\}/gi, lead.name || '')
          .replace(/\{empresa\}/gi, lead.company || '');

        // TODO: Integrate with email service
        console.log(`Sending email to ${lead.email}: ${personalizedSubject}`);

        // Update lead
        lead.lastEmailedAt = new Date().toISOString();
        lead.notes = (lead.notes || '') + `\n[${new Date().toLocaleString()}] Mass email: ${personalizedSubject}`;
        await kv.set(`lead:${user.id}:${leadId}`, lead);

        results.push({ leadId, success: true });

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({ leadId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return c.json({
      success: true,
      results,
      summary: {
        total: leadIds.length,
        successful: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error('Send mass email error:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// ============================================
// ANALYTICS & TRACKING
// ============================================

// Update Meta Pixel ID
app.post('/make-server-4be966ab/tracking/meta-pixel', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { pixelId } = await c.req.json();

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    userProfile.metaPixelId = pixelId || null;
    await kv.set(`user:${user.id}`, userProfile);

    return c.json({ success: true, pixelId });
  } catch (error) {
    console.error('Update Meta Pixel error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update Google Analytics ID
app.post('/make-server-4be966ab/tracking/google-analytics', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { measurementId } = await c.req.json();

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    userProfile.googleAnalyticsId = measurementId || null;
    await kv.set(`user:${user.id}`, userProfile);

    return c.json({ success: true, measurementId });
  } catch (error) {
    console.error('Update Google Analytics error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// WEBHOOK SETTINGS
// ============================================

// Get webhook settings
app.get('/make-server-4be966ab/webhooks/settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({
      success: true,
      webhookSettings: {
        n8nWebhookUrl: userProfile.n8nWebhookUrl || '',
        metaPixelId: userProfile.metaPixelId || '',
        googleAnalyticsId: userProfile.googleAnalyticsId || '',
      },
    });
  } catch (error) {
    console.error('Get webhook settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update webhook settings
app.put('/make-server-4be966ab/webhooks/settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { n8nWebhookUrl, metaPixelId, googleAnalyticsId } = await c.req.json();

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Update webhook settings
    if (n8nWebhookUrl !== undefined) userProfile.n8nWebhookUrl = n8nWebhookUrl;
    if (metaPixelId !== undefined) userProfile.metaPixelId = metaPixelId;
    if (googleAnalyticsId !== undefined) userProfile.googleAnalyticsId = googleAnalyticsId;

    await kv.set(`user:${user.id}`, userProfile);

    return c.json({
      success: true,
      webhookSettings: {
        n8nWebhookUrl: userProfile.n8nWebhookUrl || '',
        metaPixelId: userProfile.metaPixelId || '',
        googleAnalyticsId: userProfile.googleAnalyticsId || '',
      },
    });
  } catch (error) {
    console.error('Update webhook settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// SMTP SETTINGS
// ============================================

// Get SMTP settings
app.get('/make-server-4be966ab/smtp/settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({
      success: true,
      settings: userProfile.smtpSettings || {
        host: '',
        port: 587,
        user: '',
        password: '',
        from: '',
        enabled: false,
      },
    });
  } catch (error) {
    console.error('Get SMTP settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update SMTP settings
app.post('/make-server-4be966ab/smtp/settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const smtpSettings = await c.req.json();

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    userProfile.smtpSettings = {
      host: smtpSettings.host || '',
      port: smtpSettings.port || 587,
      user: smtpSettings.user || '',
      password: smtpSettings.password || '',
      from: smtpSettings.from || '',
      enabled: smtpSettings.enabled || false,
    };

    await kv.set(`user:${user.id}`, userProfile);

    return c.json({
      success: true,
      settings: userProfile.smtpSettings,
    });
  } catch (error) {
    console.error('Update SMTP settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// USAGE TRACKING ROUTES
// ============================================

// Increment usage counter
app.post('/make-server-4be966ab/usage/increment', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { type, quantity } = await c.req.json();

    console.log(`[Usage Increment] User: ${user.id}, Type: ${type}, Quantity: ${quantity || 1}`);

    if (!type) {
      return c.json({ error: 'Usage type is required' }, 400);
    }

    // Validate type
    const validTypes = ['messages', 'massMessages', 'leads', 'campaigns'];
    if (!validTypes.includes(type)) {
      return c.json({ error: `Invalid usage type. Must be one of: ${validTypes.join(', ')}` }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Ensure usage object exists
    if (!userProfile.usage) {
      userProfile.usage = {
        leads: 0,
        messages: 0,
        massMessages: 0,
        campaigns: 0,
      };
    }

    // Increment usage
    const incrementAmount = quantity || 1;
    userProfile.usage[type] = (userProfile.usage[type] || 0) + incrementAmount;

    console.log(`[Usage Increment] Updated usage for ${type}: ${userProfile.usage[type]}`);

    // Save updated profile
    await kv.set(`user:${user.id}`, userProfile);

    return c.json({
      success: true,
      type,
      incrementedBy: incrementAmount,
      usage: userProfile.usage,
      limits: userProfile.limits,
    });
  } catch (error) {
    console.error('[Usage Increment] Error:', error);
    return c.json({ error: 'Internal server error while incrementing usage' }, 500);
  }
});

// Get current usage
app.get('/make-server-4be966ab/usage', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Ensure usage object exists
    if (!userProfile.usage) {
      userProfile.usage = {
        leads: 0,
        messages: 0,
        massMessages: 0,
        campaigns: 0,
      };
    }

    return c.json({
      usage: userProfile.usage,
      limits: userProfile.limits,
      plan: userProfile.plan,
    });
  } catch (error) {
    console.error('[Usage Get] Error:', error);
    return c.json({ error: 'Internal server error while fetching usage' }, 500);
  }
});

// ============================================
// PAYPAL ROUTES
// ============================================

// Activate PayPal subscription (requires authentication)
app.post('/make-server-4be966ab/paypal/activate-subscription', authMiddleware, activateSubscription);

// PayPal webhook handler (public endpoint for PayPal webhooks)
app.post('/make-server-4be966ab/paypal/webhook', handleWebhook);

// ============================================
// ADMIN ROUTES
// ============================================

// Check if user is admin
const checkIfAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userKey = `user:${userId}`;
    const userProfile = await kv.get(userKey);
    
    if (!userProfile) {
      console.log(`[Admin Check] User profile not found for userId: ${userId}`);
      return false;
    }

    // Check if user is admin (accept both leadflow and leadsflow variants)
    const isAdmin = userProfile.isAdmin === true || 
                    userProfile.email === 'admin@leadflow.com' ||
                    userProfile.email === 'admin@leadsflow.com';
    
    console.log(`[Admin Check] User ${userProfile.email} - isAdmin: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get all users (admin only)
app.get('/make-server-4be966ab/admin/users', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const isAdmin = await checkIfAdmin(user.id);
    
    if (!isAdmin) {
      return c.json({ success: false, message: 'Acesso negado. Apenas administradores.' }, 403);
    }

    console.log('[Admin] Loading all users... (using getByPrefix v2)');
    
    // Get all user keys using getByPrefix
    const allUsers: any[] = [];
    
    try {
      // Get all keys starting with 'user:'
      console.log('[Admin] Calling kv.getByPrefix("user:")...');
      const usersData = await kv.getByPrefix('user:');
      console.log(`[Admin] getByPrefix returned ${usersData?.length || 0} items`);
      
      if (!usersData || !Array.isArray(usersData)) {
        console.error('[Admin] getByPrefix did not return an array:', usersData);
        throw new Error('getByPrefix returned invalid data');
      }
      
      for (const userData of usersData) {
        try {
          if (userData && userData.email) {
            allUsers.push({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              plan: userData.plan || 'free',
              planExpiresAt: userData.planExpiresAt,
              createdAt: userData.createdAt,
            });
          }
        } catch (error) {
          console.error(`[Admin] Error processing user data:`, error);
        }
      }
    } catch (kvError: any) {
      console.error('[Admin] KV error:', kvError);
      console.error('[Admin] KV error message:', kvError?.message);
      console.error('[Admin] Available kv functions:', Object.keys(kv));
      throw new Error(`KV operation failed: ${kvError?.message}`);
    }

    // Sort by creation date (newest first)
    allUsers.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    console.log(`[Admin] Returning ${allUsers.length} users`);
    return c.json({ success: true, users: allUsers });
  } catch (error: any) {
    console.error('[Admin] CRITICAL ERROR getting users:', error);
    console.error('[Admin] Error message:', error?.message);
    console.error('[Admin] Error stack:', error?.stack);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// Activate plan for a user (admin only)
app.post('/make-server-4be966ab/admin/activate-plan', authMiddleware, async (c) => {
  try {
    const adminUser = c.get('user');
    const isAdmin = await checkIfAdmin(adminUser.id);
    
    if (!isAdmin) {
      return c.json({ success: false, message: 'Acesso negado. Apenas administradores.' }, 403);
    }

    const { userId, planId, expiresAt } = await c.req.json();

    if (!userId || !planId) {
      return c.json({ success: false, message: 'userId e planId são obrigatórios' }, 400);
    }

    // Get user profile
    const userKey = `user:${userId}`;
    const userProfile = await kv.get(userKey);

    if (!userProfile) {
      return c.json({ success: false, message: 'Usuário não encontrado' }, 404);
    }

    // Define plan limits
    const planLimits: Record<string, any> = {
      free: {
        leads: 100,
        messages: 50,
        bulkMessages: 5,
        campaigns: 1,
      },
      business: {
        leads: 1000,
        messages: 500,
        bulkMessages: 50,
        campaigns: 10,
      },
      enterprise: {
        leads: -1, // unlimited
        messages: -1,
        bulkMessages: -1,
        campaigns: -1,
      },
    };

    const limits = planLimits[planId] || planLimits.free;

    // Update user profile
    const updatedProfile = {
      ...userProfile,
      plan: planId,
      planExpiresAt: expiresAt || null,
      limits,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(userKey, updatedProfile);

    // Log activity
    const activityKey = `activity:${userId}:${Date.now()}`;
    await kv.set(activityKey, {
      userId,
      action: 'plan_activated_by_admin',
      planId,
      expiresAt,
      timestamp: new Date().toISOString(),
      adminId: adminUser.id,
    });

    return c.json({
      success: true,
      message: 'Plano ativado com sucesso',
      user: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error activating plan:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// Get user notifications
app.get('/make-server-4be966ab/notifications', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get all notifications for this user
    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    
    // Sort by timestamp (newest first)
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({
      success: true,
      notifications: sortedNotifications
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mark notification as read
app.put('/make-server-4be966ab/notifications/:notificationId/read', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const notificationId = c.req.param('notificationId');
    
    const notification = await kv.get(`notification:${user.id}:${notificationId}`);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    // Update notification as read
    notification.read = true;
    await kv.set(`notification:${user.id}:${notificationId}`, notification);

    return c.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get admin notification settings
app.get('/make-server-4be966ab/admin/notification-settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    console.log('[Admin Notification Settings] User requesting:', user?.email);
    
    // Check if user is admin using the same function as other admin endpoints
    const isAdmin = await checkIfAdmin(user.id);
    if (!isAdmin) {
      console.error('[Admin Notification Settings] Unauthorized access attempt by:', user.email);
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    const settings = await kv.get(`admin:notification-settings`) || {
      upgradeNotifications: true,
      newUserNotifications: false,
      paymentNotifications: true,
    };

    console.log('[Admin Notification Settings] Retrieved settings:', settings);
    return c.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update admin notification settings
app.post('/make-server-4be966ab/admin/notification-settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    console.log('[Admin Notification Settings Update] User requesting:', user?.email);
    
    // Check if user is admin using the same function as other admin endpoints
    const isAdmin = await checkIfAdmin(user.id);
    if (!isAdmin) {
      console.error('[Admin Notification Settings Update] Unauthorized access attempt by:', user.email);
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    const body = await c.req.json();
    await kv.set(`admin:notification-settings`, body);

    console.log('[Admin Notification Settings Update] Saved settings:', body);
    return c.json({ success: true, settings: body });
  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Helper function to create notification for admin
async function createAdminNotification(type: string, message: string, metadata: any = {}) {
  try {
    // Get admin user - check both possible admin emails
    const supabase = getSupabaseClient();
    const { data: adminAuthData } = await supabase.auth.admin.listUsers();
    const adminEmails = ['admin@leadflow.com', 'admin@leadsflow.com'];
    const adminUser = adminAuthData?.users?.find(u => adminEmails.includes(u.email || ''));
    
    if (!adminUser) {
      console.log('Admin user not found, skipping notification');
      return;
    }

    // Check if admin has this notification type enabled
    const settings = await kv.get(`admin:notification-settings`) || {
      upgradeNotifications: true,
      newUserNotifications: false,
      paymentNotifications: true,
    };

    // Check if notification should be sent
    if (type === 'upgrade' && !settings.upgradeNotifications) {
      console.log('Upgrade notifications disabled for admin');
      return;
    }
    if (type === 'new_user' && !settings.newUserNotifications) {
      console.log('New user notifications disabled for admin');
      return;
    }
    if (type === 'payment' && !settings.paymentNotifications) {
      console.log('Payment notifications disabled for admin');
      return;
    }

    const notificationId = crypto.randomUUID();
    const notification = {
      id: notificationId,
      type,
      message,
      metadata,
      read: false,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`notification:${adminUser.id}:${notificationId}`, notification);
    console.log(`Admin notification created: ${type} - ${message}`);
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
}

Deno.serve(app.fetch);
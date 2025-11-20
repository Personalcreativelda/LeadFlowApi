import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Zap, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { authApi } from '../../utils/api';
import { getSupabaseClient } from '../../utils/supabase/client';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onSetup?: () => void;
}

export default function LoginPage({ onSuccess, onSwitchToSignup, onSetup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [keyPresses, setKeyPresses] = useState<number[]>([]);

  // Add keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === 'd') {
        const now = Date.now();
        setKeyPresses(prev => {
          const newPresses = [...prev, now].filter(t => now - t < 1000);
          
          if (newPresses.length >= 3) {
            setDebugMode(true);
            console.log('🔧 Debug mode activated!');
            return [];
          }
          
          return newPresses;
        });
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debug: Setup test account
  const handleDebugSetup = async () => {
    setError('');
    setLoading(true);
    
    try {
      console.log('🧪 Creating test account via backend...');
      const response = await authApi.setupDemo();
      
      if (response.success) {
        console.log('✅ Test account created successfully');
        // Auto-fill credentials
        setEmail('demo@leadflow.com');
        setPassword('demo123456');
        
        // If the response indicates we need to wait, show message
        if (response.needsWait) {
          setError('✅ Conta de teste criada! Aguarde 10 segundos e clique em "Entrar".\n\nEmail: demo@leadflow.com\nSenha: demo123456');
          setLoading(false);
          return;
        }
        
        // Try to login after delay
        console.log('Waiting 3 seconds before attempting login...');
        setTimeout(async () => {
          try {
            console.log('Attempting auto-login...');
            await authApi.signin('demo@leadflow.com', 'demo123456');
            onSuccess();
          } catch (loginErr: any) {
            console.error('Auto-login failed:', loginErr);
            setError('✅ Conta criada! Clique em "Entrar" para acessar.\n\nEmail: demo@leadflow.com\nSenha: demo123456');
            setLoading(false);
          }
        }, 3000);
      }
    } catch (err: any) {
      console.error('Debug setup error:', err);
      setError('Erro ao criar conta de teste: ' + err.message);
      setLoading(false);
    }
  };

  // Setup Admin Account
  const handleAdminSetup = async () => {
    setError('');
    setLoading(true);
    
    try {
      console.log('🔐 Creating admin account via backend...');
      
      // Import project ID
      const { projectId } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/auth/setup-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Log raw response
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Admin setup response:', data);
      
      // Check for errors more carefully
      if (!response.ok || !data.success) {
        console.error('�� Admin setup failed');
        console.error('Response data:', data);
        throw new Error(data.error || `Server returned ${response.status}`);
      }
      
      console.log('✅ Backend says admin account ready');
      
      // Auto-fill credentials
      setEmail('admin@leadflow.com');
      setPassword('admin123456');
      
      // Show success message
      setError('✅ Conta admin criada/atualizada!\n\n📧 Email: admin@leadflow.com\n🔑 Senha: admin123456\n\n⏳ Fazendo login em 6 segundos...');
      
      // Wait 6 seconds then try login
      console.log('Waiting 6 seconds before login attempt...');
      setTimeout(async () => {
        try {
          console.log('>>> Attempting admin login...');
          const loginResponse = await authApi.signin('admin@leadflow.com', 'admin123456');
          console.log('>>> Login response:', loginResponse);
          
          if (loginResponse.success) {
            console.log('✅✅✅ Auto-login successful!');
            onSuccess();
          } else {
            throw new Error('Login returned false');
          }
        } catch (loginErr: any) {
          console.error('❌ Auto-login failed:', loginErr);
          setError('✅ Conta admin criada!\n\n📧 Email: admin@leadflow.com\n🔑 Senha: admin123456\n\n👆 Os campos estão preenchidos - clique em "Sign in"');
          setLoading(false);
        }
      }, 6000);
    } catch (err: any) {
      console.error('❌ Admin setup error:', err);
      setError('❌ Erro:\n' + err.message);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.signin(email, password);
      if (response.success) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login';
      
      console.error('Login error details:', err);
      
      // Provide helpful message for invalid credentials
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('Invalid') ||
          errorMessage.includes('credentials')) {
        setError('❌ Email ou senha incorretos. Verifique suas credenciais e tente novamente.\n\n💡 Dica: Se você acabou de criar sua conta, aguarde alguns segundos e tente novamente.\n\n🔧 Para testar o sistema, pressione "d" três vezes rapidamente para criar uma conta de demonstração.');
      } else if (errorMessage.includes('não encontrado') || errorMessage.includes('not found')) {
        setError('❌ Email não encontrado. Por favor, crie uma conta clicando em "Criar conta grátis".\n\n🔧 Pressione "d" três vezes rapidamente para criar uma conta de demonstração.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('❌ Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
      } else {
        setError(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });

      if (resetError) throw resetError;
      
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      // Redirect will happen automatically
      console.log('[Google Login] Redirecting to Google...');
    } catch (err: any) {
      console.error('[Google Login Error]', err);
      setError(err.message || 'Erro ao fazer login com Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-6">
          {/* Ícone grande no topo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Título e Subtítulo */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Bem-vindo de volta</h2>
            <p className="text-sm text-gray-500">
              Entre na sua conta para continuar
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            </div>
          )}

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full py-3 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Sign in with Google</span>
          </Button>

          {/* Linha OR */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs text-gray-400">or</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-3 rounded-xl border-gray-200"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-3 rounded-xl border-gray-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-3">
            By continuing, you agree to our{' '}
            <a href="#termos" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacidade" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} PersonalCreativeLda. All rights reserved.
          </p>
          {onSetup && (
            <button
              onClick={onSetup}
              className="mt-2 text-xs text-gray-300 hover:text-gray-500 transition-colors"
            >
              Dev Setup
            </button>
          )}
          {debugMode && (
            <button
              onClick={handleDebugSetup}
              className="mt-2 text-xs text-gray-300 hover:text-gray-500 transition-colors"
            >
              Debug Setup
            </button>
          )}
          {debugMode && (
            <button
              onClick={handleAdminSetup}
              className="mt-2 text-xs text-gray-300 hover:text-gray-500 transition-colors"
            >
              Admin Setup
            </button>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900">Reset Password</h3>
              <p className="text-sm text-gray-500">
                Enter your email to receive a password reset link
              </p>
            </div>

            {resetSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700">
                  ✅ Email sent successfully! Check your inbox.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-sm text-gray-700">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 py-3 rounded-xl border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setError('');
                  }}
                  variant="outline"
                  className="flex-1 py-3 rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? 'Sending...' : 'Send Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
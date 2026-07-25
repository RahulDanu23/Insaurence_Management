import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://insaurence-management.onrender.com/api/auth/login', {
        email,
        password
      });

      const { token, role, requirePasswordChange } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (requirePasswordChange) {
        localStorage.setItem('requirePasswordChange', 'true');
        navigate('/change-password');
      } else {
        localStorage.removeItem('requirePasswordChange');
        if (role === 'Customer') {
          navigate('/customer-dashboard');
        } else if (role === 'Agent') {
          navigate('/agent-dashboard');
        } else {
          navigate('/admin-dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    try {
      const response = await axios.post('https://insaurence-management.onrender.com/api/auth/reset-password', {
        email: resetEmail
      });
      setResetMessage(`Success! Your temporary password is: ${response.data.temporaryPassword}. Please login and change it immediately.`);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-sky-50 rounded-full flex items-center justify-center mb-4 border border-sky-100 shadow-[0_0_15px_rgba(2,132,199,0.1)]">
            <ShieldCheck className="h-8 w-8 text-sky-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-wide">Welcome Back</h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your InsuraX account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={() => setShowResetModal(true)}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700 transition-colors">
            Create one now
          </Link>
        </p>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-slate-500 text-sm mb-6">Enter your email address and we'll generate a temporary password for you.</p>
            
            {resetError && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-lg mb-4 text-sm border border-rose-200">
                {resetError}
              </div>
            )}
            
            {resetMessage && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-4 rounded-lg mb-4 text-sm font-medium border border-emerald-200 break-all">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowResetModal(false);
                    setResetMessage('');
                    setResetError('');
                    setResetEmail('');
                  }}
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  disabled={resetLoading || !!resetMessage}
                  className="flex-1 py-2.5 bg-sky-600 rounded-lg text-sm font-bold text-white hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'success'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://fintrack-seven-rho.vercel.app/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
 
    if (view === 'forgot') {
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed');
        
        setView('success');
        setTimeout(() => {
          setView('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 2000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login or Register flow
    try {
      const endpoint = view === 'register' ? '/auth/register' : '/auth/login';
      const payload = view === 'register' ? { name, email, password } : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token securely in sessionStorage so visiting the site anew shows the login page
      sessionStorage.setItem('fintrack_token', data.token);
      localStorage.removeItem('fintrack_token');
      
      // Tell parent App we are logged in
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setView(view === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-600 shadow-lg shadow-indigo-500/30 mb-6 transition-transform hover:scale-105">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            {view === 'login' ? 'Welcome Back' : view === 'forgot' ? 'Reset Password' : view === 'success' ? 'Password Reset!' : 'Create Account'}
          </h1>
          <p className="text-slate-500 font-medium">
            {view === 'login' ? 'Log in to manage your finances' : view === 'forgot' ? 'Create a new password for your account' : view === 'success' ? 'You can now log in' : 'Join FinTrack to take control of your money'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 flex items-center justify-center text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                    placeholder="John Doe"
                    required={view === 'register'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="ex@gmail.com"
                  required
                />
              </div>
            </div>

            {(view === 'login' || view === 'register') && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                      placeholder="••••••••"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                {view === 'login' && (
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-slate-600">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => { setView('forgot'); setError(''); }}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            )}

            {view === 'forgot' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                      placeholder="••••••••"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                      placeholder="••••••••"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {view !== 'success' && (
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : view === 'forgot' ? 'Save New Password' : 'Create Account'} 
                  {!loading && view !== 'forgot' && <ArrowRight size={20} />}
                </button>
                
                {view === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(''); }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <ArrowLeft size={18} /> Back to Login
                  </button>
                )}
              </div>
            )}
          </form>

          {view === 'success' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-slate-600 font-medium text-center">Your password has been successfully changed.</p>
            </div>
          )}

          {(view === 'login' || view === 'register') && (
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                {view === 'login' ? "Don't have an account?" : "Already have an account?"} 
                <button 
                  onClick={toggleView}
                  className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors"
                >
                  {view === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

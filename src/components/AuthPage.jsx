import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../lib/supabaseClient';

export default function AuthPage({ onLoginSuccess }) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isSignUpMode) {
      // Sign Up Process
      const { user, error } = await signUpWithEmail(email, password, name || 'Atharva Sur');
      setLoading(false);

      if (error) {
        setErrorMsg(error);
      } else {
        onLoginSuccess({
          email: user?.email || email,
          name: name || 'Atharva Sur',
          id: user?.id || 'demo_user'
        });
      }
    } else {
      // Login Process
      const { user, error } = await signInWithEmail(email, password);
      setLoading(false);

      if (error) {
        setErrorMsg(error);
      } else {
        onLoginSuccess({
          email: user?.email || email,
          name: user?.user_metadata?.display_name || email.split('@')[0],
          id: user?.id || 'demo_user'
        });
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { user, error } = await signInWithGoogle();
    setLoading(false);
    if (!error) {
      onLoginSuccess({
        email: user?.email || 'google_user@growth.ai',
        name: user?.user_metadata?.display_name || 'Google User',
        id: user?.id || 'google_demo_id'
      });
    } else {
      setErrorMsg(error);
    }
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      email: 'atharva@growth.ai',
      name: 'Atharva Sur',
      id: 'guest_user'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col gap-6 animate-fade-in relative overflow-hidden">
        
        {/* Title Header */}
        <h2 className="text-3xl font-black text-stone-900 text-center tracking-tight">
          {isSignUpMode ? 'Sign Up' : 'Login'}
        </h2>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Name Field (Sign Up Mode Only) */}
          {isSignUpMode && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-stone-400 tracking-wider">Full Name</label>
              <div className="flex items-center gap-2 border-b border-stone-200 focus-within:border-fuchsia-500 pb-2 transition">
                <User className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name"
                  className="w-full text-xs text-stone-800 placeholder-stone-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          )}

          {/* Email / Username Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-stone-400 tracking-wider">
              {isSignUpMode ? 'Email Address' : 'Username or Email'}
            </label>
            <div className="flex items-center gap-2 border-b border-stone-200 focus-within:border-fuchsia-500 pb-2 transition">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your email"
                className="w-full text-xs text-stone-800 placeholder-stone-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-stone-400 tracking-wider">Password</label>
            <div className="flex items-center gap-2 border-b border-stone-200 focus-within:border-fuchsia-500 pb-2 transition">
              <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password"
                className="w-full text-xs text-stone-800 placeholder-stone-300 focus:outline-none bg-transparent"
              />
            </div>
            
            {!isSignUpMode && (
              <div className="text-right mt-1">
                <button 
                  type="button" 
                  onClick={() => alert("Password reset link sent to registered email.")}
                  className="text-[11px] text-stone-400 hover:text-stone-600 font-medium transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-full text-white font-black text-xs tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUpMode ? 'SIGN UP' : 'LOGIN')}
          </button>
        </form>

        {/* Social Authentication Options */}
        <div className="flex flex-col gap-4">
          <span className="text-[11px] text-stone-400 text-center font-medium">
            {isSignUpMode ? 'Or Sign Up Using' : 'Or Sign In Using'}
          </span>

          <div className="flex items-center justify-center gap-4">
            {/* Facebook Button */}
            <button 
              type="button"
              onClick={() => alert("Facebook login integration initializing.")}
              className="w-10 h-10 rounded-full bg-[#3B5998] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-110 transition cursor-pointer"
              title="Sign in with Facebook"
            >
              f
            </button>

            {/* Twitter Button */}
            <button 
              type="button"
              onClick={() => alert("Twitter login integration initializing.")}
              className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-110 transition cursor-pointer"
              title="Sign in with Twitter"
            >
              t
            </button>

            {/* Google OAuth Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-10 h-10 rounded-full bg-[#DB4437] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-110 transition cursor-pointer"
              title="Sign in with Google Account"
            >
              G
            </button>
          </div>
        </div>

        {/* Toggle Mode Option */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="text-[11px] text-stone-400 font-medium">
            {isSignUpMode ? 'Or Log In Using' : 'Or Sign Up Using'}
          </span>
          <button
            type="button"
            onClick={() => { setIsSignUpMode(!isSignUpMode); setErrorMsg(''); }}
            className="text-xs font-black text-stone-800 tracking-wider hover:text-indigo-600 transition uppercase cursor-pointer"
          >
            {isSignUpMode ? 'LOG IN' : 'SIGN UP'}
          </button>
        </div>

        {/* Demo Mode Quick Access */}
        <div className="text-center border-t border-stone-100 pt-4">
          <button
            onClick={handleGuestLogin}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span>Explore Workspace as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

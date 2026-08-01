import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AppLayout from './components/AppLayout';
import { getCurrentUser, signOutUser } from './lib/supabaseClient';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser({
          email: user.email,
          name: user.user_metadata?.display_name || user.email.split('@')[0],
          id: user.id
        });
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-mono text-sm">
        Initializing Synapse Security Gateway...
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <AppLayout currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;

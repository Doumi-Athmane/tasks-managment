
import React, { useState } from 'react';
import Button from './Button';
import { login, createUser } from "../api/auth";
import { setTokens } from "../auth/token";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isSignUp) {
        if (!username || !password) {
            setError("Please enter both username and password.");
            return;
      }
      }


      setIsLoading(true);

      login(username, password)
          .then(({ access, refresh }) => {
          setTokens(access, refresh);   // ✅ store tokens
          onLogin(username); 
          })
          .catch((err) => {
              console.error("LOGIN ERROR:", err);
              setError("Login failed. Please check your credentials.");
          })
          .finally(() => {
          setIsLoading(false);
          });
    };

    const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (isSignUp) {
        if (!firstName || !lastName) {
          setError('Please enter your full name.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
      }


      if (isSignUp) {
        createUser(firstName, lastName, password, confirmPassword)
          .then(() => {
            console.log("User created:");
          })
          .catch((err) => {
            console.error("REGISTRATION ERROR:", err);
            setError("Registration failed. Please try again.");
          });
      }
    };
    const toggleMode = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsSignUp(!isSignUp);
      setError('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setConfirmPassword('');
    };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4 animate-bounce-subtle">
            <i className="fas fa-layer-group text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tasks Manager</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your workspace</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <form onSubmit={isSignUp ? handleRegister : handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            
            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">First name</label>
                <div className="relative">
                  <i className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    placeholder="e.g. John"
                  />
                </div>
              </div>
            )}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last name</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    placeholder="e.g. Doe"
                />
              </div>
            </div>
            )}
            {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            )}

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <i className="fas fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            )}
            {!isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    placeholder="Enter your username"
                />
              </div>
            </div>

            )}
            {!isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            )}

            {!isSignUp && (
              <Button 
                type="submit" 
                className="w-full py-3.5 text-lg shadow-lg shadow-indigo-100" 
                isLoading={isLoading}
              >
                Sign In
              </Button>
            )}
            {isSignUp && (
              <Button 
                type="submit" 
                className="w-full py-3.5 text-lg shadow-lg shadow-indigo-100" 
                isLoading={isLoading}
              >
                Sign Up
              </Button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={toggleMode}
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors focus:outline-none"
              >
                {isSignUp ? 'Sign In' : 'Create one'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          &copy; Doumi Athmane. All rights reserved.
        </p>
      </div>
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

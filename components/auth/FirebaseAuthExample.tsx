'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FirebaseAuthExample: React.FC = () => {
  const {
    firebaseLogin,
    firebaseSignUp,
    firebaseLogout,
    firebaseUser,
    isLoading,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isSignUp) {
      const result = await firebaseSignUp(email, password, { name });
      if (result.success) {
        setMessage('Account created successfully!');
        setEmail('');
        setPassword('');
        setName('');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } else {
      const result = await firebaseLogin(email, password);
      if (result.success) {
        setMessage('Logged in successfully!');
        setEmail('');
        setPassword('');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    }
  };

  const handleLogout = async () => {
    const result = await firebaseLogout();
    if (result.success) {
      setMessage('Logged out successfully!');
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div className='max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-6 text-center'>
        {firebaseUser ? 'Firebase Authentication' : 'Firebase Login/Signup'}
      </h2>

      {firebaseUser ? (
        <div className='text-center'>
          <p className='mb-4'>Welcome, {firebaseUser.email}!</p>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className='w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50'
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-4'>
          {isSignUp && (
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                required={isSignUp}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50'
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>

          <button
            type='button'
            onClick={() => setIsSignUp(!isSignUp)}
            className='w-full text-blue-500 hover:text-blue-600 text-sm'
          >
            {isSignUp
              ? 'Already have an account? Login'
              : "Don't have an account? Sign Up"}
          </button>
        </form>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default FirebaseAuthExample;

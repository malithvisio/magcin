'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/util/auth';

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Use AuthContext to login
      login(data.user);

      // Also set user in authService for API requests
      authService.setUser(data.user);

      // Redirect to admin panel after successful login
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerStyle={1} footerStyle={2}>
      <div className='auth-page'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-6 col-md-8 col-sm-12'>
              <div className='auth-card'>
                <div className='auth-header text-center mb-4'>
                  <Link href='/' className='auth-logo mb-3'>
                    <img
                      src='/assets/imgs/logo/tours tarils logo.png'
                      alt='Tours Trails'
                      className='light-mode'
                      style={{ width: '250px', height: 'auto' }}
                    />
                    <img
                      src='/assets/imgs/logo/godare_final_TR.png'
                      alt='Tours Trails'
                      className='dark-mode'
                      style={{ width: '150px', height: 'auto' }}
                    />
                  </Link>
                  <h2 className='auth-title'>Tours Trails Admin Login</h2>
                  <p className='auth-subtitle'>
                    Sign in to access the Tours Trails admin panel
                  </p>
                </div>

                {error && (
                  <div className='alert alert-danger mb-3' role='alert'>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className='auth-form'>
                  <div className='form-group mb-3'>
                    <label htmlFor='email' className='form-label'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      className='form-control'
                      placeholder='Enter your email'
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className='form-group mb-3'>
                    <label htmlFor='password' className='form-label'>
                      Password
                    </label>
                    <input
                      type='password'
                      id='password'
                      name='password'
                      className='form-control'
                      placeholder='Enter your password'
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* <div className='form-group mb-4'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <div className='form-check'>
                        <input
                          type='checkbox'
                          id='rememberMe'
                          name='rememberMe'
                          className='form-check-input'
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor='rememberMe'
                          className='form-check-label'
                        >
                          Remember me
                        </label>
                      </div>
                      <Link href='/forgot-password' className='forgot-link'>
                        Forgot Password?
                      </Link>
                    </div>
                  </div> */}

                  <button
                    type='submit'
                    className='btn btn-primary w-100 mb-3'
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
                  </button>

                  <div className='text-center'>
                    <p className='auth-footer'>
                      Don't have an account?
                      <Link href='/register' className='auth-link'>
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          padding: 80px 0;
          min-height: 80vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          color: #666;
          font-size: 1rem;
        }

        .form-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-control {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .form-control:disabled {
          background-color: #f8f9fa;
          opacity: 0.7;
        }

        .form-check-input:checked {
          background-color: #007bff;
          border-color: #007bff;
        }

        .forgot-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .btn-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border: none;
          padding: 14px 20px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          color: #666;
          margin: 0;
        }

        .auth-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 600;
          margin-left: 5px;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .alert {
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .alert-danger {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        @media (max-width: 768px) {
          .auth-page {
            padding: 40px 20px;
          }

          .auth-card {
            padding: 30px 20px;
          }

          .auth-title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 25px 15px;
          }

          .auth-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CSSLoader from '@/components/admin/CSSLoader';
import AdminGuard from '@/components/auth/AdminGuard';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      buttonText: 'View Dashboard',
    },
    {
      name: 'Destinations',
      href: '/admin/destinations',
      buttonText: 'Manage Destinations',
    },
    {
      name: 'Packages',
      href: '/admin/packages',
      buttonText: 'Manage Packages',
    },

    {
      name: 'Testimonials',
      href: '/admin/testimonials',
      buttonText: 'Testimonials',
    },
    {
      name: 'Activities',
      href: '/admin/activities',
      buttonText: 'Activities',
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      buttonText: 'View Bookings',
    },
    {
      name: 'Team',
      href: '/admin/team',
      buttonText: 'View Teams',
    },
    {
      name: 'Gallery',
      href: '/admin/gallery',
      buttonText: 'Gallery',
    },
    {
      name: 'Blogs',
      href: '/admin/blogs',
      buttonText: 'Manage Blogs',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      buttonText: 'Configure Settings',
    },
  ];

  const handleNavigation = (href: string) => {
    setSidebarOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  return (
    <AdminGuard>
      <CSSLoader>
        <div className='admin-layout'>
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className='admin-overlay'
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Fixed Sidebar */}
          <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className='sidebar-header'>
              <h2 className='sidebar-logo'>TourTrails Admin</h2>
              <button
                className='sidebar-close'
                onClick={() => setSidebarOpen(false)}
              >
                <i className='fas fa-times'></i>
              </button>
            </div>

            <nav className='sidebar-nav'>
              {menuItems.map(item => (
                <div key={item.href} className='sidebar-item'>
                  <button
                    className={`sidebar-button ${
                      pathname === item.href ? 'active' : ''
                    }`}
                    onClick={() => handleNavigation(item.href)}
                  >
                    {item.buttonText}
                  </button>
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className='sidebar-footer'>
              {/* <div className='admin-info'>
                <img
                  src='https://randomuser.me/api/portraits/men/32.jpg'
                  alt='Admin'
                  className='admin-avatar'
                />
                <div className='admin-details'>
                  <span className='admin-name'>
                    {user?.name || 'Admin User'}
                  </span>
                  <span className='admin-role'>Administrator</span>
                </div>
              </div> */}
              <button className='logout-button' onClick={handleLogout}>
                <i className='fas fa-sign-out-alt'></i>
                <span className='logout-text'>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className='admin-main'>
            {/* Fixed Header */}
            <header className='admin-header'>
              <div className='header-left'>
                <button
                  className='menu-toggle'
                  onClick={() => setSidebarOpen(true)}
                >
                  <i className='fas fa-bars'></i>
                </button>
                <h1 className='header-title'>Admin Dashboard</h1>
              </div>

              <div className='header-right'>
                <div className='user-info'>
                  <span className='user-name'>Welcome, {user?.name}</span>
                  <span className='user-role'>({user?.role || 'admin'})</span>
                </div>
              </div>
            </header>

            {/* Scrollable Content Area */}
            <main className='admin-content'>{children}</main>
          </div>

          <style jsx>{`
            .admin-layout {
              display: flex;
              min-height: 100vh;
              background-color: #f8fafc;
              font-family:
                -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                'Helvetica Neue', Arial, sans-serif;
            }

            .admin-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 998;
            }

            .admin-sidebar {
              width: 280px;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              position: fixed;
              top: 0;
              left: 0;
              height: 100vh;
              z-index: 999;
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
              display: flex;
              flex-direction: column;
              visibility: visible;
              opacity: 1;
            }

            .admin-sidebar.open {
              transform: translateX(0);
            }

            .sidebar-header {
              padding: 1rem;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-shrink: 0;
            }

            .sidebar-logo {
              font-size: 1.125rem;
              font-weight: 700;
              margin: 0;
              letter-spacing: 0.5px;
            }

            .sidebar-close {
              background: none;
              border: none;
              color: white;
              font-size: 1.25rem;
              cursor: pointer;
              padding: 0.25rem;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .sidebar-nav {
              flex: 1;
              padding: 0.75rem 0;
              overflow-y: auto;
            }

            .sidebar-item {
              margin: 0.25rem 0.75rem;
            }

            .sidebar-button {
              width: 100%;
              padding: 0.75rem 1rem;
              background: none;
              border: none;
              color: white;
              text-align: left;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background-color 0.2s;
              font-size: 0.875rem;
              font-weight: 500;
              letter-spacing: 0.3px;
            }

            .sidebar-button:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }

            .sidebar-button.active {
              background-color: rgba(255, 255, 255, 0.2);
              font-weight: 600;
            }

            .sidebar-footer {
              padding: 1rem;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              flex-shrink: 0;
            }

            .logout-button {
              width: 100%;
              padding: 0.75rem 1rem;
              background: none;
              border: none;
              color: white;
              text-align: left;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background-color 0.2s;
              font-size: 0.875rem;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .logout-button:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }

            .admin-main {
              flex: 1;
              margin-left: 0;
              transition: margin-left 0.3s ease;
            }

            .admin-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: white;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 1rem;
              z-index: 997;
            }

            .header-left {
              display: flex;
              align-items: center;
              gap: 1rem;
            }

            .menu-toggle {
              background: none;
              border: none;
              font-size: 1.25rem;
              color: #6b7280;
              cursor: pointer;
              padding: 0.5rem;
              border-radius: 0.375rem;
              transition: background-color 0.2s;
            }

            .menu-toggle:hover {
              background-color: #f3f4f6;
            }

            .header-title {
              font-size: 1.125rem;
              font-weight: 600;
              margin: 0;
              color: #1f2937;
            }

            .header-right {
              display: flex;
              align-items: center;
              gap: 1rem;
            }

            .user-info {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .user-name {
              font-size: 0.875rem;
              font-weight: 500;
              color: #4b5563;
            }

            .admin-content {
              flex: 1;
              padding: 1rem;
              margin-top: 60px;
              overflow-y: auto;
              min-height: calc(100vh - 60px);
            }

            @media (min-width: 1024px) {
              .admin-sidebar {
                transform: translateX(0);
              }

              .admin-main {
                margin-left: 280px;
              }

              .menu-toggle {
                display: none;
              }

              .sidebar-close {
                display: none;
              }
            }

            @media (max-width: 767px) {
              .admin-sidebar {
                width: 100%;
                max-width: 300px;
              }

              .sidebar-header {
                padding: 0.75rem;
              }

              .sidebar-logo {
                font-size: 1rem;
              }

              .admin-content {
                padding: 0.5rem;
              }

              .header-title {
                font-size: 1rem;
              }

              .user-name {
                display: none;
              }
            }

            @media (max-width: 480px) {
              .admin-sidebar {
                max-width: 280px;
              }

              .admin-content {
                padding: 0.375rem;
              }
            }

            @media (max-width: 360px) {
              .admin-content {
                padding: 0.25rem;
              }
            }
          `}</style>
        </div>
      </CSSLoader>
    </AdminGuard>
  );
}

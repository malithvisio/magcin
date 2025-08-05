'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/util/api-utils';

interface AnalyticsData {
  stats: {
    destinations: {
      total: number;
      published: number;
      draft: number;
      highlighted: number;
    };
    packages: {
      total: number;
      published: number;
      draft: number;
      highlighted: number;
    };
    blogs: {
      total: number;
      published: number;
      draft: number;
    };
    activities: {
      total: number;
      published: number;
      draft: number;
      highlighted: number;
    };
    testimonials: {
      total: number;
      published: number;
      draft: number;
    };
    team: {
      total: number;
      published: number;
      draft: number;
    };
    bookings: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      totalRevenue: number;
      paidBookings: number;
      pendingPayments: number;
    };
  };
  recentActivities: Array<{
    id: string;
    action: string;
    item: string;
    time: string;
    user: string;
    type: string;
    amount?: number;
    paymentStatus?: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isRootUser, companyId, tenantId, mounted } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch analytics if user is authenticated
    if (user && (isRootUser || user.role === 'admin')) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, isRootUser, mounted]);

  // Prevent hydration mismatch by not rendering content until mounted
  if (!mounted) {
    return (
      <AdminLayout>
        <div className='dashboard-container'>
          <div className='loading-message'>
            <p>Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Default stats while loading or if there's an error
  const defaultStats = [
    {
      title: 'Total Destinations',
      value: loading
        ? '...'
        : analytics?.stats.destinations.total?.toString() || '0',
      icon: '🗺️',
      change: analytics?.stats.destinations.published
        ? `${analytics.stats.destinations.published} published`
        : '0 published',
      color: 'blue',
      subtitle: analytics?.stats.destinations.highlighted
        ? `${analytics.stats.destinations.highlighted} highlighted`
        : '',
    },
    {
      title: 'Active Packages',
      value: loading
        ? '...'
        : analytics?.stats.packages.total?.toString() || '0',
      icon: '📦',
      change: analytics?.stats.packages.published
        ? `${analytics.stats.packages.published} published`
        : '0 published',
      color: 'green',
      subtitle: analytics?.stats.packages.highlighted
        ? `${analytics.stats.packages.highlighted} highlighted`
        : '',
    },
    {
      title: 'Activities',
      value: loading
        ? '...'
        : analytics?.stats.activities.total?.toString() || '0',
      icon: '🎯',
      change: analytics?.stats.activities.published
        ? `${analytics.stats.activities.published} published`
        : '0 published',
      color: 'purple',
      subtitle: analytics?.stats.activities.highlighted
        ? `${analytics.stats.activities.highlighted} highlighted`
        : '',
    },
    {
      title: 'Blog Posts',
      value: loading ? '...' : analytics?.stats.blogs.total?.toString() || '0',
      icon: '📝',
      change: analytics?.stats.blogs.published
        ? `${analytics.stats.blogs.published} published`
        : '0 published',
      color: 'orange',
      subtitle: '',
    },
    {
      title: 'Testimonials',
      value: loading
        ? '...'
        : analytics?.stats.testimonials.total?.toString() || '0',
      icon: '⭐',
      change: analytics?.stats.testimonials.published
        ? `${analytics.stats.testimonials.published} published`
        : '0 published',
      color: 'yellow',
      subtitle: '',
    },
    {
      title: 'Team Members',
      value: loading ? '...' : analytics?.stats.team.total?.toString() || '0',
      icon: '👥',
      change: analytics?.stats.team.published
        ? `${analytics.stats.team.published} published`
        : '0 published',
      color: 'indigo',
      subtitle: '',
    },
  ];

  // Booking statistics
  const bookingStats = [
    {
      title: 'Total Bookings',
      value: loading
        ? '...'
        : analytics?.stats.bookings.total?.toString() || '0',
      icon: '📋',
      change: analytics?.stats.bookings.confirmed
        ? `${analytics.stats.bookings.confirmed} confirmed`
        : '0 confirmed',
      color: 'teal',
      subtitle: analytics?.stats.bookings.pending
        ? `${analytics.stats.bookings.pending} pending`
        : '',
    },
    {
      title: 'Total Revenue',
      value: loading
        ? '...'
        : analytics?.stats.bookings.totalRevenue
          ? `$${analytics.stats.bookings.totalRevenue.toLocaleString()}`
          : '$0',
      icon: '💰',
      change: analytics?.stats.bookings.paidBookings
        ? `${analytics.stats.bookings.paidBookings} paid`
        : '0 paid',
      color: 'emerald',
      subtitle: analytics?.stats.bookings.pendingPayments
        ? `${analytics.stats.bookings.pendingPayments} pending payments`
        : '',
    },
    {
      title: 'Ongoing Bookings',
      value: loading
        ? '...'
        : analytics?.stats.bookings.confirmed?.toString() || '0',
      icon: '🔄',
      change: analytics?.stats.bookings.completed
        ? `${analytics.stats.bookings.completed} completed`
        : '0 completed',
      color: 'cyan',
      subtitle: analytics?.stats.bookings.pending
        ? `${analytics.stats.bookings.pending} pending`
        : '',
    },
    {
      title: 'Cancelled Bookings',
      value: loading
        ? '...'
        : analytics?.stats.bookings.cancelled?.toString() || '0',
      icon: '❌',
      change: 'Cancelled',
      color: 'red',
      subtitle: '',
    },
  ];

  // Use real activities if available, otherwise use default
  const recentActivities = analytics?.recentActivities || [
    {
      id: '1',
      action: 'New destination added',
      item: 'Ella',
      time: '2 hours ago',
      user: 'Admin',
      type: 'destination',
    },
    {
      id: '2',
      action: 'Package updated',
      item: 'Honeymoon Special',
      time: '4 hours ago',
      user: 'Admin',
      type: 'package',
    },
    {
      id: '3',
      action: 'New booking received',
      item: 'Booking #1234',
      time: '6 hours ago',
      user: 'Customer',
      type: 'booking',
      amount: 1500,
      paymentStatus: 'paid',
    },
    {
      id: '4',
      action: 'Blog post published',
      item: 'Top 10 Places in Sri Lanka',
      time: '1 day ago',
      user: 'Admin',
      type: 'blog',
    },
  ];

  // Show loading or error state
  if (loading) {
    return (
      <AdminLayout>
        <div className='dashboard-container'>
          <div className='loading-message'>
            <p>Loading your dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className='dashboard-container'>
          <div className='error-message'>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show welcome message with company info
  const welcomeMessage = user?.companyName
    ? `Welcome back to ${user.companyName}! 👋`
    : 'Welcome back, Admin! 👋';

  const companyInfo = user?.companyId ? `Company ID: ${user.companyId}` : '';

  return (
    <AdminLayout>
      <div className='dashboard-container'>
        {/* Welcome Section */}
        <div className='welcome-section'>
          <div className='welcome-header'>
            <div>
              <h1 className='welcome-title'>{welcomeMessage}</h1>
              <p className='welcome-subtitle'>
                Here's what's happening with your tour business today.
              </p>
              {companyInfo && <p className='company-info'>{companyInfo}</p>}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='stats-grid'>
          {defaultStats.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className='stat-icon'>{stat.icon}</div>
              <div className='stat-content'>
                <h3 className='stat-title'>{stat.title}</h3>
                <p className='stat-value'>{stat.value}</p>
                <span className='stat-change'>{stat.change}</span>
                {stat.subtitle && (
                  <span className='stat-subtitle'>{stat.subtitle}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Booking Statistics Section */}
        <div className='booking-stats-section'>
          <h2 className='section-title'>Booking Statistics</h2>
          <div className='stats-grid'>
            {bookingStats.map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className='stat-icon'>{stat.icon}</div>
                <div className='stat-content'>
                  <h3 className='stat-title'>{stat.title}</h3>
                  <p className='stat-value'>{stat.value}</p>
                  <span className='stat-change'>{stat.change}</span>
                  {stat.subtitle && (
                    <span className='stat-subtitle'>{stat.subtitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className='activities-section'>
          <h2 className='section-title'>Recent Activities</h2>
          <div className='activities-list'>
            {recentActivities.map(activity => (
              <div key={activity.id} className='activity-item'>
                <div className='activity-icon'>
                  {activity.type === 'booking'
                    ? '📋'
                    : activity.type === 'destination'
                      ? '🗺️'
                      : activity.type === 'package'
                        ? '📦'
                        : activity.type === 'blog'
                          ? '📝'
                          : activity.type === 'activity'
                            ? '🎯'
                            : activity.type === 'testimonial'
                              ? '⭐'
                              : activity.type === 'team'
                                ? '👥'
                                : '📝'}
                </div>
                <div className='activity-content'>
                  <p className='activity-text'>
                    <strong>{activity.action}</strong> - {activity.item}
                    {activity.amount && (
                      <span className='activity-amount'>
                        {' '}
                        (${activity.amount})
                      </span>
                    )}
                  </p>
                  <div className='activity-meta'>
                    <span className='activity-time'>{activity.time}</span>
                    <span className='activity-user'>by {activity.user}</span>
                    {activity.paymentStatus && (
                      <span
                        className={`activity-payment-status payment-${activity.paymentStatus}`}
                      >
                        {activity.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='quick-actions'>
          <h2 className='section-title'>Quick Actions</h2>
          <div className='actions-grid'>
            <button
              className='action-card'
              onClick={() => router.push('/admin/destinations/add')}
            >
              <span className='action-icon'>➕</span>
              <span className='action-text'>Add Destination</span>
            </button>
            <button
              className='action-card'
              onClick={() => router.push('/admin/packages/add')}
            >
              <span className='action-icon'>📦</span>
              <span className='action-text'>Create Package</span>
            </button>
            <button
              className='action-card'
              onClick={() => router.push('/admin/activities/add')}
            >
              <span className='action-icon'>🎯</span>
              <span className='action-text'>Add Activity</span>
            </button>
            <button
              className='action-card'
              onClick={() => router.push('/admin/blogs/add')}
            >
              <span className='action-icon'>📝</span>
              <span className='action-text'>Write Blog</span>
            </button>
            <button
              className='action-card'
              onClick={() => router.push('/admin/testimonials/add')}
            >
              <span className='action-icon'>⭐</span>
              <span className='action-text'>Add Testimonial</span>
            </button>
            <button
              className='action-card'
              onClick={() => router.push('/admin/bookings')}
            >
              <span className='action-icon'>📋</span>
              <span className='action-text'>Manage Bookings</span>
            </button>
            <button
              className='action-card'
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/migrate-bookings', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert(`Migration completed: ${result.message}`);
                    // Refresh the page to show updated data
                    window.location.reload();
                  } else {
                    alert('Migration failed: ' + result.error);
                  }
                } catch (error) {
                  alert('Migration failed: ' + error);
                }
              }}
            >
              <span className='action-icon'>🔄</span>
              <span className='action-text'>Migrate Bookings</span>
            </button>
            {/* <button
              className='action-card'
              onClick={() => router.push('/admin/team/add')}
            >
              <span className='action-icon'>👥</span>
              <span className='action-text'>Add Team Member</span>
            </button> */}
          </div>
        </div>

        <style jsx>{`
          .dashboard-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .welcome-section {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            border-radius: 12px;
            padding: 2rem;
            color: white;
          }

          .welcome-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          }

          .welcome-subtitle {
            font-size: 1.1rem;
            margin: 0 0 1rem 0;
            opacity: 0.9;
          }

          .company-info {
            font-size: 0.9rem;
            opacity: 0.8;
            margin: 0;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
          }

          .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s ease;
          }

          .stat-card:hover {
            transform: translateY(-2px);
          }

          /* Color variants for booking stats */
          .stat-teal .stat-icon {
            background: #f0fdfa;
            color: #0d9488;
          }

          .stat-emerald .stat-icon {
            background: #f0fdf4;
            color: #059669;
          }

          .stat-cyan .stat-icon {
            background: #ecfeff;
            color: #0891b2;
          }

          .stat-red .stat-icon {
            background: #fef2f2;
            color: #dc2626;
          }

          .stat-icon {
            font-size: 2.5rem;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: #f8fafc;
          }

          .stat-content {
            flex: 1;
          }

          .stat-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #64748b;
            margin: 0 0 0.5rem 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 0.25rem 0;
          }

          .stat-change {
            font-size: 0.875rem;
            color: #10b981;
            font-weight: 500;
          }

          .stat-subtitle {
            font-size: 0.875rem;
            color: #64748b;
            margin-left: 0.5rem;
          }

          .activities-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 1.5rem 0;
          }

          .activities-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
          }

          .activity-icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .activity-content {
            flex: 1;
          }

          .activity-text {
            margin: 0 0 0.25rem 0;
            color: #374151;
          }

          .activity-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.875rem;
            color: #64748b;
            align-items: center;
            flex-wrap: wrap;
          }

          .activity-amount {
            color: #059669;
            font-weight: 600;
          }

          .activity-payment-status {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
          }

          .payment-paid {
            background: #f0fdf4;
            color: #059669;
          }

          .payment-pending {
            background: #fef3c7;
            color: #d97706;
          }

          .payment-failed {
            background: #fef2f2;
            color: #dc2626;
          }

          .payment-refunded {
            background: #f1f5f9;
            color: #64748b;
          }

          .booking-stats-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .quick-actions {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .action-card {
            background: #f8fafc;
            border: none;
            border-radius: 8px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .action-card:hover {
            background: #e2e8f0;
            transform: translateY(-2px);
          }

          .action-icon {
            font-size: 2rem;
          }

          .action-text {
            font-weight: 500;
            color: #374151;
            text-align: center;
          }

          .loading-message,
          .error-message {
            text-align: center;
            padding: 2rem;
            color: #64748b;
          }

          .error-message button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          }

          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .actions-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .welcome-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

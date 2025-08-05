import Link from 'next/link';
import { useState } from 'react';

export default function AdminDashboardModern() {
  // State for collapsible menus
  const [openMenus, setOpenMenus] = useState({
    eCommerce: true,
    task: false,
    forms: false,
    tables: false,
    pages: false,
    support: false,
  });

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className='admin-modern-root'>
      {/* Sidebar */}
      <aside className='admin-modern-sidebar'>
        <div className='sidebar-header'>
          <span className='sidebar-logo'>TailAdmin</span>
        </div>
        <nav className='sidebar-nav'>
          <div className='sidebar-section'>
            <span className='sidebar-section-title'>MENU</span>
            <Link href='#' className='sidebar-link active'>
              <span className='sidebar-icon'>🏠</span> Dashboard
            </Link>
            {/* eCommerce Group */}
            <button
              className='sidebar-link sidebar-collapsible'
              onClick={() => toggleMenu('eCommerce')}
              aria-expanded={openMenus.eCommerce}
            >
              <span className='sidebar-icon'>🛒</span> eCommerce
              <span
                className={`sidebar-arrow${openMenus.eCommerce ? ' open' : ''}`}
              >
                ▼
              </span>
            </button>
            {openMenus.eCommerce && (
              <div className='sidebar-submenu'>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📊</span> Analytics{' '}
                  <span className='sidebar-pro'>Pro</span>
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📈</span> Marketing{' '}
                  <span className='sidebar-pro'>Pro</span>
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>💼</span> CRM{' '}
                  <span className='sidebar-pro'>Pro</span>
                </Link>
              </div>
            )}
            <Link href='#' className='sidebar-link'>
              <span className='sidebar-icon'>🗓️</span> Calendar
            </Link>
            <Link href='#' className='sidebar-link'>
              <span className='sidebar-icon'>👤</span> Profile
            </Link>
            {/* Task Group */}
            <button
              className='sidebar-link sidebar-collapsible'
              onClick={() => toggleMenu('task')}
              aria-expanded={openMenus.task}
            >
              <span className='sidebar-icon'>✅</span> Task
              <span className={`sidebar-arrow${openMenus.task ? ' open' : ''}`}>
                ▼
              </span>
            </button>
            {openMenus.task && (
              <div className='sidebar-submenu'>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📋</span> Task List
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>➕</span> Add Task
                </Link>
              </div>
            )}
            {/* Forms Group */}
            <button
              className='sidebar-link sidebar-collapsible'
              onClick={() => toggleMenu('forms')}
              aria-expanded={openMenus.forms}
            >
              <span className='sidebar-icon'>📝</span> Forms
              <span
                className={`sidebar-arrow${openMenus.forms ? ' open' : ''}`}
              >
                ▼
              </span>
            </button>
            {openMenus.forms && (
              <div className='sidebar-submenu'>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📝</span> Basic Form
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📝</span> Advanced Form
                </Link>
              </div>
            )}
            {/* Tables Group */}
            <button
              className='sidebar-link sidebar-collapsible'
              onClick={() => toggleMenu('tables')}
              aria-expanded={openMenus.tables}
            >
              <span className='sidebar-icon'>📋</span> Tables
              <span
                className={`sidebar-arrow${openMenus.tables ? ' open' : ''}`}
              >
                ▼
              </span>
            </button>
            {openMenus.tables && (
              <div className='sidebar-submenu'>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📋</span> Table 1
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📋</span> Table 2
                </Link>
              </div>
            )}
            {/* Pages Group */}
            <button
              className='sidebar-link sidebar-collapsible'
              onClick={() => toggleMenu('pages')}
              aria-expanded={openMenus.pages}
            >
              <span className='sidebar-icon'>📄</span> Pages
              <span
                className={`sidebar-arrow${openMenus.pages ? ' open' : ''}`}
              >
                ▼
              </span>
            </button>
            {openMenus.pages && (
              <div className='sidebar-submenu'>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📄</span> Page 1
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📄</span> Page 2
                </Link>
              </div>
            )}
          </div>
          <div className='sidebar-section'>
            <span className='sidebar-section-title'>SUPPORT</span>
            <button
              className='sidebar-link sidebar-collapsible'
              onClick={() => toggleMenu('support')}
              aria-expanded={openMenus.support}
            >
              <span className='sidebar-icon'>💬</span> Messages{' '}
              <span className='sidebar-pro'>5 Pro</span>
              <span
                className={`sidebar-arrow${openMenus.support ? ' open' : ''}`}
              >
                ▼
              </span>
            </button>
            {openMenus.support && (
              <div className='sidebar-submenu'>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>📥</span> Inbox{' '}
                  <span className='sidebar-pro'>Pro</span>
                </Link>
                <Link href='#' className='sidebar-link'>
                  <span className='sidebar-icon'>🧾</span> Invoice{' '}
                  <span className='sidebar-pro'>Pro</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className='admin-modern-main'>
        {/* Top Bar */}
        <header className='admin-modern-topbar'>
          <input className='topbar-search' placeholder='Type to search...' />
          <div className='topbar-actions'>
            <button className='topbar-icon-btn'>⚙️</button>
            <button className='topbar-icon-btn'>🔔</button>
            <button className='topbar-icon-btn'>📩</button>
            <div className='topbar-profile'>
              <img
                src='https://randomuser.me/api/portraits/men/32.jpg'
                alt='profile'
              />
              <div className='profile-info'>
                <span className='profile-name'>Thomas Anree</span>
                <span className='profile-role'>UX Designer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stat Cards */}
        <div className='admin-modern-stats'>
          <div className='stat-card'>
            <div className='stat-icon stat-eye'>👁️</div>
            <div>
              <div className='stat-value'>$3.456K</div>
              <div className='stat-label'>
                Total views <span className='stat-up'>0.43% ↑</span>
              </div>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon stat-cart'>🛒</div>
            <div>
              <div className='stat-value'>$45,2K</div>
              <div className='stat-label'>
                Total Profit <span className='stat-up'>4.35% ↑</span>
              </div>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon stat-bag'>🛍️</div>
            <div>
              <div className='stat-value'>2.450</div>
              <div className='stat-label'>
                Total Product <span className='stat-up'>2.59% ↑</span>
              </div>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon stat-user'>👤</div>
            <div>
              <div className='stat-value'>3.456</div>
              <div className='stat-label'>
                Total Users <span className='stat-up'>0.95% ↑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className='admin-modern-charts-row'>
          <div className='chart-card'>
            <div className='chart-title'>Total Revenue</div>
            <div className='chart-placeholder'>[Chart Placeholder]</div>
          </div>
          <div className='chart-card'>
            <div className='chart-title'>Profit this week</div>
            <div className='chart-placeholder'>[Chart Placeholder]</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-modern-root {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(120deg, #2b3990 0%, #6dd5ed 100%);
        }
        .admin-modern-sidebar {
          width: 260px;
          background: #181f3a;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 0 0 2rem 0;
          overflow-y: auto;
          min-height: 100vh;
        }
        .sidebar-header {
          font-size: 1.7rem;
          font-weight: bold;
          padding: 2rem 1.5rem 1rem 1.5rem;
          letter-spacing: 1px;
        }
        .sidebar-logo {
          color: #fff;
        }
        .sidebar-nav {
          flex: 1;
          padding: 0 1rem;
        }
        .sidebar-section {
          margin-bottom: 2.5rem;
        }
        .sidebar-section-title {
          font-size: 0.8rem;
          color: #7a86a1;
          margin-bottom: 0.7rem;
          display: block;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          color: #fff;
          text-decoration: none;
          font-size: 1rem;
          margin-bottom: 0.2rem;
          transition: background 0.2s;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .sidebar-link.active,
        .sidebar-link:hover,
        .sidebar-link:focus {
          background: #2b3990;
          color: #fff;
        }
        .sidebar-icon {
          margin-right: 0.8rem;
          font-size: 1.2rem;
        }
        .sidebar-pro {
          background: #2b3990;
          color: #fff;
          font-size: 0.7rem;
          border-radius: 8px;
          padding: 0.1rem 0.5rem;
          margin-left: 0.5rem;
        }
        .sidebar-link-group {
          font-size: 0.95rem;
          color: #7a86a1;
          margin: 0.5rem 0 0.2rem 0.5rem;
          display: block;
        }
        .sidebar-group {
          margin-bottom: 0.5rem;
        }
        .sidebar-collapsible {
          justify-content: space-between;
          font-weight: 500;
        }
        .sidebar-arrow {
          margin-left: auto;
          font-size: 0.8rem;
          transition: transform 0.2s;
        }
        .sidebar-arrow.open {
          transform: rotate(180deg);
        }
        .sidebar-submenu {
          padding-left: 1.5rem;
          margin-bottom: 0.2rem;
        }
        .sidebar-submenu .sidebar-link {
          background: none;
          color: #bfc9e0;
          font-size: 0.97rem;
          border-radius: 6px;
          margin-bottom: 0.1rem;
        }
        .sidebar-submenu .sidebar-link:hover {
          background: #22306a;
          color: #fff;
        }
        /* Main Content */
        .admin-modern-main {
          flex: 1;
          background: #f6f8fb;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .admin-modern-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem 1rem 2rem;
          background: #fff;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.04);
        }
        .topbar-search {
          flex: 1;
          max-width: 350px;
          padding: 0.7rem 1.2rem;
          border-radius: 8px;
          border: 1px solid #e3e6ed;
          font-size: 1rem;
          margin-right: 2rem;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .topbar-icon-btn {
          background: #f6f8fb;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .topbar-icon-btn:hover {
          background: #e3e6ed;
        }
        .topbar-profile {
          display: flex;
          align-items: center;
          background: #f6f8fb;
          border-radius: 30px;
          padding: 0.2rem 0.8rem 0.2rem 0.2rem;
          margin-left: 1rem;
        }
        .topbar-profile img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          margin-right: 0.7rem;
        }
        .profile-info {
          display: flex;
          flex-direction: column;
        }
        .profile-name {
          font-weight: 600;
          color: #2b3990;
          font-size: 1rem;
        }
        .profile-role {
          font-size: 0.85rem;
          color: #7a86a1;
        }
        /* Stat Cards */
        .admin-modern-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin: 2rem 2rem 0 2rem;
        }
        .stat-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.06);
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding: 1.5rem 1.2rem;
        }
        .stat-icon {
          font-size: 2.2rem;
          background: #f6f8fb;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2b3990;
        }
        .stat-label {
          font-size: 0.95rem;
          color: #7a86a1;
        }
        .stat-up {
          color: #28a745;
          font-size: 0.9em;
          margin-left: 0.5em;
        }
        /* Charts Row */
        .admin-modern-charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          margin: 2rem 2rem 0 2rem;
        }
        .chart-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.06);
          padding: 1.5rem 1.2rem;
          display: flex;
          flex-direction: column;
          min-height: 260px;
        }
        .chart-title {
          font-weight: 600;
          color: #2b3990;
          margin-bottom: 1rem;
        }
        .chart-placeholder {
          flex: 1;
          background: #f6f8fb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7a86a1;
          font-size: 1.1rem;
        }
        @media (max-width: 900px) {
          .admin-modern-charts-row {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 700px) {
          .admin-modern-root {
            flex-direction: column;
          }
          .admin-modern-sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            min-height: 60px;
            padding: 0;
          }
          .sidebar-header,
          .sidebar-section-title,
          .sidebar-link-group {
            display: none;
          }
          .sidebar-link {
            font-size: 1.1rem;
            padding: 0.7rem 0.7rem;
            margin-bottom: 0;
            border-radius: 0;
          }
          .admin-modern-main {
            padding-top: 0;
          }
          .admin-modern-stats,
          .admin-modern-charts-row {
            margin: 1rem 0.5rem 0 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

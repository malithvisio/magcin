'use client';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useRouter } from 'next/navigation';

export default function MobileMenu({ isMobileMenu, handleMobileMenu }: any) {
  const router = useRouter();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle navigation with immediate response
  const handleLinkClick = (
    href: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Close mobile menu immediately
    handleMobileMenu();

    // Navigate immediately
    router.push(href);
  };

  // Handle touch events for mobile
  const handleTouchStart = (href: string, e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Close mobile menu immediately
    handleMobileMenu();

    // Navigate immediately
    router.push(href);
  };

  // Effect to make mobile menu immediately interactive when it opens
  useEffect(() => {
    if (isMobileMenu && mobileMenuRef.current) {
      // Force focus and make interactive
      const mobileMenu = mobileMenuRef.current;
      mobileMenu.style.pointerEvents = 'auto';
      mobileMenu.style.userSelect = 'none';

      // Ensure all links are immediately clickable
      const links = mobileMenu.querySelectorAll('a');
      links.forEach(link => {
        link.style.pointerEvents = 'auto';
        link.style.cursor = 'pointer';
        link.style.userSelect = 'none';
        (link.style as any).webkitUserSelect = 'none';
        (link.style as any).mozUserSelect = 'none';
        (link.style as any).msUserSelect = 'none';
        link.style.touchAction = 'manipulation';
      });
    }
  }, [isMobileMenu]);

  // Effect to hide/show main header logo when mobile menu opens/closes
  useEffect(() => {
    const headerLogo = document.querySelector('.header-logo');
    const body = document.body;

    if (isMobileMenu) {
      // Add class to body for CSS targeting
      body.classList.add('mobile-menu-open');

      // Directly hide main header logo
      if (headerLogo) {
        (headerLogo as HTMLElement).style.opacity = '0';
        (headerLogo as HTMLElement).style.visibility = 'hidden';
        (headerLogo as HTMLElement).style.transform = 'translateX(-20px)';
        (headerLogo as HTMLElement).style.transition = 'all 0.3s ease';
      }
    } else {
      // Remove class from body
      body.classList.remove('mobile-menu-open');

      // Show main header logo back
      if (headerLogo) {
        setTimeout(() => {
          (headerLogo as HTMLElement).style.opacity = '1';
          (headerLogo as HTMLElement).style.visibility = 'visible';
          (headerLogo as HTMLElement).style.transform = 'translateX(0)';
          (headerLogo as HTMLElement).style.transition = 'all 0.3s ease 0.2s';
        }, 100); // Small delay to ensure smooth transition
      }
    }
  }, [isMobileMenu]);

  // Prevent header/loading overlap on page load
  useEffect(() => {
    const handlePageLoad = () => {
      const loadingScreen = document.querySelector('.loading-overlay');
      const header = document.querySelector('.main-header');

      if (loadingScreen && header) {
        // Ensure proper z-index layering during loading
        (header as HTMLElement).style.zIndex = '9998';
        (loadingScreen as HTMLElement).style.zIndex = '9999';
      }
    };

    // Check if page is still loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handlePageLoad);
    } else {
      handlePageLoad();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handlePageLoad);
    };
  }, []);

  return (
    <>
      <div
        ref={mobileMenuRef}
        className={`mobile-header-active mobile-header-wrapper-style perfect-scrollbar button-bg-2 ${
          isMobileMenu ? 'sidebar-visible' : ''
        }`}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        <PerfectScrollbar className='mobile-header-wrapper-inner'>
          <div className='mobile-header-logo'>
            {' '}
            <Link className='d-flex' href='/' onClick={handleMobileMenu}>
              <img
                className='light-mode'
                alt='Travila'
                src='/assets/imgs/logo/godare_final_TR.png'
                style={{ width: '200px', height: 'auto', marginLeft: '0px' }}
              />
              <img
                className='dark-mode'
                alt='Travila'
                src='/assets/imgs/template/logo-w.svg'
                style={{ width: '200px', height: 'auto', marginLeft: '20px' }}
              />
            </Link>
            <div
              className='burger-icon burger-icon-white'
              onClick={handleMobileMenu}
            />
          </div>
          {/* <div className="mobile-header-top">
						<div className="box-author-profile">
							<div className="card-author">
								<div className="card-image"> <img src="/assets/imgs/page/homepage1/author2.png" alt="Travila" /></div>
								<div className="card-info">
									<p className="text-md-bold neutral-1000">Alice Roses</p>
									<p className="text-xs neutral-1000">London, England</p>
								</div>
							</div><Link className="btn btn-black" href="#">Logout</Link>
						</div>
					</div> */}
          <div className='mobile-header-content-area'>
            <div className='perfect-scroll'>
              <div className='mobile-menu-wrap mobile-header-border'>
                <nav>
                  <ul className='mobile-menu font-heading'>
                    <li>
                      <div className='mobile-menu-item-wrapper'>
                        <a
                          href='/'
                          onClick={e => handleLinkClick('/', e)}
                          onTouchStart={e => handleTouchStart('/', e)}
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'manipulation',
                          }}
                        >
                          Home
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className='mobile-menu-item-wrapper'>
                        <a
                          href='/tours'
                          onClick={e => handleLinkClick('/tours', e)}
                          onTouchStart={e => handleTouchStart('/tours', e)}
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'manipulation',
                          }}
                        >
                          Tours
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className='mobile-menu-item-wrapper'>
                        <a
                          href='/destination'
                          onClick={e => handleLinkClick('/destination', e)}
                          onTouchStart={e =>
                            handleTouchStart('/destination', e)
                          }
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'manipulation',
                          }}
                        >
                          Destinations
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className='mobile-menu-item-wrapper'>
                        <a
                          href='/gallery'
                          onClick={e => handleLinkClick('/gallery', e)}
                          onTouchStart={e => handleTouchStart('/gallery', e)}
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'manipulation',
                          }}
                        >
                          Gallery
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className='mobile-menu-item-wrapper'>
                        <a
                          href='/about'
                          onClick={e => handleLinkClick('/about', e)}
                          onTouchStart={e => handleTouchStart('/about', e)}
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'manipulation',
                          }}
                        >
                          About
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className='mobile-menu-item-wrapper'>
                        <a
                          href='/contact'
                          onClick={e => handleLinkClick('/contact', e)}
                          onTouchStart={e => handleTouchStart('/contact', e)}
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'manipulation',
                          }}
                        >
                          Contact Us
                        </a>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </PerfectScrollbar>
      </div>

      <style jsx>{`
        .mobile-header-active {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%;
          max-width: 350px;
          height: 100vh;
          background: white;
          z-index: 10000;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateX(0);
          opacity: 0;
          visibility: hidden;
          box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
        }

        .mobile-header-active.sidebar-visible {
          right: 0;
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        .mobile-header-wrapper-inner {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease 0.1s;
        }

        .mobile-header-active.sidebar-visible .mobile-header-wrapper-inner {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-menu li {
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.3s ease;
          margin-bottom: 2px;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li {
          opacity: 1;
          transform: translateX(0);
        }

        .mobile-header-active.sidebar-visible .mobile-menu li:nth-child(1) {
          transition-delay: 0.1s;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li:nth-child(2) {
          transition-delay: 0.15s;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li:nth-child(3) {
          transition-delay: 0.2s;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li:nth-child(4) {
          transition-delay: 0.25s;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li:nth-child(5) {
          transition-delay: 0.3s;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li:nth-child(6) {
          transition-delay: 0.35s;
        }

        .mobile-header-logo {
          transform: translateY(-10px);
          opacity: 0;
          transition: all 0.3s ease 0.2s;
          padding: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .mobile-header-active.sidebar-visible .mobile-header-logo {
          transform: translateY(0);
          opacity: 1;
        }

        /* Transparent clickable wrapper for menu items */
        .mobile-menu-item-wrapper {
          position: relative;
          display: block;
          width: 100%;
          min-height: 36px;
          padding: 1px 0;
          background: transparent;
          cursor: pointer;
          pointer-events: auto;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 0.2s ease;
        }

        .mobile-menu-item-wrapper:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .mobile-menu-item-wrapper:active {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .mobile-menu-item-wrapper a {
          display: block;
          width: 100%;
          height: 100%;
          padding: 2px 20px;
          text-decoration: none;
          color: inherit;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          text-align: left;
          cursor: pointer;
          pointer-events: auto;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-menu-item-wrapper a:hover {
          background: transparent;
          text-decoration: none;
        }

        .mobile-menu-item-wrapper a:focus {
          outline: none;
          background: transparent;
        }

        .mobile-menu-item-wrapper a:active {
          background: transparent;
        }

        /* Hide main header logo on mobile when navigation is open */
        @media (max-width: 991px) {
          .mobile-header-active.sidebar-visible ~ * .header-logo,
          body.mobile-menu-open .header-logo {
            opacity: 0 !important;
            visibility: hidden !important;
            transform: translateX(-20px) !important;
            transition: all 0.3s ease !important;
          }
        }

        /* Prevent header/loading overlap during page load */
        .loading-overlay {
          z-index: 10001 !important;
        }

        .main-header {
          z-index: 1000;
        }

        /* Hide header content during loading to prevent overlap */
        body:has(.loading-overlay) .main-header {
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        /* Show header after loading completes */
        body:not(:has(.loading-overlay)) .main-header {
          opacity: 1;
          transition: opacity 0.3s ease 0.5s;
        }

        /* Mobile-specific loading/header overlap fixes */
        @media (max-width: 768px) {
          /* Ensure loading screen covers entire mobile viewport */
          .loading-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 10001 !important;
          }

          /* Force hide all header elements during loading on mobile */
          body:has(.loading-overlay) .main-header,
          body:has(.loading-overlay) .header-left,
          body:has(.loading-overlay) .header-logo,
          body:has(.loading-overlay) .header-right {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transform: translateY(-20px) !important;
          }

          /* Ensure smooth header appearance after loading on mobile */
          body:not(:has(.loading-overlay)) .main-header {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            transform: translateY(0) !important;
            transition: all 0.4s ease 0.6s !important;
          }

          /* Mobile menu should always be above everything except loading */
          .mobile-header-active {
            z-index: 10000 !important;
          }

          .mobile-header-active.sidebar-visible {
            z-index: 10000 !important;
          }

          /* Ensure body overlay doesn't interfere with mobile menu */
          .mobile-menu-active .body-overlay-1 {
            pointer-events: none !important;
          }
        }

        /* Extra small mobile devices */
        @media (max-width: 480px) {
          .loading-overlay {
            z-index: 10002 !important;
          }

          /* Ensure no header visibility during loading on small screens */
          body:has(.loading-overlay) .container-fluid,
          body:has(.loading-overlay) .main-header * {
            opacity: 0 !important;
            visibility: hidden !important;
          }
        }

        /* Fallback for browsers that don't support :has() */
        @supports not (selector(:has(*))) {
          @media (max-width: 768px) {
            .main-header {
              animation: mobileHeaderFadeIn 0.6s ease 1.8s both;
            }

            @keyframes mobileHeaderFadeIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          }
        }

        /* Fallback for browsers that don't support :has() */
        @supports not (selector(:has(*))) {
          .main-header {
            animation: headerFadeIn 0.5s ease 1.5s both;
          }

          @keyframes headerFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        }

        @media (max-width: 768px) {
          .mobile-header-active {
            max-width: 280px;
          }
        }

        /* Ensure mobile menu links are immediately clickable */
        .mobile-menu li a {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          touch-action: manipulation;
        }

        .mobile-menu li a:hover {
          pointer-events: auto !important;
        }

        .mobile-menu li a:active {
          pointer-events: auto !important;
        }

        .mobile-menu li a:focus {
          pointer-events: auto !important;
        }

        /* Ensure the mobile menu container is immediately interactive */
        .mobile-header-active {
          pointer-events: auto !important;
        }

        .mobile-header-active * {
          pointer-events: auto !important;
        }

        .mobile-menu-wrap {
          pointer-events: auto !important;
        }

        .mobile-menu-wrap * {
          pointer-events: auto !important;
        }

        /* Force immediate interactivity when mobile menu is visible */
        .mobile-header-active.sidebar-visible {
          pointer-events: auto !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        .mobile-header-active.sidebar-visible * {
          pointer-events: auto !important;
        }

        /* Ensure links are immediately clickable on mobile */
        .mobile-header-active.sidebar-visible .mobile-menu li a {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        /* Add focus styles to ensure links are interactive */
        .mobile-header-active.sidebar-visible .mobile-menu li a:focus {
          outline: none !important;
          pointer-events: auto !important;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li a:active {
          pointer-events: auto !important;
        }

        .mobile-header-active.sidebar-visible .mobile-menu li a:hover {
          pointer-events: auto !important;
        }

        /* Ensure the mobile menu wrapper is immediately interactive */
        .mobile-header-wrapper-inner {
          pointer-events: auto !important;
        }

        .mobile-header-content-area {
          pointer-events: auto !important;
        }

        .perfect-scroll {
          pointer-events: auto !important;
        }

        /* Additional mobile header positioning for better alignment */
        @media (max-width: 767px) {
          .mobile-header-active {
            max-width: 280px;
          }

          .mobile-header-logo {
            padding: 15px 20px;
          }
        }

        @media (max-width: 575px) {
          .mobile-header-active {
            max-width: 260px;
          }

          .mobile-header-logo {
            padding: 12px 15px;
          }
        }
      `}</style>
    </>
  );
}

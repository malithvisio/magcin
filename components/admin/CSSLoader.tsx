'use client';
import { useEffect, useState } from 'react';

interface CSSLoaderProps {
  children: React.ReactNode;
}

export default function CSSLoader({ children }: CSSLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);

    // Ensure CSS is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Handle route changes
    const handleRouteChange = () => {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 50);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [mounted]);

  // Prevent hydration mismatch by not rendering loading state on server
  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`css-loader-container ${isVisible ? 'visible' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isLoading && (
        <div className='loading-overlay'>
          <div className='loading-spinner'>
            <div className='spinner'></div>
            <p>Loading...</p>
          </div>
        </div>
      )}
      {children}

      <style jsx global>{`
        .css-loader-container {
          position: relative;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-spinner p {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

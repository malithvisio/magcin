import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { getCurrentRootUserId } from '@/util/root-user-config';

interface Activity {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  altText?: string;
  reviewStars?: number;
  highlight?: boolean;
  insideTitle?: string;
  insideDescription?: string;
  insideImageUrl?: string;
  insideImageAlt?: string;
  insideShortDescription?: string;
  insideTabTitle?: string;
  published: boolean;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface TourCard3Props {
  tour?: any; // Optional tour prop for backward compatibility
  useDatabase?: boolean; // Flag to determine if we should fetch from database
}

export default function TourCard3({
  tour,
  useDatabase = true,
}: TourCard3Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If useDatabase is false or tour is provided, don't fetch from database
    if (!useDatabase || tour) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const rootUserId = getCurrentRootUserId();
        const response = await fetch(
          `/api/activities/public?rootUserId=${rootUserId}&limit=50`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err: any) {
        console.error('Error fetching activities:', err);
        setError(err.message || 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [useDatabase, tour]);

  // If tour prop is provided, render single tour card (backward compatibility)
  if (tour && !useDatabase) {
    return (
      <div className='card-journey-small background-card'>
        <div className='card-image'>
          {' '}
          <Link className='wish' href='#'>
            <svg
              width={20}
              height={18}
              viewBox='0 0 20 18'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M17.071 10.1422L11.4141 15.7991C10.6331 16.5801 9.36672 16.5801 8.58568 15.7991L2.92882 10.1422C0.9762 8.1896 0.9762 5.02378 2.92882 3.07116C4.88144 1.11853 8.04727 1.11853 9.99989 3.07116C11.9525 1.11853 15.1183 1.11853 17.071 3.07116C19.0236 5.02378 19.0236 8.1896 17.071 10.1422Z'
                stroke=''
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
            </svg>
          </Link>
          <img src={`/assets/imgs/page/tour/${tour?.image}`} alt='Travila' />
        </div>
        <div className='card-info background-card'>
          <div className='card-rating'>
            <div className='card-left'> </div>
            <div className='card-right'>
              {' '}
              <span className='rating'>
                {tour.rating}{' '}
                {/* <span className='text-sm-medium neutral-500'>
                  (672 reviews)
                </span> */}
              </span>
            </div>
          </div>
          <div className='card-title'>
            {' '}
            <Link className='text-lg-bold neutral-1000' href='/tour-detail'>
              {tour.name}{' '}
            </Link>
          </div>
          <div className='card-program'>
            <div className='card-duration-tour'>
              <p className='icon-duration text-sm-medium neutral-500'>
                2 days, 3 nights
              </p>
              {/* <p className='icon-guest text-sm-medium neutral-500'>6-8 guest</p> */}
            </div>
            <div className='endtime'>
              <div className='card-price'>
                <h6 className='heading-6 neutral-1000'>${tour.price}</h6>
              </div>
              <div className='card-button'>
                {' '}
                <Link className='btn btn-gray' href='/tour-detail'>
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If loading, show a loading state
  if (loading) {
    return (
      <div className='card-journey-small background-card'>
        <div className='card-image'>
          <div className='animate-pulse bg-gray-300 h-48 w-full'></div>
        </div>
        <div className='card-info background-card p-4'>
          <div className='animate-pulse bg-gray-300 h-4 w-3/4 mb-2'></div>
          <div className='animate-pulse bg-gray-300 h-6 w-full mb-2'></div>
          <div className='animate-pulse bg-gray-300 h-4 w-1/2'></div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className='card-journey-small background-card'>
        <div className='card-info background-card p-4'>
          <p className='text-red-500 text-sm'>
            Error loading activities: {error}
          </p>
        </div>
      </div>
    );
  }

  // If no activities, show empty state
  if (activities.length === 0) {
    return (
      <div className='card-journey-small background-card'>
        <div className='card-info background-card p-4'>
          <p className='text-gray-500 text-sm'>No activities available</p>
        </div>
      </div>
    );
  }

  // Display activities
  return (
    <>
      {activities.map(activity => (
        <div key={activity._id} className='card-journey-small background-card'>
          <div className='card-image'>
            {' '}
            <Link className='wish' href='#'>
              <svg
                width={20}
                height={18}
                viewBox='0 0 20 18'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M17.071 10.1422L11.4141 15.7991C10.6331 16.5801 9.36672 16.5801 8.58568 15.7991L2.92882 10.1422C0.9762 8.1896 0.9762 5.02378 2.92882 3.07116C4.88144 1.11853 8.04727 1.11853 9.99989 3.07116C11.9525 1.11853 15.1183 1.11853 17.071 3.07116C19.0236 5.02378 19.0236 8.1896 17.071 10.1422Z'
                  stroke=''
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                />
              </svg>
            </Link>
            <img
              src={
                activity.imageUrl ||
                `/assets/imgs/page/tour/default-activity.jpg`
              }
              alt={activity.altText || activity.name || 'Activity'}
            />
          </div>
          <div className='card-info background-card'>
            <div className='card-rating'>
              <div className='card-left'> </div>
              <div className='card-right'>
                {' '}
                <span className='rating'>
                  {activity.reviewStars || 4.5}{' '}
                  <span className='text-sm-medium neutral-500'>(Ratings)</span>
                </span>
              </div>
            </div>
            <div className='card-title'>
              {' '}
              <Link
                className='text-lg-bold neutral-1000'
                href={`/activities/${activity._id}`}
              >
                {activity.title || activity.name}{' '}
              </Link>
            </div>
            <div className='card-program'>
              <div className='card-duration-tour'>
                <p className='icon-duration text-sm-medium neutral-500'>
                  {activity.description || '2 days, 3 nights'}
                </p>
                {/* <p className='icon-guest text-sm-medium neutral-500'>
                  6-8 guest
                </p> */}
              </div>
              <div className='endtime'>
                <div className='card-price'>
                  {/* <h6 className='heading-6 neutral-1000'>
                    ${activity.highlight ? '299' : '199'}
                  </h6> */}
                </div>
                <div className='card-button'>
                  {' '}
                  <Link
                    className='btn btn-gray'
                    href={`/activities/${activity._id}`}
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

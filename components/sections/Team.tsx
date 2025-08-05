'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentRootUserId } from '@/util/root-user-config';

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  image?: string;
  bio?: string;
  published: boolean;
  sortOrder?: number;
}

interface TeamResponse {
  teamMembers: TeamMember[];
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the current root user ID from the config
        const rootUserId = getCurrentRootUserId();

        console.log('Fetching team members for root user:', rootUserId);

        const response = await fetch(
          `/api/team/public?rootUserId=${rootUserId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TeamResponse = await response.json();

        if (data.teamMembers) {
          // Filter for only published team members and sort by sortOrder
          const publishedTeamMembers = data.teamMembers
            .filter(member => member.published)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

          setTeamMembers(publishedTeamMembers);
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load team members'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <section className='section-box block-meet background-body'>
        <div className='container'>
          <div className='row align-items-end'>
            <div className='col-lg-6 mb-30 wow fadeInUp'>
              <div className='box-author-testimonials button-brand-2 wow fadeInUp'>
                Team Members
              </div>
              <h2 className='mt-8 mb-10 neutral-1000'>Meet our Team</h2>
              <p className='text-xl-medium neutral-500'>
                Loading our exceptional team...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className='section-box block-meet background-body'>
        <div className='container'>
          <div className='row align-items-end'>
            <div className='col-lg-6 mb-30 wow fadeInUp'>
              <div className='box-author-testimonials button-brand-2 wow fadeInUp'>
                Team Members
              </div>
              <h2 className='mt-8 mb-10 neutral-1000'>Meet our Team</h2>
              <p className='text-xl-medium neutral-500'>
                Unable to load team members at this time.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style jsx>{`
        .team-member-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          object-position: center;
          border-radius: 8px;
        }

        .card-image {
          height: 300px;
          overflow: hidden;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .team-member-image {
            height: 250px;
          }
          .card-image {
            height: 250px;
          }
        }

        @media (max-width: 576px) {
          .team-member-image {
            height: 200px;
          }
          .card-image {
            height: 200px;
          }
        }
      `}</style>

      <section className='section-box block-meet background-body'>
        <div className='container'>
          <div className='row align-items-end'>
            <div className='col-lg-6 mb-30 wow fadeInUp'>
              <div className='box-author-testimonials button-brand-2 wow fadeInUp'>
                Team Members
              </div>
              <h2 className='mt-8 mb-10 neutral-1000'>Meet our Team</h2>
              <p className='text-xl-medium neutral-500'>
                Meet our exceptional team of Guides.
              </p>
            </div>
            <div className='col-md-6 position-relative text-start text-lg-end mb-30 wow fadeInUp'>
              <div className='box-need-help text-start d-inline-block'>
                <p className='need-help neutral-1000 text-lg-bold mb-5'>
                  Need help? Call us
                </p>
                <br />
                <Link
                  className='heading-6 neutral-1000 phone-support'
                  href='/tel:+94750797075'
                >
                  +94 750 79 70 75
                </Link>
              </div>
            </div>
          </div>
          <div className='row mt-50'>
            {teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <div
                  key={member._id}
                  className='col-lg-4 col-md-6 mb-30 wow fadeInUp'
                >
                  <div className='card-team card-team-2'>
                    <div className='card-image'>
                      <img
                        className='team-member-image'
                        src={member.image || '/assets/imgs/page/pages/team.png'}
                        alt={member.name}
                        onError={e => {
                          // Only set fallback once to prevent infinite loops
                          const target = e.target as HTMLImageElement;
                          if (
                            target.src !== '/assets/imgs/page/pages/team.png'
                          ) {
                            target.src = '/assets/imgs/page/pages/team.png';
                          }
                        }}
                      />
                    </div>
                    <div className='card-info'>
                      <h6 className='neutral-1000'>{member.name}</h6>
                      <p className='text-sm-medium neutral-500'>
                        {member.position}
                      </p>
                      {member.bio && (
                        <p className='text-xs-medium neutral-1000'>
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-12 text-center'>
                <p className='text-xl-medium neutral-500'>
                  No team members available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

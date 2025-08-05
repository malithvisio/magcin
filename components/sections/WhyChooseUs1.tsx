import Link from 'next/link';
import styles from './WhyChooseUs1.module.css';
import Image from 'next/image';

export default function WhyChooseUs1() {
  return (
    <>
      <section className='section-box box-why-choose-us background-body'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-6 mb-40'>
              <span className='btn btn-tag'>Why Choose Us</span>
              <h2 className='title-why neutral-1000 '>
                Tour Your Way, Not the Usual
              </h2>

              <p className='text-xl-medium neutral-500'>
                From serene beaches to misty mountains, Adventure LK customizes
                every step of your trip to match your pace and preferences.
              </p>
              <div
                className='download-apps'
                style={{ display: 'flex', gap: '20px', alignItems: 'center' }}
              >
                <Link
                  href='#'
                  className={`${styles.review_btn} ${styles.tripadvisor_btn}`}
                  style={{
                    background: '#34E0A1',
                    color: '#000000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily:
                      '"Trip Sans VF", "Trip Sans", Arial, sans-serif',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Image
                    src='/assets/imgs/template/icons/tripadvisor-icon.svg'
                    alt='TripAdvisor'
                    width={24}
                    height={24}
                  />
                  <span>TripAdvisor</span>
                </Link>
                <Link
                  href='https://www.trustpilot.com/review/tourstrails.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`${styles.review_btn} ${styles.trustpilot_btn}`}
                  style={{
                    background: '#F5F5F5',
                    color: '#000000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Image
                    src='/assets/imgs/template/icons/icons8-trustpilot.svg'
                    alt='Trustpilot'
                    width={24}
                    height={24}
                  />
                  <span>Trustpilot</span>
                </Link>
              </div>
            </div>
            <div className='col-lg-6 mb-40'>
              <div className='row'>
                <div className='col-sm-6 mt-35'>
                  <div className='card-why-choose-us'>
                    <div className='card-image'>
                      {' '}
                      <img
                        src='/assets/imgs/page/homepage1/destination.png'
                        alt='Travila'
                      />
                    </div>
                    <div className='card-info'>
                      <h6 className='text-xl-bold'>1000+ Destination</h6>
                      <p className='text-sm-medium neutral-400'>
                        Our expert team handpicked all destinations in this
                        site.
                      </p>
                    </div>
                  </div>
                  <div className='card-why-choose-us card-why-choose-us-type-2'>
                    <div className='card-info'>
                      <h6 className='text-xl-bold'>Simple Booking</h6>
                      <p className='text-sm-medium neutral-400'>
                        Secure payment
                      </p>
                    </div>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='card-why-choose-us background-body'>
                    <div className='card-image'>
                      {' '}
                      <img
                        src='/assets/imgs/page/homepage1/support.png'
                        alt='Travila'
                      />
                    </div>
                    <div className='card-info'>
                      <h6 className='text-xl-bold neutral-1000'>
                        Great 24/7 Support
                      </h6>
                      <p className='text-sm-medium neutral-400'>
                        We are here to help, before, during, and even after your
                        trip.
                      </p>
                    </div>
                  </div>
                  <div className='card-why-choose-us card-why-choose-us-type-3'>
                    <div className='card-info'>
                      <h6 className='text-xl-bold text-white'>Best Price</h6>
                      <p className='text-sm-medium neutral-400'>
                        Price match within 48 hours of order confirmation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

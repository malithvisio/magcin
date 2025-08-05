'use client';
import SwiperGroupPaymentSlider from '@/components/slider/SwiperGroupPaymentSlider';
import Link from 'next/link';
import { useState, useEffect, CSSProperties, FormEvent } from 'react';

export default function Footer2() {
  const [isMobile, setIsMobile] = useState(false);
  const [whatsappEmail, setWhatsappEmail] = useState('');
  const [askEmail, setAskEmail] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    // Set initial size
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileStyles: { [key: string]: CSSProperties } = {
    textCenter: isMobile
      ? {
          textAlign: 'center' as const,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }
      : {},
    imageCenter: isMobile
      ? {
          margin: '0 auto',
          display: 'block',
        }
      : {},
    input: isMobile
      ? {
          textAlign: 'left' as const,
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          position: 'relative' as const,
          overflow: 'hidden' as const,
        }
      : {},
  };

  return (
    <>
      <footer
        className='footer footer-type-3 background-body'
        style={isMobile ? { textAlign: 'center' as const } : {}}
      >
        <div className='container'>
          {/* Mobile-First Hero Section */}
          {/* <div className={`row ${isMobile ? "mb-40" : "mb-20"}`}>
            <div className="col-12">
              <div
                className={`hero-footer-section ${
                  isMobile ? "mobile-hero" : "desktop-hero"
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                  borderRadius: "16px",
                  padding: isMobile ? "30px 20px" : "25px 30px",
                  textAlign: "center",
                  color: "white",
                  marginBottom: isMobile ? "30px" : "20px",
                }}
              >
                <h3
                  className="hero-title"
                  style={{
                    fontSize: isMobile ? "1.5rem" : "1.8rem",
                    fontWeight: "700",
                    lineHeight: "1.3",
                    marginBottom: isMobile ? "15px" : "12px",
                    color: "white",
                  }}
                >
                  Unlock the Magic of Travel with Go Dare Travels
                </h3>
                <p
                  className="hero-subtitle"
                  style={{
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    fontWeight: "500",
                    marginBottom: isMobile ? "20px" : "15px",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  Your Gateway to Extraordinary Experiences
                </p>
                <Link
                  href="/contact"
                  className="btn-contact-hero"
                  style={{
                    display: "inline-block",
                    background: "white",
                    color: "#007bff",
                    padding: isMobile ? "12px 25px" : "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: isMobile ? "1rem" : "0.9rem",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.15)";
                  }}
                >
                  Contact Now !
                </Link>
              </div>
            </div>
          </div> */}

          <div className='row'>
            <div
              className={`col-md-4 mb-30 ${isMobile ? 'text-center' : ''}`}
              style={mobileStyles.textCenter}
            >
              <Link
                className={`d-inline-block mb-20 ${isMobile ? 'mx-auto' : ''}`}
                href='/'
                style={mobileStyles.imageCenter}
              >
                <img
                  className='light-mode'
                  alt='Travila'
                  src='/assets/imgs/logo/magcin Srilanka.png'
                  style={{ width: 'auto', height: '65px' }}
                />
              </Link>
              <div
                className={`box-info-contact mt-0 ${
                  isMobile ? 'text-center' : ''
                }`}
              >
                <p className='text-md neutral-400 icon-address'>
                  No 26, The harvest ,<br />
                  vihena ,Maspotha,
                  <br />
                  kurunagala,
                  <br />
                  Sri Lanka
                </p>
                <p className='text-md neutral-400 icon-worktime'>
                  Hours: 8:00 - 17:00, Mon - Sat
                </p>
                <p className='text-md neutral-400 icon-email'>
                  <a
                    href='mailto:connect@godare.net'
                    className='neutral-400'
                    style={{
                      display: 'inline-block',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    Pererasura49gmail.com
                  </a>
                </p>
              </div>
            </div>
            <div
              className='col-md-4 mb-30'
              style={{ display: isMobile ? 'none' : 'block' }}
            >
              <h6 className='text-linear-3'>Services</h6>
              <div className='row'>
                <div className='col-sm-6'>
                  <ul className='menu-footer'>
                    <li>
                      <Link href='/tours'>Tour Packages</Link>
                    </li>
                    <li>
                      <Link href='/destination'>Destinations</Link>
                    </li>
                    <li>
                      <Link href='/contact'>Contact Us</Link>
                    </li>
                  </ul>
                </div>
                <div className='col-sm-6'>
                  <ul className='menu-footer'>
                    <li>
                      <Link href='/gallery'>Gallery</Link>
                    </li>
                    <li>
                      <Link href='/about'>About Us</Link>
                    </li>
                    {/* <li>
                      <Link href="#">Travel plane</Link>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
            <div
              className={`col-md-4 mb-30 ${isMobile ? 'text-center' : ''}`}
              style={mobileStyles.textCenter}
            >
              <h6 className={isMobile ? 'text-center mb-4' : ''}>
                Ask in Whatsapp
              </h6>
              <div
                className={`d-flex align-items-center ${
                  isMobile
                    ? 'justify-content-center flex-column'
                    : 'justify-content-md-end'
                }`}
              >
                <form
                  className='form-newsletter'
                  action='#'
                  style={
                    isMobile
                      ? {
                          width: '100%',
                          maxWidth: '300px',
                          margin: '0 auto',
                          display: 'flex',
                          gap: '8px',
                        }
                      : {
                          display: 'flex',
                          gap: '10px',
                        }
                  }
                  onSubmit={e => {
                    e.preventDefault();
                    if (askEmail.trim()) {
                      const waUrl = `https://wa.me/94761578032?text=${encodeURIComponent(
                        `Hi, my email is: ${askEmail}`
                      )}`;
                      window.open(waUrl, '_blank');
                    }
                  }}
                >
                  <input
                    className={`form-control ${
                      isMobile ? 'mobile-email-input' : ''
                    }`}
                    type='text'
                    placeholder='Message here'
                    style={{
                      ...mobileStyles.input,
                      flex: '1',
                      margin: 0,
                    }}
                    value={askEmail}
                    onChange={e => setAskEmail(e.target.value)}
                  />
                  <input
                    className='btn btn-brand-secondary'
                    type='submit'
                    value='Ask Now'
                    style={
                      isMobile
                        ? {
                            padding: '8px 12px',
                            margin: 0,
                            fontSize: '14px',
                            flexShrink: 0,
                          }
                        : {
                            flexShrink: 0,
                          }
                    }
                  />
                </form>
              </div>
              <p
                className={`neutral-500 text-xs-medium ${
                  isMobile ? 'text-center mt-3' : ''
                }`}
              >
                Feel Free to ask anything without hesitation
              </p>
            </div>
          </div>
          <div className='row mt-5'>
            <div className='col-md-4 mb-30'>
              <div className='block-socials-footer'>
                <p className='text-lg-bold neutral-1000'>Follow us</p>
                <div className='box-socials-footer'>
                  <Link
                    className='icon-socials icon-instagram'
                    target='_blank'
                    href='#'
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M13.4915 1.6665H6.50817C3.47484 1.6665 1.6665 3.47484 1.6665 6.50817V13.4832C1.6665 16.5248 3.47484 18.3332 6.50817 18.3332H13.4832C16.5165 18.3332 18.3248 16.5248 18.3248 13.4915V6.50817C18.3332 3.47484 16.5248 1.6665 13.4915 1.6665ZM9.99984 13.2332C8.2165 13.2332 6.7665 11.7832 6.7665 9.99984C6.7665 8.2165 8.2165 6.7665 9.99984 6.7665C11.7832 6.7665 13.2332 8.2165 13.2332 9.99984C13.2332 11.7832 11.7832 13.2332 9.99984 13.2332ZM14.9332 5.73317C14.8915 5.83317 14.8332 5.92484 14.7582 6.00817C14.6748 6.08317 14.5832 6.1415 14.4832 6.18317C14.3832 6.22484 14.2748 6.24984 14.1665 6.24984C13.9415 6.24984 13.7332 6.1665 13.5748 6.00817C13.4998 5.92484 13.4415 5.83317 13.3998 5.73317C13.3582 5.63317 13.3332 5.52484 13.3332 5.4165C13.3332 5.30817 13.3582 5.19984 13.3998 5.09984C13.4415 4.9915 13.4998 4.90817 13.5748 4.82484C13.7665 4.63317 14.0582 4.5415 14.3248 4.59984C14.3832 4.60817 14.4332 4.62484 14.4832 4.64984C14.5332 4.6665 14.5832 4.6915 14.6332 4.72484C14.6748 4.74984 14.7165 4.7915 14.7582 4.82484C14.8332 4.90817 14.8915 4.9915 14.9332 5.09984C14.9748 5.19984 14.9998 5.30817 14.9998 5.4165C14.9998 5.52484 14.9748 5.63317 14.9332 5.73317Z' />
                    </svg>
                  </Link>
                  <Link
                    className='icon-socials icon-facebook'
                    href='https://www.facebook.com/profile.php?id=61564287218720&mibextid=ZbWKwL'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M18.3334 13.4915C18.3334 16.5248 16.5251 18.3332 13.4917 18.3332H12.5001C12.0417 18.3332 11.6667 17.9582 11.6667 17.4998V12.6915C11.6667 12.4665 11.8501 12.2748 12.0751 12.2748L13.5417 12.2498C13.6584 12.2415 13.7584 12.1582 13.7834 12.0415L14.0751 10.4498C14.1001 10.2998 13.9834 10.1582 13.8251 10.1582L12.0501 10.1832C11.8167 10.1832 11.6334 9.99985 11.6251 9.77485L11.5918 7.73317C11.5918 7.59984 11.7001 7.48318 11.8417 7.48318L13.8417 7.44984C13.9834 7.44984 14.0918 7.34152 14.0918 7.19985L14.0584 5.19983C14.0584 5.05816 13.9501 4.94984 13.8084 4.94984L11.5584 4.98318C10.1751 5.00818 9.07509 6.1415 9.10009 7.52484L9.14175 9.8165C9.15008 10.0498 8.96676 10.2332 8.73342 10.2415L7.73341 10.2582C7.59175 10.2582 7.48342 10.3665 7.48342 10.5082L7.50842 12.0915C7.50842 12.2332 7.61675 12.3415 7.75841 12.3415L8.75842 12.3248C8.99176 12.3248 9.17507 12.5082 9.18341 12.7332L9.2584 17.4832C9.26674 17.9498 8.89174 18.3332 8.42507 18.3332H6.50841C3.47508 18.3332 1.66675 16.5248 1.66675 13.4832V6.50817C1.66675 3.47484 3.47508 1.6665 6.50841 1.6665H13.4917C16.5251 1.6665 18.3334 3.47484 18.3334 6.50817V13.4915V13.4915Z' />
                    </svg>
                  </Link>
                  <Link
                    className='icon-socials icon-twitter'
                    href='#'
                    onClick={e => e.preventDefault()}
                  >
                    <svg
                      width={18}
                      height={16}
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M17.1789 4.24023H19.9504L14.3084 10.5794L21.0004 19.2602H15.8934L11.8344 13.9602L7.15291 19.2602H4.37891L10.3734 12.5202L3.93091 4.24023H9.16091L12.8109 9.08023L17.1789 4.24023ZM16.6089 17.6002H17.9109L8.39091 5.82023H7.00091L16.6089 17.6002Z' />
                    </svg>
                  </Link>
                  <Link
                    className='icon-socials icon-be'
                    href='#'
                    onClick={e => e.preventDefault()}
                  >
                    <svg
                      width={21}
                      height={15}
                      viewBox='0 0 21 15'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M8.82393 10.736L13.9225 7.78881L8.82393 4.84165V10.736ZM20.1803 3.04389C20.308 3.50561 20.3964 4.12451 20.4554 4.91042C20.5242 5.69633 20.5536 6.37418 20.5536 6.96361L20.6126 7.78881C20.6126 9.94024 20.4554 11.5219 20.1803 12.5337C19.9347 13.4179 19.3649 13.9877 18.4808 14.2333C18.0191 14.361 17.1742 14.4494 15.8775 14.5083C14.6004 14.5771 13.4313 14.6066 12.3507 14.6066L10.7887 14.6655C6.67251 14.6655 4.10848 14.5083 3.09662 14.2333C2.21247 13.9877 1.64269 13.4179 1.39709 12.5337C1.26938 12.072 1.18097 11.4531 1.12203 10.6672C1.05326 9.8813 1.02379 9.20345 1.02379 8.61402L0.964844 7.78881C0.964844 5.63739 1.12203 4.05575 1.39709 3.04389C1.64269 2.15974 2.21247 1.58996 3.09662 1.34436C3.55834 1.21665 4.4032 1.12823 5.69995 1.06929C6.97705 1.00052 8.14609 0.971052 9.22671 0.971052L10.7887 0.912109C14.9049 0.912109 17.4689 1.06929 18.4808 1.34436C19.3649 1.58996 19.9347 2.15974 20.1803 3.04389Z' />
                    </svg>
                  </Link>
                  <Link
                    className='icon-socials icon-tiktok'
                    href='#'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M14.2 2.5C14.2 2.5 14.5 4.5 16 5.5C17.5 6.5 19.5 6.5 19.5 6.5V10C19.5 10 17.5 10 16 9C14.5 8 14.2 6 14.2 6V13.5C14.2 18.5 8 21.5 4 17.5C0 13.5 3 7.5 8 7.5V11C8 11 6.5 10.8 5.5 12C4.5 13.2 4.5 15 6 16C7.5 17 9.5 16.5 10 14.5V2.5H14.2Z' />
                    </svg>
                  </Link>
                  {/* <Link
                    className="icon-socials icon-tripadvisor"
                    href="https://www.tripadvisor.com/Profile/god613"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="/assets/imgs/template/icons/tripadvisor-logo-svgrepo-com.svg"
                      alt="TripAdvisor"
                      width={20}
                      height={20}
                    />
                  </Link> */}
                </div>
              </div>
            </div>
            <div className='col-md-4 mb-30'>
              <div className='box-need-help'>
                <p className='need-help neutral-1000 text-lg-bold mb-5'>
                  Need help? Call us
                </p>
                <br />
                <a className='heading-6 phone-support' href='/tel:+94750797075'>
                  +94 750 79 70 75
                </a>
              </div>
            </div>
            {/* <div className="col-md-4 mb-30">
              <h6>Payments</h6>
              <div className="payment-method">
                <div className="box-swiper mt-10">
                  <div className="swiper-container swiper-group-payment">
                    <SwiperGroupPaymentSlider />
                  </div>
                </div>
              </div>
            </div> */}
          </div>
          <div className='footer-bottom'>
            <div className='row align-items-center'>
              <div className='col-md-6 text-md-start text-center mb-20'>
                <p className='text-sm neutral-500'>
                  Copyright © {new Date().getFullYear()} by Visio Innovations
                  (Pvt) Ltd.
                  <br /> All Rights Reserved.
                </p>
              </div>
              {/* <div className="col-md-6 text-md-end text-center mb-20">
                <ul className="menu-bottom-footer">
                  <li>
                    <Link href="#">Terms</Link>
                  </li>
                  <li>
                    <Link href="#">Privacy policy</Link>
                  </li>
                  <li>
                    <Link href="#">Legal notice</Link>
                  </li>
                  <li>
                    {" "}
                    <Link href="#">Accessibility</Link>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        .menu-footer a[href='/tours']:hover,
        .menu-footer a[href='/destination']:hover,
        .menu-footer a[href='/gallery']:hover,
        .menu-footer a[href='/about']:hover,
        .menu-footer a[href='/contact']:hover {
          color: #007bff !important;
        }
      `}</style>
    </>
  );
}

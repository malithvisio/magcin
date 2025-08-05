'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import BookingForm from '@/components/elements/BookingForm';
// import Gallery from "@/components/Gallery-mini/page";

const SlickArrowLeft = ({ currentSlide, slideCount, ...props }: any) => (
  <button
    {...props}
    className={
      'slick-prev slick-arrow' + (currentSlide === 0 ? ' slick-disabled' : '')
    }
    type='button'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M7.99992 3.33325L3.33325 7.99992M3.33325 7.99992L7.99992 12.6666M3.33325 7.99992H12.6666'
        stroke=''
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  </button>
);

const SlickArrowRight = ({ currentSlide, slideCount, ...props }: any) => (
  <button
    {...props}
    className={
      'slick-next slick-arrow' +
      (currentSlide === slideCount - 1 ? ' slick-disabled' : '')
    }
    type='button'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M7.99992 12.6666L12.6666 7.99992L7.99992 3.33325M12.6666 7.99992L3.33325 7.99992'
        stroke=''
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  </button>
);

interface DestinationContentProps {
  tourPackage: any;
}

export default function DestinationContent({
  tourPackage,
}: DestinationContentProps) {
  const slider1 = useRef<Slider | null>(null);
  const slider2 = useRef<Slider | null>(null);
  const [nav1, setNav1] = useState<Slider | undefined>(undefined);
  const [nav2, setNav2] = useState<Slider | undefined>(undefined);
  const [isAccordion, setIsAccordion] = useState(null);

  useEffect(() => {
    setNav1(slider1.current ?? undefined);
    setNav2(slider2.current ?? undefined);
  }, []);

  const settingsMain = {
    asNavFor: nav2,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: false,
    prevArrow: <SlickArrowLeft />,
    nextArrow: <SlickArrowRight />,
  };

  const handleAccordion = (key: any) => {
    setIsAccordion(prevState => (prevState === key ? null : key));
  };

  return (
    <main className='main'>
      <section className='box-section box-banner-home2 box-banner-tour-detail-2 background-body'>
        <div className='box-banner-tour-detail-2-inner'>
          <div className='container-banner'>
            {' '}
            <Slider {...settingsMain} ref={slider1} className='banner-main'>
              {tourPackage.images.map((image: string, index: number) => (
                <div className='banner-slide' key={index}>
                  <img
                    src={image}
                    alt={`${tourPackage.name} - Image ${index + 1}`}
                  />
                </div>
              ))}
            </Slider>
            <style jsx>{`
              .banner-slide {
                height: 600px;
              }
              .banner-slide img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              @media (max-width: 768px) {
                .banner-slide {
                  height: 300px;
                }
              }

              @media (max-width: 576px) {
                .banner-slide {
                  height: 220px;
                }
              }
            `}</style>
          </div>
        </div>
      </section>
      <section className='box-section box-content-tour-detail background-body'>
        <div className='container'>
          <div className='tour-header'>
            <div className='tour-rate'>
              <div className='rate-element'>
                <span className='rating'>4.96</span>
              </div>
            </div>
            <div className='row'>
              <div className='col-lg-8'>
                <div className='tour-title-main'>
                  <h4 className='neutral-1000'>{tourPackage.name}</h4>
                </div>
              </div>
            </div>
            <div className='tour-metas'>
              <div className='tour-meta-left'>
                <p className='text-md-medium neutral-500 mr-20 tour-location'>
                  <svg
                    width={12}
                    height={16}
                    viewBox='0 0 12 16'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M5.99967 0C2.80452 0 0.205078 2.59944 0.205078 5.79456C0.205078 9.75981 5.39067 15.581 5.61145 15.8269C5.81883 16.0579 6.18089 16.0575 6.38789 15.8269C6.60867 15.581 11.7943 9.75981 11.7943 5.79456C11.7942 2.59944 9.1948 0 5.99967 0ZM5.99967 8.70997C4.39211 8.70997 3.0843 7.40212 3.0843 5.79456C3.0843 4.187 4.39214 2.87919 5.99967 2.87919C7.6072 2.87919 8.91502 4.18703 8.91502 5.79459C8.91502 7.40216 7.6072 8.70997 5.99967 8.70997Z' />
                  </svg>
                  {tourPackage.location}
                </p>
              </div>
            </div>
          </div>
          <div className='row mt-30'>
            <div className='col-lg-8'>
              <div className='box-collapse-expand'>
                <div className='group-collapse-expand'>
                  <button
                    className={
                      isAccordion == 1
                        ? 'btn btn-collapse collapsed'
                        : 'btn btn-collapse'
                    }
                    onClick={() => handleAccordion(1)}
                  >
                    <h6>Overview</h6>
                    <svg
                      width={12}
                      height={7}
                      viewBox='0 0 12 7'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1 1L6 6L11 1'
                        stroke=''
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        fill='none'
                      />
                    </svg>
                  </button>
                  <div
                    className={isAccordion == 1 ? 'collapse' : 'collapse show'}
                  >
                    <div className='card card-body'>
                      <p>{tourPackage.description}</p>
                    </div>
                  </div>
                </div>
                <div className='group-collapse-expand'>
                  <button
                    className={
                      isAccordion == 2
                        ? 'btn btn-collapse collapsed'
                        : 'btn btn-collapse'
                    }
                    onClick={() => handleAccordion(2)}
                  >
                    <h6>Highlights</h6>
                    <svg
                      width={12}
                      height={7}
                      viewBox='0 0 12 7'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1 1L6 6L11 1'
                        stroke=''
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        fill='none'
                      />
                    </svg>
                  </button>
                  <div
                    className={isAccordion == 2 ? 'collapse' : 'collapse show'}
                  >
                    <div className='card card-body'>
                      <ul className='list-checked-green'>
                        {tourPackage.Highlight.map(
                          (highlight: string, index: number) => (
                            <li key={index}>{highlight}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className='group-collapse-expand'>
                  <button
                    className={
                      isAccordion == 3
                        ? 'btn btn-collapse collapsed'
                        : 'btn btn-collapse'
                    }
                    onClick={() => handleAccordion(3)}
                  >
                    <h6>Why Its Special</h6>
                    <svg
                      width={12}
                      height={7}
                      viewBox='0 0 12 7'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1 1L6 6L11 1'
                        stroke=''
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        fill='none'
                      />
                    </svg>
                  </button>
                  <div
                    className={isAccordion == 3 ? 'collapse' : 'collapse show'}
                  >
                    <div className='card card-body'>
                      <div className='list-questions'>
                        <div className='item-question'>
                          <div className='content-question'>
                            <p className='text-sm-medium neutral-800'>
                              {tourPackage.moredes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
      <section className='section-box box-media background-body desktop-only'>
        <div className='container-media wow fadeInUp'>{/* <Gallery /> */}</div>
        <style jsx>{`
          .desktop-only {
            display: block;
          }

          @media (max-width: 768px) {
            .desktop-only {
              display: none;
            }
          }
        `}</style>
      </section>
    </main>
  );
}

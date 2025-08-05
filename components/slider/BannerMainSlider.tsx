'use client';
import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';

export default function BannerMainSlider() {
  const slider1 = useRef<Slider | null>(null);
  const slider2 = useRef<Slider | null>(null);
  const [nav1, setNav1] = useState<Slider | undefined>(undefined);
  const [nav2, setNav2] = useState<Slider | undefined>(undefined);

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
    autoplay: true,
    autoplaySpeed: 3000, // 3 seconds per slide
    pauseOnHover: true,
    infinite: true,
    speed: 1000, // transition speed
    cssEase: 'ease-in-out',
    nextArrow: (
      <button className='slick-next'>
        <i className='fi fi-rr-angle-right'></i>
      </button>
    ),
    prevArrow: (
      <button className='slick-prev'>
        <i className='fi fi-rr-angle-left'></i>
      </button>
    ),
  };

  const settingsThumbs = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    focusOnSelect: true,
    vertical: true,
    asNavFor: nav1,
  };

  // Function to handle manual navigation
  const handleBeforeChange = () => {
    // Reset autoplay timer when manually navigated
    if (slider1.current) {
      slider1.current.slickPlay();
    }
  };

  return (
    <>
      <Slider
        {...settingsMain}
        ref={slider1}
        className='banner-main'
        beforeChange={handleBeforeChange}
      >
        <div className='banner-slide'>
          <div
            className='banner-image'
            style={{
              backgroundImage:
                'url("/assets/imgs/slider/pexels-inna-rabotyagina-51317378-7953000.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='container'>
              {/* <span className="btn btn-brand-secondary">
                Discovery the World
              </span> */}
              <h1
                className='mt-20 mb-20 text-white'
                style={{ textShadow: '2px 2px 8px #000' }}
              >
                Climb, slide, jump <br className='d-none d-lg-block ' />
                own the adventure thrill
              </h1>

              {/* <h6 className="heading-6-medium text-white">
                Crafting Exceptional Journeys: Your Global Escape Planner.
                Unleash Your Wanderlust: Seamless Travel, Extraordinary
                Adventures
              </h6> */}
            </div>
          </div>
        </div>
        <div className='banner-slide'>
          <div
            className='banner-image'
            style={{
              backgroundImage:
                'url("/assets/imgs/slider/pexels-michael-swigunski-3825040-6045035.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='container'>
              {/* <span className="btn btn-brand-secondary">
                Discovery the World
              </span> */}
              <h1
                className='mt-20 mb-20 text-white'
                style={{ textShadow: '2px 2px 8px #000' }}
              >
                Sri Lanka Awaits <br className='d-none d-lg-block ' />
                Start Your Dream Journey
              </h1>

              {/* <h6 className="heading-6-medium text-white">
                Crafting Exceptional Journeys: Your Global Escape Planner.
                Unleash Your Wanderlust: Seamless Travel, Extraordinary
                Adventures
              </h6> */}
            </div>
          </div>
        </div>

        <div className='banner-slide'>
          <div
            className='banner-image'
            style={{
              backgroundImage:
                'url("/assets/imgs/slider/pexels-tomas-malik-793526-1998434.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='container'>
              {/* <span className="btn btn-brand-secondary">
                Discovery the World
              </span> */}
              <h1
                className='mt-20 mb-20 text-white'
                style={{ textShadow: '2px 2px 8px #000' }}
              >
                Slide through waterfalls,
                <br className='d-none d-lg-block ' />
                splash into pure nature.
              </h1>

              {/* <h6 className="heading-6-medium text-white">
                Crafting Exceptional Journeys: Your Global Escape Planner.
                Unleash Your Wanderlust: Seamless Travel, Extraordinary
                Adventures
              </h6> */}
            </div>
          </div>
        </div>

        <div className='banner-slide'>
          <div
            className='banner-image'
            style={{
              backgroundImage: 'url("/assets/imgs/slider/Tourism.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='container'>
              <h1
                className='mt-20 mb-20 text-white'
                style={{ textShadow: '2px 2px 8px #000' }}
              >
                Leap beyond fear,
                <br className='d-none d-lg-block ' />
                fly across wild canopies
              </h1>

              {/* <h6 className="heading-6-medium text-white" >
                Crafting Exceptional Journeys: Your Global Escape Planner.
                Unleash Your Wanderlust: Seamless Travel, Extraordinary
                Adventures
              </h6> */}
            </div>
          </div>
        </div>
      </Slider>

      {/* <div className="slider-thumnail">
        <Slider
          {...settingsThumbs}
          ref={slider2}
          className="slider-nav-thumbnails"
        >
          <div className="banner-slide">
            <img
              src="/assets/imgs/page/homepagetravel/ella11.jpg"
              alt="Travila"
            />
          </div>
          <div className="banner-slide">
            <img
              src="/assets/imgs/page/homepagetravel/kingdom4.jpg"
              alt="Travila"
            />
          </div>
          <div className="banner-slide">
            <img
              src="/assets/imgs/page/homepagetravel/mirissa33.jpg"
              alt="Travila"
            />
          </div>
        
        </Slider>
      </div> */}
    </>
  );
}

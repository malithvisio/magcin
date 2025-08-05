'use client';

import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import './styles.css';

interface ImageSliderProps {
  images: string[];
  alt: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, alt }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className='container-banner'>
      <div className='banner-section'>
        <Slider {...settings} className='banner-main'>
          {images.map((image, index) => (
            <div className='banner-slide' key={index}>
              <div className='banner-'>
                <img src={image} alt={alt} className='tour-image' />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className='desktop-only'></div>
    </div>
  );
};

export default ImageSlider;

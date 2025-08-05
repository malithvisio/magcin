'use client';
import VideoPopup from '@/components/elements/VideoPopup';
import Layout from '@/components/layout/Layout';
import SwiperGroup3Slider from '@/components/slider/SwiperGroup3Slider';
import SwiperGroupPaymentSlider from '@/components/slider/SwiperGroupPaymentSlider';
import { swiperGroupAnimate } from '@/util/swiperOption';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import OurFeatured1 from '@/components/sections/OurFeatured1';
import Team from '@/components/sections/Team';

export default function About() {
  return (
    <>
      <Layout headerStyle={1} footerStyle={2}>
        <Team />
      </Layout>
    </>
  );
}

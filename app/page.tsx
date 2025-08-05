import Layout from '@/components/layout/Layout';

import Category from '@/components/sections/Category';
import FilterSearch from '@/components/sections/FilterSearch';
import Flights1 from '@/components/sections/Flights1';
import News1 from '@/components/sections/News1';
import Payments1 from '@/components/sections/Payments1';
import PopularDestinations1 from '@/components/sections/PopularDestinations1';
import Subscriber1 from '@/components/sections/Subscriber1';
import Testimonials1 from '@/components/sections/Testimonials1';
import TopRated1 from '@/components/sections/TopRated1';
import WhyChooseUs1 from '@/components/sections/WhyChooseUs1';
import Adventurepackages from '@/components/layout/adventurepackages';
import BannerHome1 from '@/components/sections/BannerHome1';

export default function Home() {
  return (
    <>
      <Layout headerStyle={1} footerStyle={2}>
        <BannerHome1 />
        {/* <FilterSearch /> */}
        <Adventurepackages />
        {/* <YourJourney /> */}
        {/* <PopularDestinations1 /> */}
        {/* <TopRated1 /> */}
        <WhyChooseUs1 />
        <News1 />
        {/* <Flights1 /> */}
        {/* <Category /> */}
        <Payments1 />
        {/* <Testimonials1 /> */}

        {/* <Subscriber1 /> */}
      </Layout>
    </>
  );
}

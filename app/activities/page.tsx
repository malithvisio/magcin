'use client';
import ByActivities from '@/components/Filter/ByActivities';
import ByAttraction from '@/components/Filter/ByAttraction';
import ByDuration from '@/components/Filter/ByDuration';
import ByLanguage from '@/components/Filter/ByLanguage';
import ByPagination from '@/components/Filter/ByPagination';
import ByPrice from '@/components/Filter/ByPrice';
import ByRating from '@/components/Filter/ByRating';
import SortToursFilter from '@/components/elements/SortToursFilter';
import TourCard3 from '@/components/elements/tourcard/TourCard3';
import Layout from '@/components/layout/Layout';
import SwiperGroup3Slider from '@/components/slider/SwiperGroup3Slider';
import rawToursData from '@/util/tours.json';
import useTourFilter from '@/util/useTourFilter';
import Link from 'next/link';

const toursData = rawToursData.map(tour => ({
  ...tour,
  duration: parseFloat(tour.duration as string),
  groupSize: parseInt(tour.groupSize as unknown as string),
  rating: parseFloat(tour.rating as string),
}));

export default function Activities5() {
  const {
    filter,
    sortCriteria,
    itemsPerPage,
    currentPage,
    uniqueActivities,
    uniqueLanguages,
    uniqueAttractions,
    uniqueRatings,
    sortedTours,
    totalPages,
    paginatedTours,
    handleCheckboxChange,
    handleSortChange,
    handlePriceRangeChange,
    handleDurationRangeChange,
    handleItemsPerPageChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleClearFilters,
    startItemIndex,
    endItemIndex,
  } = useTourFilter(toursData);

  return (
    <>
      <Layout headerStyle={1} footerStyle={2}>
        <main className='main'>
          <section className='box-section block-content-tourlist background-body'>
            <div className='container'>
              <div className='box-content-main'>
                <div className='content-right'>
                  {/* <div className='box-filters mb-25 pb-5 border-bottom border-1'>
                    <SortToursFilter
                      sortCriteria={sortCriteria}
                      handleSortChange={handleSortChange}
                      itemsPerPage={itemsPerPage}
                      handleItemsPerPageChange={handleItemsPerPageChange}
                      handleClearFilters={handleClearFilters}
                      startItemIndex={startItemIndex}
                      endItemIndex={endItemIndex}
                      sortedTours={sortedTours}
                    />
                  </div> */}
                  <div className='box-list-tours list-tours wow fadeIn'>
                    <div className='row'>
                      {/* Use TourCard3 with database functionality */}
                      <div className='col-12'>
                        <TourCard3 useDatabase={true} />
                      </div>
                    </div>
                  </div>
                  {/* Note: Pagination is now handled within the TourCard3 component */}
                </div>
              </div>
            </div>
          </section>
          <section
            className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16'
            style={{
              background:
                'linear-gradient(90deg,rgb(161, 163, 22) 0%,rgb(18, 195, 207) 100%)',
            }}
          >
            <div className='container mx-auto px-4 text-center'>
              <h2 className='text-3xl md:text-4xl font-bold mb-6'>
                Ready to Explore Activities?
              </h2>
              <p className='text-xl mb-8 text-emerald-100 max-w-2xl mx-auto'>
                Contact us to plan your perfect trip or get expert travel advice
                about these amazing destinations.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/contact'
                  className='bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors'
                  style={{ color: '#16a34a' }}
                >
                  Contact Us
                </Link>
                <Link
                  href='/about'
                  className='border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-emerald-600 transition-colors'
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>
          {/* <section className='section-box box-news background-body'>
            <div className='container'>
              <div className='row align-items-end'>
                <div className='col-md-6 mb-30 wow fadeInLeft'>
                  <h2 className='neutral-1000'>News, Tips Guides</h2>
                  <p className='text-xl-medium neutral-500'>
                    Favorite destinations based on customer reviews
                  </p>
                </div>
              </div>
            </div>
          </section> */}
        </main>
      </Layout>
    </>
  );
}

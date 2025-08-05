import SwiperGroupPaymentSlider from '../slider/SwiperGroupPaymentSlider';

export default function Payments1() {
  return (
    <>
      <section className='section-box box-payments background-body'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-5'>
              <div className='row'>
                <div className='col-md-7 mb-30'>
                  <img
                    className='bdrd8 w-100'
                    src='/assets/imgs/page/homepage1/Feature-Image-2-450x417.jpg'
                    alt='Travila'
                  />
                </div>
                <div className='col-md-5 mb-30'>
                  <img
                    className='bdrd8 w-100 mb-15'
                    src='/assets/imgs/page/homepage1/home-featured-tour1.jpg'
                    alt='Travila'
                  />
                  <img
                    className='bdrd8 w-100'
                    src='/assets/imgs/page/homepage1/two-wheel.jpg'
                    alt='Travila'
                  />
                </div>
              </div>
            </div>
            <div className='col-lg-7 mb-30'>
              <div className='box-left-payment'>
                <span className='btn btn-tag'>Your Journey, Your Story</span>
                <h2 className='title-why mb-25 mt-10 neutral-1000 tracking-wide'>
                  Discover Dream
                  <br />
                  Destinations
                </h2>

                <p className='text-xl-medium neutral-500 mb-35'>
                  Our local guides ensure you uncover the true spirit of Sri
                  Lanka beyond the tourist spots, into the heart of island
                  culture.
                </p>
                <div className='payment-method'>
                  <div className='box-swiper mt-30'>
                    <div className='swiper-container swiper-group-payment'>
                      {/* <SwiperGroupPaymentSlider /> */}
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

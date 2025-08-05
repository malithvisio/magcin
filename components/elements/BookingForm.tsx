'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface FormData {
  checkin: string;
  checkout: string;
  guests: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  message: string;
  packageName: string; // Add packageName to form data
}

// Add custom styles at the top of the file
const phoneInputStyles = {
  '--PhoneInput-height': 'auto',
  '--PhoneInputCountry-selectArrow-width': '0.8rem',
  '--PhoneInputCountry-flagWidth': '1.5rem',
  '--PhoneInputCountryFlag-height': '0.8em',
};

export default function BookingForm({
  packageName = '',
}: {
  packageName?: string;
}) {
  const [formData, setFormData] = useState<FormData>({
    checkin: '',
    checkout: '',
    guests: '1',
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    message: '',
    packageName: packageName, // Initialize with prop
  });

  // If packageName prop changes, update formData
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, packageName: packageName }));
  }, [packageName]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, contactNumber: value || '' }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save booking to database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Show success message
        alert(
          'Booking submitted successfully! You will be redirected to WhatsApp.'
        );

        // Open WhatsApp with the booking details
        if (result.whatsappURL) {
          window.open(result.whatsappURL, '_blank');
        }

        // Reset form
        setFormData({
          checkin: '',
          checkout: '',
          guests: '1',
          firstName: '',
          lastName: '',
          contactNumber: '',
          email: '',
          message: '',
          packageName: packageName,
        });
      } else {
        console.error('API Error:', result);
        alert(`Error: ${result.error || 'Failed to submit booking'}`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='content-booking-form'>
      <form onSubmit={handleSubmit}>
        {/* Hidden field for package name */}
        <input type='hidden' name='packageName' value={formData.packageName} />
        <div className='item-line-booking'>
          <strong className='text-md-bold neutral-1000'>Arrival Date:</strong>
          <div className='input-calendar'>
            <input
              type='date'
              name='checkin'
              className='form-control calendar-date'
              value={formData.checkin}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className='item-line-booking'>
          <strong className='text-md-bold neutral-1000'>Departure date:</strong>
          <div className='input-calendar'>
            <input
              type='date'
              name='checkout'
              className='form-control calendar-date'
              value={formData.checkout}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className='item-line-booking'>
          <strong className='text-md-bold neutral-1000'> No of Guests:</strong>
          <input
            type='number'
            name='guests'
            className='form-control'
            min='1'
            max='10'
            value={formData.guests}
            onChange={handleChange}
            required
          />
        </div>

        <div className='item-line-booking'>
          <strong className='text-md-bold neutral-1000'></strong>
          <PhoneInput
            international
            defaultCountry='LK'
            value={formData.contactNumber}
            onChange={handlePhoneChange}
            className='form-control'
            style={phoneInputStyles}
            required
          />
        </div>

        <div className='item-line-booking'>
          <input
            type='text'
            name='firstName'
            placeholder='First Name'
            className='form-control'
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className='item-line-booking'>
          <input
            type='text'
            name='lastName'
            placeholder='Last Name'
            className='form-control'
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className='item-line-booking'>
          <input
            type='email'
            name='email'
            placeholder='Email'
            className='form-control'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className='item-line-booking'>
          <textarea
            name='message'
            placeholder='Message (optional)'
            className='form-control'
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className='box-button-book'>
          <button
            type='submit'
            className='btn btn-book'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Book Now via WhatsApp'}
            {!isSubmitting && (
              <svg
                width={16}
                height={16}
                viewBox='0 0 16 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M8 15L15 8L8 1M15 8L1 8'
                  stroke='#0D0D0D'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

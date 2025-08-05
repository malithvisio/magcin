'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

interface Package {
  _id: string;
  id: string;
  name: string;
  title: string;
  image: string;
  summery: string;
  location: string;
  duration: string;
  days: string;
  nights: string;
  destinations: string;
  rating: number;
  reviews: number;
  type: string;
  mini_discription: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  images: string[];
  images2: string;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    highlights: string[];
    activity: string;
  }>;
  // Active status fields
  highlightsActive?: boolean;
  inclusionsActive?: boolean;
  exclusionsActive?: boolean;
  itineraryActive?: boolean;
  category?: string; // <-- Add category to the interface
}

export default function EditPackage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [formData, setFormData] = useState<Package>({
    _id: '',
    id: '',
    name: '',
    title: '',
    image: '',
    summery: '',
    location: '',
    duration: '',
    days: '',
    nights: '',
    destinations: '',
    rating: 4.5,
    reviews: 0,
    type: '',
    mini_discription: '',
    description: '',
    highlights: [''],
    inclusions: [''],
    exclusions: [''],
    images: [''],
    images2: '',
    itinerary: [
      {
        day: 1,
        title: '',
        description: '',
        highlights: [''],
        activity: '',
      },
    ],
    // Active status fields
    highlightsActive: true,
    inclusionsActive: true,
    exclusionsActive: true,
    itineraryActive: true,
    category: '', // <-- Add category to initial state
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPackage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/packages/${packageId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch package');
      }

      // Ensure arrays have at least one empty item if they're empty
      const packageData = {
        ...data.package,
        highlights:
          data.package.highlights?.length > 0 ? data.package.highlights : [''],
        inclusions:
          data.package.inclusions?.length > 0 ? data.package.inclusions : [''],
        exclusions:
          data.package.exclusions?.length > 0 ? data.package.exclusions : [''],
        images: data.package.images?.length > 0 ? data.package.images : [''],
        itinerary:
          data.package.itinerary?.length > 0
            ? data.package.itinerary
            : [
                {
                  day: 1,
                  title: '',
                  description: '',
                  highlights: [''],
                  activity: '',
                },
              ],
        // Set default values for active status fields if not present
        highlightsActive:
          data.package.highlightsActive === undefined
            ? true
            : data.package.highlightsActive,
        inclusionsActive:
          data.package.inclusionsActive === undefined
            ? true
            : data.package.inclusionsActive,
        exclusionsActive:
          data.package.exclusionsActive === undefined
            ? true
            : data.package.exclusionsActive,
        itineraryActive:
          data.package.itineraryActive === undefined
            ? true
            : data.package.itineraryActive,
        category: data.package.category || '', // <-- Always preserve category
      };

      setFormData(packageData);
    } catch (err: any) {
      setError(err.message || 'Failed to load package');
    } finally {
      setIsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchPackage();
  }, [packageId, fetchPackage]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map(
        (item: any, i: number) => (i === index ? value : item)
      ),
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), ''],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  const handleItineraryChange = (
    dayIndex: number,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, index) =>
        index === dayIndex ? { ...day, [field]: value } : day
      ),
    }));
  };

  const handleItineraryArrayChange = (
    dayIndex: number,
    field: string,
    itemIndex: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              [field]: (day[field as keyof typeof day] as string[]).map(
                (item: any, i: number) => (i === itemIndex ? value : item)
              ),
            }
          : day
      ),
    }));
  };

  const addItineraryArrayItem = (dayIndex: number, field: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              [field]: [...(day[field as keyof typeof day] as string[]), ''],
            }
          : day
      ),
    }));
  };

  const removeItineraryArrayItem = (
    dayIndex: number,
    field: string,
    itemIndex: number
  ) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              [field]: (day[field as keyof typeof day] as string[]).filter(
                (_: any, i: number) => i !== itemIndex
              ),
            }
          : day
      ),
    }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: '',
          description: '',
          highlights: [''],
          activity: '',
        },
      ],
    }));
  };

  const removeItineraryDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, index) => index !== dayIndex),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Filter out empty items from arrays
      const cleanData = {
        ...formData,
        highlights: formData.highlightsActive
          ? formData.highlights.filter(item => item.trim() !== '')
          : [],
        inclusions: formData.inclusionsActive
          ? formData.inclusions.filter(item => item.trim() !== '')
          : [],
        exclusions: formData.exclusionsActive
          ? formData.exclusions.filter(item => item.trim() !== '')
          : [],
        images: formData.images.filter(item => item.trim() !== ''),
        itinerary: formData.itineraryActive
          ? formData.itinerary.map(day => ({
              ...day,
              highlights: (day.highlights || []).filter(
                item => item.trim() !== ''
              ),
            }))
          : [],
        category: formData.category, // <-- Always include category in update
      };

      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update package');
      }

      setSuccess('Package updated successfully! Redirecting...');

      // Redirect to packages list after 2 seconds
      setTimeout(() => {
        router.push('/admin/packages');
      }, 2000);
    } catch (err: any) {
      console.error('Update package error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft functionality
  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Filter out empty items from arrays
      const cleanData = {
        ...formData,
        highlights: formData.highlightsActive
          ? formData.highlights.filter(item => item.trim() !== '')
          : [],
        inclusions: formData.inclusionsActive
          ? formData.inclusions.filter(item => item.trim() !== '')
          : [],
        exclusions: formData.exclusionsActive
          ? formData.exclusions.filter(item => item.trim() !== '')
          : [],
        images: formData.images.filter(item => item.trim() !== ''),
        itinerary: formData.itineraryActive
          ? formData.itinerary.map(day => ({
              ...day,
              highlights: (day.highlights || []).filter(
                item => item.trim() !== ''
              ),
            }))
          : [],
        published: false, // Draft packages are not published
        isDraft: true, // Flag to indicate this is a draft save
        category: formData.category, // <-- Always include category in draft save
      };

      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save package as draft');
      }

      setSuccess('Package saved as draft successfully!');

      // Don't redirect, just show success message
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Save as draft error:', err);
      setError(err.message || 'Failed to save as draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/packages');
  };

  // Toggle switch component
  const ToggleSwitch = ({
    isActive,
    onToggle,
    label,
  }: {
    isActive: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <div className='toggle-switch-container'>
      <label className='toggle-switch-label'>{label}</label>
      <button
        type='button'
        className={`toggle-switch ${isActive ? 'active' : 'inactive'}`}
        onClick={onToggle}
      >
        <div className='toggle-slider'></div>
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='edit-package-page'>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Loading package details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className='edit-package-page'>
          <div className='error-container'>
            <div className='alert alert-danger'>
              <p>{error}</p>
              <div className='error-actions'>
                <button onClick={fetchPackage} className='retry-btn'>
                  Try Again
                </button>
                <button onClick={handleCancel} className='cancel-btn'>
                  Back to Packages
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='edit-package-page'>
        <div className='page-header'>
          <div className='header-content'>
            <h1 className='page-title'>Edit Package</h1>
            <p className='page-description'>
              Update package details, itinerary, and information.
            </p>
          </div>
        </div>

        {error && <div className='alert alert-danger'>{error}</div>}
        {success && <div className='alert alert-success'>{success}</div>}

        <form onSubmit={handleSubmit} className='package-form'>
          <div className='form-grid'>
            {/* Basic Information */}
            <div className='form-section'>
              <h2 className='section-title'>Basic Information</h2>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='id'>Package ID *</label>
                  <input
                    type='text'
                    id='id'
                    value={formData.id}
                    onChange={e => handleInputChange('id', e.target.value)}
                    placeholder='e.g., Pilgrimage-Cultural-Tour-SriLanka'
                    required
                  />
                  <small>Unique identifier (use hyphens, no spaces)</small>
                </div>

                <div className='form-group'>
                  <label htmlFor='name'>Package Name *</label>
                  <input
                    type='text'
                    id='name'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='e.g., Pilgrimage Cultural Tour'
                    required
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='title'>Package Title *</label>
                  <input
                    type='text'
                    id='title'
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder='e.g., Pilgrims Tour Package for Hindus'
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='type'>Package Type *</label>
                  <input
                    type='text'
                    id='type'
                    value={formData.type}
                    onChange={e => handleInputChange('type', e.target.value)}
                    placeholder='e.g., Pilgrimage & Culture Tour'
                    required
                  />
                </div>
              </div>

              <div className='form-group'>
                <label htmlFor='location'>Location *</label>
                <input
                  type='text'
                  id='location'
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder='e.g., Anuradhapura, Jaffna, Trincomalee, Kandy, Nuwara Eliya'
                  required
                />
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='duration'>Duration *</label>
                  <input
                    type='text'
                    id='duration'
                    value={formData.duration}
                    onChange={e =>
                      handleInputChange('duration', e.target.value)
                    }
                    placeholder='e.g., 8 Days 7 Nights'
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='destinations'>Destinations *</label>
                  <input
                    type='text'
                    id='destinations'
                    value={formData.destinations}
                    onChange={e =>
                      handleInputChange('destinations', e.target.value)
                    }
                    placeholder='e.g., 5 Destinations'
                    required
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='days'>Days *</label>
                  <input
                    type='text'
                    id='days'
                    value={formData.days}
                    onChange={e => handleInputChange('days', e.target.value)}
                    placeholder='e.g., 8 Days'
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='nights'>Nights *</label>
                  <input
                    type='text'
                    id='nights'
                    value={formData.nights}
                    onChange={e => handleInputChange('nights', e.target.value)}
                    placeholder='e.g., 7 Nights'
                    required
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='rating'>Rating</label>
                  <input
                    type='number'
                    id='rating'
                    value={formData.rating}
                    onChange={e =>
                      handleInputChange('rating', parseFloat(e.target.value))
                    }
                    placeholder='e.g., 4.9'
                    min='0'
                    max='5'
                    step='0.1'
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='reviews'>Number of Reviews</label>
                  <input
                    type='number'
                    id='reviews'
                    value={formData.reviews}
                    onChange={e =>
                      handleInputChange('reviews', parseInt(e.target.value))
                    }
                    placeholder='e.g., 23'
                    min='0'
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className='form-section'>
              <h2 className='section-title'>Descriptions</h2>

              <div className='form-group'>
                <label htmlFor='summery'>Summary *</label>
                <textarea
                  id='summery'
                  value={formData.summery}
                  onChange={e => handleInputChange('summery', e.target.value)}
                  placeholder='Brief summary of the package (2-3 sentences)'
                  rows={4}
                  required
                />
              </div>

              <div className='form-group'>
                <label htmlFor='mini_discription'>Mini Description *</label>
                <textarea
                  id='mini_discription'
                  value={formData.mini_discription}
                  onChange={e =>
                    handleInputChange('mini_discription', e.target.value)
                  }
                  placeholder='Brief description (1-2 sentences)'
                  rows={3}
                  required
                />
              </div>

              <div className='form-group'>
                <label htmlFor='description'>Full Description *</label>
                <textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='Detailed description of the package'
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* Highlights, Inclusions & Exclusions */}
            <div className='form-section'>
              <h2 className='section-title'>
                Highlights, Inclusions & Exclusions
              </h2>

              {/* Highlights Section */}
              <div
                className={`section-content ${!formData.highlightsActive ? 'disabled' : ''}`}
              >
                <ToggleSwitch
                  isActive={formData.highlightsActive!}
                  onToggle={() =>
                    handleInputChange(
                      'highlightsActive',
                      !formData.highlightsActive
                    )
                  }
                  label='Highlights Section'
                />

                {formData.highlightsActive && (
                  <div className='form-group'>
                    <label>Highlights *</label>
                    {formData.highlights.map((highlight, index) => (
                      <div key={index} className='array-input-group'>
                        <input
                          type='text'
                          value={highlight}
                          onChange={e =>
                            handleArrayChange(
                              'highlights',
                              index,
                              e.target.value
                            )
                          }
                          placeholder='e.g., Visit to Munneswaram Temple (linked to the Ramayana)'
                          required={index === 0}
                        />
                        {formData.highlights.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeArrayItem('highlights', index)}
                            className='remove-btn'
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={() => addArrayItem('highlights')}
                      className='add-btn'
                    >
                      + Add Highlight
                    </button>
                  </div>
                )}
              </div>

              {/* Inclusions Section */}
              <div
                className={`section-content ${!formData.inclusionsActive ? 'disabled' : ''}`}
              >
                <ToggleSwitch
                  isActive={formData.inclusionsActive!}
                  onToggle={() =>
                    handleInputChange(
                      'inclusionsActive',
                      !formData.inclusionsActive
                    )
                  }
                  label='Inclusions Section'
                />

                {formData.inclusionsActive && (
                  <div className='form-group'>
                    <label>Inclusions *</label>
                    {formData.inclusions.map((inclusion, index) => (
                      <div key={index} className='array-input-group'>
                        <input
                          type='text'
                          value={inclusion}
                          onChange={e =>
                            handleArrayChange(
                              'inclusions',
                              index,
                              e.target.value
                            )
                          }
                          placeholder='e.g., All meals included'
                          required={index === 0}
                        />
                        {formData.inclusions.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeArrayItem('inclusions', index)}
                            className='remove-btn'
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={() => addArrayItem('inclusions')}
                      className='add-btn'
                    >
                      + Add Inclusion
                    </button>
                  </div>
                )}
              </div>

              {/* Exclusions Section */}
              <div
                className={`section-content ${!formData.exclusionsActive ? 'disabled' : ''}`}
              >
                <ToggleSwitch
                  isActive={formData.exclusionsActive!}
                  onToggle={() =>
                    handleInputChange(
                      'exclusionsActive',
                      !formData.exclusionsActive
                    )
                  }
                  label='Exclusions Section'
                />

                {formData.exclusionsActive && (
                  <div className='form-group'>
                    <label>Exclusions *</label>
                    {formData.exclusions.map((exclusion, index) => (
                      <div key={index} className='array-input-group'>
                        <input
                          type='text'
                          value={exclusion}
                          onChange={e =>
                            handleArrayChange(
                              'exclusions',
                              index,
                              e.target.value
                            )
                          }
                          placeholder='e.g., Personal expenses'
                          required={index === 0}
                        />
                        {formData.exclusions.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeArrayItem('exclusions', index)}
                            className='remove-btn'
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={() => addArrayItem('exclusions')}
                      className='add-btn'
                    >
                      + Add Exclusion
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Itinerary */}
            <div className='form-section'>
              <h2 className='section-title'>Itinerary</h2>

              <div
                className={`section-content ${!formData.itineraryActive ? 'disabled' : ''}`}
              >
                <ToggleSwitch
                  isActive={formData.itineraryActive!}
                  onToggle={() =>
                    handleInputChange(
                      'itineraryActive',
                      !formData.itineraryActive
                    )
                  }
                  label='Itinerary Section'
                />

                {formData.itineraryActive && (
                  <>
                    {formData.itinerary.map((day, dayIndex) => (
                      <div key={dayIndex} className='itinerary-day'>
                        <div className='day-header'>
                          <h3>Day {day.day}</h3>
                          {formData.itinerary.length > 1 && (
                            <button
                              type='button'
                              onClick={() => removeItineraryDay(dayIndex)}
                              className='remove-day-btn'
                            >
                              Remove Day
                            </button>
                          )}
                        </div>

                        <div className='form-row'>
                          <div className='form-group'>
                            <label>Day Title *</label>
                            <input
                              type='text'
                              value={day.title}
                              onChange={e =>
                                handleItineraryChange(
                                  dayIndex,
                                  'title',
                                  e.target.value
                                )
                              }
                              placeholder='e.g., Arrival in Colombo'
                              required
                            />
                          </div>

                          <div className='form-group'>
                            <label>Activity *</label>
                            <input
                              type='text'
                              value={day.activity}
                              onChange={e =>
                                handleItineraryChange(
                                  dayIndex,
                                  'activity',
                                  e.target.value
                                )
                              }
                              placeholder='e.g., Airport pickup and city tour'
                              required
                            />
                          </div>
                        </div>

                        <div className='form-group'>
                          <label>Description *</label>
                          <textarea
                            value={day.description}
                            onChange={e =>
                              handleItineraryChange(
                                dayIndex,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Detailed description of the day'
                            rows={4}
                            required
                          />
                        </div>

                        <div className='form-group'>
                          <label>Highlights *</label>
                          {(day.highlights || ['']).map((highlight, index) => (
                            <div key={index} className='array-input-group'>
                              <input
                                type='text'
                                value={highlight}
                                onChange={e =>
                                  handleItineraryArrayChange(
                                    dayIndex,
                                    'highlights',
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder='e.g., Visit to Gangaramaya Temple'
                                required={index === 0}
                              />
                              {(day.highlights || []).length > 1 && (
                                <button
                                  type='button'
                                  onClick={() =>
                                    removeItineraryArrayItem(
                                      dayIndex,
                                      'highlights',
                                      index
                                    )
                                  }
                                  className='remove-btn'
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type='button'
                            onClick={() =>
                              addItineraryArrayItem(dayIndex, 'highlights')
                            }
                            className='add-btn'
                          >
                            + Add Highlight
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type='button'
                      onClick={addItineraryDay}
                      className='add-day-btn'
                    >
                      + Add Day
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='form-actions'>
            <button
              type='button'
              onClick={handleCancel}
              className='cancel-btn'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='submit-btn'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Package'}
            </button>
            <button
              type='button'
              onClick={handleSaveAsDraft}
              className='save-draft-btn'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .edit-package-page {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .page-header {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .page-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 0.5rem 0;
          }

          .page-description {
            color: #64748b;
            font-size: 1.1rem;
            margin: 0;
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }

          .alert {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
          }

          .alert-danger {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
          }

          .alert-success {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;
          }

          .error-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }

          .retry-btn {
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 0.375rem;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
          }

          .retry-btn:hover {
            background: #b91c1c;
          }

          .package-form {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .form-grid {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .form-section {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
            background: #f8fafc;
          }

          .section-content {
            margin-bottom: 2rem;
          }

          .section-content.disabled {
            opacity: 0.6;
            pointer-events: none;
          }

          .section-content.disabled input,
          .section-content.disabled textarea,
          .section-content.disabled button {
            opacity: 0.4;
            pointer-events: none;
            color: #000000 !important;
          }

          /* Ensure text color is always black in inputs */
          input,
          textarea {
            color: #000000 !important;
          }

          /* Ensure placeholder text is visible */
          input::placeholder,
          textarea::placeholder {
            color: #6b7280 !important;
          }

          /* Override admin globals for package forms */
          .package-form input,
          .package-form textarea {
            color: #000000 !important;
            background-color: white !important;
          }

          .package-form input::placeholder,
          .package-form textarea::placeholder {
            color: #6b7280 !important;
          }

          .toggle-switch-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: white;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
          }

          .toggle-switch-label {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.875rem;
          }

          .toggle-switch {
            position: relative;
            width: 50px;
            height: 24px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            padding: 2px;
          }

          .toggle-switch.active {
            background: #10b981;
          }

          .toggle-switch.inactive {
            background: #ef4444;
          }

          .toggle-slider {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
            transform: translateX(0);
          }

          .toggle-switch.active .toggle-slider {
            transform: translateX(26px);
          }

          .toggle-switch:hover {
            opacity: 0.8;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 1.5rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #3b82f6;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            color: #000000;
            transition:
              border-color 0.2s,
              box-shadow 0.2s;
            background: white;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-group small {
            display: block;
            color: #6b7280;
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }

          .array-input-group {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            align-items: center;
          }

          .array-input-group input {
            flex: 1;
            margin-bottom: 0;
            color: #000000;
            background: white;
          }

          .remove-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 0.375rem;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.75rem;
            transition: background-color 0.2s;
          }

          .remove-btn:hover {
            background: #dc2626;
          }

          .add-btn {
            background: #10b981;
            color: white;
            border: none;
            border-radius: 0.375rem;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
            margin-top: 0.5rem;
          }

          .add-btn:hover {
            background: #059669;
          }

          .itinerary-day {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            background: white;
          }

          .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .day-header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
          }

          .remove-day-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 0.375rem;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
          }

          .remove-day-btn:hover {
            background: #dc2626;
          }

          .add-day-btn {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.375rem;
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
            width: 100%;
          }

          .add-day-btn:hover {
            background: #2563eb;
          }

          .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
          }

          .cancel-btn,
          .submit-btn,
          .save-draft-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 0.875rem;
          }

          .cancel-btn {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .cancel-btn:hover {
            background: #e5e7eb;
          }

          .submit-btn {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
          }

          .submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .save-draft-btn {
            background: #f59e0b;
            color: white;
          }

          .save-draft-btn:hover {
            background: #d97706;
          }

          .submit-btn:disabled,
          .cancel-btn:disabled,
          .save-draft-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          /* Mobile styles */
          @media (max-width: 768px) {
            .page-header,
            .package-form {
              padding: 1rem;
            }

            .page-title {
              font-size: 1.5rem;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .form-section {
              padding: 1rem;
            }

            .itinerary-day {
              padding: 1rem;
            }

            .day-header {
              flex-direction: column;
              gap: 0.5rem;
              align-items: flex-start;
            }

            .form-actions {
              flex-direction: column;
            }

            .cancel-btn,
            .submit-btn,
            .save-draft-btn {
              width: 100%;
            }
          }

          /* Tablet styles */
          @media (min-width: 769px) and (max-width: 1024px) {
            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

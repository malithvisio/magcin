'use client';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/util/api-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

// Simple textarea component for rich text editing
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontFamily: 'inherit',
      fontSize: '14px',
      resize: 'vertical',
      lineHeight: '1.5',
    }}
  />
);

function AddPackageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const isEditing = searchParams.get('edit') === 'true';
  const packageId = searchParams.get('id');
  const categoryFromUrl = searchParams.get('category');

  const tabList = [
    'Basic Details',
    'Instruction page',
    'Services',
    'Itineraries',
    'Locations',
    'Pricing',
    'Accommodation Places',
    'Guidelines',
    'Reviews',
  ];
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(isEditing);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Multiple images for slider images (like destinations page)
  const [multipleImages, setMultipleImages] = useState<string[]>(['']);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [multipleImagePreviews, setMultipleImagePreviews] = useState<string[]>(
    []
  );
  const [multipleImageAlts, setMultipleImageAlts] = useState<string[]>(['']);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  // Track removed images for cleanup
  const [removedMultipleImages, setRemovedMultipleImages] = useState<string[]>(
    []
  );
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  // Example input state for each tab (for demo)
  type BasicDetailsTab = {
    title: string;
    days: string;
    nights: string;
    destinations: string;
    avgReview: string;
    totalReviewers: string;
    location: string;
    highlight: boolean;
  };
  type OtherTab = {
    [key: string]:
      | string
      | File
      | Array<{
          file: File | null;
          url: string | null;
          alt: string;
          uploaded: boolean;
        }>;
  };
  // Add to TabInputsType for Services tab
  type ServicesTab = {
    included: string[];
    excluded: string[];
  };
  // Add to TabInputsType for Itineraries tab
  type ItinerariesTab = {
    itinerary: string;
    days: Array<{
      dayNumber: string;
      title: string;
      description: string;
      activity: string;
      highlights: string[]; // Add highlights array for each day
      isExpanded: boolean;
    }>;
  };
  // Update TabInputsType for Locations tab (tab 4)
  type Location = {
    name: string;
    latitude: string;
    longitude: string;
    day: string;
  };
  // Update TabInputsType for Guidelines tab (tab 7)
  type FAQItem = { question: string; answer: string };
  type GuidelinesTab = {
    description: string;
    faqs: FAQItem[];
  };
  // 1. Update the type for tabInputs['6'] to support an array of accommodation places
  type AccommodationPlace = {
    sectionTitle: string;
    hotelName: string;
    shareableLink: string;
    latitude: string;
    longitude: string;
    description: string;
    image1: File | null;
    image1Alt: string;
    image1Url?: string; // URL for the uploaded image
    headerImage: File | null;
    headerImageAlt: string;
    headerImageUrl?: string; // URL for the uploaded image
  };
  // 1. Add Review type
  type Review = {
    name: string;
    stars: string;
    text: string;
    source: string;
    sourceLink: string;
    faceImage: File | null;
    faceImageAlt: string;
    faceImageUrl: string;
    journeyImage: File | null;
    journeyImageAlt: string;
    journeyImageUrl: string;
  };
  // 2. Update TabInputsType for tab 8
  type TabInputsType = {
    '0': BasicDetailsTab;
    '1': OtherTab;
    '2': ServicesTab;
    '3': ItinerariesTab;
    '4': { locations: Location[] };
    '5': {
      priceLeft: string;
      priceRight: string;
      currency: string;
      highlight: boolean;
    };
    '6': AccommodationPlace[];
    '7': GuidelinesTab;
    '8': Review[];
  };
  // 3. Update initial state for tab 8
  const [tabInputs, setTabInputs] = useState<TabInputsType>({
    '0': {
      title: '',
      days: '',
      nights: '',
      destinations: '',
      avgReview: '',
      totalReviewers: '',
      location: '',
      highlight: false,
    },
    '1': {
      title: '',
      shortDescription: '',
      tabTitle: '',
      numSections: '',
      image1: '',
      image1Alt: '',
      headerImageUrl: '',
      section1Description: '',
      sliderImage1: '',
      sliderImage1Alt: '',
      sliderImage2: '',
      sliderImage2Alt: '',
    },
    '2': { included: [''], excluded: [''] },
    '3': {
      itinerary: '',
      days: [
        {
          dayNumber: '1',
          title: '',
          description: '',
          activity: '',
          highlights: [''], // Add highlights array
          isExpanded: false,
        },
      ],
    },
    '4': { locations: [{ name: '', latitude: '', longitude: '', day: '' }] },
    '5': {
      priceLeft: '',
      priceRight: '',
      currency: '',
      highlight: false,
    },
    '6': [
      {
        sectionTitle: '1 Day Night',
        hotelName: '',
        shareableLink: '',
        latitude: '',
        longitude: '',
        description: '',
        image1: null,
        image1Alt: '',
        image1Url: '',
        headerImage: null,
        headerImageAlt: '',
        headerImageUrl: '',
      },
    ],
    '7': { description: '', faqs: [{ question: '', answer: '' }] },
    '8': [
      {
        name: '',
        stars: '',
        text: '',
        source: '',
        sourceLink: '',
        faceImage: null,
        faceImageAlt: '',
        faceImageUrl: '',
        journeyImage: null,
        journeyImageAlt: '',
        journeyImageUrl: '',
      },
    ],
  });

  const handleTabInputChange = (
    tabIdx: number,
    field: string,
    value:
      | string
      | boolean
      | File
      | Array<{
          file: File | null;
          url: string | null;
          alt: string;
          uploaded: boolean;
        }>
  ) => {
    const key = tabIdx.toString() as keyof TabInputsType;
    setTabInputs(prev => {
      if (key === '0') {
        return {
          ...prev,
          '0': { ...prev['0'], [field]: value },
        };
      } else if (key === '3' && field.includes('.')) {
        // Handle nested fields for itineraries (e.g., 'days.0.title')
        const [parentField, index, childField] = field.split('.');
        const updatedDays = [...prev['3'].days];
        updatedDays[parseInt(index)] = {
          ...updatedDays[parseInt(index)],
          [childField]: value,
        };
        return {
          ...prev,
          '3': { ...prev['3'], [parentField]: updatedDays },
        };
      } else if (key === '6') {
        // Handle accommodations array - this should not be called directly for accommodations
        // Accommodations should use handleAccommodationChange instead
        console.warn(
          'handleTabInputChange called for tab 6 (accommodations). Use handleAccommodationChange instead.'
        );
        return prev;
      } else if (key === '8') {
        // Handle reviews array - this should not be called directly for reviews
        // Reviews should use handleReviewChange instead
        console.warn(
          'handleTabInputChange called for tab 8 (reviews). Use handleReviewChange instead.'
        );
        return prev;
      } else {
        return {
          ...prev,
          [key]: { ...prev[key], [field]: value },
        };
      }
    });
  };

  // Handlers for Included/Excluded dynamic fields
  const handleServiceChange = (
    type: 'included' | 'excluded',
    idx: number,
    value: string
  ) => {
    setTabInputs(prev => {
      const services = { ...prev['2'] };
      const arr = [...services[type]];
      arr[idx] = value;
      services[type] = arr;
      return { ...prev, '2': services };
    });
  };
  const handleAddServiceLine = (type: 'included' | 'excluded') => {
    setTabInputs(prev => {
      const services = { ...prev['2'] };
      services[type] = [...services[type], ''];
      return { ...prev, '2': services };
    });
  };
  const handleRemoveServiceLine = (
    type: 'included' | 'excluded',
    idx: number
  ) => {
    setTabInputs(prev => {
      const services = { ...prev['2'] };
      const arr = [...services[type]];
      arr.splice(idx, 1);
      services[type] = arr.length ? arr : [''];
      return { ...prev, '2': services };
    });
  };

  // Handlers for Itineraries days
  const handleAddDay = () => {
    setTabInputs(prev => {
      const newDayNumber = (prev['3'].days.length + 1).toString();
      const newDay = {
        dayNumber: newDayNumber,
        title: '',
        description: '',
        activity: '',
        highlights: [''], // Add highlights array
        isExpanded: false,
      };
      return {
        ...prev,
        '3': {
          ...prev['3'],
          days: [...prev['3'].days, newDay],
        },
      };
    });
  };

  const handleRemoveDay = (dayIndex: number) => {
    setTabInputs(prev => {
      const updatedDays = prev['3'].days.filter(
        (_, index) => index !== dayIndex
      );
      // Update day numbers
      const renumberedDays = updatedDays.map((day, index) => ({
        ...day,
        dayNumber: (index + 1).toString(),
      }));
      return {
        ...prev,
        '3': {
          ...prev['3'],
          days: renumberedDays,
        },
      };
    });
  };

  const handleToggleDayExpansion = (dayIndex: number) => {
    setTabInputs(prev => {
      const updatedDays = [...prev['3'].days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        isExpanded: !updatedDays[dayIndex].isExpanded,
      };
      return {
        ...prev,
        '3': {
          ...prev['3'],
          days: updatedDays,
        },
      };
    });
  };

  // Handlers for day highlights
  const handleDayHighlightChange = (
    dayIndex: number,
    highlightIndex: number,
    value: string
  ) => {
    setTabInputs(prev => {
      const updatedDays = [...prev['3'].days];
      const updatedHighlights = [...updatedDays[dayIndex].highlights];
      updatedHighlights[highlightIndex] = value;
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        highlights: updatedHighlights,
      };
      return {
        ...prev,
        '3': {
          ...prev['3'],
          days: updatedDays,
        },
      };
    });
  };

  const handleAddDayHighlight = (dayIndex: number) => {
    setTabInputs(prev => {
      const updatedDays = [...prev['3'].days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        highlights: [...updatedDays[dayIndex].highlights, ''],
      };
      return {
        ...prev,
        '3': {
          ...prev['3'],
          days: updatedDays,
        },
      };
    });
  };

  const handleRemoveDayHighlight = (
    dayIndex: number,
    highlightIndex: number
  ) => {
    setTabInputs(prev => {
      const updatedDays = [...prev['3'].days];
      const updatedHighlights = [...updatedDays[dayIndex].highlights];
      updatedHighlights.splice(highlightIndex, 1);
      // Ensure at least one highlight remains
      if (updatedHighlights.length === 0) {
        updatedHighlights.push('');
      }
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        highlights: updatedHighlights,
      };
      return {
        ...prev,
        '3': {
          ...prev['3'],
          days: updatedDays,
        },
      };
    });
  };

  // Handler for location field changes
  const handleLocationChange = (
    idx: number,
    field: keyof Location,
    value: string
  ) => {
    setTabInputs(prev => {
      const updatedLocations = [...prev['4'].locations];
      updatedLocations[idx] = { ...updatedLocations[idx], [field]: value };
      return { ...prev, '4': { locations: updatedLocations } };
    });
  };
  // Add new location
  const handleAddLocation = () => {
    setTabInputs(prev => ({
      ...prev,
      '4': {
        locations: [
          ...prev['4'].locations,
          { name: '', latitude: '', longitude: '', day: '' },
        ],
      },
    }));
  };
  // Remove location
  const handleRemoveLocation = (idx: number) => {
    setTabInputs(prev => {
      const updatedLocations = prev['4'].locations.filter((_, i) => i !== idx);
      return {
        ...prev,
        '4': {
          locations: updatedLocations.length
            ? updatedLocations
            : [{ name: '', latitude: '', longitude: '', day: '' }],
        },
      };
    });
  };

  // Accommodation Places handlers
  const handleAccommodationChange = (
    idx: number,
    field: keyof AccommodationPlace,
    value: string | File | null
  ) => {
    setTabInputs(prev => {
      const updated = [...(prev['6'] as AccommodationPlace[])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, '6': updated };
    });
  };
  const handleAddAccommodation = () => {
    setTabInputs(prev => ({
      ...prev,
      '6': [
        ...((prev['6'] as AccommodationPlace[]) || []),
        {
          sectionTitle: `${(prev['6'] as AccommodationPlace[]).length + 1} Day Night`,
          hotelName: '',
          shareableLink: '',
          latitude: '',
          longitude: '',
          description: '',
          image1: null,
          image1Alt: '',
          image1Url: '',
          headerImage: null,
          headerImageAlt: '',
          headerImageUrl: '',
        },
      ],
    }));
  };
  const handleRemoveAccommodation = (idx: number) => {
    setTabInputs(prev => {
      const arr = [...(prev['6'] as AccommodationPlace[])];
      arr.splice(idx, 1);
      return {
        ...prev,
        '6': arr.length
          ? arr
          : [
              {
                sectionTitle: '1 Day Night',
                hotelName: '',
                shareableLink: '',
                latitude: '',
                longitude: '',
                description: '',
                image1: null,
                image1Alt: '',
                image1Url: '',
                headerImage: null,
                headerImageAlt: '',
                headerImageUrl: '',
              },
            ],
      };
    });
  };

  // Handlers for Guidelines tab (tab 7)
  const handleGuidelineDescriptionChange = (value: string) => {
    setTabInputs(prev => ({
      ...prev,
      '7': { ...prev['7'], description: value },
    }));
  };
  const handleFAQChange = (
    idx: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    setTabInputs(prev => {
      const updatedFaqs = [...prev['7'].faqs];
      updatedFaqs[idx] = { ...updatedFaqs[idx], [field]: value };
      return { ...prev, '7': { ...prev['7'], faqs: updatedFaqs } };
    });
  };
  const handleAddFAQ = () => {
    setTabInputs(prev => ({
      ...prev,
      '7': {
        ...prev['7'],
        faqs: [...prev['7'].faqs, { question: '', answer: '' }],
      },
    }));
  };
  const handleRemoveFAQ = (idx: number) => {
    setTabInputs(prev => {
      const updatedFaqs = prev['7'].faqs.filter((_, i) => i !== idx);
      return {
        ...prev,
        '7': {
          ...prev['7'],
          faqs: updatedFaqs.length
            ? updatedFaqs
            : [{ question: '', answer: '' }],
        },
      };
    });
  };

  // 4. Add review handlers
  const handleReviewChange = (idx: number, field: keyof Review, value: any) => {
    setTabInputs(prev => {
      const reviews = [...(prev['8'] as Review[])];
      reviews[idx] = { ...reviews[idx], [field]: value };
      return { ...prev, '8': reviews };
    });
  };
  const handleAddReviewer = () => {
    setTabInputs(prev => ({
      ...prev,
      '8': [
        ...(prev['8'] as Review[]),
        {
          name: '',
          stars: '',
          text: '',
          source: '',
          sourceLink: '',
          faceImage: null,
          faceImageAlt: '',
          faceImageUrl: '',
          journeyImage: null,
          journeyImageAlt: '',
          journeyImageUrl: '',
        },
      ],
    }));
  };
  const handleRemoveReviewer = (idx: number) => {
    setTabInputs(prev => {
      const reviews = [...(prev['8'] as Review[])];
      reviews.splice(idx, 1);
      return {
        ...prev,
        '8':
          reviews.length > 0
            ? reviews
            : [
                {
                  name: '',
                  stars: '',
                  text: '',
                  source: '',
                  sourceLink: '',
                  faceImage: null,
                  faceImageAlt: '',
                  faceImageUrl: '',
                  journeyImage: null,
                  journeyImageAlt: '',
                  journeyImageUrl: '',
                },
              ],
      };
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to safely create object URL
  const createSafeObjectURL = (file: File | null): string | null => {
    if (file && file instanceof File) {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return null;
      }
    }
    return null;
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Validate Basic Details (Tab 0)
    const basicDetails = tabInputs['0'];
    if (
      !basicDetails.title ||
      typeof basicDetails.title !== 'string' ||
      !basicDetails.title.trim()
    ) {
      errors.push('Package title is required');
    }
    if (
      !basicDetails.days ||
      typeof basicDetails.days !== 'string' ||
      !basicDetails.days.trim()
    ) {
      errors.push('Number of days is required');
    }
    if (
      !basicDetails.nights ||
      typeof basicDetails.nights !== 'string' ||
      !basicDetails.nights.trim()
    ) {
      errors.push('Number of nights is required');
    }
    if (
      !basicDetails.destinations ||
      typeof basicDetails.destinations !== 'string' ||
      !basicDetails.destinations.trim()
    ) {
      errors.push('Number of destinations is required');
    }

    // Validate that numeric fields are positive
    const days = parseInt(basicDetails.days);
    const nights = parseInt(basicDetails.nights);
    const destinations = parseInt(basicDetails.destinations);
    const avgReview = parseFloat(basicDetails.avgReview);
    const totalReviewers = parseInt(basicDetails.totalReviewers);

    if (days < 0 || nights < 0 || destinations < 0 || totalReviewers < 0) {
      errors.push(
        'Days, nights, destinations, and total reviewers must be 0 or positive numbers'
      );
    }

    // Validate average review is between 1 and 5
    if (avgReview < 1 || avgReview > 5) {
      errors.push('Average review rate must be between 1 and 5 stars');
    }
    if (
      !basicDetails.location ||
      typeof basicDetails.location !== 'string' ||
      !basicDetails.location.trim()
    ) {
      errors.push('Location is required');
    }

    // Validate Instruction page fields (Tab 1)
    const instructionDetails = tabInputs['1'];
    if (
      instructionDetails.numSections &&
      typeof instructionDetails.numSections === 'string' &&
      instructionDetails.numSections.trim()
    ) {
      const numSections = parseInt(instructionDetails.numSections);
      if (numSections < 0) {
        errors.push('Number of sections must be 0 or positive');
      }
    }

    // Validate Services (Tab 2)
    const services = tabInputs['2'];
    if (
      !services.included.length ||
      services.included.every(s => !s || typeof s !== 'string' || !s.trim())
    ) {
      errors.push('At least one included service is required');
    }
    if (
      !services.excluded.length ||
      services.excluded.every(s => !s || typeof s !== 'string' || !s.trim())
    ) {
      errors.push('At least one excluded service is required');
    }

    // Validate Itineraries (Tab 3)
    const itineraries = tabInputs['3'];
    if (!itineraries.days.length) {
      errors.push('At least one day is required');
    } else {
      itineraries.days.forEach((day, index) => {
        if (!day.title || typeof day.title !== 'string' || !day.title.trim()) {
          errors.push(`Day ${index + 1} title is required`);
        }
        if (
          !day.description ||
          typeof day.description !== 'string' ||
          !day.description.trim()
        ) {
          errors.push(`Day ${index + 1} description is required`);
        }
        if (
          !day.activity ||
          typeof day.activity !== 'string' ||
          !day.activity.trim()
        ) {
          errors.push(`Day ${index + 1} activity is required`);
        }
        // Validate highlights
        const highlights = day.highlights || [];
        if (!Array.isArray(highlights) || highlights.length === 0) {
          errors.push(`Day ${index + 1} must have at least one highlight`);
        } else {
          const validHighlights = highlights.filter(
            h => h && typeof h === 'string' && h.trim()
          );
          if (validHighlights.length === 0) {
            errors.push(
              `Day ${index + 1} must have at least one valid highlight`
            );
          }
        }
      });
    }

    // Validate Locations (Tab 4)
    const locations = tabInputs['4'];
    if (!locations.locations.length)
      errors.push('At least one location is required');
    locations.locations.forEach((location, index) => {
      if (
        !location.name ||
        typeof location.name !== 'string' ||
        !location.name.trim()
      ) {
        errors.push(`Location ${index + 1} name is required`);
      }
      if (
        !location.latitude ||
        typeof location.latitude !== 'string' ||
        !location.latitude.trim()
      ) {
        errors.push(`Location ${index + 1} latitude is required`);
      }
      if (
        !location.longitude ||
        typeof location.longitude !== 'string' ||
        !location.longitude.trim()
      ) {
        errors.push(`Location ${index + 1} longitude is required`);
      }
      if (
        !location.day ||
        typeof location.day !== 'string' ||
        !location.day.trim()
      ) {
        errors.push(`Location ${index + 1} day is required`);
      }
    });

    // Validate Pricing (Tab 5)
    const pricing = tabInputs['5'];
    if (
      !pricing.priceLeft ||
      typeof pricing.priceLeft !== 'string' ||
      !pricing.priceLeft.trim()
    ) {
      errors.push('Left price is required');
    }
    if (
      !pricing.priceRight ||
      typeof pricing.priceRight !== 'string' ||
      !pricing.priceRight.trim()
    ) {
      errors.push('Right price is required');
    }

    // Validate that prices are positive
    const priceLeft = parseFloat(pricing.priceLeft);
    const priceRight = parseFloat(pricing.priceRight);

    if (priceLeft < 0 || priceRight < 0) {
      errors.push('Prices must be 0 or positive numbers');
    }
    if (
      !pricing.currency ||
      typeof pricing.currency !== 'string' ||
      !pricing.currency.trim()
    ) {
      errors.push('Currency is required');
    }

    // Validate Accommodation Places (Tab 6)
    const accommodations = tabInputs['6'];
    if (!Array.isArray(accommodations) || !accommodations.length)
      errors.push('At least one accommodation place is required');
    if (Array.isArray(accommodations)) {
      accommodations.forEach((acc, index) => {
        if (
          !acc.sectionTitle ||
          typeof acc.sectionTitle !== 'string' ||
          !acc.sectionTitle.trim()
        ) {
          errors.push(`Accommodation ${index + 1} section title is required`);
        }
        if (
          !acc.hotelName ||
          typeof acc.hotelName !== 'string' ||
          !acc.hotelName.trim()
        ) {
          errors.push(`Accommodation ${index + 1} hotel name is required`);
        }
      });
    }

    // Validate Guidelines (Tab 7)
    const guidelines = tabInputs['7'];
    if (
      !guidelines.description ||
      typeof guidelines.description !== 'string' ||
      !guidelines.description.trim()
    ) {
      errors.push('Guidelines description is required');
    }
    if (!guidelines.faqs.length) errors.push('At least one FAQ is required');
    guidelines.faqs.forEach((faq, index) => {
      if (
        !faq.question ||
        typeof faq.question !== 'string' ||
        !faq.question.trim()
      ) {
        errors.push(`FAQ ${index + 1} question is required`);
      }
      if (!faq.answer || typeof faq.answer !== 'string' || !faq.answer.trim()) {
        errors.push(`FAQ ${index + 1} answer is required`);
      }
    });

    // Validate Reviews (Tab 8)
    const reviews = tabInputs['8'];
    if (!reviews.length) errors.push('At least one review is required');
    reviews.forEach((review, index) => {
      if (
        !review.name ||
        typeof review.name !== 'string' ||
        !review.name.trim()
      ) {
        errors.push(`Review ${index + 1} name is required`);
      }
      if (
        !review.stars ||
        typeof review.stars !== 'string' ||
        !review.stars.trim()
      ) {
        errors.push(`Review ${index + 1} stars is required`);
      }
      if (
        !review.text ||
        typeof review.text !== 'string' ||
        !review.text.trim()
      ) {
        errors.push(`Review ${index + 1} text is required`);
      }
    });

    return errors;
  };

  const handleTabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all form data
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showError(
        `Please fix the following errors:\n${validationErrors.join('\n')}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for submission
      const packageData = {
        // Basic Details
        title: tabInputs['0'].title || '',
        days: tabInputs['0'].days || '',
        nights: tabInputs['0'].nights || '',
        destinations: tabInputs['0'].destinations || '',
        avgReview: tabInputs['0'].avgReview || '',
        totalReviewers: tabInputs['0'].totalReviewers || '',
        location: tabInputs['0'].location || '',
        highlight: tabInputs['0'].highlight || false,

        // Instruction page
        instructionTitle: tabInputs['1'].title || '',
        instructionShortDescription: tabInputs['1'].shortDescription || '',
        instructionTabTitle: tabInputs['1'].tabTitle || '',
        instructionNumSections: tabInputs['1'].numSections || '',
        instructionImage1: tabInputs['1'].image1 || '',
        instructionImage1Alt: tabInputs['1'].image1Alt || '',
        instructionHeaderImageUrl: tabInputs['1'].headerImageUrl || '',
        instructionSection1Description:
          tabInputs['1'].section1Description || '',
        instructionSliderImage1: tabInputs['1'].sliderImage1 || '',
        instructionSliderImage1Alt: tabInputs['1'].sliderImage1Alt || '',
        instructionSliderImage2: tabInputs['1'].sliderImage2 || '',
        instructionSliderImage2Alt: tabInputs['1'].sliderImage2Alt || '',

        // Services
        servicesIncluded: tabInputs['2'].included || [],
        servicesExcluded: tabInputs['2'].excluded || [],

        // Itineraries
        itinerary: tabInputs['3'].days.map(day => ({
          day: parseInt(day.dayNumber) || 1,
          title: day.title || '',
          description: day.description || '',
          highlights: day.highlights || [],
          activity: day.activity || '',
        })),

        // Locations
        locations: tabInputs['4'].locations || [],

        // Pricing
        priceLeft: tabInputs['5'].priceLeft || '',
        priceRight: tabInputs['5'].priceRight || '',
        currency: tabInputs['5'].currency || '',
        priceHighlight: tabInputs['5'].highlight || false,

        // Accommodation Places
        accommodationPlaces: tabInputs['6'].map(acc => ({
          sectionTitle: acc.sectionTitle || '',
          hotelName: acc.hotelName || '',
          shareableLink: acc.shareableLink || '',
          latitude: acc.latitude || '',
          longitude: acc.longitude || '',
          description: acc.description || '',
          image1: acc.image1Url || '',
          image1Alt: acc.image1Alt || '',
          headerImage: acc.headerImageUrl || '',
          headerImageAlt: acc.headerImageAlt || '',
        })),

        // Guidelines
        guidelinesDescription: tabInputs['7'].description || '',
        guidelinesFaqs: tabInputs['7'].faqs || [],

        // Reviews
        packageReviews: tabInputs['8'].map(review => ({
          name: review.name || '',
          stars: review.stars || '',
          text: review.text || '',
          source: review.source || '',
          sourceLink: review.sourceLink || '',
          faceImage: review.faceImage || '',
          faceImageAlt: review.faceImageAlt || '',
          faceImageUrl: review.faceImageUrl || '',
          journeyImage: review.journeyImage || '',
          journeyImageAlt: review.journeyImageAlt || '',
          journeyImageUrl: review.journeyImageUrl || '',
        })),

        // Required fields with defaults
        id: `package_${Date.now()}`,
        name: tabInputs['0'].title || '',
        image: '',
        summery: tabInputs['0'].title || '',
        duration: `${tabInputs['0'].days || ''} days`,
        type: 'tour',
        mini_discription: tabInputs['0'].title || '',
        description: tabInputs['0'].title || '',
        highlights: tabInputs['0'].highlight ? [tabInputs['0'].highlight] : [],
        inclusions: tabInputs['2'].included || [],
        exclusions: tabInputs['2'].excluded || [],
        images: [],
        images2: '',
        // Save instruction images from multipleImages state
        instructionSliderImages: multipleImages
          .map((url, index) => ({
            url: url,
            alt: multipleImageAlts[index] || '',
            uploaded: true,
          }))
          .filter(img => img.url && img.url.trim() !== ''),
        category: isEditing
          ? sessionStorage.getItem('editingPackageCategory') ||
            categoryFromUrl ||
            '65f1a2b3c4d5e6f7a8b9c0d1'
          : '65f1a2b3c4d5e6f7a8b9c0d1', // Preserve category when editing
        published: true,
      };

      console.log('Submitting package data:', packageData);

      // Debug accommodation places data
      console.log(
        'Accommodation places being sent:',
        packageData.accommodationPlaces
      );

      const url =
        isEditing && packageId ? `/api/packages/${packageId}` : '/api/packages';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        body: packageData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Failed to ${isEditing ? 'update' : 'create'} package`
        );
      }

      showSuccess(`Package ${isEditing ? 'updated' : 'created'} successfully!`);
      console.log(`Package ${isEditing ? 'updated' : 'created'}:`, result);

      // Clean up sessionStorage after successful submission
      if (isEditing) {
        sessionStorage.removeItem('editingPackageCategory');
      }

      // Reset form after successful submission
      setTimeout(() => {
        // If we came from a category page, redirect back to that category
        if (categoryFromUrl) {
          window.location.href = `/admin/packages/category/${categoryFromUrl}`;
        } else {
          window.location.href = '/admin/packages';
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error creating package:', error);
      showError(error.message || 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft functionality
  const handleSaveAsDraft = async (e?: React.MouseEvent) => {
    console.log('Save as Draft clicked - bypassing all validation');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSubmitting(true);

    try {
      // Prepare the data for draft submission (no validation required)
      // Save whatever data is available, even if fields are empty
      const packageData = {
        // Basic Details
        title: tabInputs['0'].title || '',
        days: tabInputs['0'].days || '',
        nights: tabInputs['0'].nights || '',
        destinations: tabInputs['0'].destinations || '',
        avgReview: tabInputs['0'].avgReview || '',
        totalReviewers: tabInputs['0'].totalReviewers || '',
        location: tabInputs['0'].location || '',
        highlight: tabInputs['0'].highlight || false,

        // Instruction page
        instructionTitle: tabInputs['1'].title || '',
        instructionShortDescription: tabInputs['1'].shortDescription || '',
        instructionTabTitle: tabInputs['1'].tabTitle || '',
        instructionNumSections: tabInputs['1'].numSections || '',
        instructionImage1: tabInputs['1'].image1 || '',
        instructionImage1Alt: tabInputs['1'].image1Alt || '',
        instructionHeaderImageUrl: tabInputs['1'].headerImageUrl || '',
        instructionSection1Description:
          tabInputs['1'].section1Description || '',
        instructionSliderImage1: tabInputs['1'].sliderImage1 || '',
        instructionSliderImage1Alt: tabInputs['1'].sliderImage1Alt || '',
        instructionSliderImage2: tabInputs['1'].sliderImage2 || '',
        instructionSliderImage2Alt: tabInputs['1'].sliderImage2Alt || '',

        // Services
        servicesIncluded: tabInputs['2'].included || [],
        servicesExcluded: tabInputs['2'].excluded || [],

        // Itineraries
        itinerary: tabInputs['3'].days.map(day => ({
          day: parseInt(day.dayNumber) || 1,
          title: day.title || '',
          description: day.description || '',
          highlights: day.highlights || [],
          activity: day.activity || '',
        })),

        // Locations
        locations: tabInputs['4'].locations || [],

        // Pricing
        priceLeft: tabInputs['5'].priceLeft || '',
        priceRight: tabInputs['5'].priceRight || '',
        currency: tabInputs['5'].currency || '',
        priceHighlight: tabInputs['5'].highlight || false,

        // Accommodation Places
        accommodationPlaces: tabInputs['6'].map(acc => ({
          sectionTitle: acc.sectionTitle || '',
          hotelName: acc.hotelName || '',
          shareableLink: acc.shareableLink || '',
          latitude: acc.latitude || '',
          longitude: acc.longitude || '',
          description: acc.description || '',
          image1: acc.image1Url || '',
          image1Alt: acc.image1Alt || '',
          headerImage: acc.headerImageUrl || '',
          headerImageAlt: acc.headerImageAlt || '',
        })),

        // Guidelines
        guidelinesDescription: tabInputs['7'].description || '',
        guidelinesFaqs: tabInputs['7'].faqs || [],

        // Reviews
        packageReviews: tabInputs['8'].map(review => ({
          name: review.name || '',
          stars: review.stars || '',
          text: review.text || '',
          source: review.source || '',
          sourceLink: review.sourceLink || '',
          faceImage: review.faceImage || '',
          faceImageAlt: review.faceImageAlt || '',
          faceImageUrl: review.faceImageUrl || '',
          journeyImage: review.journeyImage || '',
          journeyImageAlt: review.journeyImageAlt || '',
          journeyImageUrl: review.journeyImageUrl || '',
        })),

        // Required fields with defaults
        id: isEditing && packageId ? packageId : `package_${Date.now()}`,
        name: tabInputs['0'].title || '',
        image: '',
        summery: tabInputs['0'].title || '',
        duration: `${tabInputs['0'].days || ''} days`,
        type: 'tour',
        mini_discription: tabInputs['0'].title || '',
        description: tabInputs['0'].title || '',
        highlights: tabInputs['0'].highlight ? [tabInputs['0'].highlight] : [],
        inclusions: tabInputs['2'].included || [],
        exclusions: tabInputs['2'].excluded || [],
        images: [],
        images2: '',
        // Save instruction images from multipleImages state
        instructionSliderImages: multipleImages
          .map((url, index) => ({
            url: url,
            alt: multipleImageAlts[index] || '',
            uploaded: true,
          }))
          .filter(img => img.url && img.url.trim() !== ''),
        category: isEditing
          ? sessionStorage.getItem('editingPackageCategory') ||
            categoryFromUrl ||
            '65f1a2b3c4d5e6f7a8b9c0d1'
          : '65f1a2b3c4d5e6f7a8b9c0d1', // Preserve category when editing
        published: false, // Draft packages are not published
        isDraft: true, // Flag to indicate this is a draft save
      };

      console.log('Saving package as draft:', packageData);

      const url =
        isEditing && packageId ? `/api/packages/${packageId}` : '/api/packages';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        body: packageData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to save package as draft`);
      }

      showSuccess('Package saved as draft successfully!');
      console.log('Package saved as draft:', result);

      // Clean up sessionStorage after successful draft save
      if (isEditing) {
        sessionStorage.removeItem('editingPackageCategory');
      }
    } catch (error: any) {
      console.error('Error saving package as draft:', error);
      showError(error.message || 'Failed to save package as draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load existing package data when editing
  useEffect(() => {
    if (isEditing && packageId) {
      const loadPackageData = async () => {
        try {
          const response = await apiRequest(`/api/packages/${packageId}`);
          if (response.ok) {
            const data = await response.json();
            const packageData = data.package;

            // Store the original category for preservation
            if (packageData.category) {
              // Store category in sessionStorage to preserve it during form submission
              sessionStorage.setItem(
                'editingPackageCategory',
                packageData.category
              );
            } else if (categoryFromUrl) {
              // If no category in package data but category is in URL, use that
              sessionStorage.setItem('editingPackageCategory', categoryFromUrl);
            }

            // Populate form with existing data
            setTabInputs({
              '0': {
                title: packageData.title || '',
                days: packageData.days || '',
                nights: packageData.nights || '',
                destinations: packageData.destinations || '',
                avgReview: packageData.avgReview || '',
                totalReviewers: packageData.totalReviewers || '',
                location: packageData.location || '',
                highlight: packageData.highlight || false,
              },
              '1': {
                title: packageData.instructionTitle || '',
                shortDescription: packageData.instructionShortDescription || '',
                tabTitle: packageData.instructionTabTitle || '',
                numSections: packageData.instructionNumSections || '',
                image1: packageData.instructionImage1 || '',
                image1Url: packageData.instructionImage1 || '', // Add URL field for display
                image1Alt: packageData.instructionImage1Alt || '',
                headerImageUrl: packageData.instructionHeaderImageUrl || '',
                section1Description:
                  packageData.instructionSection1Description || '',
                sliderImage1: packageData.instructionSliderImage1 || '',
                sliderImage1Alt: packageData.instructionSliderImage1Alt || '',
                sliderImage2: packageData.instructionSliderImage2 || '',
                sliderImage2Alt: packageData.instructionSliderImage2Alt || '',
                // Load existing slider images into the new array format
                sliderImages: (() => {
                  const images = [];

                  // First check for new array format
                  if (
                    packageData.instructionSliderImages &&
                    Array.isArray(packageData.instructionSliderImages)
                  ) {
                    return packageData.instructionSliderImages.map(
                      (img: any) => ({
                        file: null,
                        url: img.url,
                        alt: img.alt || '',
                        uploaded: img.uploaded || true,
                      })
                    );
                  }

                  // Fallback to old individual fields for backward compatibility
                  if (packageData.instructionSliderImage1) {
                    images.push({
                      file: null,
                      url: packageData.instructionSliderImage1,
                      alt: packageData.instructionSliderImage1Alt || '',
                      uploaded: true,
                    });
                  }
                  if (packageData.instructionSliderImage2) {
                    images.push({
                      file: null,
                      url: packageData.instructionSliderImage2,
                      alt: packageData.instructionSliderImage2Alt || '',
                      uploaded: true,
                    });
                  }
                  return images;
                })(),
              },
              '2': {
                included: packageData.servicesIncluded?.length
                  ? packageData.servicesIncluded
                  : [''],
                excluded: packageData.servicesExcluded?.length
                  ? packageData.servicesExcluded
                  : [''],
              },
              '3': {
                itinerary: packageData.itinerary || '',
                days: packageData.itinerary?.length
                  ? packageData.itinerary.map((day: any) => ({
                      dayNumber: day.day?.toString() || '1',
                      title: day.title || '',
                      description: day.description || '',
                      activity: day.activity || '',
                      highlights: day.highlights || [''],
                      isExpanded: false,
                    }))
                  : [
                      {
                        dayNumber: '1',
                        title: '',
                        description: '',
                        activity: '',
                        highlights: [''],
                        isExpanded: false,
                      },
                    ],
              },
              '4': {
                locations: packageData.locations?.length
                  ? packageData.locations
                  : [{ name: '', latitude: '', longitude: '', day: '' }],
              },
              '5': {
                priceLeft: packageData.priceLeft || '',
                priceRight: packageData.priceRight || '',
                currency: packageData.currency || '',
                highlight: packageData.priceHighlight || false,
              },
              '6': packageData.accommodationPlaces?.length
                ? packageData.accommodationPlaces.map((acc: any) => ({
                    sectionTitle: acc.sectionTitle || '1 Day Night',
                    hotelName: acc.hotelName || '',
                    shareableLink: acc.shareableLink || '',
                    latitude: acc.latitude || '',
                    longitude: acc.longitude || '',
                    description: acc.description || '',
                    image1: null, // Keep as null for File upload, but we need to track the URL separately
                    image1Alt: acc.image1Alt || '',
                    image1Url: acc.image1 || '', // Store the URL from database
                    headerImage: null, // Keep as null for File upload
                    headerImageAlt: acc.headerImageAlt || '',
                    headerImageUrl: acc.headerImage || '', // Store the URL from database
                  }))
                : [
                    {
                      sectionTitle: '1 Day Night',
                      hotelName: '',
                      shareableLink: '',
                      latitude: '',
                      longitude: '',
                      description: '',
                      image1: null,
                      image1Alt: '',
                      image1Url: '',
                      headerImage: null,
                      headerImageAlt: '',
                      headerImageUrl: '',
                    },
                  ],
              '7': {
                description: packageData.guidelinesDescription || '',
                faqs: packageData.guidelinesFaqs?.length
                  ? packageData.guidelinesFaqs
                  : [{ question: '', answer: '' }],
              },
              '8': packageData.packageReviews?.length
                ? packageData.packageReviews.map((review: any) => ({
                    name: review.name || '',
                    stars: review.stars || '',
                    text: review.text || '',
                    source: review.source || '',
                    sourceLink: review.sourceLink || '',
                    faceImage: null,
                    faceImageAlt: review.faceImageAlt || '',
                    faceImageUrl: review.faceImageUrl || '',
                    journeyImage: null,
                    journeyImageAlt: review.journeyImageAlt || '',
                    journeyImageUrl: review.journeyImageUrl || '',
                  }))
                : [
                    {
                      name: '',
                      stars: '',
                      text: '',
                      source: '',
                      sourceLink: '',
                      faceImage: null,
                      faceImageAlt: '',
                      faceImageUrl: '',
                      journeyImage: null,
                      journeyImageAlt: '',
                      journeyImageUrl: '',
                    },
                  ],
            });

            // Load instruction images into multipleImages state for UI display
            if (
              packageData.instructionSliderImages &&
              Array.isArray(packageData.instructionSliderImages)
            ) {
              const instructionUrls = packageData.instructionSliderImages.map(
                (img: any) => img.url
              );
              const instructionAlts = packageData.instructionSliderImages.map(
                (img: any) => img.alt || ''
              );
              setMultipleImages(instructionUrls);
              setMultipleImageAlts(instructionAlts);
            } else {
              // Fallback to old individual fields
              const instructionUrls: string[] = [];
              const instructionAlts: string[] = [];
              if (packageData.instructionSliderImage1) {
                instructionUrls.push(packageData.instructionSliderImage1);
                instructionAlts.push(
                  packageData.instructionSliderImage1Alt || ''
                );
              }
              if (packageData.instructionSliderImage2) {
                instructionUrls.push(packageData.instructionSliderImage2);
                instructionAlts.push(
                  packageData.instructionSliderImage2Alt || ''
                );
              }
              setMultipleImages(instructionUrls);
              setMultipleImageAlts(instructionAlts);
            }
          }
        } catch (error) {
          console.error('Error loading package data:', error);
          showError('Failed to load package data');
        } finally {
          setIsLoading(false);
        }
      };

      loadPackageData();
    }
  }, [isEditing, packageId, categoryFromUrl, showError]);

  // Cleanup effect to remove sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      if (isEditing) {
        sessionStorage.removeItem('editingPackageCategory');
      }
    };
  }, [isEditing]);

  // Image upload handler for Firebase Storage
  const handleImageUpload = async (
    file: File,
    field: string,
    tabIndex: number,
    altField?: string,
    reviewIndex?: number, // Add this parameter
    accommodationIndex?: number // Add accommodation index parameter
  ) => {
    console.log('handleImageUpload called with:', {
      file,
      field,
      tabIndex,
      altField,
    });

    if (!file) {
      console.log('No file provided to handleImageUpload');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size too large. Maximum size is 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      // Determine image type based on tab and field
      let imageType = 'instruction';
      if (tabIndex === 6) {
        imageType = 'accommodation';
      } else if (tabIndex === 8) {
        imageType = 'review';
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('files', file); // Changed from 'file' to 'files'
      formData.append(
        'packageId',
        isEditing && packageId ? packageId : `temp_${Date.now()}`
      );
      formData.append('imageType', imageType);
      formData.append('altTexts', file.name.replace(/\.[^/.]+$/, ''));

      // Add review index if provided
      if (reviewIndex !== undefined) {
        formData.append('reviewIndex', reviewIndex.toString());
      }

      // Add accommodation index if provided
      if (accommodationIndex !== undefined) {
        formData.append('accommodationIndex', accommodationIndex.toString());
      }

      // Debug FormData contents
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log('About to send request to:', '/api/packages/upload-images');

      // Get user context for authentication
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User data from localStorage:', user);

      const headers: HeadersInit = {
        'x-user-id': user.id || '',
        'x-user-email': user.email || '',
        'x-root-user-id': user.rootUserId || user.id || '', // Use rootUserId or fallback to id
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      console.log('Request headers:', headers);

      console.log('Uploading image:', {
        fileName: file.name,
        size: file.size,
        field,
        tabIndex,
        imageType,
        hasFile: !!file,
        fileType: file.type,
      });

      const response = await fetch('/api/packages/upload-images', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      console.log('Upload successful:', data);

      // Update the form state with the uploaded URL
      if (data.images && data.images.length > 0) {
        const uploadedImage = data.images[0];

        // For tab 8 (reviews), use handleReviewChange instead of handleTabInputChange
        if (tabIndex === 8 && reviewIndex !== undefined) {
          // Update the main field with the URL
          handleReviewChange(
            reviewIndex,
            field as keyof Review,
            uploadedImage.url
          );

          // Also update the URL field for display
          const urlField = `${field}Url` as keyof Review;
          handleReviewChange(reviewIndex, urlField, uploadedImage.url);

          // Update alt text if provided
          if (altField) {
            handleReviewChange(
              reviewIndex,
              altField as keyof Review,
              uploadedImage.alt
            );
          }
        } else if (tabIndex === 6 && accommodationIndex !== undefined) {
          // For accommodation tab, use handleAccommodationChange
          handleAccommodationChange(
            accommodationIndex,
            field as keyof AccommodationPlace,
            uploadedImage.url
          );

          // Also update the URL field for display
          const urlField = `${field}Url` as keyof AccommodationPlace;
          handleAccommodationChange(
            accommodationIndex,
            urlField,
            uploadedImage.url
          );

          // Update alt text if provided
          if (altField) {
            handleAccommodationChange(
              accommodationIndex,
              altField as keyof AccommodationPlace,
              uploadedImage.alt
            );
          }
        } else {
          // For other tabs, use handleTabInputChange
          handleTabInputChange(tabIndex, field, uploadedImage.url);

          // Also update the URL field for display
          const urlField = `${field}Url`;
          handleTabInputChange(tabIndex, urlField, uploadedImage.url);

          // Update alt text if provided
          if (altField) {
            handleTabInputChange(tabIndex, altField, uploadedImage.alt);
          }
        }

        // Show success message
        setUploadError(null);
        setTimeout(() => {
          alert('Image uploaded successfully!');
        }, 500);

        console.log(`Image uploaded successfully: ${uploadedImage.url}`);
      }

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced file input handler that triggers upload
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    tabIndex: number,
    altField?: string,
    accommodationIndex?: number
  ) => {
    const file = e.target.files?.[0];
    console.log('File input change triggered:', {
      file,
      field,
      tabIndex,
      altField,
    });

    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // First, update the form state with the file for immediate feedback
    if (tabIndex === 8) {
      // For reviews, we need to handle this differently since we don't have the review index here
      // The file will be updated in the onChange handler of the input
      console.log('File selected for review tab, will be handled in onChange');
    } else {
      handleTabInputChange(tabIndex, field, file);
    }

    // Then upload to Firebase Storage
    console.log('Starting Firebase upload...');
    await handleImageUpload(
      file,
      field,
      tabIndex,
      altField,
      undefined,
      accommodationIndex
    );
  };

  // Multiple slider images upload handler
  const handleMultipleSliderUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    console.log('Multiple slider upload triggered:', files.length, 'files');

    if (files.length === 0) {
      console.log('No files selected');
      return;
    }

    // Initialize sliderImages array if it doesn't exist
    const currentSliderImages = Array.isArray(tabInputs['1'].sliderImages)
      ? tabInputs['1'].sliderImages
      : [];

    // Add new files to the array
    const newSliderImages = files.map(file => ({
      file,
      url: null,
      alt: '',
      uploaded: false,
    }));

    // Update form state with new images
    handleTabInputChange(1, 'sliderImages', [
      ...currentSliderImages,
      ...newSliderImages,
    ]);

    // Upload all files together in a single request
    try {
      console.log(`Uploading ${files.length} slider images together`);

      // Create FormData for upload
      const formData = new FormData();

      // Add all files to FormData
      files.forEach(file => {
        formData.append('files', file);
      });

      formData.append(
        'packageId',
        isEditing && packageId ? packageId : `temp_${Date.now()}`
      );
      formData.append('imageType', 'instruction');

      // Add alt texts for all files
      files.forEach(file => {
        formData.append('altTexts', file.name.replace(/\.[^/.]+$/, ''));
      });

      // Get user context for authentication
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers: HeadersInit = {
        'x-user-id': user.id || '',
        'x-user-email': user.email || '',
        'x-root-user-id': user.rootUserId || user.id || '',
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      const response = await fetch('/api/packages/upload-images', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      console.log('Slider images upload successful:', data);

      // Update the form state with the uploaded URLs
      const uploadedImages = data.images || [];
      const updatedSliderImages = uploadedImages.map(
        (img: any, index: number) => ({
          file: files[index],
          url: img.url,
          alt: img.alt || '',
          uploaded: true,
        })
      );

      // Keep existing images and add new ones
      const existingImages = Array.isArray(tabInputs['1'].sliderImages)
        ? tabInputs['1'].sliderImages.filter(img => img.uploaded)
        : [];

      const allSliderImages = [...existingImages, ...updatedSliderImages];

      console.log('All slider images after upload:', allSliderImages);

      handleTabInputChange(1, 'sliderImages', allSliderImages);
    } catch (error) {
      console.error('Failed to upload slider images:', error);
      // You might want to show an error message to the user here
    }
  };

  // Handler for updating slider image alt text
  const handleSliderImageAltChange = (index: number, altText: string) => {
    const currentImages = Array.isArray(tabInputs['1'].sliderImages)
      ? tabInputs['1'].sliderImages
      : [];
    const updatedSliderImages = [...currentImages];
    if (updatedSliderImages[index]) {
      updatedSliderImages[index] = {
        ...updatedSliderImages[index],
        alt: altText,
      };
      handleTabInputChange(1, 'sliderImages', updatedSliderImages);
    }
  };

  // Multiple image handlers (like destinations page)
  const handleMultipleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showError('Please select only valid image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('Each image must be less than 5MB');
        return;
      }
    }

    try {
      setIsUploadingMultiple(true);

      // Create previews for all files
      const previews: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const preview = await new Promise<string>(resolve => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previews.push(preview);
      }

      // Add new files and previews
      setMultipleImageFiles(prev => [...prev, ...files]);
      setMultipleImagePreviews(prev => [...prev, ...previews]);
      setMultipleImageAlts(prev => [...prev, ...Array(files.length).fill('')]);

      // Upload files to Firebase
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('packageId', packageId || `temp_${Date.now()}`);
      formData.append('imageType', 'instruction');

      // Add alt texts for all files
      files.forEach(file => {
        formData.append('altTexts', file.name.replace(/\.[^/.]+$/, ''));
      });

      // Get user context for authentication
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers: HeadersInit = {
        'x-user-id': user.id || '',
        'x-user-email': user.email || '',
        'x-root-user-id': user.rootUserId || user.id || '',
      };

      if (user.companyId) {
        headers['x-company-id'] = user.companyId;
      }

      const response = await fetch('/api/packages/upload-images', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      console.log('Multiple images upload successful:', data);

      // Update multipleImages with the uploaded URLs
      const uploadedUrls = data.images.map((img: any) => img.url);
      setMultipleImages(prev => [...prev, ...uploadedUrls]);

      // Save the updated images to MongoDB immediately
      if (packageId) {
        const updatedImages = [...multipleImages, ...uploadedUrls];
        const imageUrls = updatedImages.filter(url => url && url.trim() !== '');

        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const headers: HeadersInit = {
            'x-user-id': user.id || '',
            'x-user-email': user.email || '',
            'x-root-user-id': user.rootUserId || user.id || '',
            'Content-Type': 'application/json',
          };
          if (user.companyId) headers['x-company-id'] = user.companyId;

          const res = await fetch('/api/packages/add-slider-images', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              packageId,
              imageUrls,
              imageAlts: multipleImageAlts.filter(
                (alt, idx) =>
                  updatedImages[idx] && updatedImages[idx].trim() !== ''
              ),
            }),
          });
          const saveData = await res.json();
          if (!saveData.success) {
            console.error('Failed to save images to MongoDB:', saveData.error);
          }
        } catch (err: any) {
          console.error('Error saving images to MongoDB:', err.message);
        }
      }

      // Clear the file input
      if (multipleFileInputRef.current) {
        multipleFileInputRef.current.value = '';
      }
    } catch (err: any) {
      showError('Failed to upload images: ' + err.message);
    } finally {
      setIsUploadingMultiple(false);
    }
  };

  const removeMultipleImage = (index: number) => {
    setMultipleImageFiles(prev => prev.filter((_, i) => i !== index));
    setMultipleImagePreviews(prev => prev.filter((_, i) => i !== index));
    setMultipleImageAlts(prev => prev.filter((_, i) => i !== index));
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateMultipleImageAlt = async (index: number, alt: string) => {
    setMultipleImageAlts(prev =>
      prev.map((item, i) => (i === index ? alt : item))
    );

    // Update MongoDB with the new alt text
    if (packageId) {
      const imageUrls = multipleImages.filter(url => url && url.trim() !== '');

      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const headers: HeadersInit = {
          'x-user-id': user.id || '',
          'x-user-email': user.email || '',
          'x-root-user-id': user.rootUserId || user.id || '',
          'Content-Type': 'application/json',
        };
        if (user.companyId) headers['x-company-id'] = user.companyId;

        const res = await fetch('/api/packages/add-slider-images', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            packageId,
            imageUrls,
            imageAlts: multipleImageAlts.filter(
              (alt, idx) =>
                multipleImages[idx] && multipleImages[idx].trim() !== ''
            ),
          }),
        });
        const saveData = await res.json();
        if (!saveData.success) {
          console.error(
            'Failed to update alt text in MongoDB:',
            saveData.error
          );
        }
      } catch (err: any) {
        console.error('Error updating alt text in MongoDB:', err.message);
      }
    }
  };

  const addMultipleImageUrl = () => {
    setMultipleImages(prev => [...prev, '']);
    setMultipleImageAlts(prev => [...prev, '']);
  };

  const updateMultipleImageUrl = (index: number, url: string) => {
    setMultipleImages(prev =>
      prev.map((item, i) => (i === index ? url : item))
    );
  };

  const removeMultipleImageUrlWithCleanup = async (index: number) => {
    const urlToRemove = multipleImages[index];
    if (urlToRemove && urlToRemove.trim() !== '') {
      setRemovedMultipleImages(prev => [...prev, urlToRemove]);
    }
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
    setMultipleImageAlts(prev => prev.filter((_, i) => i !== index));

    // Update MongoDB with the remaining images
    if (packageId) {
      const remainingImages = multipleImages.filter((_, i) => i !== index);
      const imageUrls = remainingImages.filter(url => url && url.trim() !== '');

      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const headers: HeadersInit = {
          'x-user-id': user.id || '',
          'x-user-email': user.email || '',
          'x-root-user-id': user.rootUserId || user.id || '',
          'Content-Type': 'application/json',
        };
        if (user.companyId) headers['x-company-id'] = user.companyId;

        const res = await fetch('/api/packages/add-slider-images', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            packageId,
            imageUrls,
            imageAlts: multipleImageAlts.filter(
              (alt, idx) =>
                remainingImages[idx] && remainingImages[idx].trim() !== ''
            ),
          }),
        });
        const saveData = await res.json();
        if (!saveData.success) {
          console.error('Failed to update images in MongoDB:', saveData.error);
        }
      } catch (err: any) {
        console.error('Error updating images in MongoDB:', err.message);
      }
    }
  };

  const saveSliderImagesToMongo = async () => {
    if (!packageId) return;
    // Compose the array of { url, alt, uploaded }
    const sliderImages = multipleImages
      .map((url, i) =>
        url && url.trim()
          ? { url, alt: multipleImageAlts[i] || '', uploaded: true }
          : null
      )
      .filter(Boolean);

    try {
      setIsUploadingMultiple(true);
      showError('');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers: HeadersInit = {
        'x-user-id': user.id || '',
        'x-user-email': user.email || '',
        'x-root-user-id': user.rootUserId || user.id || '',
        'Content-Type': 'application/json',
      };
      if (user.companyId) headers['x-company-id'] = user.companyId;

      const res = await fetch('/api/packages/add-slider-images', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          packageId,
          imageUrls: multipleImages.filter(url => url && url.trim() !== ''),
          imageAlts: multipleImageAlts.filter(
            (alt, idx) =>
              multipleImages[idx] && multipleImages[idx].trim() !== ''
          ),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Slider images saved!');
        // Optionally, reload or fetch the latest images from backend
      } else {
        showError(data.error || 'Failed to save images');
      }
    } catch (err: any) {
      showError('Failed to save images: ' + err.message);
    } finally {
      setIsUploadingMultiple(false);
    }
  };

  const handleDeleteImage = async (
    reviewIndex: number,
    imageType: 'faceImage' | 'journeyImage'
  ) => {
    try {
      const review = tabInputs['8'][reviewIndex];
      const imageUrl = review[`${imageType}Url`];

      if (imageUrl) {
        // Delete from Firebase Storage
        const response = await fetch(
          `/api/packages/upload-images?path=${encodeURIComponent(imageUrl)}&packageId=${packageId}&imageType=review&fieldPath=packageReviews.${reviewIndex}.${imageType}Url`,
          {
            method: 'DELETE',
            headers: {
              'x-user-id': user?.id || '',
              'x-user-email': user?.email || '',
              'x-root-user-id': user?.rootUserId || user?.id || '',
            },
          }
        );

        if (response.ok) {
          // Clear the image from form state
          handleReviewChange(reviewIndex, imageType, null);
          handleReviewChange(reviewIndex, `${imageType}Url`, '');
          handleReviewChange(reviewIndex, `${imageType}Alt`, '');
          showSuccess('Image deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showError('Failed to delete image');
    }
  };

  const handleDeleteAccommodationImage = async (
    accommodationIndex: number,
    imageType: 'image1' | 'headerImage'
  ) => {
    try {
      const accommodation = tabInputs['6'][accommodationIndex];
      const imageUrl = accommodation[`${imageType}Url`];

      if (imageUrl) {
        // Delete from Firebase Storage
        const response = await fetch(
          `/api/packages/upload-images?path=${encodeURIComponent(imageUrl)}&packageId=${packageId}&imageType=accommodation&fieldPath=accommodationPlaces.${accommodationIndex}.${imageType}Url`,
          {
            method: 'DELETE',
            headers: {
              'x-user-id': user?.id || '',
              'x-user-email': user?.email || '',
              'x-root-user-id': user?.rootUserId || user?.id || '',
            },
          }
        );

        if (response.ok) {
          // Clear the image from form state
          handleAccommodationChange(accommodationIndex, imageType, null);
          handleAccommodationChange(accommodationIndex, `${imageType}Url`, '');
          handleAccommodationChange(accommodationIndex, `${imageType}Alt`, '');
          showSuccess('Image deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting accommodation image:', error);
      showError('Failed to delete image');
    }
  };

  return (
    <AdminLayout>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      {/* Modern Responsive Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 24,
          padding: '16px 24px 0 24px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Home Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: '#2563eb',
            borderRadius: '8px',
            marginRight: '12px',
            flexShrink: 0,
          }}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M9 22V12H15V22'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>

        {/* Breadcrumb Items */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          {/* Chevron */}
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            style={{ flexShrink: 0 }}
          >
            <path
              d='M9 18L15 12L9 6'
              stroke='#9ca3af'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>

          <span
            style={{
              color: '#000000',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'color 0.2s',
              fontFamily: 'sans-serif',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1d4ed8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#000000')}
            onClick={() => router.push('/admin/packages')}
          >
            Packages
          </span>

          {/* Chevron */}
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            style={{ flexShrink: 0 }}
          >
            <path
              d='M9 18L15 12L9 6'
              stroke='#9ca3af'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>

          <span
            style={{
              color: '#374151',
              fontWeight: '600',
              fontFamily: 'sans-serif',
            }}
          >
            {isEditing ? 'Edit Package' : 'Add Package'}
          </span>

          {isEditing && (
            <>
              {/* Chevron */}
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                style={{ flexShrink: 0 }}
              >
                <path
                  d='M9 18L15 12L9 6'
                  stroke='#9ca3af'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>

              <span
                style={{
                  color: '#374151',
                  fontWeight: '600',
                  fontFamily: 'sans-serif',
                }}
              >
                {tabInputs['0']?.title || 'Loading...'}
              </span>
            </>
          )}
        </div>
      </div>
      <div className='add-package-page'>
        <div className='page-header'>
          <div className='header-content'>
            <h1
              className='page-title'
              style={{ color: '#111', fontSize: '1.1rem', fontWeight: 600 }}
            >
              {isEditing ? 'Edit Package' : 'Add New Package'}
            </h1>
            <p className='page-description' style={{ color: '#111' }}>
              {isEditing
                ? 'Update the tour package with all the necessary details, itinerary, and images.'
                : 'Create a new tour package with all the necessary details, itinerary, and images.'}
            </p>
          </div>
        </div>
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '2rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none' /* Firefox */,
            msOverflowStyle: 'none' /* IE and Edge */,
            WebkitOverflowScrolling: 'touch' /* iOS smooth scrolling */,
          }}
          className='tab-navigation'
        >
          {tabList.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px 6px 0 0',
                background: activeTab === idx ? '#2563eb' : '#f3f4f6',
                color: activeTab === idx ? '#fff' : '#2563eb',
                fontWeight: 500,
                fontSize: '15px',
                cursor: 'pointer',
                outline: 'none',
                boxShadow:
                  activeTab === idx ? '0 2px 8px rgba(37,99,235,0.08)' : 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minWidth: 'fit-content',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div
          style={{
            background: '#f9fafb',
            padding: '2rem',
            borderRadius: '0 0 8px 8px',
            minHeight: '200px',
          }}
        >
          {isLoading && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              Loading package data...
            </div>
          )}

          <form onSubmit={handleTabSubmit}>
            {activeTab === 0 && (
              <>
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Package Name (Use this for Landing Page Card Title)
                </label>
                <input
                  type='text'
                  value={tabInputs['0'].title ?? ''}
                  onChange={e =>
                    handleTabInputChange(0, 'title', e.target.value)
                  }
                  placeholder='Enter Title'
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Number of Days
                </label>
                <input
                  type='number'
                  min='0'
                  value={
                    typeof tabInputs['0'].days === 'string'
                      ? tabInputs['0'].days
                      : ''
                  }
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleTabInputChange(0, 'days', e.target.value);
                    }
                  }}
                  placeholder='Enter Number of Days'
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                  }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Number of Nights
                </label>
                <input
                  type='number'
                  min='0'
                  value={
                    typeof tabInputs['0'].nights === 'string'
                      ? tabInputs['0'].nights
                      : ''
                  }
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleTabInputChange(0, 'nights', e.target.value);
                    }
                  }}
                  placeholder='Enter Number of Nights'
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                  }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Number of Destinations
                </label>
                <input
                  type='number'
                  min='0'
                  value={
                    typeof tabInputs['0'].destinations === 'string'
                      ? tabInputs['0'].destinations
                      : ''
                  }
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleTabInputChange(0, 'destinations', e.target.value);
                    }
                  }}
                  placeholder='Enter Number of Destinations'
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                  }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Average Reviews rate (If showing 5 stars)
                </label>
                <input
                  type='number'
                  step='0.1'
                  min='1'
                  max='5'
                  value={
                    typeof tabInputs['0'].avgReview === 'string'
                      ? tabInputs['0'].avgReview
                      : ''
                  }
                  onChange={e => {
                    const value = parseFloat(e.target.value);
                    if (value >= 1 && value <= 5) {
                      handleTabInputChange(0, 'avgReview', e.target.value);
                    }
                  }}
                  placeholder='Enter star rating (1-5)'
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                  }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Number of Total Reviewers
                </label>
                <input
                  type='number'
                  min='0'
                  value={
                    typeof tabInputs['0'].totalReviewers === 'string'
                      ? tabInputs['0'].totalReviewers
                      : ''
                  }
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleTabInputChange(0, 'totalReviewers', e.target.value);
                    }
                  }}
                  placeholder='Enter Reviews amount (If showing 5 stars)'
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                  }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Location Name (If visit 1 area or 1 destination or Use this
                  data for Landing Page Card Title)
                </label>
                <input
                  type='text'
                  value={
                    typeof tabInputs['0'].location === 'string'
                      ? tabInputs['0'].location
                      : ''
                  }
                  onChange={e =>
                    handleTabInputChange(0, 'location', e.target.value)
                  }
                  placeholder='Enter Number of Days'
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 16,
                    color: '#111',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16,
                    justifyContent: 'flex-start',
                  }}
                >
                  <input
                    type='checkbox'
                    checked={!!tabInputs['0'].highlight}
                    onChange={e =>
                      handleTabInputChange(0, 'highlight', e.target.checked)
                    }
                    className='white-checkbox'
                    style={{ marginRight: 8, width: 16, height: 16 }}
                  />
                  <label style={{ color: '#111', userSelect: 'none' }}>
                    Highlight this package
                  </label>
                </div>
              </>
            )}
            {activeTab === 1 && (
              <>
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Title
                </label>
                <input
                  type='text'
                  value={
                    typeof tabInputs['1'].title === 'string'
                      ? tabInputs['1'].title
                      : ''
                  }
                  onChange={e =>
                    handleTabInputChange(1, 'title', e.target.value)
                  }
                  placeholder='Enter Title'
                  style={{ width: '100%', padding: 8, marginBottom: 16 }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Short Description (For SEO, Total characters less than 168)
                </label>
                <input
                  type='text'
                  value={
                    typeof tabInputs['1'].shortDescription === 'string'
                      ? tabInputs['1'].shortDescription
                      : ''
                  }
                  onChange={e =>
                    handleTabInputChange(1, 'shortDescription', e.target.value)
                  }
                  placeholder='Enter Title'
                  style={{ width: '100%', padding: 8, marginBottom: 16 }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Tab Title
                </label>
                <input
                  type='text'
                  value={
                    typeof tabInputs['1'].tabTitle === 'string'
                      ? tabInputs['1'].tabTitle
                      : ''
                  }
                  onChange={e =>
                    handleTabInputChange(1, 'tabTitle', e.target.value)
                  }
                  placeholder='Enter Title'
                  style={{ width: '100%', padding: 8, marginBottom: 16 }}
                />
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Number of sections in the Instruction page
                </label>
                <input
                  type='number'
                  min='0'
                  value={
                    typeof tabInputs['1'].numSections === 'string'
                      ? tabInputs['1'].numSections
                      : ''
                  }
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value >= 0) {
                      handleTabInputChange(1, 'numSections', e.target.value);
                    }
                  }}
                  placeholder='Enter Number of sections in the Instruction page'
                  style={{ width: '100%', padding: 8, marginBottom: 16 }}
                />
                {/* Upload Progress and Error Messages */}
                {isUploading && (
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#2563eb',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      fontSize: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #bfdbfe',
                          borderTop: '2px solid #2563eb',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      Uploading image... {uploadProgress}%
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        background: '#bfdbfe',
                        borderRadius: '2px',
                        marginTop: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          background: '#2563eb',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      fontSize: '14px',
                    }}
                  >
                    {uploadError}
                  </div>
                )}

                <div
                  className='image-upload-container'
                  style={{ display: 'flex', gap: 24, marginBottom: 16 }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Image 1
                    </label>
                    {/* Custom file input UI */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <input
                        id='image1-upload'
                        type='file'
                        accept='image/*'
                        style={{ display: 'none' }}
                        onChange={e =>
                          handleFileInputChange(e, 'image1', 1, 'image1Alt')
                        }
                      />
                      <label
                        htmlFor='image1-upload'
                        style={{
                          background: '#f3f4f6',
                          color: '#2563eb',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontWeight: 500,
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'inline-block',
                          marginBottom: 8,
                        }}
                        onClick={() => {
                          console.log('Upload button clicked');
                          const fileInput = document.getElementById(
                            'image1-upload'
                          ) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        Upload Image
                      </label>
                      <span style={{ color: '#111', fontSize: 14 }}>
                        {tabInputs['1'].image1 &&
                        tabInputs['1'].image1 instanceof File
                          ? tabInputs['1'].image1.name
                          : typeof tabInputs['1'].image1Url === 'string' &&
                              tabInputs['1'].image1Url
                            ? 'Image uploaded successfully'
                            : 'No file chosen'}
                      </span>
                    </div>

                    {/* Image preview and alt text section */}
                    {typeof tabInputs['1'].image1Url === 'string' &&
                      tabInputs['1'].image1Url && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 16,
                            alignItems: 'flex-start',
                            marginTop: 12,
                            padding: 12,
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            background: '#f9fafb',
                          }}
                        >
                          {/* Small image preview on the left */}
                          <div style={{ flexShrink: 0 }}>
                            <img
                              src={tabInputs['1'].image1Url}
                              alt='Uploaded image'
                              style={{
                                width: '120px',
                                height: '90px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                cursor: 'default',
                                pointerEvents: 'none',
                              }}
                            />
                          </div>

                          {/* Alt text field on the right */}
                          <div style={{ flex: 1 }}>
                            <label
                              style={{
                                display: 'block',
                                marginBottom: 6,
                                color: '#111',
                                fontSize: 14,
                                fontWeight: 500,
                              }}
                            >
                              Alt Text
                            </label>
                            <input
                              type='text'
                              value={
                                typeof tabInputs['1'].image1Alt === 'string'
                                  ? tabInputs['1'].image1Alt
                                  : ''
                              }
                              onChange={e =>
                                handleTabInputChange(
                                  1,
                                  'image1Alt',
                                  e.target.value
                                )
                              }
                              placeholder='Enter alt text for the image'
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: 14,
                              }}
                            />
                            {/* <div
                              style={{
                                marginTop: 6,
                                fontSize: 11,
                                color: '#6b7280',
                                wordBreak: 'break-all',
                                lineHeight: 1.3,
                              }}
                            >
                              URL: {tabInputs['1'].image1Url}
                            </div> */}
                          </div>
                        </div>
                      )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Header Image (Upload image or enter image url)
                    </label>
                    <input
                      type='text'
                      value={
                        typeof tabInputs['1'].headerImageUrl === 'string'
                          ? tabInputs['1'].headerImageUrl
                          : ''
                      }
                      onChange={e =>
                        handleTabInputChange(
                          1,
                          'headerImageUrl',
                          e.target.value
                        )
                      }
                      placeholder='Image URL'
                      style={{ width: '100%', padding: 8, marginBottom: 8 }}
                    />
                  </div>
                </div>
                {/* Section 1 Heading */}
                <hr
                  style={{
                    margin: '32px 0 16px 0',
                    border: 'none',
                    borderTop: '1px solid #e5e7eb',
                  }}
                />
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    color: '#111',
                    fontWeight: 600,
                  }}
                >
                  Section 1
                </label>
                {/* Description Rich Text Editor (ReactQuill) */}
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Description
                </label>
                <div style={{ marginBottom: 24 }}>
                  <RichTextEditor
                    value={
                      typeof tabInputs['1'].section1Description === 'string'
                        ? tabInputs['1'].section1Description
                        : ''
                    }
                    onChange={value =>
                      handleTabInputChange(1, 'section1Description', value)
                    }
                    placeholder='Enter Description'
                  />
                </div>
                {/* Slider Section */}
                <label
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#222',
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                >
                  Images for header or sliders
                </label>

                {/* Multiple Image Upload Section */}
                <div style={{ marginBottom: 24 }}>
                  {/* Upload Button */}
                  <div style={{ marginBottom: 16 }}>
                    <input
                      id='multiple-image-upload'
                      type='file'
                      accept='image/*'
                      multiple
                      style={{ display: 'none' }}
                      ref={multipleFileInputRef}
                      onChange={handleMultipleImageUpload}
                    />
                    <label
                      htmlFor='multiple-image-upload'
                      style={{
                        background: '#f3f4f6',
                        color: '#2563eb',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 500,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        marginBottom: 8,
                      }}
                    >
                      {isUploadingMultiple
                        ? 'Uploading...'
                        : 'Upload Multiple Images'}
                    </label>
                    <span
                      style={{ marginLeft: 12, fontSize: 14, color: '#666' }}
                    >
                      Select multiple images for header or sliders
                    </span>
                  </div>

                  {/* Uploaded Images Preview */}
                  {multipleImageFiles.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h4
                        style={{ fontSize: 14, color: '#222', marginBottom: 8 }}
                      >
                        New Images to Upload:
                      </h4>
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
                      >
                        {multipleImageFiles.map((file, index) => (
                          <div
                            key={`file-${index}`}
                            style={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              borderRadius: 8,
                              overflow: 'hidden',
                              border: '2px solid #10b981',
                            }}
                          >
                            <img
                              src={multipleImagePreviews[index]}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <button
                              type='button'
                              onClick={() => removeMultipleImage(index)}
                              disabled={isRemovingImage}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                background: isRemovingImage
                                  ? '#9ca3af'
                                  : '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                fontSize: 12,
                                cursor: isRemovingImage
                                  ? 'not-allowed'
                                  : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isRemovingImage ? 0.7 : 1,
                              }}
                            >
                              {isRemovingImage ? '...' : '×'}
                            </button>
                            <input
                              type='text'
                              value={multipleImageAlts[index] || ''}
                              onChange={async e =>
                                await updateMultipleImageAlt(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder='Alt text'
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                border: 'none',
                                padding: '4px 8px',
                                fontSize: 12,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Images */}
                  {multipleImages.length > 0 &&
                    multipleImages.some(url => url.trim() !== '') && (
                      <div style={{ marginBottom: 16 }}>
                        <h4
                          style={{
                            fontSize: 14,
                            color: '#222',
                            marginBottom: 8,
                          }}
                        >
                          Existing Images:
                        </h4>
                        <div
                          style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
                        >
                          {multipleImages.map(
                            (url, index) =>
                              url.trim() !== '' && (
                                <div
                                  key={`url-${index}`}
                                  style={{
                                    position: 'relative',
                                    width: 100,
                                    height: 100,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    border: '2px solid #e5e7eb',
                                  }}
                                >
                                  <img
                                    src={url}
                                    alt={`Image ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                  <button
                                    type='button'
                                    onClick={async () =>
                                      await removeMultipleImageUrlWithCleanup(
                                        index
                                      )
                                    }
                                    disabled={isRemovingImage}
                                    style={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      background: isRemovingImage
                                        ? '#9ca3af'
                                        : '#ef4444',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      fontSize: 12,
                                      cursor: isRemovingImage
                                        ? 'not-allowed'
                                        : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: isRemovingImage ? 0.7 : 1,
                                    }}
                                  >
                                    {isRemovingImage ? '...' : '×'}
                                  </button>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Add Image URL Button */}
                  <button
                    type='button'
                    onClick={addMultipleImageUrl}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 16px',
                      fontSize: 14,
                      cursor: 'pointer',
                      marginBottom: 16,
                    }}
                  >
                    + Add Image URL
                  </button>

                  {/* Image URL Inputs */}
                  {multipleImages.map((url, index) => (
                    <div
                      key={`url-input-${index}`}
                      style={{
                        display: 'flex',
                        gap: 12,
                        marginBottom: 12,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type='text'
                        value={url}
                        onChange={e =>
                          updateMultipleImageUrl(index, e.target.value)
                        }
                        placeholder='Image URL'
                        style={{
                          flex: 1,
                          padding: 8,
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 15,
                          color: '#111',
                          background: '#fafbfc',
                        }}
                      />
                      <input
                        type='text'
                        value={multipleImageAlts[index] || ''}
                        onChange={async e =>
                          await updateMultipleImageAlt(index, e.target.value)
                        }
                        placeholder='Alt text'
                        style={{
                          width: 150,
                          padding: 8,
                          border: '1px solid #e5e7eb',
                          borderRadius: 8,
                          fontSize: 15,
                          color: '#111',
                          background: '#fafbfc',
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => removeMultipleImageUrlWithCleanup(index)}
                        disabled={isRemovingImage}
                        style={{
                          background: isRemovingImage ? '#9ca3af' : '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 12px',
                          fontSize: 14,
                          cursor: isRemovingImage ? 'not-allowed' : 'pointer',
                          opacity: isRemovingImage ? 0.7 : 1,
                        }}
                      >
                        {isRemovingImage ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))}

                  {/* Debug Buttons for Testing */}
                  {isEditing && packageId && (
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* <button
                        type='button'
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `/api/packages/debug-slider-images?packageId=${packageId}`,
                              {
                                method: 'GET',
                                headers: { 'Content-Type': 'application/json' },
                              }
                            );
                            const data = await response.json();
                            if (data.success) {
                              console.log(
                                'Current database state:',
                                data.packageData
                              );
                              alert('Check console for current database state');
                            } else {
                              alert('Failed to get debug info: ' + data.error);
                            }
                          } catch (error) {
                            console.error('Debug GET error:', error);
                            alert(
                              'Failed to get debug info. Please try again.'
                            );
                          }
                        }}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontWeight: 500,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Debug Current State
                      </button> */}
                      {/* <button
                        type='button'
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              '/api/packages/debug-slider-images',
                              {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ packageId }),
                              }
                            );
                            const data = await response.json();
                            if (data.success) {
                              console.log('Debug update result:', data);
                              alert(
                                'Debug update completed! Check console for details.'
                              );
                              window.location.reload();
                            } else {
                              alert('Failed to debug update: ' + data.error);
                            }
                          } catch (error) {
                            console.error('Debug POST error:', error);
                            alert('Failed to debug update. Please try again.');
                          }
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontWeight: 500,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Debug Update
                      </button> */}
                    </div>
                  )}
                </div>
              </>
            )}
            {activeTab === 2 && (
              <div
                className='services-container'
                style={{ display: 'flex', gap: 24 }}
              >
                {/* Included Column */}
                <div className='service-column' style={{ flex: 1 }}>
                  <label
                    style={{ display: 'block', marginBottom: 8, color: '#111' }}
                  >
                    Included
                  </label>
                  {tabInputs['2'].included.map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type='text'
                        value={val}
                        onChange={e =>
                          handleServiceChange('included', idx, e.target.value)
                        }
                        placeholder='Enter Service'
                        style={{ width: '100%', padding: 8, marginRight: 8 }}
                      />
                      {tabInputs['2'].included.length > 1 && (
                        <button
                          type='button'
                          onClick={() =>
                            handleRemoveServiceLine('included', idx)
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                          aria-label='Remove Included Line'
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <div
                    onClick={() => handleAddServiceLine('included')}
                    style={{
                      border: '1px dashed #2563eb',
                      borderRadius: 4,
                      padding: '8px 12px',
                      textAlign: 'center',
                      color: '#2563eb',
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      marginBottom: 16,
                      display: 'inline-block',
                      minWidth: 'fit-content',
                    }}
                  >
                    + Add Included
                  </div>
                </div>
                {/* Excluded Column */}
                <div className='service-column' style={{ flex: 1 }}>
                  <label
                    style={{ display: 'block', marginBottom: 8, color: '#111' }}
                  >
                    Excluded
                  </label>
                  {tabInputs['2'].excluded.map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type='text'
                        value={val}
                        onChange={e =>
                          handleServiceChange('excluded', idx, e.target.value)
                        }
                        placeholder='Enter Service'
                        style={{ width: '100%', padding: 8, marginRight: 8 }}
                      />
                      {tabInputs['2'].excluded.length > 1 && (
                        <button
                          type='button'
                          onClick={() =>
                            handleRemoveServiceLine('excluded', idx)
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                          aria-label='Remove Excluded Line'
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <div
                    onClick={() => handleAddServiceLine('excluded')}
                    style={{
                      border: '1px dashed #2563eb',
                      borderRadius: 4,
                      padding: '8px 12px',
                      textAlign: 'center',
                      color: '#2563eb',
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      marginBottom: 16,
                      display: 'inline-block',
                      minWidth: 'fit-content',
                    }}
                  >
                    + Add Excluded
                  </div>
                </div>
              </div>
            )}
            {activeTab === 3 && (
              <>
                {/* <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Itinerary Description (Rich Text Editor)
                </label> */}
                {/* <div style={{ marginBottom: 24 }}>
                  <ReactQuill
                    value={tabInputs['3'].itinerary}
                    onChange={value =>
                      handleTabInputChange(3, 'itinerary', value)
                    }
                    theme='snow'
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        ['clean'],
                      ],
                    }}
                    formats={[
                      'header',
                      'bold',
                      'italic',
                      'underline',
                      'color',
                      'background',
                      'align',
                    ]}
                    style={{
                      background: '#fff',
                      color: '#111',
                      borderRadius: 6,
                    }}
                  />
                </div> */}

                {/* Days Management */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        color: '#111',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      Itinerary Days
                    </h3>
                    <button
                      type='button'
                      onClick={handleAddDay}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 500,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      Add Day
                    </button>
                  </div>

                  {tabInputs['3'].days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        marginBottom: 16,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Day Header */}
                      <div
                        style={{
                          background: '#f9fafb',
                          padding: '16px',
                          borderBottom: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleToggleDayExpansion(dayIndex)}
                        >
                          <span
                            style={{
                              color: '#2563eb',
                              fontSize: 18,
                              fontWeight: 600,
                              minWidth: 24,
                            }}
                          >
                            {day.isExpanded ? '▼' : '▶'}
                          </span>
                          <span
                            style={{
                              color: '#111',
                              fontSize: 16,
                              fontWeight: 600,
                            }}
                          >
                            Day {day.dayNumber}
                          </span>
                        </div>
                        <button
                          type='button'
                          onClick={() => handleRemoveDay(dayIndex)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: 18,
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 4,
                          }}
                          aria-label='Remove Day'
                        >
                          ×
                        </button>
                      </div>

                      {/* Day Content */}
                      {day.isExpanded && (
                        <div style={{ padding: '16px' }}>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                              fontWeight: 500,
                            }}
                          >
                            Day {day.dayNumber} Title
                          </label>
                          <input
                            type='text'
                            value={day.title}
                            onChange={e =>
                              handleTabInputChange(
                                3,
                                `days.${dayIndex}.title`,
                                e.target.value
                              )
                            }
                            placeholder='Enter Day Title'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 16,
                              color: '#111',
                              border: '1px solid #d1d5db',
                              borderRadius: 4,
                            }}
                          />

                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                              fontWeight: 500,
                            }}
                          >
                            Day {day.dayNumber} Description (Rich Text Editor)
                          </label>
                          <div style={{ marginBottom: 16 }}>
                            <RichTextEditor
                              value={day.description}
                              onChange={value =>
                                handleTabInputChange(
                                  3,
                                  `days.${dayIndex}.description`,
                                  value
                                )
                              }
                              placeholder='Enter Description'
                            />
                          </div>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                              fontWeight: 500,
                            }}
                          >
                            Day {day.dayNumber} Activity
                          </label>
                          <input
                            type='text'
                            value={day.activity}
                            onChange={e =>
                              handleTabInputChange(
                                3,
                                `days.${dayIndex}.activity`,
                                e.target.value
                              )
                            }
                            placeholder='Enter Activity'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 16,
                              color: '#111',
                              border: '1px solid #d1d5db',
                              borderRadius: 4,
                            }}
                          />

                          {/* Day Highlights Section */}
                          <div style={{ marginBottom: 16 }}>
                            <label
                              style={{
                                display: 'block',
                                marginBottom: 8,
                                color: '#111',
                                fontWeight: 500,
                              }}
                            >
                              Day {day.dayNumber} Highlights
                            </label>
                            <div
                              style={{
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: 6,
                                padding: 12,
                              }}
                            >
                              {(day.highlights || ['']).map(
                                (highlight, highlightIndex) => (
                                  <div
                                    key={highlightIndex}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      marginBottom: 8,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#2563eb',
                                        marginRight: 12,
                                        flexShrink: 0,
                                      }}
                                    />
                                    <input
                                      type='text'
                                      value={highlight}
                                      onChange={e =>
                                        handleDayHighlightChange(
                                          dayIndex,
                                          highlightIndex,
                                          e.target.value
                                        )
                                      }
                                      placeholder='Enter highlight point'
                                      style={{
                                        flex: 1,
                                        padding: 8,
                                        marginRight: 8,
                                        border: '1px solid #d1d5db',
                                        borderRadius: 4,
                                        fontSize: 14,
                                      }}
                                    />
                                    {(day.highlights || []).length > 1 && (
                                      <button
                                        type='button'
                                        onClick={() =>
                                          handleRemoveDayHighlight(
                                            dayIndex,
                                            highlightIndex
                                          )
                                        }
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#ef4444',
                                          fontSize: 18,
                                          cursor: 'pointer',
                                          padding: 4,
                                          borderRadius: 4,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: 24,
                                          height: 24,
                                        }}
                                        aria-label='Remove highlight'
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                )
                              )}
                              <div
                                onClick={() => handleAddDayHighlight(dayIndex)}
                                style={{
                                  border: '1px dashed #2563eb',
                                  borderRadius: 4,
                                  padding: '8px 12px',
                                  textAlign: 'center',
                                  color: '#2563eb',
                                  fontWeight: 500,
                                  fontSize: 13,
                                  cursor: 'pointer',
                                  marginTop: 8,
                                  display: 'inline-block',
                                  minWidth: 'fit-content',
                                }}
                              >
                                + Add Highlight Point
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {activeTab === 4 && (
              <>
                {tabInputs['4'].locations.map((loc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f5f5f5',
                      borderRadius: 8,
                      padding: '24px 16px',
                      marginBottom: 32,
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Location {idx + 1}
                    </div>
                    <hr
                      style={{
                        margin: '8px 0 24px 0',
                        border: 'none',
                        borderTop: '1px solid #e5e7eb',
                      }}
                    />
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Location Name
                    </label>
                    <input
                      type='text'
                      value={loc.name}
                      onChange={e =>
                        handleLocationChange(idx, 'name', e.target.value)
                      }
                      placeholder='Enter Title'
                      style={{ width: '100%', padding: 8, marginBottom: 16 }}
                    />
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#111',
                          }}
                        >
                          Latitude
                        </label>
                        <input
                          type='text'
                          value={loc.latitude}
                          onChange={e =>
                            handleLocationChange(
                              idx,
                              'latitude',
                              e.target.value
                            )
                          }
                          placeholder='Enter Title'
                          style={{ width: '100%', padding: 8, marginBottom: 0 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#111',
                          }}
                        >
                          Longitude
                        </label>
                        <input
                          type='text'
                          value={loc.longitude}
                          onChange={e =>
                            handleLocationChange(
                              idx,
                              'longitude',
                              e.target.value
                            )
                          }
                          placeholder='Enter Title'
                          style={{ width: '100%', padding: 8, marginBottom: 0 }}
                        />
                      </div>
                    </div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Choose day
                    </label>
                    <select
                      value={loc.day}
                      onChange={e =>
                        handleLocationChange(idx, 'day', e.target.value)
                      }
                      style={{ width: '100%', padding: 8, marginBottom: 0 }}
                    >
                      <option value=''>Enter Title</option>
                      {/* Dynamically populate days from itinerary if available */}
                      {tabInputs['3'].days && tabInputs['3'].days.length > 0
                        ? tabInputs['3'].days.map((d, i) => (
                            <option key={i} value={d.dayNumber}>
                              Day {d.dayNumber}
                            </option>
                          ))
                        : [1, 2, 3, 4, 5].map(d => (
                            <option key={d} value={d}>
                              Day {d}
                            </option>
                          ))}
                    </select>
                    {/* Remove button (not for first location) */}
                    {tabInputs['4'].locations.length > 1 && (
                      <button
                        type='button'
                        onClick={() => handleRemoveLocation(idx)}
                        style={{
                          marginTop: 16,
                          background: '#f3f4f6',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontWeight: 500,
                          fontSize: 15,
                          cursor: 'pointer',
                        }}
                      >
                        Remove Location
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type='button'
                  onClick={handleAddLocation}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Add Location
                </button>
              </>
            )}
            {activeTab === 5 && (
              <>
                <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Price per person
                    </label>
                    <input
                      type='number'
                      min='0'
                      value={
                        typeof tabInputs['5'].priceLeft === 'string'
                          ? tabInputs['5'].priceLeft
                          : ''
                      }
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0) {
                          handleTabInputChange(5, 'priceLeft', e.target.value);
                        }
                      }}
                      placeholder='Enter Price'
                      style={{ width: '100%', padding: 8, marginBottom: 16 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        color: '#111',
                      }}
                    >
                      Price per person
                    </label>
                    <input
                      type='number'
                      min='0'
                      value={
                        typeof tabInputs['5'].priceRight === 'string'
                          ? tabInputs['5'].priceRight
                          : ''
                      }
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0) {
                          handleTabInputChange(5, 'priceRight', e.target.value);
                        }
                      }}
                      placeholder='Enter Price'
                      style={{ width: '100%', padding: 8, marginBottom: 16 }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{ display: 'block', marginBottom: 8, color: '#111' }}
                  >
                    Select currency type displaying in website
                  </label>
                  <input
                    type='text'
                    value={
                      typeof tabInputs['5'].currency === 'string'
                        ? tabInputs['5'].currency
                        : ''
                    }
                    onChange={e =>
                      handleTabInputChange(5, 'currency', e.target.value)
                    }
                    placeholder='Enter Title'
                    style={{ width: '100%', padding: 8, marginBottom: 16 }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 24,
                  }}
                >
                  <input
                    type='checkbox'
                    checked={!!tabInputs['5'].highlight}
                    onChange={e =>
                      handleTabInputChange(5, 'highlight', e.target.checked)
                    }
                    className='white-checkbox'
                    style={{ marginRight: 8, width: 16, height: 16 }}
                  />
                  <label style={{ userSelect: 'none', color: '#111' }}>
                    Highlight this package
                  </label>
                </div>
              </>
            )}
            {activeTab === 6 && (
              <>
                {Array.isArray(tabInputs['6']) &&
                  (tabInputs['6'] as AccommodationPlace[]).map((acc, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f5f5f5',
                        borderRadius: 8,
                        padding: '24px 16px',
                        marginBottom: 32,
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 8,
                          color: '#111',
                        }}
                      >
                        {acc.sectionTitle}
                      </div>
                      <hr
                        style={{
                          margin: '8px 0 24px 0',
                          border: 'none',
                          borderTop: '1px solid #e5e7eb',
                        }}
                      />
                      <div
                        className='accommodation-fields-container'
                        style={{ display: 'flex', gap: 16, marginBottom: 16 }}
                      >
                        <div
                          className='accommodation-column'
                          style={{ flex: 1 }}
                        >
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Hotel Name
                          </label>
                          <input
                            type='text'
                            value={acc.hotelName}
                            onChange={e =>
                              handleAccommodationChange(
                                idx,
                                'hotelName',
                                e.target.value
                              )
                            }
                            placeholder='Enter Hotel Name'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 8,
                            }}
                          />
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Latitude
                          </label>
                          <input
                            type='text'
                            value={acc.latitude}
                            onChange={e =>
                              handleAccommodationChange(
                                idx,
                                'latitude',
                                e.target.value
                              )
                            }
                            placeholder='Enter Latitude'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 8,
                            }}
                          />
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Description
                          </label>
                          <input
                            type='text'
                            value={acc.description}
                            onChange={e =>
                              handleAccommodationChange(
                                idx,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Enter Description'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 8,
                            }}
                          />
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Image 1
                          </label>
                          <div
                            style={{
                              display: 'flex',
                              gap: 16,
                              marginBottom: 16,
                            }}
                          >
                            {/* Image Preview Section */}
                            <div style={{ flex: '0 0 auto' }}>
                              <div
                                style={{
                                  position: 'relative',
                                  width: 80,
                                  height: 80,
                                  background: '#e5e7eb',
                                  borderRadius: 6,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {acc.image1 instanceof File ? (
                                    <img
                                      src={URL.createObjectURL(acc.image1)}
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : acc.image1Url ? (
                                    <img
                                      src={acc.image1Url}
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 24,
                                          marginBottom: 4,
                                        }}
                                      >
                                        🏨
                                      </div>
                                      <div style={{ fontSize: 10 }}>
                                        No Image
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Delete Button */}
                                {((acc.image1 && acc.image1 instanceof File) ||
                                  acc.image1Url) && (
                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleDeleteAccommodationImage(
                                        idx,
                                        'image1'
                                      )
                                    }
                                    style={{
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      background: '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      fontSize: 14,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                    title='Delete image'
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Upload Controls Section */}
                            <div style={{ flex: 1 }}>
                              <label
                                style={{
                                  color: '#111',
                                  fontWeight: 500,
                                  marginBottom: 8,
                                  display: 'block',
                                }}
                              >
                                Accommodation Image
                              </label>

                              <input
                                id={`acc-image1-upload-${idx}`}
                                type='file'
                                accept='image/*'
                                style={{ display: 'none' }}
                                onChange={async e => {
                                  const file =
                                    e.target.files && e.target.files[0];
                                  if (file) {
                                    // First update the form state
                                    handleAccommodationChange(
                                      idx,
                                      'image1',
                                      file
                                    );
                                    // Then upload to Firebase
                                    await handleImageUpload(
                                      file,
                                      'image1',
                                      6,
                                      'image1Alt',
                                      undefined, // reviewIndex
                                      idx // accommodationIndex
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`acc-image1-upload-${idx}`}
                                style={{
                                  background: '#f3f4f6',
                                  color: '#2563eb',
                                  border: '1px solid #d1d5db',
                                  borderRadius: 6,
                                  padding: '8px 16px',
                                  fontWeight: 500,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'inline-block',
                                  marginBottom: 8,
                                }}
                              >
                                Upload Image
                              </label>

                              {/* Alt Text Input */}
                              <input
                                type='text'
                                value={acc.image1Alt}
                                onChange={e =>
                                  handleAccommodationChange(
                                    idx,
                                    'image1Alt',
                                    e.target.value
                                  )
                                }
                                placeholder='Enter Alt Text for accessibility'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                }}
                              />

                              {/* URL Input */}
                              <label
                                style={{
                                  color: '#111',
                                  fontSize: 13,
                                  marginBottom: 4,
                                  display: 'block',
                                }}
                              >
                                Image URL (auto-filled after upload)
                              </label>
                              <input
                                type='text'
                                value={acc.image1Url || ''}
                                onChange={e =>
                                  handleAccommodationChange(
                                    idx,
                                    'image1Url',
                                    e.target.value
                                  )
                                }
                                placeholder='Firebase Storage URL will appear here'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                  background: acc.image1Url
                                    ? '#f9fafb'
                                    : '#fff',
                                }}
                                readOnly={!!acc.image1Url}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className='accommodation-column'
                          style={{ flex: 1 }}
                        >
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Shareable Link (Map Location)
                          </label>
                          <input
                            type='text'
                            value={acc.shareableLink}
                            onChange={e =>
                              handleAccommodationChange(
                                idx,
                                'shareableLink',
                                e.target.value
                              )
                            }
                            placeholder='Enter Shareable Link'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 8,
                            }}
                          />
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Longitude
                          </label>
                          <input
                            type='text'
                            value={acc.longitude}
                            onChange={e =>
                              handleAccommodationChange(
                                idx,
                                'longitude',
                                e.target.value
                              )
                            }
                            placeholder='Enter Longitude'
                            style={{
                              width: '100%',
                              padding: 8,
                              marginBottom: 8,
                            }}
                          />
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 8,
                              color: '#111',
                            }}
                          >
                            Header Image
                          </label>
                          <div
                            style={{
                              display: 'flex',
                              gap: 16,
                              marginBottom: 16,
                            }}
                          >
                            {/* Image Preview Section */}
                            <div style={{ flex: '0 0 auto' }}>
                              <div
                                style={{
                                  position: 'relative',
                                  width: 80,
                                  height: 80,
                                  background: '#e5e7eb',
                                  borderRadius: 6,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {acc.headerImage instanceof File ? (
                                    <img
                                      src={URL.createObjectURL(acc.headerImage)}
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : acc.headerImageUrl ? (
                                    <img
                                      src={acc.headerImageUrl}
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 24,
                                          marginBottom: 4,
                                        }}
                                      >
                                        🏨
                                      </div>
                                      <div style={{ fontSize: 10 }}>
                                        No Image
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Delete Button */}
                                {((acc.headerImage &&
                                  acc.headerImage instanceof File) ||
                                  acc.headerImageUrl) && (
                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleDeleteAccommodationImage(
                                        idx,
                                        'headerImage'
                                      )
                                    }
                                    style={{
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      background: '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      fontSize: 14,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                    title='Delete image'
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Upload Controls Section */}
                            <div style={{ flex: 1 }}>
                              <label
                                style={{
                                  color: '#111',
                                  fontWeight: 500,
                                  marginBottom: 8,
                                  display: 'block',
                                }}
                              >
                                Header Image
                              </label>

                              <input
                                id={`acc-header-image-upload-${idx}`}
                                type='file'
                                accept='image/*'
                                style={{ display: 'none' }}
                                onChange={async e => {
                                  const file =
                                    e.target.files && e.target.files[0];
                                  if (file) {
                                    // First update the form state
                                    handleAccommodationChange(
                                      idx,
                                      'headerImage',
                                      file
                                    );
                                    // Then upload to Firebase
                                    await handleImageUpload(
                                      file,
                                      'headerImage',
                                      6,
                                      'headerImageAlt',
                                      undefined, // reviewIndex
                                      idx // accommodationIndex
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`acc-header-image-upload-${idx}`}
                                style={{
                                  background: '#f3f4f6',
                                  color: '#2563eb',
                                  border: '1px solid #d1d5db',
                                  borderRadius: 6,
                                  padding: '8px 16px',
                                  fontWeight: 500,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'inline-block',
                                  marginBottom: 8,
                                }}
                              >
                                Upload Image
                              </label>

                              {/* Alt Text Input */}
                              <input
                                type='text'
                                value={acc.headerImageAlt}
                                onChange={e =>
                                  handleAccommodationChange(
                                    idx,
                                    'headerImageAlt',
                                    e.target.value
                                  )
                                }
                                placeholder='Enter Alt Text for accessibility'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                }}
                              />

                              {/* URL Input */}
                              <label
                                style={{
                                  color: '#111',
                                  fontSize: 13,
                                  marginBottom: 4,
                                  display: 'block',
                                }}
                              >
                                Image URL (auto-filled after upload)
                              </label>
                              <input
                                type='text'
                                value={acc.headerImageUrl || ''}
                                onChange={e =>
                                  handleAccommodationChange(
                                    idx,
                                    'headerImageUrl',
                                    e.target.value
                                  )
                                }
                                placeholder='Firebase Storage URL will appear here'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                  background: acc.headerImageUrl
                                    ? '#f9fafb'
                                    : '#fff',
                                }}
                                readOnly={!!acc.headerImageUrl}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {Array.isArray(tabInputs['6']) &&
                        (tabInputs['6'] as AccommodationPlace[]).length > 1 && (
                          <button
                            type='button'
                            onClick={() => handleRemoveAccommodation(idx)}
                            style={{
                              marginTop: 16,
                              background: '#f3f4f6',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: 6,
                              padding: '8px 16px',
                              fontWeight: 500,
                              fontSize: 15,
                              cursor: 'pointer',
                            }}
                          >
                            Remove Accommodation Place
                          </button>
                        )}
                    </div>
                  ))}
                <button
                  type='button'
                  onClick={handleAddAccommodation}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Add Accommodation Place
                </button>
              </>
            )}
            {activeTab === 7 && (
              <>
                <label
                  style={{ display: 'block', marginBottom: 8, color: '#111' }}
                >
                  Description
                </label>
                <div style={{ marginBottom: 24 }}>
                  <RichTextEditor
                    value={tabInputs['7'].description}
                    onChange={handleGuidelineDescriptionChange}
                    placeholder='Enter Description'
                  />
                </div>
                <div
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    margin: '32px 0 16px 0',
                    paddingTop: 16,
                  }}
                >
                  <div
                    style={{ fontWeight: 600, color: '#111', marginBottom: 16 }}
                  >
                    FQA
                  </div>
                  {tabInputs['7'].faqs.map((faq, idx) => (
                    <div key={idx} style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          color: '#111',
                        }}
                      >
                        Question
                      </label>
                      <input
                        type='text'
                        value={faq.question}
                        onChange={e =>
                          handleFAQChange(idx, 'question', e.target.value)
                        }
                        placeholder='Enter Question'
                        style={{ width: '100%', padding: 8, marginBottom: 16 }}
                      />
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          color: '#111',
                        }}
                      >
                        Answer
                      </label>
                      <input
                        type='text'
                        value={faq.answer}
                        onChange={e =>
                          handleFAQChange(idx, 'answer', e.target.value)
                        }
                        placeholder='Enter Answer'
                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                      />
                      {tabInputs['7'].faqs.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveFAQ(idx)}
                          style={{
                            background: '#f3f4f6',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 16px',
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: 'pointer',
                            marginTop: 8,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={handleAddFAQ}
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 24px',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Add FAQ
                  </button>
                </div>
              </>
            )}
            {activeTab === 8 && (
              <>
                {Array.isArray(tabInputs['8']) ? (
                  (tabInputs['8'] as Review[]).map(
                    (review: Review, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f5f5f5',
                          borderRadius: 8,
                          padding: '24px 16px',
                          marginBottom: 32,
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 8,
                            color: '#111',
                          }}
                        >
                          Reviewer {idx + 1}
                        </div>
                        <hr
                          style={{
                            margin: '8px 0 24px 0',
                            border: 'none',
                            borderTop: '1px solid #e5e7eb',
                          }}
                        />
                        {/* Name and Stars */}
                        <div
                          className='review-fields-container'
                          style={{ display: 'flex', gap: 16, marginBottom: 16 }}
                        >
                          <div className='review-column' style={{ flex: 1 }}>
                            <label style={{ color: '#111' }}>Name</label>
                            <input
                              type='text'
                              value={review.name}
                              onChange={e =>
                                handleReviewChange(idx, 'name', e.target.value)
                              }
                              placeholder='Enter Name'
                              style={{
                                width: '100%',
                                padding: 8,
                                marginBottom: 8,
                              }}
                            />
                          </div>
                          <div className='review-column' style={{ flex: 1 }}>
                            <label style={{ color: '#111' }}>
                              Stars Amount
                            </label>
                            <input
                              type='number'
                              min='0'
                              value={review.stars}
                              onChange={e => {
                                const value = parseFloat(e.target.value);
                                if (value >= 0) {
                                  handleReviewChange(
                                    idx,
                                    'stars',
                                    e.target.value
                                  );
                                }
                              }}
                              placeholder='Enter Stars Amount'
                              style={{
                                width: '100%',
                                padding: 8,
                                marginBottom: 8,
                              }}
                            />
                          </div>
                        </div>
                        {/* Review Text */}
                        <label style={{ color: '#111' }}>Review text</label>
                        <input
                          type='text'
                          value={review.text}
                          onChange={e =>
                            handleReviewChange(idx, 'text', e.target.value)
                          }
                          placeholder='Enter Review Text'
                          style={{ width: '100%', padding: 8, marginBottom: 8 }}
                        />
                        {/* Review Source and Link */}
                        <div
                          className='review-fields-container'
                          style={{ display: 'flex', gap: 16, marginBottom: 16 }}
                        >
                          <div className='review-column' style={{ flex: 1 }}>
                            <label style={{ color: '#111' }}>
                              Review Source
                            </label>
                            <input
                              type='text'
                              value={review.source}
                              onChange={e =>
                                handleReviewChange(
                                  idx,
                                  'source',
                                  e.target.value
                                )
                              }
                              placeholder='Enter Review Source'
                              style={{
                                width: '100%',
                                padding: 8,
                                marginBottom: 8,
                              }}
                            />
                          </div>
                          <div className='review-column' style={{ flex: 1 }}>
                            <label style={{ color: '#111' }}>
                              Review Source Link
                            </label>
                            <input
                              type='text'
                              value={review.sourceLink}
                              onChange={e =>
                                handleReviewChange(
                                  idx,
                                  'sourceLink',
                                  e.target.value
                                )
                              }
                              placeholder='Enter Review Source Link'
                              style={{
                                width: '100%',
                                padding: 8,
                                marginBottom: 8,
                              }}
                            />
                          </div>
                        </div>
                        {/* Reviewer Face Image */}
                        <div style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 16,
                              marginBottom: 16,
                            }}
                          >
                            {/* Image Preview Section */}
                            <div style={{ flexShrink: 0 }}>
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'inline-block',
                                }}
                              >
                                <div
                                  style={{
                                    width: 80,
                                    height: 80,
                                    background: '#e5e7eb',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                    color: '#888',
                                    border: '2px solid #e5e7eb',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {review.faceImage &&
                                  review.faceImage instanceof File ? (
                                    <img
                                      src={
                                        createSafeObjectURL(review.faceImage) ||
                                        ''
                                      }
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : review.faceImageUrl ? (
                                    <img
                                      src={review.faceImageUrl}
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 24,
                                          marginBottom: 4,
                                        }}
                                      >
                                        📷
                                      </div>
                                      <div style={{ fontSize: 10 }}>
                                        No Image
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Delete Button */}
                                {((review.faceImage &&
                                  review.faceImage instanceof File) ||
                                  review.faceImageUrl) && (
                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleDeleteImage(idx, 'faceImage')
                                    }
                                    style={{
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      background: '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      fontSize: 14,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                    title='Delete image'
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Upload Controls Section */}
                            <div style={{ flex: 1 }}>
                              <label
                                style={{
                                  color: '#111',
                                  fontWeight: 500,
                                  marginBottom: 8,
                                  display: 'block',
                                }}
                              >
                                Reviewer Face Image
                              </label>

                              <input
                                id={`face-image-upload-${idx}`}
                                type='file'
                                accept='image/*'
                                style={{ display: 'none' }}
                                onChange={async e => {
                                  const file =
                                    e.target.files && e.target.files[0];
                                  if (file) {
                                    // First update the form state
                                    handleReviewChange(idx, 'faceImage', file);
                                    // Then upload to Firebase
                                    await handleImageUpload(
                                      file,
                                      'faceImage',
                                      8,
                                      'faceImageAlt',
                                      idx
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`face-image-upload-${idx}`}
                                style={{
                                  background: '#f3f4f6',
                                  color: '#2563eb',
                                  border: '1px solid #d1d5db',
                                  borderRadius: 6,
                                  padding: '8px 16px',
                                  fontWeight: 500,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'inline-block',
                                  marginBottom: 8,
                                }}
                              >
                                {isUploading ? 'Uploading...' : ' Upload Image'}
                              </label>

                              {/* Upload Progress Indicator */}
                              {isUploading && uploadProgress > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                  <div
                                    style={{
                                      width: '100%',
                                      height: 4,
                                      background: '#e5e7eb',
                                      borderRadius: 2,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${uploadProgress}%`,
                                        height: '100%',
                                        background: '#2563eb',
                                        borderRadius: 2,
                                        transition: 'width 0.3s ease',
                                      }}
                                    />
                                  </div>
                                  <small style={{ color: '#666' }}>
                                    Uploading... {uploadProgress}%
                                  </small>
                                </div>
                              )}

                              {/* Error Display */}
                              {uploadError && (
                                <div
                                  style={{
                                    color: '#dc2626',
                                    fontSize: 14,
                                    marginBottom: 8,
                                    padding: '8px 12px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: 4,
                                  }}
                                >
                                  ⚠️ {uploadError}
                                </div>
                              )}

                              {/* Alt Text Input */}
                              <input
                                type='text'
                                value={review.faceImageAlt}
                                onChange={e =>
                                  handleReviewChange(
                                    idx,
                                    'faceImageAlt',
                                    e.target.value
                                  )
                                }
                                placeholder='Enter Alt Text for accessibility'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                }}
                              />

                              {/* URL Input */}
                              <label
                                style={{
                                  color: '#111',
                                  fontSize: 13,
                                  marginBottom: 4,
                                  display: 'block',
                                }}
                              >
                                Image URL (auto-filled after upload)
                              </label>
                              <input
                                type='text'
                                value={review.faceImageUrl}
                                onChange={e =>
                                  handleReviewChange(
                                    idx,
                                    'faceImageUrl',
                                    e.target.value
                                  )
                                }
                                placeholder='Firebase Storage URL will appear here'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                  background: review.faceImageUrl
                                    ? '#f9fafb'
                                    : '#fff',
                                }}
                                readOnly={!!review.faceImageUrl}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Reviewer Journey Images */}
                        <div style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 16,
                              marginBottom: 16,
                            }}
                          >
                            {/* Image Preview Section */}
                            <div style={{ flexShrink: 0 }}>
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'inline-block',
                                }}
                              >
                                <div
                                  style={{
                                    width: 80,
                                    height: 80,
                                    background: '#e5e7eb',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                    color: '#888',
                                    border: '2px solid #e5e7eb',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {review.journeyImage &&
                                  review.journeyImage instanceof File ? (
                                    <img
                                      src={
                                        createSafeObjectURL(
                                          review.journeyImage
                                        ) || ''
                                      }
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : review.journeyImageUrl ? (
                                    <img
                                      src={review.journeyImageUrl}
                                      alt='Preview'
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        cursor: 'default',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 24,
                                          marginBottom: 4,
                                        }}
                                      >
                                        🖼️
                                      </div>
                                      <div style={{ fontSize: 10 }}>
                                        No Image
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Delete Button */}
                                {((review.journeyImage &&
                                  review.journeyImage instanceof File) ||
                                  review.journeyImageUrl) && (
                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleDeleteImage(idx, 'journeyImage')
                                    }
                                    style={{
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      background: '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      fontSize: 14,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                    title='Delete image'
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Upload Controls Section */}
                            <div style={{ flex: 1 }}>
                              <label
                                style={{
                                  color: '#111',
                                  fontWeight: 500,
                                  marginBottom: 8,
                                  display: 'block',
                                }}
                              >
                                Reviewer Journey Images
                              </label>

                              <input
                                id={`journey-image-upload-${idx}`}
                                type='file'
                                accept='image/*'
                                style={{ display: 'none' }}
                                onChange={async e => {
                                  const file =
                                    e.target.files && e.target.files[0];
                                  if (file) {
                                    // First update the form state
                                    handleReviewChange(
                                      idx,
                                      'journeyImage',
                                      file
                                    );
                                    // Then upload to Firebase
                                    await handleImageUpload(
                                      file,
                                      'journeyImage',
                                      8,
                                      'journeyImageAlt',
                                      idx
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`journey-image-upload-${idx}`}
                                style={{
                                  background: '#f3f4f6',
                                  color: '#2563eb',
                                  border: '1px solid #d1d5db',
                                  borderRadius: 6,
                                  padding: '8px 16px',
                                  fontWeight: 500,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'inline-block',
                                  marginBottom: 8,
                                }}
                              >
                                Upload Image
                              </label>

                              {/* Alt Text Input */}
                              <input
                                type='text'
                                value={review.journeyImageAlt}
                                onChange={e =>
                                  handleReviewChange(
                                    idx,
                                    'journeyImageAlt',
                                    e.target.value
                                  )
                                }
                                placeholder='Enter Alt Text for accessibility'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                }}
                              />

                              {/* URL Input */}
                              <label
                                style={{
                                  color: '#111',
                                  fontSize: 13,
                                  marginBottom: 4,
                                  display: 'block',
                                }}
                              >
                                Image URL (auto-filled after upload)
                              </label>
                              <input
                                type='text'
                                value={review.journeyImageUrl}
                                onChange={e =>
                                  handleReviewChange(
                                    idx,
                                    'journeyImageUrl',
                                    e.target.value
                                  )
                                }
                                placeholder='Firebase Storage URL will appear here'
                                style={{
                                  width: '100%',
                                  padding: 8,
                                  marginBottom: 8,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 4,
                                  fontSize: 14,
                                  background: review.journeyImageUrl
                                    ? '#f9fafb'
                                    : '#fff',
                                }}
                                readOnly={!!review.journeyImageUrl}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Remove Reviewer Button */}
                        {(tabInputs['8'] as Review[]).length > 1 && (
                          <button
                            type='button'
                            onClick={() => handleRemoveReviewer(idx)}
                            style={{
                              color: '#ef4444',
                              background: 'none',
                              border: 'none',
                              fontWeight: 500,
                              fontSize: 15,
                              cursor: 'pointer',
                              marginBottom: 8,
                            }}
                          >
                            Remove Reviewer
                          </button>
                        )}
                      </div>
                    )
                  )
                ) : (
                  <div
                    style={{ padding: 20, textAlign: 'center', color: '#666' }}
                  >
                    Loading reviews...
                  </div>
                )}
                <button
                  type='button'
                  onClick={handleAddReviewer}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginBottom: 16,
                  }}
                >
                  Add Reviewer
                </button>
              </>
            )}
            <div
              className='action-buttons-container'
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 32,
              }}
            >
              <button
                type='button'
                style={{
                  background: '#f3f4f6',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => {
                  window.location.href = '/admin/packages';
                }}
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={isSubmitting || isLoading}
                style={{
                  background: isSubmitting || isLoading ? '#9ca3af' : '#e5e7eb',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={e => handleSaveAsDraft(e)}
              >
                {isSubmitting ? 'Saving Draft...' : 'Save as draft'}
              </button>
              <button
                type='submit'
                disabled={isSubmitting || isLoading}
                style={{
                  background: isSubmitting || isLoading ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {isSubmitting
                  ? 'Saving...'
                  : isLoading
                    ? 'Loading...'
                    : 'Save and Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx>{`
        .white-checkbox {
          appearance: none;
          -webkit-appearance: none;
          background: #fff;
          border: 1.5px solid #ccc;
          border-radius: 4px;
          width: 16px;
          height: 16px;
          cursor: pointer;
          position: relative;
        }
        .white-checkbox:checked {
          background: #fff;
          border: 2px solid #2563eb;
        }
        .white-checkbox:checked::after {
          content: '';
          display: block;
          position: absolute;
          left: 4px;
          top: 0px;
          width: 4px;
          height: 8px;
          border: solid #2563eb;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        /* Hide scrollbar for tab navigation */
        .tab-navigation::-webkit-scrollbar {
          display: none;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .tab-navigation {
            padding: 0 16px;
            margin: 0 -16px 2rem -16px;
          }

          .tab-navigation button {
            font-size: 14px !important;
            padding: 6px 12px !important;
            min-width: max-content !important;
          }
        }

        @media (max-width: 480px) {
          .tab-navigation button {
            font-size: 13px !important;
            padding: 5px 10px !important;
          }
        }

        /* Mobile responsive for action buttons */
        @media (max-width: 768px) {
          .action-buttons-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }

          .action-buttons-container button {
            width: 100% !important;
            margin: 0 !important;
          }
        }

        /* Mobile responsive for image upload container */
        @media (max-width: 768px) {
          .image-upload-container {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .image-upload-container > div {
            flex: none !important;
            width: 100% !important;
          }
        }

        /* Mobile responsive for services container */
        @media (max-width: 768px) {
          .services-container {
            flex-direction: column !important;
            gap: 32px !important;
          }

          .service-column {
            flex: none !important;
            width: 100% !important;
          }
        }

        /* Mobile responsive for accommodation fields container */
        @media (max-width: 768px) {
          .accommodation-fields-container {
            flex-direction: column !important;
            gap: 24px !important;
          }

          .accommodation-column {
            flex: none !important;
            width: 100% !important;
          }
        }

        /* Mobile responsive for review fields container */
        @media (max-width: 768px) {
          .review-fields-container {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .review-column {
            flex: none !important;
            width: 100% !important;
          }
        }
      `}</style>
      <style jsx global>{`
        .ql-editor em,
        .ql-editor i {
          font-style: italic !important;
        }
      `}</style>
      {/* <button
        type='button'
        onClick={saveSliderImagesToMongo}
        disabled={isUploadingMultiple || !packageId}
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontWeight: 500,
          fontSize: 14,
          cursor: isUploadingMultiple ? 'not-allowed' : 'pointer',
          marginTop: 16,
        }}
      >
        Save Slider Images
      </button> */}
    </AdminLayout>
  );
}

export default function AddPackage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPackageContent />
    </Suspense>
  );
}

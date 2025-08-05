// Single Apartment Configuration
// This file contains hardcoded credentials for the main apartment
// All data and users will belong to this apartment

export interface ApartmentConfig {
  // Company/Apartment Information
  companyId: string;
  companyName: string;
  companyDescription: string;
  domain: string;

  // Root User Credentials (Hardcoded)
  rootUser: {
    name: string;
    email: string;
    password: string; // This will be hashed during setup
    role: 'super_admin';
  };

  // Database Configuration
  database: {
    name: string;
    collectionPrefix: string;
  };

  // Subscription Plan (Hardcoded)
  subscriptionPlan: 'free' | 'pro' | 'pro_max';

  // Custom Branding
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };

  // Contact Information
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };

  // Social Media
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };

  // Features Configuration
  features: {
    enableBlogs: boolean;
    enableTeam: boolean;
    enableTestimonials: boolean;
    enableBookings: boolean;
    enableAnalytics: boolean;
  };

  // SEO Configuration
  seo: {
    siteTitle: string;
    siteDescription: string;
    keywords: string[];
  };
}

// SINGLE APARTMENT CONFIGURATION
// This is the only apartment configuration - all data belongs to this apartment

export const APARTMENT_CONFIG: ApartmentConfig = {
  companyId: 'Adventure LK',
  companyName: 'Tours Trails',
  companyDescription: 'Premium tourism experiences and travel services.',
  domain: 'tourstrails.com',

  rootUser: {
    name: 'Tours Trails Admin',
    email: 'admin@tourstrails.com',
    password: 'AdminTourstrails2024!', // Will be hashed during setup
    role: 'super_admin',
  },

  database: {
    name: 'tourstrails_db',
    collectionPrefix: 'tourstrails_',
  },

  subscriptionPlan: 'pro_max',

  branding: {
    logo: '/assets/imgs/logo/tours tarils logo.png',
    favicon: '/assets/imgs/logo/godare_final_TR.png',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'Inter, sans-serif',
  },

  contact: {
    phone: '+94 11 234 5678',
    whatsapp: '+94 77 123 4567',
    email: 'jayanthachanu@gmail.com ',
    address: '123 Tourism Street, Colombo 01, Sri Lanka',
  },

  socialMedia: {
    facebook: 'https://facebook.com/tourstrails',
    instagram: 'https://instagram.com/tourstrails',
    twitter: 'https://twitter.com/tourstrails',
    linkedin: 'https://linkedin.com/company/tourstrails',
  },

  features: {
    enableBlogs: true,
    enableTeam: true,
    enableTestimonials: true,
    enableBookings: true,
    enableAnalytics: true,
  },

  seo: {
    siteTitle: 'Tours Trails - Premium Tourism Experiences',
    siteDescription:
      'Discover amazing tourism experiences with Tours Trails - your trusted travel partner.',
    keywords: [
      'tourism',
      'travel',
      'tours',
      'sri lanka',
      'vacation',
      'adventure',
      'culture',
    ],
  },
};

// Configuration getter functions
export function getApartmentConfig(): ApartmentConfig {
  return APARTMENT_CONFIG;
}

export function getCompanyId(): string {
  return APARTMENT_CONFIG.companyId;
}

export function getCompanyName(): string {
  return APARTMENT_CONFIG.companyName;
}

export function getRootUser(): ApartmentConfig['rootUser'] {
  return APARTMENT_CONFIG.rootUser;
}

export function getBranding(): ApartmentConfig['branding'] {
  return APARTMENT_CONFIG.branding;
}

export function getContact(): ApartmentConfig['contact'] {
  return APARTMENT_CONFIG.contact;
}

export function getSocialMedia(): ApartmentConfig['socialMedia'] {
  return APARTMENT_CONFIG.socialMedia;
}

export function getFeatures(): ApartmentConfig['features'] {
  return APARTMENT_CONFIG.features;
}

export function getSEO(): ApartmentConfig['seo'] {
  return APARTMENT_CONFIG.seo;
}

// Database utility functions
export function getDatabaseName(): string {
  return APARTMENT_CONFIG.database.name;
}

export function getCollectionPrefix(): string {
  return APARTMENT_CONFIG.database.collectionPrefix;
}

// Subscription utility functions
export function getSubscriptionPlan(): string {
  return APARTMENT_CONFIG.subscriptionPlan;
}

// Domain utility functions
export function getDomain(): string {
  return APARTMENT_CONFIG.domain;
}

// Error message function
export function getApartmentErrorMessage(message: string): string {
  return message;
}

// Validation function
export function validateApartmentConfig(config: ApartmentConfig): boolean {
  const requiredFields = [
    'companyId',
    'companyName',
    'domain',
    'rootUser',
    'database',
    'subscriptionPlan',
    'branding',
    'contact',
    'features',
    'seo',
  ];

  return requiredFields.every(
    field => config[field as keyof ApartmentConfig] !== undefined
  );
}

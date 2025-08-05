import mongoose from 'mongoose';

const itineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: [true, 'Day number is required'],
  },
  title: {
    type: String,
    required: [true, 'Day title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Day description is required'],
    trim: true,
  },
  highlights: [
    {
      type: String,
      required: [true, 'Day highlights are required'],
      trim: true,
    },
  ],
  activity: {
    type: String,
    required: [true, 'Day activity is required'],
    trim: true,
  },
});

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
  },
  latitude: {
    type: String,
    required: [true, 'Latitude is required'],
    trim: true,
  },
  longitude: {
    type: String,
    required: [true, 'Longitude is required'],
    trim: true,
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    trim: true,
  },
});

const accommodationPlaceSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
  },
  hotelName: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
  },
  shareableLink: {
    type: String,
    trim: true,
  },
  latitude: {
    type: String,
    trim: true,
  },
  longitude: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image1: {
    type: String,
    trim: true,
  },
  image1Alt: {
    type: String,
    trim: true,
  },
  headerImage: {
    type: String,
    trim: true,
  },
});

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
  },
});

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Reviewer name is required'],
    trim: true,
  },
  stars: {
    type: String,
    required: [true, 'Stars rating is required'],
    trim: true,
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
  },
  source: {
    type: String,
    trim: true,
  },
  sourceLink: {
    type: String,
    trim: true,
  },
  faceImage: {
    type: String,
    trim: true,
  },
  faceImageAlt: {
    type: String,
    trim: true,
  },
  faceImageUrl: {
    type: String,
    trim: true,
  },
  journeyImage: {
    type: String,
    trim: true,
  },
  journeyImageAlt: {
    type: String,
    trim: true,
  },
  journeyImageUrl: {
    type: String,
    trim: true,
  },
});

const packageSchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Root user-based data isolation
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the RootUser model
      required: [true, 'Root User ID is required for data isolation'],
      index: true, // Add an index for faster queries
    },

    // Package identification
    id: {
      type: String,
      required: [true, 'Package ID is required'],
      trim: true,
      lowercase: true,
    },
    packageCode: {
      type: String,
      trim: true,
      maxlength: [50, 'Package code cannot be more than 50 characters'],
    },
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    image: {
      type: String,
      required: [true, 'Main image is required'],
      trim: true,
    },
    summery: {
      type: String,
      required: [true, 'Package summary is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    days: {
      type: String,
      required: [true, 'Number of days is required'],
      trim: true,
    },
    nights: {
      type: String,
      required: [true, 'Number of nights is required'],
      trim: true,
    },
    destinations: {
      type: String,
      required: [true, 'Number of destinations is required'],
      trim: true,
    },
    avgReview: {
      type: String,
      trim: true,
    },
    totalReviewers: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, 'Reviews cannot be less than 0'],
    },
    type: {
      type: String,
      required: [true, 'Package type is required'],
      trim: true,
    },
    mini_discription: {
      type: String,
      required: [true, 'Mini description is required'],
      trim: true,
      maxlength: [500, 'Mini description cannot be more than 500 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    highlights: [
      {
        type: String,
        required: [true, 'Highlights are required'],
        trim: true,
      },
    ],
    inclusions: [
      {
        type: String,
        required: [true, 'Inclusions are required'],
        trim: true,
      },
    ],
    exclusions: [
      {
        type: String,
        required: [true, 'Exclusions are required'],
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    images2: {
      type: String,
      trim: true,
    },
    itinerary: [itineraryDaySchema],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    position: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
    // Active status fields
    highlightsActive: {
      type: Boolean,
      default: true,
    },
    inclusionsActive: {
      type: Boolean,
      default: true,
    },
    exclusionsActive: {
      type: Boolean,
      default: true,
    },
    itineraryActive: {
      type: Boolean,
      default: true,
    },
    // New fields for additional tabs
    // Instruction page
    instructionTitle: {
      type: String,
      trim: true,
    },
    instructionShortDescription: {
      type: String,
      trim: true,
    },
    instructionTabTitle: {
      type: String,
      trim: true,
    },
    instructionNumSections: {
      type: String,
      trim: true,
    },
    instructionImage1: {
      type: String,
      trim: true,
    },
    instructionImage1Alt: {
      type: String,
      trim: true,
    },
    instructionHeaderImageUrl: {
      type: String,
      trim: true,
    },
    instructionSection1Description: {
      type: String,
      trim: true,
    },
    instructionSliderImage1: {
      type: String,
      trim: true,
    },
    instructionSliderImage1Alt: {
      type: String,
      trim: true,
    },
    instructionSliderImage2: {
      type: String,
      trim: true,
    },
    instructionSliderImage2Alt: {
      type: String,
      trim: true,
    },
    // Multiple slider images array
    instructionSliderImages: [
      {
        url: {
          type: String,
          trim: true,
        },
        alt: {
          type: String,
          trim: true,
        },
        uploaded: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // Services
    servicesIncluded: [
      {
        type: String,
        trim: true,
      },
    ],
    servicesExcluded: [
      {
        type: String,
        trim: true,
      },
    ],
    // Locations
    locations: [locationSchema],
    // Pricing
    priceLeft: {
      type: String,
      trim: true,
    },
    priceRight: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      trim: true,
    },
    priceHighlight: {
      type: Boolean,
      default: false,
    },
    // Accommodation Places
    accommodationPlaces: [accommodationPlaceSchema],
    // Guidelines
    guidelinesDescription: {
      type: String,
      trim: true,
    },
    guidelinesFaqs: [faqSchema],
    // Reviews
    packageReviews: [reviewSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
packageSchema.index({ id: 1 });
packageSchema.index({ rootUserId: 1 }); // Root user-based isolation
packageSchema.index({ category: 1, position: 1 });
packageSchema.index({ published: 1, rootUserId: 1 }); // For filtering published packages by root user
packageSchema.index({ position: 1, rootUserId: 1 }); // For ordering by position within root user scope

// Pre-save middleware to ensure tenant isolation
packageSchema.pre('save', function (next) {
  // Ensure rootUserId is set when creating the package
  // The rootUserId should be passed from the user context
  next();
});

// Static method to find packages by root user
packageSchema.statics.findByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId });
};

// Static method to find packages by user within root user
packageSchema.statics.findByUser = function (
  userId: string,
  rootUserId: string
) {
  return this.find({ userId, rootUserId });
};

// Static method to find published packages by root user
packageSchema.statics.findPublishedByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId, published: true });
};

// Static method to find published packages by user within root user
packageSchema.statics.findPublishedByUser = function (
  userId: string,
  rootUserId: string
) {
  return this.find({ userId, rootUserId, published: true });
};

// Static method to count packages by root user
packageSchema.statics.countByRootUser = function (rootUserId: string) {
  return this.countDocuments({ rootUserId });
};

// Static method to count packages by user within root user
packageSchema.statics.countByUser = function (
  userId: string,
  rootUserId: string
) {
  return this.countDocuments({ userId, rootUserId });
};

const Package =
  mongoose.models.Package || mongoose.model('Package', packageSchema);

export default Package;

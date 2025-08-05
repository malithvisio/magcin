import mongoose from 'mongoose';

// Subscription plan enum
const subscriptionPlans = {
  FREE: 'free',
  PRO: 'pro',
  PRO_MAX: 'pro_max',
} as const;

// TypeScript interfaces for the User model
interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'root_user' | 'admin' | 'member' | 'super_admin';
  isRootUser: boolean;
  apartmentName?: string;
  apartmentDescription?: string;
  rootUserId?: mongoose.Types.ObjectId | null;
  companyId: string;
  tenantId: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  usageStats: {
    packages: number;
    destinations: number;
    activities: number;
    blogs: number;
    teamMembers: number;
    testimonials: number;
  };
  companyName?: string;
  companyDescription?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  website?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  canCreateItem(
    itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
  ): boolean;
  getRemainingQuota(
    itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
  ): string | number;
  incrementUsage(
    itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
  ): boolean;
  decrementUsage(
    itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
  ): boolean;
  getEffectiveRootUserId(): mongoose.Types.ObjectId;
  hasApartmentAccess(rootUserId: string): boolean;
}

interface IUserModel extends mongoose.Model<IUser> {
  getSubscriptionLimits(plan: SubscriptionPlan): any;
  getSubscriptionPlans(): typeof subscriptionPlans;
  findByCompany(companyId: string): Promise<IUser[]>;
  findRootUsersByCompany(companyId: string): Promise<IUser[]>;
  findMembersByRootUser(rootUserId: string): Promise<IUser[]>;
  findCompanyAdmin(companyId: string): Promise<IUser | null>;
  findApartmentOwner(rootUserId: string): Promise<IUser | null>;
}

type SubscriptionPlan =
  (typeof subscriptionPlans)[keyof typeof subscriptionPlans];

// Subscription limits
const subscriptionLimits = {
  [subscriptionPlans.FREE]: {
    packages: 3,
    destinations: 5,
    activities: 10,
    blogs: 5,
    teamMembers: 2,
    testimonials: 5,
  },
  [subscriptionPlans.PRO]: {
    packages: 15,
    destinations: 15,
    activities: 50,
    blogs: 25,
    teamMembers: 10,
    testimonials: 20,
  },
  [subscriptionPlans.PRO_MAX]: {
    packages: -1, // unlimited
    destinations: -1, // unlimited
    activities: -1, // unlimited
    blogs: -1, // unlimited
    teamMembers: -1, // unlimited
    testimonials: -1, // unlimited
  },
};

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // Role and access control - Enhanced for apartment hierarchy
    role: {
      type: String,
      enum: ['root_user', 'admin', 'member', 'super_admin'],
      default: 'member',
    },

    // Apartment/Root User Management
    // If this user is a root user (apartment owner), these fields define their apartment
    isRootUser: {
      type: Boolean,
      default: false,
    },
    apartmentName: {
      type: String,
      trim: true,
      maxlength: [100, 'Apartment name cannot be more than 100 characters'],
    },
    apartmentDescription: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Apartment description cannot be more than 500 characters',
      ],
    },

    // If this user is a member, they belong to a root user's apartment
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      // Only required if user is not a root user
      required: function (this: any) {
        return !this.isRootUser;
      },
    },

    // Multi-tenant identification - Company-based
    companyId: {
      type: String,
      required: [true, 'Company ID is required'],
      trim: true,
    },
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required'],
      unique: true,
      trim: true,
    },

    // Subscription management
    subscriptionPlan: {
      type: String,
      enum: Object.values(subscriptionPlans),
      default: subscriptionPlans.FREE,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active',
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionEndDate: {
      type: Date,
    },

    // Usage tracking - Only for root users
    usageStats: {
      packages: {
        type: Number,
        default: 0,
        min: 0,
      },
      destinations: {
        type: Number,
        default: 0,
        min: 0,
      },
      activities: {
        type: Number,
        default: 0,
        min: 0,
      },
      blogs: {
        type: Number,
        default: 0,
        min: 0,
      },
      teamMembers: {
        type: Number,
        default: 0,
        min: 0,
      },
      testimonials: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Company/Organization information
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    companyDescription: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Company description cannot be more than 500 characters',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },

    // Timestamps
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
userSchema.index({ email: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ tenantId: 1 });
userSchema.index({ subscriptionPlan: 1 });
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isRootUser: 1 });
userSchema.index({ rootUserId: 1 });
userSchema.index({ companyId: 1, isRootUser: 1 }); // For finding root users by company
userSchema.index({ rootUserId: 1, companyId: 1 }); // For finding members by root user

// Instance method to check if user can create more items (only for root users)
userSchema.methods.canCreateItem = function (
  itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
) {
  // Only root users can create items
  if (!this.isRootUser) {
    return false;
  }

  const limit =
    subscriptionLimits[this.subscriptionPlan as SubscriptionPlan][itemType];
  const currentUsage = this.usageStats[itemType];

  // -1 means unlimited
  if (limit === -1) return true;

  return currentUsage < limit;
};

// Instance method to get remaining quota (only for root users)
userSchema.methods.getRemainingQuota = function (
  itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
) {
  if (!this.isRootUser) {
    return 'Not applicable for members';
  }

  const limit =
    subscriptionLimits[this.subscriptionPlan as SubscriptionPlan][itemType];
  const currentUsage = this.usageStats[itemType];

  if (limit === -1) return 'Unlimited';

  return Math.max(0, limit - currentUsage);
};

// Instance method to increment usage (only for root users)
userSchema.methods.incrementUsage = function (
  itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
) {
  if (!this.isRootUser) {
    return false;
  }

  if (this.canCreateItem(itemType)) {
    this.usageStats[itemType]++;
    return true;
  }
  return false;
};

// Instance method to decrement usage (only for root users)
userSchema.methods.decrementUsage = function (
  itemType: keyof (typeof subscriptionLimits)[SubscriptionPlan]
) {
  if (!this.isRootUser) {
    return false;
  }

  if (this.usageStats[itemType] > 0) {
    this.usageStats[itemType]--;
    return true;
  }
  return false;
};

// Static method to get subscription limits
userSchema.statics.getSubscriptionLimits = function (plan: SubscriptionPlan) {
  return subscriptionLimits[plan];
};

// Static method to get all subscription plans
userSchema.statics.getSubscriptionPlans = function () {
  return subscriptionPlans;
};

// Static method to find users by company
userSchema.statics.findByCompany = function (companyId: string) {
  return this.find({ companyId });
};

// Static method to find root users by company
userSchema.statics.findRootUsersByCompany = function (companyId: string) {
  return this.find({ companyId, isRootUser: true });
};

// Static method to find members by root user
userSchema.statics.findMembersByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId, isRootUser: false });
};

// Static method to find company admin
userSchema.statics.findCompanyAdmin = function (companyId: string) {
  return this.findOne({ companyId, role: 'admin' });
};

// Static method to find apartment owner (root user)
userSchema.statics.findApartmentOwner = function (rootUserId: string) {
  return this.findOne({ _id: rootUserId, isRootUser: true });
};

// Instance method to get effective root user ID
userSchema.methods.getEffectiveRootUserId = function () {
  return this.isRootUser ? this._id : this.rootUserId;
};

// Instance method to check if user has access to apartment data
userSchema.methods.hasApartmentAccess = function (rootUserId: string) {
  if (this.isRootUser) {
    return this._id.toString() === rootUserId;
  }
  return this.rootUserId.toString() === rootUserId;
};

const User = (mongoose.models.User ||
  mongoose.model('User', userSchema)) as IUserModel;

export default User;
export { subscriptionPlans, subscriptionLimits };
export type { SubscriptionPlan };

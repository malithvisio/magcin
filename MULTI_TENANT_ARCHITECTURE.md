# Multi-Tenant Tourism CMS Architecture

## Overview

This document outlines the multi-tenant architecture for the Tourism CMS system, designed to serve
multiple clients (tenants) with isolated data and subscription-based access control.

## Architecture Principles

### 1. Tenant Isolation

- **Data Isolation**: Each tenant's data is completely isolated using `userId` and `tenantId`
  references
- **Security**: Users can only access their own data through proper filtering
- **Scalability**: All data is stored in shared collections with tenant-specific filtering

### 2. Subscription Management

- **Free Plan**: Limited access (3 packages, 5 destinations, 10 activities, 5 blogs, 2 team members,
  5 testimonials)
- **Pro Plan**: Extended access (15 packages, 15 destinations, 50 activities, 25 blogs, 10 team
  members, 20 testimonials)
- **Pro Max Plan**: Unlimited access to all features

### 3. Usage Tracking

- Real-time usage monitoring for each subscription type
- Automatic quota enforcement
- Upgrade/downgrade subscription management

## Database Schema Design

### User Schema (Multi-Tenant Core)

```typescript
{
  // Basic Information
  name: String,
  email: String (unique),
  password: String (hashed),

  // Multi-Tenant Identification
  tenantId: String (unique),

  // Subscription Management
  subscriptionPlan: 'free' | 'pro' | 'pro_max',
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled',
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,

  // Usage Tracking
  usageStats: {
    packages: Number,
    destinations: Number,
    activities: Number,
    blogs: Number,
    teamMembers: Number,
    testimonials: Number
  },

  // Company Information
  companyName: String,
  companyDescription: String,
  phoneNumber: String,
  whatsappNumber: String,
  website: String,

  // Account Status
  role: 'user' | 'admin' | 'super_admin',
  isActive: Boolean,
  isVerified: Boolean,
  lastLoginAt: Date
}
```

### All Content Schemas (Packages, Destinations, Activities, Blogs, etc.)

Each content schema includes:

```typescript
{
  // Multi-Tenant Reference (CRITICAL)
  userId: ObjectId (ref: 'User'),
  tenantId: String,

  // Content-specific fields...
  // ... existing fields ...

  // Status fields
  published: Boolean,
  position: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

### 1. Data Isolation Methods

#### Static Methods for Tenant Isolation

```typescript
// Find all items by user
Model.findByUser(userId, tenantId);

// Find published items by user
Model.findPublishedByUser(userId, tenantId);

// Count items by user
Model.countByUser(userId, tenantId);
```

#### Usage Management Methods

```typescript
// Check if user can create more items
user.canCreateItem('packages');

// Get remaining quota
user.getRemainingQuota('destinations');

// Increment usage
user.incrementUsage('activities');

// Decrement usage
user.decrementUsage('blogs');
```

### 2. Subscription Limits

```typescript
const subscriptionLimits = {
  free: {
    packages: 3,
    destinations: 5,
    activities: 10,
    blogs: 5,
    teamMembers: 2,
    testimonials: 5,
  },
  pro: {
    packages: 15,
    destinations: 15,
    activities: 50,
    blogs: 25,
    teamMembers: 10,
    testimonials: 20,
  },
  pro_max: {
    packages: -1, // unlimited
    destinations: -1,
    activities: -1,
    blogs: -1,
    teamMembers: -1,
    testimonials: -1,
  },
};
```

## API Implementation Guidelines

### 1. Authentication & Authorization

```typescript
// Middleware to extract user context
const getUserContext = async (req: Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);

  return {
    userId: user._id,
    tenantId: user.tenantId,
    subscriptionPlan: user.subscriptionPlan,
    role: user.role,
  };
};
```

### 2. Data Retrieval Patterns

```typescript
// GET /api/packages
export async function GET(request: NextRequest) {
  const userContext = await getUserContext(request);

  const packages = await Package.findByUser(userContext.userId, userContext.tenantId);

  return NextResponse.json({ packages });
}
```

### 3. Data Creation Patterns

```typescript
// POST /api/packages
export async function POST(request: NextRequest) {
  const userContext = await getUserContext(request);
  const user = await User.findById(userContext.userId);

  // Check subscription limits
  if (!user.canCreateItem('packages')) {
    return NextResponse.json(
      { error: 'Package limit reached. Please upgrade your subscription.' },
      { status: 403 }
    );
  }

  const data = await request.json();

  // Create package with tenant context
  const package = new Package({
    ...data,
    userId: userContext.userId,
    tenantId: userContext.tenantId,
  });

  await package.save();

  // Increment usage
  user.incrementUsage('packages');
  await user.save();

  return NextResponse.json({ package });
}
```

### 4. Data Update Patterns

```typescript
// PUT /api/packages/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const userContext = await getUserContext(request);

  const package = await Package.findOne({
    _id: params.id,
    userId: userContext.userId,
    tenantId: userContext.tenantId,
  });

  if (!package) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 });
  }

  const data = await request.json();
  Object.assign(package, data);
  await package.save();

  return NextResponse.json({ package });
}
```

### 5. Data Deletion Patterns

```typescript
// DELETE /api/packages/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const userContext = await getUserContext(request);
  const user = await User.findById(userContext.userId);

  const package = await Package.findOneAndDelete({
    _id: params.id,
    userId: userContext.userId,
    tenantId: userContext.tenantId,
  });

  if (package) {
    // Decrement usage
    user.decrementUsage('packages');
    await user.save();
  }

  return NextResponse.json({ success: true });
}
```

## Database Indexes

### Critical Indexes for Performance

```typescript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ tenantId: 1 });
userSchema.index({ subscriptionPlan: 1 });
userSchema.index({ subscriptionStatus: 1 });

// Content indexes (for all schemas)
contentSchema.index({ userId: 1, tenantId: 1 }); // Compound index for tenant isolation
contentSchema.index({ published: 1, userId: 1 }); // For filtering published items
contentSchema.index({ position: 1, userId: 1 }); // For ordering within user scope
```

## Security Considerations

### 1. Data Access Control

- All queries must include `userId` and `tenantId` filters
- Use static methods that enforce tenant isolation
- Never expose raw database queries without tenant filtering

### 2. Subscription Enforcement

- Check limits before creating new items
- Track usage in real-time
- Provide clear upgrade paths when limits are reached

### 3. API Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization

## Migration Strategy

### 1. Existing Data Migration

```typescript
// Migration script to add tenant context to existing data
const migrateExistingData = async () => {
  // Create default tenant for existing users
  const users = await User.find({ tenantId: { $exists: false } });

  for (const user of users) {
    user.tenantId = `tenant_${user._id}`;
    await user.save();
  }

  // Update existing content with user references
  const packages = await Package.find({ userId: { $exists: false } });
  // ... migrate packages

  const destinations = await Destination.find({ userId: { $exists: false } });
  // ... migrate destinations
};
```

### 2. Backward Compatibility

- Maintain existing API endpoints
- Add tenant context gradually
- Provide migration tools for existing data

## Monitoring and Analytics

### 1. Usage Analytics

```typescript
// Track usage patterns
const usageAnalytics = {
  totalUsers: await User.countDocuments(),
  activeSubscriptions: await User.countDocuments({ subscriptionStatus: 'active' }),
  usageByPlan: await User.aggregate([{ $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }]),
};
```

### 2. Performance Monitoring

- Monitor query performance with tenant filters
- Track subscription limit enforcement
- Monitor data growth per tenant

## Best Practices

### 1. Query Optimization

- Always use compound indexes for tenant filtering
- Limit result sets with pagination
- Use projection to select only needed fields

### 2. Error Handling

- Provide clear error messages for quota limits
- Handle tenant isolation errors gracefully
- Log security violations

### 3. Testing

- Test tenant isolation thoroughly
- Verify subscription limit enforcement
- Test data migration scenarios

## Conclusion

This multi-tenant architecture provides:

- **Complete data isolation** between tenants
- **Scalable subscription management**
- **Real-time usage tracking**
- **Secure API access patterns**
- **Performance-optimized queries**

The system is designed to handle multiple tourism businesses with different subscription levels
while maintaining data security and performance.

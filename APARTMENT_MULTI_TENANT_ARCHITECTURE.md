# Apartment-Based Multi-Tenant Architecture

## Overview

This travel company system implements a multi-tenant architecture where each apartment (root user)
has complete isolation of their data. The system supports multiple apartments within a single
company, with each apartment having its own root user and member users.

## Architecture Components

### 1. User Hierarchy

#### Root User (Apartment Owner)

- **Role**: `root_user`
- **Ownership**: Owns the entire apartment and all its data
- **Permissions**: Full access to all apartment data and settings
- **Subscription**: Manages subscription plan and usage limits
- **Members**: Can add/remove member users

#### Admin User

- **Role**: `admin`
- **Permissions**: Can manage apartment data but not subscription or members
- **Access**: Full CRUD operations on apartment data

#### Member User

- **Role**: `member`
- **Permissions**: View-only access to apartment data
- **Access**: Read-only access to packages, destinations, blogs, etc.

#### Super Admin

- **Role**: `super_admin`
- **Permissions**: System-wide access across all apartments
- **Access**: Can manage all apartments and users

### 2. Data Isolation Fields

All models include these fields for proper data isolation:

```typescript
{
  rootUserId: ObjectId,    // References the apartment owner
  companyId: String,       // Company identifier
  tenantId: String,        // Tenant identifier
}
```

### 3. Database Models

#### User Model

```typescript
{
  // Basic user info
  name: String,
  email: String,
  password: String,

  // Role and apartment management
  role: 'root_user' | 'admin' | 'member' | 'super_admin',
  isRootUser: Boolean,
  rootUserId: ObjectId,  // For members, references their apartment owner

  // Apartment info (for root users)
  apartmentName: String,
  apartmentDescription: String,

  // Multi-tenant fields
  companyId: String,
  tenantId: String,

  // Subscription management (root users only)
  subscriptionPlan: String,
  subscriptionStatus: String,
  usageStats: {
    packages: Number,
    destinations: Number,
    activities: Number,
    blogs: Number,
    teamMembers: Number,
    testimonials: Number,
  }
}
```

#### Data Models (Package, Destination, Blog, etc.)

```typescript
{
  // Multi-tenant isolation
  rootUserId: ObjectId,  // References apartment owner
  companyId: String,
  tenantId: String,

  // Model-specific data
  // ... other fields
}
```

## Data Flow

### 1. Authentication & Authorization

```typescript
// Get apartment context from request
const apartmentContext = await getApartmentContext(req);

// Check permissions
if (!canPerformAction(apartmentContext, 'create_package')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Get apartment filter for database queries
const apartmentFilter = getApartmentDataFilter(apartmentContext);
```

### 2. Database Queries

All queries automatically filter by apartment:

```typescript
// Get packages for specific apartment
const packages = await Package.find({
  rootUserId: apartmentContext.rootUserId,
  companyId: apartmentContext.companyId,
  tenantId: apartmentContext.tenantId,
});

// Create new package with apartment context
const newPackage = new Package({
  ...packageData,
  rootUserId: apartmentContext.rootUserId,
  companyId: apartmentContext.companyId,
  tenantId: apartmentContext.tenantId,
});
```

### 3. Permission System

```typescript
// Check if user can perform specific actions
const canCreate = canPerformAction(context, 'create_package');
const canEdit = canPerformAction(context, 'edit_package');
const canDelete = canPerformAction(context, 'delete_package');
const canViewAnalytics = canPerformAction(context, 'view_analytics');
```

## API Usage Examples

### 1. Get Apartment Packages

```typescript
// GET /api/packages/apartment-example
export async function GET(req: NextRequest) {
  const apartmentContext = await getApartmentContext(req);
  const apartmentFilter = getApartmentDataFilter(apartmentContext);

  const packages = await Package.find(apartmentFilter);
  return NextResponse.json({ data: packages });
}
```

### 2. Create Apartment Package

```typescript
// POST /api/packages/apartment-example
export async function POST(req: NextRequest) {
  const apartmentContext = await getApartmentContext(req);

  if (!canPerformAction(apartmentContext, 'create_package')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const newPackage = new Package({
    ...packageData,
    rootUserId: apartmentContext.rootUserId,
    companyId: apartmentContext.companyId,
    tenantId: apartmentContext.tenantId,
  });

  await newPackage.save();
}
```

## Utility Functions

### Apartment Context Management

```typescript
// Get apartment context from request
const context = await getApartmentContext(req);

// Get apartment filter for database queries
const filter = getApartmentDataFilter(context);

// Check apartment access
const hasAccess = hasApartmentAccess(context, targetRootUserId);

// Validate apartment ownership
const isValid = await validateApartmentOwnership(rootUserId, companyId);
```

### Permission Checking

```typescript
// Check specific permissions
const canCreate = canPerformAction(context, 'create_package');
const canEdit = canPerformAction(context, 'edit_package');
const canDelete = canPerformAction(context, 'delete_package');
const canManageMembers = canPerformAction(context, 'manage_members');
```

### Usage Management

```typescript
// Update root user usage stats
await updateRootUserUsage(rootUserId, 'packages', true); // increment
await updateRootUserUsage(rootUserId, 'packages', false); // decrement

// Get apartment statistics
const stats = await getApartmentStats(rootUserId);
```

## Database Indexes

### User Model Indexes

```typescript
userSchema.index({ email: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ tenantId: 1 });
userSchema.index({ isRootUser: 1 });
userSchema.index({ rootUserId: 1 });
userSchema.index({ companyId: 1, isRootUser: 1 });
userSchema.index({ rootUserId: 1, companyId: 1 });
```

### Data Model Indexes

```typescript
// All data models include these indexes
modelSchema.index({ rootUserId: 1 });
modelSchema.index({ companyId: 1 });
modelSchema.index({ tenantId: 1 });
modelSchema.index({ rootUserId: 1, companyId: 1 });
```

## Security Considerations

### 1. Data Isolation

- All queries automatically filter by apartment context
- No cross-apartment data access possible
- Root user ID is validated on all operations

### 2. Permission Validation

- Action-based permission system
- Role-based access control
- Apartment ownership validation

### 3. Input Validation

- All user inputs are validated
- Apartment context is verified on each request
- SQL injection prevention through Mongoose

## Migration Strategy

### 1. Existing Data Migration

```typescript
// Migrate existing data to apartment structure
const migrateToApartment = async (userId: string, apartmentName: string) => {
  const user = await User.findById(userId);

  // Convert user to root user
  user.isRootUser = true;
  user.role = 'root_user';
  user.apartmentName = apartmentName;

  await user.save();

  // Update all related data to reference this root user
  await Package.updateMany(
    { userId: userId },
    {
      rootUserId: userId,
      $unset: { userId: 1 },
    }
  );

  // Repeat for other models...
};
```

### 2. New Apartment Creation

```typescript
// Create new apartment with root user
const createApartment = async (apartmentData: any) => {
  const rootUser = new User({
    ...apartmentData,
    isRootUser: true,
    role: 'root_user',
  });

  await rootUser.save();

  // Create default settings for apartment
  const settings = new Settings({
    rootUserId: rootUser._id,
    companyId: rootUser.companyId,
    tenantId: rootUser.tenantId,
    // ... default settings
  });

  await settings.save();

  return rootUser;
};
```

## Best Practices

### 1. Always Use Apartment Context

```typescript
// ✅ Good
const packages = await Package.find({
  rootUserId: apartmentContext.rootUserId,
  companyId: apartmentContext.companyId,
});

// ❌ Bad - No apartment filtering
const packages = await Package.find({});
```

### 2. Validate Permissions

```typescript
// ✅ Good
if (!canPerformAction(context, 'create_package')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ❌ Bad - No permission check
const newPackage = new Package(data);
```

### 3. Use Utility Functions

```typescript
// ✅ Good
const apartmentFilter = getApartmentDataFilter(context);
const packages = await Package.find(apartmentFilter);

// ❌ Bad - Manual filter creation
const packages = await Package.find({
  rootUserId: context.rootUserId,
  companyId: context.companyId,
  tenantId: context.tenantId,
});
```

## Monitoring and Analytics

### 1. Apartment Statistics

```typescript
const stats = await getApartmentStats(rootUserId);
// Returns: subscription info, usage stats, member count, etc.
```

### 2. Usage Tracking

```typescript
// Track when items are created/deleted
await updateRootUserUsage(rootUserId, 'packages', true);
await updateRootUserUsage(rootUserId, 'packages', false);
```

### 3. Member Management

```typescript
// Get all members of an apartment
const members = await getApartmentMembers(rootUserId);

// Add new member to apartment
const newMember = new User({
  ...memberData,
  rootUserId: apartmentOwner._id,
  isRootUser: false,
  role: 'member',
});
```

This architecture ensures complete data isolation between apartments while providing flexible user
management and permission systems within each apartment.

# Multi-Tenant Tourism CMS Schema Diagram

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER (Core Schema)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId (Primary Key)                                                   │
│ name: String                                                                  │
│ email: String (unique)                                                        │
│ password: String (hashed)                                                     │
│ tenantId: String (unique) ← CRITICAL for multi-tenant isolation              │
│ subscriptionPlan: 'free' | 'pro' | 'pro_max'                                 │
│ subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled'        │
│ usageStats: {                                                                 │
│   packages: Number,                                                           │
│   destinations: Number,                                                       │
│   activities: Number,                                                         │
│   blogs: Number,                                                             │
│   teamMembers: Number,                                                        │
│   testimonials: Number                                                        │
│ }                                                                             │
│ companyName: String                                                           │
│ companyDescription: String                                                    │
│ role: 'user' | 'admin' | 'super_admin'                                       │
│ isActive: Boolean                                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1:Many
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CONTENT SCHEMAS (All)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│ │    PACKAGES     │ │   DESTINATIONS  │ │    ACTIVITIES    │ │     BLOGS     │ │
│ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├───────────────┤ │
│ │ _id: ObjectId   │ │ _id: ObjectId   │ │ _id: ObjectId   │ │ _id: ObjectId │ │
│ │ userId: ObjectId│ │ userId: ObjectId│ │ userId: ObjectId│ │ userId: Object│
│ │ tenantId: String│ │ tenantId: String│ │ tenantId: String│ │ tenantId: Str │
│ │ id: String      │ │ id: String      │ │ name: String    │ │ title: String │
│ │ name: String    │ │ name: String    │ │ title: String   │ │ content: String│
│ │ title: String   │ │ images: Array   │ │ description: Str│ │ published: Bool│
│ │ image: String   │ │ location: String│ │ imageUrl: String│ │ slug: String  │
│ │ location: String│ │ description: Str│ │ published: Bool │ │ author: String│
│ │ duration: String│ │ published: Bool │ │ position: Number│ │ position: Num │
│ │ price: Number   │ │ position: Number│ │ highlight: Bool │ │ category: Str │
│ │ published: Bool │ │ highlight: Bool │ │ createdAt: Date │ │ createdAt: Date│
│ │ position: Number│ │ createdAt: Date │ │ updatedAt: Date │ │ updatedAt: Date│
│ │ createdAt: Date │ │ updatedAt: Date │ │                 │ │               │
│ │ updatedAt: Date │ │                 │ │                 │ │               │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └───────────────┘ │
│                                                                               │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│ │     TEAM        │ │  TESTIMONIALS   │ │   CATEGORIES    │ │   BOOKINGS    │ │
│ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├───────────────┤ │
│ │ _id: ObjectId   │ │ _id: ObjectId   │ │ _id: ObjectId   │ │ _id: ObjectId │ │
│ │ userId: ObjectId│ │ userId: ObjectId│ │ userId: ObjectId│ │ userId: Object│
│ │ tenantId: String│ │ tenantId: String│ │ tenantId: String│ │ tenantId: Str │
│ │ name: String    │ │ name: String    │ │ name: String    │ │ bookingId: Str│
│ │ position: String│ │ review: String  │ │ position: Number│ │ customerName: │
│ │ image: String   │ │ rating: Number  │ │ published: Bool │ │ customerEmail:│
│ │ bio: String     │ │ image: String   │ │ createdAt: Date │ │ customerPhone:│
│ │ published: Bool │ │ position: Number│ │ updatedAt: Date │ │ packageId: Obj│
│ │ position: Number│ │ published: Bool │ │                 │ │ packageName:  │
│ │ createdAt: Date │ │ createdAt: Date │ │                 │ │ packagePrice: │
│ │ updatedAt: Date │ │ updatedAt: Date │ │                 │ │ numberOfPeople│
│ │                 │ │                 │ │                 │ │ startDate: Date│
│ │                 │ │                 │ │                 │ │ endDate: Date  │
│ │                 │ │                 │ │                 │ │ totalAmount:   │
│ │                 │ │                 │ │                 │ │ paymentStatus: │
│ │                 │ │                 │ │                 │ │ status: String │
│ │                 │ │                 │ │                 │ │ createdAt: Date│
│ │                 │ │                 │ │                 │ │ updatedAt: Date│
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

```

## Key Relationships

### 1. User → Content (1:Many)

- Every content item belongs to exactly one user
- User ID and Tenant ID are required on all content schemas
- This ensures complete data isolation between tenants

### 2. User → Bookings (1:Many)

- Every booking belongs to exactly one user (tour operator)
- Bookings reference packages that belong to the same user
- Payment and status tracking per tenant

### 3. Package → Bookings (1:Many)

- Packages can have multiple bookings
- Bookings reference the specific package being booked

## Data Isolation Strategy

### Tenant Isolation Pattern

```typescript
// All queries must include both userId and tenantId
const userContent = await Model.find({
  userId: userContext.userId,
  tenantId: userContext.tenantId,
});
```

### Subscription Enforcement

```typescript
// Check limits before creating content
if (!user.canCreateItem('packages')) {
  throw new Error('Package limit reached');
}

// Increment usage after creation
user.incrementUsage('packages');
```

## Index Strategy

### Critical Indexes

```typescript
// User indexes
{ email: 1 }
{ tenantId: 1 }
{ subscriptionPlan: 1 }
{ subscriptionStatus: 1 }

// Content indexes (all schemas)
{ userId: 1, tenantId: 1 }        // Compound index for tenant isolation
{ published: 1, userId: 1 }       // Filter published items by user
{ position: 1, userId: 1 }        // Order by position within user scope
{ createdAt: 1, userId: 1 }       // Order by creation date within user scope
```

## Subscription Limits

### Free Plan

- Packages: 3
- Destinations: 5
- Activities: 10
- Blogs: 5
- Team Members: 2
- Testimonials: 5

### Pro Plan

- Packages: 15
- Destinations: 15
- Activities: 50
- Blogs: 25
- Team Members: 10
- Testimonials: 20

### Pro Max Plan

- All items: Unlimited (-1)

## Security Model

### Data Access Control

1. **Authentication**: JWT-based user authentication
2. **Authorization**: Role-based access control (user, admin, super_admin)
3. **Tenant Isolation**: All data queries filtered by userId and tenantId
4. **Subscription Limits**: Real-time quota enforcement

### API Security Patterns

```typescript
// Middleware to extract user context
const getUserContext = async req => {
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

// All API endpoints must use this pattern
export async function GET(request) {
  const userContext = await getUserContext(request);
  const data = await Model.findByUser(userContext.userId, userContext.tenantId);
  return NextResponse.json({ data });
}
```

## Benefits of This Architecture

1. **Complete Data Isolation**: Each tenant's data is completely separate
2. **Scalable**: Shared database with tenant-specific filtering
3. **Secure**: Multi-layer security with tenant isolation
4. **Flexible**: Easy to add new content types
5. **Performance**: Optimized indexes for tenant-specific queries
6. **Subscription Management**: Built-in quota enforcement
7. **Analytics**: Usage tracking per tenant

## Migration Path

### Phase 1: Add Tenant Context

- Add userId and tenantId to all existing schemas
- Create migration scripts for existing data
- Update all API endpoints to use tenant filtering

### Phase 2: Implement Subscription Management

- Add subscription fields to User schema
- Implement usage tracking methods
- Add quota enforcement to all creation endpoints

### Phase 3: Add Booking System

- Create Booking schema with tenant isolation
- Implement payment processing
- Add booking management features

### Phase 4: Analytics and Monitoring

- Add usage analytics
- Implement performance monitoring
- Create admin dashboard for super admins

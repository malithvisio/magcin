# Apartment System Architecture Guide

## Overview

This system implements a multi-apartment architecture where each apartment/company has its own
separate codebase with hardcoded credentials. Each apartment operates independently with its own
domain, branding, and data isolation.

## Architecture Principles

### 1. Complete Apartment Isolation

- Each apartment has its own hardcoded configuration
- Separate domains for each apartment
- Complete data isolation using `companyId`
- Independent user management per apartment

### 2. Hardcoded Credentials

- Root user credentials are hardcoded for each apartment
- Company information is hardcoded
- Branding and styling are apartment-specific
- Subscription plans are hardcoded per apartment

### 3. Separate Deployments

- Each apartment has its own deployment configuration
- Independent Docker containers
- Separate environment files
- Custom Nginx configurations

## Apartment Configurations

### Apartment 1: Luxury Tourism

- **Domain**: luxurytourism.lk
- **Company**: Luxury Tourism Sri Lanka
- **Root User**: admin@luxurytourism.lk
- **Subscription**: Pro Max (Unlimited)
- **Features**: All features enabled
- **Branding**: Blue/Gold theme

### Apartment 2: Adventure Tourism

- **Domain**: adventuretourism.lk
- **Company**: Adventure Tourism Sri Lanka
- **Root User**: admin@adventuretourism.lk
- **Subscription**: Pro (Limited)
- **Features**: Most features enabled
- **Branding**: Green/Black theme

### Apartment 3: Cultural Tourism

- **Domain**: culturaltourism.lk
- **Company**: Cultural Tourism Sri Lanka
- **Root User**: admin@culturaltourism.lk
- **Subscription**: Free (Limited)
- **Features**: Basic features only
- **Branding**: Brown/Gold theme

## File Structure

```
tourstrails/
├── util/
│   ├── apartment-config.ts      # Hardcoded apartment configurations
│   └── apartment-auth.ts        # Apartment-specific authentication
├── scripts/
│   ├── setup-apartment.js       # Initialize apartment with root user
│   └── deploy-apartment.js      # Deploy apartment configuration
├── app/api/
│   └── auth/login/route.ts      # Apartment-aware login
├── models/
│   └── [All models with companyId filtering]
└── [Other application files]
```

## Configuration System

### 1. Apartment Configuration (`util/apartment-config.ts`)

```typescript
export interface ApartmentConfig {
  companyId: string;
  companyName: string;
  domain: string;
  rootUser: {
    name: string;
    email: string;
    password: string;
    role: 'super_admin';
  };
  subscriptionPlan: 'free' | 'pro' | 'pro_max';
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  features: {
    enableBlogs: boolean;
    enableTeam: boolean;
    enableTestimonials: boolean;
    enableBookings: boolean;
    enableAnalytics: boolean;
  };
}
```

### 2. Environment Variables

Each apartment uses environment variables to identify itself:

```bash
# Apartment 1
APARTMENT_ID=1
NEXT_PUBLIC_APARTMENT_NAME="Luxury Tourism Sri Lanka"
NEXT_PUBLIC_APARTMENT_DOMAIN=luxurytourism.lk

# Apartment 2
APARTMENT_ID=2
NEXT_PUBLIC_APARTMENT_NAME="Adventure Tourism Sri Lanka"
NEXT_PUBLIC_APARTMENT_DOMAIN=adventuretourism.lk

# Apartment 3
APARTMENT_ID=3
NEXT_PUBLIC_APARTMENT_NAME="Cultural Tourism Sri Lanka"
NEXT_PUBLIC_APARTMENT_DOMAIN=culturaltourism.lk
```

## Deployment Process

### 1. Setup Apartment Configuration

```bash
# Deploy Luxury Tourism
node scripts/deploy-apartment.js luxury-tourism

# Deploy Adventure Tourism
node scripts/deploy-apartment.js adventure-tourism

# Deploy Cultural Tourism
node scripts/deploy-apartment.js cultural-tourism
```

### 2. Initialize Apartment

```bash
# Setup Luxury Tourism
npm run setup:luxury-tourism

# Setup Adventure Tourism
npm run setup:adventure-tourism

# Setup Cultural Tourism
npm run setup:cultural-tourism
```

### 3. Development

```bash
# Start Luxury Tourism development
npm run dev:luxury-tourism

# Start Adventure Tourism development
npm run dev:adventure-tourism

# Start Cultural Tourism development
npm run dev:cultural-tourism
```

### 4. Production Deployment

```bash
# Deploy Luxury Tourism
npm run deploy:luxury-tourism

# Deploy Adventure Tourism
npm run deploy:adventure-tourism

# Deploy Cultural Tourism
npm run deploy:cultural-tourism
```

## Database Schema

### User Model (Apartment-Aware)

```typescript
{
  // Basic Information
  name: String,
  email: String,
  password: String,
  role: String,

  // Apartment Isolation
  companyId: String,        // Hardcoded per apartment
  tenantId: String,         // Unique per user within apartment

  // Subscription (Hardcoded per apartment)
  subscriptionPlan: String, // 'free', 'pro', 'pro_max'
  subscriptionStatus: String,

  // Company Information (Hardcoded)
  companyName: String,
  companyDescription: String,
  phoneNumber: String,
  whatsappNumber: String,
  website: String,
}
```

### Content Models (All Apartment-Aware)

```typescript
{
  // Apartment Isolation
  userId: ObjectId,         // Creator within apartment
  companyId: String,        // Hardcoded apartment ID
  tenantId: String,         // User's tenant ID

  // Content Fields
  name: String,
  title: String,
  // ... other content fields
}
```

## Authentication System

### 1. Apartment-Aware Login

```typescript
// Only users from this apartment can log in
const user = await User.findOne({
  email: email.toLowerCase(),
  companyId: getCompanyId(), // Hardcoded apartment ID
});
```

### 2. Data Filtering

```typescript
// All queries filter by apartment
const filter = createApartmentFilter();
const packages = await Package.find(filter);
```

### 3. Usage Tracking

```typescript
// Track usage per apartment
await incrementApartmentUsage('packages', userContext);
```

## API Endpoints

### All endpoints are apartment-aware:

```typescript
// GET /api/packages
// Returns only packages from this apartment
const filter = createApartmentFilter();
const packages = await Package.find(filter);

// POST /api/packages
// Creates package for this apartment only
const packageData = {
  ...body,
  companyId: userContext.companyId, // Hardcoded apartment ID
  userId: userContext.userId,
  tenantId: userContext.tenantId,
};
```

## Security Features

### 1. Complete Data Isolation

- All queries filter by `companyId`
- Users can only access their apartment's data
- No cross-apartment data access possible

### 2. Apartment-Specific Authentication

- Login only works for users from the correct apartment
- All API requests validate apartment membership
- Session data includes apartment context

### 3. Subscription Enforcement

- Each apartment has hardcoded subscription limits
- Usage tracking per apartment
- Upgrade prompts for apartment-specific limits

## Deployment Architecture

### 1. Docker Configuration

Each apartment gets its own Docker setup:

```yaml
# docker-compose.luxury-tourism.yml
services:
  luxury-tourism-app:
    ports:
      - '3001:3000'
    environment:
      - APARTMENT_ID=1
    env_file:
      - .env.luxury-tourism

  luxury-tourism-nginx:
    ports:
      - '801:80'
      - '804:443'
```

### 2. Nginx Configuration

Each apartment has custom Nginx config:

```nginx
# nginx/luxury-tourism.conf
server {
    listen 443 ssl http2;
    server_name luxurytourism.lk www.luxurytourism.lk;

    # SSL and security configuration
    # Proxy to luxury-tourism-app
}
```

### 3. Environment Files

Each apartment has its own environment:

```bash
# .env.luxury-tourism
APARTMENT_ID=1
NEXT_PUBLIC_APARTMENT_NAME="Luxury Tourism Sri Lanka"
NEXT_PUBLIC_APARTMENT_DOMAIN=luxurytourism.lk
NEXT_PUBLIC_PRIMARY_COLOR=#1a365d
NEXT_PUBLIC_SECONDARY_COLOR=#e53e3e
```

## Usage Examples

### 1. Creating New Apartment

```bash
# 1. Add apartment configuration to apartment-config.ts
export const APARTMENT_4_CONFIG: ApartmentConfig = {
  companyId: 'apartment_eco_tourism_004',
  companyName: 'Eco Tourism Sri Lanka',
  domain: 'ecotourism.lk',
  rootUser: {
    name: 'Eco Tourism Admin',
    email: 'admin@ecotourism.lk',
    password: 'EcoTourism2024!',
    role: 'super_admin',
  },
  // ... other configuration
};

# 2. Deploy apartment
node scripts/deploy-apartment.js eco-tourism

# 3. Setup apartment
npm run setup:eco-tourism

# 4. Start development
npm run dev:eco-tourism
```

### 2. Adding Users to Apartment

```typescript
// Create user for specific apartment
const newUser = new User({
  name: 'John Doe',
  email: 'john@luxurytourism.lk',
  password: hashedPassword,
  companyId: 'apartment_luxury_tourism_001', // Hardcoded apartment ID
  role: 'user',
});
```

### 3. Managing Apartment Content

```typescript
// All content is automatically filtered by apartment
const packages = await Package.findByCompany(getCompanyId());
const destinations = await Destination.findByCompany(getCompanyId());
const blogs = await Blog.findByCompany(getCompanyId());
```

## Benefits

### 1. Complete Isolation

- Each apartment operates independently
- No data mixing between apartments
- Secure multi-tenant architecture

### 2. Customization

- Each apartment has unique branding
- Custom features per apartment
- Independent subscription plans

### 3. Scalability

- Easy to add new apartments
- Independent scaling per apartment
- Separate deployment pipelines

### 4. Security

- Hardcoded credentials prevent unauthorized access
- Complete data isolation
- Apartment-specific authentication

## Monitoring and Maintenance

### 1. Apartment-Specific Logs

```bash
# View logs for specific apartment
docker-compose -f docker-compose.luxury-tourism.yml logs

# Monitor apartment performance
docker stats luxury-tourism-app
```

### 2. Database Monitoring

```bash
# Check apartment data
db.packages.find({ companyId: "apartment_luxury_tourism_001" })

# Monitor apartment usage
db.users.find({ companyId: "apartment_luxury_tourism_001" })
```

### 3. Backup and Recovery

```bash
# Backup specific apartment data
mongodump --db tourism_cms --collection packages --query '{"companyId": "apartment_luxury_tourism_001"}'

# Restore apartment data
mongorestore --db tourism_cms --collection packages dump/tourism_cms/packages.bson
```

## Troubleshooting

### 1. Apartment Not Loading

- Check `APARTMENT_ID` environment variable
- Verify apartment configuration exists
- Check database connection

### 2. Authentication Issues

- Verify user belongs to correct apartment
- Check hardcoded credentials
- Validate apartment configuration

### 3. Data Isolation Issues

- Ensure all queries use `companyId` filter
- Check apartment authentication middleware
- Verify database indexes

## Conclusion

This apartment system provides a robust, scalable, and secure foundation for managing multiple
tourism companies. Each apartment operates independently with complete data isolation, custom
branding, and hardcoded credentials ensuring maximum security and customization flexibility.

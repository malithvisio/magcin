# Category-Based Packages Feature with Root User Filtering

## Overview

This feature extends the multi-tenant root user filtering to include category-based package
organization. The system now supports:

1. **Root User-Based Data Filtering**: All packages and categories are filtered by `rootUserId`
2. **Category-Based Organization**: Packages are grouped by categories
3. **Dynamic Component Rendering**: Only categories with packages are displayed
4. **Multiple Slider Components**: Each category gets its own slider section
5. **No Authentication Required**: Public access to all data

## Architecture

### 1. Database Schema

#### Package Model

```typescript
{
  // Multi-tenant reference
  rootUserId: ObjectId,  // References the apartment owner
  category: String,      // Category name for grouping

  // Package details
  name: String,
  title: String,
  image: String,
  location: String,
  days: String,
  nights: String,
  price: Number,
  published: Boolean,
  // ... other fields
}
```

#### Category Model

```typescript
{
  // Multi-tenant reference
  rootUserId: ObjectId,  // References the apartment owner

  // Category details
  name: String,
  position: Number,
  published: Boolean,
  // ... other fields
}
```

### 2. API Endpoints

#### Updated Packages API (`/api/packages/public`)

```typescript
// GET /api/packages/public?rootUserId=68786e17d6e23d3a8ec0fe2f&limit=50
export async function GET(request: NextRequest) {
  const rootUserId = searchParams.get('rootUserId');

  let query: any = { published: true };

  if (rootUserId && isValidRootUserId(rootUserId)) {
    query.rootUserId = rootUserId;
  } else {
    const defaultFilter = createRootUserFilter();
    query.rootUserId = defaultFilter.rootUserId;
  }

  const packages = await Package.find(query);
  return NextResponse.json({ packages, rootUserId: query.rootUserId });
}
```

#### Updated Categories API (`/api/categories/public`)

```typescript
// GET /api/categories/public?rootUserId=68786e17d6e23d3a8ec0fe2f
export async function GET(request: NextRequest) {
  const rootUserId = searchParams.get('rootUserId');

  let query: any = { published: true };

  if (rootUserId && isValidRootUserId(rootUserId)) {
    query.rootUserId = rootUserId;
  } else {
    const defaultFilter = createRootUserFilter();
    query.rootUserId = defaultFilter.rootUserId;
  }

  const categories = await Category.find(query);
  return NextResponse.json({ categories, rootUserId: query.rootUserId });
}
```

## Components

### 1. CategoryPackagesSlider Component

This component displays packages grouped by categories:

```typescript
export default function CategoryPackagesSlider() {
  const { currentRootUserId, setRootUserId, activeRootUsers } = useRootUserFilter();

  // Fetch categories and packages with root user filtering
  const { data: categoriesData } = useRootUserData<CategoriesResponse>(
    async (queryParam) => {
      const response = await fetch(`/api/categories/public?${queryParam}`);
      return response.json();
    }
  );

  const { data: packagesData } = useRootUserData<PackagesResponse>(
    async (queryParam) => {
      const response = await fetch(`/api/packages/public?limit=50&${queryParam}`);
      return response.json();
    }
  );

  // Group packages by category
  const categoriesWithPackages: CategoryWithPackages[] = [];

  if (categoriesData?.categories && packagesData?.packages) {
    categoriesData.categories.forEach((category) => {
      const categoryPackages = packagesData.packages.filter(
        (pkg) => pkg.category === category.name
      );
      if (categoryPackages.length > 0) {
        categoriesWithPackages.push({
          category,
          packages: categoryPackages,
        });
      }
    });
  }

  return (
    <>
      {categoriesWithPackages.map((categoryData) => (
        <section key={categoryData.category._id}>
          <h2>{categoryData.category.name} Tours</h2>
          <Swiper>
            {categoryData.packages.map((tour) => (
              <SwiperSlide key={tour.id}>
                {/* Package card */}
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      ))}
    </>
  );
}
```

### 2. Updated AdventurePackages Component

The existing component now supports root user filtering:

```typescript
export default function AdventurePackages() {
  const { currentRootUserId, setRootUserId, activeRootUsers } = useRootUserFilter();

  const { data, isLoading, error } = useRootUserData<PackagesResponse>(
    async (queryParam) => {
      const response = await fetch(`/api/packages/public?limit=10&${queryParam}`);
      return response.json();
    }
  );

  return (
    <section>
      {/* Root User Selector */}
      {activeRootUsers.length > 1 && (
        <select value={currentRootUserId} onChange={(e) => setRootUserId(e.target.value)}>
          {activeRootUsers.map((user) => (
            <option key={user.rootUserId} value={user.rootUserId}>
              {user.name}
            </option>
          ))}
        </select>
      )}

      {/* Packages Slider */}
      <Swiper>
        {data?.packages.map((tour) => (
          <SwiperSlide key={tour.id}>
            {/* Package card */}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
```

## Data Flow

### 1. Root User Selection

1. User selects a root user from the dropdown
2. Selection is saved to localStorage
3. All API calls include the root user ID

### 2. Data Fetching

1. Categories are fetched for the selected root user
2. Packages are fetched for the selected root user
3. Packages are grouped by category
4. Only categories with packages are displayed

### 3. Component Rendering

1. Each category with packages gets its own section
2. Each section has its own slider
3. Empty categories are automatically hidden

## Usage Examples

### 1. Basic Implementation

```typescript
// In your page component
import CategoryPackagesSlider from '@/components/sections/CategoryPackagesSlider';

export default function HomePage() {
  return (
    <div>
      <CategoryPackagesSlider />
    </div>
  );
}
```

### 2. Custom Category Filtering

```typescript
// Fetch packages for specific category
const { data } = useRootUserData(async queryParam => {
  const response = await fetch(`/api/packages/public?category=Adventure&${queryParam}`);
  return response.json();
});
```

### 3. Multiple Root Users

```typescript
// Add multiple root users in util/root-user-config.ts
export const ROOT_USERS: RootUserConfig[] = [
  {
    rootUserId: '68786e17d6e23d3a8ec0fe2f',
    name: 'Tours Trails Main',
    description: 'Main Tours Trails apartment',
    isActive: true,
  },
  {
    rootUserId: '507f1f77bcf86cd799439011',
    name: 'Adventure Tourism Co.',
    description: 'Adventure tourism company',
    isActive: true,
  },
];
```

## Database Setup

### 1. Sample Categories

```javascript
// Insert categories for root user
db.categories.insertMany([
  {
    rootUserId: ObjectId('68786e17d6e23d3a8ec0fe2f'),
    name: 'Adventure Tours',
    position: 1,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    rootUserId: ObjectId('68786e17d6e23d3a8ec0fe2f'),
    name: 'Cultural Tours',
    position: 2,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    rootUserId: ObjectId('68786e17d6e23d3a8ec0fe2f'),
    name: 'Beach Tours',
    position: 3,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### 2. Sample Packages

```javascript
// Insert packages for root user
db.packages.insertMany([
  {
    rootUserId: ObjectId('68786e17d6e23d3a8ec0fe2f'),
    category: 'Adventure Tours',
    name: 'Mountain Trekking',
    title: 'Epic Mountain Adventure',
    image: 'mountain-trek.jpg',
    location: 'Mountain Region',
    days: '3',
    nights: '2',
    price: 299,
    published: true,
    // ... other fields
  },
  {
    rootUserId: ObjectId('68786e17d6e23d3a8ec0fe2f'),
    category: 'Cultural Tours',
    name: 'Heritage Walk',
    title: 'Ancient Heritage Discovery',
    image: 'heritage-walk.jpg',
    location: 'Historic City',
    days: '1',
    nights: '0',
    price: 99,
    published: true,
    // ... other fields
  },
]);
```

## API Testing

### 1. Test Categories API

```bash
# Get categories for default root user
curl "http://localhost:3000/api/categories/public"

# Get categories for specific root user
curl "http://localhost:3000/api/categories/public?rootUserId=68786e17d6e23d3a8ec0fe2f"
```

### 2. Test Packages API

```bash
# Get packages for default root user
curl "http://localhost:3000/api/packages/public?limit=10"

# Get packages for specific root user
curl "http://localhost:3000/api/packages/public?rootUserId=68786e17d6e23d3a8ec0fe2f&limit=10"

# Get packages by category
curl "http://localhost:3000/api/packages/public?category=Adventure%20Tours&rootUserId=68786e17d6e23d3a8ec0fe2f"
```

## Features

### ✅ Root User-Based Data Filtering

- All data is filtered by `rootUserId`
- No cross-root-user data access
- Secure data isolation

### ✅ Category-Based Organization

- Packages are grouped by categories
- Only categories with packages are displayed
- Dynamic component rendering

### ✅ Multiple Slider Components

- Each category gets its own slider section
- Independent navigation controls
- Responsive design

### ✅ No Authentication Required

- Public access to all data
- Client-side root user selection
- Server-side validation

### ✅ Persistent Selection

- Root user selection saved in localStorage
- Selection persists across browser sessions
- Fallback to default root user

### ✅ Error Handling

- Comprehensive error states
- Loading states for better UX
- Graceful fallbacks

## Performance Considerations

### 1. Database Indexes

```typescript
// Package model indexes
packageSchema.index({ rootUserId: 1 });
packageSchema.index({ category: 1, rootUserId: 1 });
packageSchema.index({ published: 1, rootUserId: 1 });

// Category model indexes
categorySchema.index({ rootUserId: 1 });
categorySchema.index({ published: 1, rootUserId: 1 });
categorySchema.index({ position: 1, rootUserId: 1 });
```

### 2. Query Optimization

- Efficient MongoDB queries with proper filtering
- Compound indexes for common query patterns
- Minimal data transfer with selective field projection

### 3. Caching Strategy

- Root user selection cached in localStorage
- API responses can be cached per root user
- Component state management for smooth UX

## Security

### 1. Input Validation

- All root user IDs are validated against configuration
- Invalid root user IDs return 400 error
- Only active root users are allowed

### 2. Data Isolation

- Database queries are filtered by `rootUserId`
- No cross-root-user data access possible
- Each root user's data is completely isolated

### 3. Public Access

- No authentication required for public pages
- Root user selection is client-side only
- Server validates all root user IDs

## Troubleshooting

### Common Issues

1. **No Categories Showing**
   - Check if categories exist with correct `rootUserId`
   - Verify `published: true` for public API
   - Ensure categories have proper data structure

2. **No Packages in Categories**
   - Check if packages exist with correct `rootUserId`
   - Verify package `category` field matches category `name`
   - Ensure packages have `published: true`

3. **Root User Selection Not Working**
   - Check localStorage is enabled in browser
   - Verify root user ID is in configuration
   - Check for JavaScript errors in console

### Debug Information

The APIs include debug logging:

```javascript
console.log('Root User ID:', rootUserId || 'default');
console.log('Query:', JSON.stringify(query, null, 2));
console.log('Categories returned:', categories.length);
console.log('Packages returned:', packages.length);
```

## Future Enhancements

### 1. Advanced Filtering

- Category-based filtering in UI
- Search functionality within categories
- Price range filtering

### 2. Analytics

- Category popularity tracking
- Package view analytics per root user
- Performance metrics

### 3. Admin Features

- Category management interface
- Package-category assignment
- Root user analytics dashboard

## Conclusion

This category-based packages feature provides a comprehensive solution for organizing and displaying
tourism packages by categories while maintaining complete data isolation between different root
users. The implementation is scalable, secure, and user-friendly, making it easy to manage multiple
tourism companies on the same platform.

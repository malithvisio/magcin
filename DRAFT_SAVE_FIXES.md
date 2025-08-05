# Draft Save Functionality Fixes

## Problem

When users clicked "Save as Draft" in the admin panel, they were getting validation errors like:

- "Exclusions are required"
- "Inclusions are required"
- "Main image is required"
- "Reviewer name is required"
- "Stars rating is required"
- "Review text is required"
- "Question is required"
- "Answer is required"
- "Hotel name is required"
- "Location name is required"
- "Latitude is required"
- "Longitude is required"
- "Day is required"
- "Day title is required"
- "Day description is required"
- "Day activity is required"

## Root Cause

The MongoDB schemas had required fields that were being validated even when saving as draft. The API
routes were not providing default values for required fields during draft saves, causing MongoDB
validation errors.

## Solution

Updated the API routes to handle draft saves properly by:

1. **Detecting draft saves** using the `isDraft` flag
2. **Providing default values** for all required fields when `isDraft === true`
3. **Bypassing validation** for draft saves
4. **Preserving user input** while filling in missing required fields with sensible defaults

## Files Modified

### 1. `app/api/packages/route.ts`

- Added draft detection logic
- Provided default values for all required Package model fields
- Skip validation for draft saves
- Only increment usage for non-draft saves

### 2. `app/api/packages/[id]/route.ts`

- Updated PUT method to handle draft saves
- Added default values for required fields
- Skip validation for draft saves using `runValidators: !isDraft`

### 3. `app/api/testimonials/route.ts`

- Added default values for required fields (name, review, rating)
- Preserved existing draft detection logic

### 4. `app/api/team/route.ts`

- Added default values for required fields (name, position)
- Preserved existing draft detection logic

### 5. `app/api/blogs/route.ts`

- Added default values for required fields (title, description, author)
- Preserved existing draft detection logic

### 6. `app/api/destinations/route.ts`

- Enhanced auto-generation logic for draft saves
- Added comprehensive default values for all required fields
- Preserved existing draft detection logic

## Default Values Provided

### Packages

- `name`: "Draft Package"
- `title`: "Draft Package"
- `image`: ""
- `summery`: "Draft package summary"
- `location`: "Draft location"
- `duration`: "Draft duration"
- `days`: "1"
- `nights`: "1"
- `destinations`: "1"
- `type`: "tour"
- `mini_discription`: "Draft mini description"
- `description`: "Draft description"
- `highlights`: ["Draft highlight"]
- `inclusions`: ["Draft inclusion"]
- `exclusions`: ["Draft exclusion"]
- `category`: "65f1a2b3c4d5e6f7a8b9c0d1"
- `itinerary`: []
- `locations`: []
- `accommodationPlaces`: []
- `guidelinesFaqs`: []
- `packageReviews`: []

### Testimonials

- `name`: "Draft Testimonial"
- `review`: "Draft review text"
- `rating`: 5

### Team Members

- `name`: "Draft Team Member"
- `position`: "Draft Position"

### Blogs

- `title`: "Draft Blog Post"
- `description`: "Draft blog description"
- `author`: "Admin"

### Destinations

- `id`: "draft\_{timestamp}"
- `name`: "Draft Destination"
- `images`: [""]
- `imageUrl`: ""
- `imageAlt`: ""
- `reviewStars`: 0
- `to_do`: "Things to do in this destination"
- `Highlight`: ["Draft highlight"]
- `call_tagline`: "Discover this amazing destination"
- `background`: "Experience the beauty of this destination"
- `location`: "Draft location"
- `mini_description`: "A wonderful destination to explore"
- `description`: "This is a beautiful destination with many attractions and activities to enjoy."
- `moredes`: ""
- `position`: 0
- `published`: false
- `highlight`: false

## Behavior Changes

### Before

- Users could not save partial data as drafts
- All required fields had to be filled before saving
- Validation errors prevented draft saves

### After

- Users can save any partial data as drafts
- Empty fields are filled with sensible defaults
- Draft saves bypass validation
- User input is preserved and takes priority over defaults
- Draft packages are marked as `published: false`

## Testing

To test the draft save functionality:

1. Go to any admin form (Packages, Destinations, Blogs, etc.)
2. Fill in only some fields (leave others empty)
3. Click "Save as Draft"
4. Verify that the save succeeds without validation errors
5. Check that the saved data includes both user input and default values

## Notes

- Draft saves do not increment usage quotas
- Draft items are marked as `published: false`
- User input always takes priority over default values
- The `isDraft` flag must be set to `true` in the request body
- All existing functionality for publishing remains unchanged

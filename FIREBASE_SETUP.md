# Firebase Setup for TourTrails

This document explains how Firebase has been integrated into your TourTrails project.

## What's Been Set Up

### 1. Firebase Configuration

- **File**: `lib/firebase.ts`
- **Services**: Authentication, Firestore, Storage, Analytics
- **Configuration**: Uses your supervisor's Firebase project (visiotourism)

### 2. Firebase Utilities

- **File**: `util/firebase-utils.ts`
- **Features**:
  - Authentication (login, signup, logout)
  - Firestore operations (CRUD)
  - Storage operations (upload, delete, get URL)
  - Error handling and type safety

### 3. Updated AuthContext

- **File**: `contexts/AuthContext.tsx`
- **Features**:
  - Maintains compatibility with existing authentication
  - Adds Firebase authentication methods
  - Provides both local user and Firebase user states

## Firebase Services Available

### Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { firebaseLogin, firebaseSignUp, firebaseLogout, firebaseUser } = useAuth();

// Login
const result = await firebaseLogin(email, password);

// Sign up
const result = await firebaseSignUp(email, password, userData);

// Logout
const result = await firebaseLogout();
```

### Firestore Database

```typescript
import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
} from '@/util/firebase-utils';

// Create a document
const result = await createDocument('tours', tourData);

// Get a document
const result = await getDocument('tours', tourId);

// Update a document
const result = await updateDocument('tours', tourId, updatedData);

// Delete a document
const result = await deleteDocument('tours', tourId);

// Query documents
const result = await queryDocuments(
  'tours',
  [{ field: 'category', operator: '==', value: 'adventure' }],
  'createdAt',
  'desc',
  10
);
```

### Storage

```typescript
import { uploadFile, deleteFile, getFileURL } from '@/util/firebase-utils';

// Upload a file
const result = await uploadFile(file, 'tours/images/tour1.jpg');

// Delete a file
const result = await deleteFile('tours/images/tour1.jpg');

// Get file URL
const result = await getFileURL('tours/images/tour1.jpg');
```

## Example Usage

### 1. Firebase Authentication Component

See `components/auth/FirebaseAuthExample.tsx` for a complete example of how to implement Firebase
authentication.

### 2. Using Firebase in Your Components

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { createDocument, queryDocuments } from '@/util/firebase-utils';

const MyComponent = () => {
  const { firebaseUser, firebaseLogin } = useAuth();

  const handleCreateTour = async () => {
    if (!firebaseUser) return;

    const tourData = {
      title: 'Amazing Tour',
      description: 'An amazing tour description',
      price: 99.99,
      userId: firebaseUser.uid
    };

    const result = await createDocument('tours', tourData);
    if (result.success) {
      console.log('Tour created with ID:', result.id);
    }
  };

  const handleGetTours = async () => {
    const result = await queryDocuments('tours', [], 'createdAt', 'desc', 10);
    if (result.success) {
      console.log('Tours:', result.data);
    }
  };

  return (
    <div>
      {firebaseUser ? (
        <div>
          <p>Welcome, {firebaseUser.email}!</p>
          <button onClick={handleCreateTour}>Create Tour</button>
          <button onClick={handleGetTours}>Get Tours</button>
        </div>
      ) : (
        <button onClick={() => firebaseLogin('user@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
};
```

## Firebase Project Configuration

Your Firebase project is configured with:

- **Project ID**: visiotourism
- **Auth Domain**: visiotourism.firebaseapp.com
- **Storage Bucket**: visiotourism.firebasestorage.app
- **Analytics ID**: G-G9YSE3GVNN

## Security Rules

Make sure to set up proper security rules in your Firebase console:

### Firestore Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read tours, but only creators can write
    match /tours/{tourId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules Example

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Next Steps

1. **Enable Authentication Methods**: Go to Firebase Console > Authentication > Sign-in method and
   enable Email/Password
2. **Set Up Firestore**: Go to Firebase Console > Firestore Database and create your database
3. **Configure Storage**: Go to Firebase Console > Storage and set up your storage bucket
4. **Test the Integration**: Use the `FirebaseAuthExample` component to test authentication
5. **Add Security Rules**: Configure proper security rules for your data
6. **Integrate with Your App**: Start using Firebase services in your existing components

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This happens if Firebase is initialized multiple times
   - The current setup prevents this by checking for existing instances

2. **Analytics not working**
   - Analytics only works on the client side
   - The setup includes a check for `typeof window !== 'undefined'`

3. **Authentication not persisting**
   - Firebase Auth automatically persists user sessions
   - Check if you're calling `signOutUser()` somewhere

### Debug Tips

1. Check browser console for Firebase errors
2. Verify Firebase configuration in `lib/firebase.ts`
3. Ensure Firebase services are enabled in your Firebase console
4. Check network tab for failed requests to Firebase

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)

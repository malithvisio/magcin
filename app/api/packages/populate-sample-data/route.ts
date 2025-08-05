import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Package from '@/models/Package';
import { createRootUserFilter } from '@/util/root-user-config';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const defaultFilter = createRootUserFilter();
    const rootUserId = defaultFilter.rootUserId;

    console.log('=== POPULATING SAMPLE DATA ===');
    console.log('Root User ID:', rootUserId);

    // Sample categories
    const sampleCategories = [
      {
        name: 'Cultural Tours',
        position: 1,
        published: true,
        rootUserId: rootUserId,
      },
      {
        name: 'Adventure Tours',
        position: 2,
        published: true,
        rootUserId: rootUserId,
      },
      {
        name: 'Honeymoon Packages',
        position: 3,
        published: true,
        rootUserId: rootUserId,
      },
      {
        name: 'Wildlife Safaris',
        position: 4,
        published: true,
        rootUserId: rootUserId,
      },
      {
        name: 'Pilgrimage Tours',
        position: 5,
        published: true,
        rootUserId: rootUserId,
      },
    ];

    // Create categories
    const createdCategories = [];
    for (const categoryData of sampleCategories) {
      const existingCategory = await Category.findOne({
        name: categoryData.name,
        rootUserId: rootUserId,
      });

      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        createdCategories.push(category);
        console.log('Created category:', category.name);
      } else {
        createdCategories.push(existingCategory);
        console.log('Category already exists:', existingCategory.name);
      }
    }

    // Sample packages based on the existing data structure
    const samplePackages = [
      {
        id: 'cultural-heritage-tour',
        name: 'Cultural Heritage Tour',
        title: "Discover Sri Lanka's Ancient Kingdoms",
        image: '/assets/images/packages/cultural/dambulla.avif',
        location: 'Sigiriya, Kandy, Anuradhapura',
        days: '7',
        nights: '6',
        rating: 4.8,
        reviews: 45,
        type: 'Cultural Tour',
        category: createdCategories.find(c => c.name === 'Cultural Tours')?._id,
        published: true,
        rootUserId: rootUserId,
        summery:
          'Explore the ancient kingdoms of Sri Lanka with visits to UNESCO World Heritage sites.',
        mini_discription:
          "A comprehensive journey through Sri Lanka's rich cultural heritage.",
        highlights: [
          'Visit Sigiriya Rock Fortress',
          'Explore Temple of the Tooth in Kandy',
          'Discover ancient ruins of Anuradhapura',
        ],
        inclusions: [
          'Accommodation in 4-star hotels',
          'Daily breakfast and dinner',
          'Professional English-speaking guide',
          'All entrance fees',
        ],
        exclusions: [
          'International flights',
          'Lunch and beverages',
          'Personal expenses',
        ],
      },
      {
        id: 'adventure-trekking',
        name: 'Adventure Trekking',
        title: 'Mountain Adventure & Tea Country',
        image: '/assets/images/packages/package5/pkj5.jpg',
        location: 'Nuwara Eliya, Ella, Horton Plains',
        days: '5',
        nights: '4',
        rating: 4.9,
        reviews: 32,
        type: 'Adventure Tour',
        category: createdCategories.find(c => c.name === 'Adventure Tours')
          ?._id,
        published: true,
        rootUserId: rootUserId,
        summery:
          'Experience the thrill of mountain trekking and tea country adventures.',
        mini_discription:
          "Adventure through Sri Lanka's scenic hill country and tea plantations.",
        highlights: [
          "Hike Little Adam's Peak",
          'Visit Horton Plains National Park',
          'Tea plantation tours',
        ],
        inclusions: [
          'Accommodation in mountain lodges',
          'All trekking equipment',
          'Experienced trekking guide',
          'Meals during treks',
        ],
        exclusions: [
          'International flights',
          'Personal trekking gear',
          'Tips and gratuities',
        ],
      },
      {
        id: 'romantic-honeymoon',
        name: 'Romantic Honeymoon',
        title: 'Luxury Honeymoon Escape',
        image: '/assets/images/packages/honeymoon/honeymoon45.png',
        location: 'Bentota, Kandy, Nuwara Eliya',
        days: '8',
        nights: '7',
        rating: 5.0,
        reviews: 28,
        type: 'Honeymoon Package',
        category: createdCategories.find(c => c.name === 'Honeymoon Packages')
          ?._id,
        published: true,
        rootUserId: rootUserId,
        summery:
          'A romantic journey perfect for newlyweds with luxury accommodations.',
        mini_discription:
          'Create unforgettable memories with your loved one in paradise.',
        highlights: [
          'Private beach dinners',
          'Luxury spa treatments',
          'Romantic sunset cruises',
        ],
        inclusions: [
          'Luxury accommodation',
          'Private transfers',
          'Romantic dining experiences',
          'Spa treatments for couples',
        ],
        exclusions: [
          'International flights',
          'Personal shopping',
          'Optional activities',
        ],
      },
      {
        id: 'wildlife-safari',
        name: 'Wildlife Safari',
        title: 'Yala & Udawalawe Safari Adventure',
        image: '/assets/images/packages/package5/wildlife33.webp',
        location: 'Yala National Park, Udawalawe',
        days: '4',
        nights: '3',
        rating: 4.7,
        reviews: 38,
        type: 'Wildlife Safari',
        category: createdCategories.find(c => c.name === 'Wildlife Safaris')
          ?._id,
        published: true,
        rootUserId: rootUserId,
        summery:
          "Experience the thrill of wildlife safaris in Sri Lanka's premier national parks.",
        mini_discription:
          'Spot leopards, elephants, and diverse wildlife in their natural habitat.',
        highlights: [
          'Morning and evening safaris',
          'Leopard spotting in Yala',
          'Elephant herds in Udawalawe',
        ],
        inclusions: [
          'Safari lodge accommodation',
          'Professional safari guide',
          'All safari permits',
          'Meals at lodge',
        ],
        exclusions: [
          'International flights',
          'Camera equipment',
          'Personal expenses',
        ],
      },
      {
        id: 'pilgrimage-spiritual',
        name: 'Pilgrimage & Spiritual',
        title: 'Sacred Temples & Spiritual Journey',
        image: '/assets/images/packages/ramayana/Ravana-cave.jpg',
        location: 'Kataragama, Anuradhapura, Kandy',
        days: '6',
        nights: '5',
        rating: 4.6,
        reviews: 25,
        type: 'Pilgrimage Tour',
        category: createdCategories.find(c => c.name === 'Pilgrimage Tours')
          ?._id,
        published: true,
        rootUserId: rootUserId,
        summery:
          "A spiritual journey to Sri Lanka's most sacred temples and religious sites.",
        mini_discription:
          'Connect with your spiritual side at ancient temples and holy sites.',
        highlights: [
          'Visit Temple of the Tooth',
          'Kataragama pilgrimage',
          'Ancient Buddhist temples',
        ],
        inclusions: [
          'Accommodation near temples',
          'Religious guide services',
          'Temple entrance fees',
          'Traditional meals',
        ],
        exclusions: [
          'International flights',
          'Personal offerings',
          'Optional rituals',
        ],
      },
    ];

    // Create packages
    const createdPackages = [];
    for (const packageData of samplePackages) {
      const existingPackage = await Package.findOne({
        id: packageData.id,
        rootUserId: rootUserId,
      });

      if (!existingPackage) {
        const pkg = new Package(packageData);
        await pkg.save();
        createdPackages.push(pkg);
        console.log('Created package:', pkg.name);
      } else {
        createdPackages.push(existingPackage);
        console.log('Package already exists:', existingPackage.name);
      }
    }

    return NextResponse.json({
      message: 'Sample data populated successfully',
      categories: {
        created: createdCategories.length,
        total: await Category.countDocuments({ rootUserId }),
      },
      packages: {
        created: createdPackages.length,
        total: await Package.countDocuments({ rootUserId }),
      },
    });
  } catch (error) {
    console.error('Error populating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to populate sample data' },
      { status: 500 }
    );
  }
}

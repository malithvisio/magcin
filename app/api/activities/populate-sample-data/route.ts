import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { createRootUserFilter } from '@/util/root-user-config';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const defaultFilter = createRootUserFilter();
    const rootUserId = defaultFilter.rootUserId;
    const userId = rootUserId; // Use same ID for user
    const companyId = 'tours-trails-main'; // Default company ID
    const tenantId = 'tours-trails-main'; // Default tenant ID

    console.log('=== POPULATING ACTIVITIES SAMPLE DATA ===');
    console.log('Root User ID:', rootUserId);

    // Sample activities data
    const sampleActivities = [
      {
        name: 'Mountain Trekking',
        title: 'Epic Mountain Adventure',
        description:
          'Experience the thrill of mountain trekking with breathtaking views',
        imageUrl: '/assets/images/activities/mountain-trekking.jpg',
        altText: 'Mountain trekking adventure',
        reviewStars: 4.8,
        highlight: true,
        insideTitle: 'Mountain Trekking Adventure',
        insideDescription:
          'Embark on an unforgettable mountain trekking adventure that will challenge your limits and reward you with spectacular views. Our experienced guides will lead you through pristine trails, sharing their knowledge of the local flora and fauna.',
        insideImageUrl:
          '/assets/images/activities/mountain-trekking-inside.jpg',
        insideImageAlt: 'Mountain trekking experience',
        insideShortDescription:
          'Challenge yourself with our epic mountain trekking adventure',
        insideTabTitle: 'Trekking Details',
        published: true,
        position: 1,
        userId: userId,
        rootUserId: rootUserId,
        companyId: companyId,
        tenantId: tenantId,
      },
      {
        name: 'Wildlife Safari',
        title: 'Wildlife Safari Experience',
        description: 'Discover amazing wildlife in their natural habitat',
        imageUrl: '/assets/images/activities/wildlife-safari.jpg',
        altText: 'Wildlife safari experience',
        reviewStars: 4.9,
        highlight: true,
        insideTitle: 'Wildlife Safari Adventure',
        insideDescription:
          'Get up close and personal with magnificent wildlife in their natural habitat. Our safari tours are designed to provide the best wildlife viewing opportunities while ensuring the safety and comfort of our guests.',
        insideImageUrl: '/assets/images/activities/wildlife-safari-inside.jpg',
        insideImageAlt: 'Wildlife safari experience',
        insideShortDescription: 'Experience wildlife in their natural habitat',
        insideTabTitle: 'Safari Information',
        published: true,
        position: 2,
        userId: userId,
        rootUserId: rootUserId,
        companyId: companyId,
        tenantId: tenantId,
      },
      {
        name: 'Cultural Heritage Tour',
        title: 'Cultural Heritage Discovery',
        description: 'Explore ancient temples and cultural sites',
        imageUrl: '/assets/images/activities/cultural-heritage.jpg',
        altText: 'Cultural heritage tour',
        reviewStars: 4.7,
        highlight: false,
        insideTitle: 'Cultural Heritage Tour',
        insideDescription:
          'Immerse yourself in the rich cultural heritage of our region. Visit ancient temples, historical sites, and learn about the traditions and customs that have shaped our society for centuries.',
        insideImageUrl:
          '/assets/images/activities/cultural-heritage-inside.jpg',
        insideImageAlt: 'Cultural heritage sites',
        insideShortDescription: 'Discover ancient temples and cultural sites',
        insideTabTitle: 'Cultural Information',
        published: true,
        position: 3,
        userId: userId,
        rootUserId: rootUserId,
        companyId: companyId,
        tenantId: tenantId,
      },
      {
        name: 'Water Sports',
        title: 'Water Sports Adventure',
        description: 'Exciting water sports activities for thrill seekers',
        imageUrl: '/assets/images/activities/water-sports.jpg',
        altText: 'Water sports activities',
        reviewStars: 4.6,
        highlight: false,
        insideTitle: 'Water Sports Adventure',
        insideDescription:
          'Dive into excitement with our range of water sports activities. From snorkeling and diving to jet skiing and parasailing, we offer thrilling water adventures for all skill levels.',
        insideImageUrl: '/assets/images/activities/water-sports-inside.jpg',
        insideImageAlt: 'Water sports activities',
        insideShortDescription: 'Thrilling water sports for adventure seekers',
        insideTabTitle: 'Water Sports Info',
        published: true,
        position: 4,
        userId: userId,
        rootUserId: rootUserId,
        companyId: companyId,
        tenantId: tenantId,
      },
      {
        name: 'Tea Plantation Tour',
        title: 'Tea Plantation Experience',
        description: 'Learn about tea production and enjoy scenic views',
        imageUrl: '/assets/images/activities/tea-plantation.jpg',
        altText: 'Tea plantation tour',
        reviewStars: 4.5,
        highlight: false,
        insideTitle: 'Tea Plantation Tour',
        insideDescription:
          'Discover the fascinating world of tea production with our guided tea plantation tours. Learn about the tea-making process from leaf to cup while enjoying the stunning scenery of rolling tea gardens.',
        insideImageUrl: '/assets/images/activities/tea-plantation-inside.jpg',
        insideImageAlt: 'Tea plantation experience',
        insideShortDescription: 'Learn about tea production in scenic gardens',
        insideTabTitle: 'Tea Tour Details',
        published: true,
        position: 5,
        userId: userId,
        rootUserId: rootUserId,
        companyId: companyId,
        tenantId: tenantId,
      },
      {
        name: 'Bird Watching',
        title: 'Bird Watching Expedition',
        description: 'Observe rare and beautiful bird species',
        imageUrl: '/assets/images/activities/bird-watching.jpg',
        altText: 'Bird watching expedition',
        reviewStars: 4.4,
        highlight: false,
        insideTitle: 'Bird Watching Expedition',
        insideDescription:
          'Join our expert ornithologists for an unforgettable bird watching experience. Spot rare and beautiful bird species in their natural habitat while learning about their behavior and conservation.',
        insideImageUrl: '/assets/images/activities/bird-watching-inside.jpg',
        insideImageAlt: 'Bird watching experience',
        insideShortDescription: 'Observe rare bird species in nature',
        insideTabTitle: 'Bird Watching Info',
        published: true,
        position: 6,
        userId: userId,
        rootUserId: rootUserId,
        companyId: companyId,
        tenantId: tenantId,
      },
    ];

    // Create activities
    const createdActivities = [];
    for (const activityData of sampleActivities) {
      const existingActivity = await Activity.findOne({
        name: activityData.name,
        rootUserId: rootUserId,
      });

      if (!existingActivity) {
        const activity = new Activity(activityData);
        await activity.save();
        createdActivities.push(activity);
        console.log('Created activity:', activity.name);
      } else {
        createdActivities.push(existingActivity);
        console.log('Activity already exists:', existingActivity.name);
      }
    }

    return NextResponse.json({
      message: 'Activities sample data populated successfully',
      activities: {
        created: createdActivities.length,
        total: await Activity.countDocuments({ rootUserId }),
        data: createdActivities.map(activity => ({
          name: activity.name,
          title: activity.title,
          published: activity.published,
          highlight: activity.highlight,
        })),
      },
    });
  } catch (error) {
    console.error('Error populating activities sample data:', error);
    return NextResponse.json(
      { error: 'Failed to populate activities sample data' },
      { status: 500 }
    );
  }
}

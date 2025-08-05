import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Destination from '@/models/Destination';
import Package from '@/models/Package';
import Blog from '@/models/Blog';
import Activity from '@/models/Activity';
import Testimonial from '@/models/Testimonial';
import Team from '@/models/Team';
import Booking from '@/models/Booking';
import { getUserContext, createRootUserFilter } from '@/util/tenantContext';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user context for multi-tenant filtering
    let userContext;
    try {
      userContext = await getUserContext(request);
    } catch (error) {
      // If no authentication, return empty analytics (for public access)
      return NextResponse.json({
        stats: {
          destinations: {
            total: 0,
            published: 0,
            draft: 0,
            highlighted: 0,
          },
          packages: {
            total: 0,
            published: 0,
            draft: 0,
            highlighted: 0,
          },
          blogs: {
            total: 0,
            published: 0,
            draft: 0,
          },
          activities: {
            total: 0,
            published: 0,
            draft: 0,
            highlighted: 0,
          },
          testimonials: {
            total: 0,
            published: 0,
            draft: 0,
          },
          team: {
            total: 0,
            published: 0,
            draft: 0,
          },
          bookings: {
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0,
            paidBookings: 0,
            pendingPayments: 0,
          },
        },
        recentActivities: [],
      });
    }

    // Build root user filter for dashboard analytics
    const rootUserFilter = createRootUserFilter(userContext.rootUserId);

    // Get counts from all collections with root user filtering
    const [
      destinationsCount,
      packagesCount,
      blogsCount,
      activitiesCount,
      testimonialsCount,
      teamCount,
    ] = await Promise.all([
      Destination.countDocuments(rootUserFilter),
      Package.countDocuments(rootUserFilter),
      Blog.countDocuments(rootUserFilter),
      Activity.countDocuments(rootUserFilter),
      Testimonial.countDocuments(rootUserFilter),
      Team.countDocuments(rootUserFilter),
    ]);

    // Get booking statistics by root user
    const bookingStats = await (Booking as any).getStatsByRootUser(
      userContext.rootUserId
    );

    // Get counts for published items with root user filtering
    const [
      publishedDestinationsCount,
      publishedPackagesCount,
      publishedBlogsCount,
      publishedActivitiesCount,
      publishedTestimonialsCount,
      publishedTeamCount,
    ] = await Promise.all([
      Destination.countDocuments({ ...rootUserFilter, published: true }),
      Package.countDocuments({ ...rootUserFilter, published: true }),
      Blog.countDocuments({ ...rootUserFilter, published: true }),
      Activity.countDocuments({ ...rootUserFilter, published: true }),
      Testimonial.countDocuments({ ...rootUserFilter, published: true }),
      Team.countDocuments({ ...rootUserFilter, published: true }),
    ]);

    // Get counts for draft items with root user filtering
    const [
      draftDestinationsCount,
      draftPackagesCount,
      draftBlogsCount,
      draftActivitiesCount,
      draftTestimonialsCount,
      draftTeamCount,
    ] = await Promise.all([
      Destination.countDocuments({ ...rootUserFilter, published: false }),
      Package.countDocuments({ ...rootUserFilter, published: false }),
      Blog.countDocuments({ ...rootUserFilter, published: false }),
      Activity.countDocuments({ ...rootUserFilter, published: false }),
      Testimonial.countDocuments({ ...rootUserFilter, published: false }),
      Team.countDocuments({ ...rootUserFilter, published: false }),
    ]);

    // Get counts for highlighted items with root user filtering
    const [
      highlightedDestinationsCount,
      highlightedPackagesCount,
      highlightedActivitiesCount,
    ] = await Promise.all([
      Destination.countDocuments({ ...rootUserFilter, highlight: true }),
      Package.countDocuments({ ...rootUserFilter, highlight: true }),
      Activity.countDocuments({ ...rootUserFilter, highlight: true }),
    ]);

    // Get recent activities (last 5 items from each collection) with root user filtering
    const [
      recentDestinations,
      recentPackages,
      recentBlogs,
      recentActivitiesData,
      recentTestimonials,
      recentTeam,
      recentBookings,
    ] = await Promise.all([
      Destination.find(rootUserFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt'),
      Package.find(rootUserFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name title createdAt'),
      Blog.find(rootUserFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt'),
      Activity.find(rootUserFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name title createdAt'),
      Testimonial.find(rootUserFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt'),
      Team.find(rootUserFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name position createdAt'),
      Booking.find({ rootUserId: userContext.rootUserId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          'bookingId customerName packageName totalAmount status paymentStatus createdAt'
        ),
    ]);

    // Format recent activities
    const recentActivities = [
      ...recentDestinations.map(dest => ({
        id: dest._id.toString(),
        action: 'Destination added',
        item: dest.name,
        time: formatTimeAgo(dest.createdAt),
        user: 'Admin',
        type: 'destination',
      })),
      ...recentPackages.map(pkg => ({
        id: pkg._id.toString(),
        action: 'Package created',
        item: pkg.title || pkg.name,
        time: formatTimeAgo(pkg.createdAt),
        user: 'Admin',
        type: 'package',
      })),
      ...recentBlogs.map(blog => ({
        id: blog._id.toString(),
        action: 'Blog post published',
        item: blog.title,
        time: formatTimeAgo(blog.createdAt),
        user: 'Admin',
        type: 'blog',
      })),
      ...recentActivitiesData.map(activity => ({
        id: activity._id.toString(),
        action: 'Activity added',
        item: activity.name || activity.title,
        time: formatTimeAgo(activity.createdAt),
        user: 'Admin',
        type: 'activity',
      })),
      ...recentTestimonials.map(testimonial => ({
        id: testimonial._id.toString(),
        action: 'Testimonial added',
        item: testimonial.name,
        time: formatTimeAgo(testimonial.createdAt),
        user: 'Admin',
        type: 'testimonial',
      })),
      ...recentTeam.map(member => ({
        id: member._id.toString(),
        action: 'Team member added',
        item: member.name,
        time: formatTimeAgo(member.createdAt),
        user: 'Admin',
        type: 'team',
      })),
      ...recentBookings.map(booking => ({
        id: booking._id.toString(),
        action: `Booking ${booking.status}`,
        item: `${booking.customerName} - ${booking.packageName}`,
        time: formatTimeAgo(booking.createdAt),
        user: booking.customerName,
        type: 'booking',
        amount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        destinations: {
          total: destinationsCount,
          published: publishedDestinationsCount,
          draft: draftDestinationsCount,
          highlighted: highlightedDestinationsCount,
        },
        packages: {
          total: packagesCount,
          published: publishedPackagesCount,
          draft: draftPackagesCount,
          highlighted: highlightedPackagesCount,
        },
        blogs: {
          total: blogsCount,
          published: publishedBlogsCount,
          draft: draftBlogsCount,
        },
        activities: {
          total: activitiesCount,
          published: publishedActivitiesCount,
          draft: draftActivitiesCount,
          highlighted: highlightedActivitiesCount,
        },
        testimonials: {
          total: testimonialsCount,
          published: publishedTestimonialsCount,
          draft: draftTestimonialsCount,
        },
        team: {
          total: teamCount,
          published: publishedTeamCount,
          draft: draftTeamCount,
        },
        bookings: {
          total: bookingStats.totalBookings,
          pending: bookingStats.pendingBookings,
          confirmed: bookingStats.confirmedBookings,
          completed: bookingStats.completedBookings,
          cancelled: bookingStats.cancelledBookings,
          totalRevenue: bookingStats.totalRevenue,
          paidBookings: bookingStats.paidBookings,
          pendingPayments: bookingStats.pendingPayments,
        },
      },
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000
  );

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: Checking testimonials database ===');
    await connectToDatabase();

    // Get all testimonials without filtering
    const allTestimonials = await Testimonial.find({}).lean();
    console.log('Total testimonials in database:', allTestimonials.length);

    // Get testimonials grouped by rootUserId
    const testimonialsByRootUser = await Testimonial.aggregate([
      {
        $group: {
          _id: '$rootUserId',
          count: { $sum: 1 },
          testimonials: { $push: { name: '$name', _id: '$_id' } },
        },
      },
    ]);

    console.log('Testimonials by root user:', testimonialsByRootUser);

    return NextResponse.json({
      totalCount: allTestimonials.length,
      testimonialsByRootUser,
      allTestimonials: allTestimonials.map(t => ({
        id: t._id,
        name: t.name,
        rootUserId: t.rootUserId,
        review: t.review?.substring(0, 50) + '...',
        rating: t.rating,
        published: t.published,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { getUserContext } from '@/util/tenantContext';

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/testimonials/reorder - Starting request');
    await connectToDatabase();
    console.log('PUT /api/testimonials/reorder - Database connected');

    // Get user context for multi-tenant authentication
    const userContext = await getUserContext(request);

    const body = await request.json();
    console.log('PUT /api/testimonials/reorder - Request body:', body);
    const { testimonialIds } = body;

    if (!testimonialIds || !Array.isArray(testimonialIds)) {
      console.log(
        'PUT /api/testimonials/reorder - Validation failed: missing testimonialIds array'
      );
      return NextResponse.json(
        { error: 'Testimonial IDs array is required' },
        { status: 400 }
      );
    }

    console.log(
      'PUT /api/testimonials/reorder - Updating positions for testimonials:',
      testimonialIds
    );

    // Update positions for all testimonials with root user filtering
    const updatePromises = testimonialIds.map((id: string, index: number) => {
      console.log(
        `PUT /api/testimonials/reorder - Updating testimonial ${id} to position ${index}`
      );
      return Testimonial.findOneAndUpdate(
        { _id: id, rootUserId: userContext.rootUserId },
        { position: index }
      );
    });

    await Promise.all(updatePromises);
    console.log(
      'PUT /api/testimonials/reorder - All testimonials updated successfully'
    );

    // Fetch updated testimonials with root user filtering
    const testimonials = await Testimonial.find({
      rootUserId: userContext.rootUserId,
    })
      .sort({ position: 1 })
      .lean();

    console.log(
      'PUT /api/testimonials/reorder - Fetched updated testimonials:',
      testimonials.length
    );

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error reordering testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to reorder testimonials' },
      { status: 500 }
    );
  }
}

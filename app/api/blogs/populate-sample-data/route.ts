import { NextRequest, NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import { connectToDatabase } from '@/lib/mongodb';
import { getCurrentRootUserId } from '@/util/root-user-config';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const rootUserId = getCurrentRootUserId();
    console.log('=== POPULATING BLOG SAMPLE DATA ===');
    console.log('Root User ID:', rootUserId);

    // Sample blog data
    const sampleBlogs = [
      {
        title: 'Top 10 Adventure Destinations for 2024',
        description:
          "Discover the most thrilling adventure destinations that should be on every traveler's bucket list for 2024. From mountain climbing to deep-sea diving, these locations offer unforgettable experiences.",
        shortDescription:
          'Explore the most exciting adventure destinations for 2024 with our comprehensive guide',
        content: `Adventure travel has never been more popular, and 2024 brings a host of incredible destinations that promise unforgettable experiences. From the rugged mountains of Patagonia to the pristine waters of the Maldives, adventure seekers have countless options to choose from.

Our top picks include:

1. **Patagonia, Chile/Argentina** - For epic hiking and mountain climbing
2. **Nepal** - Home to the world's highest peaks
3. **New Zealand** - Adventure capital of the world
4. **Iceland** - Land of fire and ice
5. **Costa Rica** - Rainforest adventures and wildlife

Each destination offers unique challenges and rewards, making them perfect for both seasoned adventurers and those just starting their journey into adventure travel.`,
        imageUrl: '/assets/images/blog/adventure-destinations-2024.jpg',
        imageAlt: 'Mountain landscape with hikers on trail',
        tags: ['adventure', 'travel', 'destinations', '2024', 'outdoor'],
        category: 'Adventure Travel',
        author: 'Sarah Johnson',
        published: true,
        position: 1,
        slug: 'top-10-adventure-destinations-2024',
        metaTitle:
          'Top 10 Adventure Destinations for 2024 - Ultimate Travel Guide',
        metaDescription:
          'Discover the most thrilling adventure destinations for 2024. From Patagonia to Nepal, explore our comprehensive guide to unforgettable travel experiences.',
        rootUserId: rootUserId,
      },
      {
        title: 'Sustainable Tourism: How to Travel Responsibly',
        description:
          'Learn how to make your travels more sustainable and environmentally friendly while still having amazing experiences around the world.',
        shortDescription:
          'Essential tips for responsible and sustainable travel practices',
        content: `Sustainable tourism is becoming increasingly important as we become more aware of our environmental impact. Traveling responsibly doesn't mean sacrificing amazing experiences - it means making conscious choices that benefit both the environment and local communities.

Key principles of sustainable tourism:

- **Reduce your carbon footprint** by choosing eco-friendly transportation
- **Support local businesses** instead of international chains
- **Respect local cultures** and traditions
- **Minimize waste** by bringing reusable items
- **Choose eco-friendly accommodations** that prioritize sustainability

By following these principles, you can enjoy incredible travel experiences while contributing positively to the destinations you visit.`,
        imageUrl: '/assets/images/blog/sustainable-tourism.jpg',
        imageAlt: 'Eco-friendly travel practices',
        tags: [
          'sustainable',
          'eco-tourism',
          'responsible-travel',
          'environment',
        ],
        category: 'Sustainable Travel',
        author: 'Michael Chen',
        published: true,
        position: 2,
        slug: 'sustainable-tourism-how-to-travel-responsibly',
        metaTitle: 'Sustainable Tourism Guide - Travel Responsibly',
        metaDescription:
          'Learn how to travel sustainably and responsibly with our comprehensive guide to eco-friendly tourism practices.',
        rootUserId: rootUserId,
      },
      {
        title: 'Budget Travel Tips: See the World for Less',
        description:
          'Discover proven strategies to travel the world on a budget without compromising on experiences or comfort.',
        shortDescription: 'Smart strategies for affordable world travel',
        content: `Traveling the world doesn't have to break the bank. With the right strategies and mindset, you can explore amazing destinations while staying within your budget.

Essential budget travel tips:

1. **Plan ahead** - Book flights and accommodations early
2. **Travel off-season** - Avoid peak tourist times for better prices
3. **Use budget airlines** - Research low-cost carriers
4. **Stay in hostels or guesthouses** - Affordable accommodation options
5. **Cook your own meals** - Save money on food
6. **Use public transportation** - Cheaper than taxis
7. **Take advantage of free activities** - Many attractions offer free days

Remember, the best travel experiences often come from immersing yourself in local culture, which is usually much more affordable than tourist traps.`,
        imageUrl: '/assets/images/blog/budget-travel.jpg',
        imageAlt: 'Budget travel planning',
        tags: ['budget-travel', 'money-saving', 'cheap-travel', 'backpacking'],
        category: 'Budget Travel',
        author: 'Emma Rodriguez',
        published: true,
        position: 3,
        slug: 'budget-travel-tips-see-the-world-for-less',
        metaTitle: 'Budget Travel Tips - Travel the World Affordably',
        metaDescription:
          'Learn how to travel the world on a budget with our comprehensive guide to affordable travel strategies.',
        rootUserId: rootUserId,
      },
      {
        title: 'Cultural Immersion: Connecting with Local Communities',
        description:
          'Learn how to truly connect with local communities and cultures during your travels for more meaningful experiences.',
        shortDescription: 'How to authentically connect with local cultures',
        content: `The most rewarding travel experiences often come from genuine connections with local communities. Cultural immersion goes beyond sightseeing - it's about understanding and participating in the daily life of the places you visit.

Ways to immerse yourself in local culture:

- **Learn basic phrases** in the local language
- **Stay with local families** through homestay programs
- **Participate in local festivals** and celebrations
- **Take cooking classes** to learn traditional recipes
- **Volunteer** with local organizations
- **Shop at local markets** instead of tourist shops
- **Use local transportation** to experience daily life

These experiences create lasting memories and meaningful connections that go far beyond typical tourist activities.`,
        imageUrl: '/assets/images/blog/cultural-immersion.jpg',
        imageAlt: 'Local community interaction',
        tags: [
          'cultural-immersion',
          'local-culture',
          'authentic-travel',
          'community',
        ],
        category: 'Cultural Travel',
        author: 'David Kim',
        published: true,
        position: 4,
        slug: 'cultural-immersion-connecting-with-local-communities',
        metaTitle: 'Cultural Immersion - Connect with Local Communities',
        metaDescription:
          'Learn how to authentically connect with local communities and cultures for more meaningful travel experiences.',
        rootUserId: rootUserId,
      },
      {
        title: 'Digital Nomad Lifestyle: Working While Traveling',
        description:
          'Explore the digital nomad lifestyle and learn how to work remotely while traveling the world.',
        shortDescription: 'Guide to working remotely while traveling',
        content: `The digital nomad lifestyle has become increasingly popular, allowing people to work from anywhere in the world while exploring new destinations. This lifestyle offers incredible freedom but also requires careful planning and discipline.

Essential aspects of digital nomad life:

**Work Setup:**
- Reliable internet connection
- Quiet workspace
- Backup power solutions
- Time zone management

**Lifestyle Considerations:**
- Visa requirements for long-term stays
- Healthcare and insurance
- Banking and financial management
- Building a routine while traveling

**Popular Digital Nomad Destinations:**
- Bali, Indonesia
- Chiang Mai, Thailand
- Lisbon, Portugal
- Mexico City, Mexico
- Medellín, Colombia

The key to success is finding the right balance between work and exploration.`,
        imageUrl: '/assets/images/blog/digital-nomad.jpg',
        imageAlt: 'Digital nomad working remotely',
        tags: ['digital-nomad', 'remote-work', 'work-travel', 'lifestyle'],
        category: 'Digital Nomad',
        author: 'Lisa Thompson',
        published: true,
        position: 5,
        slug: 'digital-nomad-lifestyle-working-while-traveling',
        metaTitle: 'Digital Nomad Lifestyle - Work While Traveling',
        metaDescription:
          'Learn how to become a digital nomad and work remotely while traveling the world with our comprehensive guide.',
        rootUserId: rootUserId,
      },
      {
        title: 'Solo Travel Safety: Essential Tips for Independent Travelers',
        description:
          'Stay safe while traveling alone with these essential safety tips and strategies for solo travelers.',
        shortDescription: 'Safety guide for independent travelers',
        content: `Solo travel can be incredibly rewarding, offering complete freedom and the opportunity for deep self-discovery. However, it also requires extra attention to safety and preparation.

Safety tips for solo travelers:

**Before You Go:**
- Research your destination thoroughly
- Share your itinerary with trusted friends/family
- Make copies of important documents
- Get travel insurance

**While Traveling:**
- Stay aware of your surroundings
- Trust your instincts
- Keep valuables secure
- Stay connected with regular check-ins
- Learn basic self-defense

**Accommodation Safety:**
- Choose well-reviewed accommodations
- Request rooms on higher floors
- Use hotel safes for valuables
- Check room security features

Remember, most people you meet while traveling are friendly and helpful, but it's always better to be prepared and cautious.`,
        imageUrl: '/assets/images/blog/solo-travel-safety.jpg',
        imageAlt: 'Solo traveler safety tips',
        tags: [
          'solo-travel',
          'travel-safety',
          'independent-travel',
          'safety-tips',
        ],
        category: 'Solo Travel',
        author: 'Alex Morgan',
        published: true,
        position: 6,
        slug: 'solo-travel-safety-essential-tips-for-independent-travelers',
        metaTitle:
          'Solo Travel Safety - Essential Tips for Independent Travelers',
        metaDescription:
          'Stay safe while traveling alone with our comprehensive guide to solo travel safety and security.',
        rootUserId: rootUserId,
      },
    ];

    // Create blogs
    const createdBlogs = [];
    for (const blogData of sampleBlogs) {
      const existingBlog = await Blog.findOne({
        slug: blogData.slug,
        rootUserId: rootUserId,
      });

      if (!existingBlog) {
        const blog = new Blog(blogData);
        await blog.save();
        createdBlogs.push(blog);
        console.log('Created blog:', blog.title);
      } else {
        createdBlogs.push(existingBlog);
        console.log('Blog already exists:', existingBlog.title);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Blog sample data populated successfully',
      data: {
        created: createdBlogs.length,
        total: await Blog.countDocuments({ rootUserId }),
        blogs: createdBlogs.map(blog => ({
          title: blog.title,
          slug: blog.slug,
          category: blog.category,
          author: blog.author,
          published: blog.published,
        })),
      },
    });
  } catch (error) {
    console.error('Error populating blog sample data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to populate blog sample data' },
      { status: 500 }
    );
  }
}

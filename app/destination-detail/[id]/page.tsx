'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import DestinationContent from '@/components/destinations/DestinationContent';

interface Destination {
  _id: string;
  id: string;
  name: string;
  images: string[];
  location: string;
  description: string;
  mini_description: string;
  published: boolean;
  to_do: string;
  Highlight: string[];
  call_tagline: string;
  background: string;
  moredes: string;
  position: number;
  highlight: boolean;
}

interface DestinationPageProps {
  params: { id: string };
}

export default function DestinationPage({ params }: DestinationPageProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/destinations/public?id=${params.id}`
        );
        const data = await response.json();

        if (data.destinations && data.destinations.length > 0) {
          const dest = data.destinations[0];
          // Transform the data to match the expected format
          const transformedDestination = {
            _id: dest._id,
            id: dest._id || dest.id,
            name: dest.name,
            images: dest.images || [dest.imageUrl || ''],
            location: dest.location || dest.name,
            description: dest.description || dest.mini_description || '',
            mini_description: dest.mini_description || dest.description || '',
            published: dest.published || false,
            to_do: dest.to_do || '',
            Highlight: dest.Highlight || dest.highlight || [],
            call_tagline: dest.call_tagline || '',
            background: dest.background || '',
            moredes: dest.moredes || '',
            position: dest.position || 0,
            highlight: dest.highlight || false,
          };
          setDestination(transformedDestination);
        } else {
          setDestination(null);
        }
      } catch (error) {
        console.error('Error fetching destination:', error);
        setDestination(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDestination();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <div className='bg-blue-50 rounded-lg p-8 shadow-sm border border-blue-200'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-blue-700 text-lg font-medium'>
              Loading destination details...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!destination) {
    return (
      <Layout headerStyle={1} footerStyle={2}>
        <div className='container py-5 text-center'>
          <div className='bg-white rounded-lg p-8 shadow-sm border border-gray-200'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-black text-lg font-medium'>
              Destination not found.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerStyle={1} footerStyle={2}>
      <DestinationContent tourPackage={destination} />
    </Layout>
  );
}

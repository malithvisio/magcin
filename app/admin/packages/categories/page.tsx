'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='p-4'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Package Categories</h1>
        <Link href='/admin/packages/categories/add' className='btn btn-primary'>
          Add New Category
        </Link>
      </div>

      {/* Categories Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {categories.map(category => (
          <div
            key={category._id}
            className='bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow'
            onClick={() =>
              router.push(`/admin/packages/category/${category._id}`)
            }
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <span className='material-icons text-gray-600'>category</span>
                <h3 className='text-lg font-semibold'>{category.name}</h3>
              </div>
              <span className='material-icons text-gray-400'>
                chevron_right
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className='text-center py-12'>
          <span className='material-icons text-gray-400 text-5xl mb-4'>
            category
          </span>
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            No Categories Found
          </h3>
          <p className='text-gray-500'>Start by adding a new category</p>
        </div>
      )}
    </div>
  );
}

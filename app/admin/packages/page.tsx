'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { authService, apiRequest } from '@/util/auth';
import { useToast } from '@/contexts/ToastContext';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

interface Package {
  _id: string;
  id: string;
  name: string;
  title: string;
  image: string;
  type: string;
  duration: string;
  location: string;
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  createdAt: string;
}

export default function AdminPackages() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiRequest('/api/categories');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }
      setCategories(data.categories || []);
      // Set first category as selected if exists
      if (data.categories?.length > 0) {
        setSelectedCategory(data.categories[0]._id);
      }
    } catch (err: any) {
      console.error('Fetch categories error:', err);
      setError(err.message || 'Failed to load categories');
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiRequest(
        '/api/packages' +
          (selectedCategory
            ? `?type=${encodeURIComponent(categories.find(c => c._id === selectedCategory)?.name || '')}`
            : '')
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch packages');
      }
      setPackages(data.packages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, categories]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch packages when selected category changes
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Add new category
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        console.log('Creating category with name:', newCategoryName.trim());

        const response = await apiRequest('/api/categories', {
          method: 'POST',
          body: JSON.stringify({ name: newCategoryName.trim() }),
        });

        console.log('Category creation response status:', response.status);

        const data = await response.json();
        console.log('Category creation response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create category');
        }

        console.log('Category created successfully');

        // Refresh categories list
        await fetchCategories();
        setNewCategoryName('');
        setShowAddCategory(false);
      } catch (err: any) {
        console.error('Add category error:', err);
        showError(err.message || 'Failed to add category');
      }
    }
  };

  // Edit category
  const handleEditCategory = async () => {
    if (editingCategory && editingName.trim()) {
      try {
        const response = await apiRequest(
          `/api/categories/${editingCategory._id}`,
          {
            method: 'PUT',
            body: JSON.stringify({ name: editingName.trim() }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update category');
        }

        // Refresh categories list
        await fetchCategories();
        setEditingCategory(null);
        setEditingName('');
        setShowEditCategory(false);
      } catch (err: any) {
        console.error('Edit category error:', err);
        showError(err.message || 'Failed to update category');
      }
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/admin/packages/category/${categoryId}`);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingCategory(categoryToDelete._id);
      const response = await apiRequest(
        `/api/categories/${categoryToDelete._id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      await fetchCategories();
      showSuccess('Category deleted successfully!');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Delete category error:', err);
      showError(err.message || 'Failed to delete category');
    } finally {
      setDeletingCategory(null);
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Package Name',
      render: (value: string, row: any) => (
        <div className='package-cell'>
          <div className='package-image'>
            <img
              src={row.image || '/assets/images/placeholder.jpg'}
              alt={value}
              onError={e => {
                e.currentTarget.src = '/assets/images/placeholder.jpg';
              }}
            />
          </div>
          <div className='package-info'>
            {editingPackage === row._id ? (
              <div className='edit-name-container'>
                <input
                  type='text'
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className='edit-name-input'
                  autoFocus
                  onKeyDown={async e => {
                    if (e.key === 'Enter') {
                      await handleSavePackageName(row._id);
                    } else if (e.key === 'Escape') {
                      setEditingPackage(null);
                    }
                  }}
                />
                <div className='edit-name-buttons'>
                  <button
                    onClick={() => handleSavePackageName(row._id)}
                    className='save-button'
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPackage(null)}
                    className='cancel-button'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <strong>{value}</strong>
                <button
                  onClick={() => {
                    setEditingPackage(row._id);
                    setEditingName(value);
                  }}
                  className='edit-name-button'
                >
                  Edit
                </button>
              </>
            )}
            <span className='package-type'>{row.type}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => <span className='type-badge'>{value}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value: string) => (
        <div className='duration-cell'>
          <span className='duration-badge'>{value}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string) => (
        <div className='location-cell'>
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: number) => (
        <div className='rating-cell'>
          <span className='rating-stars'>
            {'⭐'.repeat(Math.floor(value))}
            {value % 1 > 0 && '⭐'}
          </span>
          <span className='rating-value'>{value}</span>
        </div>
      ),
    },
    {
      key: 'reviews',
      label: 'Reviews',
      render: (value: number) => (
        <span className='reviews-count'>{value} reviews</span>
      ),
    },
  ];

  const handleAddPackage = () => {
    router.push('/admin/packages/add');
  };

  const handleEditPackage = (pkg: any) => {
    // Navigate to add page with package data as query parameters
    const queryParams = new URLSearchParams({
      edit: 'true',
      id: pkg._id,
      name: pkg.name || '',
      title: pkg.title || '',
      image: pkg.image || '',
      summery: pkg.summery || '',
      location: pkg.location || '',
      duration: pkg.duration || '',
      days: pkg.days || '',
      nights: pkg.nights || '',
      destinations: pkg.destinations || '',
      rating: pkg.rating?.toString() || '4.5',
      reviews: pkg.reviews?.toString() || '0',
      type: pkg.type || '',
      mini_discription: pkg.mini_discription || '',
      description: pkg.description || '',
    });

    // Add arrays as JSON strings
    if (pkg.highlights) {
      queryParams.append('highlights', JSON.stringify(pkg.highlights));
    }
    if (pkg.inclusions) {
      queryParams.append('inclusions', JSON.stringify(pkg.inclusions));
    }
    if (pkg.exclusions) {
      queryParams.append('exclusions', JSON.stringify(pkg.exclusions));
    }
    if (pkg.images) {
      queryParams.append('images', JSON.stringify(pkg.images));
    }
    if (pkg.images2) {
      queryParams.append('images2', pkg.images2 || '');
    }
    if (pkg.itinerary) {
      queryParams.append('itinerary', JSON.stringify(pkg.itinerary));
    }

    router.push(`/admin/packages/add?${queryParams.toString()}`);
  };

  const handleDeletePackage = async (pkg: any) => {
    if (
      confirm(
        `Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await apiRequest(`/api/packages/${pkg._id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete package');
        }

        // Refresh packages list
        await fetchPackages();
        showSuccess('Package deleted successfully!');
      } catch (err: any) {
        console.error('Delete package error:', err);
        showError(err.message || 'Failed to delete package');
      }
    }
  };

  const handleSavePackageName = async (packageId: string) => {
    if (!editingName.trim()) {
      showError('Package name cannot be empty');
      return;
    }

    try {
      const response = await apiRequest(`/api/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update package name');
      }

      // Update the packages list with the new name
      setPackages(
        packages.map(pkg =>
          pkg._id === packageId ? { ...pkg, name: editingName.trim() } : pkg
        )
      );
      setEditingPackage(null);
      setEditingName('');
    } catch (err: any) {
      console.error('Update package name error:', err);
      showError(err.message || 'Failed to update package name');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='packages-page'>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Loading packages...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className='packages-page'>
          <div className='error-container'>
            <p className='error-message'>{error}</p>
            <button onClick={fetchPackages} className='retry-button'>
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='packages-page'>
        {/* Categories Section */}
        <div className='categories-section'>
          <h2 className='section-title'>Package Categories</h2>
          <button
            onClick={() => setShowAddCategory(true)}
            className='add-category-btn'
          >
            Add New Category
          </button>

          {showAddCategory && (
            <div className='add-category-form'>
              <input
                type='text'
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder='Enter category name'
                className='category-input'
              />
              <button
                onClick={handleAddCategory}
                className='action-btn save-btn'
              >
                Save
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className='action-btn cancel-btn'
              >
                Cancel
              </button>
            </div>
          )}

          {/* Edit Category Popup */}
          {showEditCategory && editingCategory && (
            <div className='modal-overlay'>
              <div className='modal-content'>
                <h3>Edit Category</h3>
                <input
                  type='text'
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  placeholder='Enter new category name'
                  className='category-input'
                />
                <div className='modal-actions'>
                  <button
                    onClick={handleEditCategory}
                    className='action-btn save-btn'
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowEditCategory(false);
                      setEditingCategory(null);
                      setEditingName('');
                    }}
                    className='action-btn cancel-btn'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='categories-list'>
            {categories.map(category => (
              <div key={category._id} className='category-row'>
                <button
                  onClick={() => handleCategoryClick(category._id)}
                  className='category-btn'
                >
                  {category.name}
                </button>
                <div className='category-actions'>
                  <button
                    className='category-action-btn edit'
                    onClick={() => {
                      setEditingCategory(category);
                      setEditingName(category.name);
                      setShowEditCategory(true);
                    }}
                    title='Edit category'
                  >
                    <i className='fas fa-edit'></i>
                  </button>
                  <button
                    className='category-action-btn delete'
                    onClick={() => handleDeleteCategory(category)}
                    title='Delete category'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Packages Section */}
        {/* <div className='packages-section'>
          <div className='packages-header'>
            <h2>Packages</h2>
            <button onClick={handleAddPackage} className='add-package-btn'>
              Add New Package
            </button>
          </div>

          <DataTable
            data={packages}
            columns={columns}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
          />
        </div> */}
        <style jsx>{`
          .packages-page {
            padding: 1.5rem;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 500;
            color: #1e293b;
            margin: 0 0 1rem 0;
            letter-spacing: 0.3px;
          }

          .add-category-btn {
            padding: 0.75rem 1rem;
            background-color: #3b82f6;
            border: none;
            color: white;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
            transition: background-color 0.2s;
          }

          .add-category-btn:hover {
            background-color: #2563eb;
          }

          .category-input {
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
          }

          .action-btn {
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
          }

          .category-btn {
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.3px;
            text-align: left;
          }

          .category-action-btn {
            font-size: 0.9rem;
          }

          .edit-name-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .edit-name-input {
            padding: 0.25rem 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            width: 100%;
          }

          .edit-name-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .save-button,
          .cancel-button {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            cursor: pointer;
            border: none;
          }

          .save-button {
            background-color: #3b82f6;
            color: white;
          }

          .save-button:hover {
            background-color: #2563eb;
          }

          .cancel-button {
            background-color: #e5e7eb;
            color: #374151;
          }

          .cancel-button:hover {
            background-color: #d1d5db;
          }

          .edit-name-button {
            background: none;
            border: none;
            color: #3b82f6;
            font-size: 0.75rem;
            cursor: pointer;
            padding: 0.125rem 0.25rem;
            margin-left: 0.5rem;
          }

          .edit-name-button:hover {
            text-decoration: underline;
          }

          /* Modal styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          .modal-content h3 {
            margin: 0 0 1rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
          }

          .modal-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .category-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            background-color: white;
            color: #374151;
          }

          .category-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background-color: white;
            color: #374151;
          }

          .action-btn {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .save-btn {
            background-color: #3b82f6;
            color: white;
            border: none;
          }

          .save-btn:hover {
            background-color: #2563eb;
          }

          .cancel-btn {
            background-color: white;
            color: #ef4444;
            border: 1px solid #ef4444;
          }

          .cancel-btn:hover {
            background-color: #fee2e2;
          }
        `}</style>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          title='Delete Category'
          message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
          itemName={categoryToDelete?.name || ''}
          isLoading={deletingCategory === categoryToDelete?._id}
          onConfirm={confirmDeleteCategory}
          onClose={cancelDeleteCategory}
        />
      </div>
    </AdminLayout>
  );
}

'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { FaGripVertical, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiRequest } from '@/util/api-utils';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { useToast } from '@/contexts/ToastContext';

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Define Category interface
interface Category {
  _id: string;
  name: string;
  position?: number;
  createdAt: string;
  updatedAt?: string;
}

// Define Blog interface
interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  tags: string[];
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogs() {
  const { showSuccess, showError } = useToast();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('Articles');
  const [category, setCategory] = useState('All');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [catMenuOpen, setCatMenuOpen] = useState<string | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogDescription, setNewBlogDescription] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogAuthor, setNewBlogAuthor] = useState('Admin');
  const [newBlogCategory, setNewBlogCategory] = useState('');
  const [newBlogTags, setNewBlogTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [savingEditCategory, setSavingEditCategory] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Drag and drop states
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Published toggle states
  const [published, setPublished] = useState<{ [id: string]: boolean }>({});
  const [updatingPublished, setUpdatingPublished] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      console.log('Fetching blogs...');

      // Debug: Check user authentication
      const user = localStorage.getItem('user');
      console.log(
        'Current user from localStorage:',
        user ? JSON.parse(user) : 'No user found'
      );

      const response = await apiRequest('/api/blogs');
      console.log('Blogs API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Blogs API response data:', data);

        // The API returns { success: true, data: blogsArray }
        const blogsArray = data.data || data.blogs || [];
        console.log('Processed blogs array:', blogsArray);
        console.log('Number of blogs found:', blogsArray.length);

        setBlogs(blogsArray);

        // Initialize published state
        const publishedState: { [id: string]: boolean } = {};
        blogsArray.forEach((blog: Blog) => {
          publishedState[blog._id] = blog.published;
        });
        setPublished(publishedState);

        // setDebugInfo(`Successfully fetched ${blogsArray.length} blogs`);
      } else {
        console.error('Failed to fetch blogs');
        const errorData = await response.json();
        console.error('Error details:', errorData);
        setBlogs([]);
        setDebugInfo(
          `Error fetching blogs: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
      setDebugInfo(`Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blog categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching blog categories...');

      const response = await apiRequest('/api/blogcategories');
      console.log('Blog categories API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Blog categories API response data:', data);
        console.log('Fetched blog categories:', data.blogCategories);
        setCategories(data.blogCategories || []);
      } else {
        console.error('Failed to fetch blog categories');
        const errorData = await response.json();
        console.error('Error details:', errorData);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Create new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showError('Please enter a category name');
      return;
    }

    try {
      setSavingCategory(true);

      // Debug: Check if user is logged in
      const user = localStorage.getItem('user');
      console.log(
        'Current user from localStorage:',
        user ? JSON.parse(user) : 'No user found'
      );

      console.log('Making API request to create blog category:', {
        name: newCategoryName.trim(),
        url: '/api/blogcategories',
      });

      const response = await apiRequest('/api/blogcategories', {
        method: 'POST',
        body: { name: newCategoryName.trim() },
      });

      console.log('API response status:', response.status);
      console.log(
        'API response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Category created successfully:', data);
        setCategories([
          ...(Array.isArray(categories) ? categories : []),
          data.category,
        ]);
        setShowAddCategoryModal(false);
        setNewCategoryName('');
        showSuccess('Category created successfully!');
      } else {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        showError(`Error: ${errorData.error || 'Failed to create category'}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Failed to create category. Please try again.');
    } finally {
      setSavingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setCategoryDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await apiRequest(
        `/api/blogcategories/${categoryToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setCategories(
          Array.isArray(categories)
            ? categories.filter(cat => cat._id !== categoryToDelete.id)
            : []
        );
        showSuccess('Category deleted successfully!');
      } else {
        const errorData = await response.json();
        showError(`Error: ${errorData.error || 'Failed to delete category'}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Failed to delete category. Please try again.');
    } finally {
      setCategoryDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDeleteCategory = () => {
    setCategoryDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  // Edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name);
    setShowEditCategoryModal(true);
  };
  // Delete blog
  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    console.log('Opening delete dialog for blog:', blogId, blogTitle);
    setBlogToDelete({ id: blogId, title: blogTitle });
    setDeleteDialogOpen(true);
    console.log('Dialog state set to:', true);
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;

    try {
      setDeletingBlog(blogToDelete.id);
      const response = await apiRequest(`/api/blogs/${blogToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== blogToDelete.id));
        showSuccess('Blog deleted successfully!');
      } else {
        const errorData = await response.json();
        showError(`Error: ${errorData.error || 'Failed to delete blog'}`);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showError('Failed to delete blog. Please try again.');
    } finally {
      setDeletingBlog(null);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const cancelDeleteBlog = () => {
    setDeleteDialogOpen(false);
    setBlogToDelete(null);
  };

  const handlePublishedToggle = async (
    blogId: string,
    currentStatus: boolean
  ) => {
    try {
      setUpdatingPublished(blogId);

      const response = await apiRequest(`/api/blogs/${blogId}`, {
        method: 'PUT',
        body: {
          published: !currentStatus,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update published status');
      }

      // Update local state
      setPublished(prev => ({
        ...prev,
        [blogId]: !currentStatus,
      }));

      // Also update the blogs array
      setBlogs(prev =>
        prev.map(blog =>
          blog._id === blogId ? { ...blog, published: !currentStatus } : blog
        )
      );

      showSuccess(
        `Blog ${!currentStatus ? 'published' : 'unpublished'} successfully!`
      );
    } catch (err: any) {
      showError(`Error updating published status: ${err.message}`);
    } finally {
      setUpdatingPublished(null);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) {
      showError('Please enter a category name');
      return;
    }

    try {
      setSavingEditCategory(true);
      const response = await apiRequest(
        `/api/blogcategories/${editingCategory._id}`,
        {
          method: 'PUT',
          body: { name: editingCategoryName.trim() },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(
          Array.isArray(categories)
            ? categories.map(cat =>
                cat._id === editingCategory._id ? data.category : cat
              )
            : []
        );
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        setEditingCategoryName('');
        showSuccess('Category updated successfully!');
      } else {
        const errorData = await response.json();
        showError(`Error: ${errorData.error || 'Failed to update category'}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Failed to update category. Please try again.');
    } finally {
      setSavingEditCategory(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = Array.isArray(categories)
      ? categories.findIndex(item => item._id === active.id)
      : -1;
    const newIndex = Array.isArray(categories)
      ? categories.findIndex(item => item._id === over.id)
      : -1;

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);

    // Update local state immediately for better UX
    setCategories(reordered);
    setIsReordering(true);

    try {
      const categoryIds = Array.isArray(reordered)
        ? reordered.map(category => category._id)
        : [];
      console.log('Sending reorder request with category IDs:', categoryIds);
      console.log(
        'Current categories with positions:',
        Array.isArray(categories)
          ? categories.map(c => ({
              id: c._id,
              name: c.name,
              position: c.position,
            }))
          : []
      );

      // Send the new order to the backend to persist changes
      const response = await apiRequest('/api/blogcategories/reorder', {
        method: 'POST',
        body: { categoryIds: categoryIds },
      });

      console.log('Reorder response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reorder API error:', errorData);
        throw new Error(errorData.error || 'Failed to update category order');
      }

      // Get the response data to confirm the order
      const responseData = await response.json();
      console.log('Reorder response data:', responseData);

      if (responseData.blogCategories) {
        // Update with the confirmed order from backend
        const updatedCategories = Array.isArray(reordered)
          ? reordered.map(category => {
              const updatedCategory = responseData.blogCategories?.find(
                (c: any) => c._id === category._id
              );
              return updatedCategory
                ? { ...category, position: updatedCategory.position }
                : category;
            })
          : [];
        setCategories(updatedCategories);
        console.log(
          'Updated categories with new positions:',
          Array.isArray(updatedCategories)
            ? updatedCategories.map(c => ({
                id: c._id,
                name: c.name,
                position: c.position,
              }))
            : []
        );
      }

      // Show success message
      showSuccess('Category order updated successfully!');
    } catch (error) {
      console.error('Error updating category order:', error);
      // Revert to original order on error
      fetchCategories();
      showError('Failed to save the new order. Please try again.');
    } finally {
      setIsReordering(false);
    }
  };
  useEffect(() => {
    console.log('AdminBlogs - Component mounted, fetching data...');

    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      console.log('AdminBlogs - User data:', {
        email: userData.email,
        companyId: userData.companyId,
        tenantId: userData.tenantId,
      });
    } else {
      console.log('AdminBlogs - No user found in localStorage');
    }

    fetchBlogs();
    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        catMenuOpen &&
        !(event.target as Element).closest('.menu-container')
      ) {
        setCatMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [catMenuOpen]);

  // Close articles menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !(event.target as Element).closest('.menu-container')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Get category options for dropdown
  const categoryOptions = [
    'All',
    ...(Array.isArray(categories) ? categories.map(cat => cat.name) : []),
  ];

  // Get article count for each category
  const getCategoryArticleCount = (categoryName: string) => {
    return Array.isArray(blogs)
      ? blogs.filter(blog => blog.category === categoryName).length
      : 0;
  };

  const filteredBlogs = Array.isArray(blogs)
    ? category === 'All'
      ? blogs
      : blogs.filter((blog: Blog) => blog.category === category)
    : [];

  const filteredCategories = Array.isArray(categories)
    ? category === 'All'
      ? categories
      : categories.filter(cat => cat.name === category)
    : [];

  // Add this helper function inside AdminBlogs
  function getMobileTitle(title: string) {
    return title
      .split(' ')
      .map(word => word.charAt(0))
      .join(' ');
  }

  // Sortable Category Card Component
  function SortableCategoryCard({
    category,
    onEdit,
    onDelete,
    menuOpenId,
    onMenuOpen,
  }: {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: string, categoryName: string) => void;
    menuOpenId: string | null;
    onMenuOpen: (id: string) => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      background: isDragging ? '#f0f0f0' : '#fff',
    };

    return (
      <div
        ref={setNodeRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 8,
          boxShadow: isDragging
            ? '0 2px 8px #aaa'
            : '0 1px 3px rgba(0, 0, 0, 0.08)',
          padding: '1.25rem 1.5rem',
          gap: '1.25rem',
          position: 'relative',
          marginBottom: '1rem',
          cursor: isDragging ? 'grabbing' : 'default',
          ...style,
        }}
      >
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            marginRight: '0.75rem',
            color: '#888',
            fontSize: 20,
            transition: 'color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            minHeight: '32px',
          }}
          onMouseEnter={e => {
            if (!isDragging) {
              e.currentTarget.style.color = '#2563eb';
            }
          }}
          onMouseLeave={e => {
            if (!isDragging) {
              e.currentTarget.style.color = '#888';
            }
          }}
        >
          <FaGripVertical />
        </div>
        <div
          style={{
            flex: 1,
            fontSize: '1.05rem',
            fontWeight: 500,
            color: '#1e293b',
          }}
        >
          {category.name}
        </div>
        <div
          style={{
            color: '#64748b',
            fontSize: '1rem',
            fontWeight: 500,
            marginRight: '1.5rem',
          }}
        >
          {getCategoryArticleCount(category.name)} Articles
        </div>
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 6,
            }}
            onClick={e => {
              e.stopPropagation();
              onMenuOpen(menuOpenId === category._id ? '' : category._id);
            }}
          >
            <FaEllipsisV size={18} color='#888' />
          </button>
          {menuOpenId === category._id && (
            <div
              className='menu-container'
              style={{
                position: 'absolute',
                right: 0,
                top: 36,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 2px 8px #ccc',
                zIndex: 10,
                minWidth: 100,
              }}
            >
              <div
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#111',
                  fontWeight: 500,
                }}
                onClick={e => {
                  e.stopPropagation();
                  onEdit(category);
                }}
              >
                <FaEdit size={17} color='#111' style={{ marginRight: 6 }} />
                Edit
              </div>
              <div
                style={{
                  height: 1,
                  background: '#eee',
                  margin: '0 8px',
                }}
              />
              <div
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  color: '#d32f2f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={e => {
                  e.stopPropagation();
                  onDelete(category._id, category.name);
                }}
              >
                <FaTrash size={15} /> Delete
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className='blogs-page'>
        <div className='page-header'>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
              padding: '16px 0',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {/* Home Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: '#2563eb',
                borderRadius: '8px',
                marginRight: '12px',
                flexShrink: 0,
              }}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M9 22V12H15V22'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            {/* Chevron */}
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              style={{ flexShrink: 0 }}
            >
              <path
                d='M9 18L15 12L9 6'
                stroke='#9ca3af'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span
              style={{
                color: '#000000',
                fontWeight: '600',
                fontFamily: 'sans-serif',
                fontSize: '14px',
              }}
            >
              Blogs
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              className={`tab-btn${tab === 'Articles' ? ' active' : ''}`}
              onClick={() => setTab('Articles')}
            >
              Articles
            </button>
            <button
              className={`tab-btn${tab === 'Categories' ? ' active' : ''}`}
              onClick={() => setTab('Categories')}
            >
              Categories
            </button>
            {/* Test button for dialog */}
            {/* <button
              onClick={() => {
                console.log('Test button clicked');
                setBlogToDelete({ id: 'test', title: 'Test Blog' });
                setDeleteDialogOpen(true);
              }}
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Test Delete Dialog
            </button> */}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label
                htmlFor='category'
                style={{ fontWeight: 500, color: '#374151' }}
              >
                Category Name :
              </label>
              <select
                id='category'
                className='category-select'
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {tab === 'Articles' ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className='add-blog-btn'
                  onClick={() => setShowAddBlogModal(true)}
                >
                  Add Blog
                </button>
                {/* <button
                  style={{
                    background: '#64748b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 500,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => {
                    console.log('Refreshing blogs and categories...');
                    fetchBlogs();
                    fetchCategories();
                  }}
                >
                  Refresh
                </button> */}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className='add-blog-btn'
                  onClick={() => setShowAddCategoryModal(true)}
                >
                  Add Category
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Articles Tab */}
        {tab === 'Articles' && (
          <div className='blog-list'>
            {debugInfo && (
              <div
                style={{
                  padding: '0.5rem 1rem',
                  marginBottom: '1rem',
                  borderRadius: '4px',
                  background: debugInfo.includes('Error')
                    ? '#fee2e2'
                    : '#d1fae5',
                  color: debugInfo.includes('Error') ? '#991b1b' : '#065f46',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              >
                {debugInfo}
              </div>
            )}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Loading blogs...
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                No blogs found
              </div>
            ) : (
              filteredBlogs.map((blog: Blog) => (
                <div className='blog-card' key={blog._id}>
                  <div className='blog-card-icon'>
                    <span role='img' aria-label='blog'>
                      <svg
                        width='28'
                        height='28'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <rect width='24' height='24' rx='6' fill='#e0e7ef' />
                        <path
                          d='M7 7h10M7 11h10M7 15h6'
                          stroke='#2563eb'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                        />
                      </svg>
                    </span>
                  </div>
                  <div className='blog-card-content'>
                    <div className='blog-card-title'>
                      <span className='blog-title-desktop'>{blog.title}</span>
                      <span className='blog-title-mobile'>
                        {getMobileTitle(blog.title)}
                      </span>
                    </div>
                    <div className='blog-card-tags'>
                      {blog.tags.map((tag: string) => (
                        <span className='blog-tag' key={tag}>
                          {tag} <span className='tag-x'>×</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className='blog-card-meta'>
                    <div className='blog-card-date'>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                    <div className='blog-card-published'>
                      <input
                        type='checkbox'
                        checked={published[blog._id] || blog.published}
                        onChange={() =>
                          handlePublishedToggle(
                            blog._id,
                            published[blog._id] || blog.published
                          )
                        }
                        disabled={updatingPublished === blog._id}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: '#2563eb',
                          marginRight: 8,
                          cursor:
                            updatingPublished === blog._id
                              ? 'not-allowed'
                              : 'pointer',
                          opacity: updatingPublished === blog._id ? 0.6 : 1,
                        }}
                      />
                      {!isMobile && (
                        <span
                          className='published-text mobile-hide-text'
                          style={{
                            color:
                              published[blog._id] || blog.published
                                ? '#059669'
                                : '#6b7280',
                            fontSize: 15,
                            opacity: updatingPublished === blog._id ? 0.6 : 1,
                            fontWeight:
                              published[blog._id] || blog.published
                                ? '600'
                                : '400',
                          }}
                        >
                          {updatingPublished === blog._id
                            ? 'Updating...'
                            : published[blog._id] || blog.published
                              ? 'Published'
                              : 'Draft'}
                        </span>
                      )}
                      {(published[blog._id] || blog.published) && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#059669',
                            marginLeft: 8,
                            opacity: updatingPublished === blog._id ? 0.6 : 1,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className='blog-card-actions'>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8,
                        borderRadius: 6,
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === blog._id ? null : blog._id);
                      }}
                    >
                      <FaEllipsisV size={18} color='#888' />
                    </button>
                    {menuOpen === blog._id && (
                      <div
                        className='menu-container'
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 36,
                          background: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: 8,
                          boxShadow: '0 2px 8px #ccc',
                          zIndex: 10,
                          minWidth: 100,
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: '#111',
                            fontWeight: 500,
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            window.location.href = `/admin/blogs/edit/${blog._id}`;
                          }}
                        >
                          <FaEdit
                            size={17}
                            color='#111'
                            style={{ marginRight: 6 }}
                          />
                          Edit
                        </div>
                        <div
                          style={{
                            height: 1,
                            background: '#eee',
                            margin: '0 8px',
                          }}
                        />
                        <div
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteBlog(blog._id, blog.title);
                          }}
                        >
                          <FaTrash size={15} /> Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'Categories' && (
          <div className='category-list'>
            {categoriesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                No categories found
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={
                    Array.isArray(filteredCategories)
                      ? filteredCategories.map(cat => cat._id)
                      : []
                  }
                  strategy={verticalListSortingStrategy}
                >
                  <div>
                    {Array.isArray(filteredCategories)
                      ? filteredCategories.map(cat => (
                          <SortableCategoryCard
                            key={cat._id}
                            category={cat}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                            menuOpenId={catMenuOpen}
                            onMenuOpen={setCatMenuOpen}
                          />
                        ))
                      : null}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        padding: '1.25rem 1.5rem',
                        gap: '1.25rem',
                        border: '2px solid #2563eb',
                        opacity: 0.95,
                      }}
                    >
                      <div
                        style={{
                          cursor: 'grabbing',
                          marginRight: '0.75rem',
                          color: '#2563eb',
                          fontSize: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          minHeight: '32px',
                        }}
                      >
                        <FaGripVertical />
                      </div>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 500,
                          color: '#1e293b',
                        }}
                      >
                        {Array.isArray(filteredCategories)
                          ? filteredCategories.find(cat => cat._id === activeId)
                              ?.name
                          : ''}
                      </div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '1rem',
                          fontWeight: 500,
                          marginRight: '1.5rem',
                        }}
                      >
                        {getCategoryArticleCount(
                          Array.isArray(filteredCategories)
                            ? filteredCategories.find(
                                cat => cat._id === activeId
                              )?.name || ''
                            : ''
                        )}{' '}
                        Articles
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Reordering Status Indicator */}
            {isReordering && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#2563eb',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                Saving new order...
              </div>
            )}

            {/* Success Message */}
            {showSuccessMessage && (
              <div
                style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  background: '#10b981',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                Order updated successfully!
              </div>
            )}
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.10)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                background: '#fafafa',
                borderRadius: 16,
                boxShadow: '0 2px 16px #bbb',
                padding: 32,
                minWidth: 400,
                maxWidth: '90vw',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                border: '1px solid #eee',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: '#444',
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                Add article category name :
              </div>
              <input
                type='text'
                placeholder='Type article category name'
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 17,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  marginBottom: 8,
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <button
                  style={{
                    background: savingCategory ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 28px',
                    fontWeight: 500,
                    fontSize: 17,
                    cursor: savingCategory ? 'not-allowed' : 'pointer',
                    opacity: savingCategory ? 0.7 : 1,
                  }}
                  onClick={handleAddCategory}
                  disabled={savingCategory}
                >
                  {savingCategory ? 'Adding...' : 'Add Article Category'}
                </button>
                <button
                  style={{
                    background: '#fff',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 22px',
                    fontWeight: 500,
                    fontSize: 17,
                    cursor: 'pointer',
                    boxShadow: '0 0 0 1.5px #f0f0f0',
                  }}
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  disabled={savingCategory}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Category Modal */}
        {showEditCategoryModal && editingCategory && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.10)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                background: '#fafafa',
                borderRadius: 16,
                boxShadow: '0 2px 16px #bbb',
                padding: '24px',
                minWidth: '280px',
                maxWidth: '400px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                border: '1px solid #eee',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: '#444',
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                Edit article category name :
              </div>
              <input
                type='text'
                placeholder='Type article category name'
                value={editingCategoryName}
                onChange={e => setEditingCategoryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 17,
                  color: '#444',
                  background: '#fff',
                  outline: 'none',
                  marginBottom: 8,
                  fontWeight: 400,
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  style={{
                    background: savingEditCategory ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 20px',
                    fontWeight: 500,
                    fontSize: 16,
                    cursor: savingEditCategory ? 'not-allowed' : 'pointer',
                    opacity: savingEditCategory ? 0.7 : 1,
                    flex: 1,
                    minWidth: '120px',
                  }}
                  onClick={handleUpdateCategory}
                  disabled={savingEditCategory}
                >
                  {savingEditCategory ? 'Updating...' : 'Update Category'}
                </button>
                <button
                  style={{
                    background: '#fff',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 20px',
                    fontWeight: 500,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 0 0 1.5px #f0f0f0',
                    flex: 1,
                    minWidth: '120px',
                  }}
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setEditingCategory(null);
                    setEditingCategoryName('');
                  }}
                  disabled={savingEditCategory}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Add Blog Modal */}
        {showAddBlogModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.10)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className='add-blog-modal'
              style={{
                background: '#fafafa',
                borderRadius: 16,
                boxShadow: '0 2px 16px #bbb',
                padding: 32,
                minWidth: 500,
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                border: '1px solid #eee',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: '#444',
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                Add New Blog
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Title
                </label>
                <input
                  type='text'
                  value={newBlogTitle}
                  onChange={e => setNewBlogTitle(e.target.value)}
                  placeholder='Enter blog title'
                  className='add-blog-input'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: 16,
                    color: '#444',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 400,
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={newBlogDescription}
                  onChange={e => setNewBlogDescription(e.target.value)}
                  placeholder='Enter blog description'
                  className='add-blog-textarea'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: 16,
                    color: '#444',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 400,
                    boxSizing: 'border-box',
                    minHeight: 150,
                    resize: 'vertical',
                    fontFamily: 'sans-serif',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Content
                </label>
                <textarea
                  value={newBlogContent}
                  onChange={e => setNewBlogContent(e.target.value)}
                  placeholder='Enter blog content (optional)'
                  className='add-blog-textarea'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: 16,
                    color: '#444',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 400,
                    boxSizing: 'border-box',
                    minHeight: 150,
                    resize: 'vertical',
                    fontFamily: 'sans-serif',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Author
                </label>
                <input
                  type='text'
                  value={newBlogAuthor}
                  onChange={e => setNewBlogAuthor(e.target.value)}
                  placeholder='Enter author name'
                  className='add-blog-input'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: 16,
                    color: '#444',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 400,
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Category
                </label>
                <select
                  value={newBlogCategory}
                  onChange={e => setNewBlogCategory(e.target.value)}
                  className='add-blog-select'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: 16,
                    color: '#444',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 400,
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif',
                  }}
                >
                  <option value=''>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type='text'
                  value={newBlogTags}
                  onChange={e => setNewBlogTags(e.target.value)}
                  placeholder='Enter tags separated by commas'
                  className='add-blog-input'
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: 16,
                    color: '#444',
                    background: '#fff',
                    outline: 'none',
                    fontWeight: 400,
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif',
                  }}
                />
              </div>

              <div
                className='add-blog-buttons'
                style={{ display: 'flex', gap: 16, marginTop: 10 }}
              >
                <button
                  style={{
                    background: saving ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 28px',
                    fontWeight: 500,
                    fontSize: 17,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onClick={async () => {
                    if (!newBlogTitle.trim()) {
                      showError('Please enter a blog title');
                      return;
                    }

                    if (!newBlogDescription.trim()) {
                      showError('Please enter a blog description');
                      return;
                    }

                    if (!newBlogAuthor.trim()) {
                      showError('Please enter an author name');
                      return;
                    }

                    try {
                      setSaving(true);

                      const tags = newBlogTags
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0);

                      const response = await apiRequest('/api/blogs', {
                        method: 'POST',
                        body: {
                          title: newBlogTitle.trim(),
                          description: newBlogDescription.trim(),
                          content: newBlogContent.trim(),
                          author: newBlogAuthor.trim(),
                          category: newBlogCategory,
                          tags: tags,
                          published: false,
                        },
                      });

                      if (response.ok) {
                        // Refresh the blogs list to get the updated data
                        await fetchBlogs();
                        setShowAddBlogModal(false);
                        setNewBlogTitle('');
                        setNewBlogDescription('');
                        setNewBlogContent('');
                        setNewBlogAuthor('Admin');
                        setNewBlogCategory('');
                        setNewBlogTags('');
                        // Show success message
                        showSuccess('Blog created successfully!');
                      } else {
                        const error = await response.json();
                        showError(
                          `Error: ${error.error || 'Failed to create blog'}`
                        );
                      }
                    } catch (error) {
                      console.error('Error creating blog:', error);
                      showError('Failed to create blog. Please try again.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        style={{ animation: 'spin 1s linear infinite' }}
                      >
                        <circle
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          strokeLinecap='round'
                          strokeDasharray='31.416'
                          strokeDashoffset='31.416'
                          style={{
                            animation: 'dash 1.5s ease-in-out infinite',
                          }}
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Add Blog'
                  )}
                </button>
                <button
                  style={{
                    background: '#fff',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 22px',
                    fontWeight: 500,
                    fontSize: 17,
                    cursor: 'pointer',
                    boxShadow: '0 0 0 1.5px #f0f0f0',
                  }}
                  onClick={() => {
                    setShowAddBlogModal(false);
                    setNewBlogTitle('');
                    setNewBlogDescription('');
                    setNewBlogContent('');
                    setNewBlogAuthor('Admin');
                    setNewBlogCategory('');
                    setNewBlogTags('');
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }

          .blogs-page {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            padding: 2rem 0;
          }

          /* Remove scrollbar for add blog modal on all devices */
          .add-blog-modal::-webkit-scrollbar {
            display: none;
          }

          .add-blog-modal {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .page-header {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
          }
          .tab-btn {
            background: #e5e7eb;
            color: #2563eb;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1.5rem;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .tab-btn.active {
            background: #2563eb;
            color: #fff;
          }
          .category-select {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            border: 1px solid #d1d5db;
            font-size: 1rem;
            color: #374151;
            background: #fff;
            min-width: 120px;
          }
          .add-blog-btn {
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1.5rem;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .add-blog-btn:hover {
            background: #1d4ed8;
          }
          .blog-list {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .blog-card {
            display: flex;
            align-items: center;
            background: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            padding: 1.25rem 1.5rem;
            gap: 1.25rem;
            position: relative;
          }
          .blog-card-icon {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: #f1f5f9;
            border-radius: 0.5rem;
          }
          .blog-card-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .blog-card-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .blog-title-mobile {
            display: none;
          }
          .blog-title-desktop {
            display: inline;
          }
          .blog-card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .blog-tag {
            background: #e0e7ef;
            color: #2563eb;
            border-radius: 0.375rem;
            padding: 0.25rem 0.75rem;
            font-size: 0.85rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          .tag-x {
            color: #64748b;
            font-size: 1rem;
            cursor: pointer;
            margin-left: 0.25rem;
          }
          .blog-card-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
            min-width: 160px;
          }
          .blog-card-date {
            color: #64748b;
            font-size: 0.95rem;
          }
          .blog-card-published {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #2563eb;
            font-size: 1rem;
            font-weight: 500;
          }
          .blog-card-published input[type='checkbox'] {
            accent-color: #2563eb;
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
          .published-text {
            color: #059669;
            font-size: 15px;
            font-weight: 600;
          }
          .published-text.mobile-hide-text {
            display: inline;
          }
          @media (max-width: 768px) {
            .published-text.mobile-hide-text {
              display: none;
            }
          }
          .blog-card-actions {
            position: relative;
            margin-left: 1rem;
          }
          .actions-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.375rem;
            transition: background 0.2s;
          }
          .actions-btn:hover {
            background: #f1f5f9;
          }
          .actions-menu {
            position: absolute;
            top: 2.2rem;
            right: 0;
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
            z-index: 10;
            min-width: 120px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .actions-menu-item {
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            text-align: left;
            color: #374151;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .actions-menu-item:hover {
            background: #f1f5f9;
          }
          /* Categories Tab Styles */
          .category-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .category-card {
            display: flex;
            align-items: center;
            background: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            padding: 1.25rem 1.5rem;
            gap: 1.25rem;
            position: relative;
          }
          .category-drag {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 0.75rem;
            color: #888;
            font-size: 20px;
            transition: color 0.2s ease;
          }
          .category-drag:hover {
            color: #2563eb;
          }
          .category-name {
            flex: 1;
            font-size: 1.05rem;
            font-weight: 500;
            color: #1e293b;
          }
          .category-count {
            color: #64748b;
            font-size: 1rem;
            font-weight: 500;
            margin-right: 1.5rem;
          }
          .category-actions {
            position: relative;
          }
          @media (max-width: 768px) {
            .page-header {
              padding: 1.25rem;
            }
            .blog-card,
            .category-card {
              flex-direction: row;
              align-items: center;
              gap: 1.25rem;
              padding: 1rem;
            }
            .blog-card-meta {
              align-items: flex-end;
              min-width: 5px;
            }
            .category-count {
              margin-right: 1.5rem;
              margin-top: 0;
            }
            .blog-title-desktop {
              display: none;
            }
            .blog-title-mobile {
              display: inline;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            /* Mobile responsive for add blog modal */
            .add-blog-modal {
              min-width: auto !important;
              max-width: 96vw !important;
              width: 96vw !important;
              padding: 20px !important;
              margin: 8px !important;
              max-height: 92vh !important;
              border: 2px solid #e5e7eb !important;
              border-radius: 12px !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
            }

            .add-blog-buttons {
              flex-direction: column !important;
              gap: 12px !important;
            }

            .add-blog-buttons button {
              width: 100% !important;
              justify-content: center !important;
            }

            /* Mobile improvements for form elements */
            .add-blog-input,
            .add-blog-textarea,
            .add-blog-select {
              font-size: 16px !important; /* Prevents zoom on iOS */
              -webkit-appearance: none !important;
              -moz-appearance: none !important;
              appearance: none !important;
            }

            .add-blog-textarea {
              min-height: 120px !important; /* Smaller height on mobile */
            }

            /* Remove scrollbar for better mobile experience */
            .add-blog-modal::-webkit-scrollbar {
              display: none !important;
            }

            .add-blog-modal {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
          }
        `}</style>
      </div>

      {/* Delete Blog Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteDialogOpen}
        onClose={cancelDeleteBlog}
        onConfirm={confirmDeleteBlog}
        title='Delete Blog'
        message='Are you sure you want to delete'
        itemName={blogToDelete?.title}
        isLoading={deletingBlog === blogToDelete?.id}
        loadingText='Deleting...'
        confirmText='Delete'
        cancelText='Cancel'
      />

      {/* Category Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={categoryDeleteDialogOpen}
        onClose={cancelDeleteCategory}
        onConfirm={confirmDeleteCategory}
        title='Delete Category'
        message='Are you sure you want to delete'
        itemName={categoryToDelete?.name}
        isLoading={false}
        confirmText='Delete'
        cancelText='Cancel'
      />
    </AdminLayout>
  );
}

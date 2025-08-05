'use client';
import AdminLayout from '@/components/layout/AdminLayout';
import { useState } from 'react';

interface Tour {
  id: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  description: string;
  maxGroupSize: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'active' | 'inactive';
}

export default function ToursAdmin() {
  const [tours, setTours] = useState<Tour[]>([
    {
      id: '1',
      name: 'Colombo City Explorer',
      destination: 'Colombo',
      duration: '1 Day',
      price: '$50',
      description: 'Explore the vibrant capital city',
      maxGroupSize: 15,
      difficulty: 'Easy',
      status: 'active',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Tour>>({
    name: '',
    destination: '',
    duration: '',
    price: '',
    description: '',
    maxGroupSize: 10,
    difficulty: 'Easy',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTour: Tour = {
      ...(formData as Tour),
      id: Date.now().toString(),
    };
    setTours([...tours, newTour]);
    setIsAdding(false);
    setFormData({
      name: '',
      destination: '',
      duration: '',
      price: '',
      description: '',
      maxGroupSize: 10,
      difficulty: 'Easy',
      status: 'active',
    });
  };

  return (
    <AdminLayout>
      <div className='tours-admin'>
        <div className='header-section'>
          <h1>Tours Management</h1>
          <button onClick={() => setIsAdding(true)} className='add-btn'>
            + Add New Tour
          </button>
        </div>

        <div className='tours-grid'>
          {tours.map(tour => (
            <div key={tour.id} className='tour-card'>
              <div className='tour-header'>
                <h3>{tour.name}</h3>
                <span className={`status-badge ${tour.status}`}>
                  {tour.status}
                </span>
              </div>
              <div className='tour-details'>
                <p>
                  <strong>Destination:</strong> {tour.destination}
                </p>
                <p>
                  <strong>Duration:</strong> {tour.duration}
                </p>
                <p>
                  <strong>Price:</strong> {tour.price}
                </p>
                <p>
                  <strong>Group Size:</strong> Max {tour.maxGroupSize}
                </p>
                <p>
                  <strong>Difficulty:</strong> {tour.difficulty}
                </p>
              </div>
              <p className='tour-description'>{tour.description}</p>
              <div className='tour-actions'>
                <button className='edit-btn'>Edit</button>
                <button className='delete-btn'>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {isAdding && (
          <div className='modal-overlay'>
            <div className='modal'>
              <div className='modal-header'>
                <h2>Add New Tour</h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className='close-btn'
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className='tour-form'>
                <div className='form-row'>
                  <div className='form-group'>
                    <label>Tour Name</label>
                    <input
                      type='text'
                      value={formData.name || ''}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label>Destination</label>
                    <input
                      type='text'
                      value={formData.destination || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label>Duration</label>
                    <input
                      type='text'
                      value={formData.duration || ''}
                      onChange={e =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label>Price</label>
                    <input
                      type='text'
                      value={formData.price || ''}
                      onChange={e =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label>Max Group Size</label>
                    <input
                      type='number'
                      value={formData.maxGroupSize || 10}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          maxGroupSize: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label>Difficulty</label>
                    <select
                      value={formData.difficulty || 'Easy'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as
                            | 'Easy'
                            | 'Medium'
                            | 'Hard',
                        })
                      }
                    >
                      <option value='Easy'>Easy</option>
                      <option value='Medium'>Medium</option>
                      <option value='Hard'>Hard</option>
                    </select>
                  </div>
                </div>

                <div className='form-group'>
                  <label>Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className='form-actions'>
                  <button type='submit' className='save-btn'>
                    Add Tour
                  </button>
                  <button
                    type='button'
                    onClick={() => setIsAdding(false)}
                    className='cancel-btn'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .tours-admin {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-section h1 {
          color: #333;
          margin: 0;
        }

        .add-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s ease;
        }

        .add-btn:hover {
          background: #0056b3;
        }

        .tours-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .tour-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tour-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .tour-header h3 {
          margin: 0;
          color: #333;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: #28a745;
          color: white;
        }

        .status-badge.inactive {
          background: #dc3545;
          color: white;
        }

        .tour-details {
          margin-bottom: 1rem;
        }

        .tour-details p {
          margin: 0.25rem 0;
          color: #666;
        }

        .tour-description {
          color: #666;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .tour-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn,
        .delete-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s ease;
        }

        .edit-btn {
          background: #007bff;
          color: white;
        }

        .edit-btn:hover {
          background: #0056b3;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .tour-form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .save-btn,
        .cancel-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s ease;
        }

        .save-btn {
          background: #007bff;
          color: white;
        }

        .save-btn:hover {
          background: #0056b3;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover {
          background: #545b62;
        }

        @media (max-width: 768px) {
          .header-section {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .tours-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

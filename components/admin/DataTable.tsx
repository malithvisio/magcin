'use client';
import { useState } from 'react';

interface DataTableProps {
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  addButtonText?: string;
}

export default function DataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onView,
  addButtonText = 'Add New',
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className='data-table-container'>
      {/* Header */}
      <div className='table-header'>
        <div className='header-left'>
          <h2 className='table-title'>{title}</h2>
          <span className='table-count'>
            {filteredData.length} of {data.length} items
          </span>
        </div>
        <div className='header-right'>
          <div className='search-container'>
            <input
              type='text'
              placeholder='Search...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='search-input'
            />
          </div>
          {onAdd && (
            <button onClick={onAdd} className='add-button'>
              + {addButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='table-wrapper'>
        <table className='data-table'>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} className='table-header-cell'>
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className='table-header-cell actions-header'>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id || index} className='table-row'>
                  {columns.map(column => (
                    <td key={column.key} className='table-cell'>
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className='table-cell actions-cell'>
                      <div className='action-buttons'>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className='action-button edit-button'
                            title='Edit'
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className='action-button delete-button'
                            title='Delete'
                          >
                            🗑️
                          </button>
                        )}
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className='action-button view-button'
                            title='View'
                          >
                            👁️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length + (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className='empty-state'
                >
                  <div className='empty-content'>
                    <span className='empty-icon'>📋</span>
                    <p>No data found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className='clear-search'
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='pagination'>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className='pagination-button'
          >
            ← Previous
          </button>
          <div className='pagination-info'>
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className='pagination-button'
          >
            Next →
          </button>
        </div>
      )}

      <style jsx>{`
        .data-table-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .table-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .table-count {
          font-size: 0.875rem;
          color: #64748b;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
        }

        .search-input {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          width: 200px;
          font-size: 0.875rem;
          background-color: white !important;
          color: #374151 !important;
        }

        .search-input::placeholder {
          color: #9ca3af !important;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background-color: white !important;
          color: #374151 !important;
        }

        .add-button {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
          width: 100%;
          max-width: 100%;
          position: relative;
        }

        .table-wrapper::-webkit-scrollbar {
          height: 8px;
        }

        .table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
          table-layout: auto;
        }

        .table-header-cell {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
        }

        .actions-header {
          text-align: center;
          width: 100px;
        }

        .table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f8fafc;
        }

        .table-cell {
          padding: 1rem;
          color: #374151;
          font-size: 0.875rem;
          vertical-align: middle;
        }

        .actions-cell {
          text-align: center;
          width: 100px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .action-button {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .edit-button:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        .delete-button:hover {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .view-button:hover {
          background-color: #e0f2fe;
          color: #0ea5e9;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .empty-content p {
          color: #64748b;
          margin: 0;
        }

        .clear-search {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .clear-search:hover {
          background: #2563eb;
        }

        .pagination {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-button {
          background: white;
          border: 1px solid #d1d5db;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .pagination-button:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #3b82f6;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #64748b;
          font-size: 0.875rem;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .data-table-container {
            margin: 0;
            border-radius: 0.5rem;
            overflow: hidden;
          }

          .table-header {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
            gap: 1rem;
          }

          .header-left {
            gap: 0.5rem;
          }

          .table-title {
            font-size: 1.25rem;
            line-height: 1.3;
          }

          .table-count {
            font-size: 0.8rem;
          }

          .header-right {
            justify-content: space-between;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .search-input {
            width: 100%;
            min-width: 120px;
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
          }

          .add-button {
            white-space: nowrap;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            min-width: auto;
          }

          .table-wrapper {
            margin: 0;
            border-radius: 0;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            max-width: 100%;
          }

          .data-table {
            min-width: 900px;
            font-size: 0.8rem;
            table-layout: auto;
          }

          .table-header-cell,
          .table-cell {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
            white-space: nowrap;
            vertical-align: middle;
          }

          .table-header-cell {
            position: sticky;
            top: 0;
            background: #f8fafc;
            z-index: 10;
            font-weight: 600;
          }

          .actions-header {
            min-width: 80px;
            text-align: center;
          }

          .actions-cell {
            min-width: 80px;
            text-align: center;
          }

          .action-buttons {
            flex-direction: row;
            gap: 0.25rem;
            justify-content: center;
            min-width: 70px;
          }

          .action-button {
            padding: 0.5rem;
            font-size: 0.875rem;
            min-width: 32px;
            min-height: 32px;
            border-radius: 0.25rem;
          }

          .pagination {
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
          }

          .pagination-button {
            font-size: 0.8rem;
            padding: 0.5rem 0.75rem;
          }
        }

        /* Extra small mobile devices */
        @media (max-width: 480px) {
          .table-header {
            padding: 0.75rem;
          }

          .table-title {
            font-size: 1.1rem;
          }

          .table-count {
            font-size: 0.75rem;
          }

          .search-input {
            font-size: 0.8rem;
            padding: 0.5rem;
            min-width: 100px;
          }

          .add-button {
            font-size: 0.8rem;
            padding: 0.5rem;
          }

          .data-table {
            min-width: 800px;
            font-size: 0.75rem;
          }

          .table-header-cell,
          .table-cell {
            padding: 0.5rem 0.25rem;
            font-size: 0.75rem;
          }

          .actions-header,
          .actions-cell {
            min-width: 70px;
          }

          .action-buttons {
            min-width: 60px;
            gap: 0.2rem;
          }

          .action-button {
            font-size: 0.8rem;
            min-width: 28px;
            min-height: 28px;
            padding: 0.4rem;
          }
        }

        /* Very small mobile devices */
        @media (max-width: 360px) {
          .table-header {
            padding: 0.5rem;
          }

          .table-title {
            font-size: 1rem;
          }

          .search-input {
            font-size: 0.75rem;
            padding: 0.4rem;
            min-width: 80px;
          }

          .add-button {
            font-size: 0.75rem;
            padding: 0.4rem;
          }

          .data-table {
            min-width: 750px;
            font-size: 0.7rem;
          }

          .table-header-cell,
          .table-cell {
            padding: 0.4rem 0.2rem;
            font-size: 0.7rem;
          }

          .action-button {
            font-size: 0.75rem;
            min-width: 26px;
            min-height: 26px;
            padding: 0.3rem;
          }
        }

        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .search-input {
            width: 180px;
          }

          .table-header-cell,
          .table-cell {
            padding: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}

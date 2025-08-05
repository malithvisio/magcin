'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableDataTableProps {
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
  onReorder?: (newOrder: any[]) => Promise<void>;
  onTogglePublished?: (item: any) => void;
  onBulkDelete?: (items: any[]) => void;
  onBulkTogglePublished?: (items: any[], published: boolean) => void;
  addButtonText?: string;
  showCheckboxes?: boolean;
}

// Sortable row component
function SortableRow({
  item,
  columns,
  onEdit,
  onDelete,
  onTogglePublished,
  index,
  isSelected,
  onSelect,
  showCheckboxes,
}: {
  item: any;
  columns: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onTogglePublished?: (item: any) => void;
  index: number;
  isSelected: boolean;
  onSelect: (item: any, selected: boolean) => void;
  showCheckboxes?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id || item.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`table-row ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      {...attributes}
      {...listeners}
      onClick={e => {
        // Only allow row clicks if not clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
          target.closest(
            'input, button, label, .action-buttons, .edit-delete-buttons, .published-status-container'
          )
        ) {
          e.stopPropagation();
          return;
        }
      }}
    >
      {showCheckboxes && (
        <td
          className='table-cell checkbox-cell'
          onClick={e => e.stopPropagation()}
        >
          <div onClick={e => e.stopPropagation()}>
            <input
              type='checkbox'
              id={`row-select-${item._id || item.id}`}
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                onSelect(item, e.target.checked);
              }}
              onClick={e => e.stopPropagation()}
              className='row-checkbox'
            />
          </div>
        </td>
      )}
      <td className='table-cell drag-handle'>
        <div className='drag-indicator'>⋮⋮</div>
      </td>
      {columns.map(column => (
        <td key={column.key} className='table-cell'>
          {column.render
            ? column.render(item[column.key], item)
            : String(item[column.key] || '')}
        </td>
      ))}
      <td
        className='table-cell actions-cell'
        onClick={e => e.stopPropagation()}
      >
        <div className='action-buttons'>
          {onTogglePublished && (
            <div className='published-status-container'>
              <label
                className='custom-checkbox-label'
                htmlFor={`published-${item._id || item.id}`}
                onClick={e => e.stopPropagation()}
              >
                <input
                  type='checkbox'
                  id={`published-${item._id || item.id}`}
                  className='published-checkbox'
                  checked={item.published || false}
                  onChange={e => {
                    e.stopPropagation();
                    onTogglePublished(item);
                  }}
                  onClick={e => e.stopPropagation()}
                />
                <span className='custom-checkbox'></span>
              </label>
              <span
                className='published-label'
                onClick={e => e.stopPropagation()}
              >
                {item.published ? 'Published' : 'Unpublished'}
              </span>
            </div>
          )}
          {(onEdit || onDelete) && (
            <div
              className='edit-delete-buttons'
              onClick={e => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                  className='action-button edit-button'
                  title='Edit'
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                  className='action-button delete-button'
                  title='Delete'
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function DraggableDataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  onTogglePublished,
  onBulkDelete,
  onBulkTogglePublished,
  addButtonText = 'Add New',
  showCheckboxes = false,
}: DraggableDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState(data);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;
  const isReorderingRef = useRef(false);

  // Update items when data changes, but only if we're not in the middle of reordering
  useEffect(() => {
    if (!isReorderingRef.current) {
      setItems(data);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter data based on search term
  const filteredData = items.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(
        item => (item._id || item.id) === active.id
      );
      const newIndex = items.findIndex(
        item => (item._id || item.id) === over?.id
      );

      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      // Set reordering flag to prevent data override
      isReorderingRef.current = true;

      if (onReorder) {
        await onReorder(newOrder);
        // Reset the flag after reordering is complete
        isReorderingRef.current = false;
      } else {
        isReorderingRef.current = false;
      }
    }
  };

  const handleSelectItem = (item: any, selected: boolean) => {
    const itemId = item._id || item.id;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = new Set(currentData.map(item => item._id || item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;

    const selectedData = currentData.filter(item =>
      selectedItems.has(item._id || item.id)
    );

    if (onBulkDelete) {
      onBulkDelete(selectedData);
      setSelectedItems(new Set());
    }
  };

  const handleBulkTogglePublished = (published: boolean) => {
    if (selectedItems.size === 0) return;

    const selectedData = currentData.filter(item =>
      selectedItems.has(item._id || item.id)
    );

    if (onBulkTogglePublished) {
      onBulkTogglePublished(selectedData, published);
    }
  };

  const isAllSelected =
    currentData.length > 0 &&
    currentData.every(item => selectedItems.has(item._id || item.id));
  const isIndeterminate =
    selectedItems.size > 0 && selectedItems.size < currentData.length;

  return (
    <div className='data-table-container'>
      {/* Header */}
      <div className='table-header'>
        <div className='header-left'>
          <h2 className='table-title'>{title}</h2>
          <span className='table-count'>
            {filteredData.length} of {items.length} items
          </span>
          <span className='drag-instruction'>
            💡 Drag the ⋮⋮ handle to reorder items
          </span>
        </div>
        <div className='header-right'>
          {/* <div className='search-container'>
            <input
              type='text'
              placeholder='Search...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='search-input'
            />
          </div> */}
          {onAdd && (
            <button onClick={onAdd} className='add-button'>
              + {addButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {showCheckboxes && selectedItems.size > 0 && (
        <div className='bulk-actions'>
          <span className='bulk-info'>
            {selectedItems.size} item(s) selected
          </span>
          <div className='bulk-buttons'>
            {onBulkTogglePublished && (
              <>
                <button
                  onClick={() => handleBulkTogglePublished(true)}
                  className='bulk-button activate-button'
                >
                  ✅ Activate Selected
                </button>
                <button
                  onClick={() => handleBulkTogglePublished(false)}
                  className='bulk-button deactivate-button'
                >
                  ❌ Deactivate Selected
                </button>
              </>
            )}
            {onBulkDelete && (
              <button
                onClick={handleBulkDelete}
                className='bulk-button delete-button'
              >
                🗑️ Delete Selected
              </button>
            )}
            <button
              onClick={() => setSelectedItems(new Set())}
              className='bulk-button clear-button'
            >
              ✕ Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='table-wrapper'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className='data-table'>
            <thead>
              <tr>
                {showCheckboxes && (
                  <th className='table-header-cell checkbox-header'>
                    <input
                      type='checkbox'
                      id='select-all-checkbox'
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        handleSelectAll(e.target.checked);
                      }}
                      onClick={e => e.stopPropagation()}
                      className='select-all-checkbox'
                    />
                  </th>
                )}
                <th className='table-header-cell drag-header'></th>
                {columns.map(column => (
                  <th key={column.key} className='table-header-cell'>
                    {column.label}
                  </th>
                ))}
                {(onTogglePublished || onEdit || onDelete) && (
                  <th className='table-header-cell actions-header'>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                <SortableContext
                  items={currentData.map(
                    (item, index) => item._id || item.id || index
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  {currentData.map((item, index) => (
                    <SortableRow
                      key={item._id || item.id || index}
                      item={item}
                      columns={columns}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onTogglePublished={onTogglePublished}
                      index={index}
                      isSelected={selectedItems.has(item._id || item.id)}
                      onSelect={handleSelectItem}
                      showCheckboxes={showCheckboxes}
                    />
                  ))}
                </SortableContext>
              ) : (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (showCheckboxes ? 1 : 0) +
                      (onTogglePublished || onEdit || onDelete ? 2 : 1)
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
        </DndContext>
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

        .drag-instruction {
          font-size: 0.75rem;
          color: #3b82f6;
          font-style: italic;
          margin-top: 0.25rem;
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
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          width: 200px;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .add-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-button:hover {
          background: #2563eb;
        }

        .bulk-actions {
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .bulk-info {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .bulk-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .bulk-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bulk-button.activate-button {
          background: #dcfce7;
          color: #16a34a;
        }

        .bulk-button.activate-button:hover {
          background: #bbf7d0;
        }

        .bulk-button.deactivate-button {
          background: #fee2e2;
          color: #dc2626;
        }

        .bulk-button.deactivate-button:hover {
          background: #fecaca;
        }

        .bulk-button.delete-button {
          background: #fee2e2;
          color: #dc2626;
        }

        .bulk-button.delete-button:hover {
          background: #fecaca;
        }

        .bulk-button.clear-button {
          background: #f1f5f9;
          color: #64748b;
        }

        .bulk-button.clear-button:hover {
          background: #e2e8f0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header-cell {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .checkbox-header {
          width: 50px;
          text-align: center;
        }

        .drag-header {
          width: 50px;
          text-align: center;
        }

        .actions-header {
          width: 150px;
          text-align: center;
          min-width: 150px;
        }

        .table-row {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          background: #fff;
          margin-bottom: 0.5rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          transition:
            box-shadow 0.2s,
            border-color 0.2s;
        }
        .table-row:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #3b82f6;
        }
        .table-row.selected {
          background: #eff6ff;
        }

        .table-row.dragging {
          cursor: grabbing;
          background: #f3f4f6;
        }

        .table-row:active {
          cursor: grabbing;
        }

        .table-cell {
          padding: 1rem;
          font-size: 0.875rem;
          color: #374151;
          vertical-align: middle;
        }

        .checkbox-cell {
          width: 50px;
          text-align: center;
          cursor: pointer;
          position: relative;
        }

        .checkbox-cell > div {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }

        .row-checkbox,
        .select-all-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
          background-color: white;
          border: 2px solid #d1d5db;
          border-radius: 3px;
          z-index: 1;
        }

        .drag-handle {
          width: 50px;
          text-align: center;
          cursor: grab;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .drag-indicator {
          color: #9ca3af;
          font-size: 1.25rem;
          line-height: 1;
          user-select: none;
        }

        .actions-cell {
          min-width: 150px;
          text-align: center;
          vertical-align: middle;
          position: relative;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .custom-checkbox-label {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          margin: 0;
        }
        .published-checkbox {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          z-index: 1;
        }
        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e1;
          border-radius: 4px;
          display: inline-block;
          position: relative;
          background: white;
          transition: all 0.2s;
        }
        .published-checkbox:checked + .custom-checkbox {
          background: #3b82f6;
          border-color: #3b82f6;
        }
        .published-checkbox:checked + .custom-checkbox::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 2px;
          width: 5px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .published-label {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1;
          white-space: nowrap;
        }

        .published-status-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 24px;
          position: relative;
        }

        .edit-delete-buttons {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .action-button {
          padding: 0.375rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
        }

        .action-button.edit-button {
          color: #3b82f6;
        }

        .action-button.edit-button:hover {
          background: #eff6ff;
          transform: scale(1.05);
        }

        .action-button.delete-button {
          color: #dc2626;
        }

        .action-button.delete-button:hover {
          background: #fef2f2;
          transform: scale(1.05);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-icon {
          font-size: 2rem;
          opacity: 0.5;
        }

        .empty-content p {
          color: #6b7280;
          margin: 0;
        }

        .clear-search {
          padding: 0.25rem 0.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
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
          gap: 1rem;
        }

        .pagination-button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #cbd5e1;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #64748b;
        }

        .status-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }
        .status-toggle-btn.active {
          background: #dcfce7;
        }
        .status-toggle-btn.inactive {
          background: #fee2e2;
        }
        .status-toggle-btn:hover {
          transform: scale(1.05);
        }
        .status-checkbox {
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #d1d5db;
          border-radius: 0.375rem;
          background: #fff;
          transition:
            border-color 0.2s,
            background 0.2s;
        }
        .status-checkbox.checked {
          border-color: #16a34a;
          background: #16a34a;
        }
        .status-checkbox svg {
          display: block;
        }
        .status-label {
          font-weight: 500;
          font-size: 0.875rem;
        }
        .status-toggle-btn.active .status-label {
          color: #16a34a;
        }
        .status-toggle-btn.inactive .status-label {
          color: #dc2626;
        }
        .status-toggle-btn:active {
          background: #f3f4f6;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .header-right {
            justify-content: space-between;
          }

          .search-input {
            width: 150px;
          }

          .bulk-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .bulk-buttons {
            justify-content: center;
          }

          .table-cell {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }

          .table-header-cell {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }

          .action-buttons {
            flex-direction: row;
            gap: 0.25rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .action-button {
            padding: 0.25rem;
            font-size: 0.9rem;
            min-width: 28px;
            height: 28px;
          }

          .edit-delete-buttons {
            gap: 0.125rem;
          }

          .status-toggle-btn {
            padding: 0.2rem 0.4rem;
            font-size: 0.8rem;
          }

          .status-label {
            font-size: 0.75rem;
          }

          .pagination {
            flex-direction: column;
            gap: 0.5rem;
          }

          .drag-instruction {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}

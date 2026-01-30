'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2, ExternalLink, ShieldAlert } from 'lucide-react';

interface ActionDropdownProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkSuspicious?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  markSuspiciousLabel?: string;
  viewHref?: string;
  editHref?: string;
  className?: string;
}

export function ActionDropdown({
  onView,
  onEdit,
  onDelete,
  onMarkSuspicious,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  markSuspiciousLabel = 'Mark Suspicious',
  viewHref,
  editHref,
  className = '',
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Check if there's enough space below, if not, show above
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 150; // Approximate dropdown height
      const viewportHeight = window.innerHeight;
      
      // If button is in lower half of viewport, show above
      // Or if there's not enough space below, show above
      if (rect.bottom > viewportHeight / 2 || spaceBelow < dropdownHeight) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
    
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // Small delay to allow moving to dropdown
  };

  const handleView = () => {
    if (viewHref) {
      window.location.href = viewHref;
    } else if (onView) {
      onView();
    }
    setIsOpen(false);
  };

  const handleEdit = () => {
    if (editHref) {
      window.location.href = editHref;
    } else if (onEdit) {
      onEdit();
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setIsOpen(false);
  };

  const handleMarkSuspicious = () => {
    if (onMarkSuspicious) {
      onMarkSuspicious();
    }
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div 
          ref={dropdownMenuRef}
          className={`absolute right-0 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-[100] py-1 ${
            position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
            {(onView || viewHref) && (
              <button
                onClick={handleView}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye size={16} className="mr-3" />
                {viewLabel}
              </button>
            )}
            {(onEdit || editHref) && (
              <button
                onClick={handleEdit}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit size={16} className="mr-3" />
                {editLabel}
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={16} className="mr-3" />
                {deleteLabel}
              </button>
            )}
            {onMarkSuspicious && (
              <button
                onClick={handleMarkSuspicious}
                className="w-full flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <ShieldAlert size={16} className="mr-3" />
                {markSuspiciousLabel}
              </button>
            )}
          </div>
      )}
    </div>
  );
}

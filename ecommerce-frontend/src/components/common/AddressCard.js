import React from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        selectable ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-[#2874f0] bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => selectable && onSelect && onSelect(address)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {selectable && (
            <input
              type="radio"
              checked={selected}
              onChange={() => onSelect && onSelect(address)}
              className="mt-1 accent-[#2874f0]"
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-[#2874f0]" />
              <span className="text-sm font-semibold text-gray-900">
                {address.label}
              </span>
            </div>
            <p className="text-sm text-gray-600">{address.street}</p>
            <p className="text-sm text-gray-600">
              {address.city}, {address.state} - {address.zipCode}
            </p>
            <p className="text-sm text-gray-500">{address.country}</p>
          </div>
        </div>

        {!selectable && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit && onEdit(address)}
              className="text-gray-400 hover:text-[#2874f0] transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete && onDelete(address.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
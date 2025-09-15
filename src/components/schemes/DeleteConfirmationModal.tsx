import React from 'react';
import { Scheme } from '@/app/types/scheme';

interface DeleteConfirmationModalProps {
  scheme: Scheme | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = React.memo(({ scheme, onConfirm, onCancel }) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the scheme &quot;{scheme.schemeTitle}&quot;? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmationModal.displayName = 'DeleteConfirmationModal';

export default DeleteConfirmationModal;

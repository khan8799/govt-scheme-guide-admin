import React from 'react';

interface EditConfirmationModalProps {
  isEditMode: boolean;
  schemeTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const EditConfirmationModal: React.FC<EditConfirmationModalProps> = React.memo(({ 
  isEditMode, 
  schemeTitle, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4">
          {isEditMode ? 'Confirm Edit' : 'Confirm Cancel'}
        </h3>
        <p className="text-gray-700 mb-4">
          {isEditMode 
            ? `You are about to update the scheme "${schemeTitle}". Are you sure you want to proceed?`
            : `You have unsaved changes for the scheme "${schemeTitle}". Are you sure you want to discard these changes?`
          }
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md hover:opacity-90 ${
              isEditMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isEditMode ? 'Confirm Edit' : 'Yes, Cancel'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            {isEditMode ? 'Cancel' : 'No, Continue Editing'}
          </button>
        </div>
      </div>
    </div>
  );
});

EditConfirmationModal.displayName = 'EditConfirmationModal';

export default EditConfirmationModal;

import React from 'react';
import { X } from 'lucide-react';
import ReferralSystem from './ReferralSystem';

const ReferralModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-dad-dark">Referral Program</h2>
            <button
              onClick={onClose}
              className="text-dad-olive hover:text-dad-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <ReferralSystem />
        </div>
      </div>
    </div>
  );
};

export default ReferralModal; 
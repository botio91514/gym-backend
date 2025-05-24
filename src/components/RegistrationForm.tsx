import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    image: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image must be less than 10MB');
      return;
    }
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WEBP images allowed');
      return;
    }
    setFormData(prev => ({ ...prev, image: file || null }));
  };

  return (
    <div>
      {/* ... existing code ... */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <span className="text-xs text-gray-400 ml-2">Max size: 10MB. JPG/PNG/WEBP recommended.</span>
      {/* ... existing code ... */}
    </div>
  );
};

export default RegistrationForm; 
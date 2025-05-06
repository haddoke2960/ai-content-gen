import React, { useRef } from 'react';

type Props = {
  onUpload: (file: File) => void;
};

const ImageUpload: React.FC<Props> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, etc).');
      return;
    }
  
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image is too large. Please upload one under 5MB.');
      return;
    }
  
    setPreviewUrl(URL.createObjectURL(file));
    onUpload(file);
  };
  

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
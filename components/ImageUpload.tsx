import React from 'react';

type ImageUploadProps = {
  onUpload: (file: File) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleChange}
      style={{ margin: '10px 0' }}
    />
  );
};

export default ImageUpload;
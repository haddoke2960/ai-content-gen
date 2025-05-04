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
    <div style={{ margin: '1rem 0' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default ImageUpload;
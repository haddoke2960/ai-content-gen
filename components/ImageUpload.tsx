import React, { useRef } from 'react';

type Props = {
  onUpload: (file: File) => void;
};

const ImageUpload: React.FC<Props> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
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
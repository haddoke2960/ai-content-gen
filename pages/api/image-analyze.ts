import { useState } from 'react';

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/image-analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setCaption(data.caption || 'No caption found');
    setLoading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? 'Analyzing...' : 'Get Caption'}
      </button>

      {caption && (
        <div>
          <h3>Caption:</h3>
          <p>{caption}</p>
        </div>
      )}
    </div>
  );
}
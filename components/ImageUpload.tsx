import { useState } from 'react';

const ImageUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setError(null);
    setCaption(null);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    setCaption(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      const res = await fetch('/api/image-analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Image analysis request failed');
      }
      const data = await res.json();
      setCaption(data.caption);
    } catch (err: any) {
      setError(err.message || 'Failed to get caption');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Upload an Image to Get a Caption</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div style={{ margin: '1rem 0' }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%' }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={!selectedImage || loading}>
        {loading ? 'Analyzing...' : 'Get Caption'}
      </button>
      {caption && <p><strong>Caption:</strong> {caption}</p>}
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
    </div>
  );
};

export default ImageUpload;
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import ImageUpload from '../components/ImageUpload';

type ContentType = 
  | 'ViralTag'
  | 'Generate Image'
  | 'Image Caption from Upload'
  | 'Blog Post'
  | 'Social Media Post';

type HistoryEntry = {
  type: ContentType;
  prompt: string;
  result?: string;
  imageUrl?: string;
  timestamp: number;
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('ViralTag');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if ((!prompt.trim() && contentType !== 'Image Caption from Upload') || (contentType === 'Image Caption from Upload' && !file)) {
      setError('Please enter a prompt or upload an image.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setImageUrl('');

    try {
      if (contentType === 'Image Caption from Upload' && file) {
        // Step 1: Upload image to Vercel Blob
        const uploadData = new FormData();
        uploadData.append('file', file);

        const uploadRes = await fetch('/api/blob-upload', {
          method: 'POST',
          body: uploadData,
        });

        const { url: publicImageUrl } = await uploadRes.json();

        // Step 2: Send to GPT-4 Vision
        const captionRes = await fetch('/api/image-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: publicImageUrl }),
        });

        const { caption, error } = await captionRes.json();
        if (error || !caption) throw new Error(error || 'Caption generation failed');

        setResult(caption);
        setImageUrl(publicImageUrl);
        setHistory(prev => [...prev, {
          type: contentType,
          prompt: file.name,
          result: caption,
          imageUrl: publicImageUrl,
          timestamp: Date.now()
        }]);
        return;
      }

      const formattedPrompt = contentType === 'ViralTag'
        ? `Generate exactly 10 unique, viral hashtags separated by commas about: ${prompt}`
        : prompt;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: formattedPrompt, contentType }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setHistory(prev => [...prev, {
          type: contentType,
          prompt,
          imageUrl: data.imageUrl,
          timestamp: Date.now()
        }]);
      } else {
        setResult(data.result);
        setHistory(prev => [...prev, {
          type: contentType,
          prompt,
          result: data.result,
          timestamp: Date.now()
        }]);
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(result || 'No content generated', 10, 10, { maxWidth: 180 });
    doc.save('generated-content.pdf');
  };

  const shareTo = (platform: string) => {
    const text = encodeURIComponent(result || prompt);
    const url = encodeURIComponent(window.location.href);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`
    };
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>AI Content Generator</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <select 
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType)}
          style={{ padding: '0.5rem', width: '100%' }}
        >
          <option value="ViralTag">#ViralTag Generator</option>
          <option value="Generate Image">Image Generation</option>
          <option value="Image Caption from Upload">Image Caption</option>
          <option value="Blog Post">Blog Post</option>
          <option value="Social Media Post">Social Media</option>
        </select>
      </div>

      {contentType === 'Image Caption from Upload' ? (
        <ImageUpload onUpload={setFile} />
      ) : (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            contentType === 'ViralTag' 
              ? 'Enter a topic for viral tags...' 
              : 'Enter your prompt...'
          }
          style={{
            width: '100%',
            padding: '0.8rem',
            marginBottom: '1rem',
            minHeight: '100px'
          }}
        />
      )}

      <button 
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '0.8rem 1.5rem',
          background: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {error && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {(result || imageUrl) && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Result:</h3>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated content"
              style={{ maxWidth: '100%', margin: '1rem 0' }}
            />
          ) : contentType === 'ViralTag' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.split(',').map((tag, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.3rem 0.6rem',
                    background: '#f0f0f0',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}
                >
                  #{tag.trim()}
                </div>
              ))}
            </div>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '0.5rem 1rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Download PDF
            </button>
            <button onClick={() => shareTo('facebook')}>Share to Facebook</button>
            <button onClick={() => shareTo('twitter')}>Share to Twitter</button>
            <button onClick={() => shareTo('linkedin')}>Share to LinkedIn</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>History</h2>
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('history');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Clear History
            </button>
          </div>

          {history.map((entry) => (
            <div
              key={entry.timestamp}
              style={{
                margin: '1rem 0',
                padding: '1rem',
                border: '1px solid #eee',
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{entry.type}</strong>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0' }}><strong>Prompt:</strong> {entry.prompt}</p>
              {entry.imageUrl ? (
                <img
                  src={entry.imageUrl}
                  alt="Generated content"
                  style={{ maxWidth: '200px', marginTop: '0.5rem' }}
                />
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{entry.result}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
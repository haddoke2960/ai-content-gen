import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import ImageUpload from '../components/ImageUpload';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'text' | 'image' | 'tags'>('text');
  const [result, setResult] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<
    { type: string; prompt: string; result?: string; imageUrl?: string }[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem('history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setResult('');
    setImageUrl('');
    try {
      const body: any = { prompt: mode === 'tags' ? `#ViralTag ${prompt}` : prompt };
      if (mode === 'image') {
        body.image = true;
      }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Generation request failed');
      }
      const data = await res.json();
      if (mode === 'image') {
        setImageUrl(data.imageUrl);
        setHistory((prev) => [...prev, { type: mode, prompt, imageUrl: data.imageUrl }]);
      } else if (mode === 'tags') {
        setResult(data.tags);
        setHistory((prev) => [...prev, { type: mode, prompt, result: data.tags }]);
      } else {
        setResult(data.result);
        setHistory((prev) => [...prev, { type: mode, prompt, result: data.result }]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(result || 'No content generated yet.', 10, 10, { maxWidth: 180 });
    doc.save('ai-content.pdf');
  };

  const shareTo = (platform: string) => {
    const shareText = encodeURIComponent(result || prompt);
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${shareText}%20${url}`;
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Content Generator</h1>

      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="mode-select"><strong>Select Mode:</strong> </label>
        <select 
          id="mode-select" 
          value={mode} 
          onChange={(e) => setMode(e.target.value as 'text' | 'image' | 'tags')}
        >
          <option value="text">Text Generation</option>
          <option value="image">Image Generation</option>
          <option value="tags">Viral Tags</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="prompt"><strong>
          {mode === 'text' && 'Enter a prompt for text generation:'}
          {mode === 'image' && 'Enter a description for the image:'}
          {mode === 'tags' && 'Enter a topic to generate viral tags:'}
        </strong></label><br/>
        <textarea 
          id="prompt"
          rows={4} 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          style={{ width: '100%', maxWidth: '500px' }}
        />
      </div>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {(result || imageUrl) && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Result:</h3>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Generated" 
              style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }} 
            />
          ) : (
            <p>{result}</p>
          )}
          <button onClick={handleDownloadPDF}>Download PDF</button>
          <div style={{ marginTop: '1rem' }}>
            <strong>Share:</strong>
            <button onClick={() => shareTo('facebook')}>Facebook</button>
            <button onClick={() => shareTo('twitter')}>Twitter</button>
            <button onClick={() => shareTo('linkedin')}>LinkedIn</button>
            <button onClick={() => shareTo('whatsapp')}>WhatsApp</button>
          </div>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <ImageUpload />

      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>History</h3>
          <button onClick={() => {
            setHistory([]);
            localStorage.removeItem('history');
          }}>
            Clear History
          </button>
          {history.map((item, index) => (
            <div key={index} style={{ marginTop: '1rem' }}>
              <strong>{item.type}</strong><br />
              <strong>Prompt:</strong> {item.prompt}<br />
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
              ) : (
                <pre>{item.result}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
type ContentType =
  | '#ViralTag'
  | 'Keyword Generator'
  | 'Amazon Product Optimizer'
  | 'Product Comparison'
  | 'Product Description'
  | 'TikTok Hook'
  | 'YouTube Video Description'
  | 'YouTube Video Title'
  | 'YouTube Tags'
  | 'Blog Post'
  | 'Instagram Caption'
  | 'Facebook Post'
  | 'LinkedIn Post'
  | 'Reddit Post'
  | 'Tweet'
  | 'Generate Image';

type HistoryEntry = {
  type: ContentType;
  prompt: string;
  result?: string;
  imageUrl?: string;
  timestamp: number;
};

const speakText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('#ViralTag');
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
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setImageUrl('');

    try {
      const formattedPrompt =
        contentType === '#ViralTag'
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
          <optgroup label="Hashtag Tools">
            <option value="#ViralTag">#ViralTag</option>
            <option value="Keyword Generator">Keyword Generator</option>
          </optgroup>

          <optgroup label="E-Commerce">
            <option value="Amazon Product Optimizer">Amazon Product Optimizer</option>
            <option value="Product Comparison">Product Comparison</option>
            <option value="Product Description">Product Description</option>
          </optgroup>

          <optgroup label="Video & Script Writing">
            <option value="TikTok Hook">TikTok Hook</option>
            <option value="YouTube Video Description">YouTube Video Description</option>
            <option value="YouTube Video Title">YouTube Video Title</option>
            <option value="YouTube Tags">YouTube Tags</option>
          </optgroup>

          <optgroup label="Social Media Posts">
            <option value="Instagram Caption">Instagram Caption</option>
            <option value="Facebook Post">Facebook Post</option>
            <option value="LinkedIn Post">LinkedIn Post</option>
            <option value="Reddit Post">Reddit Post</option>
            <option value="Tweet">Tweet</option>
          </optgroup>

          <optgroup label="Writing & Content">
            <option value="Blog Post">Blog Post</option>
          </optgroup>

          <optgroup label="AI Visual Tools">
            <option value="Generate Image">Generate Image</option>
          </optgroup>
        </select>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={`Enter your ${contentType.toLowerCase()} prompt...`}
        style={{
          width: '100%',
          padding: '0.8rem',
          marginBottom: '1rem',
          minHeight: '100px'
        }}
      />

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
          ) : contentType === '#ViralTag' ? (
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
            <button onClick={() => speakText(result)}>🔊 Listen to this</button>
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

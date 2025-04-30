import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { jsPDF } from 'jspdf';

interface HistoryEntry {
  prompt: string;
  contentType: string;
  result: string;
}

const Home: NextPage = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('Blog Post');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistory(parsed as HistoryEntry[]);
          }
        } catch (err) {
          console.error('Failed to load history', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('history', JSON.stringify(history));
    }
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType })
      });
      if (!response.ok) {
        throw new Error('Failed to generate content.');
      }
      const data = await response.json();
      if (!data.result) {
        throw new Error('No result returned.');
      }
      setResult(data.result);
      const newEntry: HistoryEntry = { prompt, contentType, result: data.result };
      setHistory(prev => [...prev, newEntry]);
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  const shareOnFacebook = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer.php?u=${url}`, '_blank');
  };
  const shareOnTwitter = () => {
    if (!result) return;
    const text = encodeURIComponent(result.slice(0, 150));
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/share?url=${url}&text=${text}`, '_blank');
  };
  const shareOnWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(result);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };
  const shareOnLinkedIn = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(result.slice(0, 150));
    window.open(`https://www.linkedin.com/shareArticle?url=${url}&title=${text}`, '_blank');
  };
  const shareOnReddit = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(result.slice(0, 150));
    window.open(`https://reddit.com/submit?url=${url}&title=${text}`, '_blank');
  };
  const shareOnPinterest = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(result.slice(0, 150));
    window.open(`https://pinterest.com/pin/create/bookmarklet/?url=${url}&description=${text}`, '_blank');
  };

  const handleDownloadPDF = () => {
    if (history.length === 0) {
      alert('No history to download.');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(12);
    let y = 10;
    history.forEach((entry, index) => {
      doc.text(`Prompt: ${entry.prompt}`, 10, y);
      y += 10;
      doc.text(`Type: ${entry.contentType}`, 10, y);
      y += 10;
      const lines = doc.splitTextToSize(entry.result, 180);
      lines.forEach(line => {
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 10;
      });
      y += 10;
      if (y > 270 && index < history.length - 1) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save('history.pdf');
  };

  const handleClearHistory = () => {
    if (history.length === 0) {
      alert('History is already empty.');
      return;
    }
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('history');
    }
    setResult('');
    setError('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>AI Content Generator</h1>
      <div style={{ margin: '20px 0' }}>
        <textarea
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
        />
      </div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="contentType" style={{ marginRight: '8px', fontWeight: 'bold' }}>Content type:</label>
        <select
          id="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          style={{ marginRight: '8px', padding: '6px', fontSize: '16px' }}
        >
          <option>Blog Post</option>
          <option>Short Story</option>
          <option>Poem</option>
          <option>Essay</option>
          <option>Marketing Copy</option>
          <option>Code</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: '6px 12px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '15px', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
        {loading ? (
          <em>Generating...</em>
        ) : error ? (
          <span style={{ color: 'red' }}>{error}</span>
        ) : result ? (
          result
        ) : (
          <em>Generated content will appear here.</em>
        )}
      </div>
      {result && (
        <div style={{ margin: '10px 0' }}>
          <strong>Share:</strong>
          <button style={{ marginLeft: '8px', backgroundColor: '#4267B2', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }} onClick={shareOnFacebook}>Facebook</button>
          <button style={{ marginLeft: '5px', backgroundColor: '#1DA1F2', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }} onClick={shareOnTwitter}>Twitter</button>
          <button style={{ marginLeft: '5px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }} onClick={shareOnWhatsApp}>WhatsApp</button>
          <button style={{ marginLeft: '5px', backgroundColor: '#0077B5', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }} onClick={shareOnLinkedIn}>LinkedIn</button>
          <button style={{ marginLeft: '5px', backgroundColor: '#FF4500', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }} onClick={shareOnReddit}>Reddit</button>
          <button style={{ marginLeft: '5px', backgroundColor: '#E60023', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }} onClick={shareOnPinterest}>Pinterest</button>
        </div>
      )}
      {history.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>History</h3>
            <div>
              <button onClick={handleClearHistory} style={{ marginRight: '8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>Clear History</button>
              <button onClick={handleDownloadPDF} style={{ backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>Download PDF</button>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            {history.map((entry, idx) => (
              <div key={idx} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '10px', marginBottom: '10px' }}>
                <div><strong>Prompt:</strong> {entry.prompt}</div>
                <div><strong>Type:</strong> {entry.contentType}</div>
                <div><strong>Result:</strong></div>
                <div style={{ whiteSpace: 'pre-wrap', marginLeft: '10px' }}>{entry.result}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h4>Subscribe to our newsletter</h4>
        <input type="email" placeholder="Enter your email" style={{ padding: '6px', fontSize: '14px', width: '200px', marginRight: '8px' }} />
        <button onClick={() => alert('Subscribed!')} style={{ backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>Subscribe</button>
      </div>
    </div>
  );
};

export default Home;

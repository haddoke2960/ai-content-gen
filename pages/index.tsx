import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Home() {
  const [contentType, setContentType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt || !contentType) {
      setGeneratedResult('Error: Missing content type or prompt.');
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedResult(data.result);

        if (prompt && data.result) {
          await fetch('/api/saveToHistory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, result: data.result }),
          });

          setHistory((prev) => [data.result, ...prev]);
        }
      } else {
        setGeneratedResult('Something went wrong. Try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedResult('Something went wrong. Try again.');
    }
  };

  const handleCopy = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(generatedResult);
      alert('Copied to clipboard!');
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Generated Content History:', 10, 10);

    history.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`, 10, 20 + index * 10);
    });

    doc.save('history.pdf');
  };

  const clearDatabaseHistory = async () => {
    try {
      const response = await fetch('/api/clearHistory', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setHistory([]);
      } else {
        alert('Failed to clear database history.');
      }
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Error clearing database.');
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedResult)}`;
    window.open(url, '_blank');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedResult)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(generatedResult)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(generatedResult)}`;
    window.open(url, '_blank');
  };

  const shareOnReddit = () => {
    const url = `https://reddit.com/submit?title=${encodeURIComponent(generatedResult)}`;
    window.open(url, '_blank');
  };

  const shareOnPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(generatedResult)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI Content Generator</h1>

      <div style={{ marginBottom: '10px' }}>
        <label>Choose Content Type:</label>
        <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
          <option value="">Select a type</option>
          <option value="Instagram Caption">Instagram Caption</option>
          <option value="Product Description">Product Description</option>
          <option value="LinkedIn Post">LinkedIn Post</option>
          <option value="YouTube Video Description">YouTube Video Description</option>
          <option value="TikTok Hook">TikTok Hook</option>
          <option value="Hashtag Generator">Hashtag Generator</option>
          <option value="Facebook Post">Facebook Post</option>
          <option value="Twitter Post">Twitter Post</option>
          <option value="WhatsApp Message">WhatsApp Message</option>
          <option value="Reddit Post">Reddit Post</option>
          <option value="Pinterest Pin Description">Pinterest Pin Description</option>
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Describe your topic:</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. tips for selling handmade soap"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <button onClick={handleGenerate} style={{ padding: '10px 20px', fontWeight: 'bold' }}>
        Generate
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Generated Result:</h3>
        <p>{generatedResult || 'Nothing yet'}</p>

        {generatedResult && (
          <>
            <button onClick={handleCopy} style={{ marginTop: '10px' }}>Copy</button>

            <div style={{ marginTop: '10px' }}>
              <h4>Share</h4>
              <button onClick={shareOnFacebook}>Facebook</button>
              <button onClick={shareOnTwitter}>Twitter</button>
              <button onClick={shareOnWhatsApp}>WhatsApp</button>
              <button onClick={shareOnLinkedIn}>LinkedIn</button>
              <button onClick={shareOnReddit}>Reddit</button>
              <button onClick={shareOnPinterest}>Pinterest</button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Previous Captions:</h3>
        <ul>
          {history.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        {history.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={clearHistory} style={{ marginRight: '10px' }}>
              Clear Local History
            </button>
            <button onClick={downloadPDF}>Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}

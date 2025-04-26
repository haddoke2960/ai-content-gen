
import { useState, useEffect } from 'react';

export default function Home() {
  const [contentType, setContentType] = useState('Instagram Caption');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('caption-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic before generating.');
      return;
    }

    setError('');
    setLoading(true);
    setResult('');
    setCopied(false);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.result);

        setHistory((prev) => {
          const updated = [data.result, ...prev].slice(0, 5);
          localStorage.setItem('caption-history', JSON.stringify(updated));
          return updated;
        });
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult('Something went wrong.');
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const allText = history.join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'captions.txt';
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('caption-history');
    setHistory([]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'Arial',
        backgroundColor: darkMode ? '#121212' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1>AI Content Generator</h1>
        <button onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <label>Choose Content Type:</label>
      <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
        <option>Instagram Caption</option>
        <option>Product Description</option>
        <option>LinkedIn Post</option>
        <option>YouTube Video Description</option>
        <option>TikTok Hook</option>
        <option>Hashtag Generator</option>
      </select>

      <br /><br />

      <label>Describe your topic:</label><br />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        cols={60}
        placeholder="e.g. tips for selling handmade soap"
      />

      {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}

      <br /><br />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      <h3>Generated Result:</h3>
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '1rem', backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9' }}>
        {result || 'Nothing yet'}
      </div>

      {result && (
        <div>
          <br />
          <button onClick={handleCopy}>Copy</button>
          {copied && <span style={{ marginLeft: '10px', color: 'green' }}>Copied!</span>}
        </div>
      )}

      <h3 style={{ marginTop: '2rem' }}>Previous Captions:</h3>
      <ul>
        {history.length === 0 && <li>No previous captions yet.</li>}
        {history.map((item, index) => (
          <li key={index} style={{ marginBottom: '1rem' }}>
            <div style={{ border: '1px solid #ccc', padding: '0.5rem', backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9' }}>
              {item}
            </div>
          </li>
        ))}
      </ul>

      {history.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleDownload} style={{ marginRight: '1rem' }}>
            Download Captions
          </button>
          <button onClick={handleClearHistory} style={{ backgroundColor: 'red', color: 'white' }}>
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}

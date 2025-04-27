import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Home() {
  const [contentType, setContentType] = useState('Instagram Caption');
  const [prompt, setPrompt] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('caption-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic before generating.');
      return;
    }

    setError('');
    setLoading(true);
    setGeneratedResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contentType,
          prompt: prompt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedResult(data.result);

        // Save to Firebase
        await addDoc(collection(db, "history"), {
          prompt: prompt,
          result: data.result,
          createdAt: new Date(),
        });

        // Update local history
        setHistory((prev) => {
          const updated = [data.result, ...prev];
          localStorage.setItem('caption-history', JSON.stringify(updated));
          return updated;
        });
      } else {
        setGeneratedResult(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedResult('Something went wrong. Try again.');
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const allText = history.join('\r\n');
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
        backgroundColor: darkMode ? '#111' : '#fff',
        color: darkMode ? '#ffffff' : '#000',
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      <label>Describe your topic:</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        cols={60}
        placeholder="e.g. tips for selling handmade soap"
      />

      <br /><br />

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button onClick={handleGenerate}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      <br /><br />

      <h2>Generated Result:</h2>
      <div style={{ border: '1px solid #ccc', padding: '1rem', minHeight: '100px' }}>
        {generatedResult || 'Nothing yet'}
      </div>

      <div>
        <br />
        <button onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <h3 style={{ marginTop: '2rem' }}>Previous Captions:</h3>
      <ul>
        {history.length === 0 && <li>No previous captions yet.</li>}
        {history.map((item, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>
            <div style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
              {item}
            </div>
          </li>
        ))}
      </ul>

      {history.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleDownload}>
            Download Captions
          </button>
          <button onClick={handleClearHistory} style={{ marginLeft: '1rem' }}>
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}


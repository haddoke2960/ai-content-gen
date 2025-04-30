import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Home() {
  const [contentType, setContentType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [language, setLanguage] = useState('en');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleTranslate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello, how are you?',
          targetLanguage: 'Urdu',
        }),
      });
  
      const data = await res.json();
      setTranslated(data.translated || 'No result');
    } catch (error) {
      setTranslated('Error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerate = async () => {
    if (!prompt || !contentType) {
      setGeneratedResult('Error: Missing content type or prompt');
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

  const share = (platform: string) => {
    const encoded = encodeURIComponent(generatedResult);
    const urls: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      reddit: `https://reddit.com/submit?title=${encoded}`,
      pinterest: `https://pinterest.com/pin/create/button/?description=${encoded}`,
    };
    window.open(urls[platform], '_blank');
  };

  const handleTranslate = async () => {
    if (!generatedResult || language === 'en') return;
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedResult, targetLang: language }),
      });
      const data = await response.json();
      if (response.ok) setGeneratedResult(data.translatedText);
    } catch (err) {
      alert('Translation failed.');
    }
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
              <button onClick={() => share('facebook')}>Facebook</button>
              <button onClick={() => share('twitter')}>Twitter</button>
              <button onClick={() => share('whatsapp')}>WhatsApp</button>
              <button onClick={() => share('linkedin')}>LinkedIn</button>
              <button onClick={() => share('reddit')}>Reddit</button>
              <button onClick={() => share('pinterest')}>Pinterest</button>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>Translate to:</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English (default)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="ur">Urdu</option>
                <option value="pa">Punjabi</option>
                <option value="ru">Russian</option>
                <option value="fa">Persian (Farsi)</option>
                <option value="tg">Tajik (Tajiki)</option>
              </select>
              <button onClick={handleTranslate}>Translate</button>
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
<div style={{ marginTop: '2rem' }}>
  <h2>Translate Demo</h2>
  <button onClick={handleTranslate} disabled={loading}>
    {loading ? 'Translating...' : 'Translate to Urdu'}
  </button>
  {translated && (
    <p style={{ marginTop: '1rem' }}>
      <strong>Translated:</strong> {translated}
    </p>
  )}
</div>

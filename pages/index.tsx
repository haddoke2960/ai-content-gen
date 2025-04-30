
import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Home() {
  // State variables
  const [contentType, setContentType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [language, setLanguage] = useState('en'); // default language for translation (English)
  const [loading, setLoading] = useState(false);  // loading state for translation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Handle AI content generation
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
      if (response.ok && data.result) {
        setGeneratedResult(data.result);
        // Save to history (local state and optional backend)
        if (prompt && data.result) {
          // Optionally save to backend history
          await fetch('/api/saveToHistory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, result: data.result }),
          });
          // Update local history state (newest first)
          setHistory(prev => [data.result, ...prev]);
        }
      } else {
        setGeneratedResult('Something went wrong. Try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedResult('Something went wrong. Try again.');
    }
  };

  // Handle text translation of the generated result
  const handleTranslate = async () => {
    if (!generatedResult || language === 'en') return;
    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedResult, targetLang: language }),
      });
      const data = await res.json();
      if (res.ok && data.translated) {
        // Replace the generated result with its translation
        setGeneratedResult(data.translated);
      }
      
        alert('Translation failed.');
      }
    } catch (err) {
      console.error('Translation error:', err);
      alert('Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Copy the generated result to clipboard
  const handleCopy = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(generatedResult);
      alert('Copied to clipboard!');
    }
  };

  // Clear the local history
  const clearHistory = () => {
    setHistory([]);
  };

  // Download the history as a PDF file
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Generated Content History:', 10, 10);
    history.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`, 10, 20 + index * 10);
    });
    doc.save('history.pdf');
  };

  // Share the generated result on a chosen platform
  const share = (platform: string) => {
    if (!generatedResult) return;
    const encoded = encodeURIComponent(generatedResult);
    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      reddit: `https://reddit.com/submit?title=${encoded}`,
      pinterest: `https://pinterest.com/pin/create/button/?description=${encoded}`,
    };
    const url = urls[platform];
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Handle lead capture form submission (fake handler)
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send name and email to a server or API
    alert(`Thank you, ${name}! You are subscribed (demo only).`);
    // Clear the form fields
    setName('');
    setEmail('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI Content Generator</h1>

      {/* Content Type Selection */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Choose Content Type:</label>
        <select 
          value={contentType} 
          onChange={(e) => setContentType(e.target.value)} 
          style={{ minWidth: '200px' }}
        >
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

      {/* Prompt Input */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Enter Prompt:</label>
        <textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          rows={3} 
          style={{ width: '100%', padding: '5px' }} 
          placeholder="Type your prompt here..."
        />
      </div>
      <button onClick={handleGenerate} style={{ marginBottom: '20px' }}>
        Generate
      </button>

      {/* Generated Result Display and Actions */}
      {generatedResult && (
        <div style={{ marginBottom: '20px' }}>
          <div 
            style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px' }}
          >
            {generatedResult}
          </div>
          <div style={{ marginTop: '5px' }}>
            <button onClick={handleCopy} style={{ marginRight: '10px' }}>
              Copy to Clipboard
            </button>
            {/* Social Sharing Buttons */}
            <button onClick={() => share('facebook')} style={{ marginRight: '5px' }}>Facebook</button>
            <button onClick={() => share('twitter')} style={{ marginRight: '5px' }}>Twitter</button>
            <button onClick={() => share('whatsapp')} style={{ marginRight: '5px' }}>WhatsApp</button>
            <button onClick={() => share('linkedin')} style={{ marginRight: '5px' }}>LinkedIn</button>
            <button onClick={() => share('reddit')} style={{ marginRight: '5px' }}>Reddit</button>
            <button onClick={() => share('pinterest')}>Pinterest</button>
          </div>
        </div>
      )}

      {/* Translation Section */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Translate to:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
          style={{ marginRight: '10px' }}
        >
          <option value="en">English (default)</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
          <option value="ur">Urdu</option>
          <option value="pa">Punjabi</option>
          <option value="ru">Russian</option>
          <option value="fa">Persian (Farsi)</option>
          <option value="tg">Tajik (Tajiki)</option>
        </select>
        <button onClick={handleTranslate} disabled={loading || !generatedResult || language === 'en'}>
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {/* Google AdSense Placeholder */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        {/* Google AdSense Ad Placeholder (for later integration) */}
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '250px' }}
             data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
             data-ad-slot="xxxxxxxxxx"
             data-ad-format="auto"
             data-full-width-responsive="true">
        </ins>
      </div>

      {/* Lead Capture Form */}
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc' }}>
        <h2>Join Our Mailing List</h2>
        <form onSubmit={handleLeadSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input 
              type="text" 
              placeholder="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button type="submit" style={{ padding: '8px 16px' }}>
              Subscribe
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>Previous Results:</h3>
          <ul>
            {history.map((item, index) => (
              <li key={index} style={{ whiteSpace: 'pre-wrap' }}>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '10px' }}>
            <button onClick={clearHistory} style={{ marginRight: '10px' }}>
              Clear Local History
            </button>
            <button onClick={downloadPDF}>
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
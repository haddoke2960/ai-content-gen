// ✅ Final index.tsx with everything: voice, image upload, smart display, sharing, history, subscribe
// Copy this entire file into your pages/index.tsx

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('Generate Image');
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice recognition not supported.');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setPrompt(prev => prev + ' ' + speechResult);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    setImageUrl('');

    try {
      let finalResult = '';

      const apiPrompt = (text: string) => JSON.stringify({ prompt: text, contentType });
      const fetchResult = async (text: string) => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: apiPrompt(text),
        });
        const data = await res.json();
        return data.result || data.image || 'No result returned.';
      };

      if (contentType === 'Generate Image') {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, contentType })
        });
        const data = await res.json();
        if (data.image) {
          setImageUrl(data.image);
          setHistory([{ prompt, contentType, result: data.image, date: new Date().toLocaleString() }, ...history]);
        } else {
          setResult('No image returned.');
        }
        setLoading(false);
        return;
      }

      if (contentType === '#ViralTag') {
        finalResult = await fetchResult(`Generate 10 viral hashtags about: ${prompt}`);
      } else if (contentType === 'Keyword Generator') {
        finalResult = await fetchResult(`List 10 high-volume keywords for: ${prompt}`);
      } else if (contentType === 'Amazon Product Optimizer') {
        finalResult = await fetchResult(`Create SEO Amazon title and 5 bullets for: ${prompt}`);
      } else if (contentType === 'Product Comparison') {
        finalResult = await fetchResult(`Compare this product with top alternatives: ${prompt}`);
      } else {
        finalResult = await fetchResult(prompt);
        const typesWithTags = [
          'Instagram Caption', 'Facebook Post', 'Tweet', 'YouTube Tags', 'YouTube Video Description', 'TikTok Hook'
        ];
        if (typesWithTags.includes(contentType)) {
          finalResult += '\n\n#viral #trending #foryou #reels';
        }
      }

      setResult(finalResult);
      setHistory([{ prompt, contentType, result: finalResult, date: new Date().toLocaleString() }, ...history]);
    } catch {
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const share = (platform: string) => {
    const text = encodeURIComponent(result);
    const url = encodeURIComponent(window.location.href);
    const links: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
      pinterest: `https://pinterest.com/pin/create/button/?description=${text}&url=${url}`
    };
    window.open(links[platform], '_blank');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(result, 10, 10, { maxWidth: 180 });
    doc.save('content.pdf');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('history');
  };

  const handleSubscribe = () => {
    if (!email.includes('@')) return alert('Enter a valid email');
    setSubscribed(true);
    setEmail('');
    alert('Subscribed!');
  };

  const copyText = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>AI Content Generator</h1>

      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
      />

      <button onClick={handleVoice} style={{ marginTop: '10px' }}>🎤 Tap to Speak</button>

      <div style={{ marginTop: '1rem' }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {uploadedImage && (
          <img src={uploadedImage} alt="Upload Preview" style={{ maxWidth: '100%', marginTop: '1rem' }} />
        )}
      </div>

      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
        style={{ margin: '10px 0', padding: '8px', fontSize: '16px' }}
      >
        <option>Generate Image</option>
        <option>#ViralTag</option>
        <option>Keyword Generator</option>
        <option>Amazon Product Optimizer</option>
        <option>Product Comparison</option>
        <option>Product Description</option>
        <option>TikTok Hook</option>
        <option>YouTube Video Description</option>
        <option>YouTube Video Title</option>
        <option>YouTube Tags</option>
        <option>Blog Post</option>
        <option>Instagram Caption</option>
        <option>Facebook Post</option>
        <option>LinkedIn Post</option>
        <option>Reddit Post</option>
        <option>Tweet</option>
        <option>WhatsApp Message</option>
      </select>

      <button onClick={handleGenerate} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Generated Image:</h3>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <a href={imageUrl} download style={{ display: 'block', marginTop: '10px', color: '#0070f3' }}>Download Image</a>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Generated Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f1f1f1', padding: '1rem' }}>{result}</pre>

          <button onClick={copyText}>{copied ? 'Copied!' : 'Copy'}</button>
          <button onClick={downloadPDF} style={{ marginLeft: '10px' }}>Download PDF</button>

          <div style={{ marginTop: '10px' }}>
            <strong>Share:</strong>
            <button onClick={() => share('facebook')}>Facebook</button>
            <button onClick={() => share('twitter')}>Twitter</button>
            <button onClick={() => share('whatsapp')}>WhatsApp</button>
            <button onClick={() => share('linkedin')}>LinkedIn</button>
            <button onClick={() => share('reddit')}>Reddit</button>
            <button onClick={() => share('pinterest')}>Pinterest</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3>History</h3>
          <button onClick={clearHistory} style={{ marginBottom: '1rem' }}>Clear History</button>
          {history.map((entry, i) => (
            <div key={i} style={{ background: '#fafafa', padding: '1rem', marginBottom: '1rem' }}>
              <strong>{entry.contentType}</strong> | <em>{entry.date}</em>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              {entry.result.startsWith('http') ? (
                <img src={entry.result} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }} />
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{entry.result}</pre>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '4rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
        <h4>Subscribe for updates</h4>
        {subscribed ? <p>You're subscribed!</p> : (
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '8px', width: '250px' }}
            />
            <button onClick={handleSubscribe} style={{ marginLeft: '10px' }}>Subscribe</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Final index.tsx with full features — voice input, image upload/caption, PDF, sharing, dropdowns

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('#ViralTag');
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

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setPrompt(prev => prev + ' ' + speechResult);
    };
    recognition.onerror = (event: any) => console.error('Speech error:', event);
    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        setUploadedImage(base64);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

 const handleGenerate = async () => {
  if (!prompt.trim() && contentType !== 'Image Caption from Upload') return;
  setLoading(true);
  setResult('');
  setImageUrl('');

  try {
    // Image Caption from Upload
    if (uploadedImage && contentType === 'Image Caption from Upload') {
      const res = await fetch('/api/image-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedImage }) // FIXED: key changed from base64Image to image
      });

      const data = await res.json();
      setResult(data.result || 'No caption returned.');
      setHistory([{ prompt: 'Uploaded Image', contentType, result: data.result, date: new Date().toLocaleString() }, ...history]);
      setLoading(false);
      return;
    }

    // All other content types
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
      setResult(data.result || 'No result returned.');
      setHistory([{ prompt, contentType, result: data.result, date: new Date().toLocaleString() }, ...history]);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(result, 10, 10, { maxWidth: 180 });
    doc.save('result.pdf');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('history');
  };

  const share = (platform: string, content: string) => {
    const text = encodeURIComponent(content);
    const url = encodeURIComponent(window.location.href);
    const links: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&summary=${text}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
      pinterest: `https://pinterest.com/pin/create/button/?description=${text}&url=${url}`
    };
    window.open(links[platform], '_blank');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>AI Content Generator</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        style={{ width: '100%', minHeight: '100px', marginBottom: '1rem' }}
      />

      <button onClick={handleVoice} style={{ marginBottom: '1rem' }}>🎤 Tap to Speak</button>

      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '1rem' }} />

      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      >
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
        <option>Generate Image</option>
        <option>Image Caption from Upload</option>
      </select>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {(result || imageUrl) && (
        <div style={{ marginTop: '2rem' }}>
          {imageUrl && <img src={imageUrl} alt="Result" style={{ maxWidth: '100%' }} />}
          {result && <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '1rem' }}>{result}</pre>}

          <button onClick={handleDownloadPDF} style={{ marginRight: '10px' }}>Download PDF</button>

          <div style={{ marginTop: '10px' }}>
            <strong>Share:</strong>
            <button onClick={() => share('facebook', result)}>Facebook</button>
            <button onClick={() => share('twitter', result)}>Twitter</button>
            <button onClick={() => share('whatsapp', result)}>WhatsApp</button>
            <button onClick={() => share('linkedin', result)}>LinkedIn</button>
            <button onClick={() => share('reddit', result)}>Reddit</button>
            <button onClick={() => share('pinterest', result)}>Pinterest</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>History</h3>
          <button onClick={clearHistory}>Clear History</button>
          {history.map((entry, i) => (
            <div key={i} style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
              <strong>{entry.contentType}</strong> | <em>{entry.date}</em>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              {entry.result.startsWith('http') ? (
                <img src={entry.result} alt="Generated" style={{ maxWidth: '100%' }} />
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

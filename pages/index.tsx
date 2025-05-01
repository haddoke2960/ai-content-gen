// index.tsx — final upgrade: #ViralTag now generates smart topic-based hashtags like #SweetMango #PakistaniMango

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('#ViralTag');
  const [result, setResult] = useState('');
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      let finalResult = '';
      if (contentType === '#ViralTag') {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Generate 10 creative and viral social media hashtags based on the topic: ${prompt}`,
            contentType: 'Hashtag List'
          })
        });
        const data = await res.json();
        finalResult = data.result || 'No hashtags returned.';
      } else {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, contentType }),
        });
        const data = await res.json();
        if (data.result) {
          finalResult = data.result;
          const typesWithHashtags = [
            'Instagram Caption',
            'Facebook Post',
            'Tweet',
            'YouTube Tags',
            'YouTube Video Description'
          ];
          if (typesWithHashtags.includes(contentType)) {
            finalResult += '\n\n#viral #trending #foryou #reels';
          }
        }
      }
      setResult(finalResult);
      setHistory([{ prompt, contentType, result: finalResult, date: new Date().toLocaleString() }, ...history]);
    } catch (e) {
      alert('Generation failed.');
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
      pinterest: `https://pinterest.com/pin/create/button/?description=${text}&url=${url}`,
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
    if (!email.includes('@')) return alert('Enter valid email');
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

      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
        style={{ margin: '10px 0', padding: '8px', fontSize: '16px' }}
      >
        <option>#ViralTag</option>
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
              <pre style={{ whiteSpace: 'pre-wrap' }}>{entry.result}</pre>
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

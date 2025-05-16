import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';

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
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    const isiOSStandalone = isStandalone && /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isiOSStandalone);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem('boomline_date');
    const savedCount = parseInt(localStorage.getItem('boomline_usage') || '0');

    if (savedDate === today) {
      setUsageCount(savedCount);
      if (savedCount >= 5) setLimitReached(true);
    } else {
      localStorage.setItem('boomline_date', today);
      localStorage.setItem('boomline_usage', '0');
    }
  }, []);

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

    if (limitReached) return;

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
        setHistory(prev => [...prev, { type: contentType, prompt, imageUrl: data.imageUrl, timestamp: Date.now() }]);
      } else {
        setResult(data.result);
        setHistory(prev => [...prev, { type: contentType, prompt, result: data.result, timestamp: Date.now() }]);
      }

      const { error } = await supabase.from('generated_content').insert([
        {
          type: contentType,
          prompt,
          result: data.result,
          image_url: data.imageUrl || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) console.error('[Supabase] Save failed:', error);

      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('boomline_usage', newCount.toString());
      if (newCount >= 5) setLimitReached(true);
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
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };
return (
  <div style={{ backgroundColor: darkMode ? '#000' : '#fff', color: darkMode ? '#fff' : '#000', minHeight: '100vh' }}>
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}
      >
        Toggle Display Color
      </button>
    </div>

    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Create Viral Content with <span style={{ color: '#0070f3' }}>Boomline</span>
      </h1>
      <p style={{ fontSize: '1.1rem', color: darkMode ? '#ccc' : '#555', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Boomline helps creators and sellers generate hashtags, captions, product descriptions, and more — powered by AI.
      </p>
      <a
        href="#generate-section"
        style={{
          background: darkMode ? '#fff' : '#000',
          color: darkMode ? '#000' : '#fff',
          padding: '0.8rem 1.5rem',
          borderRadius: '6px',
          fontWeight: '600',
          textDecoration: 'none',
        }}
      >
        Try Boomline Free
      </a>
    </div>

    <div id="generate-section" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>AI Content Generator</h1>

      {!limitReached ? (
        <>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1.5rem' }}
          >
            <option value="#ViralTag">#ViralTag</option>
            <option value="Keyword Generator">Keyword Generator</option>
            <option value="Amazon Product Optimizer">Amazon Product Optimizer</option>
            <option value="Product Comparison">Product Comparison</option>
            <option value="Product Description">Product Description</option>
            <option value="TikTok Hook">TikTok Hook</option>
            <option value="YouTube Video Description">YouTube Video Description</option>
            <option value="YouTube Video Title">YouTube Video Title</option>
            <option value="YouTube Tags">YouTube Tags</option>
            <option value="Instagram Caption">Instagram Caption</option>
            <option value="Facebook Post">Facebook Post</option>
            <option value="LinkedIn Post">LinkedIn Post</option>
            <option value="Reddit Post">Reddit Post</option>
            <option value="Tweet">Tweet</option>
            <option value="Blog Post">Blog Post</option>
            <option value="Generate Image">Generate Image</option>
          </select>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Enter your ${contentType.toLowerCase()} prompt...`}
            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', minHeight: '100px' }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '0.8rem 1.5rem',
              background: loading ? '#ccc' : '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            {5 - usageCount} free generations left today
          </p>
        </>
      ) : (
        <>
          <p style={{ color: 'red', fontWeight: 'bold' }}>You’ve reached your daily limit of 5.</p>
          {!isIOS && (
            <a
              href="https://buy.stripe.com/9AQ29m3aLcey6VabIP"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#635bff',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                marginTop: '16px',
              }}
            >
              Upgrade to Boomline Pro
            </a>
          )}
        </>
      )}

      {error && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {(result || imageUrl) && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Result:</h3>
          {imageUrl ? (
            <img src={imageUrl} alt="Generated content" style={{ maxWidth: '100%', margin: '1rem 0' }} />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleDownloadPDF}>Download PDF</button>
            <button onClick={() => speakText(result)}>🔊 Listen</button>
            <button onClick={() => shareTo('facebook')}>Share to Facebook</button>
            <button onClick={() => shareTo('twitter')}>Share to Twitter</button>
            <button onClick={() => shareTo('linkedin')}>Share to LinkedIn</button>
            <button onClick={() => shareTo('whatsapp')}>Share to WhatsApp</button>
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
                borderRadius: '4px',
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
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{entry.type}</strong>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Prompt:</strong> {entry.prompt}
              </p>
              {entry.imageUrl ? (
                <img src={entry.imageUrl} alt="Generated content" style={{ maxWidth: '200px' }} />
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{entry.result}</pre>
                      )}
      </div>
    </div>
  );
}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
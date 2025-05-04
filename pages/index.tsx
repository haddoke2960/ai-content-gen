import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

type HistoryEntry = {
  prompt: string;
  contentType: string;
  result?: string;
  imageUrl?: string;
};

const IndexPage = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (uploadedImage && contentType === 'Image Caption from Upload') {
      handleGenerate();
    }
  }, [uploadedImage]);

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) return;

    setLoading(true);
    setResult('');
    setImageUrl('');

    try {
      let res: Response;
      let data: { result?: string; image?: string };

      if (uploadedImage && contentType.includes('Image')) {
        const base64 = uploadedImage.split(',')[1];
        res = await fetch('/api/image-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64 }),
        });
        data = await res.json();

        if (!data.result) {
          throw new Error('Image analysis failed');
        }

        setResult(data.result);
        setHistory(prev => [...prev, { prompt, contentType, result: data.result }]);
        return;
      }

      res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType }),
      });
      data = await res.json();

      if (!data.result) {
        throw new Error('No result from generation');
      }

      setResult(data.result);
      setHistory(prev => [...prev, { prompt, contentType, result: data.result }]);
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
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
const share = async (_platform: string, content: string) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Generated Content',
        text: content,
        url: window.location.href,
      });
    } else {
      alert('Sharing not supported on this device. Please copy and paste manually.');
    }
  } catch (err) {
    alert('Sharing failed.');
  }
};
  
  return (
    <div style={{ padding: '2rem' }}>
      <select onChange={(e) => setContentType(e.target.value)}>
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

      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      {contentType === 'Image Caption from Upload' && (
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      )}

      <button onClick={handleGenerate}>{loading ? 'Generating...' : 'Generate'}</button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
          <button onClick={handleDownloadPDF}>Download PDF</button>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <strong>Share:</strong>
        <button onClick={() => share('Facebook', result)}>Facebook</button>
        <button onClick={() => share('Twitter', result)}>Twitter</button>
        <button onClick={() => share('LinkedIn', result)}>LinkedIn</button>
        <button onClick={() => share('WhatsApp', result)}>WhatsApp</button>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>History</h3>
          <button onClick={clearHistory}>Clear History</button>
          {history.map((entry, i) => (
            <div key={i} style={{ marginTop: '1rem' }}>
              <strong>{entry.contentType}</strong>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              {entry.imageUrl ? (
                <img src={entry.imageUrl} alt="Result" style={{ maxWidth: '100%' }} />
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{entry.result}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndexPage;

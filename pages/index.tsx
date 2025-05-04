import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

import ImageUpload from '../components/ImageUpload';

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
      let data: { result?: string; imageUrl?: string; caption?: string };

      if (uploadedImage && contentType.includes('Image')) {
        const formData = new FormData();
        formData.append('file', dataURLtoBlob(uploadedImage), 'upload.jpg');

        res = await fetch('/api/image-analyze', {
          method: 'POST',
          body: formData,
        });

        data = await res.json();

        if (!data.caption) {
          throw new Error('Image analysis failed');
        }

        setResult(data.caption);
        setHistory(prev => [...prev, { prompt, contentType, result: data.caption }]);
        return;
      }

      res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType }),
      });
      data = await res.json();

      if (!data.result && !data.imageUrl) {
        throw new Error('No result from generation');
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setHistory(prev => [...prev, { prompt, contentType, imageUrl: data.imageUrl }]);
      } else {
        setResult(data.result!);
        setHistory(prev => [...prev, { prompt, contentType, result: data.result }]);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
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
      <h1>AI Content Generator</h1>

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

      {/* Optional extra UI component */}
      <ImageUpload />

      {(result || imageUrl) && (
        <div style={{ marginTop: '2rem' }}>
          {imageUrl && <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />}
          {result && <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>}
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

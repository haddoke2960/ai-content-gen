import React, { useState } from 'react';
import jsPDF from 'jspdf';

const IndexPage = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [voiceFile, setVoiceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState([]);
import React, { useState } from 'react';
import jsPDF from 'jspdf';

type HistoryEntry = {
  prompt: string;
  contentType: string;
  result: string;
};

const IndexPage = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() && contentType !== 'Image Caption from Upload' && contentType !== 'Voice Prompt') return;

    setLoading(true);
    setResult('');
    setImageUrl('');

    try {
      if (uploadedImage && contentType === 'Image Caption from Upload') {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: uploadedImage }),
        });
        const data = await res.json();
        setImageUrl(data.image);
        setHistory(prev => [
          ...prev,
          { prompt: 'Uploaded Image', contentType, result: data.image },
        ]);
        setLoading(false);
        return;
      }

      if (voiceFile && contentType === 'Voice Prompt') {
        const formData = new FormData();
        formData.append('file', voiceFile);
        const res = await fetch('/api/voice', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        const voiceText = data.text || 'No voice detected';
        setResult(voiceText);
        setHistory(prev => [
          ...prev,
          { prompt: 'Voice Input', contentType, result: voiceText },
        ]);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType }),
      });
      const data = await res.json();

      if (data.image) {
        setImageUrl(data.image);
        setHistory(prev => [
          ...prev,
          { prompt, contentType, result: data.image },
        ]);
      } else {
        setResult(data.result || 'No result returned');
        setHistory(prev => [
          ...prev,
          { prompt, contentType, result: data.result || 'No result returned' },
        ]);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceFile(e.target.files?.[0] || null);
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
    alert(`Share to ${platform}: ${content}`);
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
        <option>Voice Prompt</option>
      </select>

      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      {contentType === 'Image Caption from Upload' && (
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      )}

      {contentType === 'Voice Prompt' && (
        <input type="file" accept="audio/*" onChange={handleVoiceUpload} />
      )}

      <button onClick={handleGenerate}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {(result || imageUrl) && (
        <div style={{ marginTop: '2rem' }}>
          {imageUrl && <img src={imageUrl} alt="Generated" />}
          {result && <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>}
          <button onClick={handleDownloadPDF}>Download as PDF</button>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <strong>Share:</strong>
        <button onClick={() => share('Facebook', result)}>Facebook</button>
        <button onClick={() => share('Instagram', result)}>Instagram</button>
        <button onClick={() => share('Twitter', result)}>Twitter</button>
        <button onClick={() => share('WhatsApp', result)}>WhatsApp</button>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>History</h3>
          <button onClick={clearHistory}>Clear History</button>
          {history.map((entry, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>{entry.contentType}</strong>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              {entry.result?.startsWith('http') ? (
                <img src={entry.result} alt="Result" />
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
  const handleGenerate = async () => {
    if (!prompt.trim() && contentType !== 'Image Caption from Upload' && contentType !== 'Voice Prompt') return;

    setLoading(true);
    setResult('');
    setImageUrl('');

    try {
      if (uploadedImage && contentType === 'Image Caption from Upload') {
        const res = await fetch('/api/image-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: uploadedImage }),
        });

        const data = await res.json();
        setResult(data.result || 'No caption returned.');
        setHistory(prev => [
          ...prev,
          { prompt: 'Uploaded Image', contentType, result: data.result || '' }
        ]);
        setLoading(false);
        return;
      }

      if (voiceFile && contentType === 'Voice Prompt') {
        const formData = new FormData();
        formData.append('file', voiceFile);

        const res = await fetch('/api/voice-to-text', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        const voiceText = data.text || 'Voice transcription failed.';
        setResult(voiceText);
        setHistory(prev => [
          ...prev,
          { prompt: 'Voice Input', contentType, result: voiceText }
        ]);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType }),
      });

      const data = await res.json();

      if (data.image) {
        setImageUrl(data.image);
        setHistory(prev => [
          ...prev,
          { prompt, contentType, result: data.image }
        ]);
      } else {
        setResult(data.result || 'No result generated.');
        setHistory(prev => [
          ...prev,
          { prompt, contentType, result: data.result || '' }
        ]);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceUpload = (e) => {
    setVoiceFile(e.target.files[0]);
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

  const share = (platform, content) => {
    alert(`Share to ${platform}: ${content}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <select onChange={(e) => setContentType(e.target.value)} value={contentType}>
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
        <option>Voice Prompt</option>
      </select>

      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter your prompt..." style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }} />

      {contentType === 'Image Caption from Upload' && (
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: '1rem' }} />
      )}

      {contentType === 'Voice Prompt' && (
        <input type="file" accept="audio/*" onChange={handleVoiceUpload} style={{ marginTop: '1rem' }} />
      )}

      <button onClick={handleGenerate} style={{ marginTop: '1rem' }}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

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
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>{entry.contentType}</strong>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              {entry.result?.startsWith('data:image') ? (
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
};

// Backend handler (add to /pages/api/voice-to-text.ts)
// This uses OpenAI Whisper API or similar service to transcribe audio
// Make sure you install and configure necessary libraries for file parsing and OpenAI

// If using Next.js API routes, this part goes in a separate file

// In index.tsx, we just export the component
export default IndexPage;

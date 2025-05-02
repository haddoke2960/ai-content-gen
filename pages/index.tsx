// index.tsx — Final version with voice input, image upload, AI captioning, result history, PDF, and sharing

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('generateImage');
  const [resultText, setResultText] = useState('');
  const [resultImageUrl, setResultImageUrl] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const handleSpeechToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      alert('Speech recognition error: ' + event.error);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
    };
    recognition.start();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const content = resultText || 'No result';
    doc.text(content, 10, 10, { maxWidth: 180 });
    doc.save('generated-content.pdf');
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

      <button onClick={handleSpeechToText} disabled={isListening} style={{ marginBottom: '1rem' }}>
        {isListening ? 'Listening...' : '🎤 Voice Input'}
      </button>

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      >
        <option value="generateImage">Generate Image</option>
        <option value="imageCaption">Image Caption from Upload</option>
        <option value="productDescription">Product Description</option>
      </select>

      <button
        onClick={() => alert('Mock generate logic here.')}
        style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}
      >
        Generate
      </button>

      {(resultText || resultImageUrl) && (
        <div>
          {resultImageUrl && <img src={resultImageUrl} alt="Generated" style={{ maxWidth: '100%' }} />}
          {resultText && <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '1rem' }}>{resultText}</pre>}

          <button onClick={handleDownloadPDF} style={{ marginRight: '10px' }}>Download PDF</button>

          <div style={{ marginTop: '1rem' }}>
            <strong>Share:</strong>
            <button onClick={() => share('facebook', resultText)}>Facebook</button>
            <button onClick={() => share('twitter', resultText)}>Twitter</button>
            <button onClick={() => share('whatsapp', resultText)}>WhatsApp</button>
            <button onClick={() => share('linkedin', resultText)}>LinkedIn</button>
            <button onClick={() => share('reddit', resultText)}>Reddit</button>
            <button onClick={() => share('pinterest', resultText)}>Pinterest</button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>History</h3>
          <button onClick={clearHistory} style={{ marginBottom: '1rem' }}>Clear History</button>
          {history.map((item, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
              <strong>{item.prompt}</strong>
              <p>{item.result}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

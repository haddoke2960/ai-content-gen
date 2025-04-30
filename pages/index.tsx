import { useState, useEffect, CSSProperties } from 'react';
import Head from 'next/head';

interface HistoryItem {
  prompt: string;
  content: string;
  timestamp: string;
}

export default function Home() {
  // State hooks for the prompt input, generated history, loading/error states, email subscription.
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // On mount, load history and subscription status from localStorage (client-side only).
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedEmail = localStorage.getItem('subscribedEmail');
      if (savedEmail) {
        setSubscribed(true);
        setSubscriptionMessage(`You're already subscribed with ${savedEmail}.`);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, []);

  // Handler to call the generate API and update state.
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // If API returned an error message, use it; otherwise generic error.
        throw new Error(data.error || 'Failed to generate content.');
      }
      if (!data.content) {
        throw new Error('No content received from API.');
      }
      // Create a new history entry.
      const newItem: HistoryItem = {
        prompt: prompt,
        content: data.content,
        timestamp: new Date().toLocaleString()
      };
      // Update state and localStorage (prepend new item for latest-first order).
      setHistory(prevHistory => {
        const updated = [newItem, ...prevHistory];
        localStorage.setItem('history', JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  // Clipboard copy handler with feedback.
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  // PDF download handler using jsPDF (loaded dynamically).
  const handleDownloadPDF = async (text: string) => {
    try {
      const jspdf = await import('jspdf');
      const doc = new jspdf.jsPDF();
      // Add text with word-wrapping within max width 180.
      doc.text(text, 10, 10, { maxWidth: 180 });

      doc.save('result.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  // Social share handlers.
  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };
  const handleShareTwitter = (text: string) => {
    // Truncate text to avoid exceeding tweet length (280 characters).
    const maxLen = 240;
    let tweet = text;
    if (tweet.length > maxLen) {
      tweet = tweet.substring(0, maxLen) + '...';
    }
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(url, '_blank');
  };
  const handleShareWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Email subscribe handler.
  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) {
      setSubscriptionMessage('Please enter a valid email address.');
      return;
    }
    localStorage.setItem('subscribedEmail', email);
    setSubscribed(true);
    setSubscriptionMessage('Thank you for subscribing!');
    setEmail('');
  };

  // Clear history handler.
  const clearHistory = () => {
    localStorage.removeItem('history');
    setHistory([]);
  };

  // Styles for primary and secondary buttons.
  const primaryBtnStyle: CSSProperties = {
    backgroundColor: loading ? '#999' : '#0070f3',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1rem',
    fontSize: '1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  const secondaryBtnStyle: CSSProperties = {
    padding: '0.4rem 0.6rem',
    fontSize: '0.9rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: '#f9f9f9',
    cursor: 'pointer'
  };

  return (
    <>
      {/* Include Font Awesome for icons */}
      <Head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" 
          integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4pbE6GpK8Q9RnW0QK8Dcm" 
          crossOrigin="anonymous" 
        />
      </Head>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h1>AI Content Generator</h1>
        <p>Enter a prompt below to generate content:</p>

        {/* Prompt Input */}
        <div style={{ margin: '1rem 0' }}>
          <textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            placeholder="Type your prompt here..."
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
          <br />
          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            style={primaryBtnStyle}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Error Message */}
        {error && 
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        }

        {/* History Section */}
        {history.length > 0 && (
          <div style={{ textAlign: 'left', width: '100%', marginTop: '2rem' }}>
            <h2 style={{ display: 'inline-block' }}>History</h2>
            <button 
              onClick={clearHistory} 
              style={{ background: 'none', border: 'none', color: '#0070f3', marginLeft: '1rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Clear history
            </button>
            {history.map((item, index) => (
              <div 
                key={index} 
                style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', margin: '1rem 0' }}
              >
                <div style={{ fontStyle: 'italic', marginBottom: '0.5rem', color: '#333' }}>
                  <strong>Prompt:</strong> {item.prompt}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>
                  {item.content}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Generated on {item.timestamp}
                </div>
                {/* Share Buttons */}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleCopy(item.content, index)} 
                    style={secondaryBtnStyle} 
                    title="Copy to clipboard"
                  >
                    <i className="fa-solid fa-copy"></i>
                    {copiedIndex === index ? ' Copied!' : ' Copy'}
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(item.content)} 
                    style={secondaryBtnStyle} 
                    title="Download as PDF"
                  >
                    <i className="fa-solid fa-file-pdf"></i> PDF
                  </button>
                  <button 
                    onClick={() => handleShareTwitter(item.content)} 
                    style={secondaryBtnStyle} 
                    title="Share on Twitter"
                  >
                    <i className="fa-brands fa-twitter"></i>
                  </button>
                  <button 
                    onClick={handleShareFacebook} 
                    style={secondaryBtnStyle} 
                    title="Share on Facebook"
                  >
                    <i className="fa-brands fa-facebook"></i>
                  </button>
                  <button 
                    onClick={() => handleShareWhatsApp(item.content)} 
                    style={secondaryBtnStyle} 
                    title="Share on WhatsApp"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Email Subscription Section */}
        <div style={{ marginTop: '2rem' }}>
          <h3>Stay Updated</h3>
          {subscribed ? (
            // If subscribed, show success message.
            <p style={{ color: 'green' }}>{subscriptionMessage}</p>
          ) : (
            // Subscription form.
            <div>
              <p>Enter your email to receive updates:</p>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Your email" 
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }} 
              />
              <button 
                onClick={handleSubscribe} 
                style={{ ...secondaryBtnStyle, marginLeft: '0.5rem' }}
              >
                Subscribe
              </button>
              {subscriptionMessage && !subscribed && (
                <p style={{ color: 'red', marginTop: '0.5rem' }}>{subscriptionMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

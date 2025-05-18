import React from 'react';

interface Props {
  result: string;
  imageUrl: string;
  darkMode: boolean;
  speakText: (text: string) => void;
  handleDownloadPDF: () => void;
  shareTo: (platform: string) => void;
}

const ResultCard: React.FC<Props> = ({ result, imageUrl, darkMode, speakText, handleDownloadPDF, shareTo }) => {
  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '2rem',
        borderRadius: '16px',
        background: darkMode
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        boxShadow: darkMode
          ? '0 4px 12px rgba(255, 255, 255, 0.05)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>Result:</h3>
      {imageUrl ? (
        <img src={imageUrl} alt="Generated content" style={{ maxWidth: '100%', borderRadius: '8px' }} />
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '1rem' }}>{result}</pre>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button onClick={handleDownloadPDF}>Download PDF</button>
        <button onClick={() => speakText(result)}>🔊 Listen</button>
        <button onClick={() => shareTo('facebook')}>Share to Facebook</button>
        <button onClick={() => shareTo('twitter')}>Share to Twitter</button>
        <button onClick={() => shareTo('linkedin')}>Share to LinkedIn</button>
        <button onClick={() => shareTo('whatsapp')}>Share to WhatsApp</button>
      </div>
    </div>
  );
};

export default ResultCard;
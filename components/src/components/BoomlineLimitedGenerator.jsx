import React, { useEffect, useState } from 'react';

const BoomlineLimitedGenerator = () => {
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isApple = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isApple);

    // Daily reset logic
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

  const handleGenerate = () => {
    if (limitReached) return;

    // Your real AI generation logic goes here
    console.log("AI caption generated");

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('boomline_usage', newCount.toString());

    if (newCount >= 5) setLimitReached(true);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>AI Caption Generator</h2>

      {!limitReached ? (
        <>
          <button
            onClick={handleGenerate}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Generate Caption
          </button>
          <p style={{ marginTop: '12px' }}>{5 - usageCount} free generations left today</p>
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
                marginTop: '16px'
              }}
            >
              Upgrade to Boomline Pro
            </a>
          )}
        </>
      )}
    </div>
  );
};

export default BoomlineLimitedGenerator;
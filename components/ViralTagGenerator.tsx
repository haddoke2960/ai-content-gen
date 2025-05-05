import React, { useState } from 'react';

const ViralTagGenerator = () => {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const generateTags = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 10 viral hashtags for: ${input}`,
        }),
      });

      const data = await response.json();
      setTags(data.result || 'No tags returned.');
    } catch (error) {
      console.error('Error:', error);
      setTags('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">AI Viral Tag Generator</h2>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={3}
        placeholder="Describe your post (e.g., AI tools, fashion tips)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={generateTags}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Tags'}
      </button>
      {tags && (
        <div className="mt-4 bg-gray-100 p-2 rounded text-sm whitespace-pre-line">
          <strong>Generated Tags:</strong><br />
          {tags}
        </div>
      )}
    </div>
  );
};

export default ViralTagGenerator;
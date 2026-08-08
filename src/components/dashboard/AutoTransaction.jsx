import { useState, useRef } from 'react';

const AutoTransaction = ({ onSaved }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState(null); // { name, category, amount, date, rawDate }
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const API_BASE = 'http://fintrack-seven-rho.vercel.app/'; // matches your PORT fallback

  // adjust this if you store the JWT somewhere other than localStorage
  const getToken = () => sessionStorage.getItem('fintrack_token');

  const handleFileSelect = (e) => { 
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setParsed(null);
    setError('');
    setImagePreview(URL.createObjectURL(selected));
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to scan a receipt');
      }

      const formData = new FormData();
      formData.append('receipt', file);

      const res = await fetch(`${API_BASE}/api/transactions/auto/scan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // do NOT set Content-Type here — fetch sets the correct
          // multipart boundary automatically for FormData
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan receipt');
      }

      setParsed(data.parsed);
    } catch (err) {
      setError(err.message || 'Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setParsed(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmSave = async () => {
    if (!parsed) return;
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to save a transaction');
      }

      const res = await fetch(`${API_BASE}/api/transactions/auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save transaction');
      }

      onSaved?.(data.transaction);
      // reset — the photo was only ever held in memory, discarded now
      setFile(null);
      setImagePreview(null);
      setParsed(null);
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setFile(null);
    setImagePreview(null);
    setParsed(null);
    setError('');
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 max-w-md">
      <h3 className="font-semibold text-lg">Scan Receipt</h3>

      {!imagePreview && (
        <div className="flex gap-3">
          {/* capture="environment" opens the camera directly on mobile */}
          <label className="flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
            📷 Take Photo
          </label>
          <label className="flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            🖼️ Upload
          </label>
        </div>
      )}

      {imagePreview && (
        <div className="space-y-3">
          <img src={imagePreview} alt="Receipt preview" className="w-full max-h-64 object-contain rounded-lg border" />

          {!parsed && (
            <div className="flex gap-2">
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50"
              >
                {scanning ? 'Reading receipt…' : 'Scan Receipt'}
              </button>
              <button onClick={reset} className="px-4 border rounded-lg">Cancel</button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {parsed && (
        <div className="space-y-3 border-t pt-3">
          <p className="text-sm text-gray-500">Review and edit before saving:</p>

          <div>
            <label className="text-xs text-gray-500">Merchant</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={parsed.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Category</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={parsed.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2"
              value={parsed.amount ?? ''}
              onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Date</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={parsed.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirmSave}
              disabled={saving || !parsed.amount}
              className="flex-1 bg-green-600 text-white rounded-lg py-2 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Confirm & Save'}
            </button>
            <button onClick={reset} className="px-4 border rounded-lg">Discard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoTransaction;
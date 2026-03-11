import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import ImageUpload from './components/ImageUpload';
import ObjectDetection from './components/ObjectDetection';
import Results from './components/Results';
import FaceDetection from './components/FaceDetection';
import TextExtraction from './components/TextExtraction';
import BatchProcessor from './components/BatchProcessor';
import { useTensorflow } from './hooks/useTensorflow';

const API_BASE = '/api';
const TABS = ['Detect', 'Batch', 'History'];

export default function App() {
  const [activeTab, setActiveTab] = useState('Detect');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const imgDetectRef = useRef(null);
  const { modelStatus, detectObjects, initModel } = useTensorflow();

  // Load history and stats on mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/images`);
      setHistory(res.data);
    } catch {
      // backend offline — silent fail
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/images/stats`);
      setStats(res.data);
    } catch {
      // backend offline
    }
  };

  const handleFileSelected = useCallback(
    async (file) => {
      setError(null);
      setDetections([]);
      setUploadedImage(null);
      setProcessingTime(null);

      const localUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(localUrl);

      // Load image to get natural dimensions
      const img = new Image();
      img.src = localUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });

      setIsProcessing(true);
      const t0 = performance.now();

      try {
        // 1. Ensure model is ready
        await initModel();

        // 2. Run object detection in browser
        imgDetectRef.current = img;
        const preds = await detectObjects(img);
        const elapsed = Math.round(performance.now() - t0);
        setDetections(preds);
        setProcessingTime(elapsed);

        // 3. Upload to backend (best-effort)
        try {
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await axios.post(`${API_BASE}/images/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const uploaded = uploadRes.data.image;
          setUploadedImage(uploaded);

          // 4. Save detections to backend
          if (preds.length > 0) {
            await axios.post(`${API_BASE}/images/${uploaded.id}/detections`, {
              detections: preds,
            });
          }

          // 5. Refresh history and stats
          fetchHistory();
          fetchStats();
        } catch (backendErr) {
          console.warn('Backend unavailable, results only shown in browser:', backendErr.message);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Detection failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [initModel, detectObjects]
  );

  const handleHistoryItemClick = async (img) => {
    try {
      const res = await axios.get(`${API_BASE}/images/${img.id}`);
      const data = res.data;
      setPreviewUrl(data.url);
      setUploadedImage(data);
      setDetections(data.detections || []);
      setActiveTab('Detect');
    } catch {
      setError('Could not load image details');
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(`${API_BASE}/images/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (uploadedImage?.id === id) {
        setUploadedImage(null);
        setDetections([]);
        setPreviewUrl(null);
      }
      fetchStats();
    } catch {
      setError('Could not delete image');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar modelStatus={modelStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            AI Image{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              Recognition
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Real-time object detection powered by TensorFlow.js COCO-SSD, running entirely in your browser.
          </p>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard icon="🖼️" label="Images" value={stats.totalImages} />
            <StatCard icon="🔍" label="Detections" value={stats.totalDetections} />
            <StatCard
              icon="🏆"
              label="Top Class"
              value={stats.topClasses?.[0]?.class_name || '—'}
              small
            />
            <StatCard
              icon="📊"
              label="Classes"
              value={stats.topClasses?.length || 0}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121a] border border-[#2e2e47] rounded-xl p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                  : 'text-gray-400 hover:text-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-950/40 border border-red-800 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-300">✕</button>
          </div>
        )}

        {/* Tab: Detect */}
        {activeTab === 'Detect' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left col */}
            <div className="space-y-5">
              <div className="card">
                <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 text-violet-400 inline-flex items-center justify-center">📤</span>
                  Upload Image
                </h3>
                <ImageUpload onFileSelected={handleFileSelected} isProcessing={isProcessing} />
              </div>

              {/* Canvas preview with bounding boxes */}
              {previewUrl && (
                <div className="card">
                  <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <span>🖼️</span>
                    {isProcessing ? (
                      <span className="text-amber-400 animate-pulse">Analysing…</span>
                    ) : (
                      <span>Detection Preview</span>
                    )}
                    {naturalSize.width > 0 && (
                      <span className="ml-auto text-xs text-gray-600 font-normal">
                        {naturalSize.width}×{naturalSize.height}
                      </span>
                    )}
                  </h3>
                  <ObjectDetection
                    imageUrl={previewUrl}
                    detections={detections}
                    naturalWidth={naturalSize.width}
                    naturalHeight={naturalSize.height}
                  />
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-5">
              {/* Model status card */}
              <ModelStatusCard status={modelStatus} onLoad={initModel} />

              {/* Detection results */}
              <Results detections={detections} processingTime={processingTime} />

              {/* Person/Face detections */}
              {detections.length > 0 && <FaceDetection detections={detections} />}

              {/* OCR stub */}
              <TextExtraction />
            </div>
          </div>
        )}

        {/* Tab: Batch */}
        {activeTab === 'Batch' && (
          <div className="max-w-2xl">
            <BatchProcessor onBatchComplete={() => { fetchHistory(); fetchStats(); }} />
          </div>
        )}

        {/* Tab: History */}
        {activeTab === 'History' && (
          <HistoryTab
            history={history}
            onSelect={handleHistoryItemClick}
            onDelete={handleDeleteImage}
          />
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, small }) {
  return (
    <div className="card flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className={`font-bold text-white leading-none ${small ? 'text-base truncate max-w-[80px]' : 'text-2xl'}`}>
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ModelStatusCard({ status, onLoad }) {
  const config = {
    idle: {
      bg: 'bg-[#1a1a27]',
      border: 'border-[#2e2e47]',
      icon: '🧠',
      title: 'Model not loaded',
      desc: 'Click below to load the COCO-SSD model into your browser.',
      action: true,
    },
    loading: {
      bg: 'bg-amber-950/20',
      border: 'border-amber-800/40',
      icon: null,
      title: 'Loading TensorFlow.js…',
      desc: 'Downloading COCO-SSD model weights (~10MB). Please wait.',
      action: false,
    },
    ready: {
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-800/40',
      icon: '✅',
      title: 'COCO-SSD model ready',
      desc: 'TensorFlow.js is running in your browser. Upload an image to detect objects.',
      action: false,
    },
    error: {
      bg: 'bg-red-950/20',
      border: 'border-red-800/40',
      icon: '❌',
      title: 'Model failed to load',
      desc: 'Check your internet connection and try again.',
      action: true,
    },
  };

  const c = config[status] || config.idle;

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
      <div className="flex items-start gap-3">
        {status === 'loading' ? (
          <div className="w-8 h-8 border-4 border-amber-600/30 border-t-amber-400 rounded-full animate-spin flex-shrink-0 mt-0.5" />
        ) : (
          <span className="text-xl">{c.icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-200 text-sm">{c.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
        </div>
      </div>
      {c.action && (
        <button
          onClick={onLoad}
          className="mt-3 w-full btn-primary text-sm py-2"
        >
          Load Model
        </button>
      )}
    </div>
  );
}

function HistoryTab({ history, onSelect, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="card text-center py-16 max-w-md mx-auto">
        <p className="text-5xl mb-4">🗂️</p>
        <p className="text-gray-400 font-medium">No history yet</p>
        <p className="text-gray-600 text-sm mt-1">Upload and analyse images to see them here.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{history.length} image{history.length !== 1 ? 's' : ''} analysed</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {history.map((img) => (
          <div
            key={img.id}
            className="card p-0 overflow-hidden group cursor-pointer hover:border-violet-600 
                       transition-all duration-200 animate-fade-in"
          >
            <div className="relative aspect-square" onClick={() => onSelect(img)}>
              <img
                src={img.url}
                alt={img.original_filename}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 
                              flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-400 truncate">{img.original_filename}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-600">
                  {new Date(img.upload_date).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

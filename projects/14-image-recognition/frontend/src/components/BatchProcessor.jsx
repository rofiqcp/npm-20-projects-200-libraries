import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTensorflow } from '../hooks/useTensorflow';

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export default function BatchProcessor({ onBatchComplete }) {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const { detectObjects, initModel, modelStatus } = useTensorflow();
  const abortRef = useRef(false);

  const onDrop = useCallback((accepted) => {
    const items = accepted.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: 'queued',
      detections: null,
      error: null,
    }));
    setFiles((prev) => [...prev, ...items]);
    setResults([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    disabled: processing,
  });

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResults([]);
    setProgress(0);
  };

  const runBatch = async () => {
    if (!files.length) return;
    abortRef.current = false;
    setProcessing(true);
    setProgress(0);

    await initModel();

    const batchResults = [];
    for (let i = 0; i < files.length; i++) {
      if (abortRef.current) break;

      const item = files[i];
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'processing' } : f))
      );

      try {
        const img = new Image();
        img.src = item.preview;
        await new Promise((res) => { img.onload = res; });

        const detections = await detectObjects(img);
        batchResults.push({ filename: item.file.name, detections, status: 'done' });
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done', detections } : f))
        );
      } catch {
        batchResults.push({ filename: item.file.name, detections: [], status: 'error' });
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'error', error: 'Failed' } : f))
        );
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setResults(batchResults);
    setProcessing(false);
    if (onBatchComplete) onBatchComplete(batchResults);
  };

  const totalDetections = results.reduce((s, r) => s + r.detections.length, 0);

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Batch Processor
        </h3>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-[#2e2e47] hover:border-cyan-600 hover:bg-cyan-950/10'}
            ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-400">
            {isDragActive ? 'Drop images here' : 'Drop multiple images or click to browse'}
          </p>
          <p className="text-xs text-gray-600 mt-1">JPEG, PNG, WebP</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#1a1a27] rounded-lg px-3 py-2">
                <img src={f.preview} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span className="text-xs text-gray-300 truncate flex-1">{f.file.name}</span>
                <StatusBadge status={f.status} count={f.detections?.length} />
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {processing && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Processing…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[#1a1a27] rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={runBatch}
            disabled={processing || files.length === 0 || modelStatus === 'loading'}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
          >
            {processing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
            ) : modelStatus === 'loading' ? (
              'Loading model…'
            ) : (
              <>Analyse {files.length} image{files.length !== 1 ? 's' : ''}</>
            )}
          </button>
          {files.length > 0 && !processing && (
            <button onClick={clearAll} className="btn-secondary text-sm px-4">Clear</button>
          )}
        </div>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Batch Summary — {totalDetections} total detections across {results.length} images
          </h4>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-[#1a1a27] rounded-lg px-3 py-2">
                <span className="text-gray-400 truncate">{r.filename}</span>
                <span className={`font-medium ml-2 flex-shrink-0 ${r.status === 'done' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.status === 'done' ? `${r.detections.length} detected` : 'Error'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, count }) {
  if (status === 'queued') return <span className="text-xs text-gray-500">Queued</span>;
  if (status === 'processing') return (
    <span className="w-3.5 h-3.5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
  );
  if (status === 'done') return (
    <span className="text-xs text-emerald-400 font-medium">{count} found</span>
  );
  if (status === 'error') return <span className="text-xs text-red-400">Error</span>;
  return null;
}

// TextExtraction.jsx — OCR placeholder
// Full OCR would use Tesseract.js; shown here as a UI stub
export default function TextExtraction() {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Text Extraction (OCR)
      </h3>

      <div className="bg-[#1a1a27] rounded-xl p-4 text-center">
        <div className="w-12 h-12 mx-auto bg-amber-900/30 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm font-medium">Tesseract.js OCR</p>
        <p className="text-gray-600 text-xs mt-1">
          Add <code className="bg-[#12121a] px-1 rounded text-amber-400">tesseract.js</code> to enable
          in-browser text extraction. This feature is a UI placeholder.
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-[#2e2e47] space-y-1">
        <p className="text-xs text-gray-600">
          📦 Install: <code className="text-amber-400">npm install tesseract.js</code>
        </p>
        <p className="text-xs text-gray-600">
          🌐 Supports 100+ languages with LSTM models.
        </p>
      </div>
    </div>
  );
}

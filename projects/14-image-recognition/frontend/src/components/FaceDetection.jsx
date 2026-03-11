// FaceDetection.jsx — placeholder (COCO-SSD detects "person" class;
// full face detection would require MediaPipe or face-api.js)
export default function FaceDetection({ detections }) {
  const faceDetections = detections?.filter(
    (d) => d.class_name === 'person' || d.class_name === 'face'
  ) || [];

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Person / Face Detection
      </h3>

      {faceDetections.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No persons detected.</p>
          <p className="text-gray-600 text-xs mt-1">
            COCO-SSD detects "person" as a whole-body class.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {faceDetections.map((det, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1a1a27] rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-900/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200 capitalize">{det.class_name}</p>
                  <p className="text-xs text-gray-500">
                    {det.bbox ? `${det.bbox.width}×${det.bbox.height}px` : 'No bbox'}
                  </p>
                </div>
              </div>
              <span className="text-pink-400 font-bold text-sm">
                {Math.round(det.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-[#2e2e47]">
        <p className="text-xs text-gray-600">
          💡 Full face mesh detection available with MediaPipe (requires additional setup).
        </p>
      </div>
    </div>
  );
}

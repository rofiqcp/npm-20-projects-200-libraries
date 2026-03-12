const CLASS_COLORS = [
  'bg-violet-600', 'bg-blue-600', 'bg-cyan-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-red-600', 'bg-pink-600', 'bg-purple-600',
  'bg-teal-600', 'bg-orange-600',
];

const TEXT_COLORS = [
  'text-violet-400', 'text-blue-400', 'text-cyan-400', 'text-emerald-400',
  'text-amber-400', 'text-red-400', 'text-pink-400', 'text-purple-400',
  'text-teal-400', 'text-orange-400',
];

function getColorIndex(className) {
  let hash = 0;
  for (let i = 0; i < className.length; i++) hash = className.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % CLASS_COLORS.length;
}

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'from-emerald-500 to-cyan-500' :
    pct >= 50 ? 'from-amber-500 to-orange-500' :
    'from-red-500 to-pink-500';
  return (
    <div className="w-full bg-[#1a1a27] rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function Results({ detections, imageName, processingTime }) {
  if (!detections || detections.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="w-14 h-14 mx-auto bg-[#1a1a27] rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No objects detected in this image.</p>
        <p className="text-gray-600 text-xs mt-1">Try a clearer image with recognisable objects.</p>
      </div>
    );
  }

  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const classCounts = sorted.reduce((acc, d) => {
    acc[d.class_name] = (acc[d.class_name] || 0) + 1;
    return acc;
  }, {});
  const uniqueClasses = Object.keys(classCounts);

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Detection Results
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {processingTime && (
              <span className="bg-[#1a1a27] px-2 py-1 rounded-lg">
                ⏱ {processingTime}ms
              </span>
            )}
          </div>
        </div>

        {/* Class pills */}
        <div className="flex flex-wrap gap-2">
          {uniqueClasses.map((cls) => {
            const idx = getColorIndex(cls);
            return (
              <span
                key={cls}
                className={`badge ${CLASS_COLORS[idx]} text-white`}
              >
                {cls}
                {classCounts[cls] > 1 && (
                  <span className="ml-1 bg-black/30 px-1 rounded-sm">{classCounts[cls]}</span>
                )}
              </span>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-[#2e2e47] flex gap-4 text-sm text-gray-400">
          <span><span className="text-white font-semibold">{detections.length}</span> detection{detections.length !== 1 ? 's' : ''}</span>
          <span><span className="text-white font-semibold">{uniqueClasses.length}</span> unique class{uniqueClasses.length !== 1 ? 'es' : ''}</span>
          <span>
            avg{' '}
            <span className="text-white font-semibold">
              {Math.round((sorted.reduce((s, d) => s + d.confidence, 0) / sorted.length) * 100)}%
            </span>{' '}
            confidence
          </span>
        </div>
      </div>

      {/* Detection list */}
      <div className="space-y-2">
        {sorted.map((det, i) => {
          const idx = getColorIndex(det.class_name);
          const pct = Math.round(det.confidence * 100);
          return (
            <div
              key={i}
              className="bg-[#12121a] border border-[#2e2e47] rounded-xl px-4 py-3 
                         hover:border-violet-700/50 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${CLASS_COLORS[idx]}`} />
                  <span className={`font-semibold capitalize ${TEXT_COLORS[idx]}`}>{det.class_name}</span>
                </div>
                <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {pct}%
                </span>
              </div>
              <ConfidenceBar value={det.confidence} />
              {det.bbox && (
                <p className="mt-1.5 text-xs text-gray-600">
                  bbox: ({det.bbox.x}, {det.bbox.y}) — {det.bbox.width}×{det.bbox.height}px
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

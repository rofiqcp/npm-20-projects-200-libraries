export default function Navbar({ modelStatus }) {
  const statusConfig = {
    idle: { dot: 'bg-gray-500', text: 'text-gray-500', label: 'Model not loaded' },
    loading: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'Loading model…' },
    ready: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'COCO-SSD ready' },
    error: { dot: 'bg-red-400', text: 'text-red-400', label: 'Model error' },
  };
  const { dot, text, label } = statusConfig[modelStatus] || statusConfig.idle;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#1a1a27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 
                          flex items-center justify-center shadow-lg shadow-violet-900/40">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none tracking-tight">VisionAI</h1>
            <p className="text-[10px] text-gray-500 leading-none">Image Recognition</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* TensorFlow status badge */}
          <div className={`hidden sm:flex items-center gap-2 bg-[#12121a] border border-[#2e2e47] 
                          rounded-full px-3 py-1.5 text-xs font-medium ${text}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </div>

          {/* TF.js badge */}
          <div className="flex items-center gap-1.5 bg-[#12121a] border border-[#2e2e47] 
                          rounded-full px-3 py-1.5">
            <span className="text-orange-400 text-xs font-bold">TF.js</span>
            <span className="text-gray-600 text-xs">in browser</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
};

export default function ImageUpload({ onFileSelected, isProcessing }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: isProcessing,
  });

  const rejectionMessage = fileRejections[0]?.errors[0]?.message;

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
        transition-all duration-300 group
        ${isDragActive && !isDragReject ? 'border-violet-500 bg-violet-950/30 drop-active' : ''}
        ${isDragReject ? 'border-red-500 bg-red-950/20' : ''}
        ${!isDragActive ? 'border-[#2e2e47] hover:border-violet-600 hover:bg-violet-950/10' : ''}
        ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />

      {/* Animated background blobs */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl 
                        group-hover:bg-violet-600/20 transition-all duration-700" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl 
                        group-hover:bg-cyan-600/20 transition-all duration-700" />
      </div>

      <div className="relative">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full border-4 border-violet-600/30 border-t-violet-500 animate-spin" />
            <p className="text-gray-400 font-medium">Analyzing image…</p>
          </div>
        ) : isDragReject ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-900/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 font-medium">Invalid file type</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragActive ? 'bg-violet-600/30 scale-110' : 'bg-[#1a1a27] group-hover:bg-violet-900/30'}`}>
              <svg className={`w-10 h-10 transition-colors duration-300
                ${isDragActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-violet-400'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <p className={`text-lg font-semibold transition-colors duration-300
                ${isDragActive ? 'text-violet-300' : 'text-gray-300 group-hover:text-violet-300'}`}>
                {isDragActive ? 'Drop your image here!' : 'Drag & drop an image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or <span className="text-violet-400 underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                JPEG, PNG, WebP, GIF, BMP · Max 10MB
              </p>
            </div>
          </div>
        )}

        {rejectionMessage && !isProcessing && (
          <p className="mt-3 text-sm text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg">
            {rejectionMessage}
          </p>
        )}
      </div>
    </div>
  );
}

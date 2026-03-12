import { useEffect } from 'react'
import { getPosterUrl } from '../services/tmdbAPI'

function StarRating({ voteAverage }) {
  const stars = Math.round((voteAverage / 10) * 5)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= stars ? 'text-yellow-400' : 'text-slate-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function MovieModal({ movie, onClose, onToggleFavorite, isFavorite }) {
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A'
  const genres = movie.genres?.map(g => g.name).join(', ') || 'N/A'
  const companies = movie.production_companies?.slice(0, 3).map(c => c.name).join(', ')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Poster */}
          <div className="sm:w-64 flex-shrink-0">
            <img
              src={getPosterUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster' }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end mb-3">
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1">{movie.title}</h2>
            {movie.tagline && (
              <p className="text-slate-400 italic text-sm mb-3">"{movie.tagline}"</p>
            )}

            {/* Rating & Favorite */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <StarRating voteAverage={movie.vote_average} />
                <span className="text-yellow-400 font-bold">{movie.vote_average?.toFixed(1)}/10</span>
              </div>
              <button
                onClick={() => onToggleFavorite(movie)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  isFavorite
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-red-500/40'
                }`}
              >
                <svg
                  className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite ? 'Saved' : 'Favorite'}
              </button>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Release Year</p>
                <p className="font-semibold text-white">{year}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Runtime</p>
                <p className="font-semibold text-white">{runtime}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 col-span-2">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Genres</p>
                <p className="font-semibold text-white">{genres}</p>
              </div>
            </div>

            {/* Overview */}
            {movie.overview && (
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Overview</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Production companies */}
            {companies && (
              <div>
                <h4 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Production</h4>
                <p className="text-slate-400 text-sm">{companies}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

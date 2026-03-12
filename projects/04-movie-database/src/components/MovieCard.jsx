import { getPosterUrl } from '../services/tmdbAPI'

function StarRating({ voteAverage }) {
  const stars = Math.round((voteAverage / 10) * 5)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= stars ? 'text-yellow-400' : 'text-slate-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function MovieCard({ movie, onClick, onToggleFavorite, favorite }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'

  return (
    <div
      className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-yellow-500/50 transition-all hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(movie)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={e => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster' }}
          loading="lazy"
        />
        {/* Favorite button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(movie) }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-4 h-4 ${favorite ? 'text-red-500 fill-red-500' : 'text-white'}`}
            fill={favorite ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight mb-1">{movie.title}</h3>
        <p className="text-slate-500 text-xs mb-2">{year}</p>
        <div className="flex items-center gap-2">
          <StarRating voteAverage={movie.vote_average} />
          <span className="text-yellow-400 text-xs font-medium">{movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}

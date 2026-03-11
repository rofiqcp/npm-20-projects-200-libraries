import MovieCard from './MovieCard'

export default function MovieGrid({ movies, onMovieClick, onToggleFavorite, isFavorite }) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-24 text-slate-500">
        <div className="text-6xl mb-4">🎞️</div>
        <p className="text-xl font-medium text-slate-400">No movies found</p>
        <p className="text-sm mt-2">Try a different search or check your API key.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={onMovieClick}
          onToggleFavorite={onToggleFavorite}
          favorite={isFavorite(movie.id)}
        />
      ))}
    </div>
  )
}

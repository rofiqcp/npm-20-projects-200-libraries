import { useState, useEffect, useCallback } from 'react'
import { searchMovies, getMovieDetails, getPopularMovies } from './services/tmdbAPI'
import SearchBar from './components/SearchBar'
import MovieGrid from './components/MovieGrid'
import MovieModal from './components/MovieModal'
import Pagination from './components/Pagination'

const FAVORITES_KEY = 'movie-favorites'

export default function App() {
  const [movies, setMovies] = useState([])
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('search')

  useEffect(() => {
    loadPopular()
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  async function loadPopular() {
    setLoading(true)
    setError('')
    try {
      const data = await getPopularMovies(1)
      setMovies(data.results)
      setTotalPages(Math.min(data.total_pages, 500))
      setCurrentPage(1)
    } catch (err) {
      setError(err.response?.data?.status_message || 'Failed to load popular movies.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(searchQuery) {
    setQuery(searchQuery)
    setActiveTab('search')
    await fetchMovies(searchQuery, 1)
  }

  async function fetchMovies(q, page) {
    setLoading(true)
    setError('')
    try {
      const data = q
        ? await searchMovies(q, page)
        : await getPopularMovies(page)
      setMovies(data.results)
      setTotalPages(Math.min(data.total_pages, 500))
      setCurrentPage(page)
    } catch (err) {
      setError(err.response?.data?.status_message || 'Failed to fetch movies.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMovieClick(movie) {
    try {
      const details = await getMovieDetails(movie.id)
      setSelectedMovie(details)
    } catch {
      setSelectedMovie(movie)
    }
  }

  function handlePageChange(page) {
    fetchMovies(query, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === movie.id)
      return exists ? prev.filter(f => f.id !== movie.id) : [...prev, movie]
    })
  }, [])

  const isFavorite = useCallback((id) => favorites.some(f => f.id === id), [favorites])

  const displayedMovies = activeTab === 'favorites' ? favorites : movies

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              🎬 <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">MovieDB</span>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'search'
                    ? 'bg-yellow-500 text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔍 Discover
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-yellow-500 text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ❤️ Favorites ({favorites.length})
              </button>
            </div>
          </div>
          {activeTab === 'search' && <SearchBar onSearch={handleSearch} />}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin"></div>
            <span className="ml-4 text-slate-400 text-lg">Loading movies...</span>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <>
            <MovieGrid
              movies={displayedMovies}
              onMovieClick={handleMovieClick}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
            {activeTab === 'search' && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite(selectedMovie.id)}
        />
      )}
    </div>
  )
}

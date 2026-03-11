import axios from 'axios'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMAGE_BASE = 'https://image.tmdb.org/t/p'
const PLACEHOLDER = 'https://via.placeholder.com/500x750?text=No+Poster'

const api = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
})

export async function searchMovies(query, page = 1) {
  const response = await api.get('/search/movie', {
    params: { query, page },
  })
  return response.data
}

export async function getMovieDetails(movieId) {
  const response = await api.get(`/movie/${movieId}`)
  return response.data
}

export async function getPopularMovies(page = 1) {
  const response = await api.get('/movie/popular', {
    params: { page },
  })
  return response.data
}

export function getPosterUrl(posterPath, size = 'w500') {
  if (!posterPath) return PLACEHOLDER
  return `${IMAGE_BASE}/${size}${posterPath}`
}

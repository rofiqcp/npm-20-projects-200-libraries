# Project 4: Movie Database Search

**Complexity:** ⭐⭐  
**Duration:** 1-2 weeks  
**Database:** No Backend (API + localStorage)  
**Level:** Mudah (Beginner)

## Overview
Build a movie search application using TMDB API. Learn pagination, filtering, favorites, and advanced search features without needing a backend.

## Tech Stack
- **Frontend:** React + Hooks
- **API Client:** Axios
- **State Management:** useState + useEffect
- **Pagination:** react-paginate
- **Browser Storage:** localStorage
- **Styling:** Tailwind CSS
- **External API:** TMDB API (free tier)

## Key Features
- ✅ Search movies by title
- ✅ Genre filtering (client-side)
- ✅ Year filtering
- ✅ Pagination (10 results per page)
- ✅ Movie detail modal with full info
- ✅ Favorite movies (saved to localStorage)
- ✅ Star ratings display
- ✅ Movie poster images
- ✅ Responsive grid layout

## Tech Dependencies
```bash
npm install react axios react-paginate
npm install -D tailwindcss
```

## API Setup
- Sign up at [TMDB](https://www.themoviedb.org/settings/api) for free API key
- Access to 500,000+ movies
- High rate limits for development

```javascript
// Example API call
const searchMovies = async (query, page = 1) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/search/movie`,
    {
      params: {
        api_key: API_KEY,
        query: query,
        page: page
      }
    }
  );
  return response.data;
};
```

## Learning Outcomes
- TMDB API integration
- Pagination implementation
- Search & filter functionality
- localStorage for favorites
- Modal components
- Image handling in React
- Loading states & error handling
- Client-side data filtering

## Project Structure
```
src/
├── components/
│   ├── SearchBar.jsx
│   ├── MovieGrid.jsx
│   ├── MovieCard.jsx
│   ├── MovieModal.jsx
│   └── Pagination.jsx
├── services/
│   └── tmdbAPI.js
├── App.jsx
└── index.css
```

## Getting Started
```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_TMDB_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

## Features to Add
- Advanced filters (rating, release date, language)
- Movie recommendations
- User ratings/reviews storage
- Watch list vs favorites distinction
- TV shows search
- Actor search & filmography
- Multiple language support

## Resources
- See `docs/200_POPULAR_LIBRARIES.md` for similar libraries
- TMDB API documentation
- Axios guide
- react-paginate documentation

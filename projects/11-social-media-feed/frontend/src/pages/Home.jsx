import Navbar from '../components/Navbar.jsx';
import Feed from '../components/Feed.jsx';
import Recommendations from '../components/Recommendations.jsx';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="flex w-full max-w-6xl">
        {/* Left Sidebar — Navbar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Navbar />
        </aside>

        {/* Mobile Navbar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#2f3336] flex justify-around py-3 px-4">
          <MobileNavIcon icon="🏠" />
          <MobileNavIcon icon="🔍" />
          <MobileNavIcon icon="🔔" />
          <MobileNavIcon icon="✉️" />
        </div>

        {/* Main Feed */}
        <main className="flex-1 min-w-0 border-x border-[#2f3336] max-w-[600px]">
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-[#2f3336] px-4 py-3">
            <h1 className="text-xl font-extrabold">Home</h1>
          </div>
          <Feed />
          <div className="h-20 lg:h-0" /> {/* Mobile bottom nav spacing */}
        </main>

        {/* Right Sidebar — Recommendations */}
        <aside className="hidden xl:block w-80 flex-shrink-0 px-4 py-3">
          <div className="sticky top-3">
            <SearchBar />
            <div className="mt-4">
              <Recommendations />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MobileNavIcon({ icon }) {
  return (
    <button className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors">
      {icon}
    </button>
  );
}

function SearchBar() {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-[#536471]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-[#202327] text-white placeholder-[#536471] rounded-full py-2.5 pl-10 pr-4 outline-none focus:bg-black focus:ring-1 focus:ring-[#1d9bf0] transition-all text-sm"
      />
    </div>
  );
}

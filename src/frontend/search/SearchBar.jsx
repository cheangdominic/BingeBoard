import { Search } from "lucide-react";
import { FaArrowAltCircleRight } from "react-icons/fa";

export default function SearchBar({ query, setQuery, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch();
  };

  return (
    <div className="mt-4 px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a TV show..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-1 flex items-center px-3 text-[#1963da] hover:text-yellow-500 focus:outline-none"
          >
            <FaArrowAltCircleRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

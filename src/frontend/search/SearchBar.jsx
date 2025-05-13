import { Search } from "lucide-react";

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
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="block w-full rounded-md bg-white px-4 py-2 text-base text-gray-900 outline outline-2 outline-gray-400 placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] transition"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-1 flex items-center px-3 text-[#1963da] hover:text-[#ebbd34] focus:outline-none"
          >
            <Search size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

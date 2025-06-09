import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiClock } from 'react-icons/fi';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const SearchBar = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const loadRecentSearches = () => {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    };
    loadRecentSearches();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const recipesRef = collection(db, 'recipes');
        const q = query(
          recipesRef,
          where('title', '>=', searchQuery.toLowerCase()),
          where('title', '<=', searchQuery.toLowerCase() + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          category: doc.data().category
        }));
        setSuggestions(results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Save to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

      // Navigate to search results
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/recipe/${suggestion.id}`);
    setIsExpanded(false);
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    navigate(`/recipes?search=${encodeURIComponent(search)}`);
    setIsExpanded(false);
  };

  return (
    <div className={`${className} w-full max-w-2xl mx-auto relative`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for recipes, ingredients, or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className={`
              w-full py-3 pl-12 pr-4 bg-white rounded-full shadow-soft
              focus:outline-none focus:ring-2 focus:ring-primary-300
              transition-all duration-300
              ${isExpanded ? 'shadow-md' : ''}
            `}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FiSearch size={18} className="text-neutral-500" />
          </div>
        </div>
        <motion.button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-full font-medium transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Search
        </motion.button>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isExpanded && (searchQuery.trim() || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="p-4 text-center text-neutral-500">
                Loading suggestions...
              </div>
            ) : searchQuery.trim() ? (
              suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center justify-between"
                    >
                      <span className="text-neutral-800">{suggestion.title}</span>
                      <span className="text-sm text-neutral-500">{suggestion.category}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-neutral-500">
                  No recipes found
                </div>
              )
            ) : recentSearches.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-sm font-medium text-neutral-500">Recent Searches</div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center"
                  >
                    <FiClock className="mr-2 text-neutral-400" />
                    <span className="text-neutral-800">{search}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, getDocs, startAfter, limit, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';
import { db } from '../firebase/config';

const Browse = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [lastDoc, setLastDoc] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Vegetarian',
    'Seafood',
    'Italian',
    'Asian',
    'Mexican'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' }
  ];

  // Fetch recipes with filters
  const { data: recipes = [], isLoading, fetchNextPage, hasNextPage } = useQuery({
    queryKey: ['recipes', sortBy, filterCategory],
    queryFn: async () => {
      const recipesRef = collection(db, 'recipes');
      let q = query(recipesRef);

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          q = query(q, orderBy('likesCount', 'desc'));
          break;
        case 'views':
          q = query(q, orderBy('viewCount', 'desc'));
          break;
        default:
          q = query(q, orderBy('createdAt', 'desc'));
      }

      // Apply category filter
      if (filterCategory !== 'all') {
        q = query(q, where('category', '==', filterCategory));
      }

      // Apply pagination
      q = query(q, limit(12));

      const querySnapshot = await getDocs(q);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  });

  const loadMore = async () => {
    if (!lastDoc) return;

    const recipesRef = collection(db, 'recipes');
    let q = query(recipesRef, startAfter(lastDoc), limit(12));

    // Apply same filters as initial query
    switch (sortBy) {
      case 'popular':
        q = query(q, orderBy('likesCount', 'desc'));
        break;
      case 'views':
        q = query(q, orderBy('viewCount', 'desc'));
        break;
      default:
        q = query(q, orderBy('createdAt', 'desc'));
    }

    if (filterCategory !== 'all') {
      q = query(q, where('category', '==', filterCategory));
    }

    const querySnapshot = await getDocs(q);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              Browse Recipes
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
              Explore our collection of delicious recipes from around the world.
            </p>
            <SearchBar className="max-w-2xl mx-auto" />
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-neutral-200 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FiFilter size={16} className="text-neutral-500" />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-white border border-neutral-200 rounded-lg py-2 px-4 flex items-center gap-2"
              >
                <FiFilter size={16} />
                Filters
              </button>
            </div>

            <div className="flex items-center space-x-2 bg-white rounded-md shadow-soft p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>

          {/* Category Filters - Desktop */}
          <div className="hidden lg:flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === category.toLowerCase()
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilterCategory(category.toLowerCase());
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-2 rounded-lg text-left ${
                        filterCategory === category.toLowerCase()
                          ? 'bg-primary-500 text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recipes Grid/List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-soft">
              <div className="text-6xl mb-4">🍳</div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">No recipes found</h3>
              <p className="text-neutral-600">Try adjusting your filters or search terms</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-soft overflow-hidden flex"
                >
                  <div className="w-1/4">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                        {recipe.category}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {recipe.viewCount || 0} views
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      {recipe.title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={recipe.authorPhotoURL || 'https://via.placeholder.com/40x40?text=U'}
                          alt={recipe.authorName}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-xs text-neutral-600">{recipe.authorName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <span>{recipe.cookTime} min</span>
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                Load More Recipes
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Browse; 
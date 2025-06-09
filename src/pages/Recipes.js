import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiGrid, FiList, FiHeart } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';

const Recipes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    cookTime: '',
    sortBy: 'newest'
  });

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const category = params.get('category');
    const sort = params.get('sort');
    
    if (search) setSearchQuery(search);
    if (category) setFilters(prev => ({ ...prev, category }));
    if (sort) setFilters(prev => ({ ...prev, sortBy: sort }));
    
    // Load recipes based on search and filters
    loadRecipes(search, { category, sortBy: sort });
  }, [location.search]);

  // Function to load recipes from Firestore
  const loadRecipes = async (search, filterOptions) => {
    setLoading(true);
    
    // Sample data for now - would be replaced with Firestore query
    setTimeout(() => {
      setRecipes([
        {
          id: '1',
          title: 'Creamy Garlic Parmesan Pasta',
          description: 'A rich and creamy pasta dish with garlic and parmesan cheese.',
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
          category: 'Italian',
          cookTime: 30,
          authorName: 'Jamie Oliver',
          authorPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
          servings: 4,
          likes: 120
        },
        {
          id: '2',
          title: 'Spicy Thai Basil Chicken',
          description: 'A flavorful and spicy Thai dish with chicken and basil.',
          imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d90c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80',
          category: 'Thai',
          cookTime: 25,
          authorName: 'Gordon Ramsay',
          authorPhotoURL: 'https://randomuser.me/api/portraits/men/36.jpg',
          servings: 3,
          likes: 95
        },
        {
          id: '3',
          title: 'Classic Beef Burger',
          description: 'A juicy homemade beef burger with all the fixings.',
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1299&q=80',
          category: 'American',
          cookTime: 20,
          authorName: 'Bobby Flay',
          authorPhotoURL: 'https://randomuser.me/api/portraits/men/42.jpg',
          servings: 4,
          likes: 150
        },
        {
          id: '4',
          title: 'Vegetable Stir Fry',
          description: 'A quick and healthy vegetable stir fry with soy sauce.',
          imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          category: 'Asian',
          cookTime: 15,
          authorName: 'Nigella Lawson',
          authorPhotoURL: 'https://randomuser.me/api/portraits/women/42.jpg',
          servings: 2,
          likes: 80
        },
        {
          id: '5',
          title: 'Chocolate Chip Cookies',
          description: 'Soft and chewy chocolate chip cookies, perfect with milk.',
          imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80',
          category: 'Dessert',
          cookTime: 25,
          authorName: 'Martha Stewart',
          authorPhotoURL: 'https://randomuser.me/api/portraits/women/68.jpg',
          servings: 24,
          likes: 200
        },
        {
          id: '6',
          title: 'Greek Salad',
          description: 'A refreshing salad with cucumber, tomato, olives, and feta.',
          imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Mediterranean',
          cookTime: 10,
          authorName: 'Ina Garten',
          authorPhotoURL: 'https://randomuser.me/api/portraits/women/65.jpg',
          servings: 4,
          likes: 75
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  // Handle search submission
  const handleSearch = (query) => {
    setSearchQuery(query);
    navigate(`/recipes${query ? `?search=${encodeURIComponent(query)}` : ''}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Update URL with filters
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
      
      navigate(`/recipes?${params.toString()}`);
      return newFilters;
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      cookTime: '',
      sortBy: 'newest'
    });
    navigate('/recipes');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Delicious Recipes</h1>
          <p className="text-gray-600 mb-6">Find and explore recipes from around the world</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar 
              initialValue={searchQuery} 
              onSearch={handleSearch} 
              className="w-full"
            />
          </div>
        </motion.div>
        
        {/* Filters and View Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <select 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="Italian">Italian</option>
              <option value="Asian">Asian</option>
              <option value="Mexican">Mexican</option>
              <option value="American">American</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Dessert">Dessert</option>
            </select>
            
            {/* Cook Time Filter */}
            <select 
              value={filters.cookTime}
              onChange={(e) => handleFilterChange('cookTime', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any Cook Time</option>
              <option value="15">15 minutes or less</option>
              <option value="30">30 minutes or less</option>
              <option value="60">1 hour or less</option>
            </select>
            
            {/* Sort By Filter */}
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="cookTime">Quickest to Make</option>
            </select>
            
            {/* Reset Filters Button */}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              Reset Filters
            </Button>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              aria-label="Grid view"
            >
              <FiGrid />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              aria-label="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
        
        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          {searchQuery && <span> for "{searchQuery}"</span>}
          {filters.category && <span> in {filters.category}</span>}
        </p>
        
        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </motion.div>
          ) : (
            /* List View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {recipes.map(recipe => (
                <motion.div 
                  key={recipe.id}
                  whileHover={{ y: -2 }}
                  className="flex bg-white rounded-xl shadow-soft overflow-hidden"
                >
                  <div className="w-1/4 h-40">
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-3/4 p-4 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                          {recipe.category}
                        </span>
                        <h3 className="text-xl font-bold mt-2 mb-1">{recipe.title}</h3>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Toggle like functionality would go here
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        aria-label="Like recipe"
                      >
                        <FiHeart />
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{recipe.description}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <img 
                          src={recipe.authorPhotoURL} 
                          alt={recipe.authorName} 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{recipe.authorName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FiHeart className="mr-1" /> {recipe.likes}
                        </span>
                        <span className="flex items-center">
                          <FiClock className="mr-1" /> {recipe.cookTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          /* No Results */
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <Button onClick={resetFilters}>Clear All Filters</Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Recipes;
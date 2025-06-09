import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FiGrid, FiList } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import { db } from '../firebase/config';

const Featured = () => {
  const [viewMode, setViewMode] = useState('grid');

  // Fetch featured recipes
  const { data: featuredRecipes = [], isLoading } = useQuery({
    queryKey: ['featuredRecipes'],
    queryFn: async () => {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('isFeatured', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              Featured Recipes
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
              Explore our handpicked selection of exceptional recipes. These featured dishes represent the best of what our community has to offer.
            </p>
            <SearchBar className="max-w-2xl mx-auto" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-end mb-6">
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

          {/* Recipes Grid/List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {featuredRecipes.map((recipe) => (
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
                      <span className="text-sm text-neutral-500">Featured</span>
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Featured; 
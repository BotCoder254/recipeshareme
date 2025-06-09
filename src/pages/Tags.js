import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecipeCard from '../components/RecipeCard';
import { db } from '../firebase/config';

const Tags = () => {
  const { tag } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 9;

  // Fetch recipes by tag
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipesByTag', tag],
    queryFn: async () => {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('tags', 'array-contains', tag.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  });

  // Calculate pagination
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <FiTag className="text-primary-500 mr-3" size={24} />
              <h1 className="text-2xl font-bold text-neutral-800">
                Recipes tagged with "{tag}"
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-soft">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">No recipes found</h3>
              <p className="text-neutral-600 mb-6">There are no recipes with this tag yet.</p>
              <Link
                to="/recipes"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse All Recipes
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tags; 
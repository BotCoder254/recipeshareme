import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiHeart, FiBookmark, FiGrid, FiList, FiActivity } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('myRecipes');
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();

  // Fetch user's recipes
  const { data: userRecipes = [], isLoading: isLoadingUserRecipes } = useQuery({
    queryKey: ['userRecipes', user?.uid],
    queryFn: async () => {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    },
    enabled: !!user?.uid
  });

  // Fetch user's favorite recipes
  const { data: favoriteRecipes = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favoriteRecipes', user?.uid],
    queryFn: async () => {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('saves', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    },
    enabled: !!user?.uid
  });

  // Delete recipe mutation
  const deleteMutation = useMutation({
    mutationFn: async (recipeId) => {
      await deleteDoc(doc(db, 'recipes', recipeId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userRecipes', user?.uid]);
      toast.success('Recipe deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete recipe');
      console.error('Delete error:', error);
    }
  });

  const handleDeleteRecipe = (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteMutation.mutate(recipeId);
    }
  };

  // Calculate analytics data
  const totalLikes = userRecipes?.reduce((sum, recipe) => sum + (recipe.likesCount || 0), 0) || 0;
  const totalComments = userRecipes?.reduce((sum, recipe) => sum + (recipe.comments?.length || 0), 0) || 0;
  const totalViews = userRecipes?.reduce((sum, recipe) => sum + (recipe.viewCount || 0), 0) || 0;

  // Prepare chart data from actual recipe statistics
  const chartData = {
    labels: ['Likes', 'Comments', 'Views', 'Saves'],
    datasets: [{
      label: 'Recipe Statistics',
      data: [totalLikes, totalComments, totalViews, favoriteRecipes.length],
      backgroundColor: [
        'rgba(34, 197, 94, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(249, 115, 22, 0.6)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(249, 115, 22, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Recipe Performance',
      },
    },
  };

  const tabs = [
    { id: 'myRecipes', label: 'My Recipes', icon: <FiBookmark /> },
    { id: 'favorites', label: 'Favorites', icon: <FiHeart /> },
    { id: 'analytics', label: 'Analytics', icon: <FiActivity /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'myRecipes':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800">My Recipes</h3>
              <div className="flex items-center space-x-4">
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
                <Button
                  as={Link}
                  to="/add-recipe"
                  size="sm"
                  icon={<FiPlus />}
                >
                  Add Recipe
                </Button>
              </div>
            </div>

            {isLoadingUserRecipes ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : userRecipes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-soft">
                <div className="text-6xl mb-4">🍳</div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">No recipes yet</h3>
                <p className="text-neutral-600 mb-6">Start sharing your culinary creations with the world!</p>
                <Button
                  as={Link}
                  to="/add-recipe"
                  icon={<FiPlus />}
                >
                  Create Your First Recipe
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe}
                    onDelete={() => handleDeleteRecipe(recipe.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {userRecipes.map((recipe) => (
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
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                            {recipe.category}
                          </span>
                          <span className="text-sm text-neutral-500">
                            {recipe.createdAt?.toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                          {recipe.title}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-neutral-500">
                          <span className="flex items-center">
                            <FiHeart className="mr-1" /> {recipe.likesCount || 0}
                          </span>
                          <span>{recipe.cookTime} min</span>
                          <span>{recipe.servings} servings</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            as={Link}
                            to={`/edit-recipe/${recipe.id}`}
                            size="sm"
                            variant="outline"
                            icon={<FiEdit2 size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<FiTrash2 size={16} />}
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            disabled={deleteMutation.isLoading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-800">Favorite Recipes</h3>
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

            {isLoadingFavorites ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : favoriteRecipes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-soft">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">No favorites yet</h3>
                <p className="text-neutral-600 mb-6">Start exploring recipes and save your favorites!</p>
                <Button
                  as={Link}
                  to="/recipes"
                >
                  Explore Recipes
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteRecipes.map((recipe) => (
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
                        <button className="text-red-500 hover:text-red-600">
                          <FiHeart className="fill-current" />
                        </button>
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
                            src={recipe.authorPhotoURL}
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
        );

      case 'analytics':
        return (
          <div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-6">Recipe Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-soft"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-neutral-600 font-medium">Total Recipes</h4>
                  <span className="text-primary-500 bg-primary-50 p-2 rounded-full">
                    <FiBookmark />
                  </span>
                </div>
                <p className="text-3xl font-bold text-neutral-800">{userRecipes.length}</p>
                <p className="text-sm text-neutral-500 mt-2">Your published recipes</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-soft"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-neutral-600 font-medium">Total Likes</h4>
                  <span className="text-red-500 bg-red-50 p-2 rounded-full">
                    <FiHeart />
                  </span>
                </div>
                <p className="text-3xl font-bold text-neutral-800">{totalLikes}</p>
                <p className="text-sm text-neutral-500 mt-2">Across all recipes</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-soft"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-neutral-600 font-medium">Total Views</h4>
                  <span className="text-secondary-500 bg-secondary-50 p-2 rounded-full">
                    <FiActivity />
                  </span>
                </div>
                <p className="text-3xl font-bold text-neutral-800">{totalViews}</p>
                <p className="text-sm text-neutral-500 mt-2">Recipe page views</p>
              </motion.div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-soft mb-8">
              <h4 className="text-lg font-semibold text-neutral-800 mb-4">Performance Overview</h4>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-soft">
              <h4 className="text-lg font-semibold text-neutral-800 mb-4">Top Performing Recipes</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Recipe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Likes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {userRecipes.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((recipe) => (
                      <tr key={recipe.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={recipe.imageUrl} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{recipe.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                            {recipe.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {recipe.viewCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {recipe.likesCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {recipe.comments?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
                <div className="flex flex-col items-center text-center mb-6">
                  <img
                    src={user?.photoURL || 'https://via.placeholder.com/100x100?text=User'}
                    alt={user?.displayName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
                  />
                  <h2 className="text-xl font-bold text-neutral-800">{user?.displayName}</h2>
                  <p className="text-neutral-500">{user?.email}</p>
                </div>

                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Button
                    as={Link}
                    to="/profile"
                    variant="outline"
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-soft p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
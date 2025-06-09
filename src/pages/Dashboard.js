import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiHeart, FiBookmark, FiGrid, FiList, FiActivity } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../hooks/useAuth';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Sample data - would be replaced with Firebase data
const sampleUserRecipes = [
  {
    id: '1',
    title: 'Homemade Pizza',
    description: 'A delicious homemade pizza with fresh ingredients and a crispy crust.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'Italian',
    cookTime: 45,
    servings: 4,
    authorName: 'Jamie Oliver',
    authorPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    createdAt: new Date('2023-05-15'),
    likes: 24,
    comments: 8,
  },
  {
    id: '2',
    title: 'Chocolate Chip Cookies',
    description: 'Classic chocolate chip cookies that are soft in the middle and crispy on the edges.',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'Dessert',
    cookTime: 25,
    servings: 12,
    authorName: 'Jamie Oliver',
    authorPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    createdAt: new Date('2023-06-02'),
    likes: 36,
    comments: 12,
  },
];

const sampleFavoriteRecipes = [
  {
    id: '3',
    title: 'Vegetable Stir Fry',
    description: 'A healthy and colorful vegetable stir fry with a savory sauce. Ready in minutes!',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'Vegetarian',
    cookTime: 15,
    servings: 2,
    authorName: 'Ella Woodward',
    authorPhotoURL: 'https://randomuser.me/api/portraits/women/12.jpg',
    createdAt: new Date('2023-05-28'),
    likes: 18,
    comments: 5,
  },
  {
    id: '4',
    title: 'Classic Beef Burger',
    description: 'Juicy homemade beef burgers with all the toppings. Perfect for summer barbecues.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=699&q=80',
    category: 'American',
    cookTime: 20,
    servings: 4,
    authorName: 'Gordon Ramsay',
    authorPhotoURL: 'https://randomuser.me/api/portraits/men/85.jpg',
    createdAt: new Date('2023-06-10'),
    likes: 42,
    comments: 15,
  },
];

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('myRecipes');
  const [viewMode, setViewMode] = useState('grid');
  const [userRecipes, setUserRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    // In a real app, this would fetch from Firebase
    setUserRecipes(sampleUserRecipes);
    setFavoriteRecipes(sampleFavoriteRecipes);
  }, []);

  // Chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Recipe Views',
        data: [65, 78, 52, 91, 120, 145],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Recipe Likes',
        data: [28, 35, 19, 47, 60, 85],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
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

            {userRecipes.length === 0 ? (
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
                  <RecipeCard key={recipe.id} recipe={recipe} />
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
                            {recipe.createdAt.toLocaleDateString()}
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
                            <FiHeart className="mr-1" /> {recipe.likes}
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

            {favoriteRecipes.length === 0 ? (
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
                <p className="text-sm text-neutral-500 mt-2">+2 from last month</p>
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
                <p className="text-3xl font-bold text-neutral-800">
                  {userRecipes.reduce((sum, recipe) => sum + recipe.likes, 0)}
                </p>
                <p className="text-sm text-neutral-500 mt-2">+18 from last month</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-soft"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-neutral-600 font-medium">Total Comments</h4>
                  <span className="text-secondary-500 bg-secondary-50 p-2 rounded-full">
                    <FiActivity />
                  </span>
                </div>
                <p className="text-3xl font-bold text-neutral-800">
                  {userRecipes.reduce((sum, recipe) => sum + recipe.comments, 0)}
                </p>
                <p className="text-sm text-neutral-500 mt-2">+7 from last month</p>
              </motion.div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-soft mb-8">
              <h4 className="text-lg font-semibold text-neutral-800 mb-4">Performance Over Time</h4>
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
                    {userRecipes.map((recipe) => (
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
                          {Math.floor(Math.random() * 1000) + 100}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {recipe.likes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {recipe.comments}
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
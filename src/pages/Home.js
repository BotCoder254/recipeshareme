import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTrendingUp, FiClock, FiThumbsUp } from 'react-icons/fi';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import Button from '../components/Button';

const categories = [
  { name: 'Breakfast', icon: '🍳' },
  { name: 'Lunch', icon: '🥪' },
  { name: 'Dinner', icon: '🍲' },
  { name: 'Dessert', icon: '🍰' },
  { name: 'Vegetarian', icon: '🥗' },
  { name: 'Seafood', icon: '🦞' },
];

const Home = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [trendingRecipes, setTrendingRecipes] = useState([]);

  useEffect(() => {
    // Fetch featured recipes
    const fetchFeaturedRecipes = async () => {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('isFeatured', '==', true), limit(4));
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeaturedRecipes(recipes);
    };

    // Fetch trending recipes
    const fetchTrendingRecipes = async () => {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, orderBy('viewCount', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrendingRecipes(recipes);
    };

    fetchFeaturedRecipes();
    fetchTrendingRecipes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')] bg-cover bg-center opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Discover & Share <span className="text-secondary-300">Delicious</span> Recipes
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-white text-opacity-90 mb-8"
            >
              Join our community of food enthusiasts to find inspiration and share your culinary creations with the world.
            </motion.p>

            <SearchBar className="mb-8" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button 
                as={Link}
                to="/browse"
                size="lg" 
                icon={<FiArrowRight />}
                iconPosition="right"
              >
                Browse Recipes
              </Button>
              <Button 
                as={Link}
                to="/register"
                variant="outline" 
                size="lg" 
                className="bg-white bg-opacity-20 border-white text-white hover:bg-primary-500 hover:bg-opacity-30"
              >
                Join Community
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,117.3C672,107,768,117,864,144C960,171,1056,213,1152,213.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Explore Categories</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Find recipes by category to quickly discover dishes that match your cravings or dietary preferences.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/recipes?category=${category.name}`} className="block p-6 bg-white rounded-xl shadow-soft hover:shadow-md transition-shadow duration-300 text-center">
                  <span className="text-4xl mb-3 block">{category.icon}</span>
                  <h3 className="text-lg font-medium text-neutral-800">{category.name}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-800 mb-2">Featured Recipes</h2>
              <p className="text-neutral-600">Discover our hand-picked selection of delicious recipes</p>
            </div>
            <Link to="/featured" className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-medium">
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button 
              as={Link}
              to="/featured"
              variant="outline" 
              icon={<FiArrowRight />} 
              iconPosition="right"
            >
              View All Recipes
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Why Choose RecipeShare?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Our platform offers everything you need to discover, create, and share amazing recipes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-soft"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FiTrendingUp className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Discover Trending Recipes</h3>
              <p className="text-neutral-600">Find popular and trending recipes from around the world, updated daily based on user interactions.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-soft"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FiClock className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Save Time with Quick Recipes</h3>
              <p className="text-neutral-600">Filter recipes by preparation time to find quick and easy meals for busy weeknights or leisurely weekend cooking.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-soft"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <FiThumbsUp className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Share Your Culinary Creations</h3>
              <p className="text-neutral-600">Create and share your own recipes with our community. Get feedback, likes, and build your cooking reputation.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
              <p className="text-white text-opacity-90">The most popular recipes this week</p>
            </div>
            <Link to="/trending" className="hidden md:flex items-center text-white font-medium hover:text-secondary-200">
              View All
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/recipe/${recipe.id}`} className="block">
                  <div className="relative">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-secondary-500 text-white text-xs font-medium rounded-full">
                      #{index + 1} Trending
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{recipe.title}</h3>
                    <p className="text-white text-opacity-80 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                    <div className="flex items-center">
                      <img
                        src={recipe.authorPhotoURL}
                        alt={recipe.authorName}
                        className="w-8 h-8 rounded-full mr-2 border-2 border-white"
                      />
                      <span className="text-sm text-white text-opacity-90">{recipe.authorName}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button
              as={Link}
              to="/trending"
              variant="outline"
              icon={<FiArrowRight />}
              iconPosition="right"
              className="border-white text-white hover:bg-white hover:bg-opacity-10"
            >
              View All Trending
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Ready to share your recipes with the world?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-neutral-300 mb-8"
            >
              Join our community today and start sharing your culinary masterpieces with food enthusiasts around the globe.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button size="lg">
                Sign Up Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:bg-opacity-10"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
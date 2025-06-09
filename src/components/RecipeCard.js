import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiHeart } from 'react-icons/fi';

const RecipeCard = ({ recipe }) => {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Here you would also update the like status in Firebase
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-300"
    >
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="relative">
          <img
            src={recipe.imageUrl || 'https://via.placeholder.com/300x200?text=Recipe+Image'}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={toggleLike}
            className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full shadow-soft hover:bg-opacity-100 transition-all duration-200"
          >
            <FiHeart
              size={18}
              className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-600'} transition-colors duration-200`}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              {recipe.category}
            </span>
            <div className="ml-auto flex items-center text-neutral-500 text-sm">
              <FiClock size={14} className="mr-1" />
              {recipe.cookTime} min
            </div>
          </div>

          <h3 className="text-lg font-semibold text-neutral-800 mb-1 line-clamp-1">
            {recipe.title}
          </h3>

          <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex items-center">
              <img
                src={recipe.authorPhotoURL || 'https://via.placeholder.com/40x40?text=User'}
                alt={recipe.authorName}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-xs text-neutral-600">{recipe.authorName}</span>
            </div>
            <div className="flex items-center text-neutral-500 text-xs">
              <FiUsers size={14} className="mr-1" />
              {recipe.servings} servings
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;
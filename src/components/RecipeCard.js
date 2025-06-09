import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiHeart, FiActivity } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const RecipeCard = ({ recipe, onDelete }) => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

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
            src={imageError ? 'https://via.placeholder.com/300x200?text=Recipe+Image' : (recipe.imageUrl || 'https://via.placeholder.com/300x200?text=Recipe+Image')}
            alt={recipe.title}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            {recipe.likes?.includes(user?.uid) && (
              <div className="p-2 bg-white bg-opacity-80 rounded-full shadow-soft">
                <FiHeart size={18} className="fill-red-500 text-red-500" />
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              {recipe.category}
            </span>
            <div className="ml-auto flex items-center space-x-3 text-neutral-500 text-sm">
              <div className="flex items-center">
                <FiActivity size={14} className="mr-1" />
                {recipe.viewCount || 0}
              </div>
              <div className="flex items-center">
                <FiClock size={14} className="mr-1" />
                {recipe.cookTime} min
              </div>
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
                src={recipe.authorPhotoURL || 'https://via.placeholder.com/40x40?text=Chef'}
                alt={recipe.authorName}
                className="w-6 h-6 rounded-full mr-2 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/40x40?text=Chef';
                }}
              />
              <span className="text-xs text-neutral-600">{recipe.authorName}</span>
            </div>
            <div className="flex items-center space-x-3 text-neutral-500 text-xs">
              <div className="flex items-center">
                <FiHeart size={14} className="mr-1" />
                {recipe.likesCount || 0}
              </div>
              <div className="flex items-center">
                <FiUsers size={14} className="mr-1" />
                {recipe.servings}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;
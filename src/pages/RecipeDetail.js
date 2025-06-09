import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiClock, FiUsers, FiHeart, FiBookmark, FiShare2, FiPrinter, 
  FiMessageSquare, FiFacebook, FiTwitter, FiLinkedin, FiMail, FiLink,
  FiEdit2, FiTrash2, FiStar, FiActivity, FiX
} from 'react-icons/fi';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';

// Sample recipe data - would be replaced with Firebase data
const sampleRecipe = {
  id: '1',
  title: 'Homemade Margherita Pizza',
  description: 'A delicious homemade pizza with fresh ingredients and a crispy crust. Perfect for a family dinner or entertaining guests.',
  imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  category: 'Italian',
  cookTime: 45,
  prepTime: 20,
  servings: 4,
  difficulty: 'Medium',
  authorId: 'user123',
  authorName: 'Jamie Oliver',
  authorPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
  createdAt: new Date('2023-05-15'),
  likes: 24,
  comments: [
    {
      id: 'c1',
      userId: 'user456',
      userName: 'Sarah Johnson',
      userPhotoURL: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'I made this last night and it was amazing! The crust was perfectly crispy.',
      createdAt: new Date('2023-05-18'),
    },
    {
      id: 'c2',
      userId: 'user789',
      userName: 'Michael Brown',
      userPhotoURL: 'https://randomuser.me/api/portraits/men/22.jpg',
      text: 'Great recipe! I added some fresh basil on top and it was delicious.',
      createdAt: new Date('2023-05-20'),
    },
  ],
  ingredients: [
    { id: 'i1', name: 'All-purpose flour', amount: '2 1/2 cups' },
    { id: 'i2', name: 'Active dry yeast', amount: '1 packet (2 1/4 tsp)' },
    { id: 'i3', name: 'Warm water', amount: '1 cup' },
    { id: 'i4', name: 'Olive oil', amount: '2 tbsp' },
    { id: 'i5', name: 'Salt', amount: '1 tsp' },
    { id: 'i6', name: 'Sugar', amount: '1 tsp' },
    { id: 'i7', name: 'Tomato sauce', amount: '1 cup' },
    { id: 'i8', name: 'Fresh mozzarella cheese', amount: '8 oz, sliced' },
    { id: 'i9', name: 'Fresh basil leaves', amount: '1/4 cup' },
  ],
  instructions: [
    { id: 's1', step: 'In a large mixing bowl, combine flour and salt.' },
    { id: 's2', step: 'In a small bowl, dissolve sugar in warm water. Sprinkle yeast over the top and let stand for about 10 minutes until foamy.' },
    { id: 's3', step: 'Add the yeast mixture and olive oil to the flour mixture and stir until a soft dough forms.' },
    { id: 's4', step: 'Knead the dough on a floured surface for about 5-7 minutes until smooth and elastic.' },
    { id: 's5', step: 'Place the dough in an oiled bowl, cover with a damp cloth, and let rise in a warm place for about 1 hour until doubled in size.' },
    { id: 's6', step: 'Preheat oven to 475°F (245°C). If using a pizza stone, place it in the oven while preheating.' },
    { id: 's7', step: 'Punch down the dough and roll it out on a floured surface to your desired thickness.' },
    { id: 's8', step: 'Transfer the dough to a pizza pan or parchment paper.' },
    { id: 's9', step: 'Spread tomato sauce evenly over the dough, leaving a small border for the crust.' },
    { id: 's10', step: 'Arrange mozzarella slices over the sauce.' },
    { id: 's11', step: 'Bake for 12-15 minutes until the crust is golden and the cheese is bubbly and slightly browned.' },
    { id: 's12', step: 'Remove from oven and immediately top with fresh basil leaves.' },
    { id: 's13', step: 'Let cool for a few minutes before slicing and serving.' },
  ],
  nutrition: {
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    fiber: 2,
  },
  tips: [
    'For a crispier crust, preheat a pizza stone in the oven for at least 30 minutes before baking.',
    'You can substitute fresh mozzarella with regular shredded mozzarella if needed.',
    'Add red pepper flakes for a spicy kick.',
  ],
};

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [commentText, setCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 4;

  // Fetch recipe data
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const docRef = doc(db, 'recipes', recipeId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Recipe not found');
      }
      const data = docSnap.data();
      // Initialize comments array if it doesn't exist
      if (!data.comments) {
        data.comments = [];
      }
      // Increment view count
      await updateDoc(docRef, {
        viewCount: increment(1)
      });
      return { id: docSnap.id, ...data };
    }
  });

  // Fetch similar recipes
  const { data: similarRecipes = [] } = useQuery({
    queryKey: ['similarRecipes', recipe?.category],
    queryFn: async () => {
      if (!recipe?.category) return [];
      const recipesRef = collection(db, 'recipes');
      const q = query(
        recipesRef, 
        where('category', '==', recipe.category),
        where('id', '!=', recipeId),
        limit(3)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!recipe?.category
  });

  // Like recipe mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const recipeRef = doc(db, 'recipes', recipeId);
      if (recipe.likes?.includes(user?.uid)) {
        await updateDoc(recipeRef, {
          likes: arrayRemove(user.uid),
          likesCount: increment(-1)
        });
      } else {
        await updateDoc(recipeRef, {
          likes: arrayUnion(user.uid),
          likesCount: increment(1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recipe', recipeId]);
      toast.success(recipe.likes?.includes(user?.uid) ? 'Recipe unliked' : 'Recipe liked');
    }
  });

  // Save recipe mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const userRef = doc(db, 'users', user.uid);
      if (recipe.saves?.includes(user?.uid)) {
        await updateDoc(userRef, {
          savedRecipes: arrayRemove(recipeId)
        });
      } else {
        await updateDoc(userRef, {
          savedRecipes: arrayUnion(recipeId)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recipe', recipeId]);
      toast.success(recipe.saves?.includes(user?.uid) ? 'Recipe removed from saved' : 'Recipe saved');
    }
  });

  // Delete recipe mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteDoc(doc(db, 'recipes', recipeId));
    },
    onSuccess: () => {
      toast.success('Recipe deleted successfully');
      navigate('/recipes');
    }
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async (commentText) => {
      const recipeRef = doc(db, 'recipes', recipeId);
      const newComment = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        text: commentText,
        createdAt: new Date()
      };
      
      // Get current recipe data
      const recipeSnap = await getDoc(recipeRef);
      const recipeData = recipeSnap.data();
      
      // Initialize comments array if it doesn't exist
      if (!recipeData.comments) {
        await updateDoc(recipeRef, { comments: [] });
      }
      
      await updateDoc(recipeRef, {
        comments: arrayUnion(newComment)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recipe', recipeId]);
      setCommentText('');
      toast.success('Comment added successfully');
    }
  });

  // Add rating mutation
  const ratingMutation = useMutation({
    mutationFn: async (rating) => {
      const recipeRef = doc(db, 'recipes', recipeId);
      await updateDoc(recipeRef, {
        [`ratings.${user.uid}`]: rating,
        ratingCount: increment(1),
        ratingSum: increment(rating)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recipe', recipeId]);
      toast.success('Rating added successfully');
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const recipeRef = doc(db, 'recipes', recipeId);
      const updatedComments = recipe.comments.filter(c => c.id !== commentId);
      await updateDoc(recipeRef, {
        comments: updatedComments
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recipe', recipeId]);
      toast.success('Comment deleted successfully');
    }
  });

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing recipe: ${recipe.title}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    };

    if (platform === 'link') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      return;
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setShowShareModal(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteModal(false);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleRating = (value) => {
    setRating(value);
    ratingMutation.mutate(value);
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  // Calculate pagination
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = recipe?.comments?.slice(indexOfFirstComment, indexOfLastComment) || [];
  const totalPages = Math.ceil((recipe?.comments?.length || 0) / commentsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse-slow">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Recipe Not Found</h2>
            <p className="text-neutral-600 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
            <Button as={Link} to="/recipes">Browse Recipes</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate average rating
  const averageRating = recipe.ratingCount ? (recipe.ratingSum / recipe.ratingCount).toFixed(1) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden mb-8 shadow-soft">
            <div className="absolute inset-0">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
            </div>
            
            <div className="relative py-20 px-6 md:px-12 text-white">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="px-3 py-1 text-sm font-medium bg-primary-500 text-white rounded-full mb-4 inline-block">
                    {recipe.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{recipe.title}</h1>
                  <p className="text-lg text-white/90 mb-6">{recipe.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center">
                      <FiClock className="mr-2" />
                      <span>Prep: {recipe.prepTime} min</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="mr-2" />
                      <span>Cook: {recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="mr-2" />
                      <span>Serves: {recipe.servings}</span>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="mr-2" />
                      <span>Rating: {averageRating} ({recipe.ratingCount || 0})</span>
                    </div>
                    <div className="flex items-center">
                      <FiActivity className="mr-2" />
                      <span>Views: {recipe.viewCount || 0}</span>
                    </div>
                    <div className="px-3 py-1 text-sm font-medium bg-white/20 rounded-full">
                      {recipe.difficulty}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={recipe.authorPhotoURL || 'https://via.placeholder.com/100x100?text=Chef'} 
                        alt={recipe.authorName} 
                        className="w-10 h-10 rounded-full mr-3 border-2 border-white object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100?text=Chef';
                        }}
                      />
                      <div>
                        <p className="font-medium">{recipe.authorName}</p>
                        <p className="text-sm text-white/70">
                          {recipe.createdAt?.toDate?.().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {user?.uid === recipe.userId && (
                      <div className="flex items-center space-x-2">
                        <Button
                          as={Link}
                          to={`/recipe/edit/${recipe.id}`}
                          variant="outline"
                          className="!text-white border-white/30 hover:bg-white/10"
                        >
                          <FiEdit2 className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setShowDeleteModal(true)}
                          variant="outline"
                          className="!text-white border-white/30 hover:bg-white/10"
                        >
                          <FiTrash2 className="mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow-soft p-4 mb-8 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => user ? likeMutation.mutate() : navigate('/login')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${recipe.likes?.includes(user?.uid) ? 'text-red-500 bg-red-50' : 'text-neutral-600 hover:bg-neutral-100'}`}
                disabled={likeMutation.isLoading}
              >
                <FiHeart className={recipe.likes?.includes(user?.uid) ? 'fill-current' : ''} />
                <span>{recipe.likesCount || 0} Likes</span>
              </button>
              
              <button 
                onClick={() => user ? saveMutation.mutate() : navigate('/login')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${recipe.saves?.includes(user?.uid) ? 'text-primary-500 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100'}`}
                disabled={saveMutation.isLoading}
              >
                <FiBookmark className={recipe.saves?.includes(user?.uid) ? 'fill-current' : ''} />
                <span>{recipe.saves?.includes(user?.uid) ? 'Saved' : 'Save'}</span>
              </button>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => user ? handleRating(value) : navigate('/login')}
                    className={`text-2xl ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <FiStar className={value <= rating ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <FiShare2 />
              </button>
              <button 
                onClick={() => window.print()}
                className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <FiPrinter />
              </button>
            </div>
          </div>

          {/* Share Modal */}
          <AnimatePresence>
            {showShareModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowShareModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">Share Recipe</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      <FiFacebook />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                    >
                      <FiTwitter />
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                    >
                      <FiLinkedin />
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-neutral-600 text-white hover:bg-neutral-700 transition-colors"
                    >
                      <FiMail />
                      <span>Email</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleShare('link')}
                    className="w-full mt-4 flex items-center justify-center space-x-2 p-3 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                  >
                    <FiLink />
                    <span>Copy Link</span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowDeleteModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">Delete Recipe</h3>
                  <p className="text-neutral-600 mb-6">Are you sure you want to delete this recipe? This action cannot be undone.</p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-8">
                <div className="flex border-b border-neutral-200">
                  <button 
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'ingredients' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
                  >
                    Ingredients
                  </button>
                  <button 
                    onClick={() => setActiveTab('instructions')}
                    className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'instructions' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
                  >
                    Instructions
                  </button>
                  <button 
                    onClick={() => setActiveTab('nutrition')}
                    className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'nutrition' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
                  >
                    Nutrition
                  </button>
                </div>
                
                <div className="p-6">
                  {activeTab === 'ingredients' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Ingredients</h3>
                      <p className="text-neutral-600 mb-4">Serves {recipe.servings}</p>
                      
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient) => (
                          <li key={ingredient.id} className="flex items-center">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                            <span className="text-neutral-800">{ingredient.amount} {ingredient.name}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  
                  {activeTab === 'instructions' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Instructions</h3>
                      
                      <ol className="space-y-6">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={instruction.id} className="flex">
                            <div className="flex-shrink-0 mr-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold">
                                {index + 1}
                              </div>
                            </div>
                            <div className="pt-1">
                              <p className="text-neutral-700">{instruction.step}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  )}
                  
                  {activeTab === 'nutrition' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Nutrition Information</h3>
                      <p className="text-neutral-600 mb-4">Per serving</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-neutral-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-neutral-800">{recipe.nutrition.calories}</p>
                          <p className="text-neutral-600 text-sm">Calories</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-neutral-800">{recipe.nutrition.protein}g</p>
                          <p className="text-neutral-600 text-sm">Protein</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-neutral-800">{recipe.nutrition.carbs}g</p>
                          <p className="text-neutral-600 text-sm">Carbs</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-neutral-800">{recipe.nutrition.fat}g</p>
                          <p className="text-neutral-600 text-sm">Fat</p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-neutral-800">{recipe.nutrition.fiber}g</p>
                          <p className="text-neutral-600 text-sm">Fiber</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Chef's Tips</h3>
                
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                      <p className="text-neutral-700">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Comments */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  <FiMessageSquare className="mr-2" />
                  Comments ({recipe.comments?.length || 0})
                </h3>
                
                {user ? (
                  <form onSubmit={handleComment} className="mb-8">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={user.photoURL || 'https://via.placeholder.com/40x40?text=U'} 
                        alt={user.displayName} 
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-grow">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts or ask a question..."
                          className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                          rows="3"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <Button type="submit" disabled={!commentText.trim()}>
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-neutral-50 p-4 rounded-lg mb-8 text-center">
                    <p className="text-neutral-700 mb-3">Sign in to leave a comment</p>
                    <Button as={Link} to="/login" variant="outline" size="sm">
                      Sign In
                    </Button>
                  </div>
                )}
                
                <div className="space-y-6">
                  {(!recipe.comments || recipe.comments.length === 0) ? (
                    <p className="text-center text-neutral-500 py-6">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    <>
                      {currentComments.map((comment) => (
                        <motion.div 
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex space-x-4"
                        >
                          <img 
                            src={comment.userPhotoURL || 'https://via.placeholder.com/40x40?text=U'} 
                            alt={comment.userName} 
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40x40?text=U';
                            }}
                          />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-neutral-800">{comment.userName}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-neutral-500">
                                  {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                {(user?.uid === comment.userId || user?.uid === recipe.userId) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-neutral-700 mt-1">{comment.text}</p>
                          </div>
                        </motion.div>
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-6">
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
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Similar Recipes */}
              <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">You Might Also Like</h3>
                
                <div className="space-y-4">
                  {similarRecipes.map((similarRecipe) => (
                    <Link 
                      key={similarRecipe.id}
                      to={`/recipe/${similarRecipe.id}`}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={similarRecipe.imageUrl || 'https://via.placeholder.com/200x200?text=Recipe'}
                          alt={similarRecipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200x200?text=Recipe';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-800 group-hover:text-primary-600 transition-colors">
                          {similarRecipe.title}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {similarRecipe.category} • {similarRecipe.cookTime} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Tags</h3>
                
                <div className="flex flex-wrap gap-2">
                  {recipe.tags?.length > 0 ? (
                    recipe.tags.map((tag) => (
                      <Link 
                        key={tag}
                        to={`/recipes/tags/${encodeURIComponent(tag.toLowerCase())}`}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))
                  ) : (
                    <p className="text-neutral-500">No tags available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RecipeDetail;
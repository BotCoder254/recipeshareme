import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiUpload, FiX, FiImage } from 'react-icons/fi';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { storage, db } from '../firebase/config';


const AddRecipe = ({ isEdit }) => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Medium',
    ingredients: [{ id: Date.now(), name: '', amount: '' }],
    instructions: [{ id: Date.now(), step: '' }],
    tips: [''],
    tags: [],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    }
  });

  // Errors state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If recipeId exists, fetch recipe data for editing
    if (recipeId) {
      const fetchRecipe = async () => {
        setLoading(true);
        try {
          // Fetch recipe data from Firestore
          const recipeRef = doc(db, 'recipes', recipeId);
          const recipeSnap = await getDoc(recipeRef);
          
          if (recipeSnap.exists()) {
            const recipeData = recipeSnap.data();
            setFormData({
              ...recipeData,
              // Convert Firestore timestamp to string if needed
              prepTime: recipeData.prepTime.toString(),
              cookTime: recipeData.cookTime.toString(),
              servings: recipeData.servings.toString(),
            });
            
            // Set images from Firestore
            if (recipeData.images && recipeData.images.length > 0) {
              setImages(recipeData.images.map(img => ({
                url: img,
                file: null,
                id: Math.random().toString(36).substring(2),
                uploaded: true
              })));
            }
          } else {
            console.error('Recipe not found');
            setErrors(prev => ({ ...prev, submit: 'Recipe not found' }));
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching recipe:', error);
          setLoading(false);
          setErrors(prev => ({ ...prev, submit: 'Error loading recipe' }));
        }
      };
      
      fetchRecipe();
    }
  }, [recipeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [name]: value
      }
    }));
  };

  const handleIngredientChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient => 
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: Date.now(), name: '', amount: '' }]
    }));
  };

  const removeIngredient = (id) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id)
      }));
    }
  };

  const handleInstructionChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map(instruction => 
        instruction.id === id ? { ...instruction, step: value } : instruction
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { id: Date.now(), step: '' }]
    }));
  };

  const removeInstruction = (id) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter(instruction => instruction.id !== id)
      }));
    }
  };

  const handleTipChange = (index, value) => {
    const newTips = [...formData.tips];
    newTips[index] = value;
    setFormData(prev => ({
      ...prev,
      tips: newTips
    }));
  };

  const addTip = () => {
    setFormData(prev => ({
      ...prev,
      tips: [...prev.tips, '']
    }));
  };

  const removeTip = (index) => {
    if (formData.tips.length > 1) {
      const newTips = [...formData.tips];
      newTips.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        tips: newTips
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      const newImages = files.map(file => {
        // Create a preview for the image
        const imageId = Math.random().toString(36).substring(2);
        const reader = new FileReader();
        
        reader.onload = () => {
          setImages(prevImages => {
            return prevImages.map(img => 
              img.id === imageId ? { ...img, preview: reader.result } : img
            );
          });
        };
        
        reader.readAsDataURL(file);
        
        return {
          id: imageId,
          file,
          preview: null,
          uploaded: false,
          url: null
        };
      });
      
      setImages(prevImages => [...prevImages, ...newImages]);
    }
  };
  
  const removeImage = (id) => {
    setImages(prevImages => prevImages.filter(img => img.id !== id));
    
    // Also remove from progress tracking if exists
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };
  
  const uploadImages = async () => {
    // Filter only images that need to be uploaded (not already uploaded)
    const imagesToUpload = images.filter(img => !img.uploaded && img.file);
    
    if (imagesToUpload.length === 0) {
      // If no new images to upload, return existing image URLs
      return images.map(img => img.url).filter(Boolean);
    }
    
    // Upload each image and track progress
    const uploadPromises = imagesToUpload.map(img => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `recipes/${user.uid}/${Date.now()}_${img.file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, img.file);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [img.id]: progress
            }));
          },
          (error) => {
            console.error('Upload error:', error);
            setUploadError(`Error uploading ${img.file.name}`);
            reject(error);
          },
          async () => {
            // Upload complete, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update the image object with the URL and mark as uploaded
            setImages(prevImages => 
              prevImages.map(prevImg => 
                prevImg.id === img.id 
                  ? { ...prevImg, url: downloadURL, uploaded: true } 
                  : prevImg
              )
            );
            
            resolve(downloadURL);
          }
        );
      });
    });
    
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      // Combine existing uploaded image URLs with new ones
      const existingUrls = images
        .filter(img => img.uploaded && img.url)
        .map(img => img.url);
      
      return [...existingUrls, ...uploadedUrls];
    } catch (error) {
      console.error('Error in image uploads:', error);
      throw new Error('Failed to upload one or more images');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.prepTime.trim()) newErrors.prepTime = 'Prep time is required';
    if (!formData.cookTime.trim()) newErrors.cookTime = 'Cook time is required';
    if (!formData.servings.trim()) newErrors.servings = 'Servings is required';
    
    // Make image optional
    // if (images.length === 0) newErrors.image = 'At least one recipe image is required';
    
    // Validate ingredients
    const emptyIngredients = formData.ingredients.some(ing => !ing.name.trim() || !ing.amount.trim());
    if (emptyIngredients) newErrors.ingredients = 'All ingredients must have a name and amount';
    
    // Validate instructions
    const emptyInstructions = formData.instructions.some(inst => !inst.step.trim());
    if (emptyInstructions) newErrors.instructions = 'All instruction steps must be filled';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show all validation errors
      const errorMessages = Object.values(errors).join('\n');
      toast.error(errorMessages || 'Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setUploadError(null);
    
    try {
      // First upload all images and get their URLs
      let imageUrls = [];
      if (images.length > 0) {
        try {
          imageUrls = await uploadImages();
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.error('Failed to upload images. The recipe will be saved without images.');
        }
      }
      
      // Convert numeric strings to numbers
      const numericData = {
        ...formData,
        prepTime: parseInt(formData.prepTime, 10),
        cookTime: parseInt(formData.cookTime, 10),
        servings: parseInt(formData.servings, 10),
      };

      // Prepare recipe data
      const recipeData = {
        ...numericData,
        images: imageUrls,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
        likes: [],
        likesCount: 0,
        saves: [],
        savesCount: 0,
        ratings: {},
        ratingSum: 0,
        ratingCount: 0
      };
      
      let savedRecipeId;
      
      // Save to Firestore
      if (recipeId) {
        // Update existing recipe
        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, recipeData);
        savedRecipeId = recipeId;
        toast.success('Recipe updated successfully!');
      } else {
        // Create new recipe
        recipeData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'recipes'), recipeData);
        savedRecipeId = docRef.id;
        toast.success('Recipe created successfully!');
      }
      
      // Redirect to the recipe page
      navigate(`/recipe/${savedRecipeId}`);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe. Please try again.');
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save recipe. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-soft p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-6">
              {recipeId ? 'Edit Recipe' : 'Create New Recipe'}
            </h1>
            
            <form onSubmit={handleSubmit}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Recipe Title"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Homemade Margherita Pizza"
                      error={errors.title}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-neutral-700 font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your recipe in a few sentences..."
                      className={`w-full border ${errors.description ? 'border-red-500' : 'border-neutral-300'} rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors`}
                      rows="3"
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      label="Category"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g., Italian, Dessert, Vegetarian"
                      error={errors.category}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <Input
                      label="Prep Time (minutes)"
                      id="prepTime"
                      name="prepTime"
                      type="number"
                      value={formData.prepTime}
                      onChange={handleChange}
                      placeholder="e.g., 15"
                      error={errors.prepTime}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Cook Time (minutes)"
                      id="cookTime"
                      name="cookTime"
                      type="number"
                      value={formData.cookTime}
                      onChange={handleChange}
                      placeholder="e.g., 30"
                      error={errors.cookTime}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Servings"
                      id="servings"
                      name="servings"
                      type="number"
                      value={formData.servings}
                      onChange={handleChange}
                      placeholder="e.g., 4"
                      error={errors.servings}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-neutral-700 font-medium mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => {
                        const tagsArray = e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0);
                        setFormData(prev => ({
                          ...prev,
                          tags: tagsArray
                        }));
                      }}
                      placeholder="Enter tags separated by commas (e.g., Italian, Pizza, Homemade)"
                      className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    />
                    <p className="mt-1 text-sm text-neutral-500">
                      Add relevant tags to help users find your recipe
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Recipe Images Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                  Recipe Images
                </h2>
                
                <div className="mb-4">
                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {images.map((image) => (
                        <motion.div 
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-neutral-200">
                            <img 
                              src={image.preview || image.url} 
                              alt="Recipe" 
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Upload Progress Overlay */}
                            {!image.uploaded && uploadProgress[image.id] !== undefined && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                                <div className="w-3/4 bg-neutral-700 rounded-full h-2.5 mb-2 overflow-hidden">
                                  <div 
                                    className="bg-primary-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress[image.id]}%` }}
                                  ></div>
                                </div>
                                <p className="text-sm font-medium">{Math.round(uploadProgress[image.id])}%</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-neutral-100 transition-colors"
                          >
                            <FiX size={16} className="text-neutral-700" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Area */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg p-6 bg-neutral-50">
                    <FiImage size={48} className="text-neutral-400 mb-4" />
                    <p className="text-neutral-600 mb-4 text-center">
                      Drag and drop images here, or click to select files
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="recipe-images"
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('recipe-images').click()}
                    >
                      Select Images
                    </Button>
                  </div>
                  
                  {errors.image && (
                    <p className="mt-3 text-sm text-red-500">{errors.image}</p>
                  )}
                  
                  {uploadError && (
                    <p className="mt-3 text-sm text-red-500">{uploadError}</p>
                  )}
                </div>
              </div>
              
              {/* Ingredients Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                  Ingredients
                </h2>
                
                {errors.ingredients && (
                  <p className="mb-3 text-sm text-red-500">{errors.ingredients}</p>
                )}
                
                <div className="space-y-4">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex items-center space-x-4">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={ingredient.amount}
                          onChange={(e) => handleIngredientChange(ingredient.id, 'amount', e.target.value)}
                          placeholder="Amount (e.g., 2 cups)"
                          className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex-grow-[2]">
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                          placeholder="Ingredient name"
                          className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="p-3 text-neutral-500 hover:text-red-500 transition-colors"
                        disabled={formData.ingredients.length === 1}
                      >
                        <FiMinus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-4 flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  <FiPlus size={18} className="mr-1" />
                  Add Ingredient
                </button>
              </div>
              
              {/* Instructions Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                  Instructions
                </h2>
                
                {errors.instructions && (
                  <p className="mb-3 text-sm text-red-500">{errors.instructions}</p>
                )}
                
                <div className="space-y-4">
                  {formData.instructions.map((instruction, index) => (
                    <div key={instruction.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <textarea
                          value={instruction.step}
                          onChange={(e) => handleInstructionChange(instruction.id, e.target.value)}
                          placeholder={`Step ${index + 1} instructions...`}
                          className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                          rows="2"
                        ></textarea>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInstruction(instruction.id)}
                        className="p-3 text-neutral-500 hover:text-red-500 transition-colors"
                        disabled={formData.instructions.length === 1}
                      >
                        <FiMinus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addInstruction}
                  className="mt-4 flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  <FiPlus size={18} className="mr-1" />
                  Add Step
                </button>
              </div>
              
              {/* Tips Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                  Chef's Tips (Optional)
                </h2>
                
                <div className="space-y-4">
                  {formData.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => handleTipChange(index, e.target.value)}
                          placeholder="Add a helpful tip for this recipe..."
                          className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTip(index)}
                        className="p-3 text-neutral-500 hover:text-red-500 transition-colors"
                        disabled={formData.tips.length === 1}
                      >
                        <FiMinus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addTip}
                  className="mt-4 flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  <FiPlus size={18} className="mr-1" />
                  Add Tip
                </button>
              </div>
              
              {/* Nutrition Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                  Nutrition Information (Optional)
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Input
                      label="Calories"
                      id="calories"
                      name="calories"
                      type="number"
                      value={formData.nutrition.calories}
                      onChange={handleNutritionChange}
                      placeholder="e.g., 250"
                    />
                  </div>
                  <div>
                    <Input
                      label="Protein (g)"
                      id="protein"
                      name="protein"
                      type="number"
                      value={formData.nutrition.protein}
                      onChange={handleNutritionChange}
                      placeholder="e.g., 12"
                    />
                  </div>
                  <div>
                    <Input
                      label="Carbs (g)"
                      id="carbs"
                      name="carbs"
                      type="number"
                      value={formData.nutrition.carbs}
                      onChange={handleNutritionChange}
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div>
                    <Input
                      label="Fat (g)"
                      id="fat"
                      name="fat"
                      type="number"
                      value={formData.nutrition.fat}
                      onChange={handleNutritionChange}
                      placeholder="e.g., 8"
                    />
                  </div>
                  <div>
                    <Input
                      label="Fiber (g)"
                      id="fiber"
                      name="fiber"
                      type="number"
                      value={formData.nutrition.fiber}
                      onChange={handleNutritionChange}
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>
              </div>
              
              {/* Submit Section */}
              <div className="border-t border-neutral-200 pt-6 flex justify-between items-center">
                {errors.submit && (
                  <p className="text-sm text-red-500">{errors.submit}</p>
                )}
                
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : recipeId ? 'Update Recipe' : 'Create Recipe'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddRecipe;
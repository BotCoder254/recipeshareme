import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import Tags from './pages/Tags';
import Trending from './pages/Trending';
import Featured from './pages/Featured';
import Browse from './pages/Browse';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
            <Route path="/add-recipe" element={
              <ProtectedRoute>
                <AddRecipe />
              </ProtectedRoute>
            } />
            <Route path="/recipe/edit/:recipeId" element={
              <ProtectedRoute>
                <AddRecipe isEdit={true} />
              </ProtectedRoute>
            } />
            <Route path="/recipes/tags/:tag" element={<Tags />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/featured" element={<Featured />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
export default App;

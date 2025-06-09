import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiUser, FiLogIn, FiLogOut, FiPlusCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { logout } = useFirebaseAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`;

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome className="mr-2" /> },
    ...(!user ? [
      { name: 'Login', path: '/login', icon: <FiLogIn className="mr-2" /> },
      { name: 'Register', path: '/register', icon: <FiUser className="mr-2" /> }
    ] : [
      { name: 'Dashboard', path: '/dashboard', icon: <FiUser className="mr-2" /> },
      { name: 'Add Recipe', path: '/add-recipe', icon: <FiPlusCircle className="mr-2" /> }
    ])
  ];

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl font-bold text-primary-600">Recipe</span>
            <span className="text-2xl font-bold text-secondary-500">Share</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center text-sm font-medium transition-colors duration-300 ${location.pathname === link.path ? 'text-primary-600' : 'text-neutral-700 hover:text-primary-500'}`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          {user && (
            <button
              onClick={logout}
              className="flex items-center text-sm font-medium text-neutral-700 hover:text-primary-500 transition-colors duration-300"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-neutral-700 hover:text-primary-500 transition-colors duration-300"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 py-4"
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center py-2 px-4 rounded-md ${location.pathname === link.path ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={logout}
                className="flex items-center py-2 px-4 rounded-md text-neutral-700 hover:bg-neutral-50"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
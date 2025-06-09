import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-400">Recipe</span>
              <span className="text-2xl font-bold text-secondary-400">Share</span>
            </Link>
            <p className="mt-4 text-neutral-400 max-w-md">
              Share your favorite recipes with the world. Discover new dishes and connect with food enthusiasts from around the globe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                  Recipes
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                <FiGithub size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                <FiTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                <FiInstagram size={20} />
              </a>
              <a href="mailto:info@recipeshare.com" className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                <FiMail size={20} />
              </a>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Subscribe</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-neutral-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                />
                <button className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-r-md transition-colors duration-300">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">
            &copy; {currentYear} RecipeShare. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-neutral-500 hover:text-primary-400 text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-neutral-500 hover:text-primary-400 text-sm transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-9xl font-extrabold text-primary-500">404</h1>
            <div className="w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 my-4 rounded-full"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Page Not Found</h2>
            <p className="text-neutral-600 mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                as={Link}
                to="/"
                icon={<FiHome />}
              >
                Go to Home
              </Button>
              <Button
                as={Link}
                to="#"
                onClick={() => window.history.back()}
                variant="outline"
                icon={<FiArrowLeft />}
              >
                Go Back
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
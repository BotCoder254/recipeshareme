import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Input from '../components/Input';
import Button from '../components/Button';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, error, isPending } = useFirebaseAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSuccess(false);

    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    const success = await resetPassword(email);
    if (success) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-neutral-900">Reset your password</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10"
          >
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start"
              >
                <FiCheckCircle className="text-green-500 mt-0.5 mr-2" />
                <p className="text-sm text-green-700">
                  Password reset email sent! Check your inbox for further instructions.
                </p>
              </motion.div>
            )}

            {(error || formError) && !isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start"
              >
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2" />
                <p className="text-sm text-red-600">{formError || error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<FiMail size={18} />}
                required
              />

              <div>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isPending}
                >
                  {isPending ? 'Sending...' : 'Send reset link'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Back to login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;
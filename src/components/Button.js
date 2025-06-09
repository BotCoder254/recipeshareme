import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  icon = null,
  iconPosition = 'left',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
    outline: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-xs py-1 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6',
    xl: 'text-lg py-4 px-8',
  };

  // Disabled styles
  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'transform hover:-translate-y-0.5 active:translate-y-0';

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabledStyles}
        ${widthStyles}
        ${className}
        rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        flex items-center justify-center
      `}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
};

export default Button;
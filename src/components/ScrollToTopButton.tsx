import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global Scroll to Top Button Component
 * A modern, animated floating button that appears when user scrolls down
 * and provides smooth scrolling back to the top of the page.
 */
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Show/hide button based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrolled / scrollHeight) * 100;

      // Show button when scrolled down 150px
      setIsVisible(scrolled > 150);
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top with smooth behavior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 20px 40px rgba(0, 51, 102, 0.3)",
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-700 to-blue-800 
                     text-white rounded-full p-4 shadow-2xl 
                     hover:from-blue-600 hover:to-blue-700 
                     transition-all duration-300 group
                     border-2 border-white/20 backdrop-blur-sm
                     min-w-[56px] min-h-[56px] flex items-center justify-center
                     focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          aria-label="Scroll to top of page"
          title="Scroll to top"
        >
          {/* Progress Ring Background */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 56 56"
          >
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={163.36} // Circumference of circle with radius 26
              initial={{ strokeDashoffset: 163.36 }}
              animate={{ 
                strokeDashoffset: 163.36 - (163.36 * scrollProgress) / 100
              }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </svg>

          {/* Icon with subtle animation */}
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            <ArrowUp 
              className="h-6 w-6 group-hover:animate-bounce" 
              strokeWidth={2.5}
            />
          </motion.div>

          {/* Pulsing Ring Animation */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-colors duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
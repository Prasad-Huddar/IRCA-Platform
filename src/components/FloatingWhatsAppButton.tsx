import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getIRCACenterDetails } from '../services/supabaseService';
import { MessageCircle, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingWhatsAppButton: React.FC = () => {
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState<string>('9353410837'); // Default number
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update scroll progress for animation effects
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrolled = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrolled / scrollHeight) * 100;
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Determine the phone number based on the current route
  useEffect(() => {
    const determinePhoneNumber = async () => {
      // Home page - use default number
      if (location.pathname === '/') {
        setPhoneNumber('9353410837');
        return;
      }

      // Check for center detail pages
      const centerIdMatch = location.pathname.match(/\/center\/(\d+)/);
      const ircaCenterIdMatch = location.pathname.match(/\/irca-center\/(.+)/);

      if (centerIdMatch) {
        // Center detail page with numeric ID - use default for now as we don't have a centers table query
        // This could be enhanced to query a centers table if needed
        setPhoneNumber('9353410837');
        return;
      } else if (ircaCenterIdMatch) {
        // IRCA center detail page with string ID - query database
        const centerId = ircaCenterIdMatch[1];
        
        // Add null check to prevent invalid queries
        if (!centerId || centerId === 'null' || centerId === 'undefined') {
          console.warn('Invalid IRCA center ID from URL:', centerId);
          setPhoneNumber('9353410837');
          return;
        }
        
        try {
          const center = await getIRCACenterDetails(centerId);
          
          if (center && center.phone && center.phone.length > 0) {
            // Use the first phone number in the array
            const firstPhone = center.phone[0];
            setPhoneNumber(firstPhone.replace(/\D/g, '')); // Remove non-numeric characters
            return;
          }
        } catch (error) {
          console.error('Error fetching IRCA center details for WhatsApp:', error);
        }
      }

      // Default to the main number if no specific number is found
      setPhoneNumber('9353410837');
    };

    determinePhoneNumber();
  }, [location]);

  const handleWhatsAppClick = () => {
    // Format the phone number for WhatsApp URL
    const formattedNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  // Hide the button on feedback and FAQ pages as they might have their own contact forms
  const [isHidden, setIsHidden] = useState(false);
  
  useEffect(() => {
    const hiddenPaths = ['/feedback', '/faq'];
    setIsHidden(hiddenPaths.includes(location.pathname));
  }, [location.pathname]);

  if (isHidden) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 20px 40px rgba(37, 211, 102, 0.3)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-green-600 to-green-700 
                 text-white rounded-full p-4 shadow-2xl 
                 hover:from-green-500 hover:to-green-600 
                 transition-all duration-300 group
                 border-2 border-white/20 backdrop-blur-sm
                 min-w-[56px] min-h-[56px] flex items-center justify-center
                 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
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
        <MessageSquare 
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
      <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl group-hover:bg-green-400/30 transition-colors duration-300" />
    </motion.button>
  );
};

export default FloatingWhatsAppButton;
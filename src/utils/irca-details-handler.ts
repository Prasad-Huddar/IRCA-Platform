// =============================================================================
// IRCA Details Handler - Independent TypeScript Logic
// =============================================================================
// This file contains all the logic for handling IRCA center details navigation
// and data management. It is completely independent from other site functionality.

import { getIRCACenterDetails, getAllIRCACenterIds, IRCACenterDetails } from '../services/supabaseService';

/**
 * IRCA Center Navigation Handler
 * Handles all navigation logic for IRCA centers
 */
export class IrcaNavigationHandler {
  private static instance: IrcaNavigationHandler;

  private constructor() {}

  static getInstance(): IrcaNavigationHandler {
    if (!IrcaNavigationHandler.instance) {
      IrcaNavigationHandler.instance = new IrcaNavigationHandler();
    }
    return IrcaNavigationHandler.instance;
  }

  /**
   * Navigate to IRCA center details page
   * @param centerId - The unique ID of the IRCA center
   */
  async navigateToCenter(centerId: string): Promise<void> {
    const isValid = await this.isValidCenterId(centerId);
    if (isValid) {
      // Use React Router navigation instead of window.location.href
      window.location.href = `/irca-center/${centerId}`;
    } else {
      console.error(`Invalid IRCA center ID: ${centerId}`);
    }
  }

  /**
   * Check if a center ID is valid
   * @param centerId - The center ID to validate
   * @returns True if the center exists
   */
  async isValidCenterId(centerId: string): Promise<boolean> {
    try {
      const centerIds = await getAllIRCACenterIds();
      return centerIds.includes(centerId);
    } catch (error) {
      console.error('Error validating center ID:', error);
      return false;
    }
  }

  /**
   * Get center details by ID
   * @param centerId - The center ID
   * @returns Center details or null if not found
   */
  async getCenterDetails(centerId: string): Promise<IRCACenterDetails | null> {
    try {
      return await getIRCACenterDetails(centerId);
    } catch (error) {
      console.error('Error fetching center details:', error);
      return null;
    }
  }

  /**
   * Get all available center IDs
   * @returns Array of all center IDs
   */
  async getAllCenterIds(): Promise<string[]> {
    try {
      return await getAllIRCACenterIds();
    } catch (error) {
      console.error('Error fetching center IDs:', error);
      return [];
    }
  }

  /**
   * Generate URL for center details page
   * @param centerId - The center ID
   * @returns Full URL path
   */
  generateCenterUrl(centerId: string): string {
    return `/irca-center/${centerId}`;
  }
}

/**
 * IRCA Center Data Manager
 * Handles data operations for IRCA centers
 */
export class IrcaDataManager {
  private static instance: IrcaDataManager;

  private constructor() {}

  static getInstance(): IrcaDataManager {
    if (!IrcaDataManager.instance) {
      IrcaDataManager.instance = new IrcaDataManager();
    }
    return IrcaDataManager.instance;
  }

  /**
   * Load center data asynchronously
   * @param centerId - The center ID to load
   * @returns Promise resolving to center data
   */
  async loadCenterData(centerId: string): Promise<IRCACenterDetails | null> {
    try {
      return await getIRCACenterDetails(centerId);
    } catch (error) {
      console.error('Error loading center data:', error);
      return null;
    }
  }

  /**
   * Validate center data structure
   * @param center - The center data to validate
   * @returns True if data is valid
   */
  validateCenterData(center: any): center is IRCACenterDetails {
    return (
      center &&
      typeof center.id === 'string' &&
      typeof center.title === 'string' &&
      typeof center.beds === 'string' &&
      typeof center.established_year === 'number' &&
      typeof center.rating === 'number' &&
      typeof center.location === 'string' &&
      Array.isArray(center.phone) &&
      typeof center.email === 'string' &&
      typeof center.overview === 'string' &&
      Array.isArray(center.services) &&
      Array.isArray(center.staff) &&
      center.contact &&
      typeof center.contact.operating_hours === 'string' &&
      typeof center.contact.website === 'string' &&
      typeof center.contact.helpline === 'string'
    );
  }

  /**
   * Format center data for display
   * @param center - Raw center data
   * @returns Formatted center data
   */
  formatCenterData(center: IRCACenterDetails): IRCACenterDetails {
    return {
      ...center,
      phone: center.phone.map(phone => this.formatPhoneNumber(phone)),
      email: center.email.toLowerCase(),
      rating: Math.round(center.rating * 10) / 10 // Round to 1 decimal place
    };
  }

  /**
   * Format phone number for display
   * @param phone - Raw phone number
   * @returns Formatted phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format Indian phone numbers
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }

    return phone; // Return original if can't format
  }
}

/**
 * IRCA UI Animation Handler
 * Handles all animations and visual effects for IRCA pages
 */
export class IrcaAnimationHandler {
  private static instance: IrcaAnimationHandler;

  private constructor() {}

  static getInstance(): IrcaAnimationHandler {
    if (!IrcaAnimationHandler.instance) {
      IrcaAnimationHandler.instance = new IrcaAnimationHandler();
    }
    return IrcaAnimationHandler.instance;
  }

  /**
   * Initialize scroll-based animations
   */
  initializeScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Add fade-in animation to element
   * @param element - The element to animate
   * @param delay - Animation delay in ms
   */
  fadeInElement(element: HTMLElement, delay: number = 0): void {
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    }, delay);
  }

  /**
   * Add hover effects to cards
   */
  addCardHoverEffects(): void {
    document.querySelectorAll('.hover-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-4px)';
        (card as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
      });

      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0)';
        (card as HTMLElement).style.boxShadow = '';
      });
    });
  }
}

// Export singleton instances for easy access
export const ircaNavigation = IrcaNavigationHandler.getInstance();
export const ircaDataManager = IrcaDataManager.getInstance();
export const ircaAnimations = IrcaAnimationHandler.getInstance();

// =============================================================================
// Global IRCA Functions (for use in HTML event handlers)
// =============================================================================

/**
 * Global function to navigate to IRCA center
 * Can be called from HTML onclick handlers
 */
(window as any).navigateToIrcaCenter = async (centerId: string) => {
  await ircaNavigation.navigateToCenter(centerId);
};

/**
 * Global function to check if center exists
 * Can be called from HTML or other scripts
 */
(window as any).isValidIrcaCenter = async (centerId: string): Promise<boolean> => {
  return await ircaNavigation.isValidCenterId(centerId);
};
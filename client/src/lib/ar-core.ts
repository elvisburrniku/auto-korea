// Centralized import for A-Frame and AR.js
// This ensures that these libraries are only imported once in the entire application
// and prevents registration conflicts with custom elements

// Flag to track if initialization was done
let initialized = false;
let initializing = false;

// Function to initialize AR components if not already done
export const initialize = async (): Promise<boolean> => {
  // Return immediately if already initialized or in progress
  if (initialized) return true;
  if (initializing) return false;
  
  try {
    initializing = true;
    
    // Use dynamic imports to lazy-load A-Frame and AR.js
    // This ensures they are only loaded when needed
    if (typeof window !== 'undefined') {
      // Only attempt to import in browser environment
      try {
        // Dynamically import A-Frame first
        const aframeModule = await import('aframe');
        
        // Wait a moment to ensure A-Frame is properly registered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then import AR.js which depends on A-Frame
        const arjsModule = await import('@ar-js-org/ar.js');
        
        // Set initialization flag
        initialized = true;
        initializing = false;
        
        return true;
      } catch (error) {
        console.error('Error initializing AR modules:', error);
        initializing = false;
        return false;
      }
    }
  } catch (error) {
    console.error('Error in AR initialization:', error);
    initializing = false;
    return false;
  }
  
  return false;
};

// Do NOT initialize on module load - wait for explicit initialization
// This prevents automatic loading when the module is imported

// Export any utility functions for AR functionality
export function cleanupARScene() {
  // Safely remove A-Frame scene if it exists
  if (typeof document !== 'undefined') {
    const scenes = document.querySelectorAll('a-scene');
    scenes.forEach(scene => {
      scene.parentNode?.removeChild(scene);
    });
  }
}

// Initialize A-Frame scene
export function initializeARScene(): void {
  // This function can be called to ensure A-Frame is properly initialized
  // before creating any components - if needed for future extensions
}

// Make sure external utilities can check if AR is ready
export const isARReady = (): boolean => {
  // Since we're directly importing A-Frame at the module level,
  // we always consider it "ready" - no need to check window.AFRAME
  return initialized;
};

// Export a typed interface for A-Frame scene element
// to avoid TypeScript errors
export interface HTMLAFrameSceneElement extends HTMLElement {
  camera: any;
  renderer: any;
  addEventListener: (event: string, callback: () => void) => void;
  removeEventListener: (event: string, callback: () => void) => void;
}
// AR core module with direct script loading approach
// This approach loads the library scripts directly from CDN
// instead of relying on bundled npm packages

// Add global Window interface extension for A-Frame
declare global {
  interface Window {
    AFRAME?: any;
  }
}

// Track initialization state
let initialized = false;
let initPromise: Promise<boolean> | null = null;

/**
 * Initializes AR libraries (A-Frame and AR.js)
 * Uses a singleton promise pattern to ensure initialization happens only once
 */
export const initialize = async (): Promise<boolean> => {
  // If already initialized, return immediately
  if (initialized) {
    console.log('AR Core: Already initialized');
    return true;
  }

  // If initialization is in progress, return the existing promise
  if (initPromise) {
    console.log('AR Core: Initialization already in progress, waiting for result');
    return initPromise;
  }

  // Start initialization with a new promise
  console.log('AR Core: Starting initialization process');
  
  initPromise = new Promise<boolean>(async (resolve) => {
    try {
      // First check if we're in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.error('AR Core: Not in browser environment');
        resolve(false);
        return;
      }

      // Load A-Frame script if not already loaded
      if (!window.AFRAME) {
        console.log('AR Core: Loading A-Frame script');
        await loadScript('https://aframe.io/releases/1.4.0/aframe.min.js');
        console.log('AR Core: A-Frame loaded successfully');
      } else {
        console.log('AR Core: A-Frame already loaded');
      }

      // Allow time for A-Frame to initialize
      await new Promise(r => setTimeout(r, 200));

      // Load AR.js after A-Frame is loaded
      console.log('AR Core: Loading AR.js script');
      await loadScript('https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js');
      console.log('AR Core: AR.js loaded successfully');

      // Allow time for AR.js to initialize
      await new Promise(r => setTimeout(r, 200));

      // Set initialized state
      initialized = true;
      console.log('AR Core: Initialization complete');
      resolve(true);
    } catch (error) {
      console.error('AR Core: Initialization failed', error);
      // Reset promise so we can try again
      initPromise = null;
      resolve(false);
    }
  });

  return initPromise;
};

/**
 * Helper function to load a script dynamically
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Checks if AR is ready to use
 */
export const isARReady = (): boolean => {
  return initialized && typeof window !== 'undefined' && !!window.AFRAME;
};

/**
 * Cleans up AR scene elements
 */
export function cleanupARScene(): void {
  if (typeof document !== 'undefined') {
    // Find and remove A-Frame scenes
    document.querySelectorAll('a-scene').forEach(scene => {
      scene.parentNode?.removeChild(scene);
    });
    
    // Remove any AR.js video elements that might be left
    document.querySelectorAll('.a-canvas, .arjs-video').forEach(el => {
      el.parentNode?.removeChild(el);
    });
    
    console.log('AR Core: Scene cleanup complete');
  }
}

/**
 * Sets up an empty A-Frame scene - typically not needed directly
 */
export function initializeARScene(): void {
  // This is a placeholder for future setup needs
  console.log('AR Scene initialized');
}

/**
 * Type definition for A-Frame scene element
 */
export interface HTMLAFrameSceneElement extends HTMLElement {
  camera: any;
  renderer: any;
}
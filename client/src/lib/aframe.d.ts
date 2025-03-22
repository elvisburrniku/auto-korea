// Type declarations for A-Frame JSX elements

declare namespace JSX {
  interface IntrinsicElements {
    // A-Frame core elements
    'a-scene': any;
    'a-entity': any;
    'a-camera': any;
    'a-box': any;
    'a-sphere': any;
    'a-cylinder': any;
    'a-plane': any;
    'a-sky': any;
    'a-assets': any;
    'a-asset-item': any;
    'a-text': any;
    'a-light': any;
    
    // AR.js specific elements
    'a-marker': any;
    'a-marker-camera': any;
  }
}
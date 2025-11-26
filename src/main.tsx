import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Preload critical resources for faster mobile loading
if (typeof window !== 'undefined') {
  // Preconnect to external resources
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://www.gstatic.com';
  document.head.appendChild(preconnect);
  
  // Preload Draco decoder if needed
  const dracoPreload = document.createElement('link');
  dracoPreload.rel = 'preload';
  dracoPreload.as = 'script';
  dracoPreload.href = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/draco_decoder.js';
  document.head.appendChild(dracoPreload);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
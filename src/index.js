import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Use a client-only rendering approach to avoid hydration mismatches
const rootElement = document.getElementById('root');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Use createRoot for client-side rendering
  const root = ReactDOM.createRoot(rootElement);
  
  // Wrap the app in a component that suppresses hydration warnings
  const SuppressHydrationWarning = ({ children }) => {
    return <div suppressHydrationWarning>{children}</div>;
  };
  
  root.render(
    <React.StrictMode>
      <SuppressHydrationWarning>
        <App />
      </SuppressHydrationWarning>
    </React.StrictMode>
  );
} 
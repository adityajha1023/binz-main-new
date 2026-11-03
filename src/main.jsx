import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SiteTranslation from './components/SiteTranslation.jsx';
import './styles.css';
import './components/ui/primitives.css';
import './site-pages.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteTranslation />
    <App />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import { GuestProvider } from './context/GuestContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GuestProvider>
      <App />
    </GuestProvider>
  </React.StrictMode>
);

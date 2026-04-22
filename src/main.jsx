import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'

// Rely on Vite proxy for /api requests (configured in vite.config.js)
// axios.defaults.baseURL = 'http://localhost:5000';

// Set up global axios interceptor to automatically attach JWT token to all requests
axios.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

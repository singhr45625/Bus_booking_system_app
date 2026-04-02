import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'

// Set backend API URL for Render deployment
axios.defaults.baseURL = 'https://smart-bus-booking-api.onrender.com';

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

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Handle GitHub Pages 404 redirect for SPA routing
const redirect = sessionStorage.redirect
delete sessionStorage.redirect
if (redirect && redirect !== location.pathname) {
  // Restore the original URL without reloading
  window.history.replaceState(null, null, redirect)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

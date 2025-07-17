import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CartProvider } from './Context/CartContext.jsx'
import 'bootstrap/dist/css/bootstrap.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
)

import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import OrderCreate from './pages/OrderCreate'
import Suppliers from './pages/Suppliers'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import Settings from './pages/Settings'
import Shop from './pages/Shop'
import MyOrders from './pages/MyOrders'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  useEffect(() => {
    document.title = 'ERP Linh kiện điện tử'
  }, [])

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'PLACEHOLDER'
  const hasValidGoogleId = googleClientId && googleClientId !== 'PLACEHOLDER' && !googleClientId.includes('YOUR_')

  const appContent = (
    <Routes>
      <Route path="/login" element={<Login hasGoogleOAuth={hasValidGoogleId} />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/create" element={<OrderCreate />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="customers" element={<Customers />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="shop" element={<Shop />} />
        <Route path="my-orders" element={<MyOrders />} />
      </Route>
    </Routes>
  )

  if (hasValidGoogleId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {appContent}
      </GoogleOAuthProvider>
    )
  } else {
    return appContent
  }
}

export default App

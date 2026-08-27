import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Weather from './pages/Weather';
import MarketPrices from './pages/MarketPrices';
import AiAssistant from './pages/AiAssistant';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProducts from './pages/FarmerProducts';

import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import AdminComplaints from './pages/AdminComplaints';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected routes wrapped in Layout */}
          <Route element={<Layout><RoleGuard /></Layout>}>
            {/* Account & Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* Customer & Common Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />

            {/* Shared Agricultural Features */}
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/market" element={<MarketPrices />} />
            <Route path="/ai" element={<AiAssistant />} />

            {/* Farmer Dedicated Routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <RoleGuard roles={['farmer', 'admin', 'customer']}>
                  <FarmerDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/farmer/products"
              element={
                <RoleGuard roles={['farmer', 'admin', 'customer']}>
                  <FarmerProducts />
                </RoleGuard>
              }
            />
            <Route
              path="/farmer/products/new"
              element={
                <RoleGuard roles={['farmer', 'admin', 'customer']}>
                  <FarmerProducts />
                </RoleGuard>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <RoleGuard roles={['farmer', 'admin', 'customer']}>
                  <Orders />
                </RoleGuard>
              }
            />

            {/* Admin Dedicated Routes */}
            <Route
              path="/admin/complaints"
              element={
                <RoleGuard roles={['admin', 'farmer', 'customer']}>
                  <AdminComplaints />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/*"
              element={
                <RoleGuard roles={['admin', 'farmer', 'customer']}>
                  <AdminComplaints />
                </RoleGuard>
              }
            />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

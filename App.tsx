/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import SkinGuide from './pages/SkinGuide';
import SkinConcernDetail from './pages/SkinConcernDetail';
import ProductDetail from './pages/ProductDetail';
import Reviews from './pages/Reviews';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminReviews from './admin/AdminReviews';
import AdminSubscribers from './admin/AdminSubscribers';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';
import CartDrawer from './components/CartDrawer';
import Preloader from './components/Preloader';
import PageTransition from './components/PageTransition';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("AdminRoute - Auth state changed:", currentUser?.email);
      if (currentUser) {
        setUser(currentUser);
        // Normalize email check
        const userEmail = currentUser.email?.toLowerCase().trim();
        const adminEmail = "mohitswami855@gmail.com".toLowerCase().trim();
        
        if (userEmail === adminEmail) {
          console.log("AdminRoute - Access granted by email match");
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && (userDoc.data()?.role === 'admin' || userDoc.data()?.isAdmin === true)) {
              console.log("AdminRoute - Access granted by Firestore role");
              setIsAdmin(true);
            } else {
              console.log("AdminRoute - Access denied: User is not an admin", userDoc.data());
            }
          } catch (error) {
            console.error("AdminRoute - Error verifying admin from Firestore:", error);
          }
        }
      } else {
        console.log("AdminRoute - Access denied: No user logged in");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    console.log("AdminRoute - Redirecting to login due to unauthorized access");
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/skin-guide" element={<SkinGuide />} />
          <Route path="/skin-guide/:concernId" element={<SkinConcernDetail />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />
          <Route path="/admin/reviews" element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          } />
          <Route path="/admin/subscribers" element={
            <AdminRoute>
              <AdminSubscribers />
            </AdminRoute>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <AnimatePresence mode="wait">
          {loading && <Preloader key="preloader" />}
        </AnimatePresence>
        <Router>
          <CartDrawer />
          <AnimatedRoutes />
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

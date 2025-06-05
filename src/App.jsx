import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Record from './pages/Record'
import Videos from './pages/Videos'
import Children from './pages/Children'
import Settings from './pages/Settings'
import About from './pages/About'
import Ideas from './pages/Ideas'
import PricingPage from './components/PricingPage'
import SuccessPage from './components/SuccessPage'
import LandingPage from './pages/LandingPage'
import { testConnection } from './lib/supabase'

function App() {
  useEffect(() => {
    // Test Supabase connection on app start
    testConnection()
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-dad-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/record" element={
            <ProtectedRoute>
              <Record />
            </ProtectedRoute>
          } />
          <Route path="/videos" element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          } />
          <Route path="/children" element={
            <ProtectedRoute>
              <Children />
            </ProtectedRoute>
          } />
          <Route path="/ideas" element={
            <ProtectedRoute>
              <Ideas />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App 
import React from 'react'
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
import Prompts from './pages/Prompts'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dad-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
          <Route path="/prompts" element={
            <ProtectedRoute>
              <Prompts />
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App 
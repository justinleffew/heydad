import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-dad-white flex items-center justify-center">
        <div className="text-dad-dark text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    // Only redirect to landing page if trying to access a protected route
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute 
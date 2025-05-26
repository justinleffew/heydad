import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Video, Home, Users, Plus, Menu, X, Settings, Info, Bell } from 'lucide-react'

const Layout = ({ children }) => {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path) => location.pathname === path

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-dad-white">
      <nav className="bg-dad-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-white">
                Hey Dad
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-dad-olive text-white'
                    : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              
              <Link
                to="/videos"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/videos')
                    ? 'bg-dad-olive text-white'
                    : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                }`}
              >
                <Video className="w-4 h-4 mr-2" />
                Videos
              </Link>
              
              <Link
                to="/notifications"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/notifications')
                    ? 'bg-dad-olive text-white'
                    : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                }`}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Link>
              
              <Link
                to="/children"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/children')
                    ? 'bg-dad-olive text-white'
                    : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Children
              </Link>
              
              <Link
                to="/settings"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/settings')
                    ? 'bg-dad-olive text-white'
                    : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              
              <Link
                to="/about"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/about')
                    ? 'bg-dad-olive text-white'
                    : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                }`}
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-dad-blue-gray hover:text-white hover:bg-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-dad-blue-gray hover:text-white p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-dad-dark border-t border-dad-olive">
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard')
                      ? 'bg-dad-olive text-white'
                      : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                  }`}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
                
                <Link
                  to="/videos"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/videos')
                      ? 'bg-dad-olive text-white'
                      : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                  }`}
                >
                  <Video className="w-5 h-5 mr-3" />
                  Videos
                </Link>
                
                <Link
                  to="/notifications"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/notifications')
                      ? 'bg-dad-olive text-white'
                      : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                  }`}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </Link>
                
                <Link
                  to="/children"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/children')
                      ? 'bg-dad-olive text-white'
                      : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                  }`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Children
                </Link>
                
                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/settings')
                      ? 'bg-dad-olive text-white'
                      : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Link>
                
                <Link
                  to="/about"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/about')
                      ? 'bg-dad-olive text-white'
                      : 'text-dad-blue-gray hover:text-white hover:bg-dad-olive'
                  }`}
                >
                  <Info className="w-5 h-5 mr-3" />
                  About
                </Link>
                
                <button
                  onClick={() => {
                    handleSignOut()
                    closeMobileMenu()
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-dad-blue-gray hover:text-white hover:bg-red-600"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 
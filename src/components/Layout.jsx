import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Video, Home, Users, Plus, Menu, X, Settings, Info, Bell, Lightbulb } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Layout = ({ children }) => {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          children (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // Transform the data to include title and time
      const transformedData = data.map(notification => ({
        id: notification.id,
        title: `${notification.children?.name || 'Unknown'} - ${notification.type}`,
        message: notification.message,
        time: formatTimeAgo(notification.created_at),
        unread: !notification.read
      }))

      setNotifications(transformedData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

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

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
  }

  const closeNotifications = () => {
    setIsNotificationsOpen(false)
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="min-h-screen bg-dad-warm">
      <nav className="bg-gradient-warm shadow-legacy relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-dad-blue-gray hover:text-dad-white p-2 rounded-lg transition-colors duration-300 mr-3"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Center - Hey Dad logo */}
            <div className="flex-1 flex justify-center md:justify-start">
              <Link to="/dashboard" className="text-2xl font-heading font-bold text-dad-white">
                Hey Dad
              </Link>
            </div>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 flex-1 justify-center">
              <Link
                to="/dashboard"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-dad-white bg-opacity-20 text-dad-white shadow-soft'
                    : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              
              <Link
                to="/videos"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/videos')
                    ? 'bg-dad-white bg-opacity-20 text-dad-white shadow-soft'
                    : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                }`}
              >
                <Video className="w-4 h-4 mr-2" />
                Memories
              </Link>
              
              <Link
                to="/children"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/children')
                    ? 'bg-dad-white bg-opacity-20 text-dad-white shadow-soft'
                    : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Children
              </Link>
              
              <Link
                to="/ideas"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/ideas')
                    ? 'bg-dad-accent text-white'
                    : 'text-dad-dark hover:bg-dad-warm'
                }`}
              >
                <Lightbulb className="w-5 h-5 mr-3" />
                Ideas
              </Link>
              
              <Link
                to="/settings"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/settings')
                    ? 'bg-dad-white bg-opacity-20 text-dad-white shadow-soft'
                    : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              
              <Link
                to="/about"
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/about')
                    ? 'bg-dad-white bg-opacity-20 text-dad-white shadow-soft'
                    : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                }`}
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-dad-blue-gray hover:text-dad-white hover:bg-dad-accent hover:bg-opacity-80 transition-all duration-300 ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>

            {/* Right side - Notifications */}
            <div className="flex items-center">
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-dad-blue-gray hover:text-dad-white rounded-lg transition-colors duration-300"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dad-accent text-dad-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 z-50">
              <div className="mx-4 mt-2 bg-dad-dark bg-opacity-95 backdrop-blur-sm border border-dad-white border-opacity-20 rounded-xl shadow-strong">
                <div className="px-4 py-3 space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive('/dashboard')
                        ? 'bg-dad-white bg-opacity-20 text-dad-white'
                        : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                    }`}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  
                  <Link
                    to="/videos"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive('/videos')
                        ? 'bg-dad-white bg-opacity-20 text-dad-white'
                        : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                    }`}
                  >
                    <Video className="w-5 h-5 mr-3" />
                    Memories
                  </Link>
                  
                  <Link
                    to="/children"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive('/children')
                        ? 'bg-dad-white bg-opacity-20 text-dad-white'
                        : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    Children
                  </Link>
                  
                  <Link
                    to="/ideas"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive('/ideas')
                        ? 'bg-dad-white bg-opacity-20 text-dad-white'
                        : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                    }`}
                  >
                    <Lightbulb className="w-5 h-5 mr-3" />
                    Ideas
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive('/settings')
                        ? 'bg-dad-white bg-opacity-20 text-dad-white'
                        : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </Link>
                  
                  <Link
                    to="/about"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isActive('/about')
                        ? 'bg-dad-white bg-opacity-20 text-dad-white'
                        : 'text-dad-blue-gray hover:text-dad-white hover:bg-dad-white hover:bg-opacity-10'
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
                    className="flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold text-dad-blue-gray hover:text-dad-white hover:bg-dad-accent hover:bg-opacity-80 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
            onClick={closeNotifications}
          ></div>
          
          {/* Modal */}
          <div className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)]">
            <div className="bg-dad-white rounded-2xl shadow-strong border border-dad-blue-gray">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dad-blue-gray">
                <h3 className="text-xl font-heading font-bold text-legacy">Notifications</h3>
                <button
                  onClick={closeNotifications}
                  className="text-dad-olive hover:text-dad-dark transition-colors duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dad-olive mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-dad-olive mx-auto mb-4 opacity-50" />
                    <p className="text-dad-olive font-medium">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-dad-blue-gray">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-dad-warm transition-colors duration-300 ${
                          notification.unread ? 'bg-dad-warm bg-opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.unread ? 'bg-dad-accent' : 'bg-dad-blue-gray'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-dad-dark text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-dad-olive text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-dad-blue-gray text-xs mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-dad-blue-gray">
                  <button 
                    onClick={markAllAsRead}
                    className="w-full text-center text-dad-olive hover:text-dad-dark font-medium text-sm transition-colors duration-300"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 
import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Bell, MessageCircle, Heart, Clock, CheckCircle, X, Reply, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [children, setChildren] = useState([])

  useEffect(() => {
    fetchNotifications()
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error fetching children:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mock notifications for now - in a real app, these would come from a notifications table
      const mockNotifications = [
        {
          id: 1,
          type: 'question',
          child_name: 'Emma',
          child_id: 1,
          message: "Dad, I'm nervous about my first day at high school tomorrow. Do you have any advice for me?",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          replied: false
        },
        {
          id: 2,
          type: 'request',
          child_name: 'Alex',
          child_id: 2,
          message: "Can you record a video about how to handle bullies? Some kids at school are being mean.",
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          read: true,
          replied: false
        },
        {
          id: 3,
          type: 'milestone',
          child_name: 'Emma',
          child_id: 1,
          message: "I got accepted to college! Can you unlock the graduation video you made for me?",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true,
          replied: true
        },
        {
          id: 4,
          type: 'question',
          child_name: 'Alex',
          child_id: 2,
          message: "Dad, what was your biggest mistake when you were my age? I feel like I messed up really bad.",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          read: false,
          replied: false
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const handleReply = async (notificationId) => {
    if (!replyMessage.trim()) return

    try {
      // In a real app, this would save the reply to the database
      console.log('Sending reply:', replyMessage, 'to notification:', notificationId)
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, replied: true, read: true } : notif
        )
      )
      
      setReplyingTo(null)
      setReplyMessage('')
      
      // Show success message (you could add a toast notification here)
      alert('Reply sent successfully!')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send reply. Please try again.')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'question':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'request':
        return <Bell className="w-5 h-5 text-orange-500" />
      case 'milestone':
        return <Heart className="w-5 h-5 text-pink-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'question':
        return 'Question'
      case 'request':
        return 'Video Request'
      case 'milestone':
        return 'Milestone'
      default:
        return 'Notification'
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

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'questions') return notif.type === 'question'
    if (filter === 'requests') return notif.type === 'request'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dad-olive"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dad-dark">Notifications</h1>
              <p className="mt-2 text-dad-olive">
                Messages and requests from your children
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <Bell className="w-8 h-8 text-dad-olive" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-dad-blue-gray">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'questions', label: 'Questions', count: notifications.filter(n => n.type === 'question').length },
                { id: 'requests', label: 'Requests', count: notifications.filter(n => n.type === 'request').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.id
                      ? 'border-dad-olive text-dad-olive'
                      : 'border-transparent text-dad-blue-gray hover:text-dad-dark hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-dad-blue-gray bg-opacity-20 text-dad-dark text-xs rounded-full px-2 py-1">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-dad-blue-gray mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dad-dark mb-2">No notifications</h3>
              <p className="text-dad-olive">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "Your children haven't sent any messages yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white border rounded-lg p-6 ${
                  !notification.read ? 'border-dad-olive border-l-4' : 'border-dad-blue-gray'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-dad-dark">
                          {notification.child_name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dad-blue-gray bg-opacity-20 text-dad-dark">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-dad-olive rounded-full"></span>
                        )}
                      </div>
                      <p className="text-dad-olive mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-dad-blue-gray">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {notification.replied && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-dad-olive hover:text-dad-dark"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {!notification.replied && (
                      <button
                        onClick={() => setReplyingTo(notification.id)}
                        className="flex items-center px-3 py-1 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#95BB90' }}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === notification.id && (
                  <div className="mt-4 pt-4 border-t border-dad-blue-gray">
                    <div className="space-y-3">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full p-3 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent resize-none"
                        rows="3"
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyMessage('')
                          }}
                          className="px-4 py-2 text-dad-blue-gray hover:text-dad-dark"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(notification.id)}
                          disabled={!replyMessage.trim()}
                          className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: '#95BB90' }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 p-4 bg-dad-blue-gray bg-opacity-10 rounded-lg">
            <h3 className="text-lg font-medium text-dad-dark mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                }}
                className="flex items-center px-3 py-2 text-sm bg-white border border-dad-blue-gray rounded-md hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark All as Read
              </button>
              <button
                onClick={() => window.location.href = '/create-video'}
                className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#95BB90' }}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Create Response Video
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Notifications 
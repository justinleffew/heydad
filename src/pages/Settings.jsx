import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Settings, User, Bell, Shield, Database, Save, Eye, EyeOff } from 'lucide-react'

const SettingsPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    phone: ''
  })
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    child_requests: true,
    video_reminders: true
  })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      loadUserProfile()
      loadUserSettings()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      // First set the email from the auth user
      const userEmail = user?.email || ''
      const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile({
          email: userEmail,
          full_name: data.full_name || userName,
          phone: data.phone || ''
        })
      } else {
        // If no profile exists, create one with the auth user data
        setProfile({
          email: userEmail,
          full_name: userName,
          phone: ''
        })
        
        // Optionally create the profile record
        if (userName) {
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: userName,
              phone: '',
              updated_at: new Date().toISOString()
            })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback to auth user data
      setProfile({
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        phone: ''
      })
    }
  }

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setNotifications({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          child_requests: data.child_requests ?? true,
          video_reminders: data.video_reminders ?? true
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveProfile = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Error updating profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...notifications,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error saving settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match.')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowChangePassword(false)
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage('Error changing password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dad-dark">Settings</h1>
          <p className="mt-2 text-dad-olive">
            Manage your account, notifications, and privacy preferences.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-xl font-semibold text-dad-dark">Profile Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dad-dark mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-dad-blue-gray rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-dad-olive mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dad-dark mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dad-dark mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <button
                onClick={saveProfile}
                disabled={loading}
                className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#95BB90' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-xl font-semibold text-dad-dark">Security</h2>
            </div>
            
            {!showChangePassword ? (
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#95BB90' }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dad-dark mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dad-dark mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={changePassword}
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#95BB90' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowChangePassword(false)
                      setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''})
                    }}
                    className="px-4 py-2 border border-dad-blue-gray text-dad-dark rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-xl font-semibold text-dad-dark">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-dad-dark">Email Notifications</h3>
                  <p className="text-xs text-dad-olive">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email_notifications}
                    onChange={(e) => setNotifications({...notifications, email_notifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-dad-dark">Child Requests</h3>
                  <p className="text-xs text-dad-olive">Get notified when your children send requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.child_requests}
                    onChange={(e) => setNotifications({...notifications, child_requests: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-dad-dark">Video Reminders</h3>
                  <p className="text-xs text-dad-olive">Reminders to create new legacy videos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.video_reminders}
                    onChange={(e) => setNotifications({...notifications, video_reminders: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-xl font-semibold text-dad-dark">Data Management</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 mb-2">Delete Account</h3>
                <p className="text-xs text-red-700 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                  Note: You must maintain an active subscription to access your videos.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center px-6 py-3 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#95BB90' }}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SettingsPage 
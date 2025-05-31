import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Settings, User, Bell, Shield, Database, Save, Eye, EyeOff, Video, X } from 'lucide-react'

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
  const [passwordError, setPasswordError] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [fieldErrors, setFieldErrors] = useState({})

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
          phone: data.phone || ''
        })
        // Split the full name into first and last name
        const nameParts = (data.full_name || userName).split(' ')
        setFirstName(nameParts[0] || '')
        setLastName(nameParts.slice(1).join(' ') || '')
      } else {
        // If no profile exists, create one with the auth user data
        setProfile({
          email: userEmail,
          phone: ''
        })
        
        // Split the name from auth metadata
        const nameParts = userName.split(' ')
        setFirstName(nameParts[0] || '')
        setLastName(nameParts.slice(1).join(' ') || '')
        
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
        phone: ''
      })
      const nameParts = (user?.user_metadata?.full_name || user?.user_metadata?.name || '').split(' ')
      setFirstName(nameParts[0] || '')
      setLastName(nameParts.slice(1).join(' ') || '')
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
      const fullName = `${firstName} ${lastName}`.trim()
      
      // Update the user's metadata with the new name
      const { data: userData, error: updateUserError } = await supabase.auth.updateUser({
        data: { first_name: firstName, full_name: fullName }
      })

      if (updateUserError) {
        console.error('Error updating user metadata:', updateUserError)
        throw updateUserError
      }

      // Update the profile in the database
      const { data: profileData, error: updateProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })
        .select()

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError)
        throw updateProfileError
      }

      // If we get here, both updates were successful
      setMessage('Profile updated successfully!')
      
      // Refresh the profile data
      await loadUserProfile()
    } catch (error) {
      console.error('Error in saveProfile:', error)
      // Only show error message if we haven't already shown a success message
      if (!message.includes('successfully')) {
        setMessage('Error updating profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    return phoneRegex.test(phone)
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setProfile({...profile, phone: formatted})
    if (formatted && !validatePhone(formatted)) {
      setFieldErrors({...fieldErrors, phone: 'Please enter a valid phone number'})
    } else {
      setFieldErrors({...fieldErrors, phone: ''})
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Validate phone number
      if (profile.phone && !validatePhone(profile.phone)) {
        setFieldErrors({...fieldErrors, phone: 'Please enter a valid phone number'})
        return
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...notifications,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setToast({
        show: true,
        message: 'Settings saved successfully',
        type: 'success'
      })
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setToast({
        show: true,
        message: 'Error saving settings. Please try again.',
        type: 'error'
      })
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

  // Add phone number formatting function
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '')
    if (phoneNumber.length === 0) return ''
    if (phoneNumber.length <= 3) return `(${phoneNumber}`
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-[#A3C187] text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Sticky Header with Save Button */}
        <div className="sticky top-0 z-10 bg-white border-b border-dad-blue-gray py-4 mb-8">
          <div className="settings-header flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-semibold text-[#2B2B3F]">Settings</h1>
              <p className="mt-2 text-[#2B2B3F] opacity-80">
                Manage your account, notifications, and privacy preferences.
              </p>
            </div>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center h-12 px-4 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#A3C187] focus:ring-offset-2"
              style={{ backgroundColor: '#7AA356' }}
              aria-label="Save all settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
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

        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-[20px] font-medium text-[#2B2B3F]">Profile Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 px-4 border border-dad-olive rounded-lg focus:ring-2 focus:ring-[#A3C187] focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-10 px-4 border border-dad-olive rounded-lg focus:ring-2 focus:ring-[#A3C187] focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full h-10 px-4 border border-dad-blue-gray rounded-md bg-[#E0E0E0] text-[#909090]"
                />
                <p className="text-xs text-[#909090] mt-1">
                  Contact support if you need to change your email
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={handlePhoneChange}
                  className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-[#A3C187] focus:border-transparent ${
                    fieldErrors.phone ? 'border-red-500' : 'border-dad-blue-gray'
                  }`}
                  placeholder="(xxx) xxx-xxxx"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-[20px] font-medium text-[#2B2B3F]">Security</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full h-10 px-4 border border-dad-blue-gray rounded-lg focus:ring-2 focus:ring-[#A3C187] focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, newPassword: e.target.value})
                    if (e.target.value !== passwordData.confirmPassword) {
                      setPasswordError('Passwords do not match')
                    } else {
                      setPasswordError('')
                    }
                  }}
                  className="w-full h-10 px-4 border border-dad-blue-gray rounded-lg focus:ring-2 focus:ring-[#A3C187] focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2B2B3F] opacity-80 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, confirmPassword: e.target.value})
                    if (e.target.value !== passwordData.newPassword) {
                      setPasswordError('Passwords do not match')
                    } else {
                      setPasswordError('')
                    }
                  }}
                  className="w-full h-10 px-4 border border-dad-blue-gray rounded-lg focus:ring-2 focus:ring-[#A3C187] focus:border-transparent"
                  placeholder="Confirm new password"
                />
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={changePassword}
                  disabled={loading || !!passwordError}
                  className="flex items-center h-10 px-4 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#A3C187] focus:ring-offset-2"
                  style={{ backgroundColor: '#7AA356' }}
                  aria-label="Change password"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Changing...' : 'Save Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Bell className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-[20px] font-medium text-[#2B2B3F]">Notification Preferences</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-[#2B2B3F] opacity-70 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2B3F] opacity-80">Email Notifications</h3>
                    <p className="text-xs text-[#909090]">Receive updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email_notifications}
                    onChange={(e) => setNotifications({...notifications, email_notifications: e.target.checked})}
                    className="sr-only peer"
                    aria-label="Enable email notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A3C187]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7AA356]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-[#2B2B3F] opacity-70 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2B3F] opacity-80">Child Requests</h3>
                    <p className="text-xs text-[#909090]">Get notified when your children send requests</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.child_requests}
                    onChange={(e) => setNotifications({...notifications, child_requests: e.target.checked})}
                    className="sr-only peer"
                    aria-label="Enable child request notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A3C187]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7AA356]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center">
                  <Video className="w-4 h-4 text-[#2B2B3F] opacity-70 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2B3F] opacity-80">Video Reminders</h3>
                    <p className="text-xs text-[#909090]">Reminders to create new legacy videos</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.video_reminders}
                    onChange={(e) => setNotifications({...notifications, video_reminders: e.target.checked})}
                    className="sr-only peer"
                    aria-label="Enable video reminder notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A3C187]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7AA356]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Database className="w-5 h-5 text-dad-olive mr-2" />
              <h2 className="text-[20px] font-medium text-[#2B2B3F]">Data Management</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#FFF0F0] border border-red-200 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 mb-2">Delete Account</h3>
                <p className="text-xs text-red-700 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      aria-label="Confirm account deletion"
                    />
                    <span className="text-sm text-red-700">
                      I understand that this action cannot be undone
                    </span>
                  </label>
                  <button
                    disabled={!confirmDelete}
                    className="h-10 px-4 bg-[#D9534F] text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Delete account"
                  >
                    Delete Account
                  </button>
                  <p className="text-xs text-[#909090] mt-2">
                    You must maintain an active subscription to access your videos.<br />
                    Cancelling membership will lock existing memories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SettingsPage 
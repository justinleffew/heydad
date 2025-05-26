import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Plus, Video, Calendar, Clock, Users, Share } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [childImageUrls, setChildImageUrls] = useState({})
  const [thumbnailUrls, setThumbnailUrls] = useState({})

  useEffect(() => {
    if (user) {
      fetchChildren()
      fetchVideos()
    }
  }, [user])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      const childrenData = data || []
      setChildren(childrenData)
      
      // Load images for children that have image_path
      if (childrenData.length > 0) {
        loadChildImages(childrenData)
      }
    } catch (error) {
      console.error('Error fetching children:', error)
    }
  }

  const loadChildImages = async (childrenList) => {
    const imagePromises = childrenList.map(async (child) => {
      if (child.image_path) {
        try {
          const { data, error } = await supabase.storage
            .from('child-images')
            .createSignedUrl(child.image_path, 3600) // 1 hour expiry

          if (!error && data) {
            return { id: child.id, url: data.signedUrl }
          }
        } catch (error) {
          console.error('Error loading child image:', error)
        }
      }
      return { id: child.id, url: null }
    })

    const imageResults = await Promise.all(imagePromises)
    const imageMap = {}
    imageResults.forEach(result => {
      imageMap[result.id] = result.url
    })
    setChildImageUrls(imageMap)
  }

  const loadThumbnails = async (videoList) => {
    const thumbnailPromises = videoList.map(async (video) => {
      if (video.thumbnail_path) {
        try {
          const { data, error } = await supabase.storage
            .from('videos')
            .createSignedUrl(video.thumbnail_path, 3600) // 1 hour expiry

          if (!error && data) {
            return { id: video.id, url: data.signedUrl }
          }
        } catch (error) {
          console.error('Error loading thumbnail:', error)
        }
      }
      return { id: video.id, url: null }
    })

    const imageResults = await Promise.all(thumbnailPromises)
    const imageMap = {}
    imageResults.forEach(result => {
      imageMap[result.id] = result.url
    })
    setThumbnailUrls(imageMap)
  }

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_children (
            children (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const videosData = data || []
      setVideos(videosData)
      
      // Load thumbnails for all videos
      if (videosData.length > 0) {
        loadThumbnails(videosData)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthdate) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getUnlockStatus = (video) => {
    if (video.unlock_type === 'age') {
      return `Unlocks at age ${video.unlock_age}`
    } else if (video.unlock_type === 'date') {
      const unlockDate = new Date(video.unlock_date)
      return `Unlocks on ${unlockDate.toLocaleDateString()}`
    } else if (video.unlock_type === 'milestone') {
      return `Unlocks at: ${video.unlock_milestone}`
    }
    return 'Unlocked'
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-dad-dark text-lg">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dad-dark">Welcome back, Dad.</h1>
          <p className="mt-2 text-dad-olive">
            Continue building your legacy for the next generation.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/record"
              className="bg-dad-dark text-white p-6 rounded-lg hover:bg-dad-olive transition-colors"
            >
              <div className="flex items-center">
                <Video className="w-8 h-8 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">Record Legacy</h3>
                  <p className="text-dad-blue-gray">Create a new video message</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Children Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dad-dark mb-4">Your Children</h2>
          {children.length === 0 ? (
            <div className="bg-dad-blue-gray bg-opacity-20 p-8 rounded-lg text-center">
              <Users className="w-12 h-12 text-dad-olive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dad-dark mb-2">No children added yet</h3>
              <p className="text-dad-olive">
                Add your first child using the "Add Child" option in the menu to start creating legacy videos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div key={child.id} className="bg-white border border-dad-blue-gray rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {child.image_path ? (
                        <img
                          src={childImageUrls[child.id] || child.imageUrl}
                          alt={child.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-dad-blue-gray"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-dad-blue-gray bg-opacity-20 flex items-center justify-center">
                          <Users className="w-8 h-8 text-dad-olive" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-dad-dark">{child.name}</h3>
                      <p className="text-dad-olive">Age: {calculateAge(child.birthdate)}</p>
                      <p className="text-sm text-dad-olive">
                        Born: {new Date(child.birthdate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Videos */}
        <div>
          <h2 className="text-2xl font-bold text-dad-dark mb-4">Your Legacy Videos</h2>
          {videos.length === 0 ? (
            <div className="bg-dad-blue-gray bg-opacity-20 p-8 rounded-lg text-center">
              <Video className="w-12 h-12 text-dad-olive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dad-dark mb-2">No videos created yet</h3>
              <p className="text-dad-olive mb-4">
                Start recording your first legacy video for your children
              </p>
              <Link
                to="/record"
                className="inline-flex items-center px-4 py-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive"
              >
                <Video className="w-4 h-4 mr-2" />
                Record Your First Legacy
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.slice(0, 5).map((video) => (
                <div key={video.id} className="bg-white border border-dad-blue-gray rounded-lg p-4">
                  {/* Mobile Layout (stacked) */}
                  <div className="block md:hidden">
                    <div className="flex gap-3 mb-3">
                      {/* Video Thumbnail */}
                      <div className="flex-shrink-0">
                        {thumbnailUrls[video.id] ? (
                          <img
                            src={thumbnailUrls[video.id]}
                            alt={video.title}
                            className="w-20 h-14 object-cover rounded-lg bg-dad-dark"
                          />
                        ) : (
                          <div className="w-20 h-14 bg-dad-dark rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5 text-dad-blue-gray" />
                          </div>
                        )}
                      </div>
                      
                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-dad-dark truncate">{video.title}</h3>
                        <p className="text-dad-olive text-sm mb-1 truncate">
                          For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                        </p>
                        <div className="flex flex-col text-xs text-dad-olive space-y-1">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getUnlockStatus(video)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Full Width on Mobile */}
                    <div className="flex gap-2">
                      <Link
                        to="/videos"
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#95BB90' }}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                      
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                        title="Coming soon - Share with Mom"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Share with Mom
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout (horizontal) */}
                  <div className="hidden md:flex gap-4 items-start">
                    {/* Video Thumbnail */}
                    <div className="flex-shrink-0">
                      {thumbnailUrls[video.id] ? (
                        <img
                          src={thumbnailUrls[video.id]}
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded-lg bg-dad-dark"
                        />
                      ) : (
                        <div className="w-24 h-16 bg-dad-dark rounded-lg flex items-center justify-center">
                          <Video className="w-6 h-6 text-dad-blue-gray" />
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-dad-dark">{video.title}</h3>
                      <p className="text-dad-olive text-sm mb-2">
                        For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                      </p>
                      <div className="flex items-center text-sm text-dad-olive space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {getUnlockStatus(video)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex space-x-2">
                      <Link
                        to="/videos"
                        className="flex items-center px-3 py-1 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#95BB90' }}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                      
                      <button
                        disabled
                        className="flex items-center px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                        title="Coming soon - Share with Mom"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Share with Mom
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {videos.length > 5 && (
                <div className="text-center">
                  <Link
                    to="/videos"
                    className="text-dad-dark hover:text-dad-olive font-medium"
                  >
                    View all {videos.length} videos →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard 
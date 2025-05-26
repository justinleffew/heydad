import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Video, Calendar, Clock, Users, Play, Lock, Unlock, Share } from 'lucide-react'

const Videos = () => {
  const [videos, setVideos] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrls, setThumbnailUrls] = useState({})
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchVideos()
      fetchChildren()
    }
  }, [user])

  const fetchChildren = async () => {
    try {
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

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          video_children (
            children (
              id,
              name,
              birthdate
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(data || [])
      
      // Load thumbnails for all videos
      if (data && data.length > 0) {
        loadThumbnails(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
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

    const thumbnailResults = await Promise.all(thumbnailPromises)
    const thumbnailMap = {}
    thumbnailResults.forEach(result => {
      thumbnailMap[result.id] = result.url
    })
    setThumbnailUrls(thumbnailMap)
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
    if (video.unlock_type === 'now') {
      return {
        isUnlocked: true,
        description: 'Available now',
        details: 'Unlocked'
      }
    } else if (video.unlock_type === 'age') {
      // Check if any assigned child has reached the unlock age
      const unlockedForAnyChild = video.video_children?.some(vc => {
        const childAge = calculateAge(vc.children.birthdate)
        return childAge >= video.unlock_age
      })
      
      return {
        isUnlocked: unlockedForAnyChild,
        description: `Unlocks at age ${video.unlock_age}`,
        details: video.video_children?.map(vc => {
          const childAge = calculateAge(vc.children.birthdate)
          const isUnlocked = childAge >= video.unlock_age
          return `${vc.children.name}: ${isUnlocked ? 'Unlocked' : `Age ${childAge}/${video.unlock_age}`}`
        }).join(', ')
      }
    } else if (video.unlock_type === 'date') {
      const unlockDate = new Date(video.unlock_date)
      const today = new Date()
      const isUnlocked = today >= unlockDate
      
      return {
        isUnlocked,
        description: `Unlocks on ${unlockDate.toLocaleDateString()}`,
        details: isUnlocked ? 'Unlocked' : `Unlocks in ${Math.ceil((unlockDate - today) / (1000 * 60 * 60 * 24))} days`
      }
    } else if (video.unlock_type === 'milestone') {
      return {
        isUnlocked: false, // Milestones are manually triggered for now
        description: `Unlocks at: ${video.unlock_milestone}`,
        details: 'Manual unlock required'
      }
    }
    
    return {
      isUnlocked: true,
      description: 'Unlocked',
      details: 'Available now'
    }
  }

  const handlePlayVideo = async (video) => {
    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(video.file_path, 3600) // 1 hour expiry

      if (error) throw error
      
      setVideoUrl(data.signedUrl)
      setSelectedVideo(video)
    } catch (error) {
      console.error('Error getting video URL:', error)
    }
  }

  const closeVideoModal = () => {
    setSelectedVideo(null)
    setVideoUrl('')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-dad-dark text-lg">Loading videos...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dad-dark">Your Legacy Videos</h1>
          <p className="mt-2 text-dad-olive">
            All the video messages you've created for your children.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="bg-dad-blue-gray bg-opacity-20 p-8 rounded-lg text-center">
            <Video className="w-12 h-12 text-dad-olive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dad-dark mb-2">No videos created yet</h3>
            <p className="text-dad-olive mb-4">
              Start recording your first legacy video for your children
            </p>
            <a
              href="/record"
              className="inline-flex items-center px-4 py-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive"
            >
              <Video className="w-4 h-4 mr-2" />
              Record Your First Legacy
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => {
              const unlockStatus = getUnlockStatus(video)
              
              return (
                <div key={video.id} className="bg-white border border-dad-blue-gray rounded-lg p-6">
                  {/* Mobile Layout (stacked) */}
                  <div className="block md:hidden">
                    <div className="flex gap-3 mb-4">
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-dad-dark mb-2 truncate">{video.title}</h3>
                        
                        <div className="flex flex-col text-sm text-dad-olive space-y-1 mb-2">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                          
                          <span className="flex items-center truncate">
                            <Users className="w-3 h-3 mr-1" />
                            For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {unlockStatus.isUnlocked ? (
                            <Unlock className="w-3 h-3 text-green-600" />
                          ) : (
                            <Lock className="w-3 h-3 text-dad-olive" />
                          )}
                          <span className={`text-xs ${unlockStatus.isUnlocked ? 'text-green-600' : 'text-dad-olive'} truncate`}>
                            {unlockStatus.description}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Full Width on Mobile */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePlayVideo(video)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#95BB90' }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Watch
                      </button>
                      
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
                  <div className="hidden md:flex gap-4 mb-4">
                    {/* Video Thumbnail */}
                    <div className="flex-shrink-0">
                      {thumbnailUrls[video.id] ? (
                        <img
                          src={thumbnailUrls[video.id]}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg bg-dad-dark"
                        />
                      ) : (
                        <div className="w-32 h-20 bg-dad-dark rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 text-dad-blue-gray" />
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dad-dark mb-2">{video.title}</h3>
                      
                      <div className="flex items-center text-sm text-dad-olive space-x-4 mb-2">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Created {new Date(video.created_at).toLocaleDateString()}
                        </span>
                        
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {unlockStatus.isUnlocked ? (
                          <Unlock className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-dad-olive" />
                        )}
                        <span className={`text-sm ${unlockStatus.isUnlocked ? 'text-green-600' : 'text-dad-olive'}`}>
                          {unlockStatus.description}
                        </span>
                      </div>
                      
                      {unlockStatus.details && (
                        <p className="text-xs text-dad-olive mt-1">{unlockStatus.details}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex flex-col space-y-2">
                      <button
                        onClick={() => handlePlayVideo(video)}
                        className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#95BB90' }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch
                      </button>
                      
                      <button
                        disabled
                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                        title="Coming soon - Share with Mom"
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share with Mom
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && videoUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
              <div className="p-4 border-b border-dad-blue-gray flex justify-between items-center">
                <h3 className="text-lg font-semibold text-dad-dark">{selectedVideo.title}</h3>
                <button
                  onClick={closeVideoModal}
                  className="text-dad-olive hover:text-dad-dark text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-h-96 rounded"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
                
                <div className="mt-4 text-sm text-dad-olive">
                  <p>Created: {new Date(selectedVideo.created_at).toLocaleDateString()}</p>
                  <p>For: {selectedVideo.video_children?.map(vc => vc.children.name).join(', ')}</p>
                  <p>Unlock: {getUnlockStatus(selectedVideo).description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Videos 
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Video, Calendar, Clock, Users, Play, Lock, Unlock, Share, AlertCircle, CheckCircle2, Filter, ChevronDown, Sparkles, Gift, Camera, User } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'

const Videos = () => {
  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [thumbnailUrls, setThumbnailUrls] = useState({})
  const { user } = useAuth()

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'unlocked', 'locked'
  const [childFilter, setChildFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'upcoming'

  const [showAIDadModal, setShowAIDadModal] = useState(false)

  // Add state for upcoming unlocks
  const [upcomingUnlocks, setUpcomingUnlocks] = useState([])

  useEffect(() => {
    if (user) {
      fetchVideos()
      fetchChildren()
    }
  }, [user])

  useEffect(() => {
    if (videos.length > 0) {
      let filtered = [...videos]

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(video => {
          const status = getUnlockStatus(video)
          return statusFilter === 'unlocked' ? status.isUnlocked : !status.isUnlocked
        })
      }

      // Apply child filter
      if (childFilter !== 'all') {
        filtered = filtered.filter(video => 
          video.video_children?.some(vc => vc.children.id === childFilter)
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at)
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at)
        } else if (sortBy === 'upcoming') {
          const aStatus = getUnlockStatus(a)
          const bStatus = getUnlockStatus(b)
          if (!aStatus.isUnlocked && !bStatus.isUnlocked) {
            // Sort by unlock date if both are locked
            return new Date(a.unlock_date || 0) - new Date(b.unlock_date || 0)
          }
          return aStatus.isUnlocked ? 1 : -1
        }
        return 0
      })

      setFilteredVideos(filtered)
    }
  }, [videos, statusFilter, childFilter, sortBy])

  useEffect(() => {
    if (videos.length > 0) {
      // Calculate upcoming unlocks
      const upcoming = videos
        .filter(video => {
          const status = getUnlockStatus(video)
          return !status.isUnlocked && video.unlock_type === 'date'
        })
        .sort((a, b) => new Date(a.unlock_date) - new Date(b.unlock_date))
        .slice(0, 2)

      setUpcomingUnlocks(upcoming)
    }
  }, [videos])

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

  const getProcessingStatus = (video) => {
    if (video.processing_status === 'completed') {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
        text: 'Processing complete',
        color: 'text-green-600'
      }
    } else if (video.processing_status === 'processing') {
      return {
        icon: <Clock className="w-4 h-4 text-dad-olive animate-spin" />,
        text: `Processing: ${video.processing_progress}%`,
        color: 'text-dad-olive'
      }
    } else if (video.processing_status === 'failed') {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-600" />,
        text: 'Processing failed',
        color: 'text-red-600'
      }
    }
    return null
  }

  const handlePlayVideo = async (video) => {
    try {
      const { data: { signedUrl }, error } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(video.file_path, 3600) // URL valid for 1 hour

      if (error) throw error

      setSelectedVideo(video)
      setVideoUrl(signedUrl)
    } catch (error) {
      console.error('Error getting signed URL:', error)
      alert('Error playing video. Please try again.')
    }
  }

  const handleCloseVideo = () => {
    setSelectedVideo(null)
    setVideoUrl(null)
  }

  // Add AI Dad progress calculation
  const calculateAIDadProgress = () => {
    const totalMinutesRequired = 600 // 10 hours
    const estimatedMinutesPerVideo = 2
    const totalMinutesRecorded = videos.length * estimatedMinutesPerVideo
    return Math.min((totalMinutesRecorded / totalMinutesRequired) * 100, 100)
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
          <div>
            <h1 className="text-3xl font-bold text-dad-dark">Your Memories</h1>
            <p className="mt-2 text-dad-olive">
              All the memories you've created for your children.
            </p>
          </div>
        </div>

        {/* Upcoming Unlocks Section */}
        {upcomingUnlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-dad-dark mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-dad-olive" />
              Upcoming Unlocks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingUnlocks.map((video) => {
                const unlockDate = new Date(video.unlock_date)
                const today = new Date()
                const daysUntilUnlock = Math.ceil((unlockDate - today) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={video.id} className="bg-white border border-dad-blue-gray rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-dad-dark">{video.title}</h3>
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3" />
                        <span>Unlocks in {daysUntilUnlock} days</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-dad-olive">
                      <Calendar className="w-3 h-3 mr-1" />
                      {unlockDate.toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter and Sort Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-soft border border-dad-blue-gray">
            <Filter className="w-4 h-4 text-dad-olive" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-dad-olive rounded-lg hover:bg-dad-warm transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-soft border border-dad-blue-gray">
            <Users className="w-4 h-4 text-dad-olive" />
            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="bg-transparent border-none px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-dad-olive rounded-lg hover:bg-dad-warm transition-all duration-300"
            >
              <option value="all">All Children</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-soft border border-dad-blue-gray">
            <ChevronDown className="w-4 h-4 text-dad-olive" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-dad-olive rounded-lg hover:bg-dad-warm transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upcoming">Upcoming Unlocks</option>
            </select>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="bg-dad-blue-gray bg-opacity-20 p-8 rounded-lg text-center">
            <Video className="w-12 h-12 text-dad-olive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dad-dark mb-2">No memories created yet</h3>
            <p className="text-dad-olive mb-4">
              Start recording your first memory for your children
            </p>
            <a
              href="/record"
              className="inline-flex items-center px-4 py-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive"
            >
              <Video className="w-4 h-4 mr-2" />
              Record Your First Memory
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVideos.map((video) => {
              const unlockStatus = getUnlockStatus(video)
              const processingStatus = getProcessingStatus(video)
              
              return (
                <div 
                  key={video.id} 
                  className={`bg-white border border-dad-blue-gray rounded-lg p-6 transition-all duration-300 ${
                    !unlockStatus.isUnlocked ? 'opacity-50' : ''
                  }`}
                >
                  {/* Mobile Layout (stacked) */}
                  <div className="block md:hidden">
                    <div 
                      className="flex gap-3 mb-4 cursor-pointer"
                      onClick={() => unlockStatus.isUnlocked && handlePlayVideo(video)}
                    >
                      {/* Video Thumbnail */}
                      <div className="flex-shrink-0 relative">
                        <div className="w-24 h-16 bg-dad-dark rounded-lg overflow-hidden">
                          {thumbnailUrls[video.id] ? (
                            <img
                              src={thumbnailUrls[video.id]}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 text-dad-blue-gray" />
                            </div>
                          )}
                        </div>
                        {unlockStatus.isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-dad-dark truncate">{video.title}</h3>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                            unlockStatus.isUnlocked 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {unlockStatus.isUnlocked ? (
                              <Unlock className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                            <span>{unlockStatus.description}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col text-sm text-dad-olive space-y-1 mb-2">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                          
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {video.duration || '0:00'}
                          </span>
                          
                          <span className="flex items-center truncate">
                            <Users className="w-3 h-3 mr-1" />
                            For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout (grid) */}
                  <div 
                    className="hidden md:grid grid-cols-12 gap-6 cursor-pointer"
                    onClick={() => unlockStatus.isUnlocked && handlePlayVideo(video)}
                  >
                    {/* Video Thumbnail */}
                    <div className="col-span-3 relative">
                      <div className="w-full h-32 bg-dad-dark rounded-lg overflow-hidden">
                        {thumbnailUrls[video.id] ? (
                          <img
                            src={thumbnailUrls[video.id]}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-dad-blue-gray" />
                          </div>
                        )}
                      </div>
                      {unlockStatus.isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="col-span-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-dad-dark">{video.title}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                          unlockStatus.isUnlocked 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {unlockStatus.isUnlocked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          <span>{unlockStatus.description}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col text-sm text-dad-olive space-y-1 mb-2">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                        
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {video.duration || '0:00'}
                        </span>
                        
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex flex-col items-end justify-between">
                      {processingStatus && (
                        <div className={`flex items-center space-x-2 ${processingStatus.color}`}>
                          {processingStatus.icon}
                          <span className="text-sm">{processingStatus.text}</span>
                        </div>
                      )}
                      
                      <div className={`inline-flex items-center px-4 py-2 rounded-md transition-all duration-300 ${
                        unlockStatus.isUnlocked
                          ? 'bg-dad-dark text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Play className="w-4 h-4 mr-2" />
                        {unlockStatus.isUnlocked ? 'Play Memory' : 'Locked'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Dad Progress Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-dad-blue-gray p-4">
        <button
          onClick={() => setShowAIDadModal(true)}
          className="w-full flex items-center justify-between px-6 py-3 bg-dad-dark text-white rounded-xl hover:bg-dad-olive transition-all duration-300"
        >
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-3" />
            <div>
              <div className="text-sm font-medium">AI Dad Progress</div>
              <div className="text-lg font-bold">{Math.round(calculateAIDadProgress())}%</div>
            </div>
          </div>
          <div className="w-32 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-dad-olive to-dad-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateAIDadProgress()}%` }}
            />
          </div>
        </button>
      </div>

      {/* AI Dad Modal */}
      {showAIDadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dad-dark">AI Dad Labs</h2>
              <button
                onClick={() => setShowAIDadModal(false)}
                className="text-dad-olive hover:text-dad-dark"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="prose prose-dad max-w-none">
              <p className="text-dad-olive">
                AI Dad is an experimental feature that aims to create a digital version of your parenting style and memories. As you record more videos, your personal AI learns from your content to create meaningful interactions for your children in the future regardless of where you are.
              </p>
              <p className="text-dad-olive mt-2">
                Creepy? Maybe. Cool? Definitely. 100% opt-in once it's built.
              </p>
              <div className="mt-4 p-4 bg-dad-blue-gray bg-opacity-20 rounded-lg">
                <h3 className="text-lg font-semibold text-dad-dark mb-2">Current Progress</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-sm text-dad-olive mb-1">Total Minutes Recorded</div>
                    <div className="text-2xl font-bold text-dad-dark">
                      {Math.round(videos.length * 2)} / 600 minutes
                    </div>
                  </div>
                  <div className="w-32 bg-white rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-dad-olive to-dad-gold h-2 rounded-full"
                      style={{ width: `${calculateAIDadProgress()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && videoUrl && (
        <VideoPlayer
          videoUrl={videoUrl}
          onClose={handleCloseVideo}
        />
      )}
    </Layout>
  )
}

export default Videos
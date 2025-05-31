import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Video, Calendar, Clock, Users, Play, Lock, Unlock, Share, AlertCircle, CheckCircle2, Filter, ChevronDown, ChevronUp, Sparkles, Gift, Camera, User, Search, Plus } from 'lucide-react'
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
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'unlock_earliest', 'unlock_latest'

  const [showAIDadModal, setShowAIDadModal] = useState(false)

  // Add state for upcoming unlocks
  const [upcomingUnlocks, setUpcomingUnlocks] = useState([])

  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching data...')
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
        } else if (sortBy === 'unlock_earliest') {
          return new Date(a.unlock_date || 0) - new Date(b.unlock_date || 0)
        } else if (sortBy === 'unlock_latest') {
          return new Date(b.unlock_date || 0) - new Date(a.unlock_date || 0)
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
      console.log('Fetching children for user:', user.id)
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching children:', error)
        throw error
      }
      
      console.log('Fetched children data:', data)
      setChildren(data || [])
    } catch (error) {
      console.error('Error in fetchChildren:', error)
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
        icon: <Clock className="w-4 h-4 text-[#f67865] animate-spin" />,
        text: `Processing: ${video.processing_progress}%`,
        color: 'text-[#f67865]'
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

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const cycleStatusFilter = () => {
    const statuses = ['all', 'unlocked', 'locked']
    const currentIndex = statuses.indexOf(statusFilter)
    const nextIndex = (currentIndex + 1) % statuses.length
    setStatusFilter(statuses[nextIndex])
  }

  const getStatusIcon = () => {
    switch (statusFilter) {
      case 'unlocked':
        return <Unlock className="w-4 h-4" />
      case 'locked':
        return <Lock className="w-4 h-4" />
      default:
        return <Video className="w-4 h-4" />
    }
  }

  const getStatusTooltip = () => {
    switch (statusFilter) {
      case 'unlocked':
        return 'Show Available Only'
      case 'locked':
        return 'Show Locked Only'
      default:
        return 'Show All'
    }
  }

  // Calculate unlock progress
  const getUnlockProgress = () => {
    const total = videos.length
    const unlocked = videos.filter(v => getUnlockStatus(v).isUnlocked).length
    return { unlocked, total }
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
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[30px] font-bold text-dad-dark opacity-90">Your Memories</h1>
              <p className="mt-2 text-[#f67865] opacity-60 leading-tight">
                All the memories you've created for your children.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Desktop: Search & Filter Button */}
              <div className="hidden sm:flex items-center space-x-6">
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="flex items-center px-6 h-10 rounded-lg text-sm font-medium bg-dad-dark text-white hover:bg-[#3A4F6A] transition-all duration-300"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search & Filter
                </button>

                {/* Capture Moment Button */}
                <a
                  href="/record"
                  className="flex items-center px-6 h-10 rounded-lg text-sm font-medium bg-[#f67865] text-white hover:bg-[#ff8a77] transition-all duration-300"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture a Moment
                </a>
              </div>

              {/* Mobile: Combined Search & Filter */}
              <div className="sm:hidden flex flex-col space-y-2">
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="flex items-center px-6 h-10 rounded-lg text-sm font-medium bg-dad-dark text-white hover:bg-[#3A4F6A] transition-all duration-300"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search & Filter
                </button>
                <a
                  href="/record"
                  className="flex items-center px-6 h-10 rounded-lg text-sm font-medium bg-[#f67865] text-white hover:bg-[#ff8a77] transition-all duration-300"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture a Moment
                </a>
              </div>
            </div>
          </div>
          <div className="h-px bg-gray-200 mt-4" />
        </div>

        {/* Mobile Search & Filter Sheet */}
        {showMobileSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden">
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-dad-dark">Search & Filter</h2>
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="text-dad-olive hover:text-dad-dark"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full mb-4">
                <input
                  type="text"
                  placeholder="Search memories..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm border border-dad-blue-gray focus:outline-none focus:ring-2 focus:ring-dad-dark focus:border-transparent"
                  onChange={(e) => {
                    // TODO: Implement search functionality
                  }}
                />
                <Search className="w-4 h-4 text-[#f67865] absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              </div>

              {/* Status Filter */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-dad-dark mb-2">Status</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      statusFilter === 'all'
                        ? 'bg-dad-dark text-white'
                        : 'bg-white text-[#f67865] hover:bg-[#f67865] hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('unlocked')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      statusFilter === 'unlocked'
                        ? 'bg-dad-dark text-white'
                        : 'bg-white text-[#f67865] hover:bg-[#f67865] hover:text-white'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setStatusFilter('locked')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      statusFilter === 'locked'
                        ? 'bg-dad-dark text-white'
                        : 'bg-white text-[#f67865] hover:bg-[#f67865] hover:text-white'
                    }`}
                  >
                    Locked
                  </button>
                </div>
              </div>

              {/* Child Filter */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-dad-dark mb-2">Child</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setChildFilter('all')
                      setShowMobileSearch(false)
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${
                      childFilter === 'all'
                        ? 'bg-dad-dark text-white'
                        : 'bg-white text-[#f67865] hover:bg-[#f67865] hover:text-white'
                    }`}
                  >
                    All Children
                  </button>
                  {children && children.length > 0 ? (
                    children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setChildFilter(child.id)
                          setShowMobileSearch(false)
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${
                          childFilter === child.id
                            ? 'bg-dad-dark text-white'
                            : 'bg-white text-[#f67865] hover:bg-[#f67865] hover:text-white'
                        }`}
                      >
                        {child.name}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-[#f67865]">No children found</span>
                  )}
                </div>
              </div>

              {/* Sort Control */}
              <div>
                <h3 className="text-sm font-medium text-dad-dark mb-2">Sort by</h3>
                <button
                  onClick={() => {
                    setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')
                    setShowMobileSearch(false)
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-white text-[#f67865] hover:bg-[#f67865] hover:text-white"
                >
                  {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
                </button>
              </div>

              {/* Create Memory Button */}
              <div className="mt-4">
                <a
                  href="/record"
                  className="flex items-center justify-center w-full px-6 h-10 rounded-lg text-sm font-medium bg-dad-dark text-white hover:bg-[#3A4F6A] transition-all duration-300"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture a Moment
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.map((video) => {
            const unlockStatus = getUnlockStatus(video)
            const processingStatus = getProcessingStatus(video)
            
            return (
              <div 
                key={video.id} 
                className={`bg-white border border-dad-blue-gray rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  !unlockStatus.isUnlocked ? 'opacity-50' : ''
                }`}
              >
                {/* Video Card Content */}
                <div 
                  className="cursor-pointer"
                  onClick={() => unlockStatus.isUnlocked && handlePlayVideo(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-dad-dark rounded-t-lg overflow-hidden pt-2">
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
                    {unlockStatus.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-sm font-medium bg-black bg-opacity-75 text-white flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(video.duration)}
                    </div>
                    {/* Status Badge Overlay */}
                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-md text-sm font-medium ${
                      unlockStatus.isUnlocked 
                        ? 'bg-green-600 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {unlockStatus.isUnlocked ? (
                        <div className="flex items-center">
                          <Unlock className="w-4 h-4 mr-1" />
                          Available
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 mr-1" />
                          {unlockStatus.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-dad-dark">{video.title}</h3>
                    <div className="flex items-center text-sm text-[#f67865] space-x-4 mt-2">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(video.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1.5" />
                        {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Upcoming Unlocks Section */}
        {upcomingUnlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-dad-dark mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-[#f67865]" />
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
                    <div className="flex items-center text-sm text-[#f67865]">
                      <Calendar className="w-3 h-3 mr-1" />
                      {unlockDate.toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {videos.length === 0 ? (
          <div className="bg-dad-blue-gray bg-opacity-20 p-12 rounded-lg text-center">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-dad-dark rounded-full opacity-10"></div>
              <Camera className="w-16 h-16 text-[#f67865] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-xl font-semibold text-dad-dark mb-2">Start Your First Memory</h3>
            <p className="text-[#f67865] mb-6 max-w-md mx-auto">
              Create a special moment for your children to discover later. Record a video message, share your wisdom, or capture a milestone.
            </p>
            <a
              href="/record"
              className="inline-flex items-center px-6 py-3 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Record Your First Memory
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVideos.map((video) => {
              const unlockStatus = getUnlockStatus(video)
              const processingStatus = getProcessingStatus(video)
              
              return (
                <div 
                  key={video.id} 
                  className={`bg-white border border-dad-blue-gray rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    !unlockStatus.isUnlocked ? 'opacity-50' : ''
                  }`}
                >
                  {/* Video Card Content */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => unlockStatus.isUnlocked && handlePlayVideo(video)}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-dad-dark rounded-lg overflow-hidden mb-4">
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
                      {unlockStatus.isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      )}
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-sm font-medium bg-black bg-opacity-75 text-white flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(video.duration)}
                      </div>
                      {/* Status Badge Overlay */}
                      <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-md text-sm font-medium ${
                        unlockStatus.isUnlocked 
                          ? 'bg-green-600 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {unlockStatus.isUnlocked ? (
                          <div className="flex items-center">
                            <Unlock className="w-4 h-4 mr-1" />
                            Available
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Lock className="w-4 h-4 mr-1" />
                            {unlockStatus.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-dad-dark mb-2">{video.title}</h3>
                      <div className="flex items-center text-sm text-[#f67865] space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1.5" />
                          {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                        </span>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-dad-blue-gray p-2">
        <button
          onClick={() => setShowAIDadModal(true)}
          className="w-full flex items-center justify-between px-4 py-2 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-all duration-300"
        >
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            <div>
              <div className="text-xs font-medium">AI Dad Progress</div>
              <div className="text-sm font-bold">{Math.round(calculateAIDadProgress())}%</div>
            </div>
          </div>
          <div className="w-24 bg-white bg-opacity-20 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-dad-olive to-dad-gold h-1.5 rounded-full transition-all duration-300"
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
              <p className="text-[#f67865]">
                AI Dad is an experimental feature that aims to create a digital version of your parenting style and memories. As you record more videos, your personal AI learns from your content to create meaningful interactions for your children in the future regardless of where you are.
              </p>
              <p className="text-[#f67865] mt-2">
                Creepy? Maybe. Cool? Definitely. 100% opt-in once it's built.
              </p>
              <div className="mt-4 p-4 bg-dad-blue-gray bg-opacity-20 rounded-lg">
                <h3 className="text-lg font-semibold text-dad-dark mb-2">Current Progress</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-sm text-[#f67865] mb-1">Total Minutes Recorded</div>
                    <div className="text-2xl font-bold text-dad-dark">
                      {Math.round(videos.length * 2)} / 600 minutes
                    </div>
                  </div>
                  <div className="w-32 bg-white rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-dad-olive to-dad-gold h-2 rounded-full transition-all duration-300"
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
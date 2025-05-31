import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import ImageCropper from '../components/ImageCropper'
import VideoPlayer from '../components/VideoPlayer'
import { Plus, Video, Calendar, Clock, Users, Share, Heart, Trophy, Timer, Camera, Badge, Play, Lock, Unlock, AlertCircle, CheckCircle2 } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [childImageUrls, setChildImageUrls] = useState({})
  const [thumbnailUrls, setThumbnailUrls] = useState({})
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageFile, setTempImageFile] = useState(null)
  const [editingChild, setEditingChild] = useState(null)
  const [currentChildIndex, setCurrentChildIndex] = useState(0)
  const [isChildrenExpanded, setIsChildrenExpanded] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)

  useEffect(() => {
    if (user) {
      fetchChildren()
      fetchVideos()
    }
  }, [user])

  useEffect(() => {
    if (children.length > 1) {
      // Sort children by age (youngest first)
      const sortedChildren = [...children].sort((a, b) => {
        return new Date(b.birthdate) - new Date(a.birthdate)
      })
      setChildren(sortedChildren)
    }
  }, [children.length])

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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)

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

  // Generate mock transcript snippet for videos (until real transcripts are implemented)
  const getTranscriptSnippet = (video) => {
    const snippets = [
      "Hey kiddo, I want you to know that no matter what happens in life, you've got what it takes to handle it...",
      "Son, there's something I learned the hard way that I want to share with you. Real strength isn't about...",
      "Sweetheart, when you're reading this, I hope you remember that day we went fishing and you asked me...",
      "Listen up, champ. Your old man might not be perfect, but I want you to know that every single day...",
      "Hey there, beautiful. By the time you see this, you'll probably think your dad was just some old guy...",
      "Kid, I've been thinking about what I want to tell you when you're older, and here's the truth..."
    ]
    // Use video ID to consistently return the same snippet for each video
    const index = parseInt(video.id.slice(-1), 16) % snippets.length
    return snippets[index]
  }

  // Calculate motivation stats
  const getMotivationStats = () => {
    const totalVideos = videos.length
    const totalChildren = children.length
    
    // Calculate total recording time (assuming average 2 minutes per video for now)
    const estimatedMinutesPerVideo = 2
    const totalMinutesRecorded = totalVideos * estimatedMinutesPerVideo
    
    // Get current month's videos
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentMonthVideos = videos.filter(video => {
      const videoDate = new Date(video.created_at)
      return videoDate.getMonth() === currentMonth && videoDate.getFullYear() === currentYear
    })
    const currentMonthMinutes = currentMonthVideos.length * estimatedMinutesPerVideo
    
    // Get the oldest child's name for personalization
    const oldestChild = children.length > 0 ? children.reduce((oldest, child) => {
      return new Date(child.birthdate) < new Date(oldest.birthdate) ? child : oldest
    }) : null
    
    return {
      totalVideos,
      totalChildren,
      totalMinutesRecorded,
      currentMonthMinutes,
      oldestChild
    }
  }

  const stats = getMotivationStats()

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

  const handleImageUpload = async (childId, file) => {
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        console.error('Image size must be less than 20MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file')
        return
      }

      setTempImageFile(file)
      setEditingChild(childId)
      setShowCropper(true)
    }
  }

  const handleCropComplete = async (croppedBlob) => {
    if (!editingChild) return

    try {
      const croppedFile = new File([croppedBlob], tempImageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      // Upload the cropped image
      const fileName = `${user.id}/${Date.now()}_${croppedFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('child-images')
        .upload(fileName, croppedFile)

      if (uploadError) throw uploadError

      // Update the child's image path
      const { error: updateError } = await supabase
        .from('children')
        .update({ image_path: uploadData.path })
        .eq('id', editingChild)

      if (updateError) throw updateError

      // Refresh the children data
      await fetchChildren()
    } catch (error) {
      console.error('Error updating child image:', error)
    } finally {
      setShowCropper(false)
      setTempImageFile(null)
      setEditingChild(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setTempImageFile(null)
    setEditingChild(null)
  }

  const getCurrentChildImage = () => {
    if (children.length === 0) return null
    if (children.length === 1) return childImageUrls[children[0].id]
    return childImageUrls[children[currentChildIndex].id]
  }

  useEffect(() => {
    if (children.length > 1) {
      const interval = setInterval(() => {
        setCurrentChildIndex((prevIndex) => (prevIndex + 1) % children.length)
      }, 5000) // Rotate every 5 seconds
      return () => clearInterval(interval)
    }
  }, [children.length])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
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
        {/* Personalized Greeting */}
        <div className="max-w-4xl mx-auto mb-6">
          <h1 className="text-3xl font-heading font-bold text-dad-dark">
            {getGreeting()}, {user?.user_metadata?.first_name || 'Dad'}
          </h1>
        </div>

        {/* Consolidated Metrics Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-dad-dark rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center space-x-16">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" style={{ color: '#ffba08' }} />
                  <span className="text-lg font-medium">{stats.totalVideos} {stats.totalVideos === 1 ? 'memory' : 'memories'}</span>
                </div>
                <div className="flex items-center">
                  <Timer className="w-5 h-5 mr-2" style={{ color: '#ffba08' }} />
                  <span className="text-lg font-medium">{stats.totalMinutesRecorded} mins recorded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Primary CTA */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-dad-dark to-dad-olive rounded-2xl p-8 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Create a Memory for Your Children
              </h1>
              <p className="text-[#ffba08] text-opacity-90 mb-6 max-w-2xl">
                Record a video message your children will cherish forever. Tap to start recording now.
              </p>
              <div className="flex items-center justify-between">
                <Link
                  to="/record"
                  className="inline-flex items-center bg-white text-dad-dark px-6 py-3 rounded-xl font-bold text-base hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </Link>
                
                {/* Avatar Group */}
                {children.length > 0 && (
                  <div className="flex -space-x-3">
                    {children.map((child, index) => (
                      <div
                        key={child.id}
                        className="w-16 h-16 rounded-full border-2 border-white overflow-hidden"
                        style={{ zIndex: children.length - index }}
                      >
                        {childImageUrls[child.id] ? (
                          <img
                            src={childImageUrls[child.id]}
                            alt={child.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-dad-olive flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Videos - Enhanced */}
        <div>
          <h2 className="text-3xl font-heading font-bold text-legacy mb-6">Your Videos</h2>
          {videos.length === 0 ? (
            <div className="card-legacy p-10 text-center">
              <div className="bg-dad-olive bg-opacity-10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-dad-olive" />
              </div>
              <h3 className="text-xl font-heading font-bold text-legacy mb-3">No videos created yet</h3>
              <p className="text-dad-olive font-medium mb-6">
                Start recording your first legacy video for your children
              </p>
              <Link
                to="/record"
                className="btn-primary inline-flex items-center"
              >
                <Video className="w-5 h-5 mr-2" />
                Record Your First Legacy
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {videos.slice(0, 5).map((video) => (
                <div key={video.id} className="card-legacy overflow-hidden group">
                  {/* Mobile Layout (stacked) - Enhanced */}
                  <div className="block md:hidden">
                    <div className="relative">
                      {/* Content - Enhanced */}
                      <div className="p-6">
                        {/* Transcript Snippet - Enhanced */}
                        <div className="bg-dad-warm border-l-4 border-dad-gold p-4 rounded-r-xl mb-4 shadow-inner-soft">
                          <p className="text-dad-dark italic font-medium text-lg leading-relaxed">
                            "{getTranscriptSnippet(video)}"
                          </p>
                        </div>

                        {/* Video Thumbnail - Enhanced */}
                        <div 
                          className="w-full h-40 relative overflow-hidden rounded-xl mb-4 cursor-pointer"
                          onClick={() => handlePlayVideo(video)}
                        >
                          {thumbnailUrls[video.id] ? (
                            <img
                              src={thumbnailUrls[video.id]}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                              <div className="bg-dad-white bg-opacity-80 p-4 rounded-2xl shadow-soft">
                                <Video className="w-10 h-10 text-dad-olive" />
                              </div>
                            </div>
                          )}
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          
                          {/* Unlock Badge - Enhanced */}
                          <div className="absolute top-2 right-2">
                            <div className="bg-dad-accent text-dad-white px-3 py-1 rounded-lg font-heading font-bold text-xs shadow-medium flex items-center">
                              <Badge className="w-3 h-3 mr-1" />
                              {video.unlock_type === 'age' ? `Age ${video.unlock_age}` : 
                               video.unlock_type === 'date' ? new Date(video.unlock_date).toLocaleDateString() :
                               video.unlock_type === 'milestone' ? 'Milestone' : 'Unlocked'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col text-sm text-dad-olive space-y-2 mb-4">
                          <span className="flex items-center font-medium">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center font-medium">
                            <Users className="w-4 h-4 mr-2" />
                            For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                          </span>
                        </div>

                        {/* Action Buttons - Enhanced */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-colors duration-300"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Again
                          </button>
                          
                          <button
                            disabled
                            className="p-2 text-dad-olive hover:text-dad-dark transition-colors duration-300"
                            title="Coming soon - Share with Mom"
                          >
                            <Share className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout (horizontal) - Enhanced */}
                  <div className="hidden md:flex">
                    {/* Content - Enhanced */}
                    <div className="flex-1 p-8">
                      {/* Transcript Snippet - Enhanced */}
                      <div className="bg-dad-warm border-l-4 border-dad-gold p-6 rounded-r-xl mb-6 shadow-inner-soft">
                        <p className="text-dad-dark italic font-medium text-xl leading-relaxed">
                          "{getTranscriptSnippet(video)}"
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-dad-olive space-x-6">
                          <span className="flex items-center font-medium">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center font-medium">
                            <Users className="w-4 h-4 mr-2" />
                            For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                          </span>
                        </div>

                        {/* Action Buttons - Enhanced */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="flex items-center px-4 py-2 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-colors duration-300"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Again
                          </button>
                          
                          <button
                            disabled
                            className="p-2 text-dad-olive hover:text-dad-dark transition-colors duration-300"
                            title="Coming soon - Share with Mom"
                          >
                            <Share className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Video Thumbnail - Enhanced */}
                    <div 
                      className="flex-shrink-0 relative w-48 h-32 overflow-hidden cursor-pointer"
                      onClick={() => handlePlayVideo(video)}
                    >
                      {thumbnailUrls[video.id] ? (
                        <img
                          src={thumbnailUrls[video.id]}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                          <div className="bg-dad-white bg-opacity-80 p-4 rounded-2xl shadow-soft">
                            <Video className="w-8 h-8 text-dad-olive" />
                          </div>
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                      
                      {/* Unlock Badge - Enhanced */}
                      <div className="absolute top-2 right-2">
                        <div className="bg-dad-accent text-dad-white px-3 py-1 rounded-lg font-heading font-bold text-xs shadow-medium flex items-center">
                          <Badge className="w-3 h-3 mr-1" />
                          {video.unlock_type === 'age' ? `Age ${video.unlock_age}` : 
                           video.unlock_type === 'date' ? new Date(video.unlock_date).toLocaleDateString() :
                           video.unlock_type === 'milestone' ? 'Milestone' : 'Unlocked'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {videos.length > 5 && (
                <div className="text-center">
                  <Link
                    to="/videos"
                    className="text-dad-dark hover:text-dad-olive font-heading font-bold text-lg transition-colors duration-300"
                  >
                    View all {videos.length} videos →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && videoUrl && (
        <VideoPlayer
          videoUrl={videoUrl}
          onClose={handleCloseVideo}
        />
      )}

      {showCropper && tempImageFile && (
        <ImageCropper
          imageFile={tempImageFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </Layout>
  )
}

export default Dashboard 
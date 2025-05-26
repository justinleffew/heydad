import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Plus, Video, Calendar, Clock, Users, Share, Heart, Trophy, Timer, Camera, Badge } from 'lucide-react'

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
    // In a real app, you'd store actual duration in the database
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
        {/* Hero Section - Enhanced */}
        <div className="mb-10">
          <h1 className="text-4xl font-heading font-bold text-legacy mb-3 tracking-tight">
            Welcome back, Dad.
          </h1>
          <p className="text-lg text-dad-olive font-medium">
            Continue building your legacy for the next generation.
          </p>
        </div>

        {/* Motivation/Stats Module - Enhanced */}
        <div className="mb-10">
          <div className="bg-gradient-warm rounded-2xl p-8 text-dad-white shadow-legacy">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Memories Created */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-dad-white bg-opacity-20 p-3 rounded-xl mr-3">
                    <Heart className="w-8 h-8" />
                  </div>
                  <span className="text-4xl font-heading font-bold">{stats.totalVideos}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">
                  {stats.totalVideos === 1 ? 'memory created' : 'memories created'}
                  {stats.oldestChild && ` for ${stats.oldestChild.name}`}
                  {stats.totalChildren > 1 && ' and others'}
                </p>
              </div>

              {/* Recording Time */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-dad-white bg-opacity-20 p-3 rounded-xl mr-3">
                    <Timer className="w-8 h-8" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-heading font-bold">{stats.currentMonthMinutes}</span>
                    <span className="text-lg ml-1 font-medium">mins</span>
                  </div>
                </div>
                <p className="text-sm opacity-90 font-medium">
                  of video recorded this month
                </p>
              </div>
            </div>

            {/* Motivational Message - Enhanced */}
            <div className="mt-8 text-center border-t border-dad-white border-opacity-20 pt-6">
              <div className="bg-dad-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                {stats.totalVideos === 0 ? (
                  <p className="text-lg font-heading font-medium">
                    🔥 Time to get to work. Your kids need to hear from their old man.
                  </p>
                ) : stats.totalVideos < 5 ? (
                  <p className="text-lg font-heading font-medium">
                    💪 Solid start, brother. Keep laying that foundation.
                  </p>
                ) : stats.totalVideos < 10 ? (
                  <p className="text-lg font-heading font-medium">
                    🛠️ You're building something that'll outlast us all. Stay on it.
                  </p>
                ) : (
                  <p className="text-lg font-heading font-medium">
                    🏆 Damn right. You're setting the standard for what a father should be.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="mb-10">
          <div className="grid grid-cols-1 gap-6">
            <Link
              to="/record"
              className="group bg-gradient-warm text-dad-white p-8 rounded-2xl shadow-legacy hover:shadow-strong transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="bg-dad-white bg-opacity-20 p-4 rounded-xl mr-6 group-hover:bg-opacity-30 transition-all duration-300">
                  <Video className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-2">Record Legacy</h3>
                  <p className="text-dad-blue-gray opacity-90 font-medium">Create a new video message for your children</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Children Cards - Enhanced */}
        <div className="mb-10">
          <h2 className="text-3xl font-heading font-bold text-legacy mb-6">Your Children</h2>
          {children.length === 0 ? (
            <div className="card-legacy p-10 text-center">
              <div className="bg-dad-olive bg-opacity-10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-dad-olive" />
              </div>
              <h3 className="text-xl font-heading font-bold text-legacy mb-3">No children added yet</h3>
              <p className="text-dad-olive font-medium">
                Add your first child using the "Add Child" option in the menu to start creating legacy videos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {children.map((child) => (
                <Link 
                  key={child.id} 
                  to="/children"
                  className="card-legacy overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {/* Photo Section - Enhanced */}
                  <div className="relative h-56 bg-gradient-subtle">
                    {child.image_path && childImageUrls[child.id] ? (
                      <img
                        src={childImageUrls[child.id]}
                        alt={child.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-dad-olive">
                          <div className="bg-dad-white bg-opacity-80 p-4 rounded-2xl mb-3 shadow-soft">
                            <Camera className="w-12 h-12 mx-auto" />
                          </div>
                          <p className="font-medium">Add Photo</p>
                        </div>
                      </div>
                    )}
                    {/* Age Badge - Enhanced */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-dad-gold text-dad-white px-4 py-2 rounded-xl font-heading font-bold text-sm shadow-medium">
                        Age {calculateAge(child.birthdate)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Info Section - Enhanced */}
                  <div className="p-6">
                    <h3 className="text-2xl font-heading font-bold text-legacy mb-2">{child.name}</h3>
                    <p className="text-dad-olive font-medium mb-4">
                      Born: {new Date(child.birthdate).toLocaleDateString()}
                    </p>
                    
                    {/* Stats - Enhanced */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="bg-dad-warm px-3 py-2 rounded-lg">
                        <span className="font-semibold text-dad-dark">
                          {videos.filter(v => v.video_children?.some(vc => vc.children.id === child.id)).length} videos
                        </span>
                      </div>
                      <div className="text-dad-olive font-medium">
                        Next unlock: Age 18
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Videos - Enhanced */}
        <div>
          <h2 className="text-3xl font-heading font-bold text-legacy mb-6">Your Legacy Videos</h2>
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
                      {/* Video Thumbnail - Enhanced */}
                      <div className="w-full h-56 relative overflow-hidden">
                        {thumbnailUrls[video.id] ? (
                          <img
                            src={thumbnailUrls[video.id]}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                            <div className="bg-dad-white bg-opacity-80 p-4 rounded-2xl shadow-soft">
                              <Video className="w-12 h-12 text-dad-olive" />
                            </div>
                          </div>
                        )}
                        
                        {/* Unlock Badge - Enhanced */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-dad-accent text-dad-white px-4 py-2 rounded-xl font-heading font-bold text-sm shadow-medium flex items-center">
                            <Badge className="w-4 h-4 mr-2" />
                            {video.unlock_type === 'age' ? `Age ${video.unlock_age}` : 
                             video.unlock_type === 'date' ? new Date(video.unlock_date).toLocaleDateString() :
                             video.unlock_type === 'milestone' ? 'Milestone' : 'Unlocked'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Content - Enhanced */}
                      <div className="p-6">
                        <h3 className="text-xl font-heading font-bold text-legacy mb-3">{video.title}</h3>
                        
                        {/* Transcript Snippet - Enhanced */}
                        <div className="bg-dad-warm border-l-4 border-dad-gold p-4 rounded-r-xl mb-4 shadow-inner-soft">
                          <p className="text-dad-dark italic font-medium leading-relaxed">
                            "{getTranscriptSnippet(video)}"
                          </p>
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
                        <div className="flex gap-3">
                          <Link
                            to="/videos"
                            className="flex-1 btn-primary text-center"
                          >
                            <Video className="w-4 h-4 mr-2 inline" />
                            View Details
                          </Link>
                          
                          <button
                            disabled
                            className="flex-1 btn-secondary opacity-50 cursor-not-allowed text-center"
                            title="Coming soon - Share with Mom"
                          >
                            <Share className="w-4 h-4 mr-2 inline" />
                            Share with Mom
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout (horizontal) - Enhanced */}
                  <div className="hidden md:flex">
                    {/* Video Thumbnail - Enhanced */}
                    <div className="flex-shrink-0 relative w-80 h-48 overflow-hidden">
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
                      
                      {/* Unlock Badge - Enhanced */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-dad-accent text-dad-white px-4 py-2 rounded-xl font-heading font-bold text-sm shadow-medium flex items-center">
                          <Badge className="w-4 h-4 mr-2" />
                          {video.unlock_type === 'age' ? `Age ${video.unlock_age}` : 
                           video.unlock_type === 'date' ? new Date(video.unlock_date).toLocaleDateString() :
                           video.unlock_type === 'milestone' ? 'Milestone' : 'Unlocked'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content - Enhanced */}
                    <div className="flex-1 p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-heading font-bold text-legacy">{video.title}</h3>
                        
                        {/* Action Buttons - Enhanced */}
                        <div className="flex space-x-3">
                          <Link
                            to="/videos"
                            className="btn-primary"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                          
                          <button
                            disabled
                            className="btn-secondary opacity-50 cursor-not-allowed"
                            title="Coming soon - Share with Mom"
                          >
                            <Share className="w-4 h-4 mr-2" />
                            Share with Mom
                          </button>
                        </div>
                      </div>
                      
                      {/* Transcript Snippet - Enhanced */}
                      <div className="bg-dad-warm border-l-4 border-dad-gold p-4 rounded-r-xl mb-6 shadow-inner-soft">
                        <p className="text-dad-dark italic font-medium leading-relaxed">
                          "{getTranscriptSnippet(video)}"
                        </p>
                      </div>
                      
                      <div className="flex items-center text-dad-olive space-x-6">
                        <span className="flex items-center font-medium">
                          <Calendar className="w-5 h-5 mr-2" />
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center font-medium">
                          <Users className="w-5 h-5 mr-2" />
                          For: {video.video_children?.map(vc => vc.children.name).join(', ') || 'No children assigned'}
                        </span>
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
    </Layout>
  )
}

export default Dashboard 
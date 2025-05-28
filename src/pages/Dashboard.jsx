import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import ReferralModal from '../components/ReferralModal'
import { Plus, Video, Calendar, Clock, Users, Share, Heart, Trophy, Timer, Camera, Badge, Play, Lock, Unlock, AlertCircle, CheckCircle2, Gift } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [childImageUrls, setChildImageUrls] = useState({})
  const [thumbnailUrls, setThumbnailUrls] = useState({})
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false)
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, freeMonths: 0 })

  useEffect(() => {
    if (user) {
      fetchChildren()
      fetchVideos()
      fetchReferralStats()
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

  const fetchReferralStats = async () => {
    try {
      // Get user's free months
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('free_months')
        .eq('id', user.id)
        .single()

      // Get total referrals
      const { data: referrals, error: referralError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id)

      if (!profileError && !referralError) {
        setReferralStats({
          totalReferrals: referrals?.length || 0,
          freeMonths: profile?.free_months || 0
        })
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error)
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
    
    // Calculate AI Dad progress (10 hours = 600 minutes)
    const totalMinutesRequired = 600
    const aiDadProgress = Math.min((totalMinutesRecorded / totalMinutesRequired) * 100, 100)
    
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
      oldestChild,
      aiDadProgress,
      totalMinutesRequired
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
        {/* Quick Actions - Enhanced */}
        <div className="mb-10">
          <div className="grid grid-cols-1 gap-6">
            <Link
              to="/record"
              className="group bg-white text-dad-dark p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-dad-olive"
            >
              <div className="flex items-center">
                <div className="bg-dad-olive bg-opacity-10 p-4 rounded-xl mr-6 group-hover:bg-opacity-20 transition-all duration-300">
                  <Video className="w-10 h-10 text-dad-olive" />
                </div>
                <div>
                  <h3 className="text-3xl font-heading font-bold mb-2">Create a new memory</h3>
                  <p className="text-dad-olive font-medium">Record a video message your children will cherish forever</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Motivation/Stats Module - Enhanced */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Memories Card - Featured */}
            <div className="bg-dad-dark rounded-2xl p-4 text-white shadow-lg relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-heading font-bold">{stats.totalVideos}</span>
                    <span className="text-xl ml-3 font-medium text-white text-opacity-90">memories created</span>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="bg-white bg-opacity-20 w-14 h-14 rounded-lg flex items-center justify-center">
                    <Heart className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Minutes Card */}
            <div className="bg-dad-dark rounded-2xl p-4 text-white shadow-lg relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-heading font-bold">{stats.currentMonthMinutes}</span>
                    <span className="text-xl ml-3 font-medium text-white text-opacity-90">mins</span>
                  </div>
                  <p className="text-sm text-white text-opacity-90 font-medium mt-1">
                    of video recorded this month
                  </p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="bg-white bg-opacity-20 w-14 h-14 rounded-lg flex items-center justify-center">
                    <Timer className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals Card */}
            <div className="bg-dad-dark rounded-2xl p-4 text-white shadow-lg relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-heading font-bold">{referralStats.freeMonths}</span>
                    <span className="text-xl ml-3 font-medium text-white text-opacity-90">free months</span>
                  </div>
                  <p className="text-sm text-white text-opacity-90 font-medium mt-1">
                    {referralStats.totalReferrals} referrals
                  </p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="bg-white bg-opacity-20 w-14 h-14 rounded-lg flex items-center justify-center">
                    <Gift className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Dad Progress Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-heading font-bold">AI Dad: {Math.round(stats.aiDadProgress)}% complete</span>
              <span className="text-sm font-medium text-dad-olive">{stats.totalMinutesRecorded}/{stats.totalMinutesRequired} mins</span>
            </div>
            <div className="w-full bg-dad-white bg-opacity-20 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-dad-olive to-dad-gold h-4 rounded-full transition-all duration-300"
                style={{ width: `${stats.aiDadProgress}%` }}
              />
            </div>
            <p className="text-base text-center mt-3 font-medium">
              You're building something only a few ever will. {stats.totalMinutesRequired - stats.totalMinutesRecorded} minutes to go.
            </p>
          </div>
        </div>

        {/* Hero Section - Moved */}
        <div className="relative mb-12">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/images/dadson.png")',
              filter: 'grayscale(100%)',
              opacity: '0.4',
              height: '180px'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          <div className="relative pt-4 pb-2 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1 tracking-tight max-w-3xl">
              They may forget the little things. But they'll have this forever.
            </h1>
            <p className="text-sm sm:text-base text-white text-opacity-90 max-w-2xl">
              {children.length === 0 
                ? "You're about to start building a legacy your kids will cherish. Let's begin."
                : children.length === 1
                ? `You've started building a legacy ${children[0].name} will cherish. Let's keep going.`
                : children.length === 2
                ? `You've started building a legacy ${children[0].name} & ${children[1].name} will cherish. Let's keep going.`
                : `You've started building a legacy ${children.slice(0, -2).map(child => child.name).join(', ')}, ${children[children.length - 2].name} & ${children[children.length - 1].name} will cherish. Let's keep going.`
              }
            </p>
          </div>
        </div>

        {/* Children Cards - Enhanced */}
        <div className="mb-10">
          <h2 className="text-3xl font-heading font-bold text-legacy mb-2">Your Children</h2>
          <p className="text-dad-olive font-medium italic mb-6">
            This is who you're doing it for
          </p>
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
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: '50% 30%' }}
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
                      <div className="flex items-center text-dad-olive font-medium">
                        <Lock className="w-4 h-4 mr-1" />
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
                      {/* Content - Enhanced */}
                      <div className="p-6">
                        {/* Transcript Snippet - Enhanced */}
                        <div className="bg-dad-warm border-l-4 border-dad-gold p-4 rounded-r-xl mb-4 shadow-inner-soft">
                          <p className="text-dad-dark italic font-medium text-lg leading-relaxed">
                            "{getTranscriptSnippet(video)}"
                          </p>
                        </div>

                        {/* Video Thumbnail - Enhanced */}
                        <div className="w-full h-40 relative overflow-hidden rounded-xl mb-4">
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
                          <Link
                            to="/videos"
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-colors duration-300"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Again
                          </Link>
                          
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
                          <Link
                            to="/videos"
                            className="flex items-center px-4 py-2 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-colors duration-300"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Again
                          </Link>
                          
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
                    <div className="flex-shrink-0 relative w-48 h-32 overflow-hidden">
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

      {/* Referral Modal */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
      />
    </Layout>
  )
}

export default Dashboard 
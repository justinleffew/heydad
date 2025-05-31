import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { VIDEO_PROMPTS, PROMPT_CATEGORIES, getRandomPrompts, getRandomPromptsFromCategory, getAllCategories } from '../data/prompts'
import { Video, Upload, Play, Square, ArrowLeft, Clock, Lightbulb, RefreshCw, X, Heart, Briefcase, GraduationCap, Target, Users, Film, Star, BookOpen, Search, ArrowRight } from 'lucide-react'

const Record = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [children, setChildren] = useState([])
  const [selectedChildren, setSelectedChildren] = useState([])
  const [title, setTitle] = useState('')
  const [unlockType, setUnlockType] = useState('now')
  const [unlockAge, setUnlockAge] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [unlockMilestone, setUnlockMilestone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Record/Upload, 2: Assign & Configure
  
  // Ideas/Prompts functionality
  const [showIdeasModal, setShowIdeasModal] = useState(false)
  const [currentPrompts, setCurrentPrompts] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [showPromptOverlay, setShowPromptOverlay] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [processingStatus, setProcessingStatus] = useState('pending')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingError, setProcessingError] = useState('')

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])

  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const icons = {
    Heart,
    Briefcase,
    GraduationCap,
    Target,
    Users,
    Film,
    Star,
    BookOpen,
    Lightbulb
  }

  useEffect(() => {
    console.log('Record component mounted')
    fetchChildren()
    
    // Load categories immediately
    const allCategories = getAllCategories()
    console.log('Loaded categories:', allCategories)
    setCategories(allCategories)
    
    // Check if a prompt was passed from the Prompts page
    if (location.state?.selectedPrompt) {
      setSelectedPrompt(location.state.selectedPrompt)
      setTitle(location.state.selectedPrompt)
      setShowPromptOverlay(true)
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [location.state])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error fetching children:', error)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setCurrentPrompts(selectedCategory ? selectedCategory.prompts : VIDEO_PROMPTS)
    } else {
      const promptsToSearch = selectedCategory ? selectedCategory.prompts : VIDEO_PROMPTS
      const filtered = promptsToSearch.filter(prompt =>
        prompt.toLowerCase().includes(term.toLowerCase())
      )
      setCurrentPrompts(filtered)
    }
  }

  const openIdeasModal = () => {
    try {
      // Reset state
      setSelectedCategory(null)
      setSearchTerm('')
      setCurrentPrompts([])
      setError('')
      
      // Load categories
      const allCategories = getAllCategories()
      setCategories(allCategories)
      
      // Show modal
      setShowIdeasModal(true)
    } catch (error) {
      console.error('Error opening ideas modal:', error)
      setError('Failed to open ideas modal. Please try again.')
    }
  }

  const selectCategory = (category) => {
    try {
      setSelectedCategory(category)
      const categoryPrompts = getPromptsByCategory(category.id)
      setCurrentPrompts(categoryPrompts)
    } catch (error) {
      console.error('Error selecting category:', error)
      setError('Failed to load category prompts. Please try again.')
    }
  }

  const refreshIdeas = () => {
    if (selectedCategory) {
      try {
        const randomPrompts = getRandomPromptsFromCategory(selectedCategory.id)
        if (!randomPrompts || randomPrompts.length === 0) {
          setError('No prompts found for this category. Please try another category.')
          return
        }
        setCurrentPrompts(randomPrompts)
        setError('')
      } catch (error) {
        console.error('Error refreshing prompts:', error)
        setError('Failed to refresh prompts. Please try again.')
      }
    }
  }

  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt)
    setTitle(prompt)
    setShowIdeasModal(false)
    setShowPromptOverlay(true)
  }

  const clearPrompt = () => {
    setSelectedPrompt('')
    setShowPromptOverlay(false)
  }

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setShowPreview(true)
      setError('')
    } catch (error) {
      setError('Failed to access camera and microphone. Please check permissions.')
    }
  }

  const stopCameraPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowPreview(false)
    videoRef.current.srcObject = null
  }

  const startRecording = async () => {
    if (!streamRef.current) {
      setError('Camera not ready. Please try again.')
      return
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        
        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // Create preview URL
        const url = URL.createObjectURL(blob)
        videoRef.current.srcObject = null
        videoRef.current.src = url
        setShowPreview(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // 2 minutes max
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

    } catch (error) {
      setError('Failed to start recording. Please try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        setError('File size must be less than 200MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file')
        return
      }

      setRecordedBlob(file)
      const url = URL.createObjectURL(file)
      videoRef.current.src = url
      setError('')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generateThumbnail = (videoBlob) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.addEventListener('loadedmetadata', () => {
        // Set canvas dimensions to match video aspect ratio
        canvas.width = 320
        canvas.height = (video.videoHeight / video.videoWidth) * 320
        
        // Seek to 1 second into the video for thumbnail
        video.currentTime = 1
      })
      
      video.addEventListener('seeked', () => {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.8)
      })
      
      video.src = URL.createObjectURL(videoBlob)
    })
  }

  const handleNext = () => {
    if (!recordedBlob) {
      setError('Please record or upload a video first')
      return
    }
    setStep(2)
  }

  const handleChildToggle = (childId) => {
    setSelectedChildren(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your video')
      return
    }

    if (selectedChildren.length === 0) {
      setError('Please select at least one child')
      return
    }

    if (unlockType === 'age' && !unlockAge) {
      setError('Please enter an unlock age')
      return
    }

    if (unlockType === 'date' && !unlockDate) {
      setError('Please select an unlock date')
      return
    }

    if (unlockType === 'milestone' && !unlockMilestone.trim()) {
      setError('Please enter a milestone description')
      return
    }

    setLoading(true)
    setError('')
    setProcessingStatus('processing')
    setProcessingProgress(0)
    setProcessingError('')

    try {
      // Generate thumbnail
      const thumbnailBlob = await generateThumbnail(recordedBlob)
      setProcessingProgress(20)
      
      // Upload video to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`
      console.log('Starting video upload:', {
        fileName,
        fileSize: recordedBlob.size,
        fileType: recordedBlob.type
      })

      // For files larger than 50MB, use chunked upload
      if (recordedBlob.size > 50 * 1024 * 1024) {
        const chunkSize = 5 * 1024 * 1024 // 5MB chunks
        const chunks = Math.ceil(recordedBlob.size / chunkSize)
        
        for (let i = 0; i < chunks; i++) {
          const start = i * chunkSize
          const end = Math.min(start + chunkSize, recordedBlob.size)
          const chunk = recordedBlob.slice(start, end)
          
          const { data: chunkData, error: chunkError } = await supabase.storage
            .from('videos')
            .upload(`${fileName}.part${i}`, chunk, {
              cacheControl: '3600',
              upsert: true
            })

          if (chunkError) {
            console.error('Chunk upload error:', chunkError)
            throw new Error(`Chunk upload failed: ${chunkError.message}`)
          }

          // Update progress based on chunks
          const progress = Math.round(((i + 1) / chunks) * 40)
          setProcessingProgress(progress)
        }

        // After all chunks are uploaded, create the final file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, recordedBlob, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Final upload error:', uploadError)
          throw new Error(`Final upload failed: ${uploadError.message}`)
        }

        console.log('Video upload successful:', uploadData)
      } else {
        // For smaller files, use direct upload
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, recordedBlob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        console.log('Video upload successful:', uploadData)
      }
      
      setProcessingProgress(40)

      // Upload thumbnail to Supabase Storage
      const thumbnailFileName = `${user.id}/${Date.now()}_thumb.jpg`
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
        .from('videos')
        .upload(thumbnailFileName, thumbnailBlob)

      if (thumbnailUploadError) throw thumbnailUploadError
      setProcessingProgress(60)

      // Create video record
      const videoData = {
        user_id: user.id,
        title: title.trim(),
        file_path: uploadData.path,
        thumbnail_path: thumbnailUploadData.path,
        unlock_type: unlockType,
        unlock_age: unlockType === 'age' ? parseInt(unlockAge) : null,
        unlock_date: unlockType === 'date' ? unlockDate : null,
        unlock_milestone: unlockType === 'milestone' ? unlockMilestone.trim() : null,
        processing_status: 'processing',
        processing_progress: 80
      }

      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single()

      if (videoError) throw videoError
      setProcessingProgress(80)

      // Create video-children relationships
      const videoChildrenData = selectedChildren.map(childId => ({
        video_id: video.id,
        child_id: childId
      }))

      const { error: relationError } = await supabase
        .from('video_children')
        .insert(videoChildrenData)

      if (relationError) throw relationError
      setProcessingProgress(90)

      // Update video status to completed
      const { error: updateError } = await supabase
        .from('videos')
        .update({ 
          processing_status: 'completed',
          processing_progress: 100
        })
        .eq('id', video.id)

      if (updateError) throw updateError
      setProcessingProgress(100)
      setProcessingStatus('completed')

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
      setProcessingError(error.message)
      setProcessingStatus('failed')
      
      // Update video status to failed if we have a video ID
      if (error.videoId) {
        await supabase
          .from('videos')
          .update({ 
            processing_status: 'failed',
            processing_error: error.message
          })
          .eq('id', error.videoId)
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-dad-olive hover:text-dad-dark mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            
            <h1 className="text-3xl font-bold text-dad-dark">Record Your Legacy</h1>
            <p className="mt-2 text-dad-olive">
              Create a video message for your children to discover later.
            </p>
          </div>

          <div className="max-w-2xl">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="bg-white border border-dad-blue-gray rounded-lg p-6 mb-6">
              {/* Ideas Button */}
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-dad-dark">Recording Options</h3>
                <button
                  onClick={openIdeasModal}
                  className="flex items-center px-4 py-2 bg-dad-accent text-white rounded-lg hover:bg-dad-dark transition-all duration-300"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Ideas
                </button>
              </div>

              {/* Selected Prompt Display */}
              {selectedPrompt && (
                <div className="mb-4 p-4 bg-dad-warm rounded-lg border border-dad-accent">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-dad-dark mb-2">Recording Prompt:</h4>
                      <p className="text-dad-olive">{selectedPrompt}</p>
                    </div>
                    <button
                      onClick={clearPrompt}
                      className="ml-2 text-dad-blue-gray hover:text-dad-dark"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="aspect-video bg-dad-dark rounded-lg mb-4 relative overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={isRecording || showPreview}
                  controls={!isRecording && !showPreview && recordedBlob}
                />
                
                {/* Prompt Overlay during recording */}
                {isRecording && selectedPrompt && showPromptOverlay && (
                  <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Your Prompt:</h4>
                        <p className="text-sm leading-relaxed">{selectedPrompt}</p>
                      </div>
                      <button
                        onClick={() => setShowPromptOverlay(false)}
                        className="ml-2 text-white hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(recordingTime)} / 2:00
                  </div>
                )}

                {/* Stop recording button overlay when recording */}
                {isRecording && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all"
                    >
                      <Square className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>

              {/* Record button and text when in preview mode */}
              {showPreview && !isRecording && (
                <div className="text-center mb-4">
                  <p className="text-dad-dark text-lg font-medium mb-3">Record your video</p>
                  {selectedPrompt && (
                    <button
                      onClick={() => setShowPromptOverlay(true)}
                      className="mb-3 text-dad-accent hover:text-dad-dark text-sm"
                    >
                      Show prompt during recording
                    </button>
                  )}
                  <button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-lg transition-all transform hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {!recordedBlob && !isRecording && (
                  <button
                    onClick={showPreview ? stopCameraPreview : startCameraPreview}
                    className="flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium bg-dad-dark hover:bg-dad-olive text-white"
                  >
                    {showPreview ? (
                      <>
                        <Square className="w-5 h-5 mr-2" />
                        Stop Preview
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5 mr-2" />
                        Start Camera
                      </>
                    )}
                  </button>
                )}

                {/* Show recording status when recording */}
                {isRecording && (
                  <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium bg-red-600 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Recording... {formatTime(recordingTime)} / 2:00
                  </div>
                )}

                <div className="flex-1">
                  <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-dad-blue-gray rounded-md cursor-pointer hover:border-dad-dark">
                    <Upload className="w-5 h-5 mr-2 text-dad-olive" />
                    <span className="text-dad-dark font-medium">
                      {recordedBlob ? 'Change Video' : 'Upload Video'}
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {recordedBlob && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-dad-olive">Video ready!</span>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive"
                  >
                    Next: Assign Video
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ideas Modal */}
        {showIdeasModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setShowIdeasModal(false)}
            ></div>
            
            {/* Modal */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
              <div className="bg-white rounded-2xl shadow-strong border border-dad-blue-gray m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dad-blue-gray">
                  <div className="flex items-center">
                    <Lightbulb className="w-6 h-6 text-dad-accent mr-3" />
                    <h3 className="text-xl font-bold text-dad-dark">
                      {selectedCategory ? selectedCategory.name : 'Choose a Category'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center px-3 py-2 text-dad-olive hover:text-dad-dark"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Categories
                      </button>
                    )}
                    <button
                      onClick={() => setShowIdeasModal(false)}
                      className="text-dad-olive hover:text-dad-dark"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {!selectedCategory ? (
                    // Categories Grid
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => selectCategory(category)}
                          className="flex items-center px-4 py-3 bg-dad-warm hover:bg-dad-blue-gray hover:bg-opacity-20 rounded-lg transition-all duration-300 border border-transparent hover:border-dad-accent"
                        >
                          <div className="flex items-center w-full">
                            <div className="bg-dad-accent bg-opacity-20 p-2 rounded-lg mr-3 flex-shrink-0">
                              {React.createElement(icons[category.icon], { className: "w-4 h-4 text-dad-accent" })}
                            </div>
                            <span className="text-dad-dark font-medium text-sm text-left">{category.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Prompts List
                    <div className="space-y-3">
                      {currentPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            selectPrompt(prompt)
                            setShowIdeasModal(false)
                          }}
                          className="w-full text-left p-4 bg-dad-warm hover:bg-dad-blue-gray hover:bg-opacity-20 rounded-lg transition-all duration-300 border border-transparent hover:border-dad-accent"
                        >
                          <p className="text-dad-dark leading-relaxed">{prompt}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <button
            onClick={() => setStep(1)}
            className="flex items-center text-dad-olive hover:text-dad-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recording
          </button>
          
          <h1 className="text-3xl font-bold text-dad-dark">Assign Your Legacy</h1>
          <p className="mt-2 text-dad-olive">
            Choose who will receive this video and when they'll unlock it.
          </p>
        </div>

        <div className="max-w-2xl">
          {processingStatus === 'processing' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-dad-dark font-medium">Processing your video...</span>
                <span className="text-dad-olive">{processingProgress}%</span>
              </div>
              <div className="w-full bg-dad-blue-gray bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-dad-dark h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {processingStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Processing failed</p>
              <p className="text-sm mt-1">{processingError}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Video Title */}
            <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
              <h3 className="text-lg font-semibold text-dad-dark mb-4">Video Title</h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your legacy video a meaningful title..."
                className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:outline-none focus:ring-dad-dark focus:border-dad-dark"
              />
            </div>

            {/* Select Children */}
            <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
              <h3 className="text-lg font-semibold text-dad-dark mb-4">For Which Children?</h3>
              {children.length === 0 ? (
                <p className="text-dad-olive">
                  No children added yet. 
                  <button
                    onClick={() => navigate('/add-child')}
                    className="text-dad-dark hover:text-dad-olive font-medium ml-1"
                  >
                    Add a child first.
                  </button>
                </p>
              ) : (
                <div className="space-y-2">
                  {children.map((child) => (
                    <label key={child.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedChildren.includes(child.id)}
                        onChange={() => handleChildToggle(child.id)}
                        className="mr-3 h-4 w-4 text-dad-dark focus:ring-dad-dark border-dad-blue-gray rounded"
                      />
                      <span className="text-dad-dark">{child.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Unlock Conditions */}
            <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
              <h3 className="text-lg font-semibold text-dad-dark mb-4">When Should This Unlock?</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="unlockType"
                      value="now"
                      checked={unlockType === 'now'}
                      onChange={(e) => setUnlockType(e.target.value)}
                      className="mr-2 h-4 w-4 text-dad-dark focus:ring-dad-dark border-dad-blue-gray"
                    />
                    <span className="text-dad-dark">Available now</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="unlockType"
                      value="age"
                      checked={unlockType === 'age'}
                      onChange={(e) => setUnlockType(e.target.value)}
                      className="mr-2 h-4 w-4 text-dad-dark focus:ring-dad-dark border-dad-blue-gray"
                    />
                    <span className="text-dad-dark">At a specific age</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="unlockType"
                      value="date"
                      checked={unlockType === 'date'}
                      onChange={(e) => setUnlockType(e.target.value)}
                      className="mr-2 h-4 w-4 text-dad-dark focus:ring-dad-dark border-dad-blue-gray"
                    />
                    <span className="text-dad-dark">On a specific date</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="unlockType"
                      value="milestone"
                      checked={unlockType === 'milestone'}
                      onChange={(e) => setUnlockType(e.target.value)}
                      className="mr-2 h-4 w-4 text-dad-dark focus:ring-dad-dark border-dad-blue-gray"
                    />
                    <span className="text-dad-dark">At a milestone</span>
                  </label>
                </div>

                {unlockType === 'age' && (
                  <input
                    type="number"
                    value={unlockAge}
                    onChange={(e) => setUnlockAge(e.target.value)}
                    placeholder="Age (e.g., 18)"
                    min="1"
                    max="100"
                    className="w-32 px-3 py-2 border border-dad-blue-gray rounded-md focus:outline-none focus:ring-dad-dark focus:border-dad-dark"
                  />
                )}

                {unlockType === 'date' && (
                  <input
                    type="date"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="px-3 py-2 border border-dad-blue-gray rounded-md focus:outline-none focus:ring-dad-dark focus:border-dad-dark"
                  />
                )}

                {unlockType === 'milestone' && (
                  <input
                    type="text"
                    value={unlockMilestone}
                    onChange={(e) => setUnlockMilestone(e.target.value)}
                    placeholder="e.g., First Breakup, Graduation, Wedding Day"
                    className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:outline-none focus:ring-dad-dark focus:border-dad-dark"
                  />
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-dad-blue-gray text-dad-dark rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive disabled:opacity-50"
              >
                {loading ? 'Saving Legacy...' : 'Save Legacy Video'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Record 
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { Video, Upload, Play, Square, ArrowLeft, Clock } from 'lucide-react'

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

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchChildren()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

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
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB')
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

    try {
      // Generate thumbnail
      const thumbnailBlob = await generateThumbnail(recordedBlob)
      
      // Upload video to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, recordedBlob)

      if (uploadError) throw uploadError

      // Upload thumbnail to Supabase Storage
      const thumbnailFileName = `${user.id}/${Date.now()}_thumb.jpg`
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
        .from('videos')
        .upload(thumbnailFileName, thumbnailBlob)

      if (thumbnailUploadError) throw thumbnailUploadError

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
      }

      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single()

      if (videoError) throw videoError

      // Create video-children relationships
      const videoChildrenData = selectedChildren.map(childId => ({
        video_id: video.id,
        child_id: childId
      }))

      const { error: relationError } = await supabase
        .from('video_children')
        .insert(videoChildrenData)

      if (relationError) throw relationError

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
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
              <div className="aspect-video bg-dad-dark rounded-lg mb-4 relative overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={isRecording || showPreview}
                  controls={!isRecording && !showPreview && recordedBlob}
                />
                
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
                <div className="flex space-x-4">
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
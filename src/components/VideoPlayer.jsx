import React, { useState, useEffect } from 'react'
import { Play, Pause, Clock, Plus, X, Save } from 'lucide-react'

const VideoPlayer = ({ videoUrl, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [notes, setNotes] = useState([])
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    // Load Cloudflare player script
    const script = document.createElement('script')
    script.src = 'https://embed.cloudflarestream.com/embed/r4xu.fla9.latest.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (videoUrl) {
      // Initialize Cloudflare player
      const player = new window.Stream(videoUrl, {
        controls: false,
        autoplay: true,
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onTimeUpdate: (time) => setCurrentTime(time),
        onDurationChange: (duration) => setDuration(duration)
      })
    }
  }, [videoUrl])

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (window.Stream) {
      const player = window.Stream.getPlayer()
      if (isPlaying) {
        player.pause()
      } else {
        player.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now(),
        time: currentTime,
        text: newNote.trim()
      }])
      setNewNote('')
    }
  }

  const removeNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId))
  }

  const jumpToTime = (time) => {
    if (window.Stream) {
      const player = window.Stream.getPlayer()
      player.seek(time)
      player.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-6xl w-full mx-4">
        <div className="flex gap-4">
          {/* Video Section */}
          <div className="flex-1">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <div id="player" className="w-full h-full" />
              
              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-dad-olive transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </button>
                  <div className="text-white font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <button
                    onClick={() => setShowNotesPanel(!showNotesPanel)}
                    className="text-white hover:text-dad-olive transition-colors"
                  >
                    <Clock className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Panel */}
          {showNotesPanel && (
            <div className="w-80 bg-dad-warm rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dad-dark">Notes</h3>
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="text-dad-olive hover:text-dad-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Note */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                  />
                  <button
                    onClick={addNote}
                    className="p-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-dad-olive">
                  Current time: {formatTime(currentTime)}
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {notes.sort((a, b) => a.time - b.time).map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-3 rounded-lg border border-dad-blue-gray"
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => jumpToTime(note.time)}
                        className="text-dad-olive hover:text-dad-dark text-sm font-medium"
                      >
                        {formatTime(note.time)}
                      </button>
                      <button
                        onClick={() => removeNote(note.id)}
                        className="text-dad-olive hover:text-dad-dark"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-dad-dark mt-1">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dad-dark text-white rounded-md hover:bg-dad-olive"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer 
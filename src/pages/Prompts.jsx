import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { VIDEO_PROMPTS, getRandomPrompts } from '../data/prompts'
import { Search, RefreshCw, Lightbulb, Video, ArrowRight } from 'lucide-react'

const Prompts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [displayedPrompts, setDisplayedPrompts] = useState(VIDEO_PROMPTS)
  const [showRandomOnly, setShowRandomOnly] = useState(false)
  const [randomPrompts, setRandomPrompts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize with some random prompts
    refreshRandomPrompts()
  }, [])

  const refreshRandomPrompts = () => {
    const newRandomPrompts = getRandomPrompts(10)
    setRandomPrompts(newRandomPrompts)
    if (showRandomOnly) {
      setDisplayedPrompts(newRandomPrompts)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setDisplayedPrompts(showRandomOnly ? randomPrompts : VIDEO_PROMPTS)
    } else {
      const filtered = (showRandomOnly ? randomPrompts : VIDEO_PROMPTS).filter(prompt =>
        prompt.toLowerCase().includes(term.toLowerCase())
      )
      setDisplayedPrompts(filtered)
    }
  }

  const toggleRandomMode = () => {
    const newShowRandomOnly = !showRandomOnly
    setShowRandomOnly(newShowRandomOnly)
    
    if (newShowRandomOnly) {
      setDisplayedPrompts(randomPrompts)
    } else {
      setDisplayedPrompts(searchTerm ? VIDEO_PROMPTS.filter(prompt =>
        prompt.toLowerCase().includes(searchTerm.toLowerCase())
      ) : VIDEO_PROMPTS)
    }
  }

  const handleRecordWithPrompt = (prompt) => {
    // Navigate to record page with the selected prompt
    navigate('/record', { state: { selectedPrompt: prompt } })
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dad-dark flex items-center">
            <Lightbulb className="w-8 h-8 mr-3 text-dad-accent" />
            Video Ideas & Prompts
          </h1>
          <p className="mt-2 text-dad-olive">
            Get inspired with thoughtful prompts for your legacy videos. Click on any prompt to start recording!
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dad-blue-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-dad-blue-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dad-dark focus:border-dad-dark"
            />
          </div>

          {/* Toggle and Refresh Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleRandomMode}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  showRandomOnly
                    ? 'bg-dad-accent text-white shadow-soft'
                    : 'bg-dad-warm text-dad-dark hover:bg-dad-blue-gray hover:bg-opacity-20'
                }`}
              >
                {showRandomOnly ? 'Show All Prompts' : 'Show Random Selection'}
              </button>

              {showRandomOnly && (
                <button
                  onClick={refreshRandomPrompts}
                  className="flex items-center px-4 py-2 bg-dad-dark text-white rounded-lg hover:bg-dad-olive transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Ideas
                </button>
              )}
            </div>

            <div className="text-dad-blue-gray">
              Showing {displayedPrompts.length} of {VIDEO_PROMPTS.length} prompts
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid gap-4 md:gap-6">
          {displayedPrompts.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-dad-blue-gray mx-auto mb-4 opacity-50" />
              <p className="text-dad-olive text-lg">No prompts found matching your search.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  handleSearch('')
                }}
                className="mt-4 text-dad-dark hover:text-dad-olive font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            displayedPrompts.map((prompt, index) => (
              <div
                key={index}
                className="bg-white border border-dad-blue-gray rounded-lg p-6 hover:shadow-soft transition-all duration-300 group cursor-pointer"
                onClick={() => handleRecordWithPrompt(prompt)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-dad-dark text-lg leading-relaxed group-hover:text-dad-olive transition-colors duration-300">
                      {prompt}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      className="flex items-center px-3 py-2 bg-dad-accent text-white rounded-lg hover:bg-dad-dark transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRecordWithPrompt(prompt)
                      }}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Record
                    </button>
                    <ArrowRight className="w-5 h-5 text-dad-blue-gray" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-warm rounded-xl p-8 text-white">
            <h3 className="text-xl font-bold mb-2">Ready to Start Recording?</h3>
            <p className="text-dad-blue-gray mb-4">
              Choose a prompt above or start with a blank recording
            </p>
            <button
              onClick={() => navigate('/record')}
              className="inline-flex items-center px-6 py-3 bg-white text-dad-dark rounded-lg hover:bg-dad-warm hover:text-dad-dark transition-all duration-300 font-medium"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Recording
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Prompts 
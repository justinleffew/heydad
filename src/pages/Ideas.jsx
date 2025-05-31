import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { VIDEO_PROMPTS, getAllCategories, getPromptsByCategory } from '../data/prompts'
import { Search, Lightbulb, Video, ArrowRight, Heart, Briefcase, GraduationCap, Target, Users, Film, Star, BookOpen, Clock } from 'lucide-react'

const Ideas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [displayedPrompts, setDisplayedPrompts] = useState([])
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  const icons = {
    Heart,
    Briefcase,
    GraduationCap,
    Target,
    Users,
    Film,
    Star,
    BookOpen,
    Lightbulb,
    Clock
  }

  useEffect(() => {
    const allCategories = getAllCategories()
    setCategories(allCategories)
    // Don't show any prompts by default
    setDisplayedPrompts([])
  }, [])

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      // If no search term and no category selected, show no prompts
      if (!selectedCategory) {
        setDisplayedPrompts([])
        return
      }
      // If category selected, show its prompts
      setDisplayedPrompts(getPromptsByCategory(selectedCategory.id))
    } else {
      // Search within selected category or all prompts if no category selected
      const promptsToSearch = selectedCategory ? getPromptsByCategory(selectedCategory.id) : VIDEO_PROMPTS
      const filtered = promptsToSearch.filter(prompt =>
        prompt.toLowerCase().includes(term.toLowerCase())
      )
      setDisplayedPrompts(filtered)
    }
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
    const categoryPrompts = getPromptsByCategory(category.id)
    setDisplayedPrompts(categoryPrompts)
    setSearchTerm('')
  }

  const clearCategory = () => {
    setSelectedCategory(null)
    setDisplayedPrompts([])
    setSearchTerm('')
  }

  const handleRecordWithPrompt = (prompt) => {
    navigate('/record', { state: { selectedPrompt: prompt } })
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dad-dark flex items-center">
            <Lightbulb className="w-8 h-8 mr-3 text-dad-accent" />
            Video Ideas
          </h1>
          <p className="mt-2 text-dad-olive">
            Select a category to see ideas, or search for specific ones. Click on any idea to start recording!
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dad-blue-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-dad-blue-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dad-dark focus:border-dad-dark"
            />
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedCategory ? (
              <button
                onClick={clearCategory}
                className="col-span-full flex items-center justify-center px-4 py-3 bg-dad-accent text-white rounded-lg hover:bg-dad-dark transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Categories
              </button>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category)}
                  className="flex items-center justify-center px-6 py-5 bg-dad-warm hover:bg-dad-blue-gray hover:bg-opacity-20 rounded-lg transition-all duration-300 border-2 border-dad-dark h-[96px]"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-dad-accent bg-opacity-20 p-3 rounded-lg mb-2">
                      {React.createElement(icons[category.icon], { className: "w-6 h-6 text-dad-accent" })}
                    </div>
                    <span className="text-dad-dark font-medium text-sm">{category.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ideas Grid */}
        {displayedPrompts.length === 0 ? (
          <div className="text-center py-12">
            {selectedCategory ? (
              <>
                <Lightbulb className="w-16 h-16 text-dad-blue-gray mx-auto mb-4 opacity-50" />
                <p className="text-dad-olive text-lg">No ideas found in this category.</p>
              </>
            ) : searchTerm ? (
              <>
                <Lightbulb className="w-16 h-16 text-dad-blue-gray mx-auto mb-4 opacity-50" />
                <p className="text-dad-olive text-lg">No ideas found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    handleSearch('')
                  }}
                  className="mt-4 text-dad-dark hover:text-dad-olive font-medium"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Lightbulb className="w-16 h-16 text-dad-blue-gray mx-auto mb-4 opacity-50" />
                <p className="text-dad-olive text-lg">Select a category to see ideas</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {displayedPrompts.map((prompt, index) => (
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
            ))}
          </div>
        )}

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

export default Ideas 
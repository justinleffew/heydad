import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import ImageCropper from '../components/ImageCropper'
import { Users, Plus, Upload, X, Calendar, Edit, Trash2, User, Lock, Heart } from 'lucide-react'

const Children = () => {
  const [children, setChildren] = useState([])
  const [childImageUrls, setChildImageUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    imageFile: null,
    imagePreview: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageFile, setTempImageFile] = useState(null)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChildren(data || [])
      
      // Load image URLs for children with images
      if (data && data.length > 0) {
        await loadChildImageUrls(data)
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      setError('Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  const loadChildImageUrls = async (childrenData) => {
    const imageUrls = {}
    
    for (const child of childrenData) {
      if (child.image_path) {
        const url = await getChildImageUrl(child.image_path)
        if (url) {
          imageUrls[child.id] = url
        }
      }
    }
    
    setChildImageUrls(imageUrls)
  }

  const getChildImageUrl = async (imagePath) => {
    if (!imagePath) return null
    
    try {
      const { data, error } = await supabase.storage
        .from('child-images')
        .createSignedUrl(imagePath, 3600) // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error)
        return null
      }
      
      return data.signedUrl
    } catch (error) {
      console.error('Error getting image URL:', error)
      return null
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

  const getNextUnlockDate = (birthdate) => {
    const today = new Date()
    const birth = new Date(birthdate)
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1)
    }
    
    return nextBirthday
  }

  const getAgeDescription = (age) => {
    if (age < 1) return 'Less than a year old'
    if (age === 1) return '1 year old'
    return `${age} years old`
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('Image size must be less than 20MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      setTempImageFile(file)
      setShowCropper(true)
      setError('')
    }
  }

  const handleCropComplete = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], tempImageFile.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    setFormData(prev => ({
      ...prev,
      imageFile: croppedFile,
      imagePreview: URL.createObjectURL(croppedBlob)
    }))
    setShowCropper(false)
    setTempImageFile(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setTempImageFile(null)
  }

  const removeImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview)
    }
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: ''
    }))
  }

  const resetForm = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview)
    }
    setFormData({
      name: '',
      birthdate: '',
      imageFile: null,
      imagePreview: ''
    })
    setShowAddForm(false)
    setEditingChild(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setMessage('')

    try {
      let imagePath = editingChild?.image_path || null

      // Upload new image if provided
      if (formData.imageFile) {
        const fileName = `${user.id}/${Date.now()}_${formData.imageFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('child-images')
          .upload(fileName, formData.imageFile)

        if (uploadError) throw uploadError
        imagePath = uploadData.path
      }

      const childData = {
        user_id: user.id,
        name: formData.name.trim(),
        birthdate: formData.birthdate,
        image_path: imagePath
      }

      if (editingChild) {
        // Update existing child
        const { error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', editingChild.id)

        if (error) throw error
        setMessage('Child updated successfully!')
      } else {
        // Create new child
        const { error } = await supabase
          .from('children')
          .insert([childData])

        if (error) throw error
        setMessage('Child added successfully!')
      }

      await fetchChildren()
      resetForm()
    } catch (error) {
      setError(error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      birthdate: child.birthdate,
      imageFile: null,
      imagePreview: ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (childId) => {
    if (!confirm('Are you sure you want to delete this child? This will also delete all associated videos.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error
      
      setMessage('Child deleted successfully')
      await fetchChildren()
    } catch (error) {
      setError('Failed to delete child')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dad-olive"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dad-dark">Your Children</h1>
            <p className="mt-2 text-dad-olive">
              Create lasting memories and legacy videos for the ones you love most.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        {/* Add/Edit Child Form */}
        {showAddForm && (
          <div className="mb-8 bg-white border border-dad-blue-gray rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dad-dark">
                {editingChild ? 'Edit Child' : 'Add New Child'}
              </h2>
              <button
                onClick={resetForm}
                className="text-dad-blue-gray hover:text-dad-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dad-dark mb-2">
                    Child's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                    placeholder="Enter child's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dad-dark mb-2">
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthdate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                    className="w-full px-3 py-2 border border-dad-blue-gray rounded-md focus:ring-2 focus:ring-dad-olive focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dad-dark mb-2">
                  Photo (Optional)
                </label>
                <div className="space-y-4">
                  {formData.imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover object-center rounded-lg border border-dad-blue-gray"
                        style={{ objectPosition: '50% 30%' }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-dad-blue-gray rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-dad-blue-gray mx-auto mb-2" />
                      <p className="text-sm text-dad-blue-gray mb-2">
                        Click to upload a photo
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-dad-olive hover:text-dad-dark text-sm"
                      >
                        Choose file
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#2C3E50' }}
                >
                  {formLoading ? 'Saving...' : (editingChild ? 'Update Child' : 'Add Child')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-dad-blue-gray text-dad-dark rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showCropper && tempImageFile && (
          <ImageCropper
            imageFile={tempImageFile}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}

        {/* Children List */}
        {children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-dad-blue-gray mx-auto mb-4" />
            <h3 className="text-xl font-medium text-dad-dark mb-2">No children added yet</h3>
            <p className="text-dad-olive mb-6">
              Add your first child to start creating legacy videos for them.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center mx-auto px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#2C3E50' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Child
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Children Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <div key={child.id} className="bg-white border border-dad-blue-gray rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {child.image_path && childImageUrls[child.id] ? (
                        <img
                          src={childImageUrls[child.id]}
                          alt={child.name}
                          className="w-16 h-16 object-cover object-center rounded-full border-2 border-dad-olive"
                          style={{ objectPosition: '50% 30%' }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      {(!child.image_path || !childImageUrls[child.id]) && (
                        <div className="w-16 h-16 bg-dad-blue-gray bg-opacity-20 rounded-full flex items-center justify-center border-2 border-dad-olive">
                          <User className="w-8 h-8 text-dad-blue-gray" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-semibold text-dad-dark">{child.name}</h3>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-dad-olive bg-opacity-10 text-dad-olive">
                            {getAgeDescription(calculateAge(child.birthdate))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(child)}
                        className="text-dad-olive hover:text-dad-dark"
                        title="Edit child"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete child"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-dad-olive">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Born: {new Date(child.birthdate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Next unlock: {getNextUnlockDate(child.birthdate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dad-blue-gray">
                    <button
                      onClick={() => window.location.href = `/videos?child=${child.id}`}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#2C3E50' }}
                    >
                      View Videos
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Child Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: '#2C3E50' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Child
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Children 
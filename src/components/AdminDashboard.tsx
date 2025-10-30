'use client'

import { useState, useEffect } from 'react'
import { 
  Trash2, 
  Edit, 
  Plus, 
  BarChart3, 
  Package, 
  Star, 
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageCircle,
  Check,
  X
} from 'lucide-react'
import { protectedAPI, publicAPI } from '@/utils/api'
import toast from 'react-hot-toast'

interface Brand {
  _id: string
  brandName: string
  overview: string
  productCount: number
  hasProducts: boolean
  createdAt: string
  updatedAt: string
}

interface BrandStats {
  summary: {
    totalBrands: number
    brandsWithProducts: number
    brandsWithoutProducts: number
  }
  brands: Brand[]
}

interface User {
  _id: string
  email: string
  fullName?: string
  name?: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

interface Perfume {
  _id: string
  perfumeName: string
  brand: {
    _id: string
    brandName: string
  }
  price: number
  description: string
  uri: string
  concentration: string
  volume: number
  targetAudience: string
}

interface Comment {
  _id: string
  content: string
  rating?: number
  user: {
    _id: string
    name: string
    email: string
  }
  perfume: {
    _id: string
    perfumeName: string
    brand: string
  }
  createdAt: string
  isApproved: boolean
}

interface AdminDashboardProps {
  currentUserId?: string
}

export default function AdminDashboard({ currentUserId }: AdminDashboardProps) {
  const [brandStats, setBrandStats] = useState<BrandStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'brands' | 'users' | 'perfumes' | 'comments'>('brands')
  
  // Brand states
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [newBrand, setNewBrand] = useState({ brandName: '', overview: '' })
  
  
  // Perfume states
  const [showAddPerfume, setShowAddPerfume] = useState(false)
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null)
  const [newPerfume, setNewPerfume] = useState({ 
    perfumeName: '', 
    brand: '', 
    price: 0, 
    description: '', 
    uri: '',
    concentration: 'EDT',
    volume: 100,
    targetAudience: 'unisex',
    ingredients: ''
  })

  useEffect(() => {
    fetchBrandStats()
    fetchUsers()
    fetchPerfumes()
    fetchComments()
  }, [])

  const fetchBrandStats = async () => {
    try {
      setError(null)
      const response = await protectedAPI.getBrandStats()
      setBrandStats(response.data)
    } catch (error: any) {
      setError(error.message || 'Failed to load brand statistics')
      toast.error('Failed to load brand statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await protectedAPI.getUsers()
      setUsers(response.data)
    } catch (err: any) {
      console.error('Failed to load users:', err)
    }
  }

  const fetchPerfumes = async () => {
    try {
      const response = await publicAPI.getPerfumes()
      setPerfumes(response.data)
    } catch (err: any) {
      console.error('Failed to load perfumes:', err)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await protectedAPI.getAllComments()
      setComments(response.data)
    } catch (err: any) {
      console.error('Failed to load comments:', err)
    }
  }


  // Perfume CRUD functions
  const handleAddPerfume = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await protectedAPI.createPerfume(newPerfume)
      toast.success('Perfume created successfully')
      setShowAddPerfume(false)
      setNewPerfume({ perfumeName: '', brand: '', price: 0, description: '', uri: '', concentration: 'EDT', volume: 100, targetAudience: 'unisex', ingredients: '' })
      fetchPerfumes()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create perfume')
    }
  }

  const handleUpdatePerfume = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPerfume) return
    try {
      await protectedAPI.updatePerfume(editingPerfume._id, editingPerfume)
      toast.success('Perfume updated successfully')
      setEditingPerfume(null)
      fetchPerfumes()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update perfume')
    }
  }

  const handleDeletePerfume = async (perfumeId: string) => {
    if (!confirm('Are you sure you want to delete this perfume?')) return
    try {
      await protectedAPI.deletePerfume(perfumeId)
      toast.success('Perfume deleted successfully')
      fetchPerfumes()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete perfume')
    }
  }

  // Comment management functions
  const handleUpdateComment = async (commentId: string, data: any) => {
    try {
      await protectedAPI.updateComment(commentId, data)
      toast.success('Comment updated successfully')
      fetchComments()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      await protectedAPI.deleteComment(commentId)
      toast.success('Comment deleted successfully')
      fetchComments()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete comment')
    }
  }

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await protectedAPI.createBrand(newBrand)
      toast.success('Brand created successfully')
      setNewBrand({ brandName: '', overview: '' })
      setShowAddBrand(false)
      fetchBrandStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create brand')
    }
  }

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBrand) return
    
    try {
      await protectedAPI.updateBrand(editingBrand._id, {
        brandName: editingBrand.brandName,
        overview: editingBrand.overview
      })
      toast.success('Brand updated successfully')
      setEditingBrand(null)
      fetchBrandStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleDeleteBrand = async (brandId: string, hasProducts?: boolean) => {
    if (hasProducts) {
      toast.error('Không thể xóa thương hiệu vì đang có sản phẩm')
      return
    }
    if (!confirm('Are you sure you want to delete this brand?')) {
      return
    }

    try {
      await protectedAPI.deleteBrand(brandId)
      toast.success('Brand deleted successfully')
      fetchBrandStats()
    } catch (error: any) {
      if (error.response?.data?.error === 'BRAND_HAS_PRODUCTS') {
        toast.error('Cannot delete brand - it has products')
      } else {
        toast.error(error.message || 'Failed to delete brand')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchBrandStats} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!brandStats) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            {activeTab === 'brands' && (
              <button
                onClick={() => setShowAddBrand(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Brand
              </button>
            )}
            {activeTab === 'perfumes' && (
              <button
                onClick={() => setShowAddPerfume(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Perfume
              </button>
            )}
            {activeTab === 'comments' && (
              <button
                onClick={() => fetchComments()}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh Comments
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('brands')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'brands'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Brands
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('perfumes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'perfumes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perfumes
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Comments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'brands' && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Brands</p>
                    <p className="text-2xl font-bold text-gray-900">{brandStats.summary.totalBrands}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Brands with Products</p>
                    <p className="text-2xl font-bold text-gray-900">{brandStats.summary.brandsWithProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Brands without Products</p>
                    <p className="text-2xl font-bold text-gray-900">{brandStats.summary.brandsWithoutProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brands Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Brand Management</h2>
                <p className="mt-1 text-sm text-gray-500">Only brands without products can be deleted.</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overview</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brandStats.brands.map((brand) => (
                      <tr key={brand._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {brand.brandName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.overview || 'No overview'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            brand.hasProducts ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {brand.productCount} products
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            brand.hasProducts 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.hasProducts ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                No Products
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setEditingBrand(brand)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {!brand.hasProducts && (
                            <button
                              onClick={() => handleDeleteBrand(brand._id, brand.hasProducts)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users
                    .filter(user => currentUserId ? user._id !== currentUserId : true) // Ẩn user hiện tại nếu có currentUserId
                    .map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullName || user.name || 'No Name'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="text-gray-400 text-sm">View Only</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'perfumes' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Perfumes ({perfumes.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {perfumes.map((perfume) => (
                    <tr key={perfume._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 rounded overflow-hidden border">
                          <img
                            src={perfume.uri || '/api/placeholder/100/100'}
                            alt={perfume.perfumeName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {perfume.perfumeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {perfume.brand.brandName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${perfume.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {perfume.concentration} - {perfume.volume}ml
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingPerfume(perfume)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePerfume(perfume._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({comments.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <tr key={comment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {comment.user.name}
                        <div className="text-xs text-gray-500">{comment.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comment.perfume.perfumeName}
                        <div className="text-xs text-gray-400">{comment.perfume.brand}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={comment.content}>
                          {comment.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comment.rating ? (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < comment.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs">{comment.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No rating</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comment.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {comment.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateComment(comment._id, { isApproved: !comment.isApproved })}
                            className={`p-1 rounded ${
                              comment.isApproved 
                                ? 'text-yellow-600 hover:bg-yellow-100' 
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={comment.isApproved ? 'Unapprove' : 'Approve'}
                          >
                            {comment.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Add Brand Modal */}
        {showAddBrand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Brand</h3>
              <form onSubmit={handleAddBrand}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrand.brandName}
                    onChange={(e) => setNewBrand({ ...newBrand, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overview
                  </label>
                  <textarea
                    value={newBrand.overview}
                    onChange={(e) => setNewBrand({ ...newBrand, overview: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBrand(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Add Brand
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Brand Modal */}
        {editingBrand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Brand</h3>
              <form onSubmit={handleUpdateBrand}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrand.brandName}
                    onChange={(e) => setEditingBrand({ ...editingBrand, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overview
                  </label>
                  <textarea
                    value={editingBrand.overview}
                    onChange={(e) => setEditingBrand({ ...editingBrand, overview: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingBrand(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Brand
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Add Perfume Modal */}
        {showAddPerfume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Perfume</h3>
              <form onSubmit={handleAddPerfume}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Perfume Name</label>
                  <input
                    type="text"
                    required
                    value={newPerfume.perfumeName}
                    onChange={(e) => setNewPerfume({ ...newPerfume, perfumeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    required
                    value={newPerfume.brand}
                    onChange={(e) => setNewPerfume({ ...newPerfume, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a brand</option>
                    {brandStats?.brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.brandName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    required
                    value={newPerfume.price}
                    onChange={(e) => setNewPerfume({ ...newPerfume, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newPerfume.description}
                    onChange={(e) => setNewPerfume({ ...newPerfume, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={newPerfume.ingredients}
                    onChange={(e) => setNewPerfume({ ...newPerfume, ingredients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={newPerfume.uri}
                    onChange={(e) => setNewPerfume({ ...newPerfume, uri: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Concentration</label>
                  <select
                    value={newPerfume.concentration}
                    onChange={(e) => setNewPerfume({ ...newPerfume, concentration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EDT">EDT</option>
                    <option value="EDP">EDP</option>
                    <option value="Extrait">Extrait</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume (ml)</label>
                  <input
                    type="number"
                    value={newPerfume.volume}
                    onChange={(e) => setNewPerfume({ ...newPerfume, volume: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={newPerfume.targetAudience}
                    onChange={(e) => setNewPerfume({ ...newPerfume, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPerfume(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Perfume
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Perfume Modal */}
        {editingPerfume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Perfume</h3>
              <form onSubmit={handleUpdatePerfume}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Perfume Name</label>
                  <input
                    type="text"
                    required
                    value={editingPerfume.perfumeName}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, perfumeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    required
                    value={editingPerfume.brand._id}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, brand: { ...editingPerfume.brand, _id: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a brand</option>
                    {brandStats?.brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.brandName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    required
                    value={editingPerfume.price}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingPerfume.description}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={editingPerfume.uri}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, uri: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Concentration</label>
                  <select
                    value={editingPerfume.concentration}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, concentration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EDT">EDT</option>
                    <option value="EDP">EDP</option>
                    <option value="Extrait">Extrait</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume (ml)</label>
                  <input
                    type="number"
                    value={editingPerfume.volume}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, volume: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={editingPerfume.targetAudience}
                    onChange={(e) => setEditingPerfume({ ...editingPerfume, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingPerfume(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Perfume
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

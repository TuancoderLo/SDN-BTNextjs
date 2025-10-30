'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { protectedAPI, publicAPI, authAPI } from '@/utils/api'
import { BarChart3, Package, Star, Users, TrendingUp, Heart, Bookmark, Tag, Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import AdminDashboard from '@/components/AdminDashboard'

interface OverviewData {
  totalPerfumes: number
  totalBrands: number
  totalUsers: number
  brandsWithProducts: Array<{
    _id: string
    brandName: string
    overview: string
    productCount: number
    hasProducts: boolean
  }>
  recentPerfumes: Array<{
    _id: string
    perfumeName: string
    brand: string
    price: number
    imageUrl: string
  }>
}

interface UserTagStats {
  totalTaggedPerfumes: number
  totalFavorites: number
  totalWishlist: number
  totalCustomTags: number
  recentTags: Array<{
    _id: string
    perfume: {
      _id: string
      perfumeName: string
      brand: string
      imageUrl: string
    }
    tags: Array<{ name: string; color: string }>
    isFavorite: boolean
    isWishlist: boolean
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { isAuthenticated, backendUser, loginWithEmail, logout, loading: authLoading } = useAuth()
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [userTagStats, setUserTagStats] = useState<UserTagStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'wishlist' | 'all-perfumes'>('overview')
  
  // Admin login states
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    email: '',
    password: ''
  })
  const [adminLoading, setAdminLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchStats = async () => {
    try {
      setError(null)
      setLoading(true)

      // Fetch overview data and user tag stats in parallel
      const [overviewResponse, userTagResponse] = await Promise.all([
        publicAPI.getOverview(),
        protectedAPI.getUserTagStats()
      ])

      setOverviewData(overviewResponse.data)
      setUserTagStats(userTagResponse.data)
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      setError(err.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setAdminLoading(true)
      await loginWithEmail(adminFormData.email, adminFormData.password)
      toast.success('Welcome back, Admin!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Admin login failed')
    } finally {
      setAdminLoading(false)
    }
  }

  // Wait for auth to restore session before gating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is admin, show admin dashboard
  if (backendUser?.isAdmin) {
    return <AdminDashboard currentUserId={backendUser._id} />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h1>
          <p className="text-gray-600">
            Please <Link href="/login" className="text-blue-600 underline">login</Link> to continue.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchStats} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {backendUser?.name || 'User'}!</p>
          </div>
          <div className="flex gap-2">
            {!backendUser?.isAdmin && (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Access
              </button>
            )}
            <button
              onClick={logout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'wishlist', label: 'Wishlist', icon: Bookmark },
                { id: 'all-perfumes', label: 'All Perfumes', icon: Package }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && overviewData && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Perfumes</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.totalPerfumes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Brands</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.totalBrands}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Brands</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.brandsWithProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Perfumes */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Perfumes</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overviewData.recentPerfumes.slice(0, 6).map((perfume) => (
                    <Link
                      key={perfume._id}
                      href={`/perfumes/${perfume._id}`}
                      className="group block"
                    >
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                          {perfume.imageUrl ? (
                            <img
                              src={perfume.imageUrl}
                              alt={perfume.perfumeName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {perfume.perfumeName}
                        </h4>
                        <p className="text-sm text-gray-600">{perfume.brand}</p>
                        <p className="text-sm font-medium text-green-600">${perfume.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Login</h3>
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {adminLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
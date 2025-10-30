'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star, Filter, Grid, List } from 'lucide-react'
import { publicAPI } from '@/utils/api'
import toast from 'react-hot-toast'

interface Brand {
  _id: string
  brandName: string
  isDeleted: boolean
  deletedAt?: string
}

interface Perfume {
  _id: string
  name: string
  brand: string | { brandName: string }
  price: number
  uri: string
  description: string
  comments: Array<{
    rating: number
    comment: string
  }>
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load brands
      const brandsResponse = await publicAPI.getBrands()
      const activeBrands = brandsResponse.data.filter((brand: Brand) => !brand.isDeleted)
      setBrands(activeBrands)

      // Load perfumes
      const perfumesResponse = await publicAPI.getPerfumes()
      setPerfumes(perfumesResponse.data)
      
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Failed to load brands and perfumes')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageRating = (comments: any[] | undefined): number => {
    if (!comments || comments.length === 0) {
      return 0
    }
    const validRatings = comments
      .map(comment => typeof comment.rating === 'number' ? comment.rating : 0)
      .filter(rating => rating > 0)
    if (validRatings.length === 0) {
      return 0
    }
    return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
  }

  const filteredPerfumes = perfumes.filter(perfume => {
    const brandName = typeof perfume.brand === 'object' ? perfume.brand?.brandName : perfume.brand
    const safeBrandName = brandName || 'Unknown'
    const safePerfumeName = perfume.name || ''
    const matchesSearch = safePerfumeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeBrandName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = !selectedBrand || safeBrandName === selectedBrand
    return matchesSearch && matchesBrand
  })

  const sortedPerfumes = [...filteredPerfumes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameA.localeCompare(nameB)
      case 'price':
        const priceA = a.price || 0
        const priceB = b.price || 0
        return priceA - priceB
      case 'rating':
        return calculateAverageRating(b.comments) - calculateAverageRating(a.comments)
      default:
        return 0
    }
  })

  const getBrandPerfumeCount = (brandName: string) => {
    return perfumes.filter(perfume => {
      const perfumeBrand = typeof perfume.brand === 'object' ? perfume.brand?.brandName : perfume.brand
      return (perfumeBrand || 'Unknown') === brandName
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Brands</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exquisite fragrances from the world's most prestigious perfume houses
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search perfumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedBrand 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Brands ({perfumes.length})
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand._id}
                      onClick={() => setSelectedBrand(brand.brandName)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBrand === brand.brandName
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {brand.brandName} ({getBrandPerfumeCount(brand.brandName)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedBrand ? `${selectedBrand} Perfumes` : 'All Perfumes'}
                </h2>
                <p className="text-gray-600">
                  {sortedPerfumes.length} perfume{sortedPerfumes.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {/* Perfumes Grid/List */}
            {sortedPerfumes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No perfumes found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {sortedPerfumes.map((perfume) => {
                  const brandName = typeof perfume.brand === 'object' ? perfume.brand?.brandName : perfume.brand
                  const safeBrandName = brandName || 'Unknown'
                  const avgRating = calculateAverageRating(perfume.comments)
                  
                  return (
                    <Link
                      key={perfume._id}
                      href={`/perfumes/${perfume._id}`}
                      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                            <img
                              src={perfume.uri}
                              alt={perfume.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                              {perfume.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{safeBrandName}</p>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{perfume.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-gray-900">
                                  {avgRating.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({perfume.comments?.length || 0})
                                </span>
                              </div>
                              <span className="text-lg font-bold text-gray-900">${perfume.price}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={perfume.uri}
                              alt={perfume.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                              {perfume.name}
                            </h3>
                            <p className="text-sm text-gray-600">{safeBrandName}</p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{perfume.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-900">
                                {avgRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">${perfume.price}</span>
                          </div>
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

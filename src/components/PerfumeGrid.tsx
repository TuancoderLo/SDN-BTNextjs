'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Star, Filter } from 'lucide-react'
import { publicAPI, calculateAverageRating } from '@/utils/api'
import toast from 'react-hot-toast'

interface Perfume {
  _id: string
  name: string
  brand: string
  price: number
  uri: string
  description: string
  targetAudience: string
  volume: string
  concentration: string
  ingredients: string[]
  comments: Array<{
    rating: number
    content: string
    author: { name: string }
  }>
}

interface PerfumeGridProps {
  searchQuery?: string
  filters?: {
    priceRange?: string[]
    brands?: string[]
    rating?: number[]
    gender?: string[]
  }
}

export default function PerfumeGrid({ searchQuery = '', filters }: PerfumeGridProps) {
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [filteredPerfumes, setFilteredPerfumes] = useState<Perfume[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({})

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const response = await publicAPI.getPerfumes()
        // Transform the data to match our interface
        const transformedPerfumes = response.data.map((perfume: any) => ({
          _id: perfume._id,
          name: perfume.perfumeName,
          brand: perfume.brand?.brandName || 'Unknown Brand',
          price: perfume.price,
          uri: perfume.uri,
          description: perfume.description,
          targetAudience: perfume.targetAudience,
          volume: perfume.volume,
          concentration: perfume.concentration,
          ingredients: perfume.ingredients,
          comments: perfume.comments || []
        }))
        
        setPerfumes(transformedPerfumes)
        setFilteredPerfumes(transformedPerfumes)
      } catch (error) {
        console.error('Error fetching perfumes:', error)
        toast.error('Failed to load perfumes')
      } finally {
        setLoading(false)
      }
    }

    fetchPerfumes()
  }, [])

  // Fetch approved comments to compute consistent ratings
  useEffect(() => {
    const fetchRatings = async () => {
      const stats: Record<string, { avg: number; count: number }> = {}
      await Promise.all(
        perfumes.map(async (p) => {
          try {
            const r = await publicAPI.getPerfumeComments(p._id)
            const list = r.data || []
            stats[p._id] = { avg: calculateAverageRating(list), count: list.length }
          } catch {
            stats[p._id] = { avg: 0, count: 0 }
          }
        })
      )
      setRatings(stats)
    }
    if (perfumes.length) fetchRatings()
  }, [perfumes])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...perfumes]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(perfume =>
        perfume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perfume.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perfume.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Brand filter
    if (filters?.brands && filters.brands.length > 0) {
      filtered = filtered.filter(perfume =>
        filters.brands!.includes(perfume.brand)
      )
    }

    // Price range filter
    if (filters?.priceRange && filters.priceRange.length > 0) {
      filtered = filtered.filter(perfume => {
        return filters.priceRange!.some(range => {
          switch (range) {
            case '0-50':
              return perfume.price < 50
            case '50-100':
              return perfume.price >= 50 && perfume.price < 100
            case '100-200':
              return perfume.price >= 100 && perfume.price < 200
            case '200+':
              return perfume.price >= 200
            default:
              return true
          }
        })
      })
    }

    // Gender filter
    if (filters?.gender && filters.gender.length > 0) {
      filtered = filtered.filter(perfume =>
        filters.gender!.includes(perfume.targetAudience)
      )
    }

    // Rating filter
    if (filters?.rating && filters.rating.length > 0) {
      filtered = filtered.filter(perfume => {
        const avgRating = ratings[perfume._id]?.avg ?? 0
        return filters.rating!.some(rating => avgRating >= rating)
      })
    }

    setFilteredPerfumes(filtered)
  }, [perfumes, searchQuery, filters])

  const sortedPerfumes = [...filteredPerfumes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        const aRating = ratings[a._id]?.avg ?? 0
        const bRating = ratings[b._id]?.avg ?? 0
        return bRating - aRating
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="h-10 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="btn-secondary flex items-center w-full justify-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Sort and Results */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {filteredPerfumes.length} perfumes
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-auto"
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Perfume Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPerfumes.map((perfume) => {
          const stat = ratings[perfume._id] || { avg: 0, count: 0 }
          const avgRating = stat.avg

          return (
            <div key={perfume._id} className="card-hover group">
              <Link href={`/perfumes/${perfume._id}`}>
                <div className="relative mb-4">
                  <img
                    src={perfume.uri || '/api/placeholder/300/400'}
                    alt={perfume.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </Link>
              
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900">{perfume.name}</h3>
                <p className="text-sm text-gray-600">{perfume.brand}</p>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(avgRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">({avgRating.toFixed(1)}) {stat.count} reviews</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {perfume.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary-600">
                  ${perfume.price}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-2 bg-primary-600 text-white rounded-lg">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">2</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">3</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

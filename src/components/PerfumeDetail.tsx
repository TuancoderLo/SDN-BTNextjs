'use client'

import { useState, useEffect } from 'react'
import { Star, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { publicAPI, calculateAverageRating } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
// PerfumeTagging removed per request
import CommentSection from './CommentSection'
import toast from 'react-hot-toast'

interface Perfume {
  _id: string
  name: string
  brand: string
  price: number
  description: string
  targetAudience?: string
  volume?: string
  concentration?: string
  ingredients?: string[]
  uri?: string
  imageUrl?: string
  category?: string
  releaseYear?: number
  comments?: Array<{
    _id: string
    rating: number
    content: string
    author: { _id: string; name: string; email: string }
  }>
  createdAt?: string
  updatedAt?: string
}

interface PerfumeDetailProps {
  perfumeId: string
}

export default function PerfumeDetail({ perfumeId }: PerfumeDetailProps) {
  const [perfume, setPerfume] = useState<Perfume | null>(null)
  const [loading, setLoading] = useState(true)
  // quantity removed: Add to Cart removed
  const { backendUser } = useAuth()
  const [publicComments, setPublicComments] = useState<Array<{ rating?: number }>>([])

  const resolveImageUrl = (url?: string) => {
    if (!url) return '/api/placeholder/500/600'
    if (url.startsWith('http')) return url
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`
  }

  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        const response = await publicAPI.getPerfumeById(perfumeId)
        // Transform the data to match our interface
        const transformedPerfume = {
          _id: response.data._id,
          name: response.data.name,
          brand: response.data.brand,
          price: response.data.price,
          description: response.data.description,
          targetAudience: response.data.category || response.data.targetAudience,
          volume: response.data.volume || '100ml',
          concentration: response.data.concentration || 'Eau de Parfum',
          ingredients: response.data.ingredients || [],
          imageUrl: response.data.uri || response.data.imageUrl,
          category: response.data.category,
          releaseYear: response.data.releaseYear,
          comments: response.data.comments || [],
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        }
        setPerfume(transformedPerfume)
        // fetch public comments for accurate rating/count
        try {
          const commentsRes = await publicAPI.getPerfumeComments(perfumeId)
          setPublicComments(commentsRes.data || [])
        } catch (e) {
          setPublicComments([])
        }
      } catch (error) {
        console.error('Error fetching perfume:', error)
        toast.error('Failed to load perfume details')
      } finally {
        setLoading(false)
      }
    }

    fetchPerfume()
  }, [perfumeId])

  // Listen for comment events to refresh comments and ratings without a full page reload
  useEffect(() => {
    const handler = (e: any) => {
      try {
        const detailPerfumeId = e?.detail?.perfumeId
        if (!detailPerfumeId || detailPerfumeId !== perfumeId) return

        // refetch public comments for updated rating/count
        ;(async () => {
          try {
            const commentsRes = await publicAPI.getPerfumeComments(perfumeId)
            setPublicComments(commentsRes.data || [])
          } catch (err) {
            // ignore
          }
        })()
      } catch (err) {
        // ignore
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('commentAdded', handler as EventListener)
      return () => window.removeEventListener('commentAdded', handler as EventListener)
    }
  }, [perfumeId])

  // handleAddToCart removed as Add to Cart feature is disabled

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: perfume?.name,
        text: perfume?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  // Comment editing/removal functions removed

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-300 h-96 rounded-lg mb-4"></div>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-20 w-20 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!perfume) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfume not found</h2>
        <p className="text-gray-600">The perfume you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><a href="/" className="hover:text-primary-600">Home</a></li>
          <li>/</li>
          <li><a href="/perfumes" className="hover:text-primary-600">Perfumes</a></li>
          <li>/</li>
          <li className="text-gray-900">{perfume.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="mb-4">
            <img
              src={resolveImageUrl(perfume.imageUrl || perfume.uri)}
              alt={perfume.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
          {/* Single image for now - can be expanded later */}
          <div className="flex space-x-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary-600">
              <img
                src={resolveImageUrl(perfume.imageUrl || perfume.uri)}
                alt={perfume.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{perfume.name}</h1>
                <p className="text-lg text-gray-600">{perfume.brand}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">${perfume.price}</div>
                {perfume.releaseYear && (
                  <div className="text-sm text-gray-500">Released {perfume.releaseYear}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
              {[...Array(5)].map((_, i) => {
                const avgRating = calculateAverageRating(publicComments as any)
                  return (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(avgRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  )
                })}
              </div>
              <span className="ml-2 text-sm text-gray-600">
              {calculateAverageRating(publicComments as any).toFixed(1)} ({publicComments.length} reviews)
              </span>
            </div>
          </div>

          <div>
            <p className="text-gray-700 mb-4">{perfume.description}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Volume:</span> {perfume.volume || '100ml'}</p>
              <p><span className="font-medium">Concentration:</span> {perfume.concentration || 'Eau de Parfum'}</p>
              <p><span className="font-medium">Category:</span> {perfume.category || perfume.targetAudience || 'Unisex'}</p>
              {perfume.releaseYear && (
                <p><span className="font-medium">Release Year:</span> {perfume.releaseYear}</p>
              )}
            </div>
          </div>

          {/* Fragrance Notes */}
          {perfume.ingredients && perfume.ingredients.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Fragrance Notes</h3>
              <div className="flex flex-wrap gap-2">
                {perfume.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share only (Wishlist removed) */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={handleShare}
                className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

        
          {/* Additional Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Product Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Brand:</span>
                <span className="ml-2 text-gray-900">{perfume.brand}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Category:</span>
                <span className="ml-2 text-gray-900">{perfume.category || 'Unisex'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Volume:</span>
                <span className="ml-2 text-gray-900">{perfume.volume || '100ml'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Concentration:</span>
                <span className="ml-2 text-gray-900">{perfume.concentration || 'Eau de Parfum'}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-600">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-600">Authentic Guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-600">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Tags & Notes removed */}

      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection 
          perfumeId={perfumeId} 
          isAdmin={backendUser?.isAdmin || false} 
        />
      </div>
    </div>
  )
}
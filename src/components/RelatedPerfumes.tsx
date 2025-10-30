"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { publicAPI, calculateAverageRating } from '@/utils/api'
import toast from 'react-hot-toast'
import { useParams } from 'next/navigation'

interface Perfume {
  _id: string
  perfumeName?: string
  name?: string
  brand?: any
  price?: number
  uri?: string
  imageUrl?: string
  description?: string
  comments?: Array<{ rating?: number }>
}

export default function RelatedPerfumes() {
  const params = useParams()
  const rawId = params?.id
  const perfumeId = Array.isArray(rawId) ? rawId[0] : rawId || null
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true)

        if (!perfumeId) {
          const resp = await publicAPI.getPerfumes()
          setPerfumes(resp.data.slice(0, 4))
          return
        }

        // Get current perfume to determine brand name
        const current = await publicAPI.getPerfumeById(perfumeId as string)
        const brandName = current.data.brand

        // Fetch perfumes with same brand (exclude current)
        const resp = await publicAPI.getPerfumes({ brand: brandName })
        const related = resp.data
          .filter((p: any) => p._id !== perfumeId)
          .slice(0, 4)

        setPerfumes(related)
      } catch (error: any) {
        console.error('Error fetching related perfumes:', error)
        toast.error('Failed to load related perfumes')
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [perfumeId])

  if (loading) {
    return (
      <section className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Perfumes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Perfumes</h2>
        <p className="text-gray-600">You might also like these fragrances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {perfumes.map((perfume: any) => {
          const avgRating = calculateAverageRating(perfume.comments)

          return (
            <div key={perfume._id} className="card-hover group">
              <Link href={`/perfumes/${perfume._id}`}>
                <div className="relative mb-4">
                  <img
                    src={perfume.uri || perfume.imageUrl || '/api/placeholder/300/400'}
                    alt={perfume.perfumeName || perfume.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </Link>

              <div className="mb-2">
                <h3 className="font-semibold text-gray-900">{perfume.perfumeName || perfume.name}</h3>
                <p className="text-sm text-gray-600">{perfume.brand?.brandName || perfume.brand || 'Unknown'}</p>
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
                <span className="ml-2 text-sm text-gray-600">({avgRating.toFixed(1)})</span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {perfume.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">
                  {`$${perfume.price}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

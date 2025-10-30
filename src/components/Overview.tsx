'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Package, Star, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { publicAPI } from '@/utils/api'
import toast from 'react-hot-toast'

interface OverviewData {
  statistics: {
    totalBrands: number
    totalPerfumes: number
    totalComments: number
  }
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
    brand: { brandName: string }
    price: number
    createdAt: string
  }>
}

export default function Overview() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setError(null)
        const response = await publicAPI.getOverview()
        setOverviewData(response.data)
      } catch (error: any) {
        setError(error.message || 'Failed to load overview data')
        toast.error('Failed to load overview data')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load overview</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!overviewData) return null

  const { statistics, brandsWithProducts, recentPerfumes } = overviewData

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600">Statistics and insights about our perfume collection</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{statistics.totalPerfumes}</h3>
            <p className="text-gray-600">Total Perfumes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{statistics.totalBrands}</h3>
            <p className="text-gray-600">Total Brands</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{statistics.totalComments}</h3>
            <p className="text-gray-600">Total Reviews</p>
          </div>
        </div>

        {/* Brands with Products */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Brands & Products</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brandsWithProducts.map((brand) => (
                    <tr key={brand._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{brand.brandName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {brand.overview || 'No overview available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {brand.productCount} products
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand.hasProducts 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {brand.hasProducts ? 'Active' : 'No Products'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Perfumes */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Additions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPerfumes.map((perfume) => (
              <div key={perfume._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{perfume.perfumeName}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(perfume.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{perfume.brand.brandName}</p>
                <p className="text-lg font-bold text-primary-600">${perfume.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

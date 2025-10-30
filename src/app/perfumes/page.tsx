'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PerfumeGrid from '@/components/PerfumeGrid'
import FilterSidebar from '@/components/FilterSidebar'

export default function PerfumesPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    priceRange: [] as string[],
    brands: [] as string[],
    rating: [] as number[],
    gender: [] as string[]
  })

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Perfumes</h1>
        <p className="text-gray-600">Discover our complete collection of premium fragrances</p>
        
        {/* Search Bar */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search perfumes, brands, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <FilterSidebar onFiltersChange={handleFiltersChange} />
        </div>
        <div className="lg:w-3/4">
          <PerfumeGrid searchQuery={searchQuery} filters={filters} />
        </div>
      </div>
    </div>
  )
}

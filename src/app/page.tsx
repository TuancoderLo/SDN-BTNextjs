'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Hero from '@/components/Hero'
import FeaturedPerfumes from '@/components/FeaturedPerfumes'
import Brands from '@/components/Brands'
import Testimonials from '@/components/Testimonials'
// Overview removed for non-admin home
import BackendStatusBanner from '@/components/BackendStatusBanner'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/perfumes?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Backend Status Banner */}
      <div className="container mx-auto px-4">
        <BackendStatusBanner />
      </div>
      
    
      <FeaturedPerfumes />
      {/* Overview section hidden for public users */}
      <Brands />
      <Testimonials />
    </div>
  )
}

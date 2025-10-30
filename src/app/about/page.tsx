'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About PerfumeStore</h1>
        <p className="text-gray-600 mb-8">
          PerfumeStore is an online fragrance storefront built on the MERN stack.
          Our goal is to deliver a fast, beautiful, and accurate browsing experience
          with data that stays perfectly in sync with the backend.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Key Features</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Perfume catalog, brands, and product details</li>
              <li>Approved reviews synced consistently across list and detail</li>
              <li>User login with Admin Dashboard</li>
              <li>Quick search right in the navigation bar</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
            <p className="text-gray-700 mb-2">Got feedback or need support?</p>
            <ul className="text-blue-600 space-y-1">
              <li>
                <a href="mailto:support@perfumestore.local" className="hover:underline">support@perfumestore.local</a>
              </li>
              <li>
                <Link href="/" className="hover:underline">Back to Home</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Technology</h2>
          <p className="text-gray-700">
            Frontend uses Next.js 13+, TypeScript, and Tailwind CSS. Backend uses Express.js and MongoDB (Mongoose).
            The API is clearly split between public and protected routes to keep data stable and secure.
          </p>
        </div>
      </div>
    </div>
  )
}



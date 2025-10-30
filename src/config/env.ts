// Environment configuration
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Perfume SDN',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Feature Flags
  features: {
    enableSearch: true,
    enableFilters: true,
    enableWishlist: true,
    enableReviews: true,
  },
  
  // API Timeouts
  timeouts: {
    default: 10000, // 10 seconds
    upload: 30000,  // 30 seconds
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 100,
  },
  
  // Image Configuration
  images: {
    placeholder: '/api/placeholder/300/400',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }
}

export default config

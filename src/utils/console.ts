// Console utility for better error handling
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  error: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.error(message, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(message, ...args)
    }
  },
  
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(message, ...args)
    }
  }
}

// Suppress specific console errors in both development and production
const originalError = console.error
console.error = (...args: any[]) => {
  // Suppress known backend connection errors
  const message = args[0]?.toString() || ''
  if (message.includes('Backend server is not running') || 
      message.includes('ERR_CONNECTION_REFUSED') ||
      message.includes('ERR_NETWORK') ||
      message.includes('API Error: Network Error') ||
      message.includes('API Error: Backend server is not running')) {
    return
  }
  originalError.apply(console, args)
}

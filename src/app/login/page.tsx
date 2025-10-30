'use client'

import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </a>
          </p>
          
          {/* User Type Tags */}
          <div className="mt-4 flex justify-center gap-3">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border-2 border-green-300 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              User Login
            </div>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border-2 border-orange-300 shadow-sm">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Admin Login
            </div>
          </div>
          
          {/* Admin Login Link removed */}
          
          {/* Demo Credentials */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div>
                <strong>Admin:</strong> admin@myteam.com / admin123
                <button
                  onClick={() => {
                    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                    if (emailInput && passwordInput) {
                      emailInput.value = 'admin@myteam.com';
                      passwordInput.value = 'admin123';
                    }
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Fill
                </button>
              </div>
            </div>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

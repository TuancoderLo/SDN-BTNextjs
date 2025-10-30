"use client";

import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-3">
        <div>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </a>
          </p>

          {/* User Type Tags */}
          <div className="mt-2 flex justify-center gap-2">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
              <span className="w-1 h-1 bg-green-500 rounded-full mr-1"></span>
              User Login
            </div>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
              <span className="w-1 h-1 bg-orange-500 rounded-full mr-1"></span>
              Admin Login
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-blue-700">
              <strong>Admin:</strong> admin@myteam.com / admin123
              <button
                onClick={() => {
                  const emailInput = document.querySelector(
                    'input[type="email"]'
                  ) as HTMLInputElement;
                  const passwordInput = document.querySelector(
                    'input[type="password"]'
                  ) as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = "admin@myteam.com";
                    passwordInput.value = "admin123";
                  }
                }}
                className="ml-1 text-blue-600 hover:text-blue-800 underline"
              >
                Fill
              </button>
            </div>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

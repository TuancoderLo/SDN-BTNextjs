import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-3">
        <div>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

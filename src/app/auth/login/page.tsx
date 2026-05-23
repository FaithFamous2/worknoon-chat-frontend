import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to your account to continue
                    </p>
                </div>
                <div className="mt-8 bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}

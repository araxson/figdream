import { LoginForm } from "@/components/features/auth/login-form"
import { LoginInfo } from "@/components/features/auth/login-info"

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex items-center justify-center py-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 w-full max-w-6xl">
        <div className="hidden lg:flex lg:flex-col lg:justify-center">
          <LoginInfo />
        </div>
        <div className="flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
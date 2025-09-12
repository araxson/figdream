import { RegisterForm } from "@/components/features/auth/register/register-form"
import { RegisterInfo } from "@/components/features/auth/register-info"

export default function RegisterPage() {
  return (
    <div className="container relative min-h-screen flex items-center justify-center py-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 w-full max-w-6xl">
        <div className="hidden lg:flex lg:flex-col lg:justify-center">
          <RegisterInfo />
        </div>
        <div className="flex items-center justify-center">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
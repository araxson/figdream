"use client";

export function VerifyOTP() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the verification code sent to your email or phone
          </p>
        </div>
        <div className="space-y-4">
          {/* TODO: Implement OTP verification form */}
          <p className="text-center text-muted-foreground">
            OTP verification coming soon
          </p>
        </div>
      </div>
    </div>
  );
}

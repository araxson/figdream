export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Salon Dashboard</h1>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-6">
                <a href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </a>
                <a href="/dashboard/appointments" className="text-sm font-medium hover:text-primary transition-colors">
                  Appointments
                </a>
                <a href="/dashboard/customers" className="text-sm font-medium hover:text-primary transition-colors">
                  Customers
                </a>
                <a href="/dashboard/staff" className="text-sm font-medium hover:text-primary transition-colors">
                  Staff
                </a>
                <a href="/dashboard/services" className="text-sm font-medium hover:text-primary transition-colors">
                  Services
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  )
}
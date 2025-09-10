import { Footer } from '@/components/shared/layouts/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 mt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}
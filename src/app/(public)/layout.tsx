import { PublicHeader } from "@/components/shared/navigation/public-header"
import { PublicFooter } from "@/components/shared/navigation/public-footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
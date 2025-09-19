import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FigDream</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand for mobile */}
          <div className="flex items-center justify-center space-x-2 sm:hidden">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">FigDream</span>
          </div>

          {/* Auth Form */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <p>© {new Date().getFullYear()} FigDream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export const metadata = {
  title: {
    template: "%s | FigDream",
    default: "Authentication - FigDream",
  },
  description: "Sign in to your FigDream account",
};

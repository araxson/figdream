import { RootProvider } from "@/core/shared/providers/components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Netflix pattern: Layout only provides structure
  // Auth will be handled by each page component
  return <RootProvider>{children}</RootProvider>;
}

// Vercel pattern: Metadata for the route group
export const metadata = {
  title: {
    template: "%s | Admin - FigDream",
    default: "Admin Dashboard - FigDream",
  },
  description: "FigDream platform administration",
};

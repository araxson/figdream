'use client'
import { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  defaultOpen?: boolean
}

export function DashboardLayout({ children, sidebar, defaultOpen = true }: DashboardLayoutProps) {
  const pathname = usePathname()
  
  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/')
      const title = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return { title, href, isLast: index === paths.length - 1 }
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        {sidebar}
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <BreadcrumbItem key={breadcrumb.href}>
                      {breadcrumb.isLast ? (
                        <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink href={breadcrumb.href}>
                            {breadcrumb.title}
                          </BreadcrumbLink>
                          {index < breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator />
                          )}
                        </>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
/**
 * Dynamic import utilities for code splitting and bundle optimization
 */

import React from 'react';

// Cache for loaded modules
const moduleCache = new Map<string, any>();

/**
 * Dynamically import a module with caching
 */
export async function dynamicImport<T>(
  importPath: string,
  importFunc: () => Promise<{ default: T }>
): Promise<T> {
  if (moduleCache.has(importPath)) {
    return moduleCache.get(importPath);
  }

  try {
    const module = await importFunc();
    moduleCache.set(importPath, module.default);
    return module.default;
  } catch (error) {
    console.error(`Failed to import ${importPath}:`, error);
    throw error;
  }
}

/**
 * Preload modules for better performance
 */
export function preloadModules(
  modules: Array<{ path: string; importFunc: () => Promise<any> }>
): void {
  if (typeof window === "undefined") return; // Server-side, skip preloading

  // Use requestIdleCallback for non-blocking preload
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      modules.forEach(({ path, importFunc }) => {
        if (!moduleCache.has(path)) {
          importFunc()
            .then((module) => {
              moduleCache.set(path, module.default || module);
            })
            .catch((error) => {
              console.warn(`Failed to preload ${path}:`, error);
            });
        }
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      modules.forEach(({ path, importFunc }) => {
        if (!moduleCache.has(path)) {
          importFunc().catch(() => {});
        }
      });
    }, 2000);
  }
}

/**
 * Route-based code splitting configurations
 */
export const routeModules = {
  // Admin routes
  "/admin": () => [
    {
      path: "@/core/admin/components",
      importFunc: () => import("@/core/admin/components"),
    },
    {
      path: "@/core/analytics/components",
      importFunc: () => import("@/core/analytics/components"),
    },
  ],

  // Dashboard routes
  "/dashboard": () => [
    {
      path: "@/core/appointments/components",
      importFunc: () => import("@/core/appointments/components"),
    },
    {
      path: "@/core/staff/components",
      importFunc: () => import("@/core/staff/components"),
    },
    {
      path: "@/core/services/components",
      importFunc: () => import("@/core/services/components"),
    },
  ],

  // Customer routes
  "/customer": () => [
    {
      path: "@/core/customer/components",
      importFunc: () => import("@/core/customer/components"),
    },
    {
      path: "@/core/booking/components",
      importFunc: () => import("@/core/booking/components"),
    },
  ],

  // Staff routes
  "/staff": () => [
    {
      path: "@/core/staff/components",
      importFunc: () => import("@/core/staff/components"),
    },
    {
      path: "@/core/schedules/components",
      importFunc: () => import("@/core/schedules/components"),
    },
  ],
};

/**
 * Preload modules based on current route
 */
export function preloadRouteModules(pathname: string): void {
  // Find matching route pattern
  const routeKey = Object.keys(routeModules).find((key) =>
    pathname.startsWith(key)
  );

  if (routeKey && routeModules[routeKey as keyof typeof routeModules]) {
    const modules = routeModules[routeKey as keyof typeof routeModules]();
    preloadModules(modules);
  }
}

/**
 * Component-level code splitting with prefetch on hover
 */
export function withPrefetch<T extends React.ComponentType<any>>(
  Component: T,
  importFunc: () => Promise<{ default: T }>
): T {
  let prefetched = false;

  const prefetch = () => {
    if (!prefetched) {
      prefetched = true;
      importFunc().catch(() => {});
    }
  };

  return ((props: any) => {
    return (
      <div onMouseEnter={prefetch} onTouchStart={prefetch}>
        <Component {...props} />
      </div>
    );
  }) as T;
}

/**
 * Intersection Observer for lazy loading components when visible
 */
export function lazyLoadWhenVisible<T>(
  importFunc: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
): Promise<T> {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        importFunc().then((module) => {
          resolve(module.default);
        });
      }
    }, options);

    // Create a placeholder element to observe
    const placeholder = document.createElement("div");
    document.body.appendChild(placeholder);
    observer.observe(placeholder);

    // Clean up after loading
    setTimeout(() => {
      observer.disconnect();
      placeholder.remove();
    }, 100);
  });
}
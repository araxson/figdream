"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const allItems = showHome ? [{ label: "Home", href: "/" }, ...items] : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-sm text-muted-foreground"
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isHome = showHome && index === 0;

        return (
          <Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <div className="flex items-center">
              {isHome && <Home className="h-4 w-4 mr-1" />}
              {isLast || !item.href ? (
                <span className={isLast ? "font-medium text-foreground" : ""}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </Fragment>
        );
      })}
    </nav>
  );
}

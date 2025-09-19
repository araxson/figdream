"use client";

import { ReactNode } from "react";

interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return <>{children}</>;
}

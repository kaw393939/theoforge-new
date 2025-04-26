import React from 'react'
import { PrivateRoute } from "@/components/Dashboard/AppContext";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  );
}
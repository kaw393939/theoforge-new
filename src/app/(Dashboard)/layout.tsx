import React from 'react'
import "./globals.css";
import { AuthProvider } from '@/components/Dashboard/AppContext';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}